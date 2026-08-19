# Catatan Kemajuan — Langkah 6 Revisi (Presisi PRD Modul 6.2)

Ditulis 19 Agustus 2026, sesi yang sama dengan `catatan-langkah-6.md`
tetapi **setelah** pemilik produk menguji hasil pertamanya dan
melaporkan kekurangan. Baca berkas ini **setelah**
`catatan-langkah-6.md`, bukan sebagai penggantinya.

## Kenapa ada revisi

Hasil Langkah 6 yang pertama dibangun dengan Tailwind polos mengikuti
pola halaman `akun/page.tsx`, dan hanya menggarap tiga halaman.
Pengujian pemilik produk menemukan empat kekurangan, tiga di antaranya
ternyata **memang ditetapkan PRD dan terlewat**, bukan pilihan desain:

| Dilaporkan | Ternyata |
| --- | --- |
| Draf tak bisa disunting | Ada di §6.2.5 (tombol Sunting, Kelola Tim, dst) — terlewat |
| Titik lokasi cuma ketik angka | §6.2.5 mensyaratkan peta Leaflet dengan pin, ketikan, DAN pencarian nama tempat — terlewat |
| Belum bisa lampirkan surat | Ada di §6.2.5 — terlewat |
| Belum bisa cetak SPRIN | **TIDAK ada di PRD**, dan PRD mengasumsikan sebaliknya — jadi revisi PRD |

Pelajaran untuk sesi berikutnya: **sebelum menyatakan sebuah langkah
selesai, sisir §6.2.5 (atau bagian antarmuka modul yang setara) baris
demi baris**, bukan hanya kriteria selesai satu baris di `CLAUDE.md`
§10. Kriteria "Sesuai prototype" di sana terlalu ringkas untuk dipakai
sebagai daftar periksa.

## Migrasi baru — WAJIB DIJALANKAN pengguna

Dua berkas baru, belum pernah dijalankan di Supabase asli:

- `0015_tabel_perpanjangan_dan_masalah.sql` — tabel
  `penugasan_perpanjangan` dan `penugasan_masalah` beserta RLS dan dua
  pemicu.
- `0016_wadah_surat_spt.sql` — wadah `dokumentasi` dan lima kebijakan
  Storage untuk berkas surat.

Keduanya ditulis idempoten (`create table if not exists`, `on conflict
do nothing`, `drop policy if exists`), jadi aman dijalankan ulang.

**0016 menyentuh `storage.objects`.** Di sebagian proyek Supabase,
kebijakan pada skema `storage` hanya dapat dibuat oleh peran dengan hak
cukup. Bila migrasi 0016 ditolak lewat SQL Editor, buat wadahnya lewat
papan kendali lalu jalankan bagian kebijakannya saja.

## Verifikasi yang sudah dilakukan sesi ini

Berbeda dari sesi-sesi sebelumnya, kali ini SQL benar-benar dijalankan:

- PostgreSQL 16 dipasang di sandbox, stub Supabase dibangun ulang
  (skema `auth`, `storage`, `cron`, peran `authenticated`,
  `storage.foldername`, `auth.uid`).
- **Migrasi 0001–0016 lulus seluruhnya** berurutan. `pg_cron` dan
  `postgis` dinetralkan khusus untuk uji karena tidak tersedia di
  Postgres polos — di Supabase asli keduanya sudah aktif.
- **8/8 uji perilaku pemicu lulus**, termasuk dua kasus tepi yang mudah
  salah:
  - dua penandaan bermasalah beruntun → yang kedua **tidak ditolak**,
    status tetap bermasalah (6.2.6);
  - memulihkan satu penandaan saat masih ada yang terbuka → status
    **tetap** bermasalah, baru turun ke berjalan setelah semuanya
    dipulihkan.
- 17/17 uji penjaga rute, `next build` lulus, `eslint` bersih.

Stub uji ada di ruang kerja sesi ini saja dan **tidak ikut ke dalam
zip** — ia bukan bagian proyek. Bila sesi berikutnya ingin mengulang
uji SQL, bangun ulang stubnya; polanya sederhana dan tercatat di sini.

## Celah keamanan kedua yang ditemukan dan ditutup

Perbaikan `RUTE_KHUSUS_PERAN` dari sesi sebelumnya memakai pencocokan
**awalan**, dan itu tidak menjangkau rute yang id-nya berada di
**tengah** — `/penugasan/<id>/sunting` dan `/penugasan/<id>/tim` lolos
untuk semua peran.

Sudah diganti menjadi pencocokan **pola** (`RegExp`). Untuk sesi
berikutnya: setiap kali menambah sub-rute berkewenangan khusus di bawah
butir menu ber-`cocokAwalan`, **tambahkan polanya** — dan ingat bentuk
`/induk/<id>/anak`, bukan hanya `/induk/anak`.

