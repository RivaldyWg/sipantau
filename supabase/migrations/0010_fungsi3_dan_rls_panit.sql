-- =====================================================================
-- 0010 — Fungsi 3 sipantau_auth, pelengkap RLS users untuk Panit,
--         GRANT + RLS seluruh tabel penugasan
-- Sumber: docs/10-modul-6.1-auth.md §1.2 (Fungsi 3), §9.2 (users,
--         penugasan_panit)
--         docs/20-modul-6.2-penugasan.md Bagian 7 §9.2 (aturan akses
--         penugasan, penugasan_dasar, penugasan_lokasi,
--         penugasan_pelaksana)
--         docs/01-koreksi.md J.2 (daftar GRANT yang berlaku)
--
-- CATATAN DESAIN
--
-- 1. Fungsi 3 BARU BISA dibuat sekarang karena bergantung pada
--    public.penugasan_panit (migrasi 0009). Melengkapi Fungsi 1, 2, 4
--    yang sudah ada sejak migrasi 0003 — lihat catatan desain di sana.
--
-- 2. Kebijakan "users_baca_sesuai_lingkup" (migrasi 0004) DIPERBARUI
--    dengan ALTER POLICY (bukan drop+create, supaya tidak ada jendela
--    waktu tanpa kebijakan sama sekali — PostgreSQL tidak mengenal
--    "CREATE OR REPLACE POLICY") menambahkan klausa Panit sesuai
--    docs/10-modul-6.1-auth.md §9.2: "Panit membaca baris Anggota pada
--    penugasan yang diawasinya". Ini menuntaskan catatan desain
--    migrasi 0004 poin 3 yang eksplisit menandai ini tertunda.
--
-- 3. GRANT mengikuti J.2 persis, bukan Section 9.2 Modul 6.2 yang lebih
--    tua: penugasan, penugasan_dasar, penugasan_lokasi,
--    penugasan_pelaksana, penugasan_panit semuanya diberi
--    select+insert+update (TIDAK delete — BR-30/BR-32, penghapusan
--    lewat fungsi security definer khusus, migrasi 0013).
--
-- 4. Klausa BACA vs TULIS untuk Panit/pelaksana SENGAJA berbeda pada
--    dicabut_pada, mengikuti peringatan eksplisit Addendum 6.2-T
--    Bagian 7: "klausa baca ... mengabaikan dicabut_pada, sedangkan
--    klausa tulis ... memeriksanya. Menyamakan keduanya adalah
--    kesalahan yang paling mungkin terjadi di modul ini." Klausa baca
--    di bawah TIDAK menyertakan "and dicabut_pada is null" sama sekali
--    (BR-30: mereka tetap membaca riwayatnya selamanya); klausa tulis
--    membatasi pada baris yang belum dicabut.
--
-- 5. Klausa Kasubdit pada "penugasan_baca_sesuai_lingkup" WAJIB
--    menyertakan pengecualian draf sesuai Addendum 6.2-T Bagian 7:
--    "status <> 'draf' OR diterbitkan_oleh = uid". Tanpa itu draf
--    Kanit bocor ke Kasubdit sebelum diterbitkan (KP-6.2-54).
--
-- 6. Penulisan pada penugasan_dasar/lokasi/pelaksana/panit dibatasi
--    "Kanit pemilik unit" — diperiksa lewat subquery ke penugasan
--    induknya, BUKAN lewat kolom unit_id langsung (tabel anak tidak
--    memiliki kolom itu).
--
-- 7. REKURSI TAK BERHINGGA DITEMUKAN DAN DIPERBAIKI SAAT PENGUJIAN
--    LOKAL (bukan diperkirakan di atas kertas). Klausa "anggota" pada
--    kebijakan penugasan awalnya membaca penugasan_pelaksana lewat
--    subquery biasa, sementara kebijakan penugasan_pelaksana membaca
--    balik ke penugasan — keduanya saling memicu evaluasi kebijakan
--    tanpa henti. Diputus dengan fungsi security definer baru
--    sipantau_auth.penugasan_yang_saya_laksanakan() (lihat definisinya
--    di bawah, sesaat sebelum kebijakan users), mengikuti pola yang
--    sudah dipakai penugasan_yang_saya_awasi() untuk arah Panit.
--    Rinciannya dijelaskan di komentar tepat di atas fungsi tsb.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fungsi 3 — daftar penugasan yang diawasi, untuk peran Panit
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.penugasan_yang_saya_awasi()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_panit
  where panit_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.penugasan_yang_saya_awasi() to authenticated;

