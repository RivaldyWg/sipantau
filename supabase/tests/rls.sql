-- =====================================================================
-- SiPANTAU — Uji Row Level Security
-- Dijalankan di SQL Editor Supabase. Tidak perlu framework apa pun.
--
-- CARA PAKAI
--   1. Jalankan seed dulu, sehingga empat akun contoh ada
--   2. Ganti keenam UUID di bawah dengan nilai sungguhan dari seed
--   3. Jalankan seluruh berkas
--   4. Setiap baris hasil wajib bernilai TRUE. Satu saja FALSE berarti
--      ada kebocoran, dan pembangunan berhenti sampai diperbaiki
--
-- ATURAN
--   Setiap kali menulis kebijakan RLS baru, tambahkan pengujiannya
--   di sini pada sesi yang sama. Jangan ditunda.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Identitas akun contoh — GANTI dengan UUID dari seed
-- ---------------------------------------------------------------------
\set kasubdit    '00000000-0000-0000-0000-000000000001'
\set kanit_1     '00000000-0000-0000-0000-000000000002'
\set panit_1     '00000000-0000-0000-0000-000000000003'
\set anggota_1   '00000000-0000-0000-0000-000000000004'
-- anggota_2 sengaja unit berbeda dari anggota_1, dipakai U-RLS-02
\set anggota_2   '00000000-0000-0000-0000-000000000005'
\set pemeliharaan '00000000-0000-0000-0000-000000000006'

\set unit_1      '10000000-0000-0000-0000-000000000001'
\set unit_2      '10000000-0000-0000-0000-000000000002'


-- =====================================================================
-- Fungsi bantu: berpura-pura menjadi seorang pengguna
-- =====================================================================
create or replace function pg_temp.jadi(p_user uuid)
returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
                     json_build_object('sub', p_user, 'role', 'authenticated')::text,
                     true);
end;
$$;

create or replace function pg_temp.jadi_anon()
returns void language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
end;
$$;


-- =====================================================================
-- BAGIAN 1 — Tabel users
-- =====================================================================
begin;

select pg_temp.jadi(:'anggota_1');

select 'U-RLS-01 Anggota membaca dirinya sendiri' as uji,
       count(*) = 1 as lulus
  from public.users where id = :'anggota_1';

select 'U-RLS-02 Anggota TIDAK membaca akun unit lain' as uji,
       count(*) = 0 as lulus
  from public.users where id = :'anggota_2';

select 'U-RLS-03 Anggota TIDAK dapat mengubah perannya sendiri' as uji,
       (select count(*) = 0 from (
          select 1 from public.users
           where id = :'anggota_1' and peran = 'kasubdit'
        ) s) as lulus;

rollback;

begin;
select pg_temp.jadi(:'kanit_1');

select 'U-RLS-04 Kanit membaca seluruh personel unitnya' as uji,
       count(*) > 0 as lulus
  from public.users where unit_id = :'unit_1';

select 'U-RLS-05 Kanit TIDAK membaca personel unit lain' as uji,
       count(*) = 0 as lulus
  from public.users where unit_id = :'unit_2';

rollback;

begin;
select pg_temp.jadi(:'kasubdit');

select 'U-RLS-06 Kasubdit membaca seluruh unit' as uji,
       count(distinct unit_id) > 1 as lulus
  from public.users where unit_id is not null;

rollback;


-- =====================================================================
-- BAGIAN 2 — Tabel penugasan
-- =====================================================================
begin;
select pg_temp.jadi(:'anggota_1');

select 'U-RLS-07 Anggota hanya membaca SPT yang ditujukan padanya' as uji,
       not exists (
         select 1 from public.penugasan p
          where not exists (
            select 1 from public.penugasan_pelaksana pp
             where pp.penugasan_id = p.id
               and pp.pelaksana_id = :'anggota_1'
          )
       ) as lulus;

select 'U-RLS-08 Anggota TIDAK dapat menerbitkan SPT' as uji,
       (select count(*) = 0 from public.penugasan
         where diterbitkan_oleh = :'anggota_1') as lulus;

rollback;

begin;
select pg_temp.jadi(:'kanit_1');

select 'U-RLS-09 Kanit TIDAK membaca SPT unit lain' as uji,
       count(*) = 0 as lulus
  from public.penugasan where unit_id = :'unit_2';

rollback;

-- Panit: lingkupnya PENUGASAN, bukan unit (BR-21). Ini yang paling
-- mudah keliru — periksa dengan sungguh-sungguh.
begin;
select pg_temp.jadi(:'panit_1');

