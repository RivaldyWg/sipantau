# Modul 6.6 Manajemen User & Modul 6.9 Notifikasi

Dua modul dalam satu berkas, disusun sebagai bagian terpisah.

> Memuat daftar tertutup jenis pemberitahuan. Jumlah yang berlaku **tujuh belas**,
> bukan enam belas seperti tertulis di dalamnya — lihat koreksi W.2 pada
> `01-koreksi.md`.

---
---

# SiPANTAU — Modul 6.6 & 6.9 UTUH

**Manajemen User · Notifikasi**

Status: [FINAL] · Disusun 11 Agustus 2026 · Berkas tunggal, tanpa lapisan

Berkas ini menggantikan Section 6.6 dan Section 6.9 pada PRD dasar secara utuh. Keduanya digali bersamaan karena sama-sama ringan dan tidak saling bergantung, tetapi disusun sebagai dua bagian terpisah dan aturannya tidak dicampur.

Modul 6.6 sebagian besar sudah ditetapkan Addendum 6.1-T — dua Fungsi Tepi, Akun Pemeliharaan, aturan satu perangkat, dan aturan akses baris tabel `users`. Yang digali di sini adalah alur kerja dan antarmukanya. Modul 6.9 memfinalkan tabel `notifikasi` yang lahir berstatus [KERANGKA] di Addendum 6.2-T, beserta daftar lengkap nilai `jenis` yang sampai kini tersebar di lima modul tanpa pernah dikumpulkan.

---

## Penomoran yang berlaku

| Hal | Rentang |
| --- | --- |
| Aturan global yang lahir di berkas ini | BR-68 sampai BR-76 |
| Amandemen atas aturan yang sudah ada | BR-51 |
| **Aturan berikutnya dimulai dari** | **BR-77** |
| Kriteria penerimaan Modul 6.6 | KP-6.6-01 sampai KP-6.6-38 |
| Kriteria penerimaan Modul 6.9 | KP-6.9-01 sampai KP-6.9-41 |
| Butir uji | U-6.6-01 sampai U-6.6-06, U-6.9-01 sampai U-6.9-08 |
| Tabel baru | 5.23 `langganan_dorong` |
| Calon Addendum | 11 butir, Bagian 12 |

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.7 | 11 Agu 2026 | Modul 6.6 dan 6.9 digali. Tabel `notifikasi` difinalkan beserta enam belas nilai `jenis`. Tabel `langganan_dorong` lahir. Delapan temuan pra-penggalian ditutup |

---
---

# Bagian 0 — Temuan yang wajib dikerjakan lebih dahulu

Delapan temuan muncul saat menelusuri kedua modul terhadap berkas yang sudah berlaku. Tiga memblokir.

## Q-01 Jenis pemberitahuan tersebar di lima modul tanpa daftar — MEMBLOKIR

### Duduk perkaranya

Kolom `notifikasi.jenis` bertipe teks bebas. Addendum 6.2-T menyebut satu nilai, `spt_lewat_batas`, lalu menyerahkan daftar lengkapnya ke Modul 6.9. Sementara itu Modul 6.4 sudah menyisipkan baris pemberitahuan pada dua keadaan — sesi ditutup karena keluar aplikasi (KP-6.4-25) dan izin lokasi terputus (KP-6.4-56) — tanpa menyebutkan nilai `jenis` yang dipakai. Modul 6.4 sendiri mencatatnya sebagai calon addendum butir 16.

Modul 6.2 dan 6.3 juga memicu pemberitahuan pada beberapa keadaan, juga tanpa menyebut nilainya.

Tipe teks bebas tanpa daftar berarti setiap modul akan memilih nama sendiri. Satu kejadian yang sama berpotensi punya dua nama, dan penyaringan berdasarkan jenis tidak akan pernah dapat dipercaya. Ini pelanggaran Section 0.2 tentang larangan sinonim, hanya saja terjadi pada nilai data, bukan pada nama tabel.

### Ketetapan

> **BR-68.** Nilai `notifikasi.jenis` berasal dari daftar tertutup yang ditetapkan Modul 6.9. Penambahan nilai baru wajib melalui revisi PRD yang tercatat, dan wajib menyertakan penerima, pemicu, serta judul bakunya. Modul lain dilarang menyisipkan baris pemberitahuan dengan nilai di luar daftar.

Penegakannya bukan lewat tipe enum, melainkan lewat batasan pemeriksaan. Alasannya: menambah nilai pada enum Postgres tidak dapat dibatalkan di dalam transaksi, sedangkan batasan pemeriksaan dapat diganti dengan satu pernyataan.

```sql
alter table public.notifikasi
  add constraint chk_notifikasi_jenis
  check (jenis in (
    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
    'spt_dicabut', 'spt_ditutup',
    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
    'laporan_perlu_diperbaiki', 'laporan_disetujui',
    'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
    'akun_dinonaktifkan', 'kata_sandi_direset'
  ));
```

Daftar lengkap beserta penerima dan pemicunya ada pada Bagian 8.

## Q-02 Tabel `notifikasi` tidak dapat menampung pemberitahuan tanpa SPT — MEMBLOKIR

### Duduk perkaranya

Bentuk tabel dari Addendum 6.2-T hanya memiliki satu kolom rujukan, yaitu `penugasan_id`. Dua jenis pemberitahuan pada daftar Q-01 tidak berkaitan dengan SPT mana pun: `akun_dinonaktifkan` dan `kata_sandi_direset` berasal dari Modul 6.6.

Kolom `penugasan_id` memang boleh kosong, sehingga penyisipannya tidak akan gagal. Yang gagal adalah **pembukaannya**: pengguna menekan pemberitahuan, aplikasi mencoba membuka rincian SPT, dan tidak ada SPT yang dituju. Kegagalannya berpindah dari saat penyimpanan ke saat pemakaian, dan itu jenis yang lebih sulit ditemukan.

### Ketetapan

Ditambahkan dua kolom yang menyatakan tujuan secara umum, menggantikan ketergantungan pada satu kolom rujukan.

```sql
alter table public.notifikasi
  add column tujuan_jenis text,
  add column tujuan_id    uuid,
  add column laporan_id   uuid references public.laporan_harian(id) on delete cascade;

alter table public.notifikasi
  add constraint chk_notifikasi_tujuan
  check (tujuan_jenis is null or tujuan_jenis in ('penugasan', 'laporan', 'akun', 'tanpa_tujuan'));
```

Kolom `penugasan_id` dan `laporan_id` dipertahankan sebagai kunci asing sungguhan, karena keduanya memberi penghapusan berantai yang dibutuhkan: pemberitahuan tentang SPT yang dihapus permanen ikut terhapus tanpa perlu pekerjaan pembersih. Pasangan `tujuan_jenis` dan `tujuan_id` dipakai aplikasi untuk menentukan layar mana yang dibuka.

## Q-03 Pemberitahuan tidak mengikuti lingkup data setelah pencabutan — MEMBLOKIR SENYAP

### Duduk perkaranya

BR-14 menetapkan pemberitahuan mengikuti lingkup data. BR-21 menetapkan lingkup Panit ditentukan penugasan tempat ia ditunjuk, dan penunjukan yang berakhir tetap memberi hak baca atas riwayatnya. Bagian J butir J.7 memisahkan lebih jauh: hak baca riwayat bertahan, hak pemantauan langsung berakhir saat pencabutan.

Pemberitahuan berdiri di antara keduanya dan belum pernah ditetapkan masuk yang mana. Bila mengikuti hak baca riwayat, seorang Panit yang sudah dicabut dari sebuah SPT akan terus menerima pemberitahuan setiap kali ada laporan masuk pada SPT itu — berbulan-bulan setelah ia tidak lagi ada urusan dengannya.

Kesenyapannya terletak pada bentuk kegagalannya. Tidak ada galat, tidak ada data yang salah. Yang terjadi hanya seseorang menerima kabar yang bukan lagi urusannya, dan tidak seorang pun akan melaporkannya sebagai kerusakan.

### Ketetapan

> **BR-69.** Pemberitahuan mengikuti lingkup **pemantauan langsung**, bukan lingkup baca riwayat. Penerima ditentukan pada saat pemberitahuan dibuat, dan yang sudah dicabut dari sebuah penugasan tidak lagi menerima pemberitahuan tentangnya. Pemberitahuan yang sudah telanjur masuk sebelum pencabutan tetap terbaca, karena ia sudah menjadi riwayat.

Penegakannya berada pada fungsi pembuat pemberitahuan, bukan pada aturan akses baris. Aturan akses baris `notifikasi` cukup sederhana: seseorang membaca pemberitahuan yang ditujukan kepadanya.

## Q-04 Kasubdit dapat menonaktifkan dirinya sendiri hingga sistem terkunci — PENTING

### Duduk perkaranya

Contoh isian Modul 6.6 yang saya susun jauh sebelum penggalian ini memuat aturan bahwa sistem tidak boleh berada dalam keadaan tanpa satu pun akun Kasubdit aktif. Aturan itu tidak pernah masuk ke berkas mana pun yang berlaku.

Akun Pemeliharaan sebenarnya sudah menutup kemungkinan terkunci total. Tetapi Akun Pemeliharaan dimaksudkan sebagai jalan pemulihan darurat yang pemakaiannya tercatat penuh pada jejak audit, bukan sebagai penambal keteledoran yang dapat dicegah.

### Ketetapan

> **BR-70.** Sistem tidak boleh berada dalam keadaan tanpa satu pun akun berperan kasubdit yang aktif. Penonaktifan yang akan menghasilkan keadaan itu ditolak. Akun Pemeliharaan tidak dihitung sebagai penggantinya.