-- ---------------------------------------------------------------------
-- Fungsi tambahan — daftar SPT tempat pengguna jadi pelaksana
--
-- TIDAK ada pada dokumen manapun secara eksplisit sebagai "Fungsi 5"
-- bernomor; ditambahkan di sini untuk memutus REKURSI TAK BERHINGGA
-- yang ditemukan saat pengujian lokal migrasi ini (bukan diperkirakan
-- di atas kertas — ditemukan lewat percobaan sungguhan sesuai
-- docs/CLAUDE.md §12 "jangan menebak, uji").
--
-- Duduk perkaranya: kebijakan SELECT pada penugasan (klausa anggota)
-- awalnya membaca penugasan_pelaksana lewat subquery BIASA (bukan
-- fungsi security definer). Kebijakan SELECT pada penugasan_pelaksana
-- ("mengikuti induk") membaca balik ke penugasan. PostgreSQL
-- mengevaluasi RLS pada setiap akses tabel apa adanya, termasuk saat
-- tabel itu diakses dari dalam kebijakan tabel lain — akibatnya kedua
-- kebijakan saling memanggil tanpa henti: "infinite recursion detected
-- in policy for relation penugasan".
--
-- Pola yang sudah dipakai proyek ini untuk sipantau_auth.
-- penugasan_yang_saya_awasi() (memutus arah Panit->penugasan_panit)
-- diterapkan ulang di sini untuk arah Anggota->penugasan_pelaksana:
-- fungsi SECURITY DEFINER berjalan dengan hak pemiliknya (pemilik
-- tabel), yang MELEWATI RLS sepenuhnya, sehingga panggilan dari dalam
-- kebijakan penugasan tidak lagi memicu evaluasi kebijakan
-- penugasan_pelaksana sama sekali.
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.penugasan_yang_saya_laksanakan()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_pelaksana
  where pelaksana_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.penugasan_yang_saya_laksanakan() to authenticated;

-- ---------------------------------------------------------------------
-- users — pelengkap klausa Panit
-- ---------------------------------------------------------------------
alter policy "users_baca_sesuai_lingkup"
on public.users
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  or (
    (select sipantau_auth.peran_saya()) = 'panit'
    and peran = 'anggota'
    and id in (
      select pp.pelaksana_id
      from public.penugasan_pelaksana pp
      where pp.penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
    )
  )
);

-- ---------------------------------------------------------------------
-- penugasan
-- ---------------------------------------------------------------------
alter table public.penugasan enable row level security;
grant select, insert, update on public.penugasan to authenticated;

create policy "penugasan_baca_sesuai_lingkup"
on public.penugasan
for select
to authenticated
using (
  (
    (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
    and (status <> 'draf' or diterbitkan_oleh = (select auth.uid()))
  )
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  or (
    (select sipantau_auth.peran_saya()) = 'panit'
    and id in (select sipantau_auth.penugasan_yang_saya_awasi())
  )
  or (
    (select sipantau_auth.peran_saya()) = 'anggota'
    and id in (select sipantau_auth.penugasan_yang_saya_laksanakan())
  )
);

create policy "penugasan_tulis_oleh_kanit_unit"
on public.penugasan
for insert
to authenticated
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and unit_id = (select sipantau_auth.unit_saya())
);

