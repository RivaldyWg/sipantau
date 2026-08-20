# Catatan Kemajuan — Langkah 7 (Modul 6.3 Pelaporan)

Ditulis 20 Agustus 2026. Status: **SELESAI**, cakupan penuh sesuai
kesepakatan dengan pengguna (migrasi lengkap + `laporan_versi` +
Antrean Luring dasar). Ekspor Data Institusi (BR-50) **BELUM
dikerjakan** — lihat penjelasan di bagian bawah.

## Yang sudah dibangun dan TERVERIFIKASI

**Migrasi** (`0017_modul_6_3_pelaporan.sql`, `0018_wadah_foto_laporan.sql`):
- Skema lengkap: `laporan_harian`, `catatan_laporan`, `foto_dokumentasi`
  (minimal, [KERANGKA] sampai Modul 6.7), `laporan_versi`
- PostGIS aktif, perhitungan jarak sungguhan di server
- 8 pemicu, 2 view (`rekap_laporan_tim`, `v_belum_lapor`), RLS lengkap
- Kebijakan Storage untuk foto laporan (prefiks `laporan/`, terpisah
  dari surat SPT yang pakai prefiks `spt/`)
- **Seluruh migrasi 0001–0018 lulus dari database Postgres bersih**,
  diuji ulang di akhir sesi ini sebagai verifikasi final
- **24 uji fungsional lulus** sepanjang sesi ini (8 pengiriman laporan
  + 8 siklus hidup/penguncian + verifikasi migrasi berulang), termasuk
  perhitungan jarak PostGIS sungguhan (bukan simulasi)

**3 bug nyata ditemukan dan diperbaiki lewat uji sungguhan** (bukan
tebakan di atas kertas):
1. Indeks non-IMMUTABLE (`direkam_pada::date` di dalam indeks)
2. Urutan kolom `wajib_lapor_harian` vs view yang membacanya
3. **Paling berbahaya**: persetujuan Kanit sempat diam-diam gagal
   tersimpan — `fn_tandai_sunting` menimpa balik `disetujui_oleh` ke
   NULL pada UPDATE yang sama yang seharusnya mengisinya. Diperbaiki
   dengan mendeteksi perpindahan status ke 'disetujui' sebagai
   pengecualian pembekuan kolom.

**Kode aplikasi**:
- `lib/supabase/types.ts` — tipe lengkap Modul 6.3
- `lib/pelaporan/label.ts` — peristilahan, lencana, format
- `lib/pelaporan/antrean-luring.ts` — IndexedDB untuk draf + antrean
  luring (dua object store terpisah, lihat catatan desain di berkas
  itu untuk alasannya)
- `app/(app)/laporan/aksi.ts` — Server Actions (kirim, sunting, tarik,
  setujui, beri catatan, atur kewajiban lapor harian)
- Halaman: `/laporan` (daftar, isi beda per peran), `/laporan/[id]`
  (rincian + catatan + riwayat versi + panel tindakan),
  `/laporan/kirim` (formulir + geolokasi + antrean luring),
  `/laporan/riwayat` (khusus Anggota), `/laporan/belum-lapor` (khusus
  Kanit/Kasubdit)
- `app/(app)/laporan/penyinkron-antrean.tsx` + `layout.tsx` — pengirim
  ulang otomatis Antrean Luring, dipasang di level layout modul
- Tombol "Kirim Laporan" ditambahkan ke halaman rincian SPT (Modul 6.2)
  untuk pelaksana aktif
- `lib/auth/menu.ts` — `cocokAwalan` ditambahkan pada butir Laporan di
  keempat peran, dan dua pola baru di `RUTE_KHUSUS_PERAN`
  (`/laporan/belum-lapor` khusus Kanit/Kasubdit, `/laporan/riwayat`
  khusus Anggota)

**Verifikasi build**: `next build` lulus (19 rute terdaftar termasuk
5 rute baru), `eslint` bersih (1 error nyata soal setState-dalam-effect
ditemukan dan diperbaiki, bukan diabaikan).

## Koreksi dari 01-koreksi.md yang WAJIB diikuti (sudah diterapkan)

Addendum 6.3-T versi asli punya tiga celah yang sudah dikoreksi
`01-koreksi.md` — migrasi 0017 mengikuti versi terkoreksi:

1. `penugasan.ditutup_pada` TIDAK ditambahkan sebagai kolom baru — SUDAH
   ADA sejak migrasi 0008. Pemeriksaan SPT tertutup memakai
   `coalesce(p.ditutup_pada, p.dibatalkan_pada)`.