## Q-05 Penonaktifan akun tidak menghentikan Sesi Tugas — PENTING

### Duduk perkaranya

Addendum 6.3-K sudah menetapkan bahwa akun yang dinonaktifkan saat berada dalam Sesi Tugas akan ditutup paksa sesinya. Ketetapan itu tertulis pada bagian edge case, bukan pada spesifikasi Fungsi Tepi `nonaktifkan-akun` di Addendum 6.1-T.

Fungsi Tepi itulah yang benar-benar dijalankan. Selama penutupan sesi tidak tertulis di dalamnya, ia tidak akan terjadi, dan seorang yang akunnya sudah nonaktif akan tercatat selamanya sedang bertugas.

### Ketetapan

Fungsi Tepi `nonaktifkan-akun` bertambah dua langkah, dan seluruhnya berjalan dalam satu transaksi:

| Urutan | Langkah |
| --- | --- |
| 1 | Periksa kewenangan pemanggil |
| 2 | Periksa BR-70, tolak bila akan menghabiskan Kasubdit aktif terakhir |
| 3 | Tutup Sesi Tugas yang masih berjalan milik akun itu, sebab penutupan `akun_dinonaktifkan` |
| 4 | Setel `aktif` menjadi salah dan `sedang_bertugas` menjadi salah |
| 5 | Akhiri seluruh sesi masuknya |
| 6 | Sisipkan pemberitahuan `akun_dinonaktifkan` kepada Kanit unitnya |
| 7 | Catat jejak audit |

Nilai `akun_dinonaktifkan` ditambahkan ke daftar `sebab_penutupan` pada tabel `sesi_tugas` yang difinalkan Modul 6.4.

## Q-06 Penghitung pemberitahuan belum dibaca tidak dibatasi — SEDANG

Indeks parsial dari Addendum 6.2-T sudah menyiapkan pembacaan cepat pemberitahuan yang belum dibaca. Yang belum ditetapkan adalah apa yang terjadi ketika jumlahnya menjadi sangat besar.

Seorang Kanit dengan dua puluh SPT berjalan berpotensi menerima ratusan pemberitahuan dalam sepekan. Penghitung bertuliskan angka tiga digit tidak menyampaikan apa pun selain rasa tertinggal.

> **Ketetapan.** Penghitung pada lonceng berhenti pada angka sembilan puluh sembilan, di atas itu ditulis sebagai lebih dari sembilan puluh sembilan. Daftar pemberitahuan dimuat bertahap tiga puluh baris sekali muat.

## Q-07 Pemberitahuan tidak pernah disusutkan — SEDANG

Tabel `notifikasi` tumbuh terus tanpa ambang penyusutan. Ia jauh lebih lambat daripada `location_logs`, tetapi tetap tumbuh selamanya.

> **BR-71.** Pemberitahuan yang sudah dibaca dan berumur lebih dari sembilan puluh hari dihapus pekerjaan berjadwal. Pemberitahuan yang belum dibaca tidak pernah dihapus berapa pun umurnya, karena penghapusannya akan menghilangkan kabar yang belum pernah sampai.

Angka sembilan puluh hari disamakan dengan retensi `location_logs` agar tidak ada dua ambang berbeda yang harus diingat.

## Q-08 Zona waktu pada pengelompokan pemberitahuan — SEDANG

BR-64 mewajibkan seluruh perhitungan hari kalender memakai zona `Asia/Jakarta`. Daftar pemberitahuan dikelompokkan menurut hari, dan pengelompokan itu adalah perhitungan hari kalender.

> **Ketetapan.** Pengelompokan daftar pemberitahuan memakai `(dibuat_pada at time zone 'Asia/Jakarta')::date`. Ini penerapan BR-64, bukan aturan baru — dan pantas dicatat sebagai contoh jenis pelanggaran yang ditemukan V-03 pada Bagian J: aturan yang benar tetapi mudah terlewat di tempat baru.

---
---

# Bagian 1 — Section 6.6 Manajemen User

## 6.6.1 Deskripsi

Modul ini mengatur seluruh daur hidup akun pengguna: penambahan, penyuntingan, penonaktifan, dan pemulihan akses. Kewenangannya eksklusif milik Kasubdit, kecuali reset kata sandi yang juga dimiliki Kanit dalam lingkup unitnya.

Modul ini **tidak** menangani proses masuk dan keluar sistem, penentuan peran saat sesi berjalan, maupun pengikatan perangkat. Ketiganya milik Modul 6.1. Yang menjadi urusan modul ini adalah data akun itu sendiri beserta cara mengelolanya.

Sebagian besar mekanismenya sudah ditetapkan Addendum 6.1-T. Yang digali di sini adalah alur kerja, antarmuka, dan keadaan tepi yang muncul saat pengelolaan akun bersinggungan dengan modul lain yang sudah berjalan.

## 6.6.2 Cerita pengguna

| Kode | Cerita |
| --- | --- |
| CP-6.6-01 | Sebagai Kasubdit, saya ingin menambah akun bagi personel yang baru bergabung, agar ia dapat segera memakai sistem tanpa menunggu siapa pun |
| CP-6.6-02 | Sebagai Kasubdit, saya ingin mengubah peran seseorang ketika ia berpindah jabatan, agar hak aksesnya mengikuti tugasnya yang sekarang |
| CP-6.6-03 | Sebagai Kasubdit, saya ingin memindahkan seseorang ke unit lain, agar mutasi tercermin pada sistem tanpa membuat akun baru |
| CP-6.6-04 | Sebagai Kasubdit, saya ingin menonaktifkan akun personel yang purnabakti atau pindah kesatuan, agar ia tidak lagi dapat masuk, tanpa kehilangan riwayat pekerjaannya |
| CP-6.6-05 | Sebagai Kasubdit, saya ingin melihat kapan tiap akun terakhir masuk, agar saya tahu akun mana yang tidak pernah dipakai |
| CP-6.6-06 | Sebagai Kasubdit, saya ingin mencari akun berdasarkan nama atau NRP, agar saya tidak menelusuri daftar panjang satu per satu |
| CP-6.6-07 | Sebagai Kanit, saya ingin mereset kata sandi anggota saya yang lupa, agar ia dapat kembali bertugas hari itu juga tanpa menunggu Kasubdit |
| CP-6.6-08 | Sebagai Kanit, saya ingin melihat daftar personel unit saya beserta perannya, agar saya tahu siapa saja yang dapat saya tunjuk pada SPT |
| CP-6.6-09 | Sebagai personel yang baru dibuatkan akun, saya ingin diberi tahu kata sandi awal saya dengan cara yang tidak berisiko, agar saya dapat masuk untuk pertama kali |
| CP-6.6-10 | Sebagai pemegang Akun Pemeliharaan, saya ingin memulihkan akses ketika seluruh jalur normal buntu, agar sistem tidak pernah terkunci total |

## 6.6.3 Kriteria penerimaan

### Penambahan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.6-01 | Bila Kasubdit mengisi formulir tambah akun dengan seluruh kolom wajib terisi dan NRP belum terpakai, maka akun tersimpan berstatus aktif dan langsung dapat dipakai masuk |
| KP-6.6-02 | Bila NRP yang dimasukkan sudah dipakai akun lain yang aktif, maka penyimpanan ditolak dengan keterangan bahwa NRP sudah terpakai, disertai nama pemiliknya |
| KP-6.6-03 | Bila NRP yang dimasukkan pernah dipakai akun yang kini nonaktif, maka sistem meminta penegasan sebelum melanjutkan, dan menyebutkan siapa pemilik lamanya |
| KP-6.6-04 | Bila akun berhasil dibuat, maka `wajib_ganti_sandi` bernilai benar, sehingga pemakaian pertama dipaksa mengganti kata sandi (Modul 6.1) |
| KP-6.6-05 | Bila akun berhasil dibuat, maka kata sandi awal ditampilkan **satu kali** di layar Kasubdit dan tidak pernah dapat dilihat kembali |
| KP-6.6-06 | Bila peran yang dipilih adalah pemeliharaan, maka kolom unit dikosongkan dan tidak dapat diisi |
| KP-6.6-07 | Bila peran yang dipilih bukan pemeliharaan, maka unit wajib diisi dan hanya dapat dipilih dari unit yang berstatus aktif |
| KP-6.6-08 | Bila email sintetis yang terbentuk dari NRP sudah ada pada sistem autentikasi meski barisnya tidak ada pada tabel pengguna, maka pembuatan ditolak dengan keterangan bahwa akun perlu dipulihkan, bukan dibuat |

### Penyuntingan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.6-09 | Bila Kasubdit mengubah peran seseorang, maka perubahan berlaku pada permintaan berikutnya yang dikirim orang itu, tanpa mengeluarkannya dari sistem (Addendum 6.1-T) |
| KP-6.6-10 | Bila peran diubah dari kanit menjadi peran lain sementara ia masih tercatat sebagai penerbit SPT yang berjalan, maka perubahan **tetap diizinkan**, dan SPT itu tetap mencantumkannya sebagai penerbit |
| KP-6.6-11 | Bila unit seseorang diubah sementara ia masih menjadi pelaksana pada SPT unit lamanya, maka perubahan tetap diizinkan dan keanggotaannya pada SPT itu tidak dicabut otomatis |
| KP-6.6-12 | Bila NRP diubah, maka riwayat laporan, SPT, dan jejak audit miliknya tetap terhubung, karena seluruh rujukan memakai identitas internal |
| KP-6.6-13 | Bila NRP diubah, maka email sintetisnya ikut berubah mengikuti NRP baru, dan NRP lama tidak lagi dapat dipakai masuk |
| KP-6.6-14 | Bila Kasubdit mengubah data akunnya sendiri, maka perubahan diizinkan kecuali pada kolom peran dan aktif |

