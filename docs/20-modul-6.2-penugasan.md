# Modul 6.2 — Manajemen Penugasan (SPT)

Memuat penggalian modul beserta Addendum 6.2-T.

> **Penomoran.** Addendum 6.2-T Bagian 0 menggeser penomoran aturan modul ini.
> Saat membaca bagian penggalian, terjemahkan kode BR menurut tabel pada Addendum
> 6.2-T Bagian 0.2. Di sini pula lahir Penjadwal Basis Data (pg_cron).

---
---

# SiPANTAU — Revisi PRD: Modul 6.2 Manajemen Penugasan (SPT)

**Tanggal: 1 Agustus 2026 · Status: [FINAL] · Menggantikan Section 6.2 versi kerangka 0.2**

Berkas ini disusun mengikuti kerangka Section 6.0 dan meneruskan pola berkas Revisi v0.3 milik Modul 6.1. Isinya: pengganti Section 6.2 secara utuh, ditambah perubahan pada Section 2, 3, 5, 7, 8, 9, serta Lampiran A dan B yang menjadi akibatnya.

Prioritas konflik mengikuti Section 0.3. Bila berkas ini bertentangan dengan versi 0.2, berkas ini yang berlaku. Bila bertentangan dengan Addendum 6.1-T, Addendum 6.1-T yang berlaku karena ia menyentuh fondasi autentikasi.

---

## Cara memakai berkas ini

| Bagian berkas ini | Ditempel ke PRD sebagai |
| --- | --- |
| Bagian 1 | Pengganti Section 2.3 (dua baris matriks) |
| Bagian 2 | Tambahan Section 3.1, 3.2, dan 3.7 baru |
| Bagian 3 | Pengganti Section 5.2 dan 5.3, tambahan Section 5.15 sampai 5.18, amandemen 5.10 dan 5.11 |
| Bagian 4 | Pengganti Section 6.2 secara utuh |
| Bagian 5 | Tambahan Section 7 (BR-23 sampai BR-31) |
| Bagian 6 | Tambahan Section 8.8 baru |
| Bagian 7 | Tambahan Section 9.2 |
| Bagian 8 | Perubahan Lampiran A dan B |
| Bagian 9 | Bukan untuk ditempel — daftar celah yang akan ditutup Addendum 6.2-T |

---

## Riwayat Revisi — baris tambahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.4 | 1 Agu 2026 | Modul 6.2 digali sampai final. Matriks 2.3 diamandemen: Kanit dapat menjadi pelaksana. Status SPT bertambah dari empat menjadi enam nilai. Tiga tabel baru: penugasan_dasar, penugasan_lokasi, sesi_tugas. Butir A-10 terjawab, empat butir konfirmasi baru muncul |

---
---

# Bagian 1 — Perubahan Section 2.3 Matriks Hak Akses

Dua baris berubah. Sisanya tetap seperti berkas Revisi v0.3.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Membuka dan menutup Sesi Tugas | Tidak | **Ya, bila dicantumkan sebagai pelaksana** | Ya, bila dicantumkan sebagai pelaksana | Ya |
| Mengirim Pelaporan Kegiatan Harian | Tidak | **Ya, bila dicantumkan sebagai pelaksana** | Ya, bila dicantumkan sebagai pelaksana | Ya |

### Alasan perubahan

Pada Surat Perintah Tugas yang sesungguhnya, nama Kanit tercantum sebagai petugas nomor satu pada daftar pelaksana. Matriks versi sebelumnya menutup kemungkinan itu, sehingga sistem akan memaksa kenyataan lapangan berbohong: Kanit yang benar-benar turun tidak punya cara mencatat kegiatannya, dan rutenya tidak terekam sama sekali.

Yang **tidak** berubah:

- Menyusun LHP Ringkas tetap hanya kewenangan Anggota. Kanit maupun Panit yang turun ke lapangan tetap tidak menyusun LHP. Bahan dari Sesi Tugas mereka masuk ke LHP yang disusun Anggota dalam SPT yang sama.
- Kehadiran Kanit atau Panit pada daftar pelaksana **tidak** menggantikan syarat minimal satu pelaksana berperan Anggota (BR-30).
- Lingkup data tidak melebar. Kanit tetap membaca unitnya, Panit tetap membaca penugasan yang diawasinya.

---
---

# Bagian 2 — Tambahan Section 3 Glosarium

## 3.1 Istilah peran — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Pelaksana** | Orang yang dicantumkan pada sebuah SPT untuk melaksanakan kegiatan lapangan. Dapat berperan Anggota, Panit, atau Kanit. Menggantikan pemakaian kata "Anggota pelaksana" pada versi 0.2, yang kini menjadi terlalu sempit. |

## 3.2 Istilah penugasan dan kegiatan — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Nomor Agenda** | Bagian nomor urut pada nomor SPT, berasal dari buku agenda Bagian Administrasi di luar SiPANTAU. Boleh memuat sufiks huruf untuk surat susulan, contoh 850.a. Sistem tidak pernah membangkitkannya sendiri. |
| **Dasar Penugasan** | Surat, laporan, atau disposisi yang menjadi landasan terbitnya sebuah SPT. Satu SPT dapat memiliki lebih dari satu, dan jenisnya berbeda-beda. |
| **Titik Lokasi** | Satu tempat yang tercantum pada SPT, bernomor urut. Titik Lokasi boleh memiliki koordinat, boleh pula hanya berupa keterangan tempat tanpa koordinat. Yang berkoordinat menjadi dasar penghitungan kedekatan laporan pada Modul 6.3. |
| **Lewat Batas** | Penanda tampilan pada SPT yang tanggal batasnya sudah terlampaui sementara statusnya belum Selesai maupun Dibatalkan. Penanda, bukan status. |

## 3.7 Istilah siklus hidup SPT — bagian baru

| Istilah | Definisi tunggal |
| --- | --- |
| **Draf** | SPT yang sedang disusun Kanit dan belum terbit. Tidak terlihat oleh siapa pun selain penyusunnya. Tidak memicu pemberitahuan apa pun. |
| **Terbitkan** | Tindakan Kanit yang memindahkan SPT dari Draf ke Baru. Sejak saat itu SPT terlihat oleh tim, tercatat pada jejak audit, dan sebagian kolomnya terkunci. |
| **Dibatalkan** | Status akhir bagi SPT yang terbit keliru. Berbeda dari Selesai: Dibatalkan berarti kegiatannya tidak pernah dianggap berlangsung. Wajib disertai alasan tertulis. |
| **Ditandai Bermasalah** | Tindakan manusia, bukan sistem, yang memindahkan status SPT ke Bermasalah disertai jenis masalah dan uraian wajib. |

---
---

# Bagian 3 — Perubahan Model Data

## 5.2 Tabel penugasan — pengganti utuh

**[FINAL]**

Menyimpan SPT. Hanya Kanit yang boleh membuat baris pada tabel ini.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| nomor_spt | text | Nomor surat perintah tugas, unik se-sistem. Diketik Kanit mengikuti surat fisik. Boleh kosong selama status masih draf |
| jenis_kegiatan | enum | penyelidikan, pulbaket, pengamanan. Menentukan awalan nomor SPT yang disodorkan sistem |
| judul | text | Judul penyelidikan |
| objek | text | Objek penyelidikan |
| sasaran | text | Sasaran kegiatan |
| uraian_tugas | text | Uraian naratif tugas yang diperintahkan |
| nomor_lp | text | Nomor Laporan Polisi. **Boleh kosong** — pulbaket awal kerap belum memilikinya |
| sumber_informasi | text | **Boleh kosong** — ada perkara yang sumbernya tidak dituliskan |
| unit_id | uuid | Mengacu ke unit. Menentukan siapa yang boleh melihat |
| prioritas | enum | normal, penting, urgent |
| status | enum | draf, baru, berjalan, bermasalah, selesai, dibatalkan |
| tanggal_mulai | date | Awal berlakunya penugasan |
| tanggal_batas | date | Batas waktu penugasan |
| berkas_surat_path | text | Jalur berkas pindaian surat asli pada Storage. Boleh kosong sampai menjelang penutupan, lihat BR-25 |
| diterbitkan_oleh | uuid | Mengacu ke users, wajib berperan kanit |
| ditugaskan_oleh | uuid | Mengacu ke users, wajib berperan kanit. Sama dengan diterbitkan_oleh pada keadaan biasa |
| diterbitkan_pada | timestamptz | Waktu tombol Terbitkan ditekan. Menjadi dasar bulan romawi pada nomor SPT |
| ditutup_oleh | uuid | Kanit yang menutup ke status selesai |
| ditutup_pada | timestamptz | Waktu penutupan |
| dibatalkan_oleh | uuid | Kanit atau Kasubdit yang membatalkan |
| dibatalkan_pada | timestamptz | Waktu pembatalan |
| alasan_pembatalan | text | Wajib terisi bila status bernilai dibatalkan |

**Kolom yang dicabut dari versi 0.2:** `lokasi`, `lokasi_lat`, `lokasi_lng`. Ketiganya pindah ke tabel `penugasan_lokasi` karena satu SPT dapat memuat lebih dari satu tempat.

> **Catatan amandemen.** Versi kerangka 0.2 menyatakan status SPT memiliki empat nilai. Kini enam. Dua nilai tambahan, `draf` dan `dibatalkan`, lahir dari keputusan pemilik produk pada penggalian ini. Butir "Status memiliki empat nilai" pada Section 6.2 versi 0.2 dicabut.

## 5.3 Tabel penugasan_pelaksana — pengganti tabel penugasan_anggota

**[FINAL]**

Menghubungkan satu SPT dengan orang-orang yang melaksanakannya. Diganti namanya dari `penugasan_anggota` karena pelaksana kini dapat berperan Anggota, Panit, maupun Kanit.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| pelaksana_id | uuid | Mengacu ke users. Boleh berperan anggota, panit, atau kanit |
| urutan | integer | Urutan tampil pada daftar petugas, mengikuti urutan pada surat fisik |
| ditugaskan_pada | timestamptz | Waktu pencantuman |
| dibaca_pada | timestamptz | Waktu pelaksana pertama kali membuka rincian SPT ini. Boleh kosong. Inilah tanda terima |
| dicabut_pada | timestamptz | Boleh kosong. Terisi berarti pelaksana sudah dikeluarkan dari SPT |
| dicabut_oleh | uuid | Kanit yang mencabut |
| alasan_pencabutan | text | Wajib terisi bila dicabut_pada terisi |

Pasangan `penugasan_id` dan `pelaksana_id` bersifat unik. **Baris tidak dihapus**, hanya ditandai dicabut, agar laporan dan rute yang sudah terekam tetap punya induk yang sah (BR-27).

**Kolom yang dicabut dari versi 0.2:** `sesi_aktif`, `sesi_mulai`, `sesi_selesai`. Ketiganya pindah ke tabel `sesi_tugas` — lihat 5.17 beserta alasannya.

## 5.10 Tabel unit — amandemen

Satu kolom ditambahkan pada tabel yang sudah bertanda [FINAL] di Modul 6.1:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| kode_klasifikasi | text | Kode klasifikasi surat milik unit, contoh RES.5.3. Dipakai menyusun nomor SPT. Tidak dapat diturunkan dari data mana pun, diisi saat pemasangan |

## 5.11 Tabel penugasan_panit — amandemen

Tiga kolom ditambahkan pada tabel yang sudah bertanda [FINAL] di Modul 6.1:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| dicabut_pada | timestamptz | Boleh kosong. Terisi berarti penunjukan sebagai Panit Penanggung Jawab sudah berakhir |
| dicabut_oleh | uuid | Kanit yang mencabut |
| alasan_pencabutan | text | Wajib terisi bila dicabut_pada terisi |

Ketentuan Modul 6.1 bahwa baris tidak pernah dihapus tetap berlaku dan kini punya wujud teknisnya. Akibat kolom ini terhadap aturan akses baris dijelaskan pada Bagian 7 dan menjadi salah satu celah yang ditutup Addendum 6.2-T.

## 5.15 Tabel penugasan_dasar — tabel baru

**[FINAL]**

Menyimpan landasan terbitnya SPT. Dibuat sebagai tabel tersendiri karena satu SPT lazim memiliki beberapa dasar dengan jenis berbeda.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| urutan | integer | Urutan tampil, mengikuti penomoran pada surat |
| jenis | enum | laporan_informasi, laporan_polisi, laporan_pengaduan, surat_perintah_terdahulu, disposisi_pimpinan, lainnya |
| nomor | text | Nomor surat atau laporan yang dijadikan dasar |
| tanggal | date | Tanggal surat atau laporan tersebut |
| keterangan | text | Uraian singkat, boleh kosong. Wajib terisi bila jenis bernilai lainnya |

Setiap SPT wajib memiliki sekurang-kurangnya satu baris pada tabel ini sebelum dapat diterbitkan.

## 5.16 Tabel penugasan_lokasi — tabel baru

**[FINAL]**

Menyimpan tempat-tempat yang tercantum pada SPT, berurutan.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| urutan | integer | Nomor titik: 1, 2, 3, dan seterusnya. Menentukan penamaan Titik 1, Titik 2 di antarmuka |
| nama | text | Nama tempat, contoh Bandara Internasional Kertajati |
| alamat | text | Alamat lengkap dalam bentuk teks, boleh kosong |
| keterangan | text | Peran titik ini dalam perkara, contoh lokasi pemeriksaan, lokasi transaksi. Boleh kosong |
| lat | numeric | Lintang. **Boleh kosong** |
| lng | numeric | Bujur. **Boleh kosong** |
| radius_meter | integer | Ambang jarak titik ini, bawaan 300, rentang 100 sampai 2000. Kosong bila titik tanpa koordinat |

Ketentuan:

- Sekurang-kurangnya satu titik wajib memiliki koordinat sebelum SPT dapat diterbitkan. Tanpa itu, Modul 6.3 tidak punya pembanding untuk menetapkan status lokasi laporan.
- Titik tanpa koordinat diperbolehkan dan bukan kekurangan data. Ada tempat yang memang tidak dapat dijatuhi pin, misalnya wilayah negara lain pada perkara lintas batas.
- Titik yang sudah pernah dirujuk sebuah laporan tidak boleh dihapus, hanya boleh disunting. Lihat KP-6.2-42.

## 5.17 Tabel sesi_tugas — tabel baru

