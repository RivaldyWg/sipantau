import type {
  JenisDasarPenugasan,
  JenisKegiatan,
  JenisMasalah,
  PrioritasPenugasan,
  StatusPenugasan,
} from "@/lib/supabase/types";

/**
 * Peristilahan tampilan Modul 6.2 — satu tempat, dipakai halaman
 * daftar, rincian, dan formulir penerbitan.
 *
 * Nilai kuncinya mengikuti check constraint pada migrasi 0008/0009
 * PERSIS. Menambah kunci di sini TIDAK menambah pilihan di database;
 * kalau daftar nilainya berubah, ubah migrasinya lebih dulu.
 */

export const LABEL_STATUS: Record<StatusPenugasan, string> = {
  draf: "Draf",
  baru: "Baru",
  berjalan: "Berjalan",
  bermasalah: "Bermasalah",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const LABEL_PRIORITAS: Record<PrioritasPenugasan, string> = {
  normal: "Normal",
  penting: "Penting",
  urgent: "Urgent",
};

export const LABEL_JENIS_KEGIATAN: Record<JenisKegiatan, string> = {
  penyelidikan: "Penyelidikan",
  pulbaket: "Pulbaket",
  pengamanan: "Pengamanan",
};

export const LABEL_JENIS_DASAR: Record<JenisDasarPenugasan, string> = {
  laporan_informasi: "Laporan Informasi",
  laporan_polisi: "Laporan Polisi",
  laporan_pengaduan: "Laporan Pengaduan",
  surat_perintah_terdahulu: "Surat Perintah Terdahulu",
  disposisi_pimpinan: "Disposisi Pimpinan",
  lainnya: "Lainnya",
};

/**
 * Daftar jenis masalah — Lampiran A butir A-11.
 *
 * Statusnya masih SEMENTARA: butir A-11 tercatat "Belum terjawab",
 * dan kalimat aslinya menyebut "Daftar sementara yang dipakai".
 * Jangan menambah nilai di sini tanpa menambahnya lebih dulu pada
 * CHECK di migrasi 0015 — kalau tidak, pilihannya tampil di layar
 * lalu ditolak database saat disimpan.
 */
export const LABEL_JENIS_MASALAH: Record<JenisMasalah, string> = {
  alamat_atau_sasaran_fiktif: "Alamat atau sasaran fiktif",
  objek_tidak_ditemukan: "Objek tidak ditemukan di lokasi",
  informasi_awal_tidak_sesuai: "Informasi awal tidak sesuai kenyataan",
  situasi_tidak_memungkinkan: "Situasi tidak memungkinkan karena alasan keamanan",
  sasaran_berpindah: "Sasaran berpindah tempat",
  kendala_perangkat_atau_jaringan: "Kendala perangkat atau jaringan",
  lainnya: "Lainnya",
};

/**
 * Judul dan subjudul halaman daftar per peran.
 *
 * MENGIKUTI PRD §6.2.5, BUKAN MOCKUP. Keduanya berbeda kata, dan
 * Lampiran B.9 menutup perkaranya: "Prototype menyesuaikan PRD bila
 * keduanya bertentangan." Mockup tetap acuan BENTUK, bukan acuan kata.
 */
export const JUDUL_DAFTAR: Record<
  string,
  { judul: string; sub: string }
> = {
  kanit: {
    judul: "Penugasan Unit",
    sub: "Penugasan pada unit Anda. Terbitkan surat perintah dan tunjuk pelaksana.",
  },
  kasubdit: {
    judul: "Seluruh Penugasan",
    sub: "Seluruh penugasan penyelidikan lapangan pada Subdit IV.",
  },
  panit: {
    judul: "Penugasan yang Saya Awasi",
    sub: "Penugasan tempat Anda ditunjuk sebagai Panit Penanggung Jawab.",
  },
  anggota: {
    judul: "Tugas Saya",
    sub: "Penugasan yang ditujukan kepada Anda beserta status laporannya.",
  },
};

/**
 * Kerangka nomor SPT yang disodorkan sistem — B.9: "Nomor SPT diketik
 * manusia mengikuti surat fisik, unik se-sistem, dengan kerangka yang
 * disodorkan sistem" dan aturan modul butir 1: "Sistem tidak
 * menerbitkan nomor surat."
 *
 * Yang dikembalikan karena itu adalah KERANGKA BERLUBANG, bukan nomor
 * jadi. Bagian nomor agenda sengaja dibiarkan sebagai garis bawah
 * supaya jelas manusia yang mengisinya dari buku agenda.
 *
 * kode_klasifikasi berasal dari tabel unit dan masih menunggu butir
 * A-12; bila kosong, bagian itu ikut dibiarkan berlubang.
 */
const ANGKA_ROMAWI = [
  "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII",
];

export function kerangkaNomorSpt(
  kodeKlasifikasi: string | null,
  tanggal: Date = new Date(),
): string {
  const bulan = ANGKA_ROMAWI[tanggal.getMonth()];
  const tahun = tanggal.getFullYear();
  const kode = kodeKlasifikasi?.trim() || "___._._";
  return `SPT/____/${kode}/${bulan}/${tahun}/Ditreskrimsus`;
}

/**
 * Kelas Tailwind untuk lencana status. Memakai token --status-* yang
 * sudah ada di app/globals.css (baris 98-104), bukan warna baru.
 *
 * 'draf' dan 'dibatalkan' tidak punya token --status-* sendiri karena
 * daftar token itu lahir untuk empat status yang tampil di mockup;
 * keduanya memakai warna netral supaya tidak menyaru sebagai status
 * aktif.
 */
export const KELAS_LENCANA_STATUS: Record<StatusPenugasan, string> = {
  draf: "bg-secondary text-secondary-foreground",
  baru: "bg-[var(--blue-bg)] text-[var(--blue)]",
  berjalan: "bg-[var(--amber-bg)] text-[var(--amber)]",
  bermasalah: "bg-[var(--red-bg)] text-[var(--red)]",
  selesai: "bg-[var(--green-bg)] text-[var(--green)]",
  dibatalkan: "bg-secondary text-muted-foreground line-through",
};

export const KELAS_LENCANA_PRIORITAS: Record<PrioritasPenugasan, string> = {
  normal: "bg-secondary text-secondary-foreground",
  penting: "bg-[var(--amber-bg)] text-[var(--amber)]",
  urgent: "bg-[var(--red-bg)] text-[var(--red)]",
};

/** Status yang boleh dipilih sebagai penyaring pada halaman daftar. */
export const SARINGAN_STATUS = [
  "semua",
  "draf",
  "baru",
  "berjalan",
  "bermasalah",
  "selesai",
] as const;

export type SaringanStatus = (typeof SARINGAN_STATUS)[number];

export function saringanSah(nilai: string | undefined): SaringanStatus {
  const kandidat = (nilai ?? "semua") as SaringanStatus;
  return SARINGAN_STATUS.includes(kandidat) ? kandidat : "semua";
}

/**
 * Tanggal ditampilkan dalam zona Asia/Jakarta — sama dengan zona yang
 * dipakai tampilan penugasan_tampil saat menghitung lewat_batas
 * (migrasi 0014, koreksi J.3/W). Memakai zona peramban akan membuat
 * tanggal di layar berbeda dari dasar perhitungan penanda merahnya.
 */
export function tanggalIndonesia(nilai: string | null): string {
  if (!nilai) return "—";
  const d = new Date(`${nilai}T00:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function waktuIndonesia(nilai: string | null): string {
  if (!nilai) return "—";
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

/** Koordinat ditampilkan empat angka di belakang koma, seperti mockup. */
export function koordinat(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return "Tanpa koordinat";
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

/**
 * B.9: "Daftar Penugasan memuat yang aktif saja; submenu Riwayat
 * memuat yang selesai dan dibatalkan dengan penyaring bawaan enam
 * bulan." Draf ikut daftar aktif karena ia milik Kanit penyusunnya
 * dan memang masih dikerjakan.
 */
export const STATUS_AKTIF: StatusPenugasan[] = [
  "draf",
  "baru",
  "berjalan",
  "bermasalah",
];

export const STATUS_RIWAYAT: StatusPenugasan[] = ["selesai", "dibatalkan"];

/** Umur draf dalam hari — 6.2.6: "Ditandai pada daftar draf dengan umurnya". */
export function umurHari(sejak: string): number {
  const ms = Date.now() - new Date(sejak).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}
