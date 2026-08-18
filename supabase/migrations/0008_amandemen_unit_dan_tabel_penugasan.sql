-- =====================================================================
-- 0008 — Amandemen unit, tabel penugasan (inti SPT)
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 3 §5.2 (pengganti utuh),
--         §5.10 (amandemen unit), §5.8 (hubungan antar entitas)
--         docs/01-koreksi.md J.3/W (zona waktu Asia/Jakarta wajib)
--         Addendum 6.2-T Bagian 5 (batasan penutupan/pembatalan),
--         Bagian 1.5 (kolom penanda lewat_batas_diberitahukan_pada)
--
-- CATATAN DESAIN
--
-- 1. Urutan pembangunan tabel penugasan SENGAJA disusun: tabel inti
--    (penugasan) dahulu di migrasi ini, baru tabel anak (penugasan_
--    panit, penugasan_dasar, penugasan_lokasi, penugasan_pelaksana)
--    pada migrasi 0009 — semuanya punya foreign key ke penugasan.id
--    dan tidak bisa dibuat lebih dulu.
--
-- 2. status DAN prioritas DAN jenis_kegiatan ditulis "enum" pada
--    dokumen tetapi diimplementasikan text + CHECK CONSTRAINT,
--    mengikuti pola yang sudah dipakai di migrasi 0002 poin 2
--    (menambah nilai enum Postgres tidak dapat dibatalkan di dalam
--    transaksi; CHECK CONSTRAINT dapat diganti dengan satu ALTER
--    TABLE).
--
-- 3. Kolom "lewat_batas_diberitahukan_pada" (Addendum 6.2-T Bagian
--    1.5) sudah ditulis di sini sebagai bagian dari CREATE TABLE,
--    bukan ALTER TABLE susulan, mengikuti koreksi I.14: kolom yang
--    sudah diketahui dibutuhkan sejak awal ditulis langsung, tidak
--    ditambahkan belakangan.
--
-- 4. Tiga batasan pemeriksaan dari Addendum 6.2-T Bagian 5.2 sudah
--    disertakan di sini sebagai bagian CREATE TABLE (bentuknya sama
--    dengan ALTER TABLE ... ADD CONSTRAINT terpisah, tetapi ditulis
--    langsung karena tabelnya baru): chk_selesai_wajib_berkas,
--    chk_batal_wajib_alasan, chk_batas_tidak_mendahului_mulai.
--    Rujukan BR pada aturan ini memakai penomoran BARU hasil
--    penggeseran koreksi Bagian 0.2: BR-28 (bukan BR-25).
--
-- 5. diterbitkan_oleh dan ditugaskan_oleh mengacu ke users, TIDAK
--    diberi CHECK peran='kanit' langsung pada kolom karena peran
--    seseorang dapat berubah setelah SPT terbit (lihat edge case
--    6.2.6: "Kanit dipindah unit setelah menerbitkan SPT — SPT tetap
--    milik unit lamanya"). Pemeriksaan peran kanit dilakukan di RLS
--    dan di pemicu, bukan di CHECK CONSTRAINT kolom ini.
--
-- 6. Indeks (unit_id, status) wajib sejak awal sesuai Bagian 7
--    Addendum 6.2-T "Dua hal yang wajib diperhatikan saat
--    implementasi".
-- =====================================================================

-- ---------------------------------------------------------------------
-- unit — amandemen (Modul 6.2 Bagian 3 §5.10)
-- ---------------------------------------------------------------------
alter table public.unit
  add column if not exists kode_klasifikasi text;

comment on column public.unit.kode_klasifikasi is
  'Kode klasifikasi surat unit, contoh RES.5.3. Dipakai menyusun nomor SPT. Belum resmi — lihat Lampiran A butir A-12, docs/20-modul-6.2-penugasan.md.';

-- ---------------------------------------------------------------------
-- Tabel penugasan
-- ---------------------------------------------------------------------
create table public.penugasan (
  id                              uuid primary key default gen_random_uuid(),
  nomor_spt                       text unique,
  jenis_kegiatan                  text not null
                                    check (jenis_kegiatan in ('penyelidikan', 'pulbaket', 'pengamanan')),
  judul                           text not null,
  objek                           text,
  sasaran                         text,
  uraian_tugas                    text,
  nomor_lp                        text,
  sumber_informasi                text,
  unit_id                         uuid not null references public.unit (id) on delete restrict,
  prioritas                       text not null default 'normal'
                                    check (prioritas in ('normal', 'penting', 'urgent')),
  status                          text not null default 'draf'
                                    check (status in ('draf', 'baru', 'berjalan', 'bermasalah', 'selesai', 'dibatalkan')),
  tanggal_mulai                   date,
  tanggal_batas                   date,
  berkas_surat_path               text,
  diterbitkan_oleh                uuid references public.users (id) on delete restrict,
  ditugaskan_oleh                 uuid references public.users (id) on delete restrict,
  diterbitkan_pada                timestamptz,
  ditutup_oleh                    uuid references public.users (id) on delete restrict,
  ditutup_pada                    timestamptz,
  dibatalkan_oleh                 uuid references public.users (id) on delete restrict,
  dibatalkan_pada                 timestamptz,
  alasan_pembatalan               text,
  lewat_batas_diberitahukan_pada  timestamptz,
  dibuat_pada                     timestamptz not null default now(),
  diubah_pada                     timestamptz not null default now(),

  -- BR-28 (penomoran baru): tidak dapat selesai sebelum berkas surat
  -- dilampirkan. Addendum 6.2-T Bagian 5.2.
  constraint chk_selesai_wajib_berkas
    check (status <> 'selesai'
           or (berkas_surat_path is not null and length(trim(berkas_surat_path)) > 0)),

  -- Pembatalan wajib beralasan. KP-6.2-47.
  constraint chk_batal_wajib_alasan
    check (status <> 'dibatalkan'
           or (alasan_pembatalan is not null and length(trim(alasan_pembatalan)) > 0)),

  -- Kondisi tepi yang didaftar 6.2.6: tanggal batas tidak boleh
  -- mendahului tanggal mulai.
  constraint chk_batas_tidak_mendahului_mulai
    check (tanggal_batas is null or tanggal_mulai is null or tanggal_batas >= tanggal_mulai)
);

comment on table public.penugasan is
  'Surat Perintah Tugas (SPT). Hanya Kanit yang membuat baris. docs/20-modul-6.2-penugasan.md Bagian 3 §5.2.';
comment on column public.penugasan.nomor_spt is
  'Diketik Kanit mengikuti surat fisik. Boleh kosong selama status draf (unique constraint Postgres mengizinkan banyak NULL).';

create index idx_penugasan_unit_status
  on public.penugasan (unit_id, status);
