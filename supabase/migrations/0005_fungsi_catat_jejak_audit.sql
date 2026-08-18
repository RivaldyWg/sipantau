-- =====================================================================
-- 0005 — Fungsi public.catat_jejak_audit
--
-- Migrasi 0004 sengaja TIDAK memberi hak insert pada jejak_audit ke
-- peran authenticated, mengikuti daftar GRANT koreksi J.2. Tetapi
-- Addendum 6.1-T §3.3 menuliskan kode klien yang memanggil
-- `catatJejakAudit(...)` langsung setelah tindakan seperti pergeseran
-- perangkat. Fungsi ini adalah jalur yang dimaksud: dipanggil lewat
-- RPC (supabase.rpc('catat_jejak_audit', {...})), bukan lewat insert
-- tabel langsung.
--
-- Aman diberikan ke seluruh peran authenticated karena pelaku_id
-- dan peran_pelaku SELALU diambil dari auth.uid() dan tabel users,
-- tidak pernah dari parameter kiriman klien — seorang pengguna hanya
-- dapat mencatat baris yang melekat pada dirinya sendiri sebagai
-- pelaku, tidak dapat menyamar sebagai orang lain.
-- =====================================================================

create or replace function public.catat_jejak_audit(
  p_jenis_tindakan text,
  p_sasaran_tabel  text default null,
  p_sasaran_id     uuid default null,
  p_keterangan     text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pelaku_id    uuid := (select auth.uid());
  v_peran_pelaku text;
  v_id           uuid;
begin
  if v_pelaku_id is null then
    raise exception 'TIDAK_MASUK: catat_jejak_audit dipanggil tanpa sesi masuk';
  end if;

  select peran::text into v_peran_pelaku
    from public.users
   where id = v_pelaku_id;

  if v_peran_pelaku is null then
    raise exception 'AKUN_TIDAK_DITEMUKAN: % tidak ada pada public.users', v_pelaku_id;
  end if;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id, keterangan)
  values
    (v_pelaku_id, v_peran_pelaku, p_jenis_tindakan, p_sasaran_tabel, p_sasaran_id, p_keterangan)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.catat_jejak_audit(text, text, uuid, text) to authenticated;

comment on function public.catat_jejak_audit is
  'Satu-satunya jalur penyisipan jejak_audit dari sisi klien. pelaku_id dan peran_pelaku selalu dari auth.uid(), tidak pernah dari parameter.';
