'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { TaskCategory } from '@/types/planner';
import { useSupabaseClient } from './supabase';

interface DbCategory {
  id: string;
  group: string;
  label: string;
  color: string;
  sort_order: number;
  user_id: string | null;
  parent_id: string | null;
}

function fromDb(r: DbCategory): TaskCategory {
  return {
    id: r.id,
    group: r.group,
    label: r.label,
    color: r.color,
    parentId: r.parent_id,
    userId: r.user_id,
  };
}

export interface UseCategoriesResult {
  /** All categories (system + user-created). Used for task display/grouping. */
  categories: TaskCategory[];
  /** Unique group names in display order. */
  groups: string[];
  /** Categories filtered by group. */
  byGroup: (group: string) => TaskCategory[];
  /** Look up a single category by id. */
  find: (id: string) => TaskCategory | undefined;
  loading: boolean;
  error: string | null;
  addCategory: (group: string, label: string, color: string, parentId?: string) => Promise<string | null>;
  updateCategory: (id: string, updates: { label?: string; color?: string; group?: string }) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export function useCategories(): UseCategoriesResult {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const supabase = useSupabaseClient();

  const [categories, setCategories] = useState<TaskCategory[]>([]);
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
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setCategories((data as DbCategory[]).map(fromDb));
        setError(null);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, userId, supabase]);

  const groups = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const cat of categories) {
      if (!seen.has(cat.group)) {
        seen.add(cat.group);
        result.push(cat.group);
      }
    }
    return result;
  }, [categories]);

  const byGroup = useCallback(
    (group: string) => categories.filter((c) => c.group === group),
    [categories]
  );

  const find = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const addCategory = useCallback(
    async (group: string, label: string, color: string, parentId?: string): Promise<string | null> => {
      if (!userId) return null;
      const id = `user-${crypto.randomUUID().slice(0, 8)}`;
      const cat: TaskCategory = { id, group, label, color, parentId: parentId ?? null, userId };
      setCategories((prev) => [...prev, cat]);
      const { error: err } = await supabase.from('categories').insert({
        id,
        user_id: userId,
        group,
        label,
        color,
        sort_order: 100 + categories.length,
        parent_id: parentId ?? null,
      });
      if (err) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setError(err.message);
        return null;
      }
      return id;
    },
    [userId, categories.length, supabase]
  );

  const updateCategory = useCallback(
    async (id: string, updates: { label?: string; color?: string; group?: string }): Promise<boolean> => {
      const cat = categories.find((c) => c.id === id);
      if (!cat || !cat.userId) return false;
      const snapshot = categories;
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      const { error: err } = await supabase.from('categories').update(updates).eq('id', id);
      if (err) {
        setCategories(snapshot);
        setError(err.message);
        return false;
      }
      return true;
    },
    [categories, supabase]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      const cat = categories.find((c) => c.id === id);
      if (!cat || !cat.userId) return false;
      const snapshot = categories;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const { error: err } = await supabase.from('categories').delete().eq('id', id);
      if (err) {
        setCategories(snapshot);
        setError(err.message);
        return false;
      }
      return true;
    },
    [categories, supabase]
  );

  return {
    categories,
    groups,
    byGroup,
    find,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