create policy "penugasan_sunting_oleh_kanit_unit"
on public.penugasan
for update
to authenticated
using (
  (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  -- Kasubdit hanya untuk pembukaan kembali (KP-6.2-50); pembatasan
  -- kolom mana yang boleh diubah tidak dapat ditegakkan RLS baris,
  -- diserahkan ke lapisan aplikasi/Server Action sesuai catatan
  -- Addendum 6.2-T Bagian 7 tabel penugasan kolom "Tulis".
  or (select sipantau_auth.peran_saya()) = 'kasubdit'
)
with check (
  (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  or (select sipantau_auth.peran_saya()) = 'kasubdit'
);

-- ---------------------------------------------------------------------
-- penugasan_dasar
-- ---------------------------------------------------------------------
alter table public.penugasan_dasar enable row level security;
-- delete DIBERIKAN (beda dari penugasan_pelaksana/penugasan_panit
-- yang hanya soft-delete via dicabut_pada): baris penugasan_dasar
-- BOLEH dihapus fisik, dijaga trg_jaga_dasar_terakhir (migrasi 0012)
-- yang menolak penghapusan baris terakhir. Ditemukan wajib saat
-- pengujian lokal — tanpa grant ini DELETE ditolak di lapisan hak
-- akses SEBELUM trigger sempat dievaluasi (permission denied, bukan
-- DASAR_PENUGASAN_TERAKHIR), sehingga KP-6.2-14 "menambah/menghapus
-- baris" tidak akan pernah berjalan.
grant select, insert, update, delete on public.penugasan_dasar to authenticated;

create policy "penugasan_dasar_baca_mengikuti_induk"
on public.penugasan_dasar
for select
to authenticated
using (
  penugasan_id in (select id from public.penugasan)
);

create policy "penugasan_dasar_tulis_oleh_kanit_pemilik"
on public.penugasan_dasar
for all
to authenticated
using (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
      and status not in ('selesai', 'dibatalkan')
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
)
with check (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
      and status not in ('selesai', 'dibatalkan')
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
);

-- ---------------------------------------------------------------------
-- penugasan_lokasi
-- ---------------------------------------------------------------------
alter table public.penugasan_lokasi enable row level security;
-- delete DIBERIKAN, sama seperti penugasan_dasar di atas — dijaga
-- trg_jaga_lokasi_terakhir (migrasi 0012).
grant select, insert, update, delete on public.penugasan_lokasi to authenticated;

create policy "penugasan_lokasi_baca_mengikuti_induk"
on public.penugasan_lokasi
for select
to authenticated
using (
  penugasan_id in (select id from public.penugasan)
);

create policy "penugasan_lokasi_tulis_oleh_kanit_pemilik"
on public.penugasan_lokasi
for all
to authenticated
using (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
      and status not in ('selesai', 'dibatalkan')
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
)
with check (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
      and status not in ('selesai', 'dibatalkan')
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
);

-- ---------------------------------------------------------------------
-- penugasan_pelaksana
-- Baca: mengikuti induk PLUS setiap orang selalu membaca barisnya
-- sendiri (§9.2 Bagian 7). Tulis: hanya Kanit pemilik unit, kecuali
-- kolom dibaca_pada yang ditulis pemiliknya sendiri lewat fungsi
-- catat_tanda_terima (migrasi 0013), bukan lewat UPDATE langsung.
-- ---------------------------------------------------------------------
alter table public.penugasan_pelaksana enable row level security;
grant select, insert, update on public.penugasan_pelaksana to authenticated;

create policy "penugasan_pelaksana_baca_mengikuti_induk_atau_milik_sendiri"
on public.penugasan_pelaksana
for select
to authenticated
using (
  pelaksana_id = (select auth.uid())
  or penugasan_id in (select id from public.penugasan)
);

create policy "penugasan_pelaksana_tulis_oleh_kanit_pemilik"
on public.penugasan_pelaksana
for all
to authenticated
using (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
      and status not in ('selesai', 'dibatalkan')
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
)
with check (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
      and status not in ('selesai', 'dibatalkan')
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
);

-- ---------------------------------------------------------------------
-- penugasan_panit
-- ---------------------------------------------------------------------
alter table public.penugasan_panit enable row level security;
grant select, insert, update on public.penugasan_panit to authenticated;

create policy "penugasan_panit_baca_sesuai_lingkup"
on public.penugasan_panit
for select
to authenticated
using (
  panit_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
      where unit_id = (select sipantau_auth.unit_saya())
    )
  )
);

create policy "penugasan_panit_tulis_oleh_kanit_pemilik"
on public.penugasan_panit
for all
to authenticated
using (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
)
with check (
  penugasan_id in (
    select id from public.penugasan
    where unit_id = (select sipantau_auth.unit_saya())
  )
  and (select sipantau_auth.peran_saya()) = 'kanit'
);
