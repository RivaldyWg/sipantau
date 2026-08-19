-- =====================================================================
-- 0015 — Tabel penugasan_perpanjangan dan penugasan_masalah
--
-- Sumber: docs/20-modul-6.2-penugasan.md
--         KP-6.2-30 s/d 35 (Tandai Bermasalah dan pengembaliannya)
--         KP-6.2-41       (perpanjangan: alasan wajib, tanpa batas
--                          jumlah, seluruh riwayat terbaca)
--         Lampiran A butir A-11 (daftar jenis masalah)
--         Lampiran B butir B.9
--
-- CATATAN DESAIN
--
-- 1. Kedua tabel ini TIDAK ada pada Langkah 5. Ketiadaannya baru
--    ketahuan saat halaman rincian dibangun dan tombol Perpanjang
--    Batas serta Tandai Bermasalah tidak punya tempat menyimpan.
--    Kolom `tanggal_batas` pada penugasan memang bisa diubah langsung,
--    tetapi KP-6.2-41 mensyaratkan SELURUH RIWAYAT terbaca — itu
--    menuntut tabel tersendiri, bukan sekadar menimpa kolomnya.
--
-- 2. jenis_masalah memakai CHECK, bukan tipe enum Postgres. Daftarnya
--    masih berstatus SEMENTARA (Lampiran A butir A-11 belum terjawab),
--    dan mengubah CHECK jauh lebih murah daripada mengubah tipe enum
--    yang sudah dipakai kolom. Begitu A-11 dijawab, ganti daftarnya
--    di sini — jangan menambah nilai diam-diam dari sisi aplikasi.
--
-- 3. Status 'bermasalah' pada penugasan disetel oleh PEMICU tabel ini,
--    bukan oleh aplikasi. BR-26 dan KP-6.2-37 menegaskan status itu
--    hanya boleh lahir dari tindakan manusia yang disertai jenis
--    masalah dan uraian; menyetelnya dari aplikasi membuka jalan bagi
--    status bermasalah tanpa baris penjelasnya.
--
-- 4. KP-6.2-34: penandaan bermasalah TIDAK menghentikan kegiatan dan
--    tidak mengunci apa pun. Karena itu tidak ada satu pun pemicu di
--    sini yang menolak penyisipan ke tabel lain.
--
-- 5. Edge case 6.2.6 "Dua orang menandai bermasalah hampir bersamaan":
--    penandaan pertama yang menetapkan status, penandaan kedua tetap
--    tersimpan sebagai catatan tambahan dan TIDAK ditolak. Karena itu
--    pemicu memakai `where status <> 'bermasalah'` — bukan pemeriksaan
--    yang melempar galat.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabel penugasan_perpanjangan
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_perpanjangan (
  id                   uuid primary key default gen_random_uuid(),
  penugasan_id         uuid not null references public.penugasan (id) on delete restrict,
  tanggal_batas_lama   date,
  tanggal_batas_baru   date not null,
  alasan               text not null,
  diubah_oleh          uuid not null references public.users (id) on delete restrict,
  dibuat_pada          timestamptz not null default now(),

  -- KP-6.2-41: alasan wajib diisi, bukan sekadar kolom ada.
  constraint chk_perpanjangan_alasan_wajib
    check (length(trim(alasan)) > 0)
);

comment on table public.penugasan_perpanjangan is
  'Riwayat perubahan tanggal batas SPT. Alasan wajib, tanpa batas jumlah (KP-6.2-41). Memundurkan tanggal ke masa lalu DIIZINKAN — koreksi salah ketik juga perlu jalan (docs/20-modul-6.2-penugasan.md §6.2.6).';

create index if not exists idx_perpanjangan_penugasan
  on public.penugasan_perpanjangan (penugasan_id, dibuat_pada desc);

-- ---------------------------------------------------------------------
-- Tabel penugasan_masalah
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_masalah (
  id              uuid primary key default gen_random_uuid(),
  penugasan_id    uuid not null references public.penugasan (id) on delete restrict,
  jenis_masalah   text not null
                    check (jenis_masalah in (
                      'alamat_atau_sasaran_fiktif',
                      'objek_tidak_ditemukan',
                      'informasi_awal_tidak_sesuai',
                      'situasi_tidak_memungkinkan',
                      'sasaran_berpindah',
                      'kendala_perangkat_atau_jaringan',
                      'lainnya')),
  uraian          text not null,
  ditandai_oleh   uuid not null references public.users (id) on delete restrict,
  ditandai_pada   timestamptz not null default now(),

  -- Pengembalian dari bermasalah, KP-6.2-35. Kosong berarti penandaan
  -- ini belum pernah dikembalikan.
  dipulihkan_oleh   uuid references public.users (id) on delete restrict,
  dipulihkan_pada   timestamptz,
  alasan_pemulihan  text,

  -- B.9: "Bermasalah hanya ditetapkan manusia disertai jenis masalah
  -- dan uraian wajib."
  constraint chk_masalah_uraian_wajib
    check (length(trim(uraian)) > 0),

  -- KP-6.2-35: alasan pengembalian wajib diisi.
  constraint chk_masalah_alasan_pemulihan_wajib
    check (dipulihkan_pada is null
           or (alasan_pemulihan is not null and length(trim(alasan_pemulihan)) > 0))
);

comment on table public.penugasan_masalah is
  'Penandaan SPT bermasalah beserta pengembaliannya. Daftar jenis_masalah masih SEMENTARA — Lampiran A butir A-11 belum terjawab. Bermasalah adalah keterangan keadaan, bukan penghentian kegiatan (KP-6.2-34).';

