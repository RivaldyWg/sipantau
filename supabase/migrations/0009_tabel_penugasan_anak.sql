-- =====================================================================
-- 0009 — Tabel anak penugasan: penugasan_panit, penugasan_dasar,
--         penugasan_lokasi, penugasan_pelaksana
-- Sumber: docs/10-modul-6.1-auth.md §5.11 (penugasan_panit dasar)
--         docs/20-modul-6.2-penugasan.md Bagian 3 §5.11 (amandemen),
--         §5.3 (penugasan_pelaksana, pengganti penugasan_anggota),
--         §5.15 (penugasan_dasar), §5.16 (penugasan_lokasi)
--         Addendum 6.2-T Bagian 7 (indeks wajib)
--
-- CATATAN DESAIN
--
-- 1. penugasan_panit SENGAJA dibuat di sini (bukan pada migrasi 0002)
--    karena bergantung pada public.penugasan yang baru lahir di
--    migrasi 0008 — lihat catatan desain migrasi 0002 poin 5. Kolom
--    yang dibuat sudah termasuk hasil amandemen Modul 6.2 Bagian 3
--    §5.11 (dicabut_pada, dicabut_oleh, alasan_pencabutan) langsung
--    dalam satu CREATE TABLE, tidak ada "tabel dasar" yang perlu
--    diamandemen belakangan karena baru pertama kali dibangun di sini.
--
-- 2. penugasan_pelaksana MENGGANTIKAN nama penugasan_anggota pada
--    versi kerangka PRD 0.2 — nama itu tidak pernah dipakai di
--    proyek ini karena Modul 6.2 sudah [FINAL] sebelum coding dimulai.
--
-- 3. Baris pada ketiga tabel penghubung (panit, pelaksana) TIDAK
--    PERNAH dihapus, hanya ditandai dicabut_pada — BR-30 (penomoran
--    baru). Karena itu tidak ada ON DELETE CASCADE dari sisi ini;
--    satu-satunya penghapusan permanen SPT sekaligus tabel anaknya
--    dilakukan lewat fungsi public.hapus_penugasan_permanen (migrasi
--    0013), bukan lewat DELETE baris manual.
--
-- 4. Indeks wajib sesuai Addendum 6.2-T Bagian 7 "Dua hal yang wajib
--    diperhatikan": penugasan_pelaksana(pelaksana_id),
--    penugasan_lokasi(penugasan_id, urutan). Ditambah
--    penugasan_panit(panit_id, penugasan_id) sesuai docs/10-modul-6.1-
--    auth.md §1.4 "Menekan biaya pembacaan".
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabel penugasan_panit
-- ---------------------------------------------------------------------
create table public.penugasan_panit (
  id                 uuid primary key default gen_random_uuid(),
  penugasan_id       uuid not null references public.penugasan (id) on delete restrict,
  panit_id           uuid not null references public.users (id) on delete restrict,
  ditunjuk_oleh      uuid references public.users (id) on delete restrict,
  ditunjuk_pada      timestamptz not null default now(),
  dicabut_pada       timestamptz,
  dicabut_oleh       uuid references public.users (id) on delete restrict,
  alasan_pencabutan  text,
  dibuat_pada        timestamptz not null default now(),
  diubah_pada        timestamptz not null default now(),

  constraint uq_penugasan_panit_pasangan unique (penugasan_id, panit_id),
  constraint chk_penugasan_panit_alasan_wajib
    check (dicabut_pada is null or (alasan_pencabutan is not null and length(trim(alasan_pencabutan)) > 0))
);

comment on table public.penugasan_panit is
  'Panit Penanggung Jawab per SPT. Baris tidak pernah dihapus (BR-30). docs/10-modul-6.1-auth.md §5.11, amandemen docs/20-modul-6.2-penugasan.md §5.11.';

create index idx_penugasan_panit_panit
  on public.penugasan_panit (panit_id, penugasan_id);

create index idx_penugasan_panit_penugasan
  on public.penugasan_panit (penugasan_id) where dicabut_pada is null;

