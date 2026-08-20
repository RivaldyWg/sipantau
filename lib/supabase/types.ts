/**
 * Tipe baris public.users, ditulis tangan mengikuti kolom pada
 * supabase/migrations/0002_tabel_unit_users_perangkat_jejak.sql.
 *
 * Ini BUKAN hasil `supabase gen types` — sesi ini tidak punya kredensial
 * proyek Supabase asli untuk menjalankannya. Begitu CLI Supabase
 * tersambung ke proyek asli, ganti berkas ini dengan hasil:
 *   supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 * dan sesuaikan pemakaiannya bila ada perbedaan nama kolom.
 */

export type Peran = "kasubdit" | "kanit" | "panit" | "anggota" | "pemeliharaan";

export interface PenggunaRow {
  id: string;
  nama: string;
  nrp: string;
  email_sistem: string;
  pangkat: string | null;
  peran: Peran;
  unit_id: string | null;
  aktif: boolean;
  wajib_ganti_sandi: boolean;
  terakhir_masuk: string | null;
  sedang_bertugas: boolean;
  dibuat_pada: string;
  diubah_pada: string;
}

/* =====================================================================
 * Modul 6.2 — Penugasan (Langkah 6)
 *
 * Mengikuti kolom pada migrasi:
 *   0008_amandemen_unit_dan_tabel_penugasan.sql  (tabel penugasan)
 *   0009_tabel_penugasan_anak.sql                (empat tabel anak)
 *   0014_view_penugasan_tampil_dan_pgcron.sql    (tampilan penugasan_tampil)
 * ===================================================================== */

export type JenisKegiatan = "penyelidikan" | "pulbaket" | "pengamanan";

export type PrioritasPenugasan = "normal" | "penting" | "urgent";

export type StatusPenugasan =
  | "draf"
  | "baru"
  | "berjalan"
  | "bermasalah"
  | "selesai"
  | "dibatalkan";

export type JenisDasarPenugasan =
  | "laporan_informasi"
  | "laporan_polisi"
  | "laporan_pengaduan"
  | "surat_perintah_terdahulu"
  | "disposisi_pimpinan"
  | "lainnya";

export interface PenugasanRow {
  id: string;
  nomor_spt: string | null;
  jenis_kegiatan: JenisKegiatan;
  judul: string;
  objek: string | null;
  sasaran: string | null;
  uraian_tugas: string | null;
  nomor_lp: string | null;
  sumber_informasi: string | null;
  unit_id: string;
  prioritas: PrioritasPenugasan;
  status: StatusPenugasan;
  tanggal_mulai: string | null;
  tanggal_batas: string | null;
  berkas_surat_path: string | null;
  diterbitkan_oleh: string | null;
  ditugaskan_oleh: string | null;
  diterbitkan_pada: string | null;
  ditutup_oleh: string | null;
  ditutup_pada: string | null;
  dibatalkan_oleh: string | null;
  dibatalkan_pada: string | null;
  alasan_pembatalan: string | null;
  lewat_batas_diberitahukan_pada: string | null;
  dibuat_pada: string;
  diubah_pada: string;
}

/**
 * Tampilan penugasan_tampil = seluruh kolom penugasan + dua kolom
 * turunan yang DIHITUNG SAAT KUERI (migrasi 0014, catatan desain 1).
 *
 * Halaman WAJIB membaca tampilan ini, bukan tabel `penugasan`
 * langsung, supaya penanda lewat batas ikut terbawa.
 *
 * `hari_terlampaui` bernilai negatif bila tanggal batas belum lewat,
 * dan null bila tanggal_batas kosong — jangan ditampilkan mentah.
 */
export interface PenugasanTampilRow extends PenugasanRow {
  lewat_batas: boolean | null;
  hari_terlampaui: number | null;
}

export interface PenugasanDasarRow {
  id: string;
  penugasan_id: string;
  urutan: number;
  jenis: JenisDasarPenugasan;
  nomor: string | null;
  tanggal: string | null;
  keterangan: string | null;
  dibuat_pada: string;
  diubah_pada: string;
}

export interface PenugasanLokasiRow {
  id: string;
  penugasan_id: string;
  urutan: number;
  nama: string;
  alamat: string | null;
  keterangan: string | null;
  lat: number | null;
  lng: number | null;
  radius_meter: number | null;
  dibuat_pada: string;
  diubah_pada: string;
}

export interface PenugasanPelaksanaRow {
  id: string;
  penugasan_id: string;
  pelaksana_id: string;
  urutan: number;
  ditugaskan_pada: string;
  dibaca_pada: string | null;
  dicabut_pada: string | null;
  dicabut_oleh: string | null;
  alasan_pencabutan: string | null;
  dibuat_pada: string;
  diubah_pada: string;
}

export interface PenugasanPanitRow {
  id: string;
  penugasan_id: string;
  panit_id: string;
  ditunjuk_oleh: string | null;
  ditunjuk_pada: string;
  dicabut_pada: string | null;
  dicabut_oleh: string | null;
  alasan_pencabutan: string | null;
  dibuat_pada: string;
  diubah_pada: string;
}

/* =====================================================================
 * Modul 6.2 lanjutan — perpanjangan dan penandaan bermasalah
 * Mengikuti migrasi 0015_tabel_perpanjangan_dan_masalah.sql
 * ===================================================================== */

export interface PenugasanPerpanjanganRow {
  id: string;
  penugasan_id: string;
  tanggal_batas_lama: string | null;
  tanggal_batas_baru: string;
  alasan: string;
  diubah_oleh: string;
  dibuat_pada: string;
}

