import type {
  JenisDasarPenugasan,
  JenisKegiatan,
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