**[KERANGKA]** — bentuk akhirnya ditetapkan pada Modul 6.4. Dibentuk di sini karena Modul 6.2 sudah membutuhkannya.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | SPT yang sedang dikerjakan |
| pengguna_id | uuid | Pemegang sesi. Boleh berperan anggota, panit, atau kanit |
| dibuka_pada | timestamptz | Waktu Mulai Tugas |
| ditutup_pada | timestamptz | Waktu Selesai Tugas. Kosong berarti sesi masih berjalan |
| sebab_penutupan | enum | Ditetapkan pada Modul 6.4. Sekurang-kurangnya memuat nilai untuk penutupan manual dan penutupan akibat keluar aplikasi (BR-19) |

> **Mengapa tabel tersendiri, bukan kolom pada tabel penghubung.** Versi 0.2 menyimpan keadaan sesi sebagai tiga kolom pada `penugasan_anggota`, sehingga hanya sesi terakhir yang tersimpan. Satu SPT berlangsung berhari-hari dan orang yang sama membuka lalu menutup sesi berkali-kali; dengan rancangan lama, rute hari pertama hilang begitu sesi hari kedua dibuka. Sejak Modul 6.1 memberi Panit kewenangan membuka Sesi Tugas dan penggalian ini menambahkan Kanit, rancangan lama juga akan menuntut kolom kembar di tiga tabel penghubung yang berbeda.
>
> Tabel tersendiri sekaligus memberi tempat penegakan aturan satu sesi aktif per orang (BR-24), yang tidak mungkin ditegakkan bila keadaannya tersebar di beberapa tabel.

## 5.18 Perubahan tabel laporan_harian

**[KERANGKA]** — difinalkan pada Modul 6.3. Dua perubahan sudah pasti dan dicatat di sini agar tidak terlewat:

| Perubahan | Alasan |
| --- | --- |
| Kolom `anggota_id` diganti nama menjadi `pelapor_id` | Pelapor kini dapat berperan Anggota, Panit, atau Kanit |
| Kolom baru `lokasi_id` uuid, boleh kosong, mengacu ke penugasan_lokasi | Menandai laporan ini dibuat di titik yang mana |

## 5.8 Hubungan antar entitas — pengganti

```
unit
 └── penugasan
       ├── penugasan_dasar        (jamak, minimal 1)
       ├── penugasan_lokasi       (jamak, minimal 1 berkoordinat)
       ├── penugasan_panit        (jamak, minimal 1 aktif)
       ├── penugasan_pelaksana    (jamak, minimal 1 berperan anggota)
       ├── sesi_tugas             (jamak, milik 6.4)
       ├── laporan_harian         (jamak, milik 6.3)
       └── lhp                    (milik 6.8)
```

---
---

# Bagian 4 — Pengganti Section 6.2 secara utuh

**Status: [FINAL]**

## 6.2.1 Deskripsi

Modul ini mengatur seluruh daur hidup Surat Perintah Tugas di dalam sistem: penyusunan draf, penerbitan oleh Kanit, penyusunan tim, penyuntingan, perpanjangan, penandaan bermasalah, penutupan, pembatalan, serta penyajian daftar dan riwayat sesuai lingkup data tiap peran. Modul ini adalah tempat lahirnya seluruh konteks yang dipakai modul lain — tidak ada laporan, titik koordinat, foto, maupun LHP yang boleh ada tanpa SPT yang menaunginya.

Yang **bukan** urusan modul ini: pembukaan dan penutupan Sesi Tugas beserta perekaman posisi (Modul 6.4), isi dan peninjauan laporan harian (Modul 6.3), penyusunan LHP (Modul 6.8), serta pengiriman pemberitahuan (Modul 6.9). Modul ini hanya menetapkan **kapan** pemberitahuan harus terpicu, bukan bagaimana ia dikirim.

Satu hal yang sengaja tidak dilakukan modul ini: **menerbitkan nomor surat**. SiPANTAU bukan sistem persuratan. Nomor agenda hidup di buku agenda Bagian Administrasi, dan sistem hanya menyodorkan kerangka nomor lalu menerima apa yang diketik Kanit.

## 6.2.2 Cerita pengguna

**Kanit**

- Sebagai Kanit, saya ingin menyusun SPT secara bertahap sebagai draf, agar saya dapat menyicilnya sambil menunggu nomor agenda keluar tanpa mengirim penugasan setengah jadi kepada tim.
- Sebagai Kanit, saya ingin sistem menyodorkan kerangka nomor SPT yang sudah terisi bulan, tahun, kode klasifikasi, dan kesatuan, agar saya cukup mengetik nomor agendanya saja.
- Sebagai Kanit, saya ingin mencantumkan beberapa dasar penugasan sekaligus, agar SPT di sistem sama isinya dengan surat fisik.
- Sebagai Kanit, saya ingin menandai beberapa titik lokasi berurutan pada peta, agar tim tahu tempat mana yang menjadi sasaran pertama, kedua, dan seterusnya.
- Sebagai Kanit, saya ingin menunjuk Panit Penanggung Jawab dan pelaksana dalam satu formulir, agar susunan tim selesai bersamaan dengan terbitnya SPT.
- Sebagai Kanit, saya ingin mencantumkan nama saya sendiri sebagai pelaksana bila saya ikut turun, agar kegiatan saya di lapangan ikut terekam.
- Sebagai Kanit, saya ingin memperpanjang batas waktu disertai alasan, agar perpanjangan tercatat dan tidak terlihat seperti manipulasi tanggal.
- Sebagai Kanit, saya ingin menutup SPT yang sudah rampung, agar daftar penugasan aktif tetap bersih.
- Sebagai Kanit, saya ingin membatalkan SPT yang keliru terbit disertai alasan, agar kekeliruan tercatat dan tidak sekadar hilang.
- Sebagai Kanit, saya ingin mengetahui siapa dari tim yang belum membuka SPT-nya, agar saya dapat menghubunginya langsung.

**Panit**

- Sebagai Panit, saya ingin melihat hanya penugasan yang saya awasi, agar perhatian saya tidak terpecah pada perkara yang bukan tanggung jawab saya.
- Sebagai Panit, saya ingin menandai penugasan sebagai bermasalah disertai uraian, agar Kanit tahu keadaannya tanpa perlu saya telepon.
- Sebagai Panit, saya ingin tetap dapat membaca penugasan lama yang pernah saya awasi, agar saya punya rujukan saat menangani perkara serupa.

**Anggota**

- Sebagai Anggota, saya ingin melihat daftar penugasan yang ditujukan kepada saya beserta batas waktunya, agar saya tahu apa yang harus dikerjakan hari ini.
- Sebagai Anggota, saya ingin membaca rincian penugasan lengkap dengan titik lokasi dan uraian tugas, agar saya paham apa yang diperintahkan sebelum berangkat.
- Sebagai Anggota, saya ingin menandai penugasan sebagai bermasalah ketika alamatnya ternyata fiktif, agar keadaan itu tercatat resmi dan bukan sekadar cerita lisan.

**Kasubdit**

- Sebagai Kasubdit, saya ingin melihat seluruh penugasan lintas unit dengan penyaring per unit, agar saya dapat menimbang beban kerja tiap unit.

## 6.2.3 Kriteria penerimaan

### Penyusunan draf dan penerbitan

| Kode | Kriteria |
| --- | --- |
| KP-6.2-01 | Bila pengguna berperan selain Kanit membuka halaman Penugasan, maka tombol Terbitkan Penugasan tidak ditampilkan sama sekali |
| KP-6.2-02 | Bila Kanit menyimpan formulir penugasan tanpa menekan Terbitkan, maka SPT tersimpan berstatus draf dan tidak terlihat oleh siapa pun selain Kanit penyusunnya |
| KP-6.2-03 | Bila SPT berstatus draf, maka tidak ada pemberitahuan yang terkirim kepada siapa pun |
| KP-6.2-04 | Bila Kanit menekan Terbitkan sementara salah satu dari empat syarat belum terpenuhi — minimal satu dasar penugasan, minimal satu titik lokasi berkoordinat, minimal satu Panit Penanggung Jawab, minimal satu pelaksana berperan Anggota — maka penerbitan ditolak dan sistem menyebutkan syarat mana yang kurang |
| KP-6.2-05 | Bila Kanit menekan Terbitkan sementara nomor SPT masih kosong, maka penerbitan ditolak |
| KP-6.2-06 | Bila SPT berhasil diterbitkan, maka statusnya menjadi baru, kolom diterbitkan_pada terisi waktu server, dan seluruh Panit Penanggung Jawab beserta pelaksana menerima pemberitahuan |
| KP-6.2-07 | Bila SPT sudah terbit, maka kolom nomor_spt, unit_id, dan tanggal_mulai tidak dapat lagi disunting oleh siapa pun |
| KP-6.2-08 | Bila Kanit menerbitkan SPT untuk unit selain unitnya sendiri, maka tindakan ditolak di tingkat basis data, bukan hanya di antarmuka |

### Nomor SPT

| Kode | Kriteria |
| --- | --- |
| KP-6.2-09 | Bila Kanit membuka formulir penugasan baru dan memilih jenis kegiatan, maka sistem menyodorkan kerangka nomor dengan bagian nomor agenda dikosongkan, dan bagian lainnya terisi dari jenis kegiatan, bulan berjalan dalam angka romawi, kode klasifikasi unit, tahun berjalan, dan nama kesatuan |
| KP-6.2-10 | Bila Kanit mengetik nomor agenda, maka sistem menerima angka dengan sufiks huruf opsional, contoh 850 maupun 850.a |
| KP-6.2-11 | Bila Kanit menimpa seluruh nomor dengan bentuk yang tidak sesuai pola, maka sistem menampilkan peringatan tetapi **tetap mengizinkan** penyimpanan, sejalan dengan BR-05 |
| KP-6.2-12 | Bila nomor SPT yang diketik sudah dipakai SPT lain di seluruh sistem, maka penyimpanan ditolak dan sistem menyebutkan SPT mana yang sudah memakainya, sepanjang SPT tersebut berada dalam lingkup data pengguna |
| KP-6.2-13 | Bila SPT yang sudah dipakai berada di luar lingkup data pengguna, maka sistem hanya menyatakan nomor sudah terpakai tanpa menyebutkan rinciannya |

### Dasar penugasan dan titik lokasi

| Kode | Kriteria |
| --- | --- |
| KP-6.2-14 | Bila Kanit menambah dasar penugasan, maka ia mengisi jenis, nomor, dan tanggal, dan dapat menambah baris berikutnya tanpa batas |
| KP-6.2-15 | Bila jenis dasar bernilai lainnya, maka kolom keterangan wajib terisi |
| KP-6.2-16 | Bila Kanit menambah titik lokasi, maka ia dapat menetapkan koordinatnya dengan tiga cara: menjatuhkan pin di peta, mengetik lintang dan bujur, atau mencari nama tempat |
| KP-6.2-17 | Bila Kanit menambah titik lokasi tanpa koordinat, maka titik tetap tersimpan sebagai keterangan tempat dan tidak dipakai menghitung kedekatan laporan |
| KP-6.2-18 | Bila titik lokasi memiliki koordinat, maka radius bawaannya 300 meter dan dapat diubah dalam rentang 100 sampai 2000 meter |
| KP-6.2-19 | Bila Kanit mengubah urutan titik lokasi, maka penomoran Titik 1, Titik 2, dan seterusnya ikut berubah pada seluruh tampilan, sedangkan laporan yang sudah tertaut tetap menunjuk titik yang sama |

### Susunan tim

| Kode | Kriteria |
| --- | --- |
| KP-6.2-20 | Bila Kanit menyusun tim, maka daftar orang yang dapat dipilih hanya memuat pengguna aktif di unitnya sendiri, dan tidak pernah memuat Akun Pemeliharaan |
| KP-6.2-21 | Bila Kanit mencantumkan dirinya sendiri sebagai pelaksana, maka pencantuman diterima dan ia memperoleh kemampuan membuka Sesi Tugas serta mengirim laporan harian pada SPT tersebut saja |
| KP-6.2-22 | Bila seorang Panit dicantumkan sekaligus sebagai Panit Penanggung Jawab dan sebagai pelaksana pada SPT yang sama, maka keduanya diterima, tetapi tombol beri catatan tidak ditampilkan pada laporan miliknya sendiri |
| KP-6.2-23 | Bila Kanit mencabut seorang pelaksana, maka ia wajib mengisi alasan, baris tidak dihapus melainkan ditandai dicabut, dan laporan, foto, serta rute yang sudah terekam tetap ada |
| KP-6.2-24 | Bila seorang pelaksana dicabut, maka SPT tersebut hilang dari daftar aktifnya, tetapi tetap terbaca pada riwayatnya dengan penanda dicabut beserta tanggalnya |
| KP-6.2-25 | Bila Kanit mencabut Panit Penanggung Jawab terakhir pada sebuah SPT, maka pencabutan ditolak dengan keterangan bahwa SPT harus selalu memiliki sekurang-kurangnya satu Panit Penanggung Jawab aktif |
| KP-6.2-26 | Bila Kanit mencabut pelaksana berperan Anggota terakhir pada sebuah SPT, maka pencabutan ditolak dengan keterangan serupa |
| KP-6.2-27 | Bila seorang Panit dicabut penunjukannya, maka ia tidak lagi menerima pemberitahuan dan tidak dapat memberi catatan baru pada laporan di SPT tersebut, tetapi tetap dapat membacanya |
| KP-6.2-28 | Bila pelaksana membuka rincian SPT untuk pertama kalinya, maka kolom dibaca_pada terisi waktu server tanpa tindakan tambahan dari pengguna |
| KP-6.2-29 | Bila Kanit membuka daftar pelaksana, maka setiap orang menampilkan penanda sudah membuka atau belum membuka beserta waktunya |

### Status dan perpindahannya

| Kode | Kriteria |
| --- | --- |
| KP-6.2-30 | Bila laporan harian pertama masuk pada sebuah SPT berstatus baru, maka statusnya berpindah ke berjalan tanpa campur tangan siapa pun |
| KP-6.2-31 | Bila Sesi Tugas dibuka pada SPT berstatus baru, maka status **tidak** berubah, dan kartu SPT menampilkan lencana terpisah berisi jumlah sesi tugas yang sedang berjalan |
| KP-6.2-32 | Bila pelaksana atau Panit Penanggung Jawab menandai SPT sebagai bermasalah, maka ia wajib memilih jenis masalah dan mengisi uraian, dan status berpindah ke bermasalah |
| KP-6.2-33 | Bila SPT ditandai bermasalah, maka Kanit dan seluruh Panit Penanggung Jawab menerima pemberitahuan berisi jenis masalah dan uraiannya |
| KP-6.2-34 | Bila SPT berstatus bermasalah, maka pelaksana **tetap** dapat membuka Sesi Tugas dan mengirim laporan. Bermasalah adalah keterangan keadaan, bukan penghentian kegiatan |
| KP-6.2-35 | Bila Kanit mengembalikan SPT dari bermasalah, maka status kembali ke berjalan dan alasan pengembalian wajib diisi |
| KP-6.2-36 | Bila tanggal batas terlampaui sementara status belum selesai maupun dibatalkan, maka SPT menampilkan penanda Lewat Batas dan Kanit menerima pemberitahuan. Status **tidak** berubah dengan sendirinya |
| KP-6.2-37 | Bila sistem hendak menandai sebuah SPT sebagai bermasalah tanpa tindakan manusia, maka itu adalah cacat. Status bermasalah hanya berasal dari manusia |

