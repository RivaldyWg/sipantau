-- =====================================================================
-- 0012 — Pemicu penugasan: syarat terbit, penjaga syarat minimum,
--         reset penanda lewat batas
-- Sumber: Addendum 6.2-T Bagian 6 (empat syarat minimum bertahan
--         seumur SPT), Bagian 1.5 (pengosongan penanda lewat batas)
--         docs/01-koreksi.md I.8 (penamaan trg_/fn_, urutan abjad)
--
-- CATATAN DESAIN
--
-- 1. Seluruh fungsi pemicu di sini SECURITY DEFINER + search_path
--    kosong, mengikuti aturan mengikat Addendum 6.1-T §1.2 dan
--    docs/CLAUDE.md §5.3. Nama tabel selalu ditulis lengkap
--    (public.xxx).
--
-- 2. trg_jaga_dasar_terakhir dan trg_jaga_lokasi_terakhir DIKURANGI
--    dari bentuk lengkap Addendum 6.2-T Bagian 6.4: pemeriksaan rujukan
--    ke public.laporan_harian ("titik sudah dirujuk laporan",
--    KP-6.2-42) DIHILANGKAN SEMENTARA karena tabel itu belum ada
--    (lahir Langkah 7 / Modul 6.3). Mengikuti pola eksplisit Addendum
--    6.2-T Bagian 8.4 untuk hapus_penugasan_permanen: "tabel yang
--    belum ada ... baris pemeriksaannya dihapus sementara dan WAJIB
--    ditambahkan kembali begitu tabelnya lahir". DICATAT SEBAGAI
--    BUTIR TERTUNDA — tambahkan kembali pemeriksaan itu pada migrasi
--    Langkah 7.
--
-- 3. trg_laporan_pertama_menjalankan_spt (Addendum 6.2-T Bagian 3,
--    KP-6.2-30) SENGAJA TIDAK dibuat di sini — pemicunya berada PADA
--    tabel public.laporan_harian ("after insert on laporan_harian")
--    yang belum ada. DITUNDA ke migrasi Langkah 7 bersamaan dengan
--    pembuatan tabel itu sendiri.
--
-- 4. Penguncian baris induk (`for update`) pada setiap pemicu penjaga
--    adalah bagian yang TIDAK BOLEH dihilangkan — itulah yang
--    menyerialkan dua pencabutan/penghapusan bersamaan sehingga tidak
--    ada yang lolos ganda. Lihat penjelasan Addendum 6.2-T Bagian 6.3.
--
-- 5. Urutan penamaan: seluruh pemicu berawalan trg_, seluruh fungsi
--    pemicu berawalan fn_ TIDAK dipakai di sini secara harfiah untuk
--    fungsi pemicu (nama fungsi memakai trg_ langsung mengikuti pola
--    yang SUDAH established di Addendum 6.2-T sendiri, bukan fn_ —
--    proyek ini mengikuti sumbernya persis: trg_periksa_syarat_terbit
--    dst adalah NAMA FUNGSI, bukan nama trigger, keduanya sama).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Pemeriksaan saat penerbitan (draf -> baru): KP-6.2-04, BR-33
-- ---------------------------------------------------------------------
create or replace function public.trg_periksa_syarat_terbit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kurang text[] := '{}';
  n int;
begin
  if not (new.status = 'baru' and old.status = 'draf') then
    return new;
  end if;

  if new.nomor_spt is null or length(trim(new.nomor_spt)) = 0 then
    kurang := array_append(kurang, 'nomor SPT');
  end if;

  select count(*) into n
    from public.penugasan_dasar where penugasan_id = new.id;
  if n = 0 then kurang := array_append(kurang, 'dasar penugasan'); end if;

  select count(*) into n
    from public.penugasan_lokasi
   where penugasan_id = new.id and lat is not null and lng is not null;
  if n = 0 then kurang := array_append(kurang, 'titik lokasi berkoordinat'); end if;

  select count(*) into n
    from public.penugasan_panit
   where penugasan_id = new.id and dicabut_pada is null;
  if n = 0 then kurang := array_append(kurang, 'Panit Penanggung Jawab'); end if;

  select count(*) into n
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.id
     and pp.dicabut_pada is null
     and u.peran = 'anggota';
  if n = 0 then kurang := array_append(kurang, 'pelaksana berperan Anggota'); end if;

  if array_length(kurang, 1) > 0 then
    raise exception 'SYARAT_TERBIT_KURANG: %', array_to_string(kurang, ', ');
  end if;

  return new;
end;
$$;

create trigger trg_periksa_syarat_terbit
  before update on public.penugasan
  for each row
  execute function public.trg_periksa_syarat_terbit();