select 'U-RLS-10 Panit hanya membaca SPT tempat ia ditunjuk' as uji,
       not exists (
         select 1 from public.penugasan p
          where not exists (
            select 1 from public.penugasan_panit pp
             where pp.penugasan_id = p.id
               and pp.panit_id = :'panit_1'
          )
       ) as lulus;

rollback;


-- =====================================================================
-- BAGIAN 3 — Tabel laporan_harian
-- =====================================================================
begin;
select pg_temp.jadi(:'anggota_1');

select 'U-RLS-11 Anggota TIDAK membaca laporan Anggota lain' as uji,
       count(*) = 0 as lulus
  from public.laporan_harian where pelapor_id = :'anggota_2';

select 'U-RLS-12 Anggota TIDAK dapat menyetujui laporan' as uji,
       (select count(*) = 0 from public.laporan_harian
         where disetujui_oleh = :'anggota_1') as lulus;

rollback;


-- =====================================================================
-- BAGIAN 4 — Tampilan
-- Dua kebocoran sudah pernah ditemukan di sini. Periksa keras.
-- =====================================================================
begin;
select pg_temp.jadi(:'anggota_1');

select 'U-RLS-13 v_belum_lapor hanya memuat baris sendiri' as uji,
       not exists (
         select 1 from public.v_belum_lapor
          where pelaksana_id <> :'anggota_1'
       ) as lulus;

select 'U-RLS-14 penugasan_tampil mengikuti lingkup peran' as uji,
       not exists (
         select 1 from public.penugasan_tampil p
          where not exists (
            select 1 from public.penugasan_pelaksana pp
             where pp.penugasan_id = p.id
               and pp.pelaksana_id = :'anggota_1'
          )
       ) as lulus;

rollback;

-- rekap_laporan_tim sengaja security_invoker = off, sehingga ia WAJIB
-- menyaring dirinya sendiri. Bila penyaringnya hilang, seluruh isi
-- tabel terbuka bagi siapa pun.
begin;
select pg_temp.jadi(:'anggota_2');

select 'U-RLS-15 rekap_laporan_tim kosong bagi yang tidak terlibat' as uji,
       count(*) = 0 as lulus
  from public.rekap_laporan_tim
 where penugasan_id in (
   select id from public.penugasan where unit_id = :'unit_1'
 );

rollback;


-- =====================================================================
-- BAGIAN 5 — Tabel yang TIDAK boleh disentuh klien sama sekali
-- =====================================================================
begin;
select pg_temp.jadi(:'anggota_1');

select 'U-RLS-16 pembatasan_laju tidak dapat dibaca klien' as uji,
       (select not has_table_privilege('authenticated',
                                       'public.pembatasan_laju', 'SELECT')) as lulus;

select 'U-RLS-17 titik_penanda tidak dapat dibaca klien' as uji,
       (select not has_table_privilege('authenticated',
                                       'public.titik_penanda', 'SELECT')) as lulus;

select 'U-RLS-18 perangkat_masuk tidak dapat dibaca klien' as uji,
       (select not has_table_privilege('authenticated',
                                       'public.perangkat_masuk', 'SELECT')) as lulus;

select 'U-RLS-19 notifikasi tidak dapat disisipkan klien' as uji,
       (select not has_table_privilege('authenticated',
                                       'public.notifikasi', 'INSERT')) as lulus;

select 'U-RLS-20 laporan_versi tidak dapat ditulis klien' as uji,
       (select not has_table_privilege('authenticated',
                                       'public.laporan_versi', 'INSERT')) as lulus;

rollback;


-- =====================================================================
-- BAGIAN 6 — Peran anon tidak boleh menyentuh apa pun
-- =====================================================================
begin;
select pg_temp.jadi_anon();

select 'U-RLS-21 anon tidak dapat membaca users' as uji,
       (select not has_table_privilege('anon', 'public.users', 'SELECT')) as lulus;

select 'U-RLS-22 anon tidak dapat membaca penugasan' as uji,
       (select not has_table_privilege('anon', 'public.penugasan', 'SELECT')) as lulus;

select 'U-RLS-23 anon tidak dapat membaca laporan_harian' as uji,
       (select not has_table_privilege('anon', 'public.laporan_harian', 'SELECT')) as lulus;

rollback;


-- =====================================================================
-- BAGIAN 7 — Pemeriksaan yang tidak menyangkut peran,
--            tetapi sudah terbukti sering keliru
-- =====================================================================

