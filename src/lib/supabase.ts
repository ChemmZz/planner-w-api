'use client';

import { useMemo } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

/**
 * Clerk-authenticated Supabase client.
 *
 * Phase 4 (Clerk ↔ Supabase native third-party auth): the `accessToken`
 * callback hands Clerk's session JWT to Supabase on every request. Supabase
 * reads the `sub` claim and exposes it via `auth.jwt() ->> 'sub'` in RLS —
 * which is exactly what our policies in `supabase/schema.sql` check against
 * the `user_id` column.
 *
 * Re-renders receive a memoised client keyed off the Clerk session, so token
 * refreshes are picked up automatically without tearing down the connection.
 *
 * Usage (client components only):
 *   const supabase = useSupabaseClient();
 *   const { data } = await supabase.from('tasks').select('*');
 */
export function useSupabaseClient(): SupabaseClient {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          // Supabase JS v2 calls this before every request.
          accessToken: async () => (await session?.getToken()) ?? null,
        }
      ),
    [session]
  );
}