### Penonaktifan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.6-15 | Bila akun dinonaktifkan, maka ia tidak lagi dapat masuk, sementara seluruh laporan, SPT, dan LHP yang pernah dibuatnya tetap tampil apa adanya |
| KP-6.6-16 | Bila akun yang sedang berada dalam Sesi Tugas dinonaktifkan, maka Sesi Tugas ditutup dengan sebab penonaktifan akun, Rute yang sudah terkumpul tersimpan utuh, dan pelacakan berhenti (Q-05) |
| KP-6.6-17 | Bila akun dinonaktifkan, maka seluruh sesi masuknya diakhiri sehingga perangkat yang sedang terbuka kehilangan akses pada permintaan berikutnya |
| KP-6.6-18 | Bila penonaktifan akan menghasilkan keadaan tanpa satu pun Kasubdit aktif, maka tindakan ditolak dengan keterangan bahwa harus tersisa sekurang-kurangnya satu (BR-70) |
| KP-6.6-19 | Bila Kasubdit menonaktifkan akunnya sendiri sementara masih ada Kasubdit aktif lain, maka tindakan diizinkan setelah penegasan yang menjelaskan akibatnya |
| KP-6.6-20 | Bila akun dinonaktifkan, maka Kanit unitnya menerima pemberitahuan `akun_dinonaktifkan` |
| KP-6.6-21 | Bila akun nonaktif diaktifkan kembali, maka ia dapat masuk lagi memakai kata sandi lamanya, dan `wajib_ganti_sandi` tidak disetel ulang |

### Reset kata sandi

| Kode | Kriteria |
| --- | --- |
| KP-6.6-22 | Bila Kasubdit mereset kata sandi siapa pun, maka kata sandi baru ditampilkan satu kali dan `wajib_ganti_sandi` bernilai benar |
| KP-6.6-23 | Bila Kanit mereset kata sandi personel di unitnya yang berperan anggota atau panit, maka tindakan diterima (BR-15) |
| KP-6.6-24 | Bila Kanit mencoba mereset kata sandi personel unit lain, atau yang berperan kanit maupun kasubdit, maka tindakan ditolak |
| KP-6.6-25 | Bila reset kata sandi dilakukan lebih dari sepuluh kali dalam satu jam oleh pemanggil yang sama, maka permintaan berikutnya ditolak dengan keterangan batas dan waktu dapat dicoba lagi (BR-51) |
| KP-6.6-26 | Bila kata sandi seseorang direset, maka yang bersangkutan menerima pemberitahuan `kata_sandi_direset` yang menyebut siapa yang meresetnya |
| KP-6.6-27 | Bila kata sandi direset, maka seluruh sesi masuk yang sedang berjalan milik akun itu diakhiri |

### Daftar dan pencarian

| Kode | Kriteria |
| --- | --- |
| KP-6.6-28 | Bila Kasubdit membuka daftar akun, maka seluruh akun dari seluruh unit tampil, termasuk yang nonaktif, dengan penanda yang membedakannya |
| KP-6.6-29 | Bila Kanit membuka daftar personel, maka hanya personel unitnya yang tampil, dan tombol tambah maupun nonaktifkan tidak muncul sama sekali (BR-11) |
| KP-6.6-30 | Bila kata kunci pencarian dimasukkan, maka daftar tersaring seketika berdasarkan nama atau NRP tanpa memuat ulang halaman |
| KP-6.6-31 | Bila daftar ditampilkan, maka kolom terakhir masuk memakai waktu nisbi, dan akun yang belum pernah masuk ditulis belum pernah masuk, bukan tanda hubung |
| KP-6.6-32 | Bila akun berstatus nonaktif ditampilkan, maka barisnya diredupkan dan tidak dapat dipilih untuk penugasan mana pun |

### Akun Pemeliharaan

| Kode | Kriteria |
| --- | --- |
| KP-6.6-33 | Bila Akun Pemeliharaan membuka daftar akun, maka ia dapat mereset kata sandi siapa pun tanpa batasan peran maupun unit |
| KP-6.6-34 | Bila Akun Pemeliharaan melakukan tindakan apa pun pada modul ini, maka satu baris jejak audit dicatat, termasuk untuk tindakan membaca |
| KP-6.6-35 | Bila Akun Pemeliharaan mencoba menambah akun baru atau menonaktifkan akun, maka tindakan ditolak. Kewenangannya terbatas pada pemulihan akses |

### Jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.6-36 | Bila peran atau unit seseorang diubah, maka jejak audit mencatat nilai lama dan nilai barunya, bukan sekadar bahwa perubahan terjadi |
| KP-6.6-37 | Bila akun dibuat, dinonaktifkan, atau diaktifkan kembali, maka jejak audit mencatat pelaku, sasaran, dan waktunya |
| KP-6.6-38 | Bila kata sandi direset, maka jejak audit mencatat siapa mereset kata sandi siapa, **tanpa** memuat kata sandinya dalam bentuk apa pun |

## 6.6.4 Aturan modul

| Kode | Aturan |
| --- | --- |
| AM-6.6-01 | Kolom wajib saat menambah akun: nama, NRP, pangkat, peran, dan unit kecuali untuk peran pemeliharaan |
| AM-6.6-02 | Satu NRP hanya boleh dipakai satu akun aktif. NRP milik akun nonaktif boleh dipakai ulang setelah penegasan |
| AM-6.6-03 | Kata sandi awal dibangkitkan sistem sepanjang dua belas aksara, memuat huruf dan angka, tanpa aksara yang mudah tertukar seperti angka nol dan huruf O |
| AM-6.6-04 | Kata sandi awal ditampilkan satu kali dan tidak pernah disimpan dalam bentuk yang dapat dibaca kembali |
| AM-6.6-05 | Peran kasubdit hanya dapat diberikan atau dicabut oleh kasubdit lain yang aktif |
| AM-6.6-06 | Peran pemeliharaan tidak dapat diberikan lewat antarmuka mana pun. Akun itu dibuat sekali saat penyiapan sistem |
| AM-6.6-07 | Akun tidak pernah dihapus, hanya dinonaktifkan (BR-12) |
| AM-6.6-08 | Unit tidak pernah dihapus, hanya dinonaktifkan. Unit yang dinonaktifkan tidak dapat dipilih untuk akun baru, sementara akun yang sudah ada di dalamnya tetap berjalan |

## 6.6.5 Antarmuka dan kondisi tampilan

**Halaman Daftar Akun.** Tabel berisi nama, NRP, pangkat, peran, unit, status, dan waktu terakhir masuk. Kolom pencarian di atas tabel. Penyaring peran dan unit di sampingnya. Tombol Tambah Akun di kanan atas, hanya bagi Kasubdit.

**Halaman Tambah dan Sunting Akun.** Formulir sesuai AM-6.6-01. Tombol Nonaktifkan hanya muncul pada mode sunting dan diletakkan terpisah dari tombol simpan, dengan warna yang membedakannya.

**Layar kata sandi awal.** Muncul sekali setelah akun dibuat atau kata sandi direset. Menampilkan NRP dan kata sandi dalam aksara besar yang mudah dibacakan. Satu tombol untuk menyalin, satu tombol untuk menutup. Peringatan bahwa layar ini tidak dapat dibuka kembali ditulis sebelum tombol tutup, bukan sesudahnya.

**Kondisi kosong.** Daftar akun hanya kosong pada pemasangan pertama; keterangannya mengajak menambah akun pertama. Hasil pencarian yang kosong menampilkan keterangan bahwa tidak ada yang cocok beserta tombol menghapus penyaring.

**Kondisi memuat.** Kerangka baris abu-abu berkedip mengikuti gaya prototype, bukan layar putih.

**Kondisi galat.** Kegagalan penyimpanan ditampilkan pada formulir tanpa menutupnya, sehingga isian yang sudah diketik tidak hilang.

**Perbedaan antar peran.**

| Peran | Yang terlihat |
| --- | --- |
| Kasubdit | Seluruh halaman, seluruh tombol |
| Kanit | Daftar personel unitnya, hanya tombol Reset Kata Sandi |
| Panit | Menu tidak muncul sama sekali |
| Anggota | Menu tidak muncul sama sekali |
| Pemeliharaan | Daftar seluruh akun, hanya tombol Reset Kata Sandi |

## 6.6.6 Edge case modul