### Penyuntingan dan perpanjangan

| Kode | Kriteria |
| --- | --- |
| KP-6.2-38 | Bila SPT berstatus baru, berjalan, atau bermasalah, maka Kanit dapat menyunting judul, objek, sasaran, uraian tugas, jenis kegiatan, nomor LP, sumber informasi, prioritas, dasar penugasan, titik lokasi, dan susunan tim |
| KP-6.2-39 | Bila SPT disunting setelah terbit, maka perubahan tercatat pada jejak audit lengkap dengan nama kolom, nilai lama, dan nilai baru |
| KP-6.2-40 | Bila SPT disunting sementara ada Sesi Tugas yang sedang berjalan untuk SPT tersebut, maka penyuntingan tetap diizinkan dan pemegang sesi menerima pemberitahuan Penugasan diperbarui |
| KP-6.2-41 | Bila Kanit mengubah tanggal batas, maka alasan wajib diisi, tidak ada batas berapa kali perpanjangan boleh dilakukan, dan seluruh riwayat perpanjangan terbaca pada rincian SPT |
| KP-6.2-42 | Bila Kanit menghapus titik lokasi yang sudah dirujuk sebuah laporan, maka penghapusan ditolak. Titik tersebut hanya dapat disunting |
| KP-6.2-43 | Bila SPT berstatus selesai atau dibatalkan, maka seluruh kolom terkunci dan tidak ada tombol sunting yang ditampilkan |

### Penutupan, pembatalan, pembukaan kembali

| Kode | Kriteria |
| --- | --- |
| KP-6.2-44 | Bila Kanit menekan Tutup Penugasan, maka sistem menampilkan daftar hal yang belum beres — Sesi Tugas yang masih terbuka, LHP Ringkas yang belum masuk, pelaksana yang belum pernah melapor — lalu **tetap mengizinkan** penutupan bila Kanit melanjutkan |
| KP-6.2-45 | Bila SPT hendak ditutup sementara berkas surat perintah belum dilampirkan, maka penutupan ditolak sampai berkas diunggah |
| KP-6.2-46 | Bila SPT ditutup, maka seluruh Sesi Tugas yang masih terbuka pada SPT tersebut ikut ditutup dan rutenya tersimpan utuh |
| KP-6.2-47 | Bila Kanit membatalkan SPT, maka alasan pembatalan wajib diisi, status menjadi dibatalkan, dan seluruh tim menerima pemberitahuan |
| KP-6.2-48 | Bila SPT belum pernah memiliki laporan, foto, rute, maupun Sesi Tugas, maka Kanit dapat menghapusnya secara permanen. Selain keadaan itu, satu-satunya jalan adalah pembatalan |
| KP-6.2-49 | Bila SPT dihapus permanen, maka penghapusannya tetap tercatat pada jejak audit lengkap dengan nomor SPT dan judulnya |
| KP-6.2-50 | Bila Kanit unit pemilik atau Kasubdit membuka kembali SPT berstatus selesai, maka status kembali ke berjalan, alasan wajib diisi, dan seluruh tim menerima pemberitahuan |
| KP-6.2-51 | Bila SPT berstatus dibatalkan, maka ia tidak dapat dibuka kembali dalam bentuk apa pun |

### Daftar, riwayat, lingkup data

| Kode | Kriteria |
| --- | --- |
| KP-6.2-52 | Bila pengguna membuka halaman Penugasan, maka yang tampil hanya SPT berstatus baru, berjalan, dan bermasalah |
| KP-6.2-53 | Bila pengguna membuka submenu Riwayat, maka yang tampil adalah SPT berstatus selesai dan dibatalkan, dengan penyaring bawaan enam bulan ke belakang dan tanpa batas jangkauan bila penyaring dilonggarkan |
| KP-6.2-54 | Bila Kanit membuka daftar, maka ia melihat seluruh SPT unitnya termasuk drafnya sendiri, dan tidak pernah melihat draf Kanit lain |
| KP-6.2-55 | Bila Panit membuka daftar, maka ia hanya melihat SPT tempat ia ditunjuk sebagai Panit Penanggung Jawab, baik penunjukan yang masih aktif maupun yang sudah dicabut |
| KP-6.2-56 | Bila Anggota membuka daftar, maka ia hanya melihat SPT tempat ia dicantumkan sebagai pelaksana |
| KP-6.2-57 | Bila Kasubdit membuka daftar, maka ia melihat seluruh SPT lintas unit dan memperoleh penyaring tambahan berupa unit |
| KP-6.2-58 | Bila seorang Panit belum pernah ditunjuk pada satu SPT pun, maka menu Penugasan tidak ditampilkan padanya. Begitu ia pernah ditunjuk sekali, menu tampil seterusnya |
| KP-6.2-59 | Bila daftar ditampilkan tanpa penyaring, maka urutannya prioritas menurun, lalu tanggal batas terdekat di atas, lalu yang terbaru |
| KP-6.2-60 | Bila pengguna mengetik pada kotak pencarian, maka sistem menyisir nomor SPT, judul, objek, sasaran, nama titik lokasi, serta nama dan NRP anggota tim, terbatas pada data dalam lingkupnya |

### Jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.2-61 | Bila terjadi salah satu tindakan berikut, maka satu baris jejak audit tercatat: terbit_spt, sunting_spt, tutup_spt, batal_spt, hapus_spt, buka_kembali_spt, tandai_bermasalah, kembalikan_dari_bermasalah, perpanjang_batas, tambah_pelaksana, cabut_pelaksana, tunjuk_panit, cabut_panit |
| KP-6.2-62 | Bila SPT masih berstatus draf, maka penyuntingannya **tidak** dicatat pada jejak audit. Draf belum menjadi dokumen |

## 6.2.4 Aturan modul

1. **Sistem tidak menerbitkan nomor surat.** Bagian nomor agenda selalu berasal dari manusia. Kerangka nomor yang disodorkan sistem adalah bantuan pengetikan, bukan penomoran resmi.
2. **Tim melekat pada SPT.** Tidak ada susunan tim yang berlaku permanen di tingkat unit. Setiap SPT menyusun timnya sendiri dari awal.
3. **Tidak ada baris penghubung yang dihapus.** Pencabutan Panit maupun pelaksana selalu berupa penandaan, tidak pernah berupa penghapusan baris, agar laporan dan rute yang sudah terekam tidak kehilangan induknya.
4. **Empat syarat minimum saat terbit**: satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab, satu pelaksana berperan Anggota. Keempatnya wajib bertahan selama SPT hidup, sehingga pencabutan yang akan melanggarnya ditolak.
5. **Status berpindah karena kejadian, bukan karena jam.** Satu-satunya perpindahan yang berjalan sendiri adalah baru menjadi berjalan akibat laporan pertama. Selebihnya berasal dari tindakan manusia. Lewatnya batas waktu hanya menerbitkan penanda dan pemberitahuan.
6. **Bermasalah adalah keterangan, bukan sanksi.** Penandaannya tidak menghentikan kegiatan, tidak mengunci apa pun, dan tidak boleh dirumuskan sebagai tuduhan pada teks antarmuka mana pun, sejalan dengan Prinsip 0.6.
7. **Draf bukan dokumen.** Selama berstatus draf, SPT tidak terlihat siapa pun selain penyusunnya, tidak memicu pemberitahuan, dan tidak tercatat pada jejak audit.
8. **Kewenangan tindakan dan lingkup data diperiksa terpisah.** Kanit boleh menerbitkan SPT, tetapi hanya untuk unitnya. Kasubdit melihat semuanya, tetapi tidak boleh menerbitkan apa pun. Pemeriksaan dilakukan dua kali, sejalan dengan Section 2.4.
9. **Menjadi pelaksana tidak menambah lingkup data.** Kanit yang mencantumkan dirinya sebagai pelaksana memperoleh kemampuan membuka Sesi Tugas dan melapor pada SPT itu, bukan hak baca yang lebih luas.
10. **Tidak ada yang meninjau laporannya sendiri**, berapa pun tinggi perannya.

## 6.2.5 Antarmuka dan kondisi tampilan

### Halaman Daftar Penugasan

Bagian atas memuat judul yang berbeda tiap peran, tombol tindakan, kotak pencarian, tiga tombol cepat (Lewat Batas, Bermasalah, Belum Ada Laporan), dan baris penyaring.

| Peran | Judul | Tombol tindakan |
| --- | --- | --- |
| Kanit | Penugasan Unit | Terbitkan Penugasan, Unduh Rekap |
| Kasubdit | Seluruh Penugasan | Unduh Rekap |
| Panit | Penugasan yang Saya Awasi | tidak ada |
| Anggota | Tugas Saya | tidak ada |

Penyaring: status, prioritas, rentang tanggal, Panit Penanggung Jawab (Kanit dan Kasubdit saja), unit (Kasubdit saja). Pemuatan bertahap 20 baris dengan tombol Muat Lagi.

Kartu SPT memuat: nomor SPT, judul, lencana prioritas, lencana status, nama titik lokasi pertama, tanggal batas, jumlah laporan masuk dibanding jumlah pelaksana, deretan foto kecil anggota tim, serta dua penanda kondisional — Lewat Batas berwarna merah dan lencana jumlah Sesi Tugas berjalan.

### Formulir Penerbitan Penugasan

Empat langkah, dapat disimpan sebagai draf kapan saja pada langkah mana pun:

1. **Keterangan penugasan** — jenis kegiatan, nomor SPT (kerangka tersodor), judul, objek, sasaran, uraian tugas, nomor LP, sumber informasi, prioritas, tanggal mulai, tanggal batas.
2. **Dasar penugasan** — daftar yang dapat ditambah baris, minimal satu.
3. **Titik lokasi** — peta Leaflet dengan daftar titik bernomor di sampingnya. Setiap titik dapat diatur dengan pin, ketikan koordinat, atau pencarian nama tempat, dan memiliki pengatur radius. Minimal satu titik berkoordinat.
4. **Susunan tim** — dua daftar terpisah, Panit Penanggung Jawab dan pelaksana, keduanya memilih dari personel aktif di unit. Nama Kanit sendiri muncul sebagai pilihan pada daftar pelaksana.

Berkas surat diunggah dari halaman rincian, bukan dari formulir ini, karena surat fisik kerap ditandatangani belakangan.

### Halaman Rincian Penugasan

Bagian atas: nomor SPT, judul, lencana prioritas dan status, tombol tindakan sesuai peran.

Badan halaman: keterangan penugasan, daftar dasar penugasan, peta dengan seluruh titik bernomor beserta lingkaran radiusnya, daftar Panit Penanggung Jawab, daftar pelaksana beserta penanda sudah atau belum membuka, rekam kegiatan, riwayat perpanjangan, serta kotak berkas surat perintah.

| Peran | Tombol yang tampil |
| --- | --- |
| Kanit pemilik unit | Sunting, Kelola Tim, Perpanjang Batas, Unggah Surat, Tutup Penugasan, Batalkan, Hapus (hanya bila belum ada jejak kegiatan sama sekali) |
| Kasubdit | Buka Kembali (hanya pada status selesai) |
| Panit Penanggung Jawab aktif | Tandai Bermasalah |
| Panit yang sudah dicabut | tidak ada, halaman hanya terbaca |
| Pelaksana | Tandai Bermasalah, Mulai Tugas (milik Modul 6.4) |

### Kondisi kosong

| Keadaan | Yang ditampilkan |
| --- | --- |
| Kanit belum pernah menerbitkan SPT | Ajakan menerbitkan penugasan pertama beserta tombolnya |
| Anggota belum punya penugasan aktif | Keterangan bahwa belum ada penugasan yang ditujukan kepadanya, tanpa nada menyalahkan |
| Panit belum pernah ditunjuk sama sekali | Menu Penugasan tidak ditampilkan |
| Panit pernah ditunjuk tetapi tidak ada yang aktif | Daftar kosong disertai ajakan membuka submenu Riwayat |
| Penyaring tidak menghasilkan apa pun | Ajakan melonggarkan penyaring beserta tombol Tampilkan Semua |
| Riwayat kosong pada rentang enam bulan | Ajakan melebarkan rentang tanggal |

### Kondisi memuat dan galat

- Daftar memakai kerangka abu-abu tiga kartu selama memuat, bukan pemutar lingkaran.
- Peta pada formulir menampilkan kotak abu-abu dengan tulisan Memuat peta bila ubin OpenStreetMap belum tiba.
- Bila pengunggahan berkas surat terputus, berkas lama tetap utuh dan sistem menawarkan mengulang, tanpa membatalkan penyuntingan lain yang sedang berjalan.
- Bila layanan tidak terjangkau saat menekan Terbitkan, isian formulir tidak hilang dan tetap dapat disimpan sebagai draf lokal.

### Perbedaan antar peran

Menu, tombol, dan penyaring yang berada di luar kewenangan tidak ditampilkan sama sekali, bukan ditampilkan dalam keadaan nonaktif (BR-11). Draf hanya terlihat oleh Kanit penyusunnya, termasuk tidak terlihat oleh Kasubdit maupun Akun Pemeliharaan pada tampilan daftar biasa.

## 6.2.6 Edge case modul

