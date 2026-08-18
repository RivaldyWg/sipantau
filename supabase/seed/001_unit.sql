-- =====================================================================
-- Seed — unit
-- Sumber: docs/10-modul-6.1-auth.md §5.10
--
-- "Data awal. Sampai daftar resmi diterima dari pemilik produk, tabel
-- diisi empat baris sementara: Unit I, Unit II, Unit III, Unit IV.
-- Baris-baris ini ditandai sebagai data sementara pada berkas seed dan
-- wajib diganti sebelum peluncuran." — lihat juga Lampiran A butir A-06.
--
-- JANGAN DIPAKAI DI PRODUKSI TANPA MENGGANTI KEEMPAT NAMA INI DENGAN
-- DAFTAR UNIT RESMI SUBDIT IV.
-- =====================================================================

insert into public.unit (nama, keterangan, urutan) values
  ('Unit I',   'Data sementara — ganti dengan nama resmi (Lampiran A butir A-06)', 1),
  ('Unit II',  'Data sementara — ganti dengan nama resmi (Lampiran A butir A-06)', 2),
  ('Unit III', 'Data sementara — ganti dengan nama resmi (Lampiran A butir A-06)', 3),
  ('Unit IV',  'Data sementara — ganti dengan nama resmi (Lampiran A butir A-06)', 4)
on conflict (nama) do nothing;
