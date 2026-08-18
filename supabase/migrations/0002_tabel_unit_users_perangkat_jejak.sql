-- =====================================================================
-- 0002 — Tabel unit, users, perangkat_masuk, jejak_audit
-- Sumber: docs/10-modul-6.1-auth.md §5.1, §5.10, §5.12, §5.13 [FINAL]
--         docs/00-fondasi.md §5 "Aturan penamaan" (id, dibuat_pada,
--         diubah_pada wajib pada setiap tabel tanpa kecuali)
--         docs/01-koreksi.md I.10 (nama baku dibuat_pada/diubah_pada
--         berlaku bagi seluruh tabel tanpa kecuali)
--
-- CATATAN DESAIN — dibaca sebelum mengubah berkas ini
--
-- 1. Kolom "id", "dibuat_pada", "diubah_pada" TIDAK dituliskan pada
--    tabel kolom di dokumen modul, karena fondasi §5 menyatakan
--    ketiganya wajib pada seluruh tabel dan sengaja tidak diulang di
--    tiap daftar kolom. Ditambahkan di sini secara eksplisit.
--
-- 2. Kolom "peran" dan "peran_pelaku" ditulis "enum" pada dokumen,
--    tetapi diimplementasikan sebagai text + CHECK CONSTRAINT, bukan
--    CREATE TYPE ... AS ENUM Postgres. Ini mengikuti pola yang sudah
--    ditetapkan berulang di proyek ini (lihat BR-68 pada
--    docs/60-modul-6.6-6.9-user-notif.md): menambah nilai enum
--    Postgres tidak dapat dibatalkan di dalam transaksi, sedangkan
--    CHECK CONSTRAINT dapat diganti dengan satu ALTER TABLE. "enum"
--    pada dokumen PRD dibaca sebagai "nilai dari daftar tertutup",
--    bukan sebagai perintah literal memakai tipe enum Postgres.
--
-- 3. jejak_audit TIDAK diberi dibuat_pada/diubah_pada terpisah.
--    Kolom "waktu" sudah menjadi waktu pembuatan baris itu sendiri
--    (baris hanya-tambah, BR-22 — tidak pernah diubah), sehingga
--    menduplikasinya hanya menambah kebingungan. Ini memakai
--    pengecualian pada koreksi I.10: nama lain dipertahankan bila
--    membawa arti tambahan.
--
-- 4. jejak_audit.jenis_tindakan TIDAK diberi CHECK CONSTRAINT.
--    Section 9.6 Modul 6.1 sendiri menyatakan sebagian nilainya
--    "ditetapkan pada penggalian modul terkait" — berbeda dari
--    notifikasi.jenis (BR-68) yang eksplisit dinyatakan daftar
--    tertutup. Mengunci nilainya sekarang akan menolak jenis
--    tindakan sah dari modul yang belum digali.
--
-- 5. Tabel `penugasan_panit` (docs/10-modul-6.1-auth.md §5.11) SENGAJA
--    BELUM dibuat di sini meski didefinisikan pada berkas yang sama.
--    Ia mengacu ke tabel `penugasan` yang baru lahir pada Langkah 5
--    (docs/CLAUDE.md §10), dan Addendum 6.1-T Bagian 5.2 sendiri hanya
--    mencantumkan unit/users/perangkat_masuk/jejak_audit pada langkah
--    ini. Akibatnya sipantau_auth.penugasan_yang_saya_awasi() (Fungsi
--    3) DITUNDA ke migrasi Langkah 5, dan kebijakan akses baris users
--    untuk peran Panit (yang bergantung padanya) ikut ditunda —
--    lihat catatan pada migrasi 0004.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabel unit
-- ---------------------------------------------------------------------
create table public.unit (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null unique,
  keterangan  text,
  aktif       boolean not null default true,
  urutan      integer not null default 0,
  dibuat_pada timestamptz not null default now(),
  diubah_pada timestamptz not null default now()
);

comment on table public.unit is
  'Daftar unit di bawah Subdit IV. docs/10-modul-6.1-auth.md §5.10.';

