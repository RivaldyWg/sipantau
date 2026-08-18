import type { Peran } from "@/lib/supabase/types";

/**
 * Sumber: docs/10-modul-6.1-auth.md §6.1.5 "Perbedaan antar peran".
 *
 * CATATAN CAKUPAN — dibaca sebelum menambah/menghapus butir:
 *
 * - "Mulai Tugas" (Ya untuk Panit & Anggota pada tabel PRD) SENGAJA
 *   tidak dijadikan tautan sidebar di sini. §6.1.5 sendiri menulis
 *   "Modul 6.1 hanya menetapkan penempatannya di beranda" — ini
 *   elemen pada Beranda (Modul 6.4 yang menentukan kendalinya),
 *   bukan rute navigasi. Lihat app/(app)/beranda/page.tsx.
 *
 * - "Reset Kata Sandi" dan "Rekapitulasi Lintas Unit" SENGAJA belum
 *   dicantumkan. Keduanya bergantung pada hal yang masih ditunda
 *   (Fungsi Tepi reset-kata-sandi + celah BR-15; dan tampilan
 *   rekap_laporan_tim yang baru lahir di Langkah 7-9) — lihat pesan
 *   ke pengguna saat Langkah 3 dimulai. Setiap pasangan peran tetap
 *   punya pembeda tanpa keduanya (Kasubdit lewat Manajemen
 *   User/Daftar Unit, Kanit lewat Terbitkan SPT), jadi kriteria
 *   selesai "Tiap peran melihat menu berbeda" tidak bergantung pada
 *   dua butir yang ditunda ini. Tambahkan begitu fondasinya ada,
 *   jangan menunggu modul lain selesai sepenuhnya (pola yang sama
 *   dipakai supabase/tests/rls.sql).
 */

export interface ButirMenu {
  label: string;
  href: string;
  /** Sub-halaman yang harus ikut dianggap "aktif" secara navigasi. */
  cocokAwalan?: boolean;
}

const MENU_PER_PERAN: Record<Exclude<Peran, "pemeliharaan">, ButirMenu[]> = {
  kasubdit: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan" },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
    { label: "Manajemen User", href: "/akun" },
    { label: "Daftar Unit", href: "/akun/unit" },
  ],
  kanit: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Terbitkan SPT", href: "/penugasan/terbitkan" },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan" },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
  ],
  panit: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan" },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
  ],
  anggota: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan" },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
  ],
};

export function menuUntukPeran(peran: Peran): ButirMenu[] {
  if (peran === "pemeliharaan") return [];
  return MENU_PER_PERAN[peran];
}

/** Beranda peran — KP-6.1-01, tabel "Beranda tiap peran" §6.1.5. */
export function berandaUntukPeran(peran: Peran): string {
  return peran === "pemeliharaan" ? "/pemeliharaan" : "/beranda";
}

/**
 * Rute yang butuh peran tertentu DI LUAR yang sudah tercantum di
 * menuUntukPeran (dipakai penjaga rute KP-6.1-17 untuk tautan
 * langsung, bukan hanya menyembunyikan tautannya di sidebar —
 * KP-6.1-19: penyembunyian tampilan saja tidak dianggap pengamanan,
 * tapi ini lapisan kedua di atas RLS, bukan pengganti RLS).
 */
export function bolehAksesRute(peran: Peran, pathname: string): boolean {
  if (peran === "pemeliharaan") {
    return pathname === "/pemeliharaan";
  }

  const menu = menuUntukPeran(peran);
  return menu.some((m) =>
    m.cocokAwalan ? pathname.startsWith(m.href) : pathname === m.href,
  );
}