2. `v_belum_lapor` memakai `security_invoker = ON` (bukan OFF seperti
   draf awal Addendum 6.3-T) dan menyaring `direkam_pada` (bukan
   `dikirim_pada`). Draf awal dengan `off` membocorkan seluruh
   pelaksana belum-lapor lintas unit ke siapa pun yang masuk.
3. Kolom antrean ditulis langsung di `create table`, bukan `ALTER
   TABLE` menyusul.

## Catatan teknis penting

**PostGIS dan search_path kosong.** Seluruh fungsi proyek memakai `set
search_path = ''`. PostGIS terpasang di skema `public`. Setiap
pemanggilan `ST_Distance`/`ST_MakePoint`/`geography` WAJIB dikualifikasi
`public.*` secara eksplisit — tanpa itu galat "type geography does not
exist" muncul walau ekstensinya aktif. Sudah diperbaiki di
`fn_hitung_lokasi_laporan`. **Ingat pola ini untuk Modul 6.4 (GPS,
Langkah 10)** — akan banyak memakai PostGIS juga.

**`sesi_tugas_id` kemungkinan besar akan selalu NULL untuk sementara.**
Tabel `sesi_tugas` belum punya RLS policy (ditunda ke Langkah 10).
`fn_isi_sesi_tugas` tetap berfungsi (security definer melewati RLS),
tapi karena Sesi Tugas belum bisa dibuka dari UI mana pun, kolom ini
akan kosong sampai Langkah 10 selesai. **Bukan bug** — sesuai desain
PRD (KP-6.3-06).

**Draf vs Antrean Luring — dua hal berbeda, jangan disatukan.** Draf
(KP-6.3-11 s/d 15) adalah isian yang BELUM ditekan kirim, tidak pernah
menyentuh basis data. Antrean (BR-45 s/d 48) adalah isian yang SUDAH
ditekan kirim tapi gagal karena jaringan. Keduanya di IndexedDB tapi di
object store terpisah — lihat `lib/pelaporan/antrean-luring.ts`.

## Keputusan desain yang diambil tanpa konfirmasi eksplisit pengguna

Karena instruksi "tetap coba sekaligus", beberapa keputusan struktural
diambil sendiri mengikuti pola paling konsisten dengan Langkah 6,
BUKAN hasil diskusi eksplisit seperti Langkah 6. Catat di sini supaya
pengguna bisa mengoreksi bila tidak sesuai:

1. **Struktur rute**: `/laporan` (daftar), `/laporan/kirim?penugasan=<id>`
   (formulir), `/laporan/[id]` (rincian), `/laporan/riwayat` (Anggota),
   `/laporan/belum-lapor` (Kanit/Kasubdit). Tidak didiskusikan dulu —
   dipilih karena paling konsisten dengan pola `/penugasan/*`.
2. **Tailwind inline**, bukan kelas `sp-*` — mengikuti keputusan
   eksplisit Langkah 6 untuk konsistensi, tidak ditanya ulang.
3. **Tombol "Kirim Laporan"** ditambahkan ke halaman rincian SPT
   sebagai tautan sederhana (bukan Server Action) — kemungkinan
   pengguna ingin bentuk lain (mis. tombol mengambang, atau di
   Beranda sesuai §6.1.5 "Mulai Tugas").
4. **Geolokasi dicoba otomatis saat formulir dibuka** (tanpa tombol
   "izinkan lokasi" eksplisit) — pola ini belum tentu sesuai selera
   UX yang diinginkan; beberapa aplikasi lebih suka tombol eksplisit
   supaya pengguna tidak kaget diminta izin lokasi tiba-tiba.
