'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabaseClient } from './supabase';

export interface SavedSource {
  id: string;          // uuid (DB row id)
  sourceId: string;    // NewsAPI source id (e.g. "bbc-news")
  name: string;
  description: string | null;
  url: string | null;
  category: string | null;
  savedAt: string;
}

interface DbRow {
  id: string;
  user_id: string;
  source_id: string;
  name: string;
  description: string | null;
  url: string | null;
  category: string | null;
  saved_at: string;
}

function fromDb(r: DbRow): SavedSource {
  return {
    id: r.id,
    sourceId: r.source_id,
    name: r.name,
    description: r.description,
    url: r.url,
    category: r.category,
    savedAt: r.saved_at,
  };
}

export interface UseSavedSourcesResult {
  savedSources: SavedSource[];
  loading: boolean;
  saveSource: (source: { id: string; name: string; description?: string; url?: string; category?: string }) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  isSaved: (sourceId: string) => boolean;
}

export function useSavedSources(): UseSavedSourcesResult {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const supabase = useSupabaseClient();

  const [savedSources, setSavedSources] = useState<SavedSource[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate on mount
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_sources')
        .select('*')
        .order('saved_at', { ascending: false });
      if (cancelled) return;
      if (!error && data) {
        setSavedSources((data as DbRow[]).map(fromDb));
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, userId, supabase]);

  // Fast lookup set
  const savedIds = useMemo(
    () => new Set(savedSources.map((s) => s.sourceId)),
    [savedSources]
  );

  const isSaved = useCallback(
    (sourceId: string) => savedIds.has(sourceId),
    [savedIds]
  );

  const saveSource = useCallback(
    async (source: { id: string; name: string; description?: string; url?: string; category?: string }) => {
      if (!userId) return;
      // Optimistic add
      const optimistic: SavedSource = {
        id: crypto.randomUUID(),
        sourceId: source.id,
        name: source.name,
        description: source.description ?? null,
        url: source.url ?? null,
        category: source.category ?? null,
        savedAt: new Date().toISOString(),
      };
      setSavedSources((prev) => [optimistic, ...prev]);

      const { error } = await supabase.from('saved_sources').insert({
        user_id: userId,
        source_id: source.id,
        name: source.name,
        description: source.description ?? null,
        url: source.url ?? null,
        category: source.category ?? null,
      });
      if (error) {
        // Rollback
        setSavedSources((prev) => prev.filter((s) => s.id !== optimistic.id));
      }
    },
    [userId, supabase]
  );

  const removeSource = useCallback(
    async (sourceId: string) => {
      if (!userId) return;
      const snapshot = savedSources;
      setSavedSources((prev) => prev.filter((s) => s.sourceId !== sourceId));

      const { error } = await supabase
        .from('saved_sources')
        .delete()
        .eq('user_id', userId)
        .eq('source_id', sourceId);
      if (error) {
        setSavedSources(snapshot);
      }
    },
    [userId, savedSources, supabase]
  );

  return { savedSources, loading, saveSource, removeSource, isSaved };
}