| Kode | Keadaan | Perlakuan |
| --- | --- | --- |
| EC-6.6-01 | Akun dinonaktifkan saat sedang dalam Sesi Tugas | Sesi ditutup dengan sebab penonaktifan, Rute tersimpan utuh (Q-05) |
| EC-6.6-02 | Akun dinonaktifkan saat memiliki laporan berstatus perlu diperbaiki | Laporan tetap ada dan tetap terbaca. Ia tidak akan pernah diperbaiki, dan itu keadaan yang sah |
| EC-6.6-03 | Akun dinonaktifkan saat masih tercantum sebagai pelaksana pada SPT berjalan | Penonaktifan diizinkan. Kanit unit diberi tahu agar dapat menunjuk penggantinya |
| EC-6.6-04 | Penonaktifan akan menghabiskan Kasubdit aktif terakhir | Ditolak (BR-70) |
| EC-6.6-05 | Penonaktifan akan menghabiskan Panit Penanggung Jawab terakhir pada sebuah SPT | Penonaktifan **tetap diizinkan**. Syarat minimum SPT dijaga saat pencabutan penunjukan, bukan saat penonaktifan akun. Kanit diberi tahu |
| EC-6.6-06 | Dua Kasubdit menonaktifkan satu sama lain pada saat hampir bersamaan | Penguncian baris menyerialkannya; yang kedua menghitung ulang dan ditolak BR-70 |
| EC-6.6-07 | Kata sandi direset sementara yang bersangkutan sedang mengisi formulir laporan | Sesinya berakhir pada permintaan berikutnya. Antrean Luring yang sudah terbentuk tetap tersimpan di perangkat dan terkirim setelah ia masuk kembali |
| EC-6.6-08 | NRP diubah sementara yang bersangkutan sedang masuk | Sesi berjalan tidak terganggu, tetapi masuk berikutnya harus memakai NRP baru |
| EC-6.6-09 | Unit dinonaktifkan sementara masih ada personel aktif di dalamnya | Diizinkan. Personel tetap berjalan, unit tidak lagi dapat dipilih untuk akun baru |
| EC-6.6-10 | Pembuatan akun gagal setelah pengguna terbentuk pada sistem autentikasi tetapi sebelum barisnya tersimpan | Fungsi Tepi membatalkan pembuatan pengguna itu sebelum mengembalikan galat. Tanpa ini, NRP akan tersandera dan tidak dapat dipakai ulang (KP-6.6-08) |

## 6.6.7 Ketergantungan

| Modul | Hubungan |
| --- | --- |
| 6.1 Autentikasi | Modul ini bergantung padanya. Dua Fungsi Tepi, tabel users, dan aturan aksesnya lahir di sana |
| 6.4 GPS Tracking | Modul ini memanggil penutupan Sesi Tugas saat akun dinonaktifkan |
| 6.9 Notifikasi | Modul ini menyisipkan dua jenis pemberitahuan |
| 6.2 Penugasan | Tidak bergantung, tetapi penonaktifan akun berakibat pada SPT yang berjalan |

---
---

# Bagian 2 — Section 6.9 Notifikasi

## 6.9.1 Deskripsi

Modul ini menyampaikan kejadian penting kepada pengguna yang berkepentingan, agar mereka tidak perlu memeriksa sistem secara berkala.

Ia **tidak** menentukan kejadian apa saja yang layak diberitahukan — itu ditetapkan modul yang memiliki kejadiannya. Yang menjadi urusan modul ini adalah menampung, mengantarkan, menampilkan, dan menyusutkan pemberitahuan, serta memastikan tidak seorang pun menerima kabar yang bukan haknya.

Modul ini adalah tempat berkumpulnya sesuatu yang sampai kini tersebar: enam belas jenis pemberitahuan yang lahir di lima modul berbeda, yang sebelumnya tidak pernah didaftar di satu tempat.

## 6.9.2 Cerita pengguna

| Kode | Cerita |
| --- | --- |
| CP-6.9-01 | Sebagai Anggota, saya ingin tahu segera ketika saya ditunjuk pada SPT baru, agar saya dapat bersiap tanpa menunggu diberi tahu lewat jalur lain |
| CP-6.9-02 | Sebagai Panit, saya ingin tahu ketika laporan masuk pada SPT yang saya tanggung jawabi, agar saya dapat meninjaunya pada hari yang sama |
| CP-6.9-03 | Sebagai Kanit, saya ingin tahu ketika sebuah SPT ditandai bermasalah, agar saya dapat turun tangan sebelum berlarut |
| CP-6.9-04 | Sebagai Kanit, saya ingin tahu ketika Sesi Tugas anggota saya terputus di lapangan, agar saya dapat menghubunginya |
| CP-6.9-05 | Sebagai Anggota, saya ingin tahu ketika Panit memberi catatan pada laporan saya, agar saya dapat menanggapinya |
| CP-6.9-06 | Sebagai pengguna mana pun, saya ingin melihat pemberitahuan yang belum saya baca dengan jelas, agar saya tahu mana yang sudah saya lewatkan |
| CP-6.9-07 | Sebagai pengguna mana pun, saya ingin membuka pemberitahuan dan langsung sampai ke layar yang dimaksud, agar saya tidak mencarinya sendiri |
| CP-6.9-08 | Sebagai Anggota di lapangan, saya ingin menerima pemberitahuan penting meski aplikasi sedang tidak saya buka, agar saya tidak terlambat mengetahuinya |

## 6.9.3 Kriteria penerimaan

### Pembuatan dan penerima

| Kode | Kriteria |
| --- | --- |
| KP-6.9-01 | Bila sebuah kejadian pemicu terjadi, maka satu baris pemberitahuan dibuat untuk **tiap** penerima yang berhak, bukan satu baris bersama |
| KP-6.9-02 | Bila nilai `jenis` yang disisipkan berada di luar daftar tertutup, maka penyisipan ditolak basis data (BR-68) |
| KP-6.9-03 | Bila penerima yang seharusnya sudah dicabut dari penugasan terkait, maka pemberitahuan tidak dibuat untuknya (BR-69) |
| KP-6.9-04 | Bila pelaku kejadian adalah orang yang sama dengan calon penerima, maka pemberitahuan tidak dibuat untuknya. Tidak seorang pun diberi tahu tentang perbuatannya sendiri |
| KP-6.9-05 | Bila akun penerima berstatus nonaktif, maka pemberitahuan tidak dibuat untuknya |
| KP-6.9-06 | Bila kejadian menyangkut sebuah SPT, maka baris pemberitahuan memuat `penugasan_id` sehingga penghapusan SPT ikut menghapusnya |
| KP-6.9-07 | Bila kejadian tidak menyangkut SPT mana pun, maka `tujuan_jenis` bernilai akun atau tanpa tujuan, dan aplikasi tidak mencoba membuka rincian SPT (Q-02) |

### Pembacaan dan penandaan

| Kode | Kriteria |
| --- | --- |
| KP-6.9-08 | Bila pengguna membuka daftar pemberitahuan, maka yang belum dibaca ditampilkan berbeda dari yang sudah dibaca |
| KP-6.9-09 | Bila pengguna membuka sebuah pemberitahuan, maka `dibaca_pada` terisi dan penghitung pada lonceng berkurang seketika |
| KP-6.9-10 | Bila pengguna menekan tandai semua sudah dibaca, maka seluruh pemberitahuan miliknya yang belum dibaca ditandai sekaligus |
| KP-6.9-11 | Bila pemberitahuan sudah pernah dibaca lalu dibuka lagi, maka `dibaca_pada` tidak berubah. Yang dicatat adalah kapan pertama kali dibaca |
| KP-6.9-12 | Bila jumlah yang belum dibaca melebihi sembilan puluh sembilan, maka penghitung ditulis sebagai lebih dari sembilan puluh sembilan (Q-06) |
| KP-6.9-13 | Bila daftar dibuka, maka tiga puluh baris dimuat lebih dahulu dan sisanya menyusul saat digulir |
| KP-6.9-14 | Bila daftar ditampilkan, maka pemberitahuan dikelompokkan menurut hari pada zona `Asia/Jakarta` (Q-08) |
| KP-6.9-15 | Bila pengguna menekan sebuah pemberitahuan, maka aplikasi membuka layar sesuai `tujuan_jenis` dan `tujuan_id` |
| KP-6.9-16 | Bila tujuan pemberitahuan sudah tidak ada, misalnya SPT-nya dihapus permanen, maka pemberitahuan itu juga sudah terhapus dan tidak pernah tampil |

### Pengantaran waktu nyata

| Kode | Kriteria |
| --- | --- |
| KP-6.9-17 | Bila pemberitahuan baru masuk sementara aplikasi terbuka, maka penghitung lonceng bertambah tanpa memuat ulang halaman |
| KP-6.9-18 | Bila sambungan waktu nyata terputus, maka penghitung diperbarui saat aplikasi dibuka kembali. Tidak ada pemberitahuan yang hilang karena terputusnya sambungan |
| KP-6.9-19 | Bila pengguna membuka aplikasi di dua perangkat, maka aturan satu perangkat Modul 6.1 berlaku dan hanya perangkat terakhir yang menerima |

### Pemberitahuan dorong

| Kode | Kriteria |
| --- | --- |
| KP-6.9-20 | Bila pengguna memasang aplikasi Android dan memberi izin, maka pemberitahuan berjenis mendesak dikirim sebagai pemberitahuan dorong meski aplikasi tertutup |
| KP-6.9-21 | Bila pengguna menolak izin pemberitahuan, maka seluruh pemberitahuan tetap masuk ke daftar dalam aplikasi. Penolakan izin tidak pernah menghilangkan pemberitahuan |
| KP-6.9-22 | Bila pemberitahuan dorong ditekan, maka aplikasi terbuka langsung pada layar tujuannya |
| KP-6.9-23 | Bila pengguna memakai bentuk web, maka pemberitahuan dorong tidak dikirim dan hanya daftar dalam aplikasi yang berjalan |
| KP-6.9-24 | Bila jenis pemberitahuan tidak ditandai mendesak, maka ia tidak dikirim sebagai dorongan, hanya masuk daftar |

### Penyusutan

| Kode | Kriteria |
| --- | --- |
| KP-6.9-25 | Bila pemberitahuan sudah dibaca dan berumur lebih dari sembilan puluh hari, maka ia dihapus pekerjaan berjadwal (BR-71) |
| KP-6.9-26 | Bila pemberitahuan belum dibaca, maka ia tidak pernah dihapus berapa pun umurnya |
| KP-6.9-27 | Bila pekerjaan berjadwal berhenti berjalan, maka daftar pemberitahuan tetap benar. Yang tertunda hanya pembersihannya (BR-36) |

