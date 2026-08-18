import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { bolehAksesRute, berandaUntukPeran } from "@/lib/auth/menu";
import type { Peran } from "@/lib/supabase/types";

/**
 * Gerbang utama Modul 6.1 — docs/10-modul-6.1-auth.md §6.1.3.
 * Berjalan pada SETIAP request (kecuali aset statis, lihat `config`
 * di bawah), sehingga jadi tempat paling tepat untuk seluruh
 * pemeriksaan yang butuh tahu rute tujuan (pathname) DAN identitas
 * pengguna sekaligus:
 *
 *   - KP-6.1-24: akun nonaktif       -> /masuk?nonaktif=1
 *   - KP-6.1-07/08: wajib_ganti_sandi -> /ganti-sandi-wajib, buntu
 *   - KP-6.1-17: tautan langsung di luar kewenangan peran -> beranda
 *     perannya + pesan sekilas (bukan halaman galat)
 *
 * lib/auth/pengguna.ts (dipanggil dari layout Server Component)
 * MENGULANG sebagian pemeriksaan ini secara sengaja — bukan
 * duplikasi sia-sia, melainkan lapis kedua di atas RLS mengikuti pola
 * "penyembunyian tampilan saja tidak dianggap pengamanan" (KP-6.1-19)
 * yang sudah dipakai berulang di proyek ini.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const bukaBeranda = pathname === "/";
  const bukaHalamanMasuk = pathname === "/masuk";
  const bukaHalamanGantiSandi = pathname === "/ganti-sandi-wajib";

  if (!user) {
    if (!bukaHalamanMasuk) {
      const url = request.nextUrl.clone();
      url.pathname = "/masuk";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Sudah punya sesi auth.users — periksa baris public.users-nya.
  const { data: baris } = await supabase
    .from("users")
    .select("peran, aktif, wajib_ganti_sandi")
    .eq("id", user.id)
    .maybeSingle<{ peran: Peran; aktif: boolean; wajib_ganti_sandi: boolean }>();

  if (!baris || !baris.aktif) {
    // KP-6.1-24, atau baris public.users tidak ada sama sekali.
    await supabase.auth.signOut({ scope: "local" });
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    url.search = "?nonaktif=1";
    return NextResponse.redirect(url);
  }

  const beranda = berandaUntukPeran(baris.peran);

  if (bukaHalamanMasuk || bukaBeranda) {
    const url = request.nextUrl.clone();
    url.pathname = baris.wajib_ganti_sandi ? "/ganti-sandi-wajib" : beranda;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (baris.wajib_ganti_sandi && !bukaHalamanGantiSandi) {
    // KP-6.1-07/08: buntu sampai kata sandi diganti.
    const url = request.nextUrl.clone();
    url.pathname = "/ganti-sandi-wajib";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!baris.wajib_ganti_sandi && bukaHalamanGantiSandi) {
    const url = request.nextUrl.clone();
    url.pathname = beranda;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!bukaHalamanGantiSandi && !bolehAksesRute(baris.peran, pathname)) {
    // KP-6.1-17: tautan langsung di luar kewenangan -> beranda +
    // pesan sekilas (dibaca oleh app/(app)/layout.tsx lewat query).
    const url = request.nextUrl.clone();
    url.pathname = beranda;
    url.search = "?diluar_kewenangan=1";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Jalankan pada seluruh rute KECUALI berkas statis dan gambar,
     * supaya sesi tetap tersegarkan tanpa memproses aset.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