/**
 * Daftar jenis masalah masih SEMENTARA — Lampiran A butir A-11 belum
 * terjawab pemilik produk. Bila daftarnya berubah, ubah CHECK pada
 * migrasi 0015 LEBIH DULU, baru tipe ini.
 */
export type JenisMasalah =
  | "alamat_atau_sasaran_fiktif"
  | "objek_tidak_ditemukan"
  | "informasi_awal_tidak_sesuai"
  | "situasi_tidak_memungkinkan"
  | "sasaran_berpindah"
  | "kendala_perangkat_atau_jaringan"
  | "lainnya";

export interface PenugasanMasalahRow {
  id: string;
  penugasan_id: string;
  jenis_masalah: JenisMasalah;
  uraian: string;
  ditandai_oleh: string;
  ditandai_pada: string;
  dipulihkan_oleh: string | null;
  dipulihkan_pada: string | null;
  alasan_pemulihan: string | null;
}

/* =====================================================================
 * Modul 6.3 — Pelaporan Kegiatan Harian & Foto (Langkah 7)
 *
 * Mengikuti kolom pada migrasi 0017_modul_6_3_pelaporan.sql.
 * Rujukan: docs/30-modul-6.3-pelaporan.md §5.4, §5.19, Addendum 6.3-T,
 * Addendum 6.3-K, docs/01-koreksi.md I.2/I.13/I.14.
 * ===================================================================== */

export type JenisLaporan = "pulbaket_awal" | "perkembangan" | "akhir";

export type StatusKegiatanLaporan = "berjalan" | "selesai" | "bermasalah";

export type StatusLokasiLaporan =
  | "terverifikasi"
  | "di_luar_titik"
  | "tidak_terekam";

/**
 * Daftar SEMENTARA — Lampiran A butir A-05 sebenarnya sudah terjawab
 * dan FINAL (tujuh nilai ini), tidak seperti A-11 (jenis masalah)
 * yang masih benar-benar sementara. Ditulis di sini apa adanya sesuai
 * migrasi; jangan menambah nilai tanpa mengubah CHECK di migrasi 0017
 * lebih dulu.
 */
export type AlasanLokasiTidakTerekam =
  | "gps_tidak_tertangkap"
  | "daya_habis"
  | "izin_lokasi_mati"
  | "area_terbatas"
  | "disusun_setelah_pulang"
  | "perangkat_rusak"
  | "lainnya";

export type StatusLaporan =
  | "terkirim"
  | "perlu_diperbaiki"
  | "disetujui"
  | "ditarik";

export interface LaporanHarianRow {
  id: string;
  penugasan_id: string;
  pelapor_id: string;
  sesi_tugas_id: string | null;
  jenis: JenisLaporan;
  uraian: string;
  kendala: string | null;
  status_kegiatan: StatusKegiatanLaporan;

  // Kolom lokasi — BEKU setelah INSERT (Addendum 6.3-T Celah 1/4).
  lokasi_lat: number | null;
  lokasi_lng: number | null;
  akurasi_meter: number | null;
  status_lokasi: StatusLokasiLaporan | null;
  lokasi_id: string | null;
  lokasi_id_terdekat: string | null;
  jarak_meter: number | null;
  alasan_lokasi: AlasanLokasiTidakTerekam | null;
  alasan_lokasi_lainnya: string | null;
  keterangan_lokasi: string | null;

  status_laporan: StatusLaporan;
  disetujui_oleh: string | null;
  disetujui_pada: string | null;
  ditarik_pada: string | null;
  alasan_penarikan: string | null;

  disunting_pada: string | null;
  jumlah_suntingan: number;

  // Antrean Luring — BR-45 s/d BR-48.
  antrean_id: string;
  direkam_pada: string;
  diterima_terlambat: boolean;
  penanda_perangkat: string;
  penanda_perangkat_asal: string | null;

  dikirim_pada: string;
}

export type JenisCatatanLaporan = "catatan" | "minta_perbaikan";

export interface CatatanLaporanRow {
  id: string;
  laporan_id: string;
  peninjau_id: string;
  jenis: JenisCatatanLaporan;
  isi: string;
  dibuat_pada: string;
  disunting_pada: string | null;
}

/**
 * [KERANGKA — final di Modul 6.7]. Hanya kolom final BR-42 yang ada
 * di migrasi 0017. Jangan tambahkan field lain (sumber, tanda_air_*)
 * di sini sebelum migrasi yang menambahkannya benar-benar ada.
 */
export interface FotoDokumentasiRow {
  id: string;
  laporan_id: string | null;
  penugasan_id: string;
  diunggah_oleh: string;
  berkas_path: string;
  keterangan: string | null;
  lat: number | null;
  lng: number | null;
  akurasi_meter: number | null;
  diambil_pada: string | null;
  dibuat_pada: string;
}

export interface LaporanVersiRow {
  id: string;
  laporan_id: string | null;
  catatan_id: string | null;
  isi_lama: string;
  disunting_oleh: string;
  dibuat_pada: string;
}

/** Baris view rekap_laporan_tim — KP-6.3-58, hanya tiga kolom aman. */
export interface RekapLaporanTimRow {
  penugasan_id: string;
  pelapor_id: string;
  direkam_pada: string;
}

/** Baris view v_belum_lapor — dihitung dinamis, tidak disimpan. */
export interface BelumLaporRow {
  penugasan_id: string;
  pelaksana_id: string;
  unit_id: string;
  nomor_spt: string | null;
}