### Lingkup dan keamanan

| Kode | Kriteria |
| --- | --- |
| KP-6.9-28 | Bila pengguna membaca tabel pemberitahuan, maka hanya baris yang ditujukan kepadanya yang terbaca |
| KP-6.9-29 | Bila pengguna mencoba menandai pemberitahuan milik orang lain sebagai sudah dibaca, maka tindakan ditolak |
| KP-6.9-30 | Bila pengguna mencoba menyisipkan baris pemberitahuan dari klien, maka tindakan ditolak. Pemberitahuan hanya lahir dari fungsi di dalam basis data |
| KP-6.9-31 | Bila isi pemberitahuan disusun, maka ia tidak memuat data yang tidak berhak dibaca penerimanya. Judul menyebut nomor SPT, isi tidak pernah memuat uraian laporan |

### Isi dan bahasa

| Kode | Kriteria |
| --- | --- |
| KP-6.9-32 | Bila pemberitahuan disusun, maka judulnya menyatakan kejadian dan isinya menyatakan keterangannya, keduanya tanpa menyimpulkan atau menuduh (Prinsip 0.6) |
| KP-6.9-33 | Bila Sesi Tugas terputus, maka pemberitahuan berbunyi bahwa pelacakan terhenti, bukan bahwa yang bersangkutan meninggalkan tugas |
| KP-6.9-34 | Bila SPT ditandai bermasalah, maka pemberitahuan menyebut penandaan itu terjadi dan siapa yang menandainya, tanpa mengulang alasannya |
| KP-6.9-35 | Bila pemberitahuan menyebut waktu, maka waktunya ditulis nisbi untuk yang kurang dari sehari dan sebagai tanggal untuk yang lebih lama |

### Pengaturan pengguna

| Kode | Kriteria |
| --- | --- |
| KP-6.9-36 | Bila pengguna membuka pengaturan pemberitahuan, maka ia dapat mematikan dorongan untuk jenis yang tidak mendesak |
| KP-6.9-37 | Bila pengguna mencoba mematikan dorongan untuk jenis mendesak, maka pilihan itu tidak tersedia. Kabar tentang tugas yang sedang berjalan tidak dapat dimatikan |
| KP-6.9-38 | Bila pengguna mematikan sebuah jenis, maka pemberitahuannya tetap masuk daftar dalam aplikasi. Yang dimatikan hanya dorongannya |
| KP-6.9-39 | Bila pengguna berganti perangkat, maka pengaturannya ikut karena tersimpan pada akun, bukan pada perangkat |
| KP-6.9-40 | Bila pengguna belum pernah mengatur apa pun, maka seluruh jenis mendesak menyala dan jenis tidak mendesak menyala |
| KP-6.9-41 | Bila Akun Pemeliharaan masuk, maka ia tidak menerima pemberitahuan apa pun, karena ia bukan bagian dari alur kerja |

## 6.9.4 Aturan modul

| Kode | Aturan |
| --- | --- |
| AM-6.9-01 | Pemberitahuan dibuat lewat satu fungsi terpusat, tidak pernah lewat penyisipan langsung dari modul mana pun |
| AM-6.9-02 | Fungsi pembuat menentukan penerima berdasarkan lingkup pemantauan langsung pada saat pembuatan (BR-69) |
| AM-6.9-03 | Judul pemberitahuan diambil dari daftar baku pada Bagian 8, tidak disusun bebas oleh pemanggil |
| AM-6.9-04 | Isi pemberitahuan boleh disusun pemanggil, tetapi tidak pernah memuat uraian laporan, kronologis, maupun identitas pihak dalam perkara |
| AM-6.9-05 | Pemberitahuan tidak pernah dapat dihapus pengguna. Yang dapat dilakukan hanya menandainya sudah dibaca |

## 6.9.5 Antarmuka dan kondisi tampilan

**Lonceng pada bilah atas.** Menampilkan penghitung yang belum dibaca. Menekannya membuka panel melayang berisi sepuluh pemberitahuan terbaru dan tautan ke halaman penuh.

**Halaman Pemberitahuan.** Daftar bertingkat menurut hari, dengan kepala kelompok bertuliskan Hari ini, Kemarin, lalu tanggal. Yang belum dibaca ditandai titik berwarna dan latar sedikit berbeda. Tombol tandai semua sudah dibaca di kanan atas.

**Halaman Pengaturan Pemberitahuan.** Daftar jenis yang dapat dimatikan, dikelompokkan menurut modul asalnya. Jenis mendesak ditampilkan dengan penanda bahwa ia tidak dapat dimatikan, bukan disembunyikan — pengguna berhak tahu apa saja yang akan sampai kepadanya.

**Kondisi kosong.** Belum ada pemberitahuan sama sekali menampilkan keterangan bahwa kabar tentang penugasan dan laporan akan muncul di sini.

**Kondisi memuat.** Kerangka baris berkedip, bukan pemutar berputar.

**Perbedaan antar peran.** Tidak ada. Seluruh peran memakai halaman yang sama; yang berbeda hanya isinya, yang sudah dijaga lingkup data.

## 6.9.6 Edge case modul

| Kode | Keadaan | Perlakuan |
| --- | --- | --- |
| EC-6.9-01 | Penerima dicabut dari SPT tepat setelah pemberitahuan dibuat | Pemberitahuan tetap terbaca. Ia sudah menjadi riwayat (BR-69) |
| EC-6.9-02 | SPT dihapus permanen sementara pemberitahuannya belum dibaca | Pemberitahuan ikut terhapus lewat penghapusan berantai |
| EC-6.9-03 | Akun penerima dinonaktifkan sebelum pemberitahuannya dibaca | Baris tetap ada dan tidak dihapus. Bila akun diaktifkan kembali, ia masih menerimanya |
| EC-6.9-04 | Satu kejadian menghasilkan penerima yang sama dua kali, misalnya seseorang Panit Penanggung Jawab sekaligus pelaksana | Fungsi pembuat menyaring duplikat. Satu orang menerima satu baris |
| EC-6.9-05 | Puluhan pemberitahuan lahir sekaligus, misalnya SPT dengan banyak pelaksana | Seluruhnya disisipkan dalam satu pernyataan, bukan satu per satu |
| EC-6.9-06 | Sambungan waktu nyata terputus lama | Penghitung diperbarui saat aplikasi dibuka. Tidak ada yang hilang |
| EC-6.9-07 | Izin pemberitahuan dicabut pengguna di pengaturan perangkat | Dorongan berhenti, daftar dalam aplikasi tetap berjalan |
| EC-6.9-08 | Penanda perangkat untuk dorongan menjadi tidak berlaku | Baris langganan dibersihkan pekerjaan berjadwal. Kegagalan pengiriman dorongan tidak pernah menggagalkan pembuatan pemberitahuan |

## 6.9.7 Ketergantungan

| Modul | Hubungan |
| --- | --- |
| 6.2, 6.3, 6.4, 6.6 | Keempatnya memicu pemberitahuan. Modul ini yang mengantarkannya |
| 6.5 Dashboard | Menampilkan lonceng dan penghitung |
| 6.1 Autentikasi | Aturan satu perangkat menentukan ke mana dorongan dikirim |

---
---

# Bagian 3 — Model Data

## 5.20 Tabel notifikasi — bentuk final

Menggantikan bentuk kerangka pada Addendum 6.2-T Bagian 1.4.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Identitas unik |
| penerima_id | uuid | Mengacu ke users. Satu baris untuk satu penerima |
| jenis | text | Salah satu dari enam belas nilai pada Bagian 8. Ditegakkan batasan pemeriksaan |
| judul | text | Diambil dari daftar baku, tidak disusun bebas |
| isi | text | Keterangan singkat. Tidak pernah memuat uraian laporan atau identitas pihak |
| tujuan_jenis | text | penugasan, laporan, akun, atau tanpa_tujuan. Menentukan layar yang dibuka |
| tujuan_id | uuid | Identitas sasaran sesuai tujuan_jenis |
| penugasan_id | uuid | Kunci asing sungguhan. Memberi penghapusan berantai |
| laporan_id | uuid | Kunci asing sungguhan. Memberi penghapusan berantai |
| mendesak | boolean | Menentukan apakah dikirim sebagai dorongan |
| dibaca_pada | timestamptz | Kosong selama belum dibaca |
| dibuat_pada | timestamptz | Waktu pembuatan |

```sql
alter table public.notifikasi
  add column tujuan_jenis text,
  add column tujuan_id    uuid,
  add column laporan_id   uuid references public.laporan_harian(id) on delete cascade,
  add column mendesak     boolean not null default false;

alter table public.notifikasi
  add constraint chk_notifikasi_jenis check (jenis in (
    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
    'spt_dicabut', 'spt_ditutup',
    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
    'laporan_perlu_diperbaiki', 'laporan_disetujui',
    'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
    'akun_dinonaktifkan', 'kata_sandi_direset'
  )),
  add constraint chk_notifikasi_tujuan check (
    tujuan_jenis is null or tujuan_jenis in ('penugasan', 'laporan', 'akun', 'tanpa_tujuan')
  );

create index if not exists idx_notifikasi_penyusutan
  on public.notifikasi (dibaca_pada)
  where dibaca_pada is not null;

grant select, update on public.notifikasi to authenticated;
```

Hanya `select` dan `update` yang diberikan. Tidak ada `insert`, karena pemberitahuan hanya lahir dari fungsi di dalam basis data (KP-6.9-30). Tidak ada `delete`, karena pengguna tidak pernah menghapusnya (AM-6.9-05).

