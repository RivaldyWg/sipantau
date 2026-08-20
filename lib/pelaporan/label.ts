import type {
  AlasanLokasiTidakTerekam,
  JenisCatatanLaporan,
  JenisLaporan,
  StatusKegiatanLaporan,
  StatusLaporan,
  StatusLokasiLaporan,
} from "@/lib/supabase/types";

/**
 * Peristilahan Modul 6.3 — satu tempat, dipakai formulir kirim,
 * daftar, dan rincian laporan. Nilai kuncinya mengikuti CHECK pada
 * migrasi 0017 persis; ubah migrasi dulu sebelum menambah kunci di
 * sini.
 */

export const LABEL_JENIS_LAPORAN: Record<JenisLaporan, string> = {
  pulbaket_awal: "Pulbaket Awal",
  perkembangan: "Perkembangan",
  akhir: "Akhir",
};

export const LABEL_STATUS_KEGIATAN: Record<StatusKegiatanLaporan, string> = {
  berjalan: "Berjalan",
  selesai: "Selesai",
  bermasalah: "Bermasalah",
};

export const LABEL_STATUS_LAPORAN: Record<StatusLaporan, string> = {
  terkirim: "Terkirim",
  perlu_diperbaiki: "Perlu Diperbaiki",
  disetujui: "Disetujui",
  ditarik: "Ditarik",
};

export const KELAS_LENCANA_STATUS_LAPORAN: Record<StatusLaporan, string> = {
  terkirim: "bg-[var(--blue-bg)] text-[var(--blue)]",
  perlu_diperbaiki: "bg-[var(--amber-bg)] text-[var(--amber)]",
  disetujui: "bg-[var(--green-bg)] text-[var(--green)]",
  ditarik: "bg-secondary text-muted-foreground line-through",
};

/**
 * §6.3.4 aturan modul butir 2: sistem menyajikan FAKTA lokasi, tidak
 * pernah menyimpulkan pelanggaran. Label karena itu ditulis netral —
 * "Terekam di luar titik" bukan "Di luar area tugas", dan seterusnya.
 * Jangan mengganti kalimatnya jadi terdengar menuduh.
 */
export const LABEL_STATUS_LOKASI: Record<StatusLokasiLaporan, string> = {
  terverifikasi: "Terverifikasi",
  di_luar_titik: "Terekam di Luar Titik",
  tidak_terekam: "Tidak Terekam",
};

export const KELAS_LENCANA_STATUS_LOKASI: Record<StatusLokasiLaporan, string> = {
  terverifikasi: "bg-[var(--green-bg)] text-[var(--green)]",
  di_luar_titik: "bg-[var(--amber-bg)] text-[var(--amber)]",
  tidak_terekam: "bg-secondary text-secondary-foreground",
};

/** Butir A-05, FINAL (tujuh nilai) — beda dari A-11 yang masih sementara. */
export const LABEL_ALASAN_LOKASI: Record<AlasanLokasiTidakTerekam, string> = {
  gps_tidak_tertangkap: "Sinyal GPS tidak tertangkap di dalam gedung",
  daya_habis: "Perangkat kehabisan daya saat kegiatan",
  izin_lokasi_mati: "Izin lokasi tertolak atau tidak aktif",
  area_terbatas: "Kegiatan di area terbatas yang melarang perangkat",
  disusun_setelah_pulang: "Laporan disusun setelah meninggalkan lokasi",
  perangkat_rusak: "Perangkat rusak atau tertinggal",
  lainnya: "Lainnya",
};

export const LABEL_JENIS_CATATAN: Record<JenisCatatanLaporan, string> = {
  catatan: "Catatan",
  minta_perbaikan: "Minta Perbaikan",
};

/**
 * Tanggal/waktu Asia/Jakarta — sama dengan zona yang dipakai server
 * untuk seluruh penilaian direkam_pada (BR-45, BR-64). Memakai zona
 * peramban bisa membuat "hari ini" di layar berbeda dari dasar
 * perhitungan Belum Melapor.
 */
export function waktuLaporan(nilai: string | null): string {
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

export function tanggalLaporan(nilai: string | null): string {
  if (!nilai) return "—";
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/** Jarak dibulatkan meter, atau km bila cukup jauh — untuk tampilan ringkas. */
export function jarakRingkas(meter: number | null): string {
  if (meter === null) return "—";
  if (meter < 1000) return `${Math.round(meter)} m`;
  return `${(meter / 1000).toFixed(1)} km`;
}

/**
 * Judul dan subjudul halaman daftar laporan per peran — belum ada
 * ketetapan kata persis dari PRD untuk halaman ini (berbeda dari
 * Modul 6.2 yang eksplisit menetapkan §6.2.5). Disusun mengikuti pola
 * kalimat JUDUL_DAFTAR pada lib/penugasan/label.ts supaya konsisten
 * satu aplikasi, dan mengikuti bahasa kriteria penerimaan KP-6.3-59
 * s/d 61 (mis. "hanya laporan dari SPT yang ia awasi").
 */
export const JUDUL_DAFTAR_LAPORAN: Record<
  string,
  { judul: string; sub: string }
> = {
  anggota: {
    judul: "Laporan Saya",
    sub: "Laporan kegiatan yang sudah Anda kirim, termasuk yang ditarik.",
  },
  panit: {
    judul: "Laporan yang Saya Tinjau",
    sub: "Laporan dari SPT yang Anda awasi. Yang belum bercatatan tampil lebih dulu.",
  },
  kanit: {
    judul: "Laporan Unit",
    sub: "Laporan kegiatan dari seluruh penugasan pada unit Anda.",
  },
  kasubdit: {
    judul: "Seluruh Laporan",
    sub: "Laporan kegiatan lintas unit pada Subdit IV.",
  },
};
