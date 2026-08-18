"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Klien Supabase untuk Client Component (Realtime, dsb — lihat
 * docs/CLAUDE.md §6.1). Untuk pembacaan biasa dan penulisan, pakai
 * Server Component / Server Action lewat lib/supabase/server.ts,
 * BUKAN berkas ini.
 */
export function klienPeramban() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
