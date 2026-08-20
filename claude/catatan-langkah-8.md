# Catatan Kemajuan — Langkah 8 (Presisi Antarmuka §6.3.5)

Ditulis 20 Agustus 2026. Status: **SELESAI**.

## Kenapa ada Langkah 8, padahal Modul 6.3 "selesai" di Langkah 7

Kriteria selesai resmi Langkah 8 di `docs/CLAUDE.md` §10 adalah "Halaman
laporan dan peninjauan — Panit dapat memberi catatan". Sebagian besar
sudah terpenuhi lebih awal karena Langkah 7 dikerjakan sekaligus penuh
(atas instruksi pengguna). Tapi audit ulang terhadap spesifikasi
antarmuka rinci di `docs/30-modul-6.3-pelaporan.md` §6.3.5 (yang belum
sempat dibaca detail saat Langkah 7 terburu-buru) menemukan **gap
nyata**, bukan cuma kosmetik:

| Spesifikasi §6.3.5 | Status sebelum Langkah 8 |
| --- | --- |
| Status kegiatan "bermasalah" → buka penuntun Tandai Bermasalah (satu pintu dengan Modul 6.2) | Langsung tersimpan tanpa penuntun |
| Foto: dua tombol terpisah Ambil Foto / Pilih dari Galeri | **Tidak ada UI unggah foto sama sekali** |
| Peta pin bernomor untuk foto berkoordinat di rincian laporan | Tidak ada |
| Panel "Sebelum Mengirim" dengan kalimat terkoreksi | Tidak ada |
| Pita peringatan Lewat Batas di formulir kirim | Tidak ada |
| Rekap "Belum Melapor Hari Ini" di **kepala halaman** Kanit | Cuma tombol tautan terpisah |
| Penyaring: SPT, jenis, status laporan, status lokasi, rentang tanggal, pelapor | Cuma kotak cari teks |
| Judul persis "Review Laporan" (Panit), "Semua Laporan" (Kanit **dan** Kasubdit) | Judul berbeda-beda per peran, tidak sesuai kata PRD |

**Pelajaran yang sudah dicatat di Langkah 7, terbukti lagi di sini:**
membangun cakupan besar sekaligus tanpa membaca spesifikasi antarmuka
sampai tuntas berisiko melewatkan detail yang baru ketahuan lewat
audit terpisah. Untuk Langkah 9 dan seterusnya, baca §6.x.5 (bagian
antarmuka) SAMPAI HABIS sebelum menyatakan sebuah langkah selesai,
bukan hanya kriteria satu baris di §10.

## Yang dibangun

**Migrasi baru** (`0018_wadah_foto_laporan.sql`):
- Tiga kebijakan Storage untuk foto laporan (baca, unggah, hapus),
  prefiks `laporan/<laporan_id>/<berkas>` — terpisah dari prefiks
  `spt/` milik surat SPT (migrasi 0016)
- **Terverifikasi ulang dari database Postgres bersih** di sesi ini
  (0001-0018 lulus semua), plus **5 uji fungsional baru khusus foto**:
  foto berkoordinat tersimpan benar, foto tanpa koordinat TIDAK
  mewarisi koordinat laporan induk (BR-42), bukan-pelapor ditolak,
  laporan terkunci menolak foto baru (KP-6.3-42), pengelompokan
  berkoordinat/tanpa-koordinat bekerja untuk kebutuhan UI

**Kode aplikasi baru:**
- `app/(app)/laporan/aksi-foto.ts` — Server Actions `unggahFotoLaporan`,
  `hapusFotoLaporan`, `tautanFoto` (pola sama dengan surat SPT: wadah
  tertutup, tautan bertanda tangan 5 menit)
- `components/sipantau/unggah-foto.tsx` — dua tombol terpisah Ambil
  Foto (dengan geolokasi otomatis) / Pilih dari Galeri (TANPA
  geolokasi — BR-42 melarang memberi koordinat "sekarang" untuk foto
  yang mungkin diambil kapan saja)
- `components/sipantau/galeri-foto.tsx` — thumbnail + hapus
- `components/sipantau/saring-laporan.tsx` — penyaring lengkap sesuai
  §6.3.5 (SPT, jenis, status laporan, status lokasi, rentang tanggal,
  pelapor)
- Halaman rincian laporan (`[id]/page.tsx`) — ditambah section foto
  dengan peta pin (memakai ulang komponen `PetaTitik` Modul 6.2,
  `radius_meter: null` supaya lingkaran radius tidak digambar) dan
  panel unggah untuk pelapor
- Formulir kirim laporan — ditambah modal penuntun Tandai Bermasalah
  (memanggil `tandaiBermasalah` dari Modul 6.2 langsung, bukan
  duplikasi logika), pita Lewat Batas, panel Sebelum Mengirim