| Kondisi | Penanganan |
| --- | --- |
| Nomor SPT yang diketik ternyata sudah dipakai | Penyimpanan ditolak. Bila SPT pemakainya berada dalam lingkup pengguna, sistem menyebutkan nomor dan judulnya. Bila di luar lingkup, sistem hanya menyatakan nomor sudah terpakai |
| Tanggal batas lebih awal daripada tanggal mulai | Penyimpanan ditolak dengan keterangan singkat |
| Perpanjangan memundurkan tanggal batas ke masa lalu | Diizinkan, karena koreksi salah ketik juga perlu jalan. Alasan tetap wajib dan tercatat |
| Kanit dipindah unit setelah menerbitkan SPT | SPT tetap milik unit lamanya. Kanit yang berpindah kehilangan akses ke SPT tersebut. Kanit baru di unit itu mewarisi kewenangan penuh atasnya |
| Pelaksana dinonaktifkan akunnya saat SPT berjalan | Baris pelaksana tidak dicabut dan laporannya tetap terhitung. Nama ditampilkan dengan penanda akun nonaktif |
| Panit Penanggung Jawab dinonaktifkan akunnya | SPT dianggap kehilangan Panit aktif. Kanit menerima pemberitahuan agar menunjuk pengganti. Kegiatan tidak dihentikan |
| Dua orang menandai bermasalah hampir bersamaan | Penandaan pertama yang menetapkan status. Penandaan kedua tetap tersimpan sebagai catatan tambahan, tidak ditolak |
| Kanit menyunting SPT saat Panit sedang menulis catatan pada laporan di SPT yang sama | Keduanya berjalan. Tidak ada penguncian tingkat halaman |
| Draf ditinggalkan berbulan-bulan | Tidak dihapus dan tidak kedaluwarsa. Ditandai pada daftar draf dengan umurnya |
| SPT dibuka kembali padahal LHP-nya sudah diekspor | Diizinkan. Berkas ekspor yang terlanjur keluar tidak ditarik. Pembukaan kembali tercatat pada jejak audit |
| Titik lokasi disunting setelah laporan tertaut padanya | Diizinkan. Status lokasi laporan lama **tidak** dihitung ulang, karena penilaian saat itu dilakukan atas keadaan saat itu |
| Kanit menghapus SPT permanen tepat saat pelaksana membuka Sesi Tugas | Penghapusan ditolak karena syarat belum pernah ada Sesi Tugas tidak lagi terpenuhi |
| Berkas surat diunggah dua kali | Berkas terakhir menggantikan yang sebelumnya. Penggantian tercatat pada jejak audit |
| Kanit mencantumkan dirinya sebagai pelaksana lalu perannya diturunkan menjadi Panit | Pencantuman tetap sah. Ia tetap dapat melaksanakan tugas, karena kemampuan itu memang melekat pada pencantuman, bukan pada peran |

## 6.2.7 Ketergantungan

**Bergantung pada Modul 6.1 yang harus sudah selesai**, untuk pembacaan peran dan unit lewat fungsi bantu `sipantau_auth`, tabel `users` dan `unit`, tabel `penugasan_panit`, serta tabel `jejak_audit`.

Yang bergantung pada modul ini:

| Modul | Yang dibutuhkannya dari 6.2 |
| --- | --- |
| 6.3 Pelaporan Harian | SPT sebagai induk laporan, daftar pelaksana sebagai penentu siapa yang boleh melapor, titik lokasi beserta radiusnya sebagai pembanding status lokasi |
| 6.4 GPS Tracking | SPT sebagai konteks wajib tiap titik koordinat (BR-13), tabel sesi_tugas, dan aturan satu sesi aktif per orang |
| 6.5 Dashboard | Status, prioritas, dan lingkup data SPT sebagai bahan seluruh angka ringkasan |
| 6.7 Kolase | SPT sebagai pengelompok foto |
| 6.8 LHP Ringkas | Keterangan penugasan, dasar, titik lokasi, dan daftar petugas sebagai bagian terisi otomatis |
| 6.9 Notifikasi | Sebelas kejadian pemicu yang didaftar pada modul ini |

Yang dibutuhkan dari luar sebelum modul ini dianggap selesai seluruhnya: kode klasifikasi surat tiap unit (butir A-12) dan daftar resmi jenis masalah (butir A-11). Keduanya dapat diganti belakangan tanpa mengubah kode.

---
---

# Bagian 5 — Tambahan Section 7 Business Rules Global

| Kode | Aturan | Modul terkait |
| --- | --- | --- |
| BR-23 | Nomor SPT berasal dari surat fisik dan diketik manusia. Sistem hanya menyodorkan kerangka nomor dan tidak pernah membangkitkan nomor agenda sendiri. Nomor bersifat unik se-sistem | 6.2 |
| BR-24 | Satu orang hanya memegang satu Sesi Tugas aktif pada satu waktu, lintas seluruh SPT. Keterlibatan pada beberapa SPT sekaligus tetap diizinkan | 6.2, 6.4 |
| BR-25 | SPT tidak dapat berpindah ke status selesai sebelum berkas pindaian surat perintah dilampirkan | 6.2 |
| BR-26 | Status bermasalah hanya dapat ditetapkan manusia, disertai jenis masalah dan uraian wajib. Sistem tidak pernah menetapkannya sendiri, termasuk saat batas waktu terlampaui | 6.2, 6.5 |
| BR-27 | Pencabutan Panit Penanggung Jawab maupun pelaksana dari sebuah SPT tidak menghapus laporan, foto, maupun rute yang sudah terekam, dan tidak menghapus baris penghubungnya | 6.2, 6.3, 6.4 |
| BR-28 | Tidak seorang pun dapat memberi catatan peninjau pada laporan yang ia kirim sendiri, berapa pun perannya | 6.2, 6.3 |
| BR-29 | SPT hanya dapat dihapus permanen bila belum pernah memiliki laporan, foto, rute, maupun Sesi Tugas. Selain keadaan itu, satu-satunya jalan adalah pembatalan disertai alasan | 6.2 |
| BR-30 | Sepanjang hidupnya, setiap SPT yang sudah terbit wajib memiliki sekurang-kurangnya satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab aktif, dan satu pelaksana berperan Anggota | 6.2 |
| BR-31 | Kanit dan Panit dapat menjadi pelaksana bila dicantumkan pada SPT, dan memperoleh kemampuan membuka Sesi Tugas serta mengirim laporan harian pada SPT tersebut saja. Kewenangan menyusun LHP Ringkas tetap hanya pada Anggota | 6.2, 6.3, 6.4, 6.8 |

> **Catatan penomoran.** BR-23 sampai BR-31 melanjutkan penomoran dari BR-22 sesuai aturan penambahan pada Section 7. Tidak ada kode lama yang dipakai ulang.

---
---

# Bagian 6 — Tambahan Section 8.8 Penugasan

Daftar kondisi tepi lintas modul yang lahir dari Modul 6.2. Penanganan rincinya ada pada 6.2.6.

- Nomor SPT bentrok dengan SPT di luar lingkup data pengguna
- Kanit dipindah unit setelah menerbitkan SPT
- Panit Penanggung Jawab terakhir dinonaktifkan akunnya
- SPT dibuka kembali setelah LHP-nya diekspor
- Titik lokasi disunting setelah dirujuk laporan
- Draf ditinggalkan berbulan-bulan tanpa diterbitkan
- Penghapusan permanen berbenturan dengan pembukaan Sesi Tugas pada saat hampir bersamaan

---
---

# Bagian 7 — Tambahan Section 9.2 Aturan Akses per Tabel

**[FINAL] untuk tabel yang menjadi urusan Modul 6.2**

| Tabel | Baca | Tulis |
| --- | --- | --- |
| penugasan | Kasubdit dan Akun Pemeliharaan membaca seluruh baris kecuali draf milik orang lain. Kanit membaca baris di unitnya termasuk drafnya sendiri. Panit membaca baris yang ada penunjukannya pada penugasan_panit, tanpa memandang dicabut_pada. Pelaksana membaca baris yang ada pencantumannya pada penugasan_pelaksana, tanpa memandang dicabut_pada | Hanya Kanit, terbatas unitnya sendiri. Kasubdit hanya boleh mengubah kolom status pada perkara pembukaan kembali |
| penugasan_dasar | Mengikuti hak baca atas baris penugasan induknya | Hanya Kanit pemilik unit, dan hanya selama status bukan selesai maupun dibatalkan |
| penugasan_lokasi | Mengikuti hak baca atas baris penugasan induknya | Sama seperti penugasan_dasar |
| penugasan_pelaksana | Mengikuti hak baca atas baris penugasan induknya. Setiap orang selalu membaca baris miliknya sendiri | Hanya Kanit pemilik unit, kecuali kolom dibaca_pada yang ditulis pemiliknya sendiri |
| sesi_tugas | Ditetapkan pada Modul 6.4 | Ditetapkan pada Modul 6.4 |

> **Dua hal yang wajib diperhatikan saat implementasi**
>
> Pertama, klausa baca untuk Panit dan pelaksana **mengabaikan** `dicabut_pada`, sedangkan klausa tulis **memeriksanya**. Menyamakan keduanya adalah kesalahan yang paling mungkin terjadi di modul ini, dan akibatnya persis melanggar BR-21: Panit kehilangan riwayat yang seharusnya terbaca selamanya.
>
> Kedua, draf tidak boleh bocor. Klausa baca untuk Kasubdit harus menyertakan pengecualian `status <> 'draf' OR diterbitkan_oleh = uid`. Tanpa itu, catatan yang belum jadi terbaca oleh atasan sebelum pemiliknya selesai berpikir.
>
> Indeks yang wajib dibuat sejak awal: `penugasan(unit_id, status)`, `penugasan_pelaksana(pelaksana_id)`, `penugasan_lokasi(penugasan_id, urutan)`, dan indeks unik parsial pada `sesi_tugas(pengguna_id) WHERE ditutup_pada IS NULL`.

## Tambahan jenis tindakan pada Section 9.6

`terbit_spt`, `sunting_spt`, `tutup_spt`, `batal_spt`, `hapus_spt`, `buka_kembali_spt`, `tandai_bermasalah`, `kembalikan_dari_bermasalah`, `perpanjang_batas`, `tambah_pelaksana`, `cabut_pelaksana`, `tunjuk_panit`, `cabut_panit`, `unggah_surat_spt`.

Penyuntingan draf tidak dicatat.

---
---

# Bagian 8 — Perubahan Lampiran A dan B

## Lampiran A — daftar diperbarui

| Kode | Butir | Status |
| --- | --- | --- |
| A-02 | Penyimpanan data sensitif pada layanan awan | **Belum terjawab, prioritas naik.** Contoh dokumen perkara yang diterima memuat identitas pelapor, terlapor, NIK, dan nomor paspor. Isi sekelas itulah yang akan tersimpan di Supabase Cloud |
| A-03 | Angka target metrik keberhasilan | Belum terjawab |
| A-04 | Berkas kop dan lambang institusi | Belum terjawab |
| A-05 | Daftar alasan lokasi tidak terekam | Belum terjawab |
| A-06 | Daftar resmi unit di bawah Subdit IV | Belum terjawab |
| A-07 | Kesediaan Kasubdit memakai sistem | Belum terjawab |
| A-08 | Pencatatan tertulis Akun Pemeliharaan | Belum terjawab |
| ~~A-09~~ | ~~Panit dan daftar SPT se-unit~~ | **Terjawab.** Menu Penugasan disembunyikan hanya bagi Panit yang belum pernah ditunjuk sama sekali. Dipindahkan ke Lampiran B butir B.9 |
| ~~A-10~~ | ~~Format nomor SPT~~ | **Terjawab.** Pola terbaca dari contoh surat yang diterima. Dipindahkan ke Lampiran B butir B.9 |
| **A-11** | **Daftar resmi jenis masalah** | **Baru.** Untuk pilihan saat menandai SPT bermasalah. Daftar sementara yang dipakai: alamat atau sasaran fiktif, objek tidak ditemukan di lokasi, informasi awal tidak sesuai kenyataan, situasi tidak memungkinkan karena alasan keamanan, sasaran berpindah tempat, kendala perangkat atau jaringan, lainnya |
| **A-12** | **Kode klasifikasi surat tiap unit** | **Baru.** Nilai sebenarnya untuk kolom kode_klasifikasi pada tabel unit. Contoh yang diterima memakai RES.5.3 untuk SPT penyelidikan; perlu dipastikan nilainya untuk tiap unit dan untuk jenis kegiatan selain penyelidikan |
| **A-13** | **Kelengkapan daftar jenis kegiatan** | **Baru.** Saat ini tiga nilai: penyelidikan, pulbaket, pengamanan. Perlu dipastikan tidak ada jenis lain yang lazim dipakai, karena jenis kegiatan menentukan awalan nomor SPT |
| **A-14** | **Kesediaan Kanit tercantum sebagai pelaksana** | **Baru.** Matriks 2.3 diubah agar Kanit dapat membuka Sesi Tugas dan posisinya ikut terlacak. Perlu dipastikan pemilik produk memang menghendaki posisinya sendiri direkam saat bertugas |

## Lampiran B — butir tambahan

### B.9 Penugasan — bagian baru

- Nomor SPT diketik manusia mengikuti surat fisik, unik se-sistem, dengan kerangka yang disodorkan sistem
- Nomor agenda berasal dari buku agenda Bagian Administrasi dan tidak pernah dibangkitkan SiPANTAU
- Status SPT memiliki enam nilai: Draf, Baru, Berjalan, Bermasalah, Selesai, Dibatalkan
- Perpindahan Baru menjadi Berjalan dipicu masuknya laporan pertama, bukan pembukaan Sesi Tugas
- Lewatnya batas waktu hanya menerbitkan penanda dan pemberitahuan, tidak mengubah status
- Bermasalah hanya ditetapkan manusia disertai jenis masalah dan uraian wajib
- Satu SPT wajib memiliki minimal satu Panit Penanggung Jawab, satu pelaksana berperan Anggota, satu dasar penugasan, dan satu titik lokasi berkoordinat
- Kanit dan Panit dapat dicantumkan sebagai pelaksana; penyusunan LHP Ringkas tetap hanya oleh Anggota
- Dasar penugasan bersifat jamak dengan jenis yang berbeda-beda
- Titik lokasi bersifat jamak dan berurutan; laporan menandai berada di titik yang mana
- Radius bawaan tiap titik berkoordinat adalah 300 meter, dapat diubah antara 100 dan 2000 meter
- Penutupan SPT hanya oleh Kanit, kapan saja, dengan peringatan berisi daftar yang belum beres
- SPT tidak dapat ditutup sebelum berkas surat perintah dilampirkan
- Perpanjangan batas waktu diubah langsung Kanit, alasan wajib, tanpa batas jumlah
- Pembukaan kembali SPT selesai dapat dilakukan Kanit unit pemilik dan Kasubdit; SPT dibatalkan tidak dapat dibuka kembali
- Penghapusan permanen hanya bila belum ada jejak kegiatan sama sekali
- Daftar Penugasan memuat yang aktif saja; submenu Riwayat memuat yang selesai dan dibatalkan dengan penyaring bawaan enam bulan
- Tanda terima tercatat otomatis saat pelaksana membuka rincian SPT
- Menu Penugasan disembunyikan bagi Panit yang belum pernah ditunjuk sama sekali
- Prototype menyesuaikan PRD bila keduanya bertentangan

