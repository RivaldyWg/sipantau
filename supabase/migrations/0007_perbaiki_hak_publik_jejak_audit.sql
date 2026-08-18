-- =====================================================================
-- 0007 — Perbaikan: cabut hak EXECUTE PUBLIC pada catat_jejak_audit
--
-- CELAH DITEMUKAN saat membangun dan menguji Langkah 3 (lihat catatan
-- panjang pada migrasi 0006). Ringkas: `create function` PostgreSQL
-- memberi EXECUTE ke peran PUBLIC secara bawaan, dan skema `public`
-- memberi USAGE ke PUBLIC secara bawaan pula. Migrasi 0005 tidak
-- pernah mencabut ini, sehingga peran `anon` sebenarnya punya hak
-- memanggil public.catat_jejak_audit lewat RPC — bertentangan dengan
-- §5.1 "Peran anon tidak pernah diberi hak apa pun".
--
-- Tidak ada bukti ini pernah tereksploitasi: fungsi tersebut menolak
-- sendiri panggilan tanpa sesi masuk (`auth.uid() is null` ->
-- raise exception). Tetapi itu kebetulan yang menyelamatkan, bukan
-- pertahanan yang disengaja, dan proyek ini sudah menjalankan migrasi
-- 0005 pada Supabase project sungguhan sejak Langkah 2 — migrasi
-- perbaikan terpisah dipakai di sini, bukan mengubah 0005 di tempat,
-- karena 0005 sudah pernah dijalankan (§5.6 migrasi berurutan berarti
-- berkas lama tidak diubah lagi setelah dijalankan).
-- =====================================================================

revoke execute on function public.catat_jejak_audit(text, text, uuid, text) from public;
-- Hak untuk `authenticated` sudah benar sejak 0005, diulang di sini
-- hanya untuk memastikan idempoten bila migrasi ini dijalankan ulang.
grant execute on function public.catat_jejak_audit(text, text, uuid, text) to authenticated;
