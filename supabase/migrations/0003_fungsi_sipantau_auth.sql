-- =====================================================================
-- 0003 — Fungsi bantu sipantau_auth
-- Sumber: docs/10-modul-6.1-auth.md, Addendum 6.1-T §1.2 [FINAL]
--
-- Tiga dari empat fungsi. Fungsi 3 (penugasan_yang_saya_awasi, dipakai
-- lingkup Panit) DITUNDA ke migrasi Langkah 5, karena ia membaca
-- public.penugasan_panit yang belum dibuat — lihat catatan desain pada
-- migrasi 0002 poin 5.
--
-- Ketiga fungsi WAJIB security definer + search_path kosong (kalau
-- tidak, kebijakan RLS pada tabel users yang memanggilnya akan
-- memanggil dirinya sendiri dan menghasilkan rekursi tak berhingga —
-- Addendum 6.1-T §1.2, catatan "Tiga hal yang wajib ada").
-- =====================================================================

-- Fungsi 1 — peran pengguna yang sedang masuk
create or replace function sipantau_auth.peran_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select peran::text
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

grant execute on function sipantau_auth.peran_saya() to authenticated;

-- Fungsi 2 — unit pengguna yang sedang masuk
create or replace function sipantau_auth.unit_saya()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select unit_id
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

grant execute on function sipantau_auth.unit_saya() to authenticated;

-- Fungsi 4 — penanda Perangkat Terdaftar
-- (penomoran fungsi mengikuti dokumen aslinya; Fungsi 3 belum ada)
create or replace function sipantau_auth.perangkat_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select penanda_perangkat
  from public.perangkat_masuk
  where user_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.perangkat_saya() to authenticated;
