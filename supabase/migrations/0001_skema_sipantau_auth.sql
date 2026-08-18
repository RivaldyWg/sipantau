-- =====================================================================
-- 0001 — Skema sipantau_auth
-- Langkah 2 (docs/CLAUDE.md §10), Langkah 1 pada urutan pengerjaan
-- Addendum 6.1-T Bagian 5.2.
--
-- Hanya skemanya di sini. Empat fungsi bantu ditulis di migrasi 0003,
-- SETELAH tabel unit/users/perangkat_masuk berdiri (migrasi 0002) —
-- Addendum 6.1-T Bagian 5.2 menuliskan fungsi sebelum tabel, tetapi
-- fungsi-fungsi itu membaca tabel `users` dan `perangkat_masuk`.
-- Urutan pembuatan objek SQL sungguhan wajib tabel dulu baru fungsi,
-- jadi urutan di sini sengaja dibalik dari urutan penomoran dokumen —
-- hasil akhirnya sama, hanya urutan pembuatannya yang disesuaikan agar
-- migrasi benar-benar dapat dijalankan berurutan tanpa galat.
-- =====================================================================

-- Skema khusus fungsi bantu kewenangan.
-- JANGAN tambahkan skema ini ke daftar "Exposed schemas" pada API Settings
-- proyek Supabase — lihat Addendum 6.1-T §1.2.
create schema if not exists sipantau_auth;
grant usage on schema sipantau_auth to authenticated;
