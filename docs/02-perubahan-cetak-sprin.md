# Berita Acara Perubahan PRD — Pencetakan Surat Perintah Tugas

| | |
| --- | --- |
| **Nomor** | Perubahan-01 terhadap PRD SiPANTAU v0.7 |
| **Tanggal** | 19 Agustus 2026 |
| **Diminta oleh** | Pemilik produk, lisan dalam sesi pembangunan |
| **Dikerjakan pada** | Langkah 6 (revisi), modul 6.2 |
| **Status** | **Sudah dibangun**, menunggu penempelan ke badan PRD |

---

## 1. Duduk perkaranya

Pemilik produk meminta sistem dapat **mencetak SPRIN**. Permintaan itu
tidak dapat dilaksanakan sebagai pelaksanaan PRD, karena PRD v0.7
mengasumsikan alur yang **berlawanan arah**. Tiga tempat menyatakannya:

| Rujukan | Bunyinya |
| --- | --- |
| §6.2.4 aturan modul butir 1 | "**Sistem tidak menerbitkan nomor surat.** Bagian nomor agenda selalu berasal dari manusia. Kerangka nomor yang disodorkan sistem adalah bantuan pengetikan, bukan penomoran resmi." |
| §6.2.5 Formulir Penerbitan | "Berkas surat diunggah dari halaman rincian, bukan dari formulir ini, **karena surat fisik kerap ditandatangani belakangan**." |
| BR-25 | "SPT tidak dapat berpindah ke status selesai sebelum **berkas pindaian** surat perintah dilampirkan." |

Ketiganya bersama-sama menggambarkan satu alur: surat diketik di luar
sistem → ditandatangani basah → dipindai → diunggah. Sistem ini
sepenuhnya menjadi **penerima** dokumen, tidak pernah menjadi
penyusunnya. Satu-satunya dokumen yang PRD izinkan disusun sistem
adalah LHP Ringkas (Modul 6.8), dan itu pun sudah ditunda ke tahap
berikutnya menurut `docs/CLAUDE.md` §10.

Karena itu penambahan ini dicatat sebagai **revisi PRD**, bukan sebagai
pengerjaan butir yang sudah ada.

## 2. Yang berubah

Ditambahkan satu halaman: **Cetak Surat Perintah Tugas**, dicapai dari
tombol *Cetak Surat* pada halaman rincian penugasan.

Keluarannya adalah **konsep surat siap tanda tangan** dalam bentuk A4,
disusun dari data yang sudah ada pada SPT:

| Bagian surat | Sumber datanya |
| --- | --- |
| Kop | Teks baku — lihat butir 4 di bawah |
| Nomor | `penugasan.nomor_spt`, apa adanya |
| Menimbang | Disusun dari `jenis_kegiatan` |
| Dasar | Seluruh baris `penugasan_dasar`, berurutan |
| Diperintahkan kepada | `penugasan_panit` lalu `penugasan_pelaksana` yang aktif |
| Untuk | `objek`, `sasaran`, `nomor_lp`, `uraian_tugas`, `penugasan_lokasi`, `tanggal_mulai`, `tanggal_batas` |
| Blok tanda tangan | `diterbitkan_oleh`, jatuh ke `ditugaskan_oleh` bila kosong |

## 3. Yang **tidak** berubah, disengaja

Tiga ketetapan PRD sengaja **dipertahankan utuh**, supaya penambahan ini
tidak diam-diam membatalkan hal lain:

1. **Sistem tetap tidak membangkitkan nomor surat.** Halaman cetak
   hanya menyalin `nomor_spt` yang sudah diketik manusia. Bila kolom
   itu kosong, yang tercetak adalah titik-titik, bukan nomor karangan.
   §6.2.4 butir 1 tetap berlaku penuh.

2. **Pindaian bertanda tangan tetap wajib.** BR-25 dan KP-6.2-45 tidak
   disentuh: SPT tetap tidak dapat ditutup sebelum berkas pindaian
   diunggah. Hasil cetak ini **bukan** pengganti berkas itu, dan tidak
   pernah mengisi `berkas_surat_path`.

3. **Tidak ada tanda tangan elektronik.** Ruang tanda tangan dicetak
   kosong. Sistem tidak pernah membubuhkan tanda tangan, cap, maupun
   penanda keabsahan apa pun.

Akibatnya alur kerja bertambah satu langkah di depan, bukan berubah:

```
   PRD v0.7 :  ketik di luar → tanda tangan → pindai → unggah
   sesudah  :  cetak konsep  → tanda tangan → pindai → unggah
```

## 4. Butir yang masih menggantung

**Lampiran A butir A-04 — Berkas kop dan lambang institusi. Belum
terjawab.**

Kop pada hasil cetak sekarang disusun dari **teks biasa** mengikuti
bentuk baku surat Polri:

```
KEPOLISIAN NEGARA REPUBLIK INDONESIA
DAERAH JAWA BARAT
DIREKTORAT RESERSE KRIMINAL KHUSUS
Subdirektorat IV — <nama unit>
```

Lambang institusi **sengaja tidak digambar maupun ditiru**. Membubuhkan
lambang resmi yang belum diserahkan pemilik produk berarti sistem
menerbitkan tampilan keabsahan yang tidak pernah diberikan kepadanya.
Sampai A-04 dijawab dan berkas kop resminya diserahkan, hasil cetak
harus diperlakukan sebagai **konsep intern**.

Begitu berkas kop diterima, yang perlu diubah hanya satu fungsi:
`Kop()` pada `app/(app)/penugasan/[id]/cetak/page.tsx`. Sisa surat
tidak perlu disentuh.

Dua butir lain yang ikut memengaruhi hasil cetak:

- **A-12 (kode klasifikasi surat tiap unit)** — mengisi kolom
  `unit.kode_klasifikasi`. Selama kosong, kerangka nomor yang disodorkan
  formulir keluar berlubang: `SPT/____/___._._/VIII/2026/Ditreskrimsus`.
- **A-13 (kelengkapan daftar jenis kegiatan)** — menentukan kalimat
  Menimbang dan awalan nomor SPT.

## 5. Yang perlu dikerjakan pada badan PRD

1. Tambahkan halaman **Cetak Surat Perintah Tugas** pada daftar halaman
   §6.2.5, di antara Rincian Penugasan dan Kondisi kosong.
2. Tambahkan baris **Cetak Surat** pada tabel "Tombol yang tampil",
   baris Kanit pemilik unit.
3. Tambahkan kriteria penerimaan baru pada §6.2.3. Usulan bunyinya:

   | Kode | Kriteria |
   | --- | --- |
   | KP-6.2-81 | Bila Kanit menekan Cetak Surat, maka sistem menyusun konsep surat perintah dari data SPT dan menyiapkannya untuk dicetak pada kertas A4 |
   | KP-6.2-82 | Bila nomor SPT masih kosong saat dicetak, maka bagian nomor tercetak sebagai ruang kosong dan sistem **tidak** membangkitkan nomor apa pun |
   | KP-6.2-83 | Bila SPT masih berstatus draf, maka hasil cetak disertai keterangan bahwa cetakan hanya untuk pemeriksaan intern |
   | KP-6.2-84 | Bila surat dicetak, maka `berkas_surat_path` **tidak** terisi dan syarat penutupan pada BR-25 tetap berlaku |
   | KP-6.2-85 | Bila berkas kop institusi belum ditetapkan (butir A-04), maka kop tercetak sebagai teks baku tanpa lambang |

4. Naikkan nomor versi PRD dan catat berita acara ini pada Riwayat
   Revisi.
5. Pertimbangkan apakah pencetakan perlu masuk daftar jenis tindakan
   jejak audit §9.6. **Belum dilakukan** pada pembangunan ini — lihat
   butir 6.

## 6. Satu hal yang perlu diputuskan pemilik produk

**Apakah pencetakan surat perlu tercatat pada jejak audit?**

Argumen mencatat: hasil cetak memuat nama penyelidik, sasaran, dan
uraian tugas — isi yang setara dengan berkas ekspor, dan §9.6 mencatat
pengeksporan dokumen sebagai tindakan penting.

Argumen tidak mencatat: mencetak tidak mengubah data apa pun, dan
mencatat setiap pembukaan halaman cetak akan menggemukkan jejak audit
dengan baris yang tidak menerangkan apa-apa.

Pembangunan sekarang memilih **tidak mencatat**, karena menambah jenis
tindakan baru ke §9.6 menuntut revisi PRD tersendiri dan bukan
keputusan yang boleh diambil sesi koding. Bila pemilik produk memilih
mencatat, tambahkan jenis tindakan `cetak_spt` pada §9.6 dan panggil
`catat_jejak_audit` di halaman cetaknya.