- Halaman daftar laporan ditulis ulang — penyaring lengkap, rekap
  Belum Melapor di kepala halaman Kanit/Kasubdit, judul dikoreksi
  persis sesuai tabel PRD

**Verifikasi build**: `next build` lulus (19 rute, TIDAK ada rute baru
— seluruh gap ditutup dengan memperkaya halaman yang sudah ada, bukan
menambah rute), `eslint` bersih.

## Catatan teknis penting

**Modal penuntun Tandai Bermasalah dirender di luar `<form>` induk.**
Formulir kirim laporan dibungkus `<>...</>` (Fragment) karena modalnya
sendiri berisi `<form>` terpisah (untuk memanggil `tandaiBermasalah`) —
form bersarang tidak valid HTML dan akan menyebabkan submit yang salah
sasaran kalau dipaksakan jadi satu.

**`status_kegiatan` tidak langsung berubah saat "bermasalah" dipilih.**
`<select>` tetap menampilkan nilai LAMA (`value={statusKegiatan}`,
bukan nilai yang baru dipilih) sampai penuntun selesai diisi dan
`tandaiBermasalah` berhasil — dijaga lewat state `sudahTandaiBermasalah`.
Tanpa penanda ini, memilih ulang "bermasalah" tanpa mengisi penuntun
bisa diam-diam tersimpan sebagai `status_kegiatan=bermasalah` tanpa
baris `penugasan_masalah` yang menyertainya.

**Peta pin foto memakai ulang `PetaTitik` (Modul 6.2) apa adanya**,
bukan komponen peta baru — dikirim `radius_meter: null` per foto
supaya lingkaran radius (yang tidak relevan untuk foto) tidak ikut
digambar. Ini penghematan kode yang disengaja, bukan kebetulan.

**Kolom `sumber` (kamera/galeri) belum ada di skema** —
`foto_dokumentasi` masih [KERANGKA] sampai Modul 6.7 (lihat migrasi
0017 Bagian C). Perbedaan kamera/galeri di Langkah 8 ini HANYA
memengaruhi *apakah geolokasi ikut diminta saat unggah*, bukan
disimpan sebagai kolom tersendiri. Ini konsekuensi yang disengaja dari
keputusan menunda kolom `sumber` — kalau Modul 6.7 nanti menambahkannya,
`unggah-foto.tsx` perlu disambungkan untuk mengirim nilai itu juga.

## Yang PERLU diuji pengguna di Vercel

**Migrasi 0018 belum pernah dijalankan di Supabase asli** — hanya
diverifikasi di Postgres lokal sandbox (lagi). Jalankan di SQL Editor
Supabase (urutan tidak masalah relatif terhadap 0017 karena sudah
pernah dijalankan, tapi kalau proyek Anda belum pernah jalankan 0018
sama sekali, jalankan sekarang).

Setelah migrasi jalan, uji:

1. Kirim laporan, pilih status kegiatan "Bermasalah" → modal penuntun
   terbuka, isi jenis+uraian → status_kegiatan benar-benar berubah ke
   Bermasalah setelah penuntun selesai
2. Batalkan modal penuntun (klik Batal) → status kegiatan TIDAK
   berubah ke Bermasalah, kembali ke pilihan semula
3. Di halaman rincian laporan, sebagai pelapor: tombol "Ambil Foto" →
   kamera terbuka di HP, foto tersimpan dengan koordinat
4. Tombol "Pilih dari Galeri" → galeri terbuka, foto tersimpan TANPA
   koordinat (meski GPS aktif — ini sesuai desain BR-42, tolong
   konfirmasi ini yang diharapkan)
5. Foto berkoordinat muncul sebagai pin di peta kecil; foto tanpa
   koordinat muncul di kelompok terpisah di bawahnya
6. SPT dengan tanggal_batas sudah lewat → buka `/laporan/kirim` untuk
   SPT itu → pita kuning peringatan Lewat Batas muncul, pengiriman
   tetap bisa dilakukan
7. Sebagai Kanit, buka `/laporan` → rekap Belum Melapor Hari Ini
   muncul di kepala halaman (bukan cuma tombol)
8. Coba penyaring lengkap di `/laporan` — pilih SPT tertentu, jenis
   tertentu, rentang tanggal → hasil tersaring benar
9. Setelah laporan disetujui Kanit, coba tambah foto lagi sebagai
   pelapor → ditolak dengan pesan jelas

## Yang masih belum ada

Sama seperti sebelumnya — Ekspor Data Institusi (BR-50) masih perlu
digali detailnya sebelum dikerjakan (lihat `claude/catatan-langkah-7.md`
untuk daftar pertanyaan terbuka). Kolom `sumber` foto dan watermark
waktu/lokasi pada foto (`tanda_air_*`) menunggu Modul 6.7.