## 5.23 Tabel langganan_dorong — tabel baru

Menyimpan penanda perangkat untuk pengantaran pemberitahuan dorong, beserta pengaturan jenis yang dimatikan pengguna.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Identitas unik |
| pengguna_id | uuid | Mengacu ke users |
| penanda_perangkat | text | Penanda perangkat dari Modul 6.1, menghubungkan langganan dengan perangkat yang sah |
| penanda_dorong | text | Penanda yang dipakai layanan pengantaran |
| jenis_dimatikan | text[] | Daftar jenis yang dimatikan pengguna. Jenis mendesak diabaikan bila muncul di sini |
| aktif | boolean | Dimatikan saat pengantaran gagal berulang |
| dibuat_pada | timestamptz | Waktu pembuatan |
| diubah_pada | timestamptz | Waktu perubahan terakhir |

```sql
create table public.langganan_dorong (
  id                uuid primary key default gen_random_uuid(),
  pengguna_id       uuid not null references public.users(id) on delete cascade,
  penanda_perangkat text not null,
  penanda_dorong    text not null,
  jenis_dimatikan   text[] not null default '{}',
  aktif             boolean not null default true,
  dibuat_pada       timestamptz not null default now(),
  diubah_pada       timestamptz not null default now()
);

create unique index uq_langganan_dorong_perangkat
  on public.langganan_dorong (pengguna_id, penanda_perangkat);

grant select, insert, update on public.langganan_dorong to authenticated;
```

Pengaturan disimpan pada tabel ini, bukan pada `users`, agar KP-6.9-39 terpenuhi dengan sendirinya: pengaturan melekat pada akun dan ikut berpindah perangkat, sementara penanda dorongnya tidak.

## Hubungan antar entitas — tambahan

| Hubungan | Jenis | Catatan |
| --- | --- | --- |
| users ke notifikasi | satu ke banyak | Lewat penerima_id |
| penugasan ke notifikasi | satu ke banyak | Penghapusan berantai |
| laporan_harian ke notifikasi | satu ke banyak | Penghapusan berantai |
| users ke langganan_dorong | satu ke banyak | Satu baris per perangkat |

---
---

# Bagian 4 — Fungsi pembuat pemberitahuan

Satu fungsi terpusat, dipanggil seluruh modul. Ia menegakkan BR-69, KP-6.9-04, dan KP-6.9-05 di satu tempat, sehingga tidak ada modul yang perlu mengingatnya sendiri.

```sql
create or replace function public.buat_notifikasi(
  p_jenis        text,
  p_penerima     uuid[],
  p_judul        text,
  p_isi          text,
  p_tujuan_jenis text,
  p_tujuan_id    uuid,
  p_penugasan_id uuid default null,
  p_laporan_id   uuid default null,
  p_mendesak     boolean default false,
  p_pelaku       uuid default null
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  insert into public.notifikasi
    (penerima_id, jenis, judul, isi, tujuan_jenis, tujuan_id,
     penugasan_id, laporan_id, mendesak)
  select distinct u.id, p_jenis, p_judul, p_isi, p_tujuan_jenis, p_tujuan_id,
         p_penugasan_id, p_laporan_id, p_mendesak
    from unnest(p_penerima) as t(id)
    join public.users u on u.id = t.id
   where u.aktif = true                              -- KP-6.9-05
     and u.peran <> 'pemeliharaan'                    -- KP-6.9-41
     and (p_pelaku is null or u.id <> p_pelaku);      -- KP-6.9-04

  get diagnostics n = row_count;
  return n;
end;
$$;
```

Kata `distinct` menegakkan EC-6.9-04 tanpa perlu penyaringan tambahan di pihak pemanggil. Penyisipan berlangsung dalam satu pernyataan, memenuhi EC-6.9-05.

Penentuan siapa penerimanya tetap menjadi urusan pemanggil, karena hanya ia yang tahu konteks kejadiannya. Yang dipusatkan di sini adalah penyaringan yang berlaku bagi seluruh kejadian.

## Fungsi bantu penentu penerima

Tiga bentuk yang paling sering dipakai, disediakan agar pemanggil tidak menyusun kueri yang sama berulang-ulang. Ketiganya menegakkan BR-69 dengan memeriksa `dicabut_pada`.

```sql
-- Pengawas sebuah SPT: Kanit unit ditambah Panit Penanggung Jawab yang aktif
create or replace function public.penerima_pengawas_spt(p_penugasan_id uuid)
returns uuid[]
language sql
security definer
set search_path = ''
as $$
  select array_agg(distinct id) from (
    select u.id
      from public.penugasan p
      join public.users u on u.unit_id = p.unit_id and u.peran = 'kanit'
     where p.id = p_penugasan_id
    union
    select pp.panit_id
      from public.penugasan_panit pp
     where pp.penugasan_id = p_penugasan_id
       and pp.dicabut_pada is null
  ) s;
$$;

-- Pelaksana sebuah SPT yang belum dicabut
create or replace function public.penerima_pelaksana_spt(p_penugasan_id uuid)
returns uuid[]
language sql
security definer
set search_path = ''
as $$
  select array_agg(pelaksana_id)
    from public.penugasan_pelaksana
   where penugasan_id = p_penugasan_id
     and dicabut_pada is null;
$$;
```

---
---

# Bagian 5 — Aturan akses baris

## notifikasi

```sql
alter table public.notifikasi enable row level security;

create policy notifikasi_baca_milik_sendiri on public.notifikasi
for select to authenticated
using (penerima_id = (select auth.uid()));

create policy notifikasi_tandai_milik_sendiri on public.notifikasi
for update to authenticated
using (penerima_id = (select auth.uid()))
with check (penerima_id = (select auth.uid()));
```

Kebijakan pembaruan sengaja tidak membatasi kolom mana yang boleh diubah, karena hak `update` di tingkat tabel sudah dibatasi lewat pemicu berikut. Tanpa pemicu ini, seseorang dapat mengubah judul atau isi pemberitahuannya sendiri — tidak berbahaya bagi orang lain, tetapi merusak keandalan riwayat.

```sql
create or replace function public.fn_notifikasi_hanya_tandai_baca()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.penerima_id  := old.penerima_id;
  new.jenis        := old.jenis;
  new.judul        := old.judul;
  new.isi          := old.isi;
  new.tujuan_jenis := old.tujuan_jenis;
  new.tujuan_id    := old.tujuan_id;
  new.penugasan_id := old.penugasan_id;
  new.laporan_id   := old.laporan_id;
  new.mendesak     := old.mendesak;
  new.dibuat_pada  := old.dibuat_pada;

  -- Yang pertama dicatat, itu yang berlaku (KP-6.9-11)
  if old.dibaca_pada is not null then
    new.dibaca_pada := old.dibaca_pada;
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_hanya_tandai_baca
  before update on public.notifikasi
  for each row
  execute function public.fn_notifikasi_hanya_tandai_baca();
```

## langganan_dorong

```sql
alter table public.langganan_dorong enable row level security;

create policy langganan_milik_sendiri on public.langganan_dorong
for all to authenticated
using (pengguna_id = (select auth.uid()))
with check (pengguna_id = (select auth.uid()));
```

## users — tambahan untuk Modul 6.6

Kebijakan baca dan tulis tabel `users` sudah ditetapkan Addendum 6.1-T. Yang ditambahkan di sini hanya satu: Kasubdit dapat memperbarui baris siapa pun dalam rangka penyuntingan akun.

```sql
create policy users_sunting_oleh_kasubdit on public.users
for update to authenticated
using ((select sipantau_auth.peran_saya()) = 'kasubdit')
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');
```

Penonaktifan tidak berjalan lewat kebijakan ini melainkan lewat Fungsi Tepi, karena ia perlu mengakhiri sesi masuk yang hanya dapat dilakukan dengan kunci istimewa.

---
---

# Bagian 6 — Pekerjaan berjadwal

```sql
create or replace function public.kerja_susutkan_notifikasi()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.notifikasi
   where dibaca_pada is not null
     and dibaca_pada < now() - interval '90 days';
$$;

select cron.schedule(
  'susutkan-notifikasi',
  '20 1 * * *',                       -- 01:20 UTC, sekitar 08:20 WIB
  $$ select public.kerja_susutkan_notifikasi() $$
);

create or replace function public.kerja_bersihkan_langganan_mati()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.langganan_dorong
   where aktif = false
     and diubah_pada < now() - interval '30 days';
$$;

select cron.schedule(
  'bersihkan-langganan-mati',
  '30 1 * * 0',                       -- sepekan sekali
  $$ select public.kerja_bersihkan_langganan_mati() $$
);
```

Keduanya hanya merapikan. Tidak ada kebenaran sistem yang bergantung padanya, sesuai BR-36.

---
---

