'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { LogEntry } from '@/types/planner';
import { useSupabaseClient } from './supabase';

interface DbLogEntry {
  id: string;
  user_id: string;
  time: string;
  activity: string;
  created_at: string;
}

function fromDb(r: DbLogEntry): LogEntry {
  return {
    id: r.id,
    time: r.time,
    activity: r.activity,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export interface UseLogHistoryResult {
  /** All previously saved entries for this user, oldest first. */
  savedHistory: LogEntry[];
  /** True while the initial fetch is in flight. */
  loading: boolean;
  /** Last persistence error surfaced to UI, if any. */
  error: string | null;
  /** True while `saveToday` is running. */
  saving: boolean;
  /**
   * Upsert the given session entries into Supabase.
   * Rows are keyed by `id`, so re-saving is idempotent and additive.
   * Returns `true` on success.
   */
  saveToday: (entries: LogEntry[]) => Promise<boolean>;
}

/**
 * Clerk-authenticated hook for the Activity Log history.
 *
 * The planner keeps its working state in memory (session-only). When the user
 * clicks "Save Today's Log", the current `logEntries` are persisted to
 * Supabase via this hook. History is hydrated on mount so past days can be
 * displayed alongside today.
 */
export function useLogHistory(): UseLogHistoryResult {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const supabase = useSupabaseClient();

  const [savedHistory, setSavedHistory] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate once Clerk is ready.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setSavedHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('log_entries')
        .select('*')
        .order('created_at', { ascending: true });
      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setSavedHistory((data as DbLogEntry[]).map(fromDb));
        setError(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, supabase]);

  const saveToday = useCallback(
    async (entries: LogEntry[]): Promise<boolean> => {
      if (!userId || entries.length === 0) return false;
      setSaving(true);
      const rows = entries.map((e) => ({
        id: e.id,
        user_id: userId,
        time: e.time,
        activity: e.activity,
        // Preserve the in-session timestamp so history ordering is stable.
        created_at: new Date(e.createdAt).toISOString(),
      }));
      const { error: err } = await supabase
        .from('log_entries')
        .upsert(rows, { onConflict: 'id' });
      setSaving(false);
      if (err) {
        setError(err.message);
        return false;
      }
      // Merge into history, deduping by id in case of re-save.
      setSavedHistory((prev) => {
        const byId = new Map(prev.map((e) => [e.id, e]));
        for (const e of entries) byId.set(e.id, e);
        return [...byId.values()].sort((a, b) => a.createdAt - b.createdAt);
      });
      setError(null);
      return true;
    },
    [userId, supabase]
  );

  return { savedHistory, loading, error, saving, saveToday };
}