---

## Yang perlu Anda kerjakan setelah menempel berkas ini

1. Naikkan versi PRD menjadi 0.4 pada Kendali Dokumen dan Riwayat Revisi
2. Ubah penanda status Modul 6.2 dari [KERANGKA] menjadi [FINAL]
3. Ganti nama tabel `penugasan_anggota` menjadi `penugasan_pelaksana` di seluruh dokumen, termasuk Section 5.8 dan Section 9.2 versi 0.2
4. Perbarui Checklist Progres: centang Tahap 2 baris 6.2, coret A-09 dan A-10 pada Tahap 1, tambahkan A-11 sampai A-14
5. Kejar ke pemilik produk: A-02 (naik prioritas), A-11, A-12, A-13, A-14
6. Perbarui prototype: hilangkan tombol Terbitkan Penugasan pada peran Panit, ubah judul dan lingkupnya

---
---

# Bagian 9 — Bukan untuk ditempel: celah untuk Addendum 6.2-T

Pemeriksaan yang sama seperti pada Modul 6.1 sudah dijalankan atas seluruh isi berkas ini. Delapan titik menyatakan hasil akhir tanpa menyebutkan jalur teknis yang menghasilkannya. Sesuai Section 0.1, tidak satu pun boleh diisi perkiraan oleh AI Agent. Kedelapannya didaftar di sini dan akan ditutup pada Addendum 6.2-T.

| No | Celah | Kriteria terdampak |
| --- | --- | --- |
| 1 | Bagaimana aturan satu Sesi Tugas aktif per orang ditegakkan sehingga tidak bisa ditembus dua permintaan yang tiba bersamaan | BR-24 |
| 2 | Lewat jalur apa status berpindah dari baru ke berjalan, mengingat pemicunya adalah penyisipan baris pada tabel milik Modul 6.3 | KP-6.2-30 |
| 3 | Bagaimana tanda terima tercatat, mengingat membuka halaman adalah operasi baca sedangkan yang diinginkan adalah tulis | KP-6.2-28 |
| 4 | Bagaimana larangan menutup SPT tanpa berkas surat ditegakkan di tingkat basis data, bukan hanya di antarmuka | BR-25, KP-6.2-45 |
| 5 | Bagaimana empat syarat minimum bertahan sepanjang hidup SPT, mengingat pelanggarannya terjadi lewat penghapusan baris di tabel lain | BR-30, KP-6.2-25, KP-6.2-26 |
| 6 | Bagaimana pemberitahuan batas waktu mendekat terpicu, mengingat arsitektur pada Section 4 belum memiliki penjadwal sama sekali | KP-6.2-36 |
| 7 | Bagaimana penanda Lewat Batas dihitung: kolom turunan yang disimpan, atau perhitungan saat kueri | KP-6.2-36 |
| 8 | Bagaimana syarat penghapusan permanen diperiksa lintas lima tabel dalam satu tindakan yang tidak bisa disisipi | BR-29, KP-6.2-48 |

Celah nomor 6 adalah yang paling besar akibatnya. Ia bukan hanya urusan Modul 6.2 — pemberitahuan berjadwal juga dibutuhkan Modul 6.4 dan 6.9. Selama belum ada penjadwal, seluruh pemberitahuan yang tidak dipicu tindakan manusia tidak akan pernah terkirim, dan itu tidak akan terlihat sebagai galat di mana pun.


---
---

# SiPANTAU — Addendum 6.2-T

**Spesifikasi Teknis Implementasi Modul 6.2**

Tanggal: 1 Agustus 2026 · Pelengkap berkas Revisi Modul 6.2 · Status: [FINAL]

---

## Mengapa addendum ini ada

Berkas Revisi Modul 6.2 menetapkan perilaku modul secara lengkap menurut kerangka Section 6.0, lalu mendaftar sendiri delapan titik yang menyatakan hasil akhir tanpa menyebutkan jalur teknis yang menghasilkannya. Menurut Section 0.1, bagian yang belum cukup jelas untuk diimplementasikan tidak boleh diisi perkiraan oleh AI Agent. Kedelapan titik itu ditutup di sini, ditambah satu perkara yang tidak terdaftar pada berkas tersebut tetapi wajib dibereskan lebih dulu: bentrokan penomoran Business Rules.

| Celah | Kriteria terdampak | Ditutup pada |
| --- | --- | --- |
| Bentrokan penomoran BR-23 sampai BR-25 | Seluruh rujukan silang | Bagian 0 |
| Penjadwal belum ada dalam arsitektur | KP-6.2-36, dan seluruh pemberitahuan berjadwal | Bagian 1 |
| Penegakan satu Sesi Tugas aktif per orang | BR-27 | Bagian 2 |
| Perpindahan status baru menjadi berjalan | KP-6.2-30 | Bagian 3 |
| Pencatatan tanda terima saat rincian dibuka | KP-6.2-28 | Bagian 4 |
| Larangan menutup SPT tanpa berkas surat | BR-28, KP-6.2-45 | Bagian 5 |
| Empat syarat minimum bertahan seumur SPT | BR-33, KP-6.2-04, KP-6.2-25, KP-6.2-26 | Bagian 6 |
| Cara menghitung penanda Lewat Batas | KP-6.2-36 | Bagian 7 |
| Pemeriksaan penghapusan permanen lintas tabel | BR-32, KP-6.2-48 | Bagian 8 |

Addendum ini ditempel sebagai **Section 6.2.8** pada PRD, ditambah perubahan pada section lain yang didaftar di Bagian 10.

> **Satu peringatan yang bukan berasal dari daftar celah.** Pemeriksaan atas layanan penjadwal menemukan satu perilaku yang berpotensi mematikan seluruh pemberitahuan berjadwal tanpa jejak galat apa pun. Perinciannya ada di 1.6 dan wajib dibaca sebelum sesi coding dimulai.

---
---

# Bagian 0 — Koreksi penomoran Business Rules

## 0.1 Duduk perkaranya

Addendum 6.1-T menambahkan BR-23, BR-24, dan BR-25. Berkas Revisi Modul 6.2 juga menambahkan BR-23 sampai BR-31. Tiga kode karena itu menunjuk dua aturan yang berlainan sekaligus.

Ini bukan perkara kerapian. Section 0.3 menetapkan Business Rules Global sebagai pemenang tertinggi saat terjadi konflik, dan seluruh modul merujuknya lewat kode. Kode yang bercabang dua membuat rujukan menjadi mustahil dinilai benar atau salah.

## 0.2 Ketetapan

**Addendum 6.1-T mempertahankan BR-23 sampai BR-25**, karena ia lebih dahulu ada dan menyentuh fondasi autentikasi yang sudah dirujuk banyak tempat. **Seluruh aturan Modul 6.2 digeser tiga angka.**

| Kode lama pada berkas Modul 6.2 | Kode baru | Pokok aturan |
| --- | --- | --- |
| BR-23 | **BR-26** | Nomor SPT diketik manusia, sistem tidak membangkitkan nomor agenda |
| BR-24 | **BR-27** | Satu Sesi Tugas aktif per orang, lintas seluruh SPT |
| BR-25 | **BR-28** | SPT tidak dapat selesai sebelum berkas surat dilampirkan |
| BR-26 | **BR-29** | Status bermasalah hanya ditetapkan manusia |
| BR-27 | **BR-30** | Pencabutan tidak menghapus laporan, foto, rute, maupun baris penghubung |
| BR-28 | **BR-31** | Tidak seorang pun meninjau laporannya sendiri |
| BR-29 | **BR-32** | Penghapusan permanen hanya bila belum ada jejak kegiatan |
| BR-30 | **BR-33** | Empat syarat minimum bertahan seumur SPT |
| BR-31 | **BR-34** | Kanit dan Panit dapat menjadi pelaksana |

## 0.3 Rujukan di dalam berkas Modul 6.2 yang ikut berubah

Penggantian tidak boleh dilakukan dengan cari-ganti buta, karena sebagian rujukan menunjuk aturan milik Modul 6.1 yang **tidak** berubah. Daftar berikut sudah dipilah:

| Letak | Tertulis | Menjadi |
| --- | --- | --- |
| 5.17, catatan tabel sesi_tugas | BR-19 | **tetap BR-19** — milik Modul 6.1 |
| 5.3, catatan tabel penugasan_pelaksana | BR-27 | **BR-30** |
| 6.2.4 butir 4 | BR-30 | **BR-33** |
| 6.2.7, ketergantungan Modul 6.4 | BR-13 | **tetap BR-13** — milik versi 0.2 |
| Bagian 7, catatan aturan akses | BR-21 | **tetap BR-21** — milik Modul 6.1 |
| Bagian 9, daftar celah | BR-24, BR-25, BR-29, BR-30 | **BR-27, BR-28, BR-32, BR-33** |

Seluruh rujukan pada addendum ini sudah memakai penomoran baru.

## 0.4 Aturan pencegah agar tidak terulang

Ditambahkan pada Section 7 sebagai catatan penomoran:

> Sebelum menambahkan aturan baru, periksa lebih dahulu kode tertinggi yang sudah dipakai **pada seluruh berkas revisi dan addendum yang berlaku**, bukan hanya pada dokumen induk. Modul yang digali bersamaan berpotensi memakai kode yang sama tanpa saling mengetahui.

---
---

# Bagian 1 — Penjadwal

## 1.1 Mengapa ini yang paling besar akibatnya

Berkas Modul 6.2 menyebut celah ini sebagai yang paling besar akibatnya, dan penilaian itu tepat. Alasannya bukan karena pemberitahuan batas waktu penting, melainkan karena **ketiadaannya tidak menimbulkan galat**.

Bila sebuah tombol rusak, pengguna melapor pada hari itu juga. Bila pemberitahuan berjadwal tidak pernah terkirim, tidak ada yang menyadarinya. Kanit hanya merasa sistemnya sepi. Tidak ada layar merah, tidak ada catatan galat, tidak ada apa pun yang dapat ditelusuri. Kegagalan jenis ini yang paling lama hidup di dalam sistem.

Kebutuhan penjadwal juga tidak berhenti di Modul 6.2. Modul 6.4 membutuhkannya untuk mendeteksi Sesi Tugas yang menggantung, dan Modul 6.9 membutuhkannya untuk seluruh pemberitahuan yang tidak dipicu tindakan manusia. Keputusan diambil sekali di sini agar tidak diambil ulang tiga kali dengan hasil berbeda.

## 1.2 Ketetapan

Penjadwalan memakai **pg_cron**, modul penjadwal yang berjalan di dalam basis data terkelola yang sama. <cite index="7-1">Supabase Cron adalah modul Postgres yang memakai ekstensi pg_cron, dan pekerjaannya dapat dibuat lewat SQL maupun antarmuka Dashboard, dengan rentang jadwal dari tiap detik sampai tahunan</cite>. <cite index="5-1">Per 2026 setiap project Supabase membawa pg_cron pada paket gratis, pro, maupun team</cite>, sehingga tidak ada halangan biaya.

Pilihan ini tidak melanggar Section 4.5. pg_cron bukan server aplikasi terpisah, melainkan ekstensi yang hidup di dalam basis data yang sudah dipakai. Ia tidak perlu disebarkan, tidak perlu diurus, dan tidak menambah tempat baru yang harus dijaga.

### Amandemen Section 4.5

Butir pertama Section 4.5 sudah diamandemen Addendum 6.1-T untuk memberi tempat bagi Fungsi Tepi. Kini ditambahkan satu kalimat:

> Pengecualian kedua adalah **Penjadwal Basis Data**, yaitu ekstensi penjadwal yang berjalan di dalam basis data terkelola yang sama. Penjadwal Basis Data dipakai untuk pekerjaan berulang yang tidak dipicu tindakan manusia. Ia bukan server aplikasi dan tidak disebarkan secara terpisah.

<cite index="7-1">Batas yang dianjurkan: tidak lebih dari delapan pekerjaan berjalan bersamaan, dan tiap pekerjaan tidak lebih dari sepuluh menit.</cite> SiPANTAU jauh di bawah batas itu.

## 1.3 Pemasangan

```sql
create extension if not exists pg_cron;
```

Tidak diperlukan `pg_net` untuk keperluan SiPANTAU. Seluruh pekerjaan berjadwal pada sistem ini berupa perintah SQL yang bekerja di dalam basis data, bukan panggilan ke alamat luar. Menambahkan pemanggilan HTTP hanya akan menambah titik yang dapat gagal tanpa memberi manfaat.

## 1.4 Tabel notifikasi

**[KERANGKA]** — bentuk akhirnya ditetapkan pada Modul 6.9. Dibentuk di sini karena Modul 6.2 sudah membutuhkannya, mengikuti pola yang sama seperti tabel `sesi_tugas` yang dibentuk pada Modul 6.2 untuk kebutuhan Modul 6.4.

```sql
create table if not exists public.notifikasi (
  id            uuid primary key default gen_random_uuid(),
  penerima_id   uuid not null references public.users(id),
  jenis         text not null,
  penugasan_id  uuid references public.penugasan(id) on delete cascade,
  judul         text not null,
  isi           text,
  dibaca_pada   timestamptz,
  dibuat_pada   timestamptz not null default now()
);

create index if not exists idx_notifikasi_penerima_belum_dibaca
  on public.notifikasi (penerima_id, dibuat_pada desc)
  where dibaca_pada is null;
```

Daftar nilai `jenis` ditetapkan pada Modul 6.9. Yang dipakai addendum ini: `spt_lewat_batas`.

## 1.5 Pekerjaan berjadwal

### Kolom penanda agar pemberitahuan tidak berulang

Sebuah pekerjaan harian yang menyisir SPT lewat batas akan mengirim pemberitahuan yang sama setiap hari bila tidak ditahan. Penahannya satu kolom:

```sql
alter table public.penugasan
  add column if not exists lewat_batas_diberitahukan_pada timestamptz;
```

Kolom ini juga dikosongkan kembali setiap kali batas waktu diperpanjang, sehingga perpanjangan yang kembali terlampaui tetap memberi tahu.

### Pekerjaan 1 — pemberitahuan SPT lewat batas