# Bagian 7 — Aturan global baru

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-68 | Nilai `notifikasi.jenis` berasal dari daftar tertutup Modul 6.9. Penambahan wajib lewat revisi PRD tercatat beserta penerima, pemicu, dan judul bakunya | Seluruh modul |
| BR-69 | Pemberitahuan mengikuti lingkup pemantauan langsung, bukan lingkup baca riwayat. Yang sudah dicabut tidak lagi menerima. Yang sudah masuk sebelum pencabutan tetap terbaca | 6.9 |
| BR-70 | Sistem tidak boleh berada dalam keadaan tanpa satu pun akun kasubdit yang aktif. Akun Pemeliharaan tidak dihitung sebagai penggantinya | 6.6 |
| BR-71 | Pemberitahuan yang sudah dibaca dan berumur lebih dari sembilan puluh hari dihapus. Yang belum dibaca tidak pernah dihapus | 6.9 |
| BR-72 | Pemberitahuan hanya lahir dari fungsi terpusat di dalam basis data. Tidak ada modul yang menyisipkan baris `notifikasi` secara langsung | Seluruh modul |
| BR-73 | Isi pemberitahuan tidak pernah memuat uraian laporan, kronologis, maupun identitas pihak dalam perkara. Ia menyebut kejadian dan sasarannya, bukan isinya | 6.9 |
| BR-74 | Tidak seorang pun menerima pemberitahuan tentang perbuatannya sendiri | 6.9 |
| BR-75 | Jenis pemberitahuan yang ditandai mendesak tidak dapat dimatikan pengguna. Yang tidak mendesak dapat dimatikan dorongannya, tetapi tetap masuk daftar dalam aplikasi | 6.9 |
| BR-76 | Kata sandi awal maupun hasil reset ditampilkan satu kali dan tidak pernah disimpan dalam bentuk yang dapat dibaca kembali, termasuk pada jejak audit | 6.6 |

## Amandemen BR-51

Daftar tertutup operasi yang dibatasi lajunya bertambah satu baris.

| Operasi | Batas | Jendela | Alasan |
| --- | --- | --- | --- |
| `buat_akun` | 20 | 1 jam | Pembuatan akun massal yang tidak wajar patut tertahan, sementara dua puluh cukup untuk pendaftaran satu unit sekaligus |

`nonaktifkan_akun` sengaja **tidak** dibatasi. Penonaktifan massal yang tidak wajar sudah tertahan BR-70 pada titik yang paling menentukan, dan membatasinya berisiko menghalangi tindakan yang justru mendesak.

---
---

# Bagian 8 — Daftar tertutup jenis pemberitahuan

Enam belas jenis, dikelompokkan menurut modul asalnya. Kolom mendesak menentukan apakah ia dikirim sebagai dorongan dan apakah dapat dimatikan pengguna.

## Dari Modul 6.2 Penugasan

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `spt_diterbitkan` | SPT berpindah dari draf ke baru | Panit Penanggung Jawab | Ya | Penugasan baru diterbitkan |
| `spt_ditugaskan` | Seseorang ditunjuk sebagai pelaksana | Pelaksana yang ditunjuk | Ya | Anda ditunjuk pada penugasan |
| `spt_lewat_batas` | Pekerjaan berjadwal harian | Kanit penerbit | Tidak | Batas waktu penugasan terlampaui |
| `spt_bermasalah` | Status ditandai bermasalah | Kanit unit, Kasubdit | Ya | Penugasan ditandai bermasalah |
| `spt_dicabut` | Penunjukan pelaksana dicabut | Pelaksana yang dicabut | Tidak | Penunjukan Anda dicabut |
| `spt_ditutup` | Status berpindah ke selesai atau dibatalkan | Pelaksana yang belum dicabut | Tidak | Penugasan ditutup |

## Dari Modul 6.3 Pelaporan

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `laporan_masuk` | Laporan baru tersimpan | Panit Penanggung Jawab, Kanit unit | Tidak | Laporan kegiatan masuk |
| `laporan_dikoreksi` | Laporan disunting setelah pernah dibaca peninjau | Peninjau yang pernah membacanya | Tidak | Laporan disunting |
| `catatan_diberikan` | Catatan peninjau tersimpan | Pelapor | Ya | Catatan pada laporan Anda |
| `laporan_perlu_diperbaiki` | Catatan berjenis minta perbaikan | Pelapor | Ya | Laporan perlu diperbaiki |
| `laporan_disetujui` | Laporan disetujui | Pelapor | Tidak | Laporan disetujui |

## Dari Modul 6.4 GPS Tracking

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `sesi_ditutup_keluar_aplikasi` | Sesi ditutup karena pengguna keluar aplikasi (KP-6.4-25) | Kanit unit, Panit Penanggung Jawab | Ya | Sesi tugas terhenti |
| `izin_lokasi_terputus` | Izin lokasi dicabut saat sesi berjalan (KP-6.4-56) | Kanit unit, Panit Penanggung Jawab | Ya | Pelacakan lokasi terhenti |
| `sesi_menggantung` | Pekerjaan berjadwal menutup sesi yang dua jam tanpa pembaruan | Pemilik sesi, Kanit unit | Tidak | Sesi tugas ditutup sistem |

Ketiganya menutup calon addendum butir 16 pada Modul 6.4. Nilai yang dipakai sudah tetap dan tidak boleh diganti.

## Dari Modul 6.6 Manajemen User

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `akun_dinonaktifkan` | Akun dinonaktifkan | Kanit unit yang bersangkutan | Tidak | Akun personel dinonaktifkan |
| `kata_sandi_direset` | Kata sandi direset orang lain | Pemilik akun | Ya | Kata sandi Anda direset |

Keduanya bertujuan `akun`, bukan `penugasan`, dan tidak memiliki `penugasan_id`. Inilah yang menuntut Q-02.

## Catatan penyusunan judul

Seluruh judul menyatakan kejadian, bukan penilaian. Perhatikan `izin_lokasi_terputus` berjudul "Pelacakan lokasi terhenti", bukan "Anggota mematikan lokasi" — sebab sistem tidak mengetahui apakah izin dicabut dengan sengaja, perangkatnya bermasalah, atau pembaruan sistem mengubah pengaturannya. Menyebut kejadian selalu benar; menyebut sebab belum tentu (Prinsip 0.6, KP-6.9-33).

---
---

# Bagian 9 — Perubahan Section lain

## Section 2.3 Matriks hak akses — baris tambahan

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Menambah akun | Ya, eksklusif | Tidak | Tidak | Tidak |
| Menyunting akun | Ya, eksklusif | Tidak | Tidak | Tidak |
| Menonaktifkan akun | Ya, eksklusif | Tidak | Tidak | Tidak |
| Mereset kata sandi | Ya, siapa pun | Ya, anggota dan panit di unitnya | Tidak | Tidak |
| Melihat daftar akun | Seluruh unit | Unitnya, hanya baca | Tidak | Tidak |
| Menerima pemberitahuan | Sesuai lingkupnya | Sesuai lingkupnya | Sesuai penugasannya | Sesuai penugasannya |
| Mengatur pemberitahuan | Ya | Ya | Ya | Ya |

Akun Pemeliharaan tidak dimasukkan ke matriks karena ia bukan peran organisasi. Kewenangannya ditetapkan KP-6.6-33 sampai KP-6.6-35.

## Section 3 Glosarium — istilah tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Pemberitahuan** | Satu baris kabar tentang sebuah kejadian, ditujukan kepada satu orang. Dilarang disebut notifikasi dalam prosa, meski nama tabelnya `notifikasi` |
| **Jenis Pemberitahuan** | Salah satu dari enam belas nilai pada daftar tertutup Bagian 8 |
| **Pemberitahuan Mendesak** | Jenis yang dikirim sebagai dorongan dan tidak dapat dimatikan pengguna |
| **Dorongan** | Pengantaran pemberitahuan ke perangkat saat aplikasi tidak sedang dibuka. Hanya pada aplikasi Android terpasang |
| **Kata Sandi Awal** | Kata sandi yang dibangkitkan sistem saat akun dibuat atau direset. Ditampilkan satu kali |

## Section 8 Edge case — bagian tambahan 8.11 dan 8.12

**8.11 Pengelolaan akun**

- Akun dinonaktifkan saat berada dalam Sesi Tugas
- Penonaktifan akan menghabiskan Kasubdit aktif terakhir
- Pembuatan akun gagal setelah pengguna terbentuk pada sistem autentikasi
- NRP diubah sementara yang bersangkutan sedang masuk
- Unit dinonaktifkan sementara masih berisi personel aktif

**8.12 Pemberitahuan**

- Penerima dicabut tepat setelah pemberitahuan dibuat
- Satu kejadian menghasilkan penerima yang sama dua kali
- Sambungan waktu nyata terputus lama
- Penanda dorong menjadi tidak berlaku
- Puluhan pemberitahuan lahir sekaligus

## Section 9.6 Jejak audit — jenis tambahan

`buat_akun`, `sunting_akun`, `nonaktifkan_akun`, `aktifkan_akun`, `ubah_peran`, `ubah_unit`, `reset_kata_sandi`.

Jenis `ubah_peran` dan `ubah_unit` dipisahkan dari `sunting_akun` karena keduanya mengubah lingkup data seseorang, dan itu berbeda sifatnya dari mengubah pangkat atau memperbaiki ejaan nama.

## Section 4.2 Tumpukan teknologi — baris tambahan

| Lapisan | Teknologi | Alasan pemilihan |
| --- | --- | --- |
| Pemberitahuan dorong | Layanan pengantaran pemberitahuan pada Capacitor | Satu-satunya jalan mengantarkan kabar saat aplikasi tertutup. Hanya pada bentuk Android terpasang, sejalan dengan BR-65 |

## Section 12 Di luar cakupan — butir tambahan

| Tidak dibangun | Alasan |
| --- | --- |
| Pemberitahuan lewat surat elektronik | Email sintetis pada sistem ini tidak pernah dikirimi surat, sesuai ketetapan Modul 6.1 |
| Pemberitahuan lewat pesan singkat | Menuntut layanan berbayar dan nomor yang terdaftar, keduanya di luar cakupan |
| Penghapusan pemberitahuan oleh pengguna | Pemberitahuan adalah riwayat kabar, bukan surat yang dapat dibuang |
| Peran kelima atau peran khusus di luar empat peran organisasi | Akun Pemeliharaan bukan peran; menambahnya akan merusak seluruh matriks hak akses |

