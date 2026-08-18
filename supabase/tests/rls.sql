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