```sql
create or replace function public.kerja_periksa_lewat_batas()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  n_kirim int := 0;
begin
  with sasaran as (
    select p.id, p.nomor_spt, p.judul, p.tanggal_batas, p.diterbitkan_oleh
      from public.penugasan p
     where p.tanggal_batas < current_date
       and p.status in ('baru', 'berjalan', 'bermasalah')
       and p.lewat_batas_diberitahukan_pada is null
  ),
  terkirim as (
    insert into public.notifikasi (penerima_id, jenis, penugasan_id, judul, isi)
    select s.diterbitkan_oleh,
           'spt_lewat_batas',
           s.id,
           'Batas waktu penugasan terlampaui',
           s.nomor_spt || ' — ' || s.judul ||
           '. Batas waktu ' || to_char(s.tanggal_batas, 'DD Mon YYYY') ||
           ' sudah terlampaui dan status belum Selesai.'
      from sasaran s
    returning penugasan_id
  )
  update public.penugasan
     set lewat_batas_diberitahukan_pada = now()
   where id in (select penugasan_id from terkirim);

  get diagnostics n_kirim = row_count;
  raise notice 'kerja_periksa_lewat_batas: % pemberitahuan', n_kirim;
end;
$$;

select cron.schedule(
  'periksa-lewat-batas',
  '5 0 * * *',                        -- 00:05 UTC, sekitar 07:05 WIB
  $$ select public.kerja_periksa_lewat_batas() $$
);
```

Tiga hal yang disengaja pada fungsi di atas:

Pertama, seluruhnya berjalan dalam **satu pernyataan** memakai `with`. Penyisipan pemberitahuan dan penandaan kolom terjadi bersamaan, sehingga tidak mungkin ada keadaan pemberitahuan terkirim tetapi penandanya gagal, atau sebaliknya.

Kedua, statusnya dibatasi pada tiga nilai. SPT berstatus `draf` tidak pernah diberitahukan karena belum menjadi dokumen. SPT `selesai` dan `dibatalkan` sudah tidak relevan.

Ketiga, penerimanya adalah `diterbitkan_oleh`, bukan seluruh tim. KP-6.2-36 menyebut Kanit sebagai penerima. Bila kelak pemilik produk menghendaki Panit Penanggung Jawab ikut menerima, penambahannya satu blok `insert` lagi pada fungsi yang sama.

### Pengosongan penanda saat batas diperpanjang

```sql
create or replace function public.trg_reset_penanda_lewat_batas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.tanggal_batas is distinct from old.tanggal_batas then
    new.lewat_batas_diberitahukan_pada := null;
  end if;
  return new;
end;
$$;

create trigger reset_penanda_lewat_batas
  before update on public.penugasan
  for each row
  execute function public.trg_reset_penanda_lewat_batas();
```

### Pekerjaan 2 — penjaga keaktifan project

Alasannya ada di 1.6. Pekerjaan ini tidak menghasilkan apa pun selain satu pembacaan ringan, dan itulah gunanya.

```sql
create or replace function public.kerja_jaga_keaktifan()
returns void
language sql
security definer
set search_path = ''
as $$
  select count(*) from public.users where aktif = true;
$$;

select cron.schedule(
  'jaga-keaktifan',
  '0 */6 * * *',                      -- tiap enam jam
  $$ select public.kerja_jaga_keaktifan() $$
);
```

### Pekerjaan yang akan ditambahkan modul lain

| Pekerjaan | Modul | Keterangan |
| --- | --- | --- |
| Deteksi Sesi Tugas menggantung | 6.4 | Sesi yang tidak ditutup melewati ambang waktu tertentu |
| Penyusutan `location_logs` | 6.4 | Section 5.9 menetapkan perlunya, ambangnya ditetapkan di 6.4 |
| Pemberitahuan berkala lain | 6.9 | Ditetapkan saat modul digali |

## 1.6 Peringatan: pekerjaan berjadwal dapat berhenti tanpa jejak

Ini temuan yang wajib diketahui sebelum sesi coding dimulai, dan bukan berasal dari daftar celah berkas Modul 6.2.

<cite index="5-1">pg_cron hanya menyala selama basis data sehat, sehingga gangguan layanan, project paket gratis yang dijeda, atau tercapainya batas sambungan akan menjeda seluruh jadwal tanpa peringatan apa pun — riwayat jalannya sekadar berlubang.</cite>

Yang paling mungkin menimpa SiPANTAU adalah penjedaan project. <cite index="10-1">Pada paket gratis, project yang tidak aktif lebih dari tujuh hari akan dijeda.</cite> Selama masa libur panjang atau jeda antar-perkara, project berpotensi tertidur, dan begitu tertidur seluruh pemberitahuan berhenti. Ketika kegiatan kembali berjalan, tidak ada yang memberi tahu bahwa ada sepekan pemberitahuan yang hilang.

Tiga penanganan, dan ketiganya dipakai bersama:

**Pertama, Pekerjaan 2 pada 1.5.** Satu pembacaan tiap enam jam sudah cukup membuat project terhitung aktif. Ini penangkal yang paling murah dan langsung menghilangkan sebab yang paling mungkin terjadi.

**Kedua, penanda kesehatan yang terlihat manusia.** Dashboard Kasubdit menampilkan waktu keberhasilan terakhir tiap pekerjaan berjadwal, dibaca dari `cron.job_run_details`. Bila angkanya lebih tua dari yang wajar, itu terlihat sebagai keterangan, bukan sebagai galat. Ini menerapkan Prinsip 0.6 pada kesehatan sistem: yang disajikan adalah fakta, penilaiannya pada manusia.

```sql
create or replace view public.kesehatan_penjadwal
with (security_invoker = on)
as
select j.jobname                                as nama_pekerjaan,
       j.schedule                               as jadwal,
       max(d.end_time) filter (where d.status = 'succeeded')
                                                as berhasil_terakhir,
       count(*) filter (where d.status = 'failed'
                          and d.start_time > now() - interval '7 days')
                                                as gagal_sepekan
  from cron.job j
  left join cron.job_run_details d on d.jobid = j.jobid
 group by j.jobname, j.schedule;
```

**Ketiga, pengakuan terus terang pada dokumen.** Ketiadaan pemberitahuan tidak boleh dianggap sama dengan ketiadaan kejadian. Penanda Lewat Batas pada Bagian 7 sengaja dihitung saat kueri, bukan bersandar pada pekerjaan berjadwal, justru agar penanda tetap benar meski pemberitahuannya tidak terkirim.

> **Butir uji U-6.2-09.** Jedakan pekerjaan berjadwal dengan `select cron.unschedule('periksa-lewat-batas')`, lampaui batas waktu sebuah SPT, lalu buka daftar penugasan. Penanda Lewat Batas wajib tetap muncul. Bila ia ikut hilang, berarti ada ketergantungan yang tidak seharusnya ada.

---
---

# Bagian 2 — Satu Sesi Tugas aktif per orang

## 2.1 Duduk perkaranya

BR-27 menetapkan satu orang hanya memegang satu Sesi Tugas aktif pada satu waktu, lintas seluruh SPT. Memeriksanya di aplikasi tidak cukup: dua permintaan yang tiba pada saat hampir bersamaan sama-sama membaca "belum ada sesi aktif", lalu sama-sama menyisipkan baris. Keduanya lolos, aturan bocor, dan bocornya tidak akan pernah terlihat sampai ada dua rute berjalan bersamaan untuk orang yang sama.

## 2.2 Penegakan

Berkas Modul 6.2 sudah menyebut indeks unik parsial pada bagian aturan akses. Di sini bentuk dan akibatnya ditetapkan.

```sql
create unique index if not exists uq_sesi_tugas_satu_aktif_per_orang
  on public.sesi_tugas (pengguna_id)
  where ditutup_pada is null;
```

Indeks unik parsial ditegakkan basis data pada tingkat penyisipan baris. Dua permintaan bersamaan tidak mungkin sama-sama lolos: yang kedua ditolak dengan galat pelanggaran keunikan, kode `23505`. Tidak ada jendela waktu sekecil apa pun di antara pemeriksaan dan penyisipan, karena keduanya adalah satu tindakan yang sama.

## 2.3 Penanganan di aplikasi

Galat keunikan bukan galat teknis bagi pengguna, melainkan keterangan keadaan. Ia wajib diterjemahkan.

```javascript
const { error } = await supabase.from('sesi_tugas').insert({
  penugasan_id: penugasanId,
  pengguna_id: userId,
  dibuka_pada: new Date().toISOString()
})

if (error?.code === '23505') {
  // Cari tahu sesi mana yang sedang terbuka, lalu sebutkan.
  const { data: sesi } = await supabase
    .from('sesi_tugas')
    .select('penugasan_id, dibuka_pada, penugasan(nomor_spt, judul)')
    .is('ditutup_pada', null)
    .single()

  tampilkanKeterangan(
    `Anda masih dalam Sesi Tugas untuk ${sesi.penugasan.nomor_spt}. ` +
    `Tutup sesi itu lebih dahulu sebelum membuka yang baru.`
  )
  return
}
```

Menyebutkan SPT mana yang sedang terbuka adalah bagian yang menentukan. Tanpa itu, pengguna di lapangan hanya tahu ia ditolak, tidak tahu apa yang harus dilakukan.

## 2.4 Perbedaan dengan keterlibatan pada beberapa SPT

BR-27 membatasi **sesi**, bukan **keterlibatan**. Seorang Anggota tetap boleh dicantumkan sebagai pelaksana pada lima SPT sekaligus. Yang dibatasi adalah berapa yang sedang ia kerjakan pada satu saat. Indeks di atas menegakkan tepat itu dan tidak menyentuh tabel `penugasan_pelaksana` sama sekali.

---
---

# Bagian 3 — Perpindahan status baru menjadi berjalan

## 3.1 Duduk perkaranya

KP-6.2-30 menetapkan status berpindah dari `baru` ke `berjalan` begitu laporan harian pertama masuk, tanpa campur tangan siapa pun. Pemicunya berada di tabel milik Modul 6.3, sedangkan yang berubah adalah tabel milik Modul 6.2.

Menyerahkannya kepada aplikasi salah karena dua sebab. Pertama, aplikasi dapat gagal di antara dua panggilan, meninggalkan laporan yang masuk pada SPT yang masih berstatus `baru`. Kedua, pengirim laporan adalah Anggota, dan Anggota tidak memiliki hak tulis atas tabel `penugasan` — memberinya hak itu demi satu kolom akan membuka pintu yang jauh lebih lebar daripada yang dibutuhkan.

## 3.2 Penegakan

```sql
create or replace function public.trg_laporan_pertama_menjalankan_spt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.penugasan
     set status = 'berjalan'
   where id = new.penugasan_id
     and status = 'baru';
  return new;
end;
$$;

create trigger laporan_pertama_menjalankan_spt
  after insert on public.laporan_harian
  for each row
  execute function public.trg_laporan_pertama_menjalankan_spt();
```

Tiga sifat yang membuat pemicu ini aman:

**Bersyarat `status = 'baru'`.** Laporan kedua, ketiga, dan seterusnya tidak mengubah apa pun karena syaratnya tidak lagi terpenuhi. Pemicu ini idempoten dengan sendirinya, tanpa perlu penanda tambahan.

**Tidak menyentuh status lain.** SPT yang sedang `bermasalah` tidak dikembalikan ke `berjalan` oleh laporan yang masuk. KP-6.2-35 menetapkan pengembalian dari `bermasalah` sebagai tindakan Kanit disertai alasan, dan pemicu ini tidak boleh mendahuluinya.

**`security definer`.** Pemicu berjalan dengan hak pembuatnya, sehingga Anggota pengirim laporan tidak perlu memiliki hak tulis atas tabel `penugasan`. Tanpa ini, penyisipan laporan akan ditolak aturan akses baris `penugasan` dan gagal seluruhnya.

## 3.3 Yang sengaja tidak dilakukan

KP-6.2-31 menetapkan pembukaan Sesi Tugas **tidak** mengubah status. Karena itu tidak ada pemicu serupa pada tabel `sesi_tugas`. Ini disengaja: orang dapat membuka sesi lalu batal berangkat, sedangkan laporan yang masuk adalah bukti kegiatan benar-benar berlangsung.

---
---

# Bagian 4 — Pencatatan tanda terima

## 4.1 Duduk perkaranya

KP-6.2-28 menetapkan kolom `dibaca_pada` terisi saat pelaksana membuka rincian SPT untuk pertama kalinya, tanpa tindakan tambahan. Membuka halaman adalah operasi baca, sedangkan yang diinginkan adalah tulis. Basis data tidak dapat menulis karena dibaca; sesuatu harus memintanya.

## 4.2 Penegakan

Sebuah fungsi yang dipanggil aplikasi setelah rincian berhasil dimuat.

```sql
create or replace function public.catat_tanda_terima(p_penugasan_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.penugasan_pelaksana
     set dibaca_pada = now()
   where penugasan_id = p_penugasan_id
     and pelaksana_id = (select auth.uid())
     and dibaca_pada is null
     and dicabut_pada is null;
$$;

grant execute on function public.catat_tanda_terima(uuid) to authenticated;
```

Empat syarat pada klausa `where` masing-masing menutup satu kemungkinan:

| Syarat | Yang ditutupnya |
| --- | --- |
| `pelaksana_id = auth.uid()` | Tidak seorang pun dapat mencatatkan tanda terima atas nama orang lain, sekalipun ia mengirim identitas orang lain pada parameter |
| `dibaca_pada is null` | Pembukaan kedua dan seterusnya tidak menimpa waktu pembukaan pertama. Yang dicatat adalah kapan pertama kali dibuka |
| `dicabut_pada is null` | Pelaksana yang sudah dicabut tetap dapat membaca riwayatnya (BR-30), tetapi pembacaan itu bukan tanda terima |
| Tidak ada baris cocok | Kanit, Panit Penanggung Jawab, dan Kasubdit yang membuka rincian tidak mencatatkan apa pun. Fungsi berhasil tanpa mengubah apa pun, bukan gagal |

Baris terakhir itu disengaja. Fungsi dipanggil setiap kali rincian dibuka oleh siapa pun, dan bagi yang bukan pelaksana ia sekadar tidak berbuat apa-apa. Aplikasi tidak perlu memeriksa peran lebih dahulu.

## 4.3 Pemanggilan dari aplikasi

```javascript
// Dipanggil sekali setelah rincian SPT berhasil dimuat.
// Kegagalannya tidak boleh mengganggu tampilan.
async function catatTandaTerima(penugasanId) {
  const { error } = await supabase.rpc('catat_tanda_terima', {
    p_penugasan_id: penugasanId
  })
  if (error) console.warn('Tanda terima tidak tercatat:', error.message)
}
```

Kegagalannya sengaja tidak ditampilkan kepada pengguna. Pelaksana yang membuka SPT-nya di daerah bersinyal buruk tidak perlu diganggu pesan galat tentang catatan administratif; yang penting baginya adalah isi penugasan sudah terbaca. Bila panggilan gagal, tanda terima akan tercatat pada pembukaan berikutnya.