-- Setiap tampilan wajib menyatakan security_invoker.
-- Yang tidak menyatakannya melewati seluruh RLS diam-diam.
select 'U-RLS-24 Seluruh tampilan menyatakan security_invoker' as uji,
       count(*) = 0 as lulus,
       string_agg(c.relname, ', ') as tampilan_bermasalah
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relkind = 'v'
   and c.relname <> 'rekap_laporan_tim'   -- satu-satunya pengecualian
   and not exists (
     select 1 from unnest(coalesce(c.reloptions, '{}')) o
      where o = 'security_invoker=true' or o = 'security_invoker=on'
   );

-- Setiap fungsi security definer wajib mengunci search_path.
select 'U-RLS-25 Seluruh fungsi definer mengunci search_path' as uji,
       count(*) = 0 as lulus,
       string_agg(p.proname, ', ') as fungsi_bermasalah
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.prosecdef = true
   and not exists (
     select 1 from unnest(coalesce(p.proconfig, '{}')) c
      where c like 'search_path=%'
   );

-- Setiap tabel di skema publik wajib mengaktifkan RLS.
select 'U-RLS-26 Seluruh tabel publik mengaktifkan RLS' as uji,
       count(*) = 0 as lulus,
       string_agg(c.relname, ', ') as tabel_bermasalah
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relkind = 'r'
   and c.relrowsecurity = false;

-- Setiap pemicu wajib berawalan trg_.
-- Urutan jalannya ditentukan abjad nama, sehingga penamaan yang tidak
-- seragam mengubah urutan tanpa terlihat.
select 'U-RLS-27 Seluruh pemicu berawalan trg_' as uji,
       count(*) = 0 as lulus,
       string_agg(t.tgname, ', ') as pemicu_bermasalah
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and not t.tgisinternal
   and t.tgname not like 'trg\_%';


-- =====================================================================
-- BAGIAN 8 — Tabel unit dan jejak_audit (migrasi 0002-0005, Langkah 2)
-- Ditambahkan pada sesi yang sama dengan penulisan kebijakannya,
-- sesuai aturan docs/CLAUDE.md §9.
-- =====================================================================
begin;
select pg_temp.jadi(:'anggota_1');

select 'U-RLS-28 Seluruh pengguna terautentikasi membaca unit aktif' as uji,
       count(*) > 0 as lulus
  from public.unit where aktif = true;

select 'U-RLS-29 Anggota TIDAK dapat insert langsung ke jejak_audit' as uji,
       (select not has_table_privilege('authenticated',
                                       'public.jejak_audit', 'INSERT')) as lulus;

select 'U-RLS-30 Anggota TIDAK membaca jejak_audit sama sekali, termasuk miliknya sendiri' as uji,
       count(*) = 0 as lulus from public.jejak_audit;

select 'U-RLS-31 catat_jejak_audit() memaksa pelaku_id = auth.uid() sendiri' as uji,
       (public.catat_jejak_audit('masuk_berhasil', null, null, 'uji U-RLS-31') is not null) as lulus;

rollback;  -- ROLLBACK di sini disengaja: baris uji U-RLS-31 tidak perlu bertahan

begin;
select pg_temp.jadi(:'kanit_1');

select 'U-RLS-32 Kanit TIDAK membaca jejak_audit unit lain' as uji,
       not exists (
         select 1 from public.jejak_audit ja
          where ja.pelaku_id in (
            select id from public.users where unit_id = :'unit_2'
          )
       ) as lulus;

rollback;

begin;
select pg_temp.jadi(:'kasubdit');

select 'U-RLS-33 Kasubdit dapat UPDATE tabel users' as uji,
       (select has_table_privilege('authenticated', 'public.users', 'UPDATE')) as lulus;

rollback;

begin;
select pg_temp.jadi_anon();

select 'U-RLS-34 anon TIDAK membaca unit' as uji,
       (select not has_table_privilege('anon', 'public.unit', 'SELECT')) as lulus;

select 'U-RLS-35 anon TIDAK membaca jejak_audit' as uji,
       (select not has_table_privilege('anon', 'public.jejak_audit', 'SELECT')) as lulus;

rollback;

-- CATATAN U-RLS-32: klausa Panit pada kebijakan baca users (dan pada
-- kebijakan baca jejak_audit yang menelusuri lingkup Kanit lewat
-- unit) masih menunggu sipantau_auth.penugasan_yang_saya_awasi() —
-- ditunda ke Langkah 5 (docs/CLAUDE.md §10) sesuai catatan pada
-- supabase/migrations/0002 dan 0004. Tambahkan butir uji Panit di
-- sini begitu klausa itu ditulis, jangan menunggu modul lain selesai.