## Keputusan yang diambil bersama pemilik produk

1. **Cetak SPRIN ditambahkan** sebagai revisi PRD. Berita acaranya di
   `docs/02-perubahan-cetak-sprin.md` — **belum ditempel ke badan PRD**,
   itu pekerjaan pemilik produk.
2. **Kop institusi tidak dipalsukan.** Butir A-04 masih terbuka, jadi
   lambang Polri sengaja tidak digambar. Hasil cetak berkop teks baku
   dan diperlakukan sebagai konsep intern.
3. **Tetap Tailwind polos**, tidak memporting kelas `sp-*` dari mockup.
   Presisi yang dikejar adalah presisi terhadap **PRD**, bukan terhadap
   rupa mockup.

## Pertentangan PRD vs mockup — sudah ada putusannya

Lampiran B.9 baris terakhir: **"Prototype menyesuaikan PRD bila keduanya
bertentangan."** Dipakai menyelesaikan tiga hal:

- Judul halaman daftar mengikuti PRD ("Penugasan Unit", "Seluruh
  Penugasan", "Penugasan yang Saya Awasi", "Tugas Saya"), bukan mockup.
- Daftar dipisah **aktif** vs **Riwayat** (B.9), padahal mockup
  mencampur semuanya dalam satu daftar.
- Rincian jadi rute sendiri, bukan state di halaman daftar.

## Yang masih belum ada di Modul 6.2

Bukan kelalaian — masing-masing terhalang sesuatu:

| Belum ada | Terhalang |
| --- | --- |
| Menyunting dasar & titik lokasi pada SPT terbit | KP-6.2-42 menolak hapus titik yang sudah dirujuk laporan; tabel laporan baru lahir Langkah 7 |
| Jumlah laporan masuk pada kartu SPT | Modul 6.3, Langkah 7 |
| Tombol cepat "Belum Ada Laporan" | Modul 6.3, Langkah 7 (dirender nonaktif, bukan disembunyikan — ketiadaannya bersyarat data, bukan kewenangan, jadi BR-11 tidak berlaku) |
| Lencana jumlah Sesi Tugas berjalan | Modul 6.4, Langkah 10 |
| Penutupan Sesi Tugas saat SPT ditutup (KP-6.2-46) | Modul 6.4, Langkah 10 |
| Pemberitahuan saat SPT terbit/dibatalkan (KP-6.2-06, 47) | Modul 6.9, Langkah 12 |
| Unduh Rekap | Ekspor, sudah ditunda `CLAUDE.md` §10 |
| Pencarian menjangkau nama lokasi | Butuh kueri kedua atau fungsi pencarian di database |

## Yang WAJIB diuji pengguna di Vercel

Tidak satu pun kueri dijalankan terhadap Supabase asli — domain
`*.supabase.co` diblokir sandbox seperti biasa. Daftar uji:

**Migrasi**
1. Jalankan 0015 dan 0016 di SQL Editor Supabase, pastikan keduanya lulus.
2. Pastikan wadah `dokumentasi` ada dan **tertutup** (bukan publik).

**Peta**
3. Buka Terbitkan → langkah 3. Peta muncul (butuh internet ke
   openstreetmap.org).
4. Klik peta → pin jatuh, koordinat terisi. Seret pin → koordinat ikut.
5. Isi nama tempat → tombol Cari nama tempat → hasil Nominatim muncul.
6. Geser radius → lingkaran di peta ikut berubah.

**Surat**
7. Unggah PDF sebagai berkas surat, lalu buka lewat tombol Buka berkas.
8. Unggah ulang berkas lain → berkas lama tergantikan.
9. Coba tutup penugasan **sebelum** unggah surat → harus ditolak dengan
   kalimat "Lampirkan pindaian surat perintah tugas…".

**Cetak**
10. Buka `/penugasan/<id>/cetak`, tekan Cetak surat → pratinjau cetak
    A4 rapi, bilah kendali tidak ikut tercetak.

**Kewenangan** (paling penting)
11. Anggota buka `/penugasan/<id>/sunting` lewat bilah alamat →
    dipentalkan.
12. Anggota buka `/penugasan/<id>/tim` → dipentalkan.
13. Panit buka `/penugasan/terbitkan` → dipentalkan.
14. Anggota buka `/penugasan/<id milik unit lain>` → 404.
15. Kasubdit **tidak** melihat draf milik Kanit orang lain.

**Bermasalah dan perpanjangan**
16. Pelaksana tandai bermasalah → status jadi bermasalah, kegiatan
    tetap jalan.
17. Kanit kembalikan dari bermasalah → status kembali berjalan.
18. Kanit perpanjang batas → riwayatnya muncul di halaman rincian.

**Tanda terima**
19. Pelaksana buka rincian SPT → penanda berubah jadi "Sudah membuka"
    di mata Kanit.