## 4.4 Mengapa bukan lewat hak tulis kolom

Postgres memungkinkan pemberian hak tulis pada satu kolom saja, dipadu kebijakan akses baris. Cara itu berjalan, tetapi menyebarkan aturan ke dua tempat sekaligus, dan membuat kolom `dibaca_pada` menjadi kolom yang dapat diisi nilai apa pun oleh pemiliknya, termasuk waktu yang bukan sekarang. Fungsi di atas menutup keduanya: waktunya selalu dari server, dan aturannya berada di satu tempat.

---
---

# Bagian 5 — Syarat penutupan dan pembatalan

## 5.1 Duduk perkaranya

BR-28 menetapkan SPT tidak dapat berpindah ke `selesai` sebelum berkas pindaian surat perintah dilampirkan. KP-6.2-47 menetapkan pembatalan wajib disertai alasan. Keduanya kini hanya dijaga antarmuka, dan antarmuka bukan pengaman.

## 5.2 Penegakan

Keduanya berupa syarat pada satu baris yang sama, sehingga tidak memerlukan pemicu. Batasan pemeriksaan sudah cukup, dan lebih baik daripada pemicu karena bersifat menyatakan, bukan menjalankan.

```sql
alter table public.penugasan
  add constraint chk_selesai_wajib_berkas
  check (
    status <> 'selesai'
    or (berkas_surat_path is not null and length(trim(berkas_surat_path)) > 0)
  );

alter table public.penugasan
  add constraint chk_batal_wajib_alasan
  check (
    status <> 'dibatalkan'
    or (alasan_pembatalan is not null and length(trim(alasan_pembatalan)) > 0)
  );

alter table public.penugasan
  add constraint chk_batas_tidak_mendahului_mulai
  check (tanggal_batas is null or tanggal_mulai is null or tanggal_batas >= tanggal_mulai);
```

Bentuk `status <> 'nilai' or syarat` adalah cara menuliskan "bila statusnya begini, maka syaratnya wajib". Ia membiarkan seluruh status lain lewat tanpa diperiksa, dan hanya menggigit pada status yang dimaksud.

Batasan ketiga menutup satu kondisi tepi yang sudah didaftar berkas Modul 6.2 tetapi belum punya penegakan: tanggal batas yang lebih awal daripada tanggal mulai.

## 5.3 Yang tidak dijaga batasan ini

KP-6.2-44 menetapkan penutupan **tetap diizinkan** meski masih ada Sesi Tugas terbuka, LHP yang belum masuk, atau pelaksana yang belum pernah melapor. Ketiganya adalah peringatan, bukan larangan. Batasan pemeriksaan sengaja tidak menyentuhnya, dan tidak boleh ditambahkan kelak dengan alasan kerapian. Menutup SPT yang belum rampung adalah keputusan Kanit, bukan urusan basis data.

## 5.4 Penanganan galat di aplikasi

Pelanggaran batasan pemeriksaan menghasilkan kode `23514` beserta nama batasannya. Nama itu diterjemahkan:

```javascript
const PESAN_BATASAN = {
  chk_selesai_wajib_berkas:
    'Lampirkan pindaian surat perintah tugas sebelum menutup penugasan.',
  chk_batal_wajib_alasan:
    'Alasan pembatalan wajib diisi.',
  chk_batas_tidak_mendahului_mulai:
    'Tanggal batas tidak boleh lebih awal daripada tanggal mulai.'
}

if (error?.code === '23514') {
  const nama = Object.keys(PESAN_BATASAN).find(k => error.message.includes(k))
  tampilkanKeterangan(PESAN_BATASAN[nama] ?? 'Data belum memenuhi syarat.')
}
```

---
---

# Bagian 6 — Empat syarat minimum bertahan seumur SPT

## 6.1 Duduk perkaranya

BR-33 menetapkan empat syarat wajib bertahan sepanjang hidup SPT: satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab aktif, dan satu pelaksana berperan Anggota. Ini yang paling sulit di antara delapan celah, karena tiga sebab sekaligus.

Pertama, syaratnya melintasi empat tabel, sehingga batasan pemeriksaan tidak dapat dipakai — ia hanya melihat satu baris.

Kedua, pelanggarannya terjadi lewat perubahan di tabel **lain**. Baris `penugasan` tidak disentuh sama sekali ketika seseorang mencabut pelaksana terakhir.

Ketiga, dua pencabutan yang tiba bersamaan masing-masing melihat masih ada dua yang tersisa, lalu keduanya lolos, dan yang tersisa menjadi nol. Menghitung saja tidak cukup.

## 6.2 Pemeriksaan saat penerbitan

Berlaku sekali, pada perpindahan `draf` ke `baru`.

```sql
create or replace function public.trg_periksa_syarat_terbit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kurang text[] := '{}';
  n int;
begin
  if not (new.status = 'baru' and old.status = 'draf') then
    return new;
  end if;

  if new.nomor_spt is null or length(trim(new.nomor_spt)) = 0 then
    kurang := kurang || 'nomor SPT';
  end if;

  select count(*) into n
    from public.penugasan_dasar where penugasan_id = new.id;
  if n = 0 then kurang := kurang || 'dasar penugasan'; end if;

  select count(*) into n
    from public.penugasan_lokasi
   where penugasan_id = new.id and lat is not null and lng is not null;
  if n = 0 then kurang := kurang || 'titik lokasi berkoordinat'; end if;

  select count(*) into n
    from public.penugasan_panit
   where penugasan_id = new.id and dicabut_pada is null;
  if n = 0 then kurang := kurang || 'Panit Penanggung Jawab'; end if;

  select count(*) into n
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.id
     and pp.dicabut_pada is null
     and u.peran = 'anggota';
  if n = 0 then kurang := kurang || 'pelaksana berperan Anggota'; end if;

  if array_length(kurang, 1) > 0 then
    raise exception 'SYARAT_TERBIT_KURANG: %', array_to_string(kurang, ', ');
  end if;

  return new;
end;
$$;

create trigger periksa_syarat_terbit
  before update on public.penugasan
  for each row
  execute function public.trg_periksa_syarat_terbit();
```

Pesan galatnya sengaja memuat **seluruh** syarat yang kurang, bukan yang pertama ditemukan. KP-6.2-04 menetapkan sistem menyebutkan syarat mana yang kurang, dan menyebutkannya satu per satu akan memaksa Kanit mencoba lima kali untuk mengetahui lima kekurangan.

## 6.3 Pemeriksaan saat pencabutan

Berlaku setiap kali `dicabut_pada` diisi. Di sinilah penguncian baris induk menjadi penting.

```sql
create or replace function public.trg_jaga_pelaksana_anggota_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (new.dicabut_pada is not null and old.dicabut_pada is null) then
    return new;
  end if;

  -- Penguncian baris induk. Inilah yang menyerialkan dua pencabutan
  -- yang tiba bersamaan: yang kedua menunggu sampai yang pertama selesai,
  -- lalu menghitung ulang dan melihat keadaan yang sudah berubah.
  select status into st
    from public.penugasan
   where id = new.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.penugasan_id
     and pp.dicabut_pada is null
     and pp.id <> new.id
     and u.peran = 'anggota';

  if sisa = 0 then
    raise exception 'PELAKSANA_ANGGOTA_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger jaga_pelaksana_anggota_terakhir
  before update on public.penugasan_pelaksana
  for each row
  execute function public.trg_jaga_pelaksana_anggota_terakhir();
```

Bentuk yang sama diterapkan pada `penugasan_panit` dengan nama `trg_jaga_panit_terakhir`, tanpa gabungan ke tabel `users` karena seluruh barisnya sudah pasti berperan Panit.

**Penguncian baris induk adalah bagian yang tidak boleh dihilangkan.** Tanpa `for update`, dua pencabutan bersamaan sama-sama menghitung satu yang tersisa, sama-sama lolos, dan SPT kehilangan seluruh pelaksananya. Dengan penguncian, yang kedua menunggu sampai yang pertama menuntaskan transaksinya, lalu menghitung ulang dan melihat kenyataan yang sudah berubah.

## 6.4 Pemeriksaan saat penghapusan dasar dan titik lokasi

```sql
create or replace function public.trg_jaga_dasar_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  select status into st
    from public.penugasan
   where id = old.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return old;
  end if;

  select count(*) into sisa
    from public.penugasan_dasar
   where penugasan_id = old.penugasan_id
     and id <> old.id;

  if sisa = 0 then
    raise exception 'DASAR_PENUGASAN_TERAKHIR';
  end if;

  return old;
end;
$$;

create trigger jaga_dasar_terakhir
  before delete on public.penugasan_dasar
  for each row
  execute function public.trg_jaga_dasar_terakhir();
```

Untuk `penugasan_lokasi` diperlukan dua pemicu terpisah:

**Pemicu penghapusan** dengan bentuk sama seperti di atas, tetapi menghitung hanya titik berkoordinat, ditambah satu pemeriksaan lagi yang menegakkan KP-6.2-42: titik yang sudah dirujuk laporan tidak boleh dihapus.

```sql
select count(*) into n
  from public.laporan_harian where lokasi_id = old.id;
if n > 0 then
  raise exception 'TITIK_SUDAH_DIRUJUK_LAPORAN';
end if;
```

**Pemicu penyuntingan**, karena syaratnya dapat dilanggar tanpa menghapus apa pun. Mengosongkan koordinat titik berkoordinat terakhir melanggar BR-33 sama persis dengan menghapusnya:

```sql
create or replace function public.trg_jaga_lokasi_berkoordinat_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (old.lat is not null and new.lat is null) then
    return new;
  end if;

  select status into st
    from public.penugasan where id = new.penugasan_id for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_lokasi
   where penugasan_id = new.penugasan_id
     and id <> new.id
     and lat is not null and lng is not null;

  if sisa = 0 then
    raise exception 'LOKASI_BERKOORDINAT_TERAKHIR';
  end if;

  return new;
end;
$$;
```

Pemicu terakhir ini adalah contoh mengapa daftar celah perlu diperiksa dua kali. Berkas Modul 6.2 menyebut celahnya sebagai "pelanggaran terjadi lewat penghapusan baris di tabel lain", padahal pengosongan kolom melanggarnya tanpa penghapusan sama sekali.

## 6.5 Ringkasan pemicu

| Pemicu | Tabel | Peristiwa | Menjaga |
| --- | --- | --- | --- |
| `periksa_syarat_terbit` | penugasan | sebelum update | Keempat syarat saat terbit |
| `jaga_pelaksana_anggota_terakhir` | penugasan_pelaksana | sebelum update | Minimal satu Anggota aktif |
| `jaga_panit_terakhir` | penugasan_panit | sebelum update | Minimal satu Panit aktif |
| `jaga_dasar_terakhir` | penugasan_dasar | sebelum delete | Minimal satu dasar |
| `jaga_lokasi_terakhir` | penugasan_lokasi | sebelum delete | Minimal satu titik berkoordinat, dan titik belum dirujuk laporan |
| `jaga_lokasi_berkoordinat_terakhir` | penugasan_lokasi | sebelum update | Koordinat titik terakhir tidak dikosongkan |

---
---

# Bagian 7 — Penanda Lewat Batas

## 7.1 Ketetapan

**Dihitung saat kueri, tidak disimpan.**

Kolom turunan yang disimpan akan menuntut sesuatu memperbaruinya setiap hari, dan sesuatu itu adalah pekerjaan berjadwal. Bagian 1.6 sudah menunjukkan pekerjaan berjadwal dapat berhenti tanpa jejak. Bila penanda ikut bersandar padanya, kegagalan penjadwal akan membuat penanda diam-diam salah, dan tidak ada yang menyadarinya.

Perhitungan saat kueri tidak dapat salah karena tidak bergantung pada apa pun selain tanggal hari ini.

## 7.2 Penegakan

Kolom berbangkit tidak dapat dipakai karena `current_date` tidak bersifat tetap, dan Postgres hanya menerima ungkapan tetap pada kolom berbangkit. Yang dipakai adalah tampilan.

```sql
create or replace view public.penugasan_tampil
with (security_invoker = on)
as
select p.*,
       (p.tanggal_batas is not null
        and p.tanggal_batas < current_date
        and p.status in ('baru', 'berjalan', 'bermasalah')) as lewat_batas,
       (current_date - p.tanggal_batas)                     as hari_terlampaui
  from public.penugasan p;
```

**`security_invoker = on` wajib ditulis.** Tanpa itu, tampilan berjalan dengan hak pembuatnya, dan seluruh aturan akses baris tabel `penugasan` terlewati — setiap pengguna akan membaca seluruh SPT lintas unit, termasuk draf milik orang lain. Ini kebocoran paling parah yang dapat terjadi pada modul ini, dan penyebabnya cuma satu baris yang lupa ditulis.

Aplikasi membaca `penugasan_tampil` untuk keperluan tampilan, dan tetap menulis ke `penugasan`.

## 7.3 Hubungan dengan pemberitahuan

Penanda dan pemberitahuan sengaja dipisah:

| | Sumber | Bila penjadwal berhenti |
| --- | --- | --- |
| Penanda Lewat Batas | Perhitungan saat kueri | Tetap benar |
| Pemberitahuan lewat batas | Pekerjaan berjadwal | Tidak terkirim |

Pemisahan ini yang membuat kegagalan penjadwal menjadi kehilangan kenyamanan, bukan kehilangan kebenaran. Kanit yang membuka daftar tetap melihat mana yang lewat batas; yang hilang hanya dorongan untuk membukanya.

---
---

# Bagian 8 — Penghapusan permanen

## 8.1 Duduk perkaranya

BR-32 mengizinkan penghapusan permanen hanya bila SPT belum pernah memiliki laporan, foto, rute, maupun Sesi Tugas. Pemeriksaannya melintasi beberapa tabel, dan di antara pemeriksaan terakhir dengan penghapusan terdapat jendela waktu ketika seorang pelaksana dapat membuka Sesi Tugas. Berkas Modul 6.2 sudah menyebut kondisi tepi ini pada 6.2.6.

## 8.2 Penegakan

Satu fungsi yang memeriksa, mencatat, dan menghapus dalam satu transaksi.