5. **Ekspor Data (BR-50) TIDAK dikerjakan** meski disepakati "sekalian
   juga". Alasannya: baru ditemukan SATU paragraf spesifikasi
   ("Kasubdit ekspor semua unit, Kanit ekspor unitnya, berkas teks +
   tautan foto") — sama sekali belum ada format berkas, cakupan tabel,
   struktur rute, atau mekanisme pembatasan laju yang disebutkan
   sekilas sebagai bagian dari modul gabungan "6.10 Ekspor Data &
   Pembatasan Laju". **Menulis kode untuk spesifikasi sedangkal itu
   berisiko mengarang detail penting** (format CSV atau ZIP? Satu
   berkas atau per tabel? Ada halaman UI atau cuma tombol unduh?) —
   ini perlu digali dan didiskusikan dulu, bukan diasumsikan. Lihat
   bagian "Yang perlu digali sebelum Ekspor Data" di bawah.

## Yang perlu digali sebelum Ekspor Data Institusi (BR-50) dikerjakan

Baru ditemukan potongan PRD berikut, dari Addendum 6.3-K bagian B.3:

> "Kasubdit dapat mengekspor data seluruh unit dan Kanit dapat
> mengekspor data unitnya sendiri. Berkas ekspor memuat data teks
> lengkap beserta daftar tautan berkas foto, bukan berkas fotonya
> sendiri."

Yang BELUM diketahui — cari di `docs/30-modul-6.3-pelaporan.md` bagian
setelah "B.3 Ekspor Data Institusi" (belum sempat dibaca lebih jauh
sesi ini) atau modul lain yang mungkin merujuknya:
- Format berkas (CSV, JSON, ZIP berisi beberapa CSV?)
- Cakupan tabel — hanya `laporan_harian`, atau juga `penugasan`,
  `catatan_laporan`, dst?
- Rentang tanggal — bisa dipilih, atau seluruh riwayat?
- Ada halaman/rute tersendiri, atau tombol di halaman lain?
- "Pembatasan Laju" yang disebut sebagai nama gabungan modul — apakah
  ini pembatasan berapa kali ekspor boleh dilakukan per hari, atau
  sesuatu yang lain sama sekali?
- Apakah ekspor berjalan sinkron (langsung unduh) atau perlu diproses
  di latar belakang (untuk data besar)?

## Yang PERLU diuji pengguna di Vercel

Migrasi 0017 dan 0018 **belum pernah dijalankan di Supabase asli** —
hanya diverifikasi di Postgres lokal sandbox. Langkah pertama:
jalankan kedua migrasi di SQL Editor Supabase (urutan: 0017 dulu, baru
0018 — 0018 bergantung pada tabel yang dibuat 0017).

Setelah migrasi jalan, uji:

1. Anggota kirim laporan dengan GPS aktif → status_lokasi terisi benar
   (terverifikasi/di_luar_titik sesuai jarak sungguhan)
2. Anggota kirim laporan dengan GPS dimatikan di perangkat → diminta
   pilih alasan, laporan tetap terkirim (BR-03)
3. Matikan jaringan HP saat isi formulir → kirim → cek notifikasi
   "tersimpan di perangkat" → nyalakan jaringan → laporan otomatis
   terkirim dalam waktu singkat
4. Kanit setujui laporan → laporan terkunci, pelapor tidak bisa
   sunting lagi
5. Panit "Minta Perbaikan" pada laporan Anggota lain → status berubah
   ke Perlu Diperbaiki
6. Anggota sunting laporan yang Perlu Diperbaiki → status kembali ke
   Terkirim, riwayat versi tercatat
7. Anggota coba beri catatan pada laporannya sendiri → ditolak (lewat
   RLS/trigger; UI saat ini tidak menyembunyikan tombol untuk kasus
   ini karena `bolehTinjau` sudah menghitung `!akuPelapor` di
   pemanggil — **tolong konfirmasi tombolnya memang tidak muncul**)
8. Kanit lihat halaman Belum Melapor → hanya pelaksana unitnya
9. Buka `/laporan/riwayat` sebagai Panit/Kanit/Kasubdit lewat bilah
   alamat → dipentalkan ke `/laporan`
10. Buka `/laporan/belum-lapor` sebagai Anggota/Panit → dipentalkan

## Yang masih belum ada di Modul 6.3

- **Unggah foto** — tabel dan RLS-nya sudah ada (migrasi 0017/0018),
  tapi **belum ada UI untuk mengunggah foto** dari formulir kirim
  laporan maupun halaman rincian. Ditunda karena `foto_dokumentasi`
  masih [KERANGKA], dan menu unggah penuh (kamera vs galeri, watermark
  waktu/lokasi) baru final di Modul 6.7.
- **Ekspor Data Institusi (BR-50)** — lihat bagian di atas.
- Jumlah laporan masuk pada kartu SPT Modul 6.2 — SEKARANG sudah bisa
  dikerjakan (tabel `laporan_harian` sudah ada), tapi belum
  disambungkan ke `components/sipantau/kartu-spt.tsx`. Ini pekerjaan
  kecil yang bisa masuk giliran pembersihan Langkah 8.
- Tombol cepat "Belum Ada Laporan" di halaman daftar Penugasan (Modul
  6.2) — sama, sekarang sudah bisa dikerjakan tapi belum disambungkan.
