-- =====================================================================
-- 0014 — Tampilan penugasan_tampil, pg_cron, pekerjaan berjadwal
-- Sumber: Addendum 6.2-T Bagian 1 (pg_cron), Bagian 7 (penanda Lewat
--         Batas)
--         docs/01-koreksi.md J.3/W (zona waktu Asia/Jakarta WAJIB —
--         bentuk yang berlaku, menggantikan Addendum 6.2-T asli),
--         J.7 (hak baca tampilan wajib eksplisit)
--
-- CATATAN DESAIN
--
-- 1. penanda "lewat_batas" dan "hari_terlampaui" DIHITUNG SAAT KUERI,
--    tidak disimpan — Addendum 6.2-T Bagian 7.1: kolom tersimpan akan
--    diam-diam salah bila pekerjaan berjadwal berhenti tanpa jejak
--    (lihat Bagian 1.6 addendum tsb).
--
-- 2. Bentuk `current_date < ...` DIGANTI `(now() at time zone
--    'Asia/Jakarta')::date` di SELURUH tempat — mengikuti koreksi
--    J.3/W yang MENGGANTIKAN bentuk asli Addendum 6.2-T Bagian 1.5 dan
--    7.2 (keduanya sudah ditemukan melanggar BR-64 pada pemeriksaan
--    silang v0.6). docs/CLAUDE.md §5.5 menegaskan hal yang sama.
--
-- 3. security_invoker = on WAJIB pada tampilan — tanpa itu seluruh RLS
--    tabel penugasan terlewati (kebocoran draf lintas unit). Koreksi
--    J.7 juga menegaskan hak SELECT tampilan wajib diberikan eksplisit
--    (bug baru yang ditemukan terpisah dari masalah security_invoker).
--
-- 4. kesehatan_penjadwal (Addendum 6.2-T Bagian 1.6) SENGAJA TIDAK
--    dibuat di sini. Koreksi J.7 mengubahnya dari tampilan (view)
--    menjadi fungsi security definer, dan menyatakan "Bentuk akhirnya
--    ditetapkan saat Modul 6.5 digali, karena di sanalah ia
--    ditampilkan." Ditunda ke Langkah 9 (dashboard).
--
-- 5. Kedua pekerjaan berjadwal butuh ekstensi pg_cron. Ekstensi
--    diaktifkan di sini (bukan di Langkah 1) karena baru sekarang
--    ada pekerjaan yang membutuhkannya — Langkah 1 hanya mengaktifkan
--    PostGIS.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tampilan penugasan_tampil
-- ---------------------------------------------------------------------
create or replace view public.penugasan_tampil
with (security_invoker = on)
as
select p.*,
       (p.tanggal_batas is not null
        and p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
        and p.status in ('baru', 'berjalan', 'bermasalah'))      as lewat_batas,
       ((now() at time zone 'Asia/Jakarta')::date - p.tanggal_batas)
                                                                 as hari_terlampaui
  from public.penugasan p;

grant select on public.penugasan_tampil to authenticated;

comment on view public.penugasan_tampil is
  'penugasan + penanda Lewat Batas dihitung saat kueri (Asia/Jakarta). security_invoker WAJIB (J.7). Addendum 6.2-T Bagian 7, koreksi J.3/W.';

-- ---------------------------------------------------------------------
-- Ekstensi pg_cron — Addendum 6.2-T Bagian 1.3
-- ---------------------------------------------------------------------
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------
-- Pekerjaan 1 — pemberitahuan SPT lewat batas
-- Addendum 6.2-T Bagian 1.5, bentuk WHERE diperbaiki sesuai J.3/W
-- ---------------------------------------------------------------------
create or replace function public.kerja_periksa_lewat_batas()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  n_kirim int := 0;
begin
  with sasaran as (
    select p.id, p.nomor_spt, p.judul, p.tanggal_batas, p.diterbitkan_oleh
      from public.penugasan p
     where p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
       and p.status in ('baru', 'berjalan', 'bermasalah')
       and p.lewat_batas_diberitahukan_pada is null
       and p.diterbitkan_oleh is not null
  ),
  terkirim as (
    insert into public.notifikasi (penerima_id, jenis, penugasan_id, judul, isi)
    select s.diterbitkan_oleh,
           'spt_lewat_batas',
           s.id,
           'Batas waktu penugasan terlampaui',
           s.nomor_spt || ' — ' || s.judul ||
           '. Batas waktu ' || to_char(s.tanggal_batas, 'DD Mon YYYY') ||
           ' sudah terlampaui dan status belum Selesai.'
      from sasaran s
    returning penugasan_id
  )
  update public.penugasan
     set lewat_batas_diberitahukan_pada = now()
   where id in (select penugasan_id from terkirim);

  get diagnostics n_kirim = row_count;
  raise notice 'kerja_periksa_lewat_batas: % pemberitahuan', n_kirim;
end;
$$;

select cron.schedule(
  'periksa-lewat-batas',
  '5 0 * * *',                        -- 00:05 UTC, sekitar 07:05 WIB
  $$ select public.kerja_periksa_lewat_batas() $$
);

-- ---------------------------------------------------------------------
-- Pekerjaan 2 — penjaga keaktifan project
-- Addendum 6.2-T Bagian 1.5, 1.6 — menahan project paket gratis agar
-- tidak dijeda karena tidak aktif >7 hari, yang akan menghentikan
-- SELURUH pekerjaan berjadwal tanpa peringatan apa pun.
-- ---------------------------------------------------------------------
create or replace function public.kerja_jaga_keaktifan()
returns void
language sql
security definer
set search_path = ''
as $$
  select count(*) from public.users where aktif = true;
$$;

select cron.schedule(
  'jaga-keaktifan',
  '0 */6 * * *',                      -- tiap enam jam
  $$ select public.kerja_jaga_keaktifan() $$
);
