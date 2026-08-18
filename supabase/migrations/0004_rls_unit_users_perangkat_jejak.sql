-- =====================================================================
-- 0004 — Aturan akses baris: unit, users, perangkat_masuk, jejak_audit
-- Sumber: docs/10-modul-6.1-auth.md §9.2 [FINAL] untuk Modul 6.1
--         docs/01-koreksi.md J.2 (daftar GRANT yang berlaku, menang
--         atas Section 9.2 bila berbeda)
--
-- CATATAN DESAIN — dibaca sebelum mengubah berkas ini
--
-- 1. GRANT mengikuti J.2 persis: users (select, update — TANPA insert,
--    akun dibuat lewat Fungsi Tepi buat-akun dengan service_role).
--    unit (select saja — pengelolaan unit tidak lewat klien untuk
--    saat ini). jejak_audit (select saja — penyisipan lewat fungsi
--    security definer, lihat migrasi 0005). perangkat_masuk TIDAK
--    diberi hak apa pun sama sekali, termasuk select — sudah diuji
--    lebih dulu pada supabase/tests/rls.sql U-RLS-18.
--
-- 2. KONTRADIKSI YANG PERLU DILAPORKAN, BUKAN DITEBAK: Addendum 6.1-T
--    §3.3 menuliskan kode klien yang memanggil langsung
--    `supabase.from('perangkat_masuk').upsert(...)`. Itu mengasumsikan
--    klien punya hak insert/update pada tabel ini. Koreksi J.2 (yang
--    menang atas modul) justru menegaskan perangkat_masuk "tidak
--    diberi hak apa pun ... penulisannya seluruhnya lewat Fungsi Tepi
--    dan pemicu". Migrasi ini mengikuti J.2. Kode contoh pada Addendum
--    6.1-T akan perlu ditulis ulang sebagai pemanggilan RPC saat
--    Langkah 3 (pendaftaran perangkat) dikerjakan — dicatat di sini
--    supaya tidak terlewat, bukan diputuskan sekarang.
--
-- 3. Klausa Panit pada kebijakan baca users DITUNDA. Section 9.2
--    menyebut "Panit membaca baris Anggota pada penugasan yang
--    diawasinya", yang bergantung pada sipantau_auth.
--    penugasan_yang_saya_awasi() — fungsi itu sendiri ditunda ke
--    Langkah 5 (lihat migrasi 0002 dan 0003). Sampai saat itu, Panit
--    hanya dapat membaca barisnya sendiri lewat klausa "id = auth.uid()".
--    Kebijakan ini WAJIB diperbarui (create or replace policy) saat
--    Langkah 5 dikerjakan, jangan sampai terlewat.
--
-- 4. Kebijakan UPDATE pada users HANYA mencakup Kasubdit menulis
--    seluruh kolom, sesuai bagian Section 9.2 yang tidak ambigu.
--    TIDAK diimplementasikan di sini: pembatasan kolom untuk Kanit/
--    Pemeliharaan (hanya wajib_ganti_sandi, sasaran sesuai BR-15) dan
--    hak swasunting wajib_ganti_sandi milik pengguna sendiri —
--    keduanya baru relevan saat Fungsi Tepi reset-kata-sandi dan alur
--    Penggantian Kata Sandi Wajib dibangun (Langkah 3, bukan Langkah 2).
--
--    SATU KEJANGGALAN PRD YANG PERLU DILAPORKAN: Section 9.2 modul 6.1
--    mengelompokkan "Kanit dan Akun Pemeliharaan" sebagai pihak yang
--    boleh menulis wajib_ganti_sandi "pada sasaran yang diizinkan
--    BR-15" — tetapi BR-15 sendiri hanya menyebut wewenang Kasubdit
--    dan Kanit, TIDAK menyebut Akun Pemeliharaan sama sekali. Sementara
--    itu AM-6.1-15 dan EC-6.1-09 menyatakan Akun Pemeliharaan justru
--    ADA terutama untuk memulihkan kata sandi Kasubdit yang lupa —
--    sebuah wewenang yang tidak tercakup rumusan BR-15 apa pun.
--    Ini perlu diputuskan pemilik produk sebelum Fungsi Tepi
--    reset-kata-sandi ditulis; tidak menahan Langkah 2.
-- =====================================================================

-- ---------------------------------------------------------------------
-- unit
-- ---------------------------------------------------------------------
alter table public.unit enable row level security;
grant select on public.unit to authenticated;

create policy "unit_baca_aktif"
on public.unit
for select
to authenticated
using (aktif = true);

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
alter table public.users enable row level security;
grant select, update on public.users to authenticated;

create policy "users_baca_sesuai_lingkup"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  -- Klausa Panit menyusul Langkah 5 — lihat catatan desain butir 3.
);

create policy "users_sunting_oleh_kasubdit"
on public.users
for update
to authenticated
using ((select sipantau_auth.peran_saya()) = 'kasubdit')
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');

-- ---------------------------------------------------------------------
-- perangkat_masuk
-- TIDAK ada GRANT sama sekali (lihat catatan desain butir 1 dan 2).
-- RLS tetap diaktifkan sebagai lapis pertahanan kedua: bahkan bila
-- suatu saat GRANT keliru ditambahkan, tidak ada kebijakan yang
-- mengizinkan barisnya terbaca atau tertulis oleh peran authenticated.
-- ---------------------------------------------------------------------
alter table public.perangkat_masuk enable row level security;
-- Sengaja tanpa satu pun "create policy": penolakan adalah bawaan.

-- ---------------------------------------------------------------------
-- jejak_audit
-- ---------------------------------------------------------------------
alter table public.jejak_audit enable row level security;
grant select on public.jejak_audit to authenticated;
-- Sengaja tanpa grant insert/update/delete: penyisipan hanya lewat
-- fungsi security definer (migrasi 0005). BR-22: tidak ada UPDATE/
-- DELETE dari peran mana pun, jadi tidak ada kebijakan untuk keduanya.

create policy "jejak_audit_baca_sesuai_lingkup"
on public.jejak_audit
for select
to authenticated
using (
  (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and (
      pelaku_id in (
        select id from public.users where unit_id = (select sipantau_auth.unit_saya())
      )
      -- "sasaran" bersifat polimorfik (sasaran_tabel + sasaran_id).
      -- Baru dapat diselesaikan secara umum untuk sasaran_tabel='users';
      -- tabel sasaran lain (mis. penugasan, laporan_harian) belum
      -- dapat ditelusuri unitnya lewat kueri tunggal seperti ini, dan
      -- perlu fungsi bantu tersendiri bila kelak dibutuhkan.
      or (
        sasaran_tabel = 'users'
        and sasaran_id in (
          select id from public.users where unit_id = (select sipantau_auth.unit_saya())
        )
      )
    )
  )
);
