-- =====================================================================
-- 0016 — Wadah penyimpanan berkas surat perintah tugas
--
-- Sumber: docs/20-modul-6.2-penugasan.md §6.2.5 ("Berkas surat
--         diunggah dari halaman rincian"), BR-25/BR-28 (SPT tidak
--         dapat selesai sebelum pindaian dilampirkan),
--         KP-6.2-45, jenis tindakan audit `unggah_surat_spt`
--
-- CATATAN DESAIN
--
-- 1. Wadah `dokumentasi` semestinya sudah dibuat pada Langkah 1 lewat
--    papan kendali Supabase. Berkas ini membuatnya lewat migrasi
--    supaya keadaannya tidak bergantung pada ingatan siapa pun, dan
--    ditulis idempoten (`on conflict do nothing`) supaya aman
--    dijalankan meski wadahnya sudah ada.
--
-- 2. Wadah TERTUTUP (public = false). Berkas surat perintah memuat
--    nama penyelidik, sasaran, dan uraian tugas — tidak boleh terbaca
--    lewat tautan tebak-tebakan. Halaman membacanya lewat tautan
--    bermasa berlaku pendek (createSignedUrl), bukan tautan publik.
--
-- 3. Tata nama berkas MENGIKAT: `spt/<penugasan_id>/<nama berkas>`.
--    Segmen kedua dipakai seluruh kebijakan di bawah untuk menautkan
--    berkas ke barisnya. Mengubah polanya berarti mengubah kelima
--    kebijakan sekaligus.
--
-- 4. Hak baca sengaja TIDAK disamakan dengan hak baca baris
--    `penugasan`. Ia lebih longgar sedikit: siapa pun yang boleh
--    membaca baris SPT-nya boleh membaca suratnya. Itu memang
--    dikehendaki — surat perintah adalah dokumen yang ditujukan
--    kepada pelaksananya sendiri.
--
-- 5. Penggantian berkas (6.2.6 "Berkas surat diunggah dua kali:
--    berkas terakhir menggantikan yang sebelumnya") ditegakkan lewat
--    hak `update` dan `delete` bagi Kanit pemilik, bukan lewat
--    penamaan berkas yang selalu baru.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dokumentasi',
  'dokumentasi',
  false,
  10485760,                                   -- 10 MB per berkas
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Baca: mengikuti hak baca baris penugasan induknya
-- ---------------------------------------------------------------------
drop policy if exists "surat_spt_baca_mengikuti_induk" on storage.objects;
create policy "surat_spt_baca_mengikuti_induk"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'spt'
  and ((storage.foldername(name))[2])::uuid in (select id from public.penugasan)
);

-- ---------------------------------------------------------------------
-- Unggah, ganti, hapus: hanya Kanit pemilik unit, dan hanya selama
-- SPT belum selesai/dibatalkan (KP-6.2-43: keduanya mengunci semua)
-- ---------------------------------------------------------------------
drop policy if exists "surat_spt_unggah_oleh_kanit_pemilik" on storage.objects;
create policy "surat_spt_unggah_oleh_kanit_pemilik"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'spt'
  and (select sipantau_auth.peran_saya()) = 'kanit'
  and ((storage.foldername(name))[2])::uuid in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
       and status not in ('selesai', 'dibatalkan')
  )
);

drop policy if exists "surat_spt_ganti_oleh_kanit_pemilik" on storage.objects;
create policy "surat_spt_ganti_oleh_kanit_pemilik"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'spt'
  and (select sipantau_auth.peran_saya()) = 'kanit'
  and ((storage.foldername(name))[2])::uuid in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
       and status not in ('selesai', 'dibatalkan')
  )
);

drop policy if exists "surat_spt_hapus_oleh_kanit_pemilik" on storage.objects;
create policy "surat_spt_hapus_oleh_kanit_pemilik"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'spt'
  and (select sipantau_auth.peran_saya()) = 'kanit'
  and ((storage.foldername(name))[2])::uuid in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
       and status not in ('selesai', 'dibatalkan')
  )
);
