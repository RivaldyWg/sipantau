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