---
---

# Bagian 10 — Perubahan Lampiran

## Lampiran A — butir tambahan

| Kode | Butir | Pertanyaan | Dampak bila tidak terjawab |
| --- | --- | --- | --- |
| A-20 | Jumlah akun Kasubdit | Apakah akan ada lebih dari satu akun berperan kasubdit | BR-70 tetap berjalan, tetapi bila hanya ada satu, ia tidak akan pernah dapat dinonaktifkan lewat jalur normal |
| A-21 | Cara menyampaikan kata sandi awal | Apakah Kasubdit menyampaikannya secara lisan, tertulis, atau cara lain | Mempengaruhi apakah layar kata sandi awal perlu dapat dicetak |

## Lampiran B — bagian tambahan

**B.12 Pengelolaan akun**

- Akun tidak pernah dihapus, hanya dinonaktifkan
- Sistem selalu menyisakan sekurang-kurangnya satu Kasubdit aktif
- Kata sandi awal ditampilkan satu kali dan tidak pernah tersimpan terbaca
- Kanit dapat mereset kata sandi anggota dan panit di unitnya
- Penonaktifan akun menutup Sesi Tugas yang sedang berjalan

**B.13 Pemberitahuan**

- Enam belas jenis pada daftar tertutup, penambahan lewat revisi PRD tercatat
- Pemberitahuan mengikuti lingkup pemantauan langsung, bukan lingkup baca riwayat
- Tidak seorang pun diberi tahu tentang perbuatannya sendiri
- Jenis mendesak tidak dapat dimatikan pengguna
- Yang sudah dibaca disusutkan setelah sembilan puluh hari; yang belum dibaca tidak pernah dihapus
- Isi pemberitahuan tidak pernah memuat uraian laporan atau identitas pihak dalam perkara

---
---

# Bagian 11 — Butir uji

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-6.6-01 | Nonaktifkan akun satu-satunya Kasubdit aktif | Ditolak dengan keterangan BR-70 |
| U-6.6-02 | Nonaktifkan akun yang sedang dalam Sesi Tugas | Sesi tertutup dengan sebab penonaktifan, Rute tersimpan utuh |
| U-6.6-03 | Reset kata sandi sebelas kali dalam satu jam | Percobaan kesebelas ditolak |
| U-6.6-04 | Reset kata sandi personel unit lain sebagai Kanit | Ditolak |
| U-6.6-05 | Buat akun dengan NRP yang emailnya sudah ada pada sistem autentikasi | Ditolak dengan keterangan pemulihan, bukan galat mentah |
| U-6.6-06 | Buka jejak audit setelah reset kata sandi | Tercatat siapa mereset siapa, tanpa kata sandinya |
| U-6.9-01 | Sisipkan baris notifikasi berjenis di luar daftar | Ditolak batasan pemeriksaan |
| U-6.9-02 | Sisipkan baris notifikasi langsung dari klien | Ditolak, tidak ada hak insert |
| U-6.9-03 | Terbitkan SPT sebagai Kanit yang sekaligus Panit Penanggung Jawabnya | Ia tidak menerima pemberitahuan atas perbuatannya sendiri |
| U-6.9-04 | Cabut Panit dari SPT, lalu kirim laporan pada SPT itu | Panit yang dicabut tidak menerima pemberitahuan |
| U-6.9-05 | Buka pemberitahuan dua kali | `dibaca_pada` tidak berubah pada pembukaan kedua |
| U-6.9-06 | Ubah judul pemberitahuan lewat permintaan langsung ke basis data | Nilainya tidak berubah |
| U-6.9-07 | Baca tabel notifikasi sebagai pengguna lain | Tidak ada baris milik orang lain yang terbaca |
| U-6.9-08 | Hapus SPT permanen yang punya pemberitahuan belum dibaca | Pemberitahuannya ikut terhapus |

---
---

# Bagian 12 — Pemeriksaan mandiri: calon Addendum

Sebelas butir yang menyatakan hasil akhir tanpa menjelaskan jalur teknisnya, atau yang menuntut keputusan yang belum dapat diambil sekarang.

| No | Butir | Kriteria terkait | Yang belum jelas |
| --- | --- | --- | --- |
| 1 | Pengakhiran seluruh sesi masuk saat akun dinonaktifkan | KP-6.6-17 | Bentuk pemanggilannya pada Fungsi Tepi belum ditetapkan, dan perilaku sesi setelahnya belum diverifikasi. Serupa butir uji U-6.1-07 yang masih terbuka |
| 2 | Pembangkitan kata sandi awal | AM-6.6-03 | Fungsi pembangkitnya, tempat berjalannya, dan cara menampilkannya sekali tanpa tersimpan |
| 3 | Pembatalan pembuatan pengguna saat penyisipan barisnya gagal | EC-6.6-10 | Urutan langkah pada Fungsi Tepi belum ditetapkan |
| 4 | Perubahan email sintetis saat NRP diubah | KP-6.6-13 | Menyentuh sistem autentikasi, kemungkinan menuntut Fungsi Tepi kelima. Daftar Fungsi Tepi tertutup, sehingga ini menuntut revisi tercatat |
| 5 | Penguncian baris saat dua penonaktifan bersamaan | EC-6.6-06 | Baris mana yang dikunci belum ditetapkan, karena BR-70 menghitung lintas baris |
| 6 | Pemanggilan `buat_notifikasi` dari tiap modul pemicu | Seluruh Bagian 8 | Enam belas titik pemanggilan belum ditulis satu per satu, dan sebagiannya berada di modul yang sudah dinyatakan selesai |
| 7 | Pengantaran dorongan | KP-6.9-20 sampai KP-6.9-24 | Layanan yang dipakai, cara memperoleh penanda, dan penanganan kegagalan pengiriman |
| 8 | Penyaringan jenis yang dimatikan saat mengirim dorongan | KP-6.9-38 | Tempat penyaringan dilakukan belum ditetapkan |
| 9 | Sambungan waktu nyata untuk penghitung lonceng | KP-6.9-17 | Tabel `notifikasi` perlu didaftarkan ke layanan waktu nyata, dan penyaringan per penerima belum ditetapkan |
| 10 | Pemuatan bertahap tiga puluh baris | KP-6.9-13 | Cara penomoran halaman belum ditetapkan |
| 11 | Pemberitahuan `sesi_menggantung` | Bagian 8 | Pekerjaan berjadwal penutup sesi menggantung berada di Modul 6.4 dan belum memanggil pembuat pemberitahuan |

Butir 6 yang paling menuntut perhatian. Ia menyentuh Modul 6.2, 6.3, dan 6.4 yang seluruhnya sudah dinyatakan selesai, sehingga tidak dapat dikerjakan sebagai bagian dari modul ini saja.

---
---

# Bagian 13 — Pemeriksaan tabrakan dengan yang sudah ada

| Yang diperiksa | Hasil |
| --- | --- |
| Penomoran BR-68 sampai BR-76 | Bersih. BR tertinggi sebelumnya BR-67 |
| Penomoran KP-6.6 dan KP-6.9 | Bersih. Keduanya belum pernah dipakai |
| Nama tabel `langganan_dorong` | Bersih |
| Nama fungsi `buat_notifikasi`, `penerima_pengawas_spt`, `penerima_pelaksana_spt` | Bersih |
| Nama pemicu `trg_notifikasi_hanya_tandai_baca` | Bersih, dan berawalan `trg_` sesuai Bagian I.8 |
| Kolom baru pada `notifikasi` | Tidak menabrak. Bentuk lamanya berstatus kerangka |
| Amandemen BR-51 | Sah. BR-51 mensyaratkan penambahan lewat revisi tercatat, dan berkas ini adalah revisi itu |
| Penerapan BR-64 zona waktu | Diterapkan pada pengelompokan daftar (Q-08) |
| Penerapan BR-66 hak akses | Diterapkan pada kedua tabel dan seluruh fungsi |
| Penerapan BR-37 security_invoker | Tidak ada tampilan yang lahir di modul ini |
| Penerapan aturan penamaan `trg_` dan `fn_` | Diterapkan |
| Nilai `sebab_penutupan` baru | `akun_dinonaktifkan` ditambahkan ke daftar Modul 6.4. Perlu ditempel ke sana |

## Yang belum dapat diperiksa

| Perkara | Sebab |
| --- | --- |
| Kesesuaian dengan Modul 6.5 | Belum digali. Lonceng dan penghitung akan tampil di sana |
| Kesesuaian dengan Modul 6.7 dan 6.8 | Belum digali. Keduanya mungkin menambah jenis pemberitahuan, dan penambahan itu wajib lewat revisi tercatat sesuai BR-68 |

---

## Yang perlu dikerjakan setelah menempel berkas ini

| Urutan | Langkah |
| --- | --- |
| 1 | Tempelkan Bagian 0 sampai 10 ke tempatnya masing-masing pada PRD |
| 2 | Tambahkan nilai `akun_dinonaktifkan` ke daftar `sebab_penutupan` pada Modul 6.4 |
| 3 | Naikkan versi PRD menjadi 0.7 dan perbarui Riwayat Revisi |
| 4 | Perbarui Checklist: 6.6 dan 6.9 selesai, **aturan berikutnya mulai BR-77**, butir A-20 dan A-21 ditambahkan |
| 5 | Gali Addendum untuk kedua modul memakai sebelas butir Bagian 12, atau tunda ke satu addendum gabungan setelah 6.5 selesai |
| 6 | Lanjut ke Modul 6.5, yang kini dapat merujuk lonceng dan penghitung tanpa tempat kosong |


---
---
