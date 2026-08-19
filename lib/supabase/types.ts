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