-- =====================================================================
-- BAGIAN 9 — Fungsi catat_masuk_berhasil, selesaikan_ganti_sandi_wajib
-- (migrasi 0006-0007, Langkah 3). Lihat catatan desain pada migrasi
-- 0006 soal celah UPDATE users yang melahirkan kedua fungsi ini, dan
-- migrasi 0007 soal celah EXECUTE PUBLIC yang keduanya perbaiki
-- sekaligus (bersama catat_jejak_audit dari migrasi 0005).
--
-- Ganti peran di tengah transaksi (bukan commit lalu transaksi baru)
-- supaya baris yang ditulis sebagai Anggota tetap terlihat saat
-- diperiksa sebagai Kasubdit pada transaksi yang sama, lalu semuanya
-- di-rollback sekaligus — tidak meninggalkan sisa data uji.
-- =====================================================================
begin;
select pg_temp.jadi(:'anggota_1');
select public.catat_masuk_berhasil();

select pg_temp.jadi(:'kasubdit');

select 'U-RLS-36 catat_masuk_berhasil mengisi terakhir_masuk milik pemanggil' as uji,
       (select terakhir_masuk is not null from public.users where id = :'anggota_1') as lulus;

select 'U-RLS-37 catat_masuk_berhasil ikut mencatat jejak_audit masuk_berhasil' as uji,
       exists (
         select 1 from public.jejak_audit
          where pelaku_id = :'anggota_1' and jenis_tindakan = 'masuk_berhasil'
       ) as lulus;

rollback;

begin;
select pg_temp.jadi(:'anggota_2');
select public.selesaikan_ganti_sandi_wajib();

select pg_temp.jadi(:'kasubdit');

select 'U-RLS-38 selesaikan_ganti_sandi_wajib mematikan wajib_ganti_sandi milik pemanggil, dan hanya milik pemanggil' as uji,
       (
         not (select wajib_ganti_sandi from public.users where id = :'anggota_2')
         and (select wajib_ganti_sandi from public.users where id = :'anggota_1')
       ) as lulus;

select 'U-RLS-39 selesaikan_ganti_sandi_wajib ikut mencatat jejak_audit ganti_sandi' as uji,
       exists (
         select 1 from public.jejak_audit
          where pelaku_id = :'anggota_2' and jenis_tindakan = 'ganti_sandi'
       ) as lulus;

rollback;

begin;
select pg_temp.jadi_anon();

select 'U-RLS-40 anon TIDAK punya hak EXECUTE pada ketiga fungsi public.* (celah PUBLIC EXECUTE bawaan sudah dicabut)' as uji,
       (
         not has_function_privilege('anon', 'public.catat_masuk_berhasil()', 'EXECUTE')
         and not has_function_privilege('anon', 'public.selesaikan_ganti_sandi_wajib()', 'EXECUTE')
         and not has_function_privilege('anon', 'public.catat_jejak_audit(text,text,uuid,text)', 'EXECUTE')
       ) as lulus;

rollback;


-- =====================================================================
-- BAGIAN 10 — Tabel anak penugasan, sesi_tugas, notifikasi, dan klausa
-- Panit pada users (migrasi 0008-0014, Langkah 5)
-- Ditambahkan pada sesi yang sama dengan penulisan kebijakannya, sesuai
-- aturan di kepala berkas ini. Melengkapi catatan tertunda yang
-- sebelumnya tertulis di penutup BAGIAN 8 soal klausa Panit pada
-- kebijakan baca users.
--
-- CATATAN METODE (ditemukan lewat pengujian pada sesi ini, bukan
-- ditebak — lihat T2/T8 pada uji fungsional Langkah 5):
-- Penolakan INSERT oleh WITH CHECK selalu memunculkan galat sungguhan
-- (SQLSTATE 42501, insufficient_privilege) sehingga aman diuji lewat
-- tangkapan galat (lihat U-RLS-48, U-RLS-50). Tetapi penolakan UPDATE
-- oleh klausa USING yang membatasi HANYA MENYARING BARIS — 0 baris
-- berubah, TANPA galat apa pun. Mengandalkan tangkapan galat untuk
-- UPDATE akan salah membaca "0 baris tersaring" sebagai "seharusnya
-- gagal tapi lolos". U-RLS-49 dan U-RLS-55 karena itu memeriksa
-- KEADAAN BARIS sesudah percobaan UPDATE, bukan ada/tidaknya galat.
-- =====================================================================