```sql
create or replace function public.hapus_penugasan_permanen(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
  n int;
begin
  -- Penguncian baris induk sampai transaksi selesai.
  select * into p
    from public.penugasan
   where id = p_id
     for update;

  if not found then
    raise exception 'PENUGASAN_TIDAK_DITEMUKAN';
  end if;

  -- Kewenangan diperiksa ulang di sini, tidak dipercayakan kepada pemanggil.
  if (select sipantau_auth.peran_saya()) <> 'kanit'
     or p.unit_id is distinct from (select sipantau_auth.unit_saya()) then
    raise exception 'TIDAK_BERWENANG';
  end if;

  select count(*) into n from public.sesi_tugas where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: Sesi Tugas'; end if;

  select count(*) into n from public.location_logs where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: rute'; end if;

  select count(*) into n from public.laporan_harian where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: laporan'; end if;

  select count(*) into n from public.foto_dokumentasi where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: foto'; end if;

  -- Jejak audit dicatat SEBELUM penghapusan, selagi datanya masih ada.
  insert into public.jejak_audit (pelaku_id, jenis, ringkasan, rincian)
  values (
    (select auth.uid()),
    'hapus_spt',
    coalesce(p.nomor_spt, '(tanpa nomor)') || ' — ' || coalesce(p.judul, '(tanpa judul)'),
    jsonb_build_object(
      'penugasan_id', p.id,
      'nomor_spt',    p.nomor_spt,
      'judul',        p.judul,
      'unit_id',      p.unit_id,
      'status',       p.status
    )
  );

  delete from public.penugasan where id = p_id;
end;
$$;

grant execute on function public.hapus_penugasan_permanen(uuid) to authenticated;
```

Empat hal yang menentukan pada fungsi di atas:

**Penguncian di awal.** `for update` menahan baris `penugasan` sampai transaksi selesai. Ini yang menutup jendela waktu, tetapi hanya bila pihak lain juga meminta kunci yang sama — lihat 8.3.

**Kewenangan diperiksa ulang.** Fungsi ber-`security definer` melewati aturan akses baris, sehingga ia wajib memeriksa sendiri. Ini mengikuti pola yang sama dengan Fungsi Tepi pada BR-24.

**Jejak audit sebelum penghapusan.** KP-6.2-49 menetapkan penghapusan tetap tercatat lengkap dengan nomor dan judulnya. Setelah baris terhapus, keduanya tidak dapat dibaca lagi.

**Urutan pemeriksaan dari yang paling mungkin.** Sesi Tugas diperiksa lebih dahulu karena itulah jejak yang paling awal muncul. Pesan galat menyebut jejak jenis apa yang ditemukan, sehingga Kanit tahu mengapa ditolak.

## 8.3 Syarat yang mengikat Modul 6.4

Penguncian pada 8.2 hanya bekerja bila pihak yang membuka Sesi Tugas ikut meminta kunci pada baris `penugasan` yang sama. Menyisipkan baris ke `sesi_tugas` tidak menyentuh baris `penugasan` sama sekali, sehingga tanpa syarat tambahan kedua tindakan berjalan tanpa saling melihat.

> **Mengikat untuk Modul 6.4.** Fungsi pembukaan Sesi Tugas wajib mengambil kunci baris induk sebelum menyisipkan:
>
> ```sql
> perform 1 from public.penugasan where id = p_penugasan_id for update;
> ```
>
> Tanpa baris itu, penghapusan permanen dan pembukaan Sesi Tugas dapat berjalan bersamaan, dan kondisi tepi terakhir pada 6.2.6 kembali terbuka.

## 8.4 Tabel yang belum ada

`foto_dokumentasi` menjadi urusan Modul 6.7 dan `lhp` menjadi urusan Modul 6.8. Selama keduanya belum ada, baris pemeriksaannya dihapus sementara dan **wajib ditambahkan kembali** begitu tabelnya lahir. Ini dicatat sebagai butir uji U-6.2-08 agar tidak terlupa.

---
---

# Bagian 9 — Koreksi dan tambahan

## 9.1 Kriteria penerimaan tambahan

| Kode | Kriteria |
| --- | --- |
| KP-6.2-63 | Bila dua permintaan membuka Sesi Tugas untuk orang yang sama tiba pada saat hampir bersamaan, maka tepat satu berhasil dan yang lain menerima keterangan berisi nomor SPT yang sesinya sedang terbuka |
| KP-6.2-64 | Bila laporan kedua dan seterusnya masuk pada SPT yang sudah berstatus berjalan, maka statusnya tidak berubah dan tidak ada tindakan tambahan yang berjalan |
| KP-6.2-65 | Bila laporan masuk pada SPT berstatus bermasalah, maka statusnya tetap bermasalah dan tidak dikembalikan ke berjalan oleh sistem |
| KP-6.2-66 | Bila pencatatan tanda terima gagal karena jaringan, maka rincian SPT tetap tampil utuh tanpa pesan galat, dan tanda terima tercatat pada pembukaan berikutnya |
| KP-6.2-67 | Bila dua pencabutan pelaksana Anggota tiba pada saat hampir bersamaan sementara hanya tersisa dua, maka tepat satu berhasil dan yang lain ditolak dengan keterangan pelaksana Anggota terakhir |
| KP-6.2-68 | Bila koordinat pada titik lokasi berkoordinat terakhir dikosongkan lewat penyuntingan, maka penyuntingan ditolak dengan keterangan yang sama seperti bila titik itu dihapus |
| KP-6.2-69 | Bila pekerjaan berjadwal berhenti berjalan, maka penanda Lewat Batas tetap tampil benar pada seluruh daftar dan rincian |
| KP-6.2-70 | Bila penghapusan permanen dan pembukaan Sesi Tugas untuk SPT yang sama tiba pada saat hampir bersamaan, maka tepat satu berhasil, dan bila yang berhasil adalah pembukaan sesi maka penghapusan ditolak dengan keterangan ada jejak Sesi Tugas |
| KP-6.2-71 | Bila SPT dihapus permanen, maka baris jejak audit memuat nomor SPT dan judulnya, terbaca setelah SPT tersebut tidak ada lagi |

## 9.2 Aturan global tambahan

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-35 | Aturan yang melintasi lebih dari satu baris atau lebih dari satu tabel ditegakkan lewat pemicu basis data yang mengunci baris induknya, bukan lewat pemeriksaan di aplikasi. Pemeriksaan di aplikasi hanya untuk memberi keterangan lebih awal, bukan sebagai pengaman | Seluruh modul |
| BR-36 | Pekerjaan berulang yang tidak dipicu tindakan manusia dijalankan Penjadwal Basis Data. Tidak ada keadaan sistem yang kebenarannya bergantung pada berjalannya pekerjaan berjadwal; penjadwal hanya boleh mengirim pemberitahuan dan merapikan data, tidak boleh menjadi satu-satunya sumber sebuah penanda | 6.2, 6.4, 6.9 |
| BR-37 | Setiap tampilan basis data wajib dibuat dengan `security_invoker = on`, sehingga aturan akses baris tabel di baliknya tetap berlaku bagi pembacanya | Seluruh modul |

## 9.3 Tambahan Section 3 Glosarium

| Istilah | Definisi tunggal |
| --- | --- |
| **Penjadwal Basis Data** | Ekstensi penjadwal yang berjalan di dalam basis data terkelola yang sama, dipakai untuk pekerjaan berulang yang tidak dipicu tindakan manusia. Bukan server terpisah. Dilarang disebut sebagai worker, cron server, atau background service |
| **Pekerjaan Berjadwal** | Satu tugas yang dijalankan Penjadwal Basis Data pada waktu tertentu secara berulang |

## 9.4 Perubahan Section 5

| Tabel | Perubahan |
| --- | --- |
| `penugasan` | Kolom baru `lewat_batas_diberitahukan_pada timestamptz`, boleh kosong |
| `notifikasi` | Tabel baru, berstatus [KERANGKA], difinalkan pada Modul 6.9 |
| Tampilan `penugasan_tampil` | Baru. Bukan tabel. Menambahkan kolom hitungan `lewat_batas` dan `hari_terlampaui` |
| Tampilan `kesehatan_penjadwal` | Baru. Bukan tabel. Dibaca hanya oleh Kasubdit |

## 9.5 Tambahan Section 8.8

- Pekerjaan berjadwal berhenti berjalan tanpa jejak galat, akibat project dijeda atau gangguan layanan
- Koordinat pada titik berkoordinat terakhir dikosongkan lewat penyuntingan, bukan lewat penghapusan
- Dua pencabutan pada baris berbeda tiba bersamaan sementara syarat minimum hanya berjarak satu

## 9.6 Tambahan Section 9.6 jenis tindakan jejak audit

Tidak ada tambahan. Seluruh tindakan pada addendum ini sudah tercakup daftar yang ditetapkan berkas Modul 6.2.

---
---

# Bagian 10 — Daftar tempel dan urutan pengerjaan

## 10.1 Tempel ke PRD

| Urutan | Tujuan | Isi |
| --- | --- | --- |
| 1 | Section 7, seluruh aturan Modul 6.2 | Penomoran ulang pada Bagian 0.2, dan catatan pencegah pada 0.4 |
| 2 | Seluruh berkas Revisi Modul 6.2 | Penggantian rujukan menurut Bagian 0.3 |
| 3 | Section 4.5 | Amandemen Penjadwal Basis Data pada 1.2 |
| 4 | Section 3 | Dua istilah pada 9.3 |
| 5 | Section 5 | Perubahan pada 9.4 |
| 6 | Section 6.2.8 (baru) | Bagian 1 sampai 8 berkas ini seluruhnya |
| 7 | Section 6.2.3 | KP-6.2-63 sampai KP-6.2-71 |
| 8 | Section 7 | BR-35, BR-36, BR-37 |
| 9 | Section 8.8 | Butir pada 9.5 |

## 10.2 Urutan pengerjaan saat sesi coding

Mengikat, karena tiap langkah bersandar pada langkah sebelumnya.

| No | Langkah | Selesai bila |
| --- | --- | --- |
| 1 | Buat tabel `penugasan`, `penugasan_dasar`, `penugasan_lokasi`, `penugasan_pelaksana`, `sesi_tugas`, `notifikasi` beserta indeks | Skema terbentuk, data semai masuk |
| 2 | Pasang tiga batasan pemeriksaan pada Bagian 5 | Menutup SPT tanpa berkas ditolak dari SQL Editor |
| 3 | Pasang indeks unik parsial `sesi_tugas` | Penyisipan sesi kedua untuk orang sama ditolak dengan kode 23505 |
| 4 | Pasang seluruh pemicu pada Bagian 6 | Penerbitan tanpa syarat lengkap ditolak; pencabutan terakhir ditolak |
| 5 | Pasang pemicu perpindahan status pada Bagian 3 | Penyisipan laporan pertama mengubah status dari SQL Editor |
| 6 | Aktifkan aturan akses baris dan tulis kebijakannya | Diuji dengan empat akun berbeda peran |
| 7 | Buat tampilan `penugasan_tampil` | Dibaca oleh dua peran berbeda, hasilnya berbeda sesuai lingkup |
| 8 | Buat fungsi `catat_tanda_terima` dan `hapus_penugasan_permanen` | Keduanya menolak pemanggil yang tidak berwenang |
| 9 | Pasang `pg_cron`, kedua pekerjaan berjadwal, dan tampilan kesehatan | Pekerjaan tercatat pada `cron.job`, jalannya terlihat pada `cron.job_run_details` |
| 10 | Halaman daftar, formulir penerbitan empat langkah, halaman rincian | Sesuai 6.2.5 |
| 11 | Penerjemahan seluruh kode galat menjadi keterangan berbahasa Indonesia | Tidak ada kode galat mentah yang sampai ke layar |

## 10.3 Butir uji

Sebagian menuntut dua sesi berjalan bersamaan; jalankan dari dua peramban atau dua perangkat.

| Kode | Butir uji | Yang dibuktikan |
| --- | --- | --- |
| U-6.2-01 | Buka Sesi Tugas untuk SPT A, lalu tanpa menutupnya buka Sesi Tugas untuk SPT B | Ditolak, dan keterangannya menyebut SPT A |
| U-6.2-02 | Kirim laporan pertama pada SPT berstatus Baru | Status berpindah ke Berjalan tanpa muat ulang |
| U-6.2-03 | Kirim laporan pada SPT berstatus Bermasalah | Status tetap Bermasalah |
| U-6.2-04 | Buka rincian SPT sebagai pelaksana, tutup, buka lagi | `dibaca_pada` terisi sekali dan tidak berubah pada pembukaan kedua |
| U-6.2-05 | Cabut pelaksana Anggota dari dua peramban bersamaan, sisakan dua | Tepat satu berhasil |
| U-6.2-06 | Kosongkan koordinat titik berkoordinat terakhir lewat penyuntingan | Ditolak |
| U-6.2-07 | Baca `penugasan_tampil` sebagai Anggota | Hanya SPT miliknya yang tampil, membuktikan `security_invoker` bekerja |
| U-6.2-08 | Setelah Modul 6.7 dan 6.8 selesai, periksa `hapus_penugasan_permanen` | Pemeriksaan `foto_dokumentasi` dan `lhp` sudah ditambahkan kembali |
| U-6.2-09 | Jedakan pekerjaan berjadwal, lampaui batas sebuah SPT, buka daftar | Penanda Lewat Batas tetap muncul |
| U-6.2-10 | Hapus SPT permanen dari satu peramban sementara peramban lain membuka Sesi Tugas untuk SPT itu | Tepat satu berhasil, tidak ada keadaan setengah jadi |
| U-6.2-11 | Terbitkan SPT dengan seluruh syarat kurang | Pesan galat menyebut kelima kekurangan sekaligus, bukan satu per satu |
| U-6.2-12 | Perpanjang batas SPT yang sudah pernah diberitahukan lewat batas, lalu lampaui lagi | Pemberitahuan terkirim lagi, membuktikan penanda dikosongkan |

---

## Penutup

Setelah addendum ini ditempel, Modul 6.2 tidak lagi menyisakan titik yang mengharuskan AI Agent menebak. Delapan celah tertutup, satu bentrokan penomoran dibereskan, dan satu celah yang tidak terdaftar pada berkas asalnya — pengosongan koordinat titik terakhir lewat penyuntingan — ditemukan saat penelusuran dan ikut ditutup.

Dua hal sengaja dinyatakan terus terang alih-alih ditutupi. Pertama, pekerjaan berjadwal dapat berhenti tanpa jejak, dan karena itu tidak ada satu pun kebenaran sistem yang digantungkan padanya. Kedua, pemeriksaan penghapusan permanen belum lengkap selama tabel foto dan LHP belum ada; kekurangan itu dicatat sebagai butir uji, bukan diperkirakan bentuknya sekarang.

Satu syarat yang mengikat modul lain juga dinyatakan di sini agar tidak terlewat: fungsi pembukaan Sesi Tugas pada Modul 6.4 wajib mengunci baris induknya. Tanpa itu, satu kondisi tepi yang sudah ditutup addendum ini akan kembali terbuka.


---
---
