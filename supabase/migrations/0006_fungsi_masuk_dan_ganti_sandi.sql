-- =====================================================================
-- 0006 — Fungsi public.catat_masuk_berhasil, public.selesaikan_ganti_sandi_wajib
-- Sumber: docs/10-modul-6.1-auth.md §6.1.3 KP-6.1-05, KP-6.1-09
--
-- CELAH DITEMUKAN SAAT MEMBANGUN LANGKAH 3 — dicatat di sini karena
-- tidak tertulis eksplisit di PRD maupun migrasi sebelumnya.
--
-- Migrasi 0004 hanya membuat SATU kebijakan UPDATE pada public.users:
-- "users_sunting_oleh_kasubdit", yang mensyaratkan
-- sipantau_auth.peran_saya() = 'kasubdit'. Artinya peran selain
-- Kasubdit TIDAK BISA memperbarui baris miliknya sendiri lewat
-- UPDATE langsung dari klien — termasuk dua hal yang justru wajib
-- terjadi pada SETIAP peran menurut §6.1.3:
--   - KP-6.1-05: kolom terakhir_masuk diperbarui setiap kali berhasil
--     masuk, dan satu baris jejak_audit bertipe masuk_berhasil dicatat.
--   - KP-6.1-09: setelah Kata Sandi Sementara berhasil diganti,
--     wajib_ganti_sandi menjadi salah, dan satu baris jejak_audit
--     bertipe ganti_sandi dicatat.
--
-- Ini BUKAN kesalahan pada migrasi 0004 — kebijakan itu memang benar
-- untuk mencegah pengguna biasa mengubah kolom sensitif miliknya
-- sendiri (mis. peran, unit_id, aktif). Yang dibutuhkan bukan
-- kebijakan UPDATE baru yang lebih longgar (RLS tidak dapat membatasi
-- per kolom), melainkan fungsi security definer sempit yang HANYA
-- mengubah satu kolom tertentu, mengikuti pola yang sudah dipakai
-- public.catat_jejak_audit (migrasi 0005): sasaran baris SELALU
-- auth.uid(), tidak pernah parameter kiriman klien, sehingga
-- pemanggil hanya dapat menyentuh barisnya sendiri.
--
-- CELAH KEDUA ditemukan saat menguji migrasi ini secara lokal, dan
-- ternyata SUDAH ADA sejak migrasi 0005 (catat_jejak_audit) —
-- diperbaiki untuk 0005 lewat migrasi 0007 terpisah:
-- PostgreSQL memberi hak EXECUTE ke PUBLIC secara BAWAAN setiap kali
-- `create function` dijalankan, tidak peduli skema. Skema `public`
-- sendiri juga memberi USAGE ke PUBLIC secara bawaan. Gabungan
-- keduanya berarti peran `anon` sebenarnya BISA memanggil fungsi ini
-- lewat RPC — bertentangan langsung dengan §5.1 "Peran anon tidak
-- pernah diberi hak apa pun". Dalam praktiknya panggilan itu akan
-- gagal sendiri karena pemeriksaan `auth.uid() is null` di dalam
-- fungsi, tetapi itu kebetulan yang menyelamatkan, bukan pertahanan
-- yang disengaja — dan §11 memperingatkan persis pola ini: aturan
-- ditegakkan di satu tempat, kebocoran di tempat lain terlewat.
-- Diperbaiki di sini dengan REVOKE eksplisit dari PUBLIC sebelum
-- GRANT ke authenticated pada setiap fungsi baru.
-- =====================================================================

create or replace function public.catat_masuk_berhasil()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (select auth.uid());
begin
  if v_id is null then
    raise exception 'TIDAK_MASUK: catat_masuk_berhasil dipanggil tanpa sesi masuk';
  end if;

  update public.users
     set terakhir_masuk = now(),
         diubah_pada    = now()
   where id = v_id;

  if not found then
    raise exception 'AKUN_TIDAK_DITEMUKAN: % tidak ada pada public.users', v_id;
  end if;

  perform public.catat_jejak_audit('masuk_berhasil');
end;
$$;

revoke execute on function public.catat_masuk_berhasil() from public;
grant execute on function public.catat_masuk_berhasil() to authenticated;

comment on function public.catat_masuk_berhasil is
  'Dipanggil sekali segera setelah supabase.auth.signInWithPassword berhasil dan akun terbukti aktif (KP-6.1-05). Menyasar baris auth.uid() sendiri saja.';

-- ---------------------------------------------------------------------

create or replace function public.selesaikan_ganti_sandi_wajib()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (select auth.uid());
begin
  if v_id is null then
    raise exception 'TIDAK_MASUK: selesaikan_ganti_sandi_wajib dipanggil tanpa sesi masuk';
  end if;

  update public.users
     set wajib_ganti_sandi = false,
         diubah_pada       = now()
   where id = v_id;

  if not found then
    raise exception 'AKUN_TIDAK_DITEMUKAN: % tidak ada pada public.users', v_id;
  end if;

  perform public.catat_jejak_audit('ganti_sandi');
end;
$$;

revoke execute on function public.selesaikan_ganti_sandi_wajib() from public;
grant execute on function public.selesaikan_ganti_sandi_wajib() to authenticated;

comment on function public.selesaikan_ganti_sandi_wajib is
  'Dipanggil sekali segera setelah supabase.auth.updateUser({password}) berhasil pada alur Kata Sandi Sementara (KP-6.1-09). Menyasar baris auth.uid() sendiri saja. Kata sandi itu sendiri tidak pernah jadi parameter — hanya mengubah wajib_ganti_sandi.';