-- ---------------------------------------------------------------------
-- Tabel users
--
-- id BUKAN dibangkitkan sendiri (tanpa default gen_random_uuid()):
-- wajib sama dengan id pada auth.users, diisi oleh proses pembuatan
-- akun (Fungsi Tepi buat-akun), bukan oleh baris ini sendiri.
-- ---------------------------------------------------------------------
create table public.users (
  id                   uuid primary key references auth.users (id) on delete cascade,
  nama                 text not null,
  nrp                  text not null unique,
  email_sistem         text not null unique,
  pangkat              text,
  peran                text not null
                         check (peran in ('kasubdit', 'kanit', 'panit', 'anggota', 'pemeliharaan')),
  unit_id              uuid references public.unit (id) on delete restrict,
  aktif                boolean not null default true,
  wajib_ganti_sandi    boolean not null default true,
  terakhir_masuk       timestamptz,
  foto_acuan_wajah     text,
  sedang_bertugas      boolean not null default false,
  posisi_terakhir_lat  numeric,
  posisi_terakhir_lng  numeric,
  terakhir_terlihat    timestamptz,
  dibuat_pada          timestamptz not null default now(),
  diubah_pada          timestamptz not null default now(),

  -- unit_id kosong HANYA untuk peran pemeliharaan (§5.1 modul 6.1)
  constraint chk_users_unit_hanya_pemeliharaan_kosong
    check ((peran = 'pemeliharaan') = (unit_id is null))
);

comment on table public.users is
  'Seluruh akun pengguna dari empat peran serta Akun Pemeliharaan. docs/10-modul-6.1-auth.md §5.1.';
comment on column public.users.email_sistem is
  'Email sintetis <nrp>@sipantau.internal. Tidak pernah ditampilkan atau dikirimi surat elektronik.';
comment on column public.users.foto_acuan_wajah is
  'Disediakan kosong (AM-6.1-17). Jangan diisi atau dibaca modul mana pun sampai fitur verifikasi wajah disetujui tertulis.';

-- ---------------------------------------------------------------------
-- Tabel perangkat_masuk
-- Satu baris per akun: user_id sendiri menjadi kunci utama.
-- ---------------------------------------------------------------------
create table public.perangkat_masuk (
  user_id               uuid primary key references public.users (id) on delete cascade,
  penanda_perangkat     text not null,
  keterangan_perangkat  text,
  masuk_pada            timestamptz not null default now(),
  dibuat_pada           timestamptz not null default now(),
  diubah_pada           timestamptz not null default now()
);

comment on table public.perangkat_masuk is
  'Satu Perangkat Terdaftar per akun, dasar penegakan BR-16. docs/10-modul-6.1-auth.md §5.12.';

-- ---------------------------------------------------------------------
-- Tabel jejak_audit
-- Hanya-tambah (BR-22): tidak ada UPDATE/DELETE dari peran mana pun,
-- ditegakkan lewat hak akses (migrasi 0004), bukan sekadar konvensi.
-- ---------------------------------------------------------------------
create table public.jejak_audit (
  id             uuid primary key default gen_random_uuid(),
  pelaku_id      uuid not null references public.users (id) on delete restrict,
  peran_pelaku   text not null
                   check (peran_pelaku in ('kasubdit', 'kanit', 'panit', 'anggota', 'pemeliharaan')),
  jenis_tindakan text not null,
  sasaran_tabel  text,
  sasaran_id     uuid,
  keterangan     text,
  waktu          timestamptz not null default now()
);

comment on table public.jejak_audit is
  'Tindakan penting beserta pelaku dan waktunya. Hanya-tambah, BR-22. docs/10-modul-6.1-auth.md §5.13.';
comment on column public.jejak_audit.jenis_tindakan is
  'Daftar dasar pada Section 9.6 modul 6.1, bertambah seiring modul lain digali. Sengaja tanpa CHECK CONSTRAINT, lihat catatan desain berkas ini.';

-- ---------------------------------------------------------------------
-- Indeks — Addendum 6.1-T §1.4, wajib sejak awal
-- ---------------------------------------------------------------------
create index idx_users_unit
  on public.users (unit_id) where aktif = true;

-- Tidak perlu indeks terpisah untuk nrp: constraint "unique" pada
-- kolomnya sudah membentuk indeks unik secara otomatis.

create index idx_jejak_audit_pelaku
  on public.jejak_audit (pelaku_id);

create index idx_jejak_audit_waktu
  on public.jejak_audit (waktu desc);

create index idx_jejak_audit_sasaran
  on public.jejak_audit (sasaran_tabel, sasaran_id);
