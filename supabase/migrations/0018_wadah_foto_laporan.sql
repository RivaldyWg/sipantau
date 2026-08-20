-- =====================================================================
-- 0018 — Kebijakan Storage untuk foto laporan harian
--
-- Sumber: docs/30-modul-6.3-pelaporan.md §5.6 (foto_dokumentasi),
--         Addendum 6.3-T Celah 9 (pembersih foto yatim)
--
-- CATATAN DESAIN
--
-- 1. Wadah `dokumentasi` SUDAH ADA sejak migrasi 0016 (surat SPT).
--    Migrasi ini HANYA menambah kebijakan untuk prefiks baru
--    `laporan/`, tidak membuat wadah baru maupun mengubah pengaturan
--    wadah yang sudah ada.
--
-- 2. Tata nama berkas MENGIKAT dan SUDAH DIASUMSIKAN oleh
--    fn_bersihkan_foto_yatim (migrasi 0017, Bagian H):
--    `laporan/<laporan_id>/<nama berkas>`. Mengubah polanya di sini
--    tanpa menyesuaikan fungsi itu akan membuat pembersih foto yatim
--    berhenti menemukan berkas yang seharusnya disapu, atau — lebih
--    buruk — mulai menyapu berkas yang salah.
--
-- 3. Hak baca mengikuti KP-6.3-57: pelapor sendiri, Panit pengawas,
--    Kanit unit pemilik, Kasubdit — PERSIS lingkup baca
--    laporan_harian. Karena kebijakan Storage tidak dapat memanggil
--    fungsi sipantau_auth.laporan_yang_boleh_saya_baca() secara
--    langsung dengan efisien (fungsi itu SETOF uuid, bukan boolean),
--    kebijakan di bawah menulis ulang logikanya sebagai subquery IN,
--    mengikuti pola yang sama dengan migrasi 0016.
--
-- 4. Unggah: hanya PELAPOR laporan itu sendiri, dan hanya SELAMA
--    laporan belum terkunci (KP-6.3-42: disetujui/ditarik tidak lagi
--    menerima foto baru). Ini kebijakan Storage YANG SAMA PERSIS
--    dengan WITH CHECK pada policy "foto_unggah_oleh_pelapor" di
--    tabel foto_dokumentasi (migrasi 0017) — keduanya harus selalu
--    diubah bersamaan bila syaratnya berubah.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Baca: mengikuti hak baca laporan induk (KP-6.3-57)
-- ---------------------------------------------------------------------
drop policy if exists "foto_laporan_baca_mengikuti_induk" on storage.objects;
create policy "foto_laporan_baca_mengikuti_induk"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'laporan'
  and ((storage.foldername(name))[2])::uuid in (
    select l.id
      from public.laporan_harian l
      join public.penugasan p on p.id = l.penugasan_id
     where l.pelapor_id = (select auth.uid())
        or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
        or (
          (select sipantau_auth.peran_saya()) = 'kanit'
          and p.unit_id = (select sipantau_auth.unit_saya())
        )
        or p.id in (select sipantau_auth.penugasan_yang_saya_awasi())
  )
);

-- ---------------------------------------------------------------------
-- Unggah: hanya pelapor laporan itu sendiri, hanya sebelum terkunci
-- (KP-6.3-42) — cermin persis WITH CHECK pada policy
-- "foto_unggah_oleh_pelapor" (migrasi 0017 Bagian H).
-- ---------------------------------------------------------------------
drop policy if exists "foto_laporan_unggah_oleh_pelapor" on storage.objects;
create policy "foto_laporan_unggah_oleh_pelapor"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'laporan'
  and ((storage.foldername(name))[2])::uuid in (
    select id from public.laporan_harian
     where pelapor_id = (select auth.uid())
       and status_laporan not in ('disetujui', 'ditarik')
  )
);

-- ---------------------------------------------------------------------
-- Hapus: pola sama seperti unggah (KP-6.3-42). Tidak ada kebijakan
-- UPDATE/ganti — berbeda dari surat SPT (migrasi 0016), foto TIDAK
-- pernah digantikan, hanya ditambah atau dihapus. Mengganti isi satu
-- foto akan merusak jejak "foto ini diambil pada waktu X di titik Y"
-- yang justru menjadi alasan tabel ini ada.
-- ---------------------------------------------------------------------
drop policy if exists "foto_laporan_hapus_oleh_pengunggah" on storage.objects;
create policy "foto_laporan_hapus_oleh_pengunggah"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[1] = 'laporan'
  and ((storage.foldername(name))[2])::uuid in (
    select id from public.laporan_harian
     where pelapor_id = (select auth.uid())
       and status_laporan not in ('disetujui', 'ditarik')
  )
);
