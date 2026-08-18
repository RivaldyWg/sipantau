import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Klien Supabase untuk Server Component dan Server Action. Selalu
 * memakai anon key + sesi dari cookie milik pengguna yang sedang
 * masuk, sehingga RLS tetap berlaku (bukan service_role).
 *
 * Dipanggil ulang tiap request (bukan singleton) sesuai pola resmi
 * @supabase/ssr untuk Next.js App Router.
 */
export async function klienServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component (bukan Server Action/Route
            // Handler) — penulisan cookie akan gagal diam-diam di sini.
            // Tidak masalah selama proxy.ts menyegarkan sesi pada
            // setiap request (lihat berkas itu).
          }
        },
      },
    },
  );
}