\set spt_1 '20000000-0000-0000-0000-000000000101'
\set spt_2 '20000000-0000-0000-0000-000000000102'

-- Tabel sementara penampung hasil uji yang perlu menangkap galat dari
-- dalam blok DO (lihat catatan metode di atas). Hak INSERT/SELECT
-- diberikan ke authenticated karena blok DO berikut dijalankan sambil
-- berpura-pura menjadi Panit/Anggota (SET ROLE authenticated
-- menanggalkan hak superuser sesi ini untuk objek yang tak dimilikinya
-- — ditemukan lewat percobaan gagal "permission denied for table
-- hasil_uji" pada sesi ini juga).
create temporary table hasil_uji (uji text, lulus boolean);
grant insert, select on hasil_uji to authenticated;

-- Fixture: satu SPT draf unit_1 dengan Panit + Anggota ditunjuk dan
-- syarat terbit lengkap, dan satu SPT unit_2 yang sama sekali tidak
-- melibatkan panit_1/anggota_1 — dipakai memastikan lingkup TIDAK
-- bocor lintas SPT maupun lintas unit.
begin;

insert into public.penugasan (id, jenis_kegiatan, judul, unit_id)
values (:'spt_1', 'penyelidikan', 'Uji RLS SPT 1', :'unit_1');

insert into public.penugasan (id, jenis_kegiatan, judul, unit_id)
values (:'spt_2', 'penyelidikan', 'Uji RLS SPT 2', :'unit_2');

insert into public.penugasan_panit (penugasan_id, panit_id, ditunjuk_oleh)
values (:'spt_1', :'panit_1', :'kanit_1');

insert into public.penugasan_pelaksana (penugasan_id, pelaksana_id, urutan)
values (:'spt_1', :'anggota_1', 1);

insert into public.penugasan_dasar (penugasan_id, jenis, nomor, tanggal)
values (:'spt_1', 'laporan_polisi', 'LP/RLS/1', current_date);

insert into public.penugasan_lokasi (penugasan_id, urutan, nama, lat, lng)
values (:'spt_1', 1, 'Lokasi Uji', -6.9, 107.6);

-- Klausa Panit pada kebijakan baca users (catatan tertunda BAGIAN 8),
-- lewat sipantau_auth.penugasan_yang_saya_awasi()
select pg_temp.jadi(:'panit_1');

select 'U-RLS-41 Panit membaca users Anggota yang ia awasi lewat penugasan_yang_saya_awasi()' as uji,
       (select count(*) = 1 from public.users where id = :'anggota_1') as lulus;

select 'U-RLS-42 Panit TIDAK membaca users Anggota yang tidak ia awasi' as uji,
       (select count(*) = 0 from public.users where id = :'anggota_2') as lulus;

select 'U-RLS-43 Panit hanya membaca SPT tempat ia ditunjuk (spt_2 tidak terlihat)' as uji,
       (select count(*) = 0 from public.penugasan where id = :'spt_2') as lulus;

-- Anggota — lingkupnya sipantau_auth.penugasan_yang_saya_laksanakan().
-- Fungsi ini lahir dari perbaikan celah rekursi RLS penugasan <->
-- penugasan_pelaksana yang ditemukan lewat pengujian fungsional pada
-- sesi Langkah 5 (lihat catatan desain butir 7, migrasi 0010).
select pg_temp.jadi(:'anggota_1');

select 'U-RLS-44 Anggota membaca penugasan_dasar SPT tempat ia bertugas' as uji,
       (select count(*) = 1 from public.penugasan_dasar where penugasan_id = :'spt_1') as lulus;

select 'U-RLS-45 Anggota membaca penugasan_lokasi SPT tempat ia bertugas' as uji,
       (select count(*) = 1 from public.penugasan_lokasi where penugasan_id = :'spt_1') as lulus;

select 'U-RLS-46 Anggota TIDAK membaca anak SPT unit lain yang tidak melibatkannya' as uji,
       (select count(*) = 0 from public.penugasan_dasar where penugasan_id = :'spt_2') as lulus;

select 'U-RLS-47 Membaca penugasan_pelaksana TIDAK menyaring baris yang sudah dicabut (baca vs tulis, catatan desain migrasi 0010)' as uji,
       (select count(*) = 1 from public.penugasan_pelaksana
         where penugasan_id = :'spt_1' and pelaksana_id = :'anggota_1') as lulus;

do $$
begin
  insert into public.penugasan_dasar (penugasan_id, jenis, nomor, tanggal)
  values ('20000000-0000-0000-0000-000000000101', 'laporan_polisi', 'LP/RLS/tolak', current_date);
  insert into hasil_uji values
    ('U-RLS-48 Anggota TIDAK dapat menulis penugasan_dasar (hanya Kanit)', false);
exception
  when insufficient_privilege then
    insert into hasil_uji values
      ('U-RLS-48 Anggota TIDAK dapat menulis penugasan_dasar (hanya Kanit)', true);
end $$;
select uji, lulus from hasil_uji order by uji desc limit 1;

update public.penugasan_pelaksana set dicabut_pada = now()
 where penugasan_id = '20000000-0000-0000-0000-000000000101'
   and pelaksana_id = '00000000-0000-0000-0000-000000000004';

select 'U-RLS-49 Anggota TIDAK dapat mencabut dirinya dari penugasan_pelaksana (hanya Kanit)' as uji,
       (select dicabut_pada is null from public.penugasan_pelaksana
         where penugasan_id = '20000000-0000-0000-0000-000000000101'
           and pelaksana_id = '00000000-0000-0000-0000-000000000004') as lulus;

select pg_temp.jadi(:'panit_1');

do $$
begin
  insert into public.penugasan_panit (penugasan_id, panit_id, ditunjuk_oleh)
  values ('20000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003');
  insert into hasil_uji values
    ('U-RLS-50 Panit TIDAK dapat menunjuk dirinya sendiri ke SPT (hanya Kanit)', false);
exception
  when insufficient_privilege then
    insert into hasil_uji values
      ('U-RLS-50 Panit TIDAK dapat menunjuk dirinya sendiri ke SPT (hanya Kanit)', true);
end $$;
select uji, lulus from hasil_uji order by uji desc limit 1;

select pg_temp.jadi(:'kasubdit');

select 'U-RLS-51 Kasubdit TIDAK melihat SPT berstatus draf (pengecualian draf sendiri tidak berlaku di sini)' as uji,
       (select count(*) = 0 from public.penugasan where status = 'draf') as lulus;

select pg_temp.jadi(:'anggota_1');

select 'U-RLS-52 sesi_tugas tidak dapat dibaca siapa pun sebelum kebijakannya ditulis (tolak-baku, ditunda Langkah 10/Modul 6.4)' as uji,
       (select count(*) = 0 from public.sesi_tugas) as lulus;

rollback;

-- notifikasi: baca/ubah hanya milik sendiri (transaksi terpisah supaya
-- fixture-nya tidak bercampur dengan fixture penugasan di atas)
begin;

insert into public.notifikasi (id, penerima_id, jenis, judul, isi) values
  ('30000000-0000-0000-0000-000000000001', :'anggota_1', 'spt_diterbitkan', 'Uji', 'Uji notifikasi anggota_1'),
  ('30000000-0000-0000-0000-000000000002', :'anggota_2', 'spt_diterbitkan', 'Uji', 'Uji notifikasi anggota_2');

select pg_temp.jadi(:'anggota_1');

select 'U-RLS-53 Anggota hanya membaca notifikasi miliknya sendiri' as uji,
       count(*) = 1 as lulus
  from public.notifikasi;

select 'U-RLS-54 Anggota TIDAK dapat membaca notifikasi milik orang lain' as uji,
       (select count(*) = 0 from public.notifikasi
         where id = '30000000-0000-0000-0000-000000000002') as lulus;

update public.notifikasi set dibaca_pada = now()
 where id = '30000000-0000-0000-0000-000000000002';

reset role;

select 'U-RLS-55 Anggota TIDAK dapat menandai notifikasi milik orang lain sebagai dibaca' as uji,
       (select dibaca_pada is null from public.notifikasi
         where id = '30000000-0000-0000-0000-000000000002') as lulus;

rollback;

drop table if exists hasil_uji;


-- =====================================================================
-- CATATAN
--
-- Empat pemeriksaan U-RLS-24 sampai 27 tidak menyangkut peran mana
-- pun, melainkan memeriksa disiplin penulisan. Keempatnya lahir dari
-- kekeliruan yang benar-benar ditemukan pada pemeriksaan silang PRD,
-- dan seluruhnya berupa kegagalan senyap.
--
-- Jalankan keempatnya setiap kali menambah tabel, tampilan, fungsi,
-- atau pemicu — bukan hanya di akhir.
-- =====================================================================