create index if not exists idx_masalah_penugasan
  on public.penugasan_masalah (penugasan_id, ditandai_pada desc);

create index if not exists idx_masalah_terbuka
  on public.penugasan_masalah (penugasan_id) where dipulihkan_pada is null;

-- ---------------------------------------------------------------------
-- Pemicu: penandaan menaikkan status SPT ke 'bermasalah'
-- ---------------------------------------------------------------------
create or replace function public.trg_tandai_penugasan_bermasalah()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Hanya SPT yang sedang hidup yang boleh berpindah ke bermasalah.
  -- SPT selesai/dibatalkan/draf sengaja dilewati tanpa galat: baris
  -- penandaannya tetap tersimpan sebagai catatan (6.2.6).
  update public.penugasan
     set status = 'bermasalah',
         diubah_pada = now()
   where id = new.penugasan_id
     and status in ('baru', 'berjalan');

  return new;
end;
$$;

drop trigger if exists trg_tandai_penugasan_bermasalah on public.penugasan_masalah;
create trigger trg_tandai_penugasan_bermasalah
  after insert on public.penugasan_masalah
  for each row
  execute function public.trg_tandai_penugasan_bermasalah();

comment on function public.trg_tandai_penugasan_bermasalah is
  'Status bermasalah lahir dari baris penandaan, bukan dari aplikasi (BR-26, KP-6.2-37). Penandaan kedua yang tiba saat status sudah bermasalah tidak ditolak, hanya tidak mengubah apa-apa (6.2.6).';

-- ---------------------------------------------------------------------
-- Pemicu: pemulihan menurunkan status kembali ke 'berjalan'
-- ---------------------------------------------------------------------
create or replace function public.trg_pulihkan_penugasan_bermasalah()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  sisa int;
begin
  if not (new.dipulihkan_pada is not null and old.dipulihkan_pada is null) then
    return new;
  end if;

  -- KP-6.2-35 mengembalikan status ke 'berjalan', tetapi hanya bila
  -- tidak ada penandaan lain yang masih terbuka. Kalau masih ada,
  -- SPT tetap bermasalah — memulihkan satu masalah tidak berarti
  -- seluruh masalahnya beres.
  select count(*) into sisa
    from public.penugasan_masalah
   where penugasan_id = new.penugasan_id
     and dipulihkan_pada is null
     and id <> new.id;

  if sisa = 0 then
    update public.penugasan
       set status = 'berjalan',
           diubah_pada = now()
     where id = new.penugasan_id
       and status = 'bermasalah';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pulihkan_penugasan_bermasalah on public.penugasan_masalah;
create trigger trg_pulihkan_penugasan_bermasalah
  after update on public.penugasan_masalah
  for each row
  execute function public.trg_pulihkan_penugasan_bermasalah();

-- ---------------------------------------------------------------------
-- RLS penugasan_perpanjangan
--
-- Baca mengikuti induknya (pola yang sama dengan penugasan_dasar di
-- migrasi 0010). Tulis hanya Kanit pemilik unit.
-- ---------------------------------------------------------------------
alter table public.penugasan_perpanjangan enable row level security;
grant select, insert on public.penugasan_perpanjangan to authenticated;

drop policy if exists "perpanjangan_baca_mengikuti_induk" on public.penugasan_perpanjangan;
create policy "perpanjangan_baca_mengikuti_induk"
on public.penugasan_perpanjangan
for select
to authenticated
using (
  penugasan_id in (select id from public.penugasan)
);

drop policy if exists "perpanjangan_tulis_oleh_kanit_pemilik" on public.penugasan_perpanjangan;
create policy "perpanjangan_tulis_oleh_kanit_pemilik"
on public.penugasan_perpanjangan
for insert
to authenticated
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and diubah_oleh = (select auth.uid())
  and penugasan_id in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
       and status not in ('selesai', 'dibatalkan')
  )
);

-- ---------------------------------------------------------------------
-- RLS penugasan_masalah
--
-- Berbeda dari perpanjangan: yang boleh MENANDAI bukan hanya Kanit.
-- Tabel 6.2.5 memberi tombol Tandai Bermasalah kepada Panit
-- Penanggung Jawab aktif DAN pelaksana. Kanit ikut karena ia pemilik
-- unitnya.
--
-- Pemulihan (update) hanya Kanit — KP-6.2-35 menyebut Kanit.
-- ---------------------------------------------------------------------
alter table public.penugasan_masalah enable row level security;
grant select, insert, update on public.penugasan_masalah to authenticated;

drop policy if exists "masalah_baca_mengikuti_induk" on public.penugasan_masalah;
create policy "masalah_baca_mengikuti_induk"
on public.penugasan_masalah
for select
to authenticated
using (
  penugasan_id in (select id from public.penugasan)
);

drop policy if exists "masalah_tulis_oleh_yang_terlibat" on public.penugasan_masalah;
create policy "masalah_tulis_oleh_yang_terlibat"
on public.penugasan_masalah
for insert
to authenticated
with check (
  ditandai_oleh = (select auth.uid())
  and (
    (
      (select sipantau_auth.peran_saya()) = 'kanit'
      and penugasan_id in (
        select id from public.penugasan
         where unit_id = (select sipantau_auth.unit_saya())
      )
    )
    or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
    or penugasan_id in (select sipantau_auth.penugasan_yang_saya_laksanakan())
  )
);

drop policy if exists "masalah_pulihkan_oleh_kanit_pemilik" on public.penugasan_masalah;
create policy "masalah_pulihkan_oleh_kanit_pemilik"
on public.penugasan_masalah
for update
to authenticated
using (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and penugasan_id in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
  )
)
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and penugasan_id in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
  )
);
