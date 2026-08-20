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
    { label: "Laporan", href: "/laporan", cocokAwalan: true },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
    { label: "Manajemen User", href: "/akun" },
    { label: "Daftar Unit", href: "/akun/unit" },
  ],
  kanit: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Terbitkan SPT", href: "/penugasan/terbitkan" },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan", cocokAwalan: true },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
  ],
  panit: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan", cocokAwalan: true },
    { label: "LHP Ringkas", href: "/laporan/lhp-ringkas" },
  ],
  anggota: [
    { label: "Beranda", href: "/beranda" },
    { label: "Daftar SPT", href: "/penugasan", cocokAwalan: true },
    { label: "Peta Tracking", href: "/peta" },
    { label: "Laporan", href: "/laporan", cocokAwalan: true },
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
/**
 * Sub-rute yang dikunci ke peran tertentu, DIPERIKSA LEBIH DULU
 * daripada pencocokan awalan biasa.
 *
 * Kenapa perlu: butir menu "Daftar SPT" memakai cocokAwalan agar
 * /penugasan/<id> ikut dianggap aktif. Tanpa daftar ini, awalan yang
 * sama juga meloloskan /penugasan/terbitkan untuk SEMUA peran —
 * padahal butir "Terbitkan SPT" hanya ada pada menu Kanit. Ditemukan
 * saat Langkah 6 (rute /penugasan/[id] dibuat); RLS memang tetap
 * menolak insert oleh non-Kanit, jadi ini bukan kebocoran data, tetapi
 * KP-6.1-17 mensyaratkan tautan langsung ikut dijaga, bukan hanya
 * tautannya disembunyikan di bilah samping (KP-6.1-19).
 *
 * Cocok bila pathname sama persis ATAU merupakan sub-rute di bawahnya,
 * supaya /penugasan/terbitkan/langkah-2 kelak ikut terjaga.
 */
const RUTE_KHUSUS_PERAN: { pola: RegExp; peran: Peran[] }[] = [
  // /penugasan/terbitkan dan turunannya
  { pola: /^\/penugasan\/terbitkan(\/|$)/, peran: ["kanit"] },
  // /penugasan/<id>/sunting dan /penugasan/<id>/tim — id di TENGAH,
  // sehingga pencocokan awalan biasa tidak dapat dipakai. Halamannya
  // sendiri memeriksa lagi bahwa Kanit itu pemilik unitnya; daftar ini
  // hanya tahu peran, bukan unit.
  { pola: /^\/penugasan\/[^/]+\/(sunting|tim)(\/|$)/, peran: ["kanit"] },
  // /laporan/belum-lapor — KP-6.3-51: hanya Kanit dan Kasubdit yang
  // punya kepentingan melihat siapa belum melapor. Anggota/Panit yang
  // datang lewat tautan langsung dipentalkan; halaman itu sendiri juga
  // redirect sebagai lapis kedua (pola dua-lapis yang sama seperti
  // Modul 6.2).
  { pola: /^\/laporan\/belum-lapor(\/|$)/, peran: ["kanit", "kasubdit"] },
  // /laporan/riwayat — KP-6.3-59: khusus Anggota (laporan miliknya
  // sendiri, termasuk yang ditarik). Peran lain memakai halaman
  // /laporan biasa untuk melihat laporan yang berada dalam lingkupnya.
  { pola: /^\/laporan\/riwayat(\/|$)/, peran: ["anggota"] },
];

export function bolehAksesRute(peran: Peran, pathname: string): boolean {
  if (peran === "pemeliharaan") {
    return pathname === "/pemeliharaan";
  }

  const khusus = RUTE_KHUSUS_PERAN.find((r) => r.pola.test(pathname));
  if (khusus) {
    return khusus.peran.includes(peran);
  }

  const menu = menuUntukPeran(peran);
  return menu.some((m) =>
    m.cocokAwalan ? pathname.startsWith(m.href) : pathname === m.href,
  );
}
