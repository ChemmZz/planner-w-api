'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabaseClient } from './supabase';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  archived: boolean;
}

export interface HabitCompletion {
  habitId: string;
  completedDate: string; // 'YYYY-MM-DD'
}

export interface UseHabitsResult {
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
  error: string | null;
  addHabit: (name: string, icon: string, color: string) => Promise<boolean>;
  archiveHabit: (id: string) => Promise<boolean>;
  deleteHabit: (id: string) => Promise<boolean>;
  toggleCompletion: (habitId: string, date: string) => Promise<boolean>;
  /** Streak: consecutive days ending today (or yesterday if today not yet done). */
  getStreak: (habitId: string) => number;
  /** Check if a specific habit is completed on a given date. */
  isCompleted: (habitId: string, date: string) => boolean;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useHabits(): UseHabitsResult {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const supabase = useSupabaseClient();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [habitsRes, completionsRes] = await Promise.all([
          supabase
            .from('habits')
            .select('*')
            .eq('archived', false)
            .order('created_at', { ascending: true }),
          supabase
            .from('habit_completions')
            .select('habit_id, completed_date')
            .order('completed_date', { ascending: true }),
        ]);
        if (cancelled) return;
        if (habitsRes.error) throw habitsRes.error;
        if (completionsRes.error) throw completionsRes.error;

        setHabits(
          (habitsRes.data ?? []).map((r: { id: string; name: string; icon: string; color: string; archived: boolean }) => ({
            id: r.id,
            name: r.name,
            icon: r.icon,
            color: r.color,
            archived: r.archived,
          }))
        );
        setCompletions(
          (completionsRes.data ?? []).map((r: { habit_id: string; completed_date: string }) => ({
            habitId: r.habit_id,
            completedDate: r.completed_date,
          }))
        );
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load habits');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, userId, supabase]);

  // Completions as a Set for fast lookup
  const completionSet = useMemo(() => {
    const set = new Set<string>();
    for (const c of completions) set.add(`${c.habitId}:${c.completedDate}`);
    return set;
  }, [completions]);

  const isCompleted = useCallback(
    (habitId: string, date: string) => completionSet.has(`${habitId}:${date}`),
    [completionSet]
  );

  const getStreak = useCallback(
    (habitId: string): number => {
      let day = todayKey();
      // If today isn't done yet, start counting from yesterday
      if (!completionSet.has(`${habitId}:${day}`)) {
        day = prevDay(day);
      }
      let streak = 0;
      while (completionSet.has(`${habitId}:${day}`)) {
        streak++;
        day = prevDay(day);
      }
      return streak;
    },
    [completionSet]
  );

  const addHabit = useCallback(
    async (name: string, icon: string, color: string): Promise<boolean> => {
      if (!userId) return false;
      const id = crypto.randomUUID();
      const habit: Habit = { id, name, icon, color, archived: false };
      setHabits((prev) => [...prev, habit]);
      const { error: err } = await supabase.from('habits').insert({
        id,
        user_id: userId,
        name,
        icon,
        color,
      });
      if (err) {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        setError(err.message);
        return false;
      }
      return true;
    },
    [userId, supabase]
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      const { error: err } = await supabase
        .from('habits')
        .update({ archived: true })
        .eq('id', id);
      if (err) {
        setError(err.message);
        return false;
      }
      return true;
    },
    [supabase]
  );

  const deleteHabit = useCallback(
    async (id: string): Promise<boolean> => {
      const snapshot = habits;
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCompletions((prev) => prev.filter((c) => c.habitId !== id));
      const { error: err } = await supabase.from('habits').delete().eq('id', id);
      if (err) {
        setHabits(snapshot);
        setError(err.message);
        return false;
      }
      return true;
    },
    [habits, supabase]
  );

  const toggleCompletion = useCallback(
    async (habitId: string, date: string): Promise<boolean> => {
      if (!userId) return false;
      const key = `${habitId}:${date}`;
      const exists = completionSet.has(key);

      if (exists) {
        // Remove completion
        setCompletions((prev) =>
          prev.filter((c) => !(c.habitId === habitId && c.completedDate === date))
        );
        const { error: err } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', date);
        if (err) {
          setCompletions((prev) => [...prev, { habitId, completedDate: date }]);
          setError(err.message);
          return false;
        }
      } else {
        // Add completion
        setCompletions((prev) => [...prev, { habitId, completedDate: date }]);
        const { error: err } = await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: userId,
          completed_date: date,
        });
        if (err) {
          setCompletions((prev) =>
            prev.filter((c) => !(c.habitId === habitId && c.completedDate === date))
          );
          setError(err.message);
          return false;
        }
      }
      return true;
    },
    [userId, completionSet, supabase]
  );

  return {
    habits,
    completions,
    loading,
    error,
    addHabit,
    archiveHabit,
    deleteHabit,
    toggleCompletion,
    getStreak,
    isCompleted,
  };
}