-- ---------------------------------------------------------------------
-- Penjaga pelaksana Anggota terakhir: BR-33, KP-6.2-26
-- ---------------------------------------------------------------------
create or replace function public.trg_jaga_pelaksana_anggota_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (new.dicabut_pada is not null and old.dicabut_pada is null) then
    return new;
  end if;

  select status into st
    from public.penugasan
   where id = new.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.penugasan_id
     and pp.dicabut_pada is null
     and pp.id <> new.id
     and u.peran = 'anggota';

  if sisa = 0 then
    raise exception 'PELAKSANA_ANGGOTA_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_pelaksana_anggota_terakhir
  before update on public.penugasan_pelaksana
  for each row
  execute function public.trg_jaga_pelaksana_anggota_terakhir();

-- ---------------------------------------------------------------------
-- Penjaga Panit Penanggung Jawab terakhir: BR-33, KP-6.2-25
-- ---------------------------------------------------------------------
create or replace function public.trg_jaga_panit_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (new.dicabut_pada is not null and old.dicabut_pada is null) then
    return new;
  end if;

  select status into st
    from public.penugasan
   where id = new.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_panit
   where penugasan_id = new.penugasan_id
     and dicabut_pada is null
     and id <> new.id;

  if sisa = 0 then
    raise exception 'PANIT_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_panit_terakhir
  before update on public.penugasan_panit
  for each row
  execute function public.trg_jaga_panit_terakhir();

-- ---------------------------------------------------------------------
-- Penjaga dasar penugasan terakhir: BR-33
-- ---------------------------------------------------------------------
create or replace function public.trg_jaga_dasar_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  select status into st
    from public.penugasan
   where id = old.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return old;
  end if;

  select count(*) into sisa
    from public.penugasan_dasar
   where penugasan_id = old.penugasan_id
     and id <> old.id;

  if sisa = 0 then
    raise exception 'DASAR_PENUGASAN_TERAKHIR';
  end if;

  return old;
end;
$$;

create trigger trg_jaga_dasar_terakhir
  before delete on public.penugasan_dasar
  for each row
  execute function public.trg_jaga_dasar_terakhir();

-- ---------------------------------------------------------------------
-- Penjaga titik lokasi berkoordinat terakhir — penghapusan: BR-33
--
-- CATATAN: pemeriksaan "titik sudah dirujuk laporan" (KP-6.2-42)
-- BELUM disertakan — lihat catatan desain butir 2 di atas. Tambahkan
-- kembali begitu public.laporan_harian ada (Langkah 7):
--
--   select count(*) into n
--     from public.laporan_harian where lokasi_id = old.id;
--   if n > 0 then raise exception 'TITIK_SUDAH_DIRUJUK_LAPORAN'; end if;
-- ---------------------------------------------------------------------
create or replace function public.trg_jaga_lokasi_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  select status into st
    from public.penugasan
   where id = old.penugasan_id
     for update;

  if st not in ('draf', 'selesai', 'dibatalkan') then
    select count(*) into sisa
      from public.penugasan_lokasi
     where penugasan_id = old.penugasan_id
       and id <> old.id
       and lat is not null and lng is not null;

    if sisa = 0 and old.lat is not null and old.lng is not null then
      raise exception 'LOKASI_BERKOORDINAT_TERAKHIR';
    end if;
  end if;

  return old;
end;
$$;

create trigger trg_jaga_lokasi_terakhir
  before delete on public.penugasan_lokasi
  for each row
  execute function public.trg_jaga_lokasi_terakhir();

-- ---------------------------------------------------------------------
-- Penjaga titik lokasi berkoordinat terakhir — penyuntingan: BR-33,
-- KP-6.2-68. Mengosongkan koordinat titik terakhir melanggar BR-33
-- sama seperti menghapusnya (celah tambahan ditemukan Addendum 6.2-T
-- Bagian 6.4, tidak terdaftar pada berkas Modul 6.2 asalnya).
-- ---------------------------------------------------------------------
create or replace function public.trg_jaga_lokasi_berkoordinat_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (old.lat is not null and new.lat is null) then
    return new;
  end if;

  select status into st
    from public.penugasan where id = new.penugasan_id for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_lokasi
   where penugasan_id = new.penugasan_id
     and id <> new.id
     and lat is not null and lng is not null;

  if sisa = 0 then
    raise exception 'LOKASI_BERKOORDINAT_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_lokasi_berkoordinat_terakhir
  before update on public.penugasan_lokasi
  for each row
  execute function public.trg_jaga_lokasi_berkoordinat_terakhir();

-- ---------------------------------------------------------------------
-- Pengosongan penanda lewat batas saat tanggal_batas diperpanjang
-- Addendum 6.2-T Bagian 1.5
-- ---------------------------------------------------------------------
create or replace function public.trg_reset_penanda_lewat_batas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.tanggal_batas is distinct from old.tanggal_batas then
    new.lewat_batas_diberitahukan_pada := null;
  end if;
  return new;
end;
$$;

create trigger trg_reset_penanda_lewat_batas
  before update on public.penugasan
  for each row
  execute function public.trg_reset_penanda_lewat_batas();