-- ---------------------------------------------------------------------
-- Tabel penugasan_dasar
-- ---------------------------------------------------------------------
create table public.penugasan_dasar (
  id             uuid primary key default gen_random_uuid(),
  penugasan_id   uuid not null references public.penugasan (id) on delete restrict,
  urutan         integer not null default 1,
  jenis          text not null
                   check (jenis in ('laporan_informasi', 'laporan_polisi', 'laporan_pengaduan',
                                     'surat_perintah_terdahulu', 'disposisi_pimpinan', 'lainnya')),
  nomor          text,
  tanggal        date,
  keterangan     text,
  dibuat_pada    timestamptz not null default now(),
  diubah_pada    timestamptz not null default now(),

  -- KP-6.2-15: keterangan wajib bila jenis 'lainnya'.
  constraint chk_penugasan_dasar_keterangan_wajib
    check (jenis <> 'lainnya' or (keterangan is not null and length(trim(keterangan)) > 0))
);

comment on table public.penugasan_dasar is
  'Landasan terbitnya SPT, jamak per SPT. Minimal satu wajib sebelum terbit (BR-33). docs/20-modul-6.2-penugasan.md §5.15.';

create index idx_penugasan_dasar_penugasan
  on public.penugasan_dasar (penugasan_id, urutan);

-- ---------------------------------------------------------------------
-- Tabel penugasan_lokasi
-- ---------------------------------------------------------------------
create table public.penugasan_lokasi (
  id             uuid primary key default gen_random_uuid(),
  penugasan_id   uuid not null references public.penugasan (id) on delete restrict,
  urutan         integer not null default 1,
  nama           text not null,
  alamat         text,
  keterangan     text,
  lat            numeric,
  lng            numeric,
  radius_meter   integer default 300
                   check (radius_meter is null or (radius_meter between 100 and 2000)),
  dibuat_pada    timestamptz not null default now(),
  diubah_pada    timestamptz not null default now(),

  -- Titik tanpa koordinat tidak punya radius (§5.16: "Kosong bila
  -- titik tanpa koordinat").
  constraint chk_penugasan_lokasi_radius_hanya_berkoordinat
    check ((lat is null and lng is null and radius_meter is null)
           or (lat is not null and lng is not null))
);

comment on table public.penugasan_lokasi is
  'Titik lokasi bernomor pada SPT. Minimal satu berkoordinat wajib sebelum terbit (BR-33). docs/20-modul-6.2-penugasan.md §5.16.';

create index idx_penugasan_lokasi_penugasan
  on public.penugasan_lokasi (penugasan_id, urutan);

-- ---------------------------------------------------------------------
-- Tabel penugasan_pelaksana (pengganti penugasan_anggota)
-- ---------------------------------------------------------------------
create table public.penugasan_pelaksana (
  id                 uuid primary key default gen_random_uuid(),
  penugasan_id       uuid not null references public.penugasan (id) on delete restrict,
  pelaksana_id       uuid not null references public.users (id) on delete restrict,
  urutan             integer not null default 1,
  ditugaskan_pada    timestamptz not null default now(),
  dibaca_pada        timestamptz,
  dicabut_pada       timestamptz,
  dicabut_oleh       uuid references public.users (id) on delete restrict,
  alasan_pencabutan  text,
  dibuat_pada        timestamptz not null default now(),
  diubah_pada        timestamptz not null default now(),

  constraint uq_penugasan_pelaksana_pasangan unique (penugasan_id, pelaksana_id),
  constraint chk_penugasan_pelaksana_alasan_wajib
    check (dicabut_pada is null or (alasan_pencabutan is not null and length(trim(alasan_pencabutan)) > 0))
);

comment on table public.penugasan_pelaksana is
  'Orang yang melaksanakan SPT — boleh Anggota, Panit, atau Kanit (BR-34). Menggantikan nama penugasan_anggota. docs/20-modul-6.2-penugasan.md §5.3.';

create index idx_penugasan_pelaksana_pelaksana
  on public.penugasan_pelaksana (pelaksana_id);

create index idx_penugasan_pelaksana_penugasan
  on public.penugasan_pelaksana (penugasan_id) where dicabut_pada is null;
