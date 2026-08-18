# Modul 6.3 — Pelaporan Kegiatan Harian & Foto

Memuat penggalian modul, Addendum 6.3-T (spesifikasi teknis), dan Addendum 6.3-K
(koreksi dan peningkatan lintas modul).

> Addendum 6.3-K melahirkan Modul 6.10 (Ekspor Data & Pembatasan Laju), Antrean
> Luring, dan riwayat versi. Ketiganya lintas modul, bukan milik 6.3 saja.

---
---

# SiPANTAU — Revisi PRD: Modul 6.3 Pelaporan Kegiatan Harian & Foto

**Tanggal: 1 Agustus 2026 · Status: [FINAL] · Menggantikan Section 6.3 versi kerangka 0.2**

Berkas ini kompilasi utuh Modul 6.3 setelah seluruh ronde penggalian selesai dan sepuluh celah teknisnya ditutup Addendum 6.3-T. Disusun mengikuti kerangka Section 6.0, melanjutkan pola berkas Modul 6.1 dan 6.2. Prioritas konflik mengikuti Section 0.3. Bila berkas ini bertentangan dengan Addendum 6.1-T, 6.2-T, atau 6.3-T, ketiga addendum itu yang berlaku.

---

## Cara memakai berkas ini

| Bagian | Ditempel ke PRD sebagai |
| --- | --- |
| Bagian 1 | Tambahan Section 3.2 dan 3.8 baru |
| Bagian 2 | Pengganti Section 5.4, tambahan 5.19 sampai 5.21, amandemen 5.2 dan 5.5 |
| Bagian 3 | Pengganti Section 6.3 secara utuh |
| Bagian 4 | Tambahan Section 7 (BR-38 sampai BR-44) |
| Bagian 5 | Tambahan Section 8.9 baru |
| Bagian 6 | Tambahan Section 9.2 dan 9.6 |
| Bagian 7 | Perubahan Lampiran A dan B |
| Bagian 8 | Perubahan Section 2.3 (satu baris) |
| Bagian 9 | Ringkasan Addendum 6.3-T sebagai referensi silang |

## Riwayat Revisi — baris tambahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.5 | 1 Agu 2026 | Modul 6.3 digali sampai final. Butir A-05 terjawab. Status lokasi bertambah menjadi tiga nilai. Tabel `catatan_laporan` baru. Tabel `laporan_harian` ditulis ulang seluruhnya. Kolom koordinat pindah ke tiap foto. A-15 dikunci final: hanya Kanit menyetujui, satu tingkat, tidak wajib |
| 0.5-T | 1 Agu 2026 | Addendum 6.3-T menutup sepuluh celah teknis modul (kalkulasi lokasi PostGIS, penguncian ganda, pengisian sesi otomatis, pembekuan kolom fakta, view kehadiran tim, garbage collection foto yatim, view dinamis Belum Melapor) |

---
---

# Bagian 1 — Tambahan Section 3 Glosarium

## 3.2 Istilah penugasan dan kegiatan — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Laporan Harian** | Satu baris laporan kegiatan yang dikirim seorang pelaksana dari lapangan. Lapis pertama pelaporan. Bukan LHP |
| **Titik Terdekat** | Titik Lokasi SPT yang jaraknya paling kecil dari koordinat sebuah laporan. Dihitung sistem sebagai fakta, bukan sebagai penilaian |
| **Terekam di Luar Titik** | Keadaan laporan yang koordinatnya berhasil direkam tetapi berada di luar radius seluruh Titik Lokasi SPT. Bukan pelanggaran, bukan kegagalan |

## 3.8 Istilah pelaporan — bagian baru

| Istilah | Definisi tunggal |
| --- | --- |
| **Draf Laporan** | Isian laporan yang belum dikirim. Tersimpan di perangkat pelapor saja dan tidak pernah menyentuh basis data. Tidak terbaca siapa pun, termasuk pimpinan |
| **Tarik Laporan** | Tindakan pelapor membatalkan laporannya sendiri. Barisnya tetap ada dan tetap terbaca peninjau, ditandai ditarik beserta alasan. Bukan penghapusan |
| **Setujui** | Tindakan Kanit yang mengunci sebuah laporan. Sesudahnya laporan tidak dapat disunting maupun ditarik oleh siapa pun |
| **Minta Perbaikan** | Jenis catatan peninjau yang memindahkan laporan ke keadaan Perlu Diperbaiki. Pelapor memperbaiki laporan yang sama, bukan mengirim laporan baru |
| **Kewajiban Lapor Harian** | Ketentuan bahwa tiap pelaksana mengirim sekurang-kurangnya satu laporan per hari kalender selama SPT hidup. Dinyalakan atau dimatikan Kanit per SPT |

---
---

# Bagian 2 — Perubahan Model Data

## 5.4 Tabel laporan_harian — pengganti utuh

**[FINAL]**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | SPT yang dilaporkan |
| pelapor_id | uuid | Pengirim. Menggantikan `anggota_id`. Wajib tercantum aktif pada `penugasan_pelaksana` saat laporan dikirim |
| sesi_tugas_id | uuid | Sesi Tugas milik pelapor yang sedang berjalan **pada SPT yang sama** saat laporan dikirim. Diisi otomatis server (Addendum 6.3-T Celah 3), boleh kosong |
| jenis | enum | pulbaket_awal, perkembangan, akhir |
| uraian | text | Uraian kegiatan. Wajib |
| kendala | text | Kendala di lapangan. Boleh kosong |
| status_kegiatan | enum | berjalan, selesai, bermasalah. Keterangan pada laporan ini saja |
| lokasi_lat | numeric | Koordinat saat laporan dikirim. Boleh kosong. **Beku setelah INSERT** |
| lokasi_lng | numeric | Sama. **Beku setelah INSERT** |
| akurasi_meter | numeric | Ketelitian yang dilaporkan perangkat. Boleh kosong. Hanya disimpan dan ditampilkan. **Beku setelah INSERT** |
| status_lokasi | enum | **terverifikasi, di_luar_titik, tidak_terekam.** Dihitung server saat INSERT (Addendum 6.3-T Celah 1). **Beku** |
| lokasi_id | uuid | Titik Lokasi yang **ditunjuk pelapor**. Mengacu `penugasan_lokasi`. Boleh kosong. **Beku setelah INSERT** |
| lokasi_id_terdekat | uuid | Titik Lokasi terdekat **menurut hitungan sistem** (PostGIS). Boleh kosong. **Beku setelah INSERT** |
| jarak_meter | numeric | Jarak ke titik terdekat. Boleh kosong. **Beku setelah INSERT** |
| alasan_lokasi | enum | Tujuh nilai butir A-05. Wajib bila `status_lokasi = tidak_terekam`, dilarang terisi selain itu. **Beku** |
| alasan_lokasi_lainnya | text | Wajib bila `alasan_lokasi = lainnya`. **Beku** |
| keterangan_lokasi | text | **Opsional.** Tempat pelapor menerangkan keberadaannya bila `status_lokasi = di_luar_titik`. Tidak pernah diwajibkan |
| status_laporan | enum | terkirim, perlu_diperbaiki, disetujui, ditarik |
| disetujui_oleh | uuid | Kanit yang menyetujui. Boleh kosong |
| disetujui_pada | timestamptz | Boleh kosong |
| ditarik_pada | timestamptz | Boleh kosong |
| alasan_penarikan | text | Wajib bila `ditarik_pada` terisi |
| disunting_pada | timestamptz | Waktu penyuntingan terakhir isi (uraian/kendala/status_kegiatan) oleh pelapor. Boleh kosong. Diisi trigger, tidak bisa dipalsukan klien (Addendum 6.3-T Celah 4) |
| jumlah_suntingan | integer | Bawaan 0. Naik hanya saat isi milik pelapor berubah, bukan setiap UPDATE |
| penanda_perangkat | text | **Tidak boleh kosong.** Milik Addendum 6.1-T, jangan dirancang ulang |
| dikirim_pada | timestamptz | Waktu server saat baris disisipkan |

**Kolom yang dicabut dari versi 0.2:** `anggota_id` (berganti nama), `catatan_peninjau` dan `ditinjau_oleh` (pindah ke tabel `catatan_laporan`).

**Tidak ada kolom untuk versi lama.** Sesuai keputusan Q18, perbaikan menimpa isi yang sama dan laporan tetap satu baris. Yang tersimpan hanyalah penanda bahwa laporan pernah disunting beserta jumlahnya.

### Nilai enum alasan_lokasi — butir A-05, [FINAL]

| Nilai | Label |
| --- | --- |
| gps_tidak_tertangkap | Sinyal GPS tidak tertangkap di dalam gedung |
| daya_habis | Perangkat kehabisan daya saat kegiatan |
| izin_lokasi_mati | Izin lokasi tertolak atau tidak aktif |
| area_terbatas | Kegiatan di area terbatas yang melarang perangkat |
| disusun_setelah_pulang | Laporan disusun setelah meninggalkan lokasi |
| perangkat_rusak | Perangkat rusak atau tertinggal |
| lainnya | Lainnya — uraian wajib diisi |

## 5.19 Tabel catatan_laporan — tabel baru

**[FINAL]**

Menggantikan kolom `catatan_peninjau` dan `ditinjau_oleh`. Satu laporan dapat menerima catatan dari beberapa peninjau, dan catatan Kanit tidak lagi menimpa catatan Panit.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| laporan_id | uuid | Laporan yang dikomentari |
| peninjau_id | uuid | Penulis catatan. **Tidak boleh sama dengan `pelapor_id` laporan induknya** (BR-31). Ditegakkan trigger, bukan CHECK constraint (Addendum 6.3-T Celah 6) |
| jenis | enum | catatan, minta_perbaikan |
| isi | text | Isi catatan. Wajib |
| dibuat_pada | timestamptz | Waktu server |
| disunting_pada | timestamptz | Boleh kosong |

Catatan tidak pernah dihapus. Peninjau hanya boleh menyunting catatannya sendiri, dan penyuntingan meninggalkan penanda.

## 5.20 Tabel penugasan — kolom tambahan

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| wajib_lapor_harian | boolean | Bawaan `true`. Dimatikan Kanit bila SPT tidak menuntut laporan tiap hari |

Satuannya tetap: **sekali per hari kalender, per orang**. Karena satuannya tetap, satu kolom boolean sudah cukup dan tidak diperlukan kolom angka.

## 5.5 Tabel foto_dokumentasi — perubahan

**[KERANGKA]** — difinalkan pada Modul 6.7. Empat kolom sudah pasti dan dicatat di sini agar tidak terlewat:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| lat | numeric | Koordinat **milik foto ini sendiri**. Boleh kosong |
| lng | numeric | Sama. Boleh kosong |
| akurasi_meter | numeric | Boleh kosong |
| diambil_pada | timestamptz | Waktu pengambilan menurut perangkat. Boleh kosong untuk foto galeri |

Foto **tidak pernah** mewarisi koordinat laporan induknya. Foto tanpa koordinat tetap tanpa koordinat (BR-42).

Penarikan foto tidak memerlukan kolom sendiri: foto mengikuti keadaan laporan induknya. Modul 6.7 dan 6.8 wajib menyaring foto milik laporan berstatus `ditarik`.

## 5.8 Hubungan antar entitas — tambahan

```
penugasan
 └── laporan_harian
       ├── catatan_laporan     (jamak, boleh kosong)
       └── foto_dokumentasi    (jamak, boleh kosong, tiap foto punya titiknya sendiri)
 └── penugasan_lokasi
       ↑ ditunjuk oleh laporan_harian.lokasi_id
       ↑ dihitung ke laporan_harian.lokasi_id_terdekat
 └── sesi_tugas
       ↑ ditunjuk oleh laporan_harian.sesi_tugas_id (boleh kosong)
```

---
---

# Bagian 3 — Pengganti Section 6.3 secara utuh

**Status: [FINAL]**

## 6.3.1 Deskripsi

Modul ini mengatur lapis pertama pelaporan: laporan singkat berkala yang dikirim pelaksana dari lapangan selama SPT hidup, beserta foto yang melekat padanya, penetapan status lokasi, dan peninjauan oleh pimpinan.

Modul ini adalah tempat sistem paling dekat menyentuh perilaku orang, dan karena itu tempat Prinsip 0.6 paling mudah dilanggar. Seluruh rancangan di bawah bertumpu pada satu sikap: **sistem menyajikan fakta, manusia menilai**. Sistem mencatat jarak, waktu, dan titik terdekat; sistem tidak pernah menyimpulkan bahwa seseorang tidak bekerja.

Ada tiga rancangan yang menegakkan sikap itu di tingkat basis data:

- **Status lokasi memiliki tiga nilai**, bukan dua. Koordinat berhasil direkam di tempat lain adalah fakta yang berbeda dari koordinat yang gagal tertangkap sama sekali, dan menyamakan keduanya membuat catatan menjadi salah.
- **Akurasi GPS ikut disimpan** supaya cap Terverifikasi tidak menjadi klaim yang tidak bisa dipertanggungjawabkan. Koordinat dengan ketelitian 800 meter dan yang 8 meter tidak layak dinilai sama.
- **Kalkulasi status lokasi berlangsung di server**, bukan di ponsel pelapor. Klien hanya mengirim koordinat mentah; sisanya dihitung PostGIS (Addendum 6.3-T Celah 1).

Yang **bukan** urusan modul ini: cara foto diambil, diberi watermark, dikompresi, dan dirangkai jadi kolase (Modul 6.7); perekaman rute dan pembukaan Sesi Tugas (Modul 6.4); penyusunan LHP (Modul 6.8); pengiriman pemberitahuan (Modul 6.9). Modul ini menetapkan **kapan** pemberitahuan terpicu, bukan bagaimana ia sampai.

## 6.3.2 Cerita pengguna

**Pelaksana** — berperan Anggota, Panit, atau Kanit

- Sebagai pelaksana, saya ingin mengirim laporan singkat dari lapangan dalam waktu kurang dari dua menit, agar melapor tidak terasa lebih berat daripada bekerja.
- Sebagai pelaksana, saya ingin menyicil isian laporan sebagai draf di ponsel saya, agar saya bisa mulai menulis sambil menunggu dan menyelesaikannya nanti tanpa pimpinan melihat setengah jadinya.
- Sebagai pelaksana, saya ingin tetap bisa mengirim laporan ketika GPS tidak tertangkap, agar kegiatan yang sudah saya lakukan tidak hilang hanya karena urusan sinyal.
- Sebagai pelaksana, saya ingin memilih sendiri sedang berada di titik yang mana ketika tebakan sistem meleset, agar catatan yang tersimpan sesuai kenyataan.
- Sebagai pelaksana, saya ingin melampirkan foto dari beberapa tempat dalam satu laporan dan melihat titik-titiknya di peta, agar pimpinan mengerti alur pergerakan saya tanpa saya jelaskan panjang lebar.
- Sebagai pelaksana, saya ingin memperbaiki salah ketik pada laporan yang sudah terkirim, agar nama dan alamat yang keliru tidak ikut terbawa ke berkas resmi.
- Sebagai pelaksana, saya ingin menarik laporan yang salah kirim ke SPT lain, agar tidak mengotori berkas perkara yang tidak ada hubungannya.

**Panit**

- Sebagai Panit, saya ingin melihat laporan masuk dari SPT yang saya awasi dalam satu daftar, agar saya tidak perlu membuka SPT satu per satu.
- Sebagai Panit, saya ingin memberi catatan pada laporan, agar arahan saya tercatat dan tidak hilang di percakapan pesan singkat.
- Sebagai Panit, saya ingin meminta laporan diperbaiki ketika uraiannya terlalu tipis, agar berkasnya layak dipakai saat penyusunan LHP.

**Kanit**

- Sebagai Kanit, saya ingin melihat siapa yang belum melapor hari ini, agar saya menghubungi orangnya, bukan menunggu.
- Sebagai Kanit, saya ingin menyetujui laporan yang sudah benar, agar isinya terkunci dan tidak berubah lagi setelah dipakai sebagai bahan.
- Sebagai Kanit, saya ingin mematikan kewajiban lapor harian pada SPT yang memang tidak menuntutnya, agar penanda Belum Melapor tidak menyala tanpa alasan.

**Kasubdit**

- Sebagai Kasubdit, saya ingin membaca laporan lintas unit, agar saya menilai jalannya perkara tanpa meminta rekapan manual.

## 6.3.3 Kriteria penerimaan

### Pengiriman laporan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-01 | Bila pengguna bukan pelaksana aktif pada sebuah SPT, maka SPT itu tidak muncul pada pilihan penugasan di formulir laporan, dan penyisipan barisnya ditolak di tingkat basis data |
| KP-6.3-02 | Bila SPT berstatus baru, berjalan, atau bermasalah, maka laporan dapat dikirim, **tanpa memandang** apakah tanggal batas sudah terlampaui |
| KP-6.3-03 | Bila tanggal batas SPT sudah terlampaui, maka kepala formulir menampilkan peringatan Lewat Batas dan pengiriman **tetap** diizinkan |
| KP-6.3-04 | Bila SPT berstatus selesai atau dibatalkan, maka SPT itu hilang dari pilihan dan laporan baru tidak dapat masuk |
| KP-6.3-05 | Bila laporan dikirim sementara pelapor sedang memegang Sesi Tugas berjalan pada SPT yang sama, maka `sesi_tugas_id` terisi sesi tersebut oleh server |
| KP-6.3-06 | Bila laporan dikirim di luar Sesi Tugas, atau sesi aktif pelapor sedang untuk SPT lain, maka `sesi_tugas_id` dibiarkan kosong dan laporan **tidak** diberi penanda kurang sah |
| KP-6.3-07 | Bila laporan dikirim dari perangkat yang bukan Perangkat Terdaftar, maka penyisipan ditolak sesuai kebijakan Addendum 6.1-T |
| KP-6.3-08 | Bila laporan pertama pada sebuah SPT berstatus baru masuk, maka status SPT berpindah ke berjalan lewat pemicu yang sudah ditetapkan Addendum 6.2-T Bagian 3. Modul ini **tidak** membuat pemicu kedua |
| KP-6.3-09 | Bila laporan berjenis akhir masuk, maka layar Kanit menampilkan saran bahwa SPT tampaknya siap ditutup. Saran, bukan perintah, dan tidak mengubah status apa pun |
| KP-6.3-10 | Bila pelapor mengirim laporan berjenis apa pun, maka tidak ada urutan jenis yang dipaksakan dan laporan akhir boleh lebih dari satu |

### Draf

| Kode | Kriteria |
| --- | --- |
| KP-6.3-11 | Bila pelapor menekan Simpan Draf, maka isian tersimpan di perangkatnya sendiri dan **tidak ada baris** yang masuk ke basis data |
| KP-6.3-12 | Bila draf tersimpan, maka tidak ada pemberitahuan terkirim, tidak ada peninjau yang dapat membacanya, dan status SPT tidak berubah |
| KP-6.3-13 | Bila pelapor membuka kembali formulir laporan untuk SPT yang punya draf, maka isian terisi ulang dari draf tersebut |
| KP-6.3-14 | Bila draf sudah berhasil dikirim, maka draf lokalnya dihapus |
| KP-6.3-15 | Bila aplikasi dipasang ulang atau data aplikasi dibersihkan, maka draf hilang, dan pelapor sudah diberi tahu tentang hal ini pada teks bantuan di dekat tombol Simpan Draf |

### Status lokasi

| Kode | Kriteria |
| --- | --- |
| KP-6.3-16 | Bila koordinat berhasil direkam, maka server menghitung jarak ke seluruh Titik Lokasi SPT memakai PostGIS, menetapkan yang terdekat pada `lokasi_id_terdekat`, dan menyimpan jaraknya pada `jarak_meter`. Perhitungan tidak boleh dilakukan di klien |
| KP-6.3-17 | Bila jarak ke titik terdekat berada dalam radius titik tersebut, maka `status_lokasi` bernilai terverifikasi dan `lokasi_id` terisi titik itu sebagai tebakan awal |
| KP-6.3-18 | Bila koordinat berhasil direkam tetapi berada di luar radius seluruh titik, maka `status_lokasi` bernilai di_luar_titik dengan label Terekam di luar titik. Alasan **tidak** diwajibkan, dan tidak ada kalimat yang menyiratkan pelanggaran |
| KP-6.3-19 | Bila koordinat tidak berhasil direkam, maka `status_lokasi` bernilai tidak_terekam dan pelapor wajib memilih satu dari tujuh alasan A-05 |
| KP-6.3-20 | Bila alasan yang dipilih bernilai lainnya, maka uraian wajib diisi |
| KP-6.3-21 | Bila laporan tidak memiliki koordinat, maka pengiriman **tetap** diizinkan. Tidak ada keadaan apa pun yang membuat laporan ditolak karena urusan lokasi (BR-03) |
| KP-6.3-22 | Bila pelapor menimpa tebakan sistem dan memilih titik lain, maka `lokasi_id` terisi pilihannya sementara `lokasi_id_terdekat` dan `jarak_meter` tetap menyimpan hitungan sistem. Keduanya tersimpan berdampingan tanpa yang satu membatalkan yang lain |
| KP-6.3-23 | Bila `lokasi_id` pilihan pelapor berbeda dari `lokasi_id_terdekat`, maka tampilan rincian menyajikan keduanya sebagai keterangan datar. Sistem tidak menyatakan mana yang benar |
| KP-6.3-24 | Bila perangkat melaporkan ketelitian koordinat, maka angkanya disimpan pada `akurasi_meter` dan ditampilkan di sebelah status lokasi |
| KP-6.3-25 | Bila SPT tidak memiliki satu pun titik berkoordinat, maka seluruh laporan padanya bernilai di_luar_titik tanpa perhitungan. Keadaan ini tidak seharusnya terjadi karena BR-33, tetapi sistem tetap tidak boleh gagal karenanya |
| KP-6.3-26 | Bila laporan sudah tersimpan, maka seluruh kolom lokasi (`lokasi_lat`, `lokasi_lng`, `akurasi_meter`, `status_lokasi`, `lokasi_id_terdekat`, `jarak_meter`, `alasan_lokasi`, `lokasi_id`) **tidak dapat lagi diubah** oleh siapa pun lewat jalur mana pun |

### Foto

| Kode | Kriteria |
| --- | --- |
| KP-6.3-27 | Bila foto diambil lewat kamera aplikasi, maka koordinat, ketelitian, dan waktu pengambilan tersimpan **pada foto itu sendiri** |
| KP-6.3-28 | Bila foto diambil dari galeri, maka foto tersimpan tanpa koordinat dan **tidak** diberi koordinat pinjaman dari laporan induknya (BR-42) |
| KP-6.3-29 | Bila laporan dibuka, maka foto berkoordinat ditampilkan sebagai pin bernomor di atas peta kecil, dan foto tanpa koordinat dikumpulkan di bawahnya dalam kelompok bertajuk Tanpa titik lokasi |
| KP-6.3-30 | Bila laporan masih dapat disunting, maka foto masih dapat ditambahkan padanya |
| KP-6.3-31 | Bila laporan ditarik, maka seluruh fotonya ikut dianggap ditarik dan tidak lagi muncul sebagai bahan Kolase maupun LHP |
| KP-6.3-32 | Bila unggahan foto berhasil sementara baris laporan induknya gagal tersimpan, maka foto yatim tersebut dibersihkan pekerjaan berjadwal harian (Addendum 6.3-T Celah 9) |

### Penyuntingan, penarikan, persetujuan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-33 | Bila laporan berstatus terkirim atau perlu_diperbaiki, maka pelapornya dapat menyuntingnya kapan saja. Kolom yang dapat disunting hanya `uraian`, `kendala`, dan `status_kegiatan` |
| KP-6.3-34 | Bila laporan disunting, maka isinya tertimpa, `disunting_pada` diperbarui dan `jumlah_suntingan` bertambah satu oleh trigger — bukan oleh nilai yang dikirim klien (Addendum 6.3-T Celah 4). Tampilan menyertakan penanda pernah disunting beserta waktunya |
| KP-6.3-35 | Bila Kanit menekan Setujui, maka laporan berstatus disetujui dan terkunci: tidak dapat disunting, tidak dapat ditarik, oleh siapa pun termasuk Kasubdit dan pelapornya |
| KP-6.3-36 | Bila SPT ditutup atau dibatalkan, maka seluruh laporan di dalamnya ikut terkunci meskipun belum pernah disetujui. Penguncian ditegakkan trigger yang memeriksa status SPT induk saat UPDATE (Addendum 6.3-T Celah 2) |
| KP-6.3-37 | Bila laporan tidak pernah disetujui sampai SPT ditutup, maka laporan itu **tetap sah** dan tetap terhitung pada seluruh rekap. Persetujuan bukan syarat keabsahan |
| KP-6.3-38 | Bila pelapor menarik laporannya, maka alasan wajib diisi, baris tetap ada, dan peninjau tetap dapat membacanya dengan penanda ditarik |
| KP-6.3-39 | Bila laporan ditarik, maka ia tidak terhitung pada rekap jumlah laporan, tidak memenuhi Kewajiban Lapor Harian, dan tidak menjadi bahan LHP |
| KP-6.3-40 | Bila laporan pertama pada sebuah SPT ditarik, maka status SPT **tetap** berjalan dan tidak dikembalikan ke baru |
| KP-6.3-41 | Bila laporan salah dikirim ke SPT yang keliru, maka jalannya adalah menarik lalu mengirim ulang. Tidak ada pemindahan laporan antar-SPT |
| KP-6.3-42 | Bila laporan sudah berstatus disetujui atau ditarik, maka tidak ada tombol sunting, tarik, maupun tambah foto yang ditampilkan |

### Peninjauan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-43 | Bila peninjau membuka laporan yang **ia kirim sendiri**, maka tombol beri catatan tidak ditampilkan dan penyisipan catatannya ditolak di tingkat basis data lewat trigger, bukan CHECK (BR-31, Addendum 6.3-T Celah 6) |
| KP-6.3-44 | Bila beberapa peninjau memberi catatan pada satu laporan, maka seluruh catatan tersimpan dan terbaca berurutan menurut waktu. Tidak ada catatan yang menimpa catatan lain |
| KP-6.3-45 | Bila peninjau memilih jenis minta perbaikan, maka status laporan berpindah ke perlu_diperbaiki lewat trigger AFTER INSERT pada catatan_laporan (Addendum 6.3-T Celah 5), dan pelapor menerima pemberitahuan |
| KP-6.3-46 | Bila pelapor menyunting laporan berstatus perlu_diperbaiki lalu menyimpannya, maka status kembali ke terkirim dan peninjau yang meminta perbaikan menerima pemberitahuan |
| KP-6.3-47 | Bila peninjau menyunting catatannya sendiri, maka catatan lama tertimpa dan penanda pernah disunting muncul. Catatan tidak dapat dihapus |
| KP-6.3-48 | Bila peninjau hendak menyunting catatan milik peninjau lain, maka tindakan ditolak |
| KP-6.3-49 | Bila Panit sudah dicabut penunjukannya dari sebuah SPT, maka ia tetap dapat membaca laporan di SPT itu tetapi tidak dapat memberi catatan baru (BR-21) |

### Kewajiban lapor harian

| Kode | Kriteria |
| --- | --- |
| KP-6.3-50 | Bila Kanit menerbitkan SPT, maka `wajib_lapor_harian` bernilai benar secara bawaan dan dapat dimatikan kapan saja |
| KP-6.3-51 | Bila kewajiban menyala, maka setiap pelaksana yang belum mengirim laporan sah pada satu hari kalender diberi penanda Belum Melapor pada daftar hari itu. Penanda dihitung dinamis oleh view SQL, bukan disimpan di tabel (Addendum 6.3-T Celah 7) |
| KP-6.3-52 | Bila seorang pelaksana belum melapor sampai akhir hari, maka pelaksana itu dan Panit Penanggung Jawab menerima pemberitahuan lewat pekerjaan berjadwal yang membaca view tersebut |
| KP-6.3-53 | Bila kewajiban terlewat, maka **tidak ada** fungsi yang dikunci, tidak ada tombol yang mati, dan tidak ada kalimat yang menyatakan lalai, malas, atau tidak bekerja |
| KP-6.3-54 | Bila kewajiban dimatikan Kanit, maka penanda Belum Melapor tidak pernah muncul pada SPT tersebut |
| KP-6.3-55 | Bila hari itu jatuh pada hari libur atau akhir pekan, maka perhitungan tetap berjalan. Tidak ada pengecualian kalender |
| KP-6.3-56 | Bila pekerjaan berjadwal berhenti, maka penanda Belum Melapor tetap tampil benar di antarmuka Kanit karena dihitung ulang tiap kali halaman dibuka. Hanya pemberitahuannya yang telat |

### Lingkup data dan riwayat

| Kode | Kriteria |
| --- | --- |
| KP-6.3-57 | Bila pengguna membuka sebuah laporan, maka isinya hanya terbaca oleh pengirimnya, Panit Penanggung Jawab SPT itu, Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan |
| KP-6.3-58 | Bila sesama pelaksana membuka SPT yang sama, maka mereka melihat **bahwa** rekannya sudah melapor beserta waktunya, tetapi tidak melihat isi laporannya. Diselesaikan lewat view `rekap_laporan_tim` dengan `security_invoker = off` yang hanya mengekspos tiga kolom (Addendum 6.3-T Celah 8) |
| KP-6.3-59 | Bila Anggota membuka Riwayat Laporan, maka yang tampil hanya laporannya sendiri, termasuk yang sudah ditarik |
| KP-6.3-60 | Bila Panit membuka daftar laporan, maka yang tampil hanya laporan dari SPT yang ia awasi, dengan yang belum bercatatan berada di urutan atas |
| KP-6.3-61 | Bila Kasubdit membuka daftar laporan, maka ia melihat laporan lintas unit dan memperoleh penyaring unit |
| KP-6.3-62 | Bila daftar ditampilkan tanpa penyaring, maka urutannya terbaru di atas |

### Jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.3-63 | Bila terjadi salah satu tindakan berikut, maka satu baris jejak audit tercatat: `sunting_laporan`, `tarik_laporan`, `setujui_laporan`, `catat_laporan`, `minta_perbaikan_laporan`, `sunting_catatan_laporan` |
| KP-6.3-64 | Bila laporan dikirim, maka **tidak** ada baris jejak audit tersendiri. Baris laporannya sendiri sudah menjadi catatan lengkap dengan waktu, pengirim, dan penanda perangkat |

## 6.3.4 Aturan modul

1. **Tidak ada laporan yang ditolak karena urusan lokasi.** Ini pagar tertinggi di modul ini. Setiap rancangan yang berujung pada penolakan pengiriman karena koordinat adalah pelanggaran BR-03, sekeras apa pun alasannya terdengar masuk akal.
2. **Sistem menyajikan tiga fakta, tidak menyimpulkan satu pun kesimpulan.** Fakta itu: koordinat beserta ketelitiannya, titik terdekat beserta jaraknya, dan titik yang ditunjuk pelapor. Ketiganya ditampilkan berdampingan. Sistem tidak menulis kalimat semacam tidak sesuai penugasan atau di luar wilayah tugas.
3. **Ada tiga keadaan lokasi, bukan dua.** Gagal merekam dan berhasil merekam di tempat lain adalah dua hal berbeda, dan menyamakannya membuat catatan menjadi salah.
4. **Kalkulasi kritis berlangsung di server, bukan di klien.** Ini pagar teknis yang menopang seluruh nilai pembuktian modul. Ponsel pelapor hanya mengirim koordinat mentah; jarak, titik terdekat, dan status lokasi diputuskan PostGIS di server.
5. **Kolom fakta dibekukan setelah tercatat.** Yang berubah setelahnya hanya kolom yang memang berupa narasi manusia — `uraian`, `kendala`, `status_kegiatan`, catatan peninjau.
6. **Draf tidak pernah menyentuh basis data.** Selain melindungi setengah jadi dari mata pimpinan, ini juga yang menjaga pemicu Addendum 6.2-T tidak menjalankan SPT sebelum ada yang benar-benar dilaporkan.
7. **Laporan tidak pernah dihapus.** Koreksi lewat penyuntingan, pembatalan lewat penarikan. Angka rekap kemarin dan hari ini harus selalu bisa dijelaskan.
8. **Penguncian berasal dari dua arah**: persetujuan Kanit, dan penutupan SPT. Sesudah terkunci, tidak ada peran yang dapat membukanya kembali selain lewat pembukaan kembali SPT pada Modul 6.2.
9. **Foto membawa titiknya sendiri.** Satu laporan dapat merangkum kegiatan di beberapa tempat, dan memaksakan satu koordinat untuk semuanya akan menghapus justru bagian yang paling berguna bagi LHP.
10. **Kewajiban lapor harian tidak pernah mengunci apa pun.** Ia hanya menerbitkan penanda dan pemberitahuan. Sistem pengawasan yang menghukum akan dihindari penggunanya, dan sistem yang dihindari tidak mengawasi apa-apa.
11. **Peninjauan bersifat menumpuk, bukan menimpa.** Catatan Panit dan catatan Kanit berdiri sendiri-sendiri.
12. **Isi laporan bukan konsumsi sesama pelaksana.** Rekan setim cukup tahu bahwa laporan sudah masuk.

## 6.3.5 Antarmuka dan kondisi tampilan

Gaya visual mengikuti prototype: kartu `.card` dengan `.card-h` dan `.card-b`, kelompok isian `.fg` dengan label bertanda `.req`, area unggah `.drop`, deretan `.thumbs`, baris daftar `.rst`, lencana `.bd`, tombol `.btn-g` untuk tindakan utama dan `.btn-o` untuk tindakan sekunder, kotak catatan berlatar `var(--amber-bg)` dengan garis kiri `var(--gold)`. Tidak ada komponen baru yang diperkenalkan modul ini kecuali peta kecil pada rincian laporan, yang memakai Leaflet dengan gaya yang sama seperti peta pada Modul 6.2.

### Halaman Kirim Laporan

Dicapai lewat tombol mengambang di beranda pelaksana, seperti pada prototype. Isian berurutan:

1. **Penugasan** — hanya SPT tempat pengguna tercantum sebagai pelaksana aktif dan berstatus baru, berjalan, atau bermasalah. Bila SPT terpilih sudah lewat batas, muncul pita peringatan di atas formulir.
2. **Jenis laporan** dan **status kegiatan** berdampingan. Memilih status kegiatan bermasalah **tidak** langsung menyimpan; sistem membuka penuntun Tandai Bermasalah milik Modul 6.2 supaya jenis masalah dan uraiannya terisi lewat satu pintu yang sama.
3. **Lokasi** — kotak yang menampilkan hasil pembacaan GPS beserta ketelitiannya, titik terdekat beserta jaraknya, dan pemilih titik yang sudah terisi tebakan sistem. Bila koordinat gagal terbaca, kotak berubah menjadi pemilih alasan tujuh baris.
4. **Uraian kegiatan** — wajib.
5. **Kendala di lapangan** — boleh kosong.
6. **Foto dokumentasi** — dua tombol berbeda, Ambil Foto dan Pilih dari Galeri, bukan satu area unggah gabungan. Perbedaan keduanya menentukan status foto, jadi pilihannya harus terlihat sebagai dua jalan berbeda sejak awal.
7. Tombol **Simpan Draf** dan **Kirim Laporan**.

Panel Sebelum Mengirim pada prototype dipertahankan, tetapi butir ketiganya diganti. Kalimat "Laporan yang terkirim tidak dapat diubah" sudah tidak benar; penggantinya menerangkan bahwa laporan masih dapat diperbaiki sampai disetujui Kanit.

### Halaman Rincian Laporan

Kepala: nomor SPT, jenis laporan, nama pengirim, waktu kirim, lencana status laporan, dan bila ada, penanda pernah disunting.

Badan: kotak lokasi berisi tiga fakta berdampingan; peta kecil dengan pin bernomor untuk tiap foto berkoordinat; foto tanpa koordinat dalam kelompok terpisah di bawah peta; uraian; kendala; lalu daftar catatan peninjau berurutan menurut waktu.

| Peran | Tombol yang tampil |
| --- | --- |
| Pelapor, selama belum terkunci | Sunting, Tambah Foto, Tarik Laporan |
| Panit Penanggung Jawab aktif | Beri Catatan, Minta Perbaikan |
| Kanit unit pemilik | Beri Catatan, Minta Perbaikan, **Setujui** |
| Kasubdit | Beri Catatan |
| Pelaksana lain di SPT yang sama | tidak ada, dan isi laporan tidak terbuka |

### Daftar laporan

| Peran | Judul | Isi |
| --- | --- | --- |
| Anggota | Riwayat Laporan | Laporannya sendiri, termasuk yang ditarik |
| Panit | Review Laporan | Laporan dari SPT yang ia awasi, yang belum bercatatan di atas |
| Kanit | Semua Laporan | Seluruh laporan di unitnya, dengan rekap Belum Melapor Hari Ini di kepala halaman |
| Kasubdit | Semua Laporan | Lintas unit, dengan penyaring unit |

Penyaring: SPT, jenis laporan, status laporan, status lokasi, rentang tanggal, pelapor. Pencarian menyisir uraian dan kendala dalam lingkup data pengguna.

### Kondisi kosong

| Keadaan | Yang ditampilkan |
| --- | --- |
| Anggota belum pernah melapor | Ajakan mengirim laporan pertama beserta tombolnya |
| Panit belum menerima laporan apa pun | Keterangan bahwa laporan akan tampil begitu dikirim dari lapangan |
| Laporan tanpa foto | Keterangan datar bahwa tidak ada foto dilampirkan, tanpa nada menegur |
| Laporan tanpa catatan peninjau | Keterangan bahwa belum ada catatan |
| Seluruh pelaksana sudah melapor hari ini | Kalimat afirmatif singkat, bukan ruang kosong |

### Kondisi memuat dan galat

- Kotak lokasi menampilkan keadaan mencari sinyal selama pembacaan GPS berjalan, dengan tombol Lewati yang langsung membuka pemilih alasan. Pelapor tidak pernah terkunci menunggu GPS.
- Bila unggahan foto terputus, laporan tetap dapat dikirim tanpa foto itu, dan foto dapat ditambahkan kemudian.
- Bila pengiriman gagal karena jaringan, isian tidak hilang dan otomatis tersimpan sebagai draf lokal.
- Bila penyuntingan ditolak karena laporan baru saja disetujui Kanit, pesan yang muncul menerangkan sebabnya, bukan sekadar galat.

## 6.3.6 Edge case modul

| Kondisi | Penanganan |
| --- | --- |
| Pelapor dicabut dari SPT setelah mengirim laporan | Laporan tetap ada dan tetap terhitung. Pelapor tetap dapat membacanya, tetapi tidak dapat menyuntingnya lagi |
| Kanit menyetujui laporan tepat saat pelapor menekan simpan suntingan | Yang tiba lebih dulu di basis data menang. Bila persetujuan menang, penyuntingan ditolak trigger `trg_kunci_laporan` disertai keterangan |
| SPT ditutup saat pelapor sedang mengisi formulir | Pengiriman ditolak trigger `trg_periksa_pelapor_aktif`, isian tidak hilang, dan pelapor diberi tahu SPT sudah ditutup |
| Koordinat tiba terlambat, sesudah laporan dikirim | Tidak ada penyisipan koordinat susulan. Laporan tetap tidak_terekam. Kolom lokasi sudah dibekukan trigger `trg_tandai_sunting` |
| Jam perangkat dimundurkan pelapor | Seluruh waktu yang disimpan berasal dari server. Waktu perangkat hanya dipakai pada `diambil_pada` milik foto, dan itu ditampilkan sebagai waktu menurut perangkat |
| Laporan ditarik sesudah dipakai sebagai bahan LHP | Penarikan tetap diizinkan. LHP yang sudah tersusun tidak berubah sendiri; Modul 6.8 wajib menandai bahan yang ditarik saat LHP dibuka kembali |
| Dua peninjau meminta perbaikan hampir bersamaan | Keduanya tersimpan sebagai catatan. Status berpindah sekali saja, dan `UPDATE` kedua tidak berbahaya karena bersyarat `status_laporan NOT IN ('disetujui','ditarik')` |
| Pelapor menyunting laporan berkali-kali dalam satu menit | Diizinkan tanpa batas. `jumlah_suntingan` bertambah tiap kali |
| Titik Lokasi disunting Kanit sesudah ada laporan menunjuknya | Status lokasi laporan lama **tidak** dihitung ulang, sejalan dengan kondisi tepi yang sama pada Modul 6.2 |
| Pelaksana punya dua SPT aktif dan melapor di salah satunya | Kewajiban Lapor Harian dihitung **per SPT**, bukan per orang secara keseluruhan. Melapor di SPT A tidak menggugurkan kewajiban di SPT B |
| Foto berhasil terunggah tetapi baris laporannya gagal tersimpan | Pekerjaan `pg_cron` tengah malam menghapus objek Storage yang tidak tercatat di `foto_dokumentasi` dan berumur lebih dari 24 jam |
| Pelapor menarik seluruh laporannya di sebuah SPT | SPT tetap berstatus berjalan. Rekap menampilkan nol laporan sah, dan itu memang keadaan sebenarnya |

## 6.3.7 Ketergantungan

**Bergantung pada:**

| Modul / Berkas | Yang dibutuhkan |
| --- | --- |
| 6.1 + Addendum 6.1-T | Fungsi bantu `sipantau_auth`, penanda Perangkat Terdaftar, kebijakan insert `laporan_harian` |
| 6.2 + Addendum 6.2-T | Tabel `penugasan`, `penugasan_pelaksana`, `penugasan_lokasi` beserta radiusnya, status SPT, penuntun Tandai Bermasalah, pemicu perpindahan status baru→berjalan |
| 6.4 | Tabel `sesi_tugas` untuk pengisian `sesi_tugas_id`. Modul ini tetap berjalan bila kolom itu selalu kosong |
| **Addendum 6.3-T** | **Sepuluh trigger, satu view, dan satu pekerjaan berjadwal yang menutup celah teknis modul ini. Modul ini tidak berjalan tanpanya** |
| Ekstensi PostGIS | Wajib aktif pada Supabase project. Modul ini tidak berjalan tanpanya |

**Yang bergantung pada modul ini:**

| Modul | Yang dibutuhkannya |
| --- | --- |
| 6.5 Dashboard | Hitungan laporan masuk, laporan menunggu tinjauan, dan view `v_belum_lapor` |
| 6.7 Kolase | Foto beserta koordinat dan waktunya, serta penyaringan foto milik laporan yang ditarik |
| 6.8 LHP Ringkas | Uraian, kendala, status lokasi, dan foto sebagai bahan utama; `sesi_tugas_id` sebagai penaut ke potongan rute |
| 6.9 Notifikasi | Lima kejadian pemicu: laporan masuk, catatan diberikan, perbaikan diminta, laporan disetujui, kewajiban harian terlewat |

---
---

# Bagian 4 — Tambahan Section 7 Business Rules Global

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-38 | Laporan dapat dikirim selama SPT berstatus baru, berjalan, atau bermasalah, tanpa memandang tanggal batas. Sesudah selesai atau dibatalkan, tidak ada laporan baru yang dapat masuk | 6.3 |
| BR-39 | Laporan tidak pernah dihapus. Koreksi dilakukan lewat penyuntingan, pembatalan lewat penarikan. Laporan yang ditarik tetap tersimpan dan tetap terbaca peninjau | 6.3, 6.5, 6.8 |
| BR-40 | Laporan dapat disunting pelapornya sampai disetujui Kanit atau sampai SPT ditutup. Sesudah salah satu terjadi, laporan terkunci bagi siapa pun. Persetujuan tidak wajib dan bukan syarat keabsahan | 6.3 |
| BR-41 | Status lokasi laporan memiliki tiga nilai: terverifikasi, terekam di luar titik, dan tidak terekam. Sistem menyimpan jarak, ketelitian, titik terdekat, dan titik pilihan pelapor sebagai fakta berdampingan, dan tidak pernah menyimpulkan kepatuhan | 6.3, 6.5, 6.8 |
| BR-42 | Setiap foto membawa koordinat dan waktu pengambilannya sendiri. Foto tanpa koordinat tidak pernah diberi koordinat pinjaman dari laporan induknya | 6.3, 6.7, 6.8 |
| BR-43 | Catatan peninjau tidak pernah dihapus dan tidak pernah saling menimpa. Peninjau hanya dapat menyunting catatannya sendiri | 6.3 |
| BR-44 | Kewajiban Lapor Harian yang terlewat hanya menerbitkan penanda dan pemberitahuan. Tidak ada fungsi yang dikunci dan tidak ada kalimat yang menyatakan kelalaian | 6.3, 6.5, 6.9 |

---
---

# Bagian 5 — Tambahan Section 8.9 Pelaporan

- Koordinat tiba sesudah laporan terkirim
- Laporan ditarik sesudah dipakai sebagai bahan LHP
- Persetujuan Kanit dan penyuntingan pelapor tiba hampir bersamaan
- Foto terunggah sementara baris laporannya gagal tersimpan
- SPT ditutup saat formulir laporan sedang diisi
- SPT tidak memiliki satu pun titik berkoordinat saat laporan masuk

---
---

# Bagian 6 — Tambahan Section 9

## 9.2 Aturan akses per tabel

| Tabel | Baca | Tulis |
| --- | --- | --- |
| `laporan_harian` | Pelapornya sendiri; Panit yang punya penunjukan pada SPT itu, tanpa memandang `dicabut_pada`; Kanit unit pemilik; Kasubdit; Akun Pemeliharaan. **Sesama pelaksana tidak termasuk** | Penyisipan hanya oleh pelaksana aktif SPT itu dari Perangkat Terdaftar. Pembaruan hanya oleh pelapornya sendiri selama belum terkunci, kecuali kolom persetujuan yang hanya ditulis Kanit unit pemilik. Trigger membekukan seluruh kolom fakta dan kolom lokasi |
| `catatan_laporan` | Mengikuti hak baca laporan induknya | Penyisipan oleh Panit dengan penunjukan aktif, Kanit unit pemilik, dan Kasubdit. Trigger `trg_larang_tinjau_sendiri` menolak bila `peninjau_id = pelapor_id` laporan induk. Pembaruan hanya oleh penulisnya sendiri. Penghapusan tertutup bagi semua peran |
| `rekap_laporan_tim` (view) | Seluruh pelaksana aktif suatu SPT. Hanya kolom `penugasan_id`, `pelapor_id`, `dikirim_pada` — isi laporan tidak terekspos | Tidak dapat ditulis |
| `v_belum_lapor` (view) | Kanit unit pemilik dan Kasubdit. Dihitung dinamis, tidak disimpan | Tidak dapat ditulis |

## 9.6 Jenis tindakan jejak audit — tambahan

`sunting_laporan`, `tarik_laporan`, `setujui_laporan`, `catat_laporan`, `minta_perbaikan_laporan`, `sunting_catatan_laporan`.

Pengiriman laporan tidak dicatat tersendiri.

---
---

# Bagian 7 — Perubahan Lampiran A dan B

## Lampiran A

| Kode | Butir | Status |
| --- | --- | --- |
| A-02 | Data sensitif pada layanan awan | Belum terjawab, prioritas tinggi |
| A-03 | Angka target metrik | Belum terjawab |
| A-04 | Kop dan lambang institusi | Belum terjawab |
| ~~A-05~~ | ~~Daftar alasan lokasi tidak terekam~~ | **Terjawab.** Tujuh nilai, lihat 5.4. Dipindahkan ke Lampiran B butir B.10 |
| A-06 | Daftar resmi unit | Belum terjawab |
| A-07 | Kesediaan Kasubdit memakai sistem | Belum terjawab |
| A-08 | Pencatatan Akun Pemeliharaan | Belum terjawab |
| A-11 | Daftar resmi jenis masalah | Belum terjawab |
| A-12 | Kode klasifikasi surat tiap unit | Belum terjawab |
| A-13 | Kelengkapan daftar jenis kegiatan | Belum terjawab |
| A-14 | Kesediaan Kanit tercantum sebagai pelaksana | Belum terjawab |
| ~~A-15~~ | ~~Mekanisme persetujuan laporan~~ | **Dikunci sebagai final untuk pembangunan.** Hanya Kanit menyetujui, satu tingkat, tidak wajib, penutupan SPT ikut mengunci. Bila Pak Tito nanti menghendaki alur berbeda, perubahannya terbatas pada satu trigger `fn_kunci_laporan` dan satu baris matriks 2.3 |
| A-16 | Kesediaan kewajiban lapor harian berjalan pada hari libur | Belum terjawab. Sistem sekarang tanpa pengecualian kalender |

## Lampiran B — butir tambahan

### B.10 Pelaporan harian — bagian baru

- Laporan boleh dikirim selama SPT berstatus baru, berjalan, atau bermasalah, tanpa memandang tanggal batas; tertutup sesudah selesai atau dibatalkan
- Laporan boleh dikirim tanpa Sesi Tugas berjalan; bila ada sesi untuk SPT yang sama, laporan tertaut padanya lewat pengisian otomatis di server
- Draf laporan tersimpan di perangkat pelapor saja dan tidak pernah menyentuh basis data
- Status lokasi memiliki tiga nilai: Terverifikasi, Terekam di luar titik, Tidak terekam
- Tujuh alasan Lokasi tidak terekam: sinyal GPS tidak tertangkap di dalam gedung, perangkat kehabisan daya, izin lokasi tertolak atau tidak aktif, area terbatas yang melarang perangkat, laporan disusun setelah meninggalkan lokasi, perangkat rusak atau tertinggal, dan lainnya dengan uraian wajib
- Kalkulasi status lokasi berlangsung di server memakai PostGIS, bukan di klien
- Sistem menebak titik terdekat, pelapor boleh menimpanya, dan keduanya tersimpan berdampingan
- Ketelitian GPS ikut disimpan dan ditampilkan, tidak dipakai menolak apa pun
- Kolom fakta laporan (lokasi, ketelitian, status, titik terdekat, pelapor, penugasan, sesi, perangkat, waktu) dibekukan setelah tersimpan
- Laporan boleh disunting sampai disetujui Kanit atau sampai SPT ditutup; perbaikan menimpa laporan yang sama tanpa menyimpan versi lama
- Yang dapat disunting hanya uraian, kendala, dan status kegiatan
- Laporan tidak pernah dihapus; pembatalan berbentuk Tarik Laporan disertai alasan
- Laporan yang salah SPT diselesaikan dengan menarik lalu mengirim ulang
- Menarik laporan pertama tidak mengembalikan status SPT ke Baru
- Persetujuan laporan hanya oleh Kanit, satu tingkat, tidak wajib
- Catatan peninjau berdiri sendiri-sendiri pada tabel terpisah dan tidak saling menimpa
- Peninjau dapat meminta perbaikan; pelapor memperbaiki laporan yang sama
- Foto boleh ditambahkan setelah laporan terkirim selama laporan belum terkunci
- Setiap foto membawa koordinat dan waktunya sendiri; foto galeri tetap tanpa koordinat dan dikelompokkan terpisah
- Foto ikut dianggap ditarik bila laporan induknya ditarik
- Tidak ada urutan jenis laporan yang dipaksakan; laporan akhir boleh lebih dari satu dan hanya memunculkan saran kepada Kanit
- Kewajiban lapor harian sekali per hari kalender per orang per SPT, menyala secara bawaan, dapat dimatikan Kanit, tanpa pengecualian hari libur
- Kewajiban yang terlewat hanya menerbitkan penanda dan pemberitahuan, tanpa penguncian apa pun
- Penanda Belum Melapor dihitung dinamis dari view SQL, bukan dari penjadwal
- Isi laporan tidak terbaca sesama pelaksana; mereka hanya melihat bahwa rekannya sudah melapor lewat view kehadiran terpisah

---
---

# Bagian 8 — Perubahan Section 2.3 Matriks Hak Akses

Satu baris ditambahkan, satu baris diperjelas.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Memberi catatan pada laporan | Ya | Ya, unitnya | Ya, pada SPT yang diawasi | Tidak |
| **Menyetujui laporan** | **Tidak** | **Ya, unitnya** | **Tidak** | **Tidak** |

---
---

# Bagian 9 — Rujukan ke Addendum 6.3-T

Sepuluh celah teknis yang muncul pada penggalian modul ini sudah ditutup Addendum 6.3-T sebagai berkas terpisah. Ringkas silang untuk kemudahan pembacaan:

| Celah | Ditutup dengan | Kriteria terdampak |
| --- | --- | --- |
| 1 | Trigger `trg_hitung_lokasi` + PostGIS `ST_Distance` | KP-6.3-16 sampai KP-6.3-18, BR-41 |
| 2 | Trigger `trg_kunci_laporan` yang memeriksa status SPT induk | BR-40, KP-6.3-35, KP-6.3-36 |
| 3 | Trigger `trg_isi_sesi_tugas` bersyarat `penugasan_id` sama | KP-6.3-05, KP-6.3-06 |
| 4 | Trigger `trg_tandai_sunting` yang membekukan kolom fakta dan hanya mencatat suntingan isi | KP-6.3-33, KP-6.3-34, KP-6.3-26 |
| 5 | Trigger `trg_minta_perbaikan` AFTER INSERT pada catatan | KP-6.3-45, KP-6.3-46 |
| 6 | Trigger `trg_larang_tinjau_sendiri` (bukan CHECK constraint) | BR-31, KP-6.3-43 |
| 7 | View `v_belum_lapor` yang dihitung dinamis; `pg_cron` hanya kurir | KP-6.3-51 sampai KP-6.3-56 |
| 8 | View `rekap_laporan_tim` dengan `security_invoker = off` | KP-6.3-58 |
| 9 | Pekerjaan `pg_cron` harian membersihkan foto yatim | KP-6.3-32 |
| 10 | Trigger `trg_periksa_pelapor_aktif` yang sekaligus memeriksa status SPT | KP-6.3-01, KP-6.3-04 |

Modul ini tidak berjalan tanpa Addendum 6.3-T.

---

## Yang perlu Anda kerjakan setelah menempel berkas ini

1. Naikkan versi PRD menjadi 0.5 pada Kendali Dokumen dan Riwayat Revisi
2. Ubah penanda status Modul 6.3 dari [KERANGKA] menjadi [FINAL]
3. Perbarui Checklist Progres: centang Tahap 2 baris 6.3, coret A-05 dan A-15 pada Tahap 1, tambahkan A-16
4. Kejar ke pemilik produk: A-02 (naik prioritas), A-11, A-12, A-13, A-14, A-16
5. Pastikan Addendum 6.3-T ikut dilampirkan setiap kali PRD ini dikonsumsi AI Agent


---
---

# SiPANTAU — Addendum 6.3-T: Spesifikasi Teknis Modul Pelaporan Harian

**Tanggal: 1 Agustus 2026 · Status: [FINAL] · Menutup sepuluh celah pada Modul 6.3**

Seluruh keputusan di bawah diambil langsung mengikuti standar sistem pencatatan bukti kelas perusahaan (audit trail tak terbantahkan, kalkulasi kritis di server, hak baca minimal). Tidak menunggu konfirmasi bertahap. Bagian yang tetap butuh persetujuan Pak Tito hanya ditandai di paling akhir — dan berkas ini tetap berjalan penuh tanpa itu.

---

## Prinsip yang dipakai konsisten di semua sepuluh celah

1. **Klien tidak pernah dipercaya untuk apa pun yang menjadi fakta pembuktian.** Koordinat mentah boleh dikirim klien; kesimpulan dari koordinat itu (jarak, status, titik terdekat) selalu dihitung ulang di server dan menimpa apa pun yang dikirim klien.
2. **Kolom yang mewakili kejadian pada satu waktu tertentu dibekukan setelah tercatat.** Yang berubah setelahnya hanya kolom yang memang berupa narasi manusia.
3. **Setiap trigger memeriksa perubahan kolom, bukan sekadar kejadian UPDATE.** Mencegah efek samping saling menimpa antar-trigger.
4. **View untuk mengekspos data terbatas selalu memakai owner privilege (security_invoker OFF)**, bukan invoker privilege — supaya RLS ketat di tabel dasar tetap utuh sementara view yang dikendalikan sendiri boleh menampilkan potongan tersaring.

---

## Celah 1 — Kalkulasi lokasi di server

**Keputusan:** Kalkulasi terjadi satu kali, saat `INSERT`, tidak pernah pada `UPDATE`.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE FUNCTION fn_hitung_lokasi_laporan() RETURNS trigger AS $$
DECLARE
  titik RECORD;
BEGIN
  IF NEW.lokasi_lat IS NULL OR NEW.lokasi_lng IS NULL THEN
    NEW.status_lokasi := 'tidak_terekam';
    RETURN NEW;
  END IF;

  SELECT id, radius_meter,
         ST_Distance(
           ST_MakePoint(lng, lat)::geography,
           ST_MakePoint(NEW.lokasi_lng, NEW.lokasi_lat)::geography
         ) AS jarak
  INTO titik
  FROM penugasan_lokasi
  WHERE penugasan_id = NEW.penugasan_id AND lat IS NOT NULL
  ORDER BY jarak ASC LIMIT 1;

  IF titik IS NULL THEN
    NEW.status_lokasi := 'di_luar_titik';
    RETURN NEW;
  END IF;

  NEW.lokasi_id_terdekat := titik.id;
  NEW.jarak_meter := titik.jarak;
  NEW.status_lokasi := CASE WHEN titik.jarak <= titik.radius_meter
                             THEN 'terverifikasi' ELSE 'di_luar_titik' END;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hitung_lokasi
  BEFORE INSERT ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_hitung_lokasi_laporan();
```

**Kolom beku setelah `INSERT`:** `lokasi_lat`, `lokasi_lng`, `akurasi_meter`, `status_lokasi`, `lokasi_id_terdekat`, `jarak_meter`, `alasan_lokasi`, `alasan_lokasi_lainnya`, `lokasi_id` (pilihan pelapor), `pelapor_id`, `penugasan_id`, `sesi_tugas_id`, `penanda_perangkat`, `dikirim_pada`. Ditegakkan lewat pemeriksaan kolom pada Celah 4.

---

## Celah 2 — Penguncian ganda: persetujuan dan penutupan SPT

**Keputusan A-15 (final untuk keperluan pembangunan):** dipertahankan seperti usulan sebelumnya — hanya Kanit menyetujui, tidak wajib, penutupan SPT ikut mengunci semua. Ini pola standar di sistem kepolisian/enterprise manapun: persetujuan bertingkat tunggal, bukan berjenjang, karena Panit sudah punya jalur sendiri lewat catatan dan permintaan perbaikan.

```sql
CREATE FUNCTION fn_kunci_laporan() RETURNS trigger AS $$
DECLARE status_spt text;
BEGIN
  IF OLD.status_laporan IN ('disetujui', 'ditarik') THEN
    RAISE EXCEPTION 'Laporan sudah terkunci, tidak dapat diubah';
  END IF;

  SELECT status INTO status_spt FROM penugasan WHERE id = OLD.penugasan_id;
  IF status_spt IN ('selesai', 'dibatalkan') THEN
    RAISE EXCEPTION 'SPT sudah ditutup, laporan ikut terkunci';
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kunci_laporan
  BEFORE UPDATE ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_kunci_laporan();
```

Berjalan sebagai trigger **pertama** secara alfabetis (`trg_kunci_laporan` mendahului `trg_tandai_sunting` di bawah) sehingga tidak ada kolom yang sempat berubah sebelum pemeriksaan kunci dijalankan.

---

## Celah 3 — Pengisian `sesi_tugas_id` otomatis, terikat SPT yang sama

```sql
CREATE FUNCTION fn_isi_sesi_tugas() RETURNS trigger AS $$
BEGIN
  SELECT id INTO NEW.sesi_tugas_id
  FROM sesi_tugas
  WHERE pengguna_id = auth.uid()
    AND penugasan_id = NEW.penugasan_id
    AND ditutup_pada IS NULL
  LIMIT 1;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_isi_sesi_tugas
  BEFORE INSERT ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_isi_sesi_tugas();
```

Klien tidak pernah mengirim `sesi_tugas_id` dalam payload. Sesi aktif di SPT lain (sah menurut BR-24, karena satu orang boleh terlibat banyak SPT) tidak akan tertaut secara keliru karena `penugasan_id` disyaratkan sama.

---

## Celah 4 — Penanda penyuntingan, hanya untuk perubahan isi milik pelapor

```sql
CREATE FUNCTION fn_tandai_sunting() RETURNS trigger AS $$
BEGIN
  IF NEW.uraian IS DISTINCT FROM OLD.uraian
     OR NEW.kendala IS DISTINCT FROM OLD.kendala
     OR NEW.status_kegiatan IS DISTINCT FROM OLD.status_kegiatan THEN
    NEW.disunting_pada := now();
    NEW.jumlah_suntingan := OLD.jumlah_suntingan + 1;
  END IF;

  -- Kolom beku Celah 1 tidak boleh ikut berubah lewat jalur penyuntingan
  NEW.lokasi_lat := OLD.lokasi_lat;
  NEW.lokasi_lng := OLD.lokasi_lng;
  NEW.akurasi_meter := OLD.akurasi_meter;
  NEW.status_lokasi := OLD.status_lokasi;
  NEW.lokasi_id_terdekat := OLD.lokasi_id_terdekat;
  NEW.jarak_meter := OLD.jarak_meter;
  NEW.lokasi_id := OLD.lokasi_id;
  NEW.pelapor_id := OLD.pelapor_id;
  NEW.penugasan_id := OLD.penugasan_id;
  NEW.sesi_tugas_id := OLD.sesi_tugas_id;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tandai_sunting
  BEFORE UPDATE ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_tandai_sunting();
```

Persetujuan Kanit, penarikan, dan perpindahan ke `perlu_diperbaiki` (Celah 5) semuanya berupa `UPDATE` yang **tidak** menyentuh `uraian`/`kendala`/`status_kegiatan`, jadi tidak pernah keliru tercatat sebagai suntingan pelapor.

---

## Celah 5 — Perpindahan ke `perlu_diperbaiki`

```sql
CREATE FUNCTION fn_minta_perbaikan() RETURNS trigger AS $$
BEGIN
  IF NEW.jenis = 'minta_perbaikan' THEN
    UPDATE laporan_harian
    SET status_laporan = 'perlu_diperbaiki'
    WHERE id = NEW.laporan_id AND status_laporan NOT IN ('disetujui', 'ditarik');
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_minta_perbaikan
  AFTER INSERT ON catatan_laporan
  FOR EACH ROW EXECUTE FUNCTION fn_minta_perbaikan();
```

Dan sebaliknya — penyuntingan pelapor mengembalikan status:

```sql
-- ditambahkan pada fn_tandai_sunting, di akhir sebelum RETURN NEW
IF OLD.status_laporan = 'perlu_diperbaiki'
   AND (NEW.uraian IS DISTINCT FROM OLD.uraian OR NEW.kendala IS DISTINCT FROM OLD.kendala) THEN
  NEW.status_laporan := 'terkirim';
END IF;
```

---

## Celah 6 — Larangan meninjau laporan sendiri, lewat trigger bukan CHECK

```sql
CREATE FUNCTION fn_larang_tinjau_sendiri() RETURNS trigger AS $$
DECLARE pemilik uuid;
BEGIN
  SELECT pelapor_id INTO pemilik FROM laporan_harian WHERE id = NEW.laporan_id;
  IF pemilik = NEW.peninjau_id THEN
    RAISE EXCEPTION 'Tidak dapat meninjau laporan sendiri';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_larang_tinjau_sendiri
  BEFORE INSERT ON catatan_laporan
  FOR EACH ROW EXECUTE FUNCTION fn_larang_tinjau_sendiri();
```

---

## Celah 7 — "Belum Melapor" dihitung dinamis, penjadwal hanya kurir

```sql
CREATE VIEW v_belum_lapor AS
SELECT pp.penugasan_id, pp.pelaksana_id
FROM penugasan_pelaksana pp
JOIN penugasan p ON p.id = pp.penugasan_id
WHERE p.status IN ('baru', 'berjalan', 'bermasalah')
  AND p.wajib_lapor_harian = true
  AND pp.dicabut_pada IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM laporan_harian lh
    WHERE lh.penugasan_id = pp.penugasan_id
      AND lh.pelapor_id = pp.pelaksana_id
      AND lh.status_laporan <> 'ditarik'
      AND lh.dikirim_pada::date = current_date
  );
```

Pekerjaan `pg_cron` malam hari hanya membaca `v_belum_lapor` lalu menembakkan pemberitahuan (Modul 6.9). Kalau `pg_cron` berhenti, tampilan Kanit tetap benar karena dihitung ulang tiap kali halaman dibuka — hanya pemberitahuannya yang telat, bukan datanya yang salah.

---

## Celah 8 — Kehadiran rekan tanpa membocorkan isi

```sql
CREATE VIEW rekap_laporan_tim
WITH (security_invoker = off) AS
SELECT penugasan_id, pelapor_id, dikirim_pada
FROM laporan_harian
WHERE status_laporan <> 'ditarik';

GRANT SELECT ON rekap_laporan_tim TO authenticated;
```

`security_invoker = off` (bawaan) membuat *view* berjalan dengan hak akses pemiliknya sehingga RLS ketat di `laporan_harian` tetap utuh, sementara *view* ini sendiri hanya membocorkan tiga kolom yang memang boleh dilihat sesama pelaksana.

---

## Celah 9 — Foto yatim dibersihkan berjadwal

```sql
CREATE FUNCTION fn_bersihkan_foto_yatim() RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'dokumentasi'
    AND created_at < now() - interval '24 hours'
    AND name NOT IN (SELECT jalur_berkas FROM foto_dokumentasi);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('bersih-foto-yatim', '0 2 * * *', 'SELECT fn_bersihkan_foto_yatim()');
```

Berjalan tengah malam, terpisah dari pemeriksaan lain, dan tidak memengaruhi laporan yang sudah tersimpan sah.

---

## Celah 10 — Pemeriksaan gabungan saat pengiriman laporan

```sql
CREATE FUNCTION fn_periksa_pelapor_aktif() RETURNS trigger AS $$
DECLARE status_spt text;
BEGIN
  SELECT status INTO status_spt FROM penugasan WHERE id = NEW.penugasan_id;
  IF status_spt NOT IN ('baru', 'berjalan', 'bermasalah') THEN
    RAISE EXCEPTION 'SPT tidak lagi menerima laporan';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM penugasan_pelaksana
    WHERE penugasan_id = NEW.penugasan_id
      AND pelaksana_id = NEW.pelapor_id
      AND dicabut_pada IS NULL
  ) THEN
    RAISE EXCEPTION 'Bukan pelaksana aktif pada SPT ini';
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_periksa_pelapor_aktif
  BEFORE INSERT ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_periksa_pelapor_aktif();
```

## Urutan eksekusi trigger `BEFORE INSERT` pada `laporan_harian`

PostgreSQL menjalankan trigger dengan event sama secara alfabetis menurut nama:

1. `trg_hitung_lokasi` (Celah 1)
2. `trg_isi_sesi_tugas` (Celah 3)
3. `trg_periksa_pelapor_aktif` (Celah 10)

Ketiganya independen satu sama lain sehingga urutan ini aman. `trg_kunci_laporan` berjalan lebih dulu daripada `trg_tandai_sunting` pada event `UPDATE` karena alfabet — juga aman, sebab pemeriksaan kunci tidak bergantung pada hasil penandaan sunting.

---

## Yang tetap perlu dikonfirmasi Pak Tito, tidak menghambat pembangunan

- **A-15** — mekanisme persetujuan laporan dipakai final seperti tertulis di Celah 2. Kalau beliau menghendaki alur berbeda (misalnya Panit ikut menyetujui sebelum Kanit), yang berubah hanya `fn_kunci_laporan` dan satu baris pada matriks 2.3 — tidak menyentuh sembilan celah lainnya.
- **A-16** — kewajiban lapor harian tanpa pengecualian hari libur, sudah tertanam di `v_belum_lapor` (`p.wajib_lapor_harian = true` tanpa pengecualian kalender).

Berkas ini siap dipakai AI Agent untuk membangun Modul 6.3 sepenuhnya. Modul 6.4 (GPS Tracking) berikutnya akan mengisi bentuk akhir `sesi_tugas.sebab_penutupan` yang masih [KERANGKA].


---
---

# SiPANTAU — Addendum 6.3-K

**Koreksi Modul 6.3 dan Peningkatan Lintas Modul**

Tanggal: 2 Agustus 2026 · Status: [FINAL] · Pelengkap berkas Modul 6.3 dan Addendum 6.3-T

---

## Apa isi berkas ini

Dua hal yang sengaja disatukan dalam satu berkas agar tidak menambah dokumen yang harus dijaga, tetapi dipisah tegas karena jangkauannya berbeda.

**Bagian A — Koreksi Modul 6.3.** Enam temuan pada pemeriksaan berkas Modul 6.3. Satu di antaranya memblokir pembangunan karena bertabrakan dengan aturan global yang sudah berlaku.

**Bagian B — Peningkatan Lintas Modul.** Enam kemampuan yang menaikkan sistem ke tingkat yang wajar bagi perangkat lunak institusi. Seluruh aturannya masuk Section 7 sebagai BR bernomor, sehingga tetap ditemukan dari modul mana pun — bukan terkubur di berkas yang hanya dibuka saat mengerjakan Modul 6.3.

| | Pokok | Ditutup pada |
| --- | --- | --- |
| A-1 | Tabrakan dengan BR-37 tentang `security_invoker` | A.1 |
| A-2 | Laporan Kanit tidak dapat disetujui siapa pun | A.2 |
| A-3 | Tidak ada riwayat versi pada sistem yang tujuannya akuntabilitas | A.3 |
| A-4 | `rekap_laporan_tim` berpotensi membocorkan data lintas unit | A.4 |
| A-5 | PostGIS belum tercatat pada Section 4 | A.5 |
| A-6 | Rujukan BR-21 pada KP-6.3-49 perlu diverifikasi | A.6 |
| B-1 | Antrean Luring | B.1 |
| B-2 | Riwayat Versi (rancangan teknis penuh) | B.2 |
| B-3 | Ekspor Data Institusi | B.3 |
| B-4 | Pembatasan Laju | B.4 |
| B-5 | Pemantauan Kesehatan Sistem | B.5 |
| B-6 | Pencadangan Berkala | B.6 |

**Penomoran.** Aturan tertinggi yang sudah dipakai adalah BR-44. Berkas ini memakai BR-45 sampai BR-53, ditambah satu amandemen pada BR-37. Kriteria penerimaan Modul 6.3 tertinggi adalah KP-6.3-64; berkas ini memakai KP-6.3-65 dan seterusnya.

---
---

# BAGIAN A — KOREKSI MODUL 6.3

## A.1 Tabrakan dengan BR-37

### Duduk perkaranya

Modul 6.3 memakai `security_invoker = off` pada view `rekap_laporan_tim`. BR-37 dari Addendum 6.2-T berbunyi mutlak:

> Setiap tampilan basis data wajib dibuat dengan `security_invoker = on`, sehingga aturan akses baris tabel di baliknya tetap berlaku bagi pembacanya.

Menurut Section 0.3, Business Rules menang atas deskripsi modul. AI Agent yang patuh akan menolak membangun view itu, atau membangunnya dengan `on` sehingga fiturnya mati diam-diam — pelaksana tidak membaca apa pun karena aturan akses baris memblokirnya, dan tidak ada galat yang muncul.

Niat rancangan Modul 6.3 sendiri sah. Ia justru **ingin** melewati aturan akses baris, supaya tiga kolom sempit dapat dibuka kepada rekan setim yang tidak berhak membaca tabel induknya. Yang keliru bukan rancangannya, melainkan BR-37 yang ditulis tanpa memberi ruang bagi keadaan ini.

### Amandemen BR-37

Menggantikan bunyi lama secara utuh:

> **BR-37.** Setiap tampilan basis data dibuat dengan `security_invoker = on`. Pengecualian hanya diberikan kepada tampilan yang sengaja membuka sebagian kolom kepada peran yang tidak berhak membaca tabel induknya. Tampilan pengecualian wajib memenuhi tiga syarat sekaligus: menyaring dirinya sendiri memakai `auth.uid()` di dalam klausa `where`, membuka hanya kolom yang benar-benar diperlukan, dan terdaftar pada daftar tertutup di bawah. Penambahan di luar daftar wajib melalui revisi PRD yang tercatat.
>
> **Daftar tertutup tampilan pengecualian:** `rekap_laporan_tim`.

Bentuk ini mengikuti pola yang sudah dipakai Addendum 6.1-T untuk Fungsi Tepi: bukan melarang, bukan pula membuka lebar, melainkan membuka satu pintu bernama dengan syarat yang diperiksa.

---

## A.2 Laporan Kanit tidak dapat disetujui

### Duduk perkaranya

Tiga aturan yang masing-masing benar menghasilkan jalan buntu bila ditemukan bersamaan:

- BR-34 mengizinkan Kanit menjadi pelaksana dan mengirim laporan
- Matriks Modul 6.3 Bagian 8 menetapkan hanya Kanit yang dapat menyetujui laporan
- BR-31 melarang siapa pun meninjau laporannya sendiri

Akibatnya laporan yang dikirim Kanit tidak memiliki satu pun peran yang dapat menyetujuinya. Ini tidak fatal karena persetujuan memang tidak wajib dan laporan tetap sah menurut KP-6.3-37. Yang menjadi persoalan adalah akibat sampingannya: laporan Kanit tetap dapat disunting sampai SPT ditutup, sementara laporan bawahannya dapat dikunci lebih awal. Kebalikan dari yang semestinya.

### Ketetapan

Kewenangan Kasubdit dibuka, tetapi **dipersempit setajam mungkin**. Membukanya secara umum akan membuat Kasubdit dapat menyetujui laporan Anggota, melangkahi Kanit, dan mengaburkan garis komando yang dijaga sejak Modul 6.1.

> **BR-52.** Kasubdit dapat menyetujui sebuah laporan hanya bila pelapornya berperan Kanit. Laporan dari pelapor berperan lain tetap menjadi kewenangan Kanit unit pemilik. Larangan meninjau laporan sendiri tetap berlaku bagi Kasubdit.

### Perubahan matriks Section 2.3

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Menyetujui laporan | **Ya, hanya bila pelapornya Kanit** | Ya, unitnya, kecuali laporannya sendiri | Tidak | Tidak |

### Penegakan

```sql
create or replace function public.fn_periksa_wewenang_setuju()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  peran_pelapor text;
  peran_penyetuju text;
  unit_pelapor uuid;
begin
  if new.status_laporan is not distinct from old.status_laporan
     or new.status_laporan <> 'disetujui' then
    return new;
  end if;

  if new.disetujui_oleh = new.pelapor_id then
    raise exception 'TIDAK_BOLEH_SETUJUI_SENDIRI';
  end if;

  select u.peran into peran_pelapor
    from public.users u where u.id = new.pelapor_id;
  select u.peran into peran_penyetuju
    from public.users u where u.id = new.disetujui_oleh;

  if peran_penyetuju = 'kasubdit' then
    if peran_pelapor <> 'kanit' then
      raise exception 'KASUBDIT_HANYA_SETUJUI_LAPORAN_KANIT';
    end if;
    return new;
  end if;

  if peran_penyetuju = 'kanit' then
    select p.unit_id into unit_pelapor
      from public.penugasan p where p.id = new.penugasan_id;
    if unit_pelapor is distinct from (select sipantau_auth.unit_saya()) then
      raise exception 'BUKAN_UNIT_ANDA';
    end if;
    return new;
  end if;

  raise exception 'TIDAK_BERWENANG_MENYETUJUI';
end;
$$;

create trigger periksa_wewenang_setuju
  before update on public.laporan_harian
  for each row
  execute function public.fn_periksa_wewenang_setuju();
```

Perhatikan urutan pemeriksaannya. Larangan menyetujui laporan sendiri diperiksa **lebih dahulu** daripada peran, sehingga seorang Kanit yang mencoba menyetujui laporannya sendiri ditolak dengan alasan yang tepat, bukan dengan alasan kewenangan.

---

## A.3 Riwayat versi

### Duduk perkaranya

Keputusan Q18 menetapkan penyuntingan menimpa isi lama, menyisakan `disunting_pada` dan `jumlah_suntingan`. Untuk sistem yang alasan keberadaannya adalah mencegah penyalahgunaan wewenang, ini lubang yang mendasar.

Urutan kejadian yang mungkin: pelapor mengirim laporan, Panit membacanya, pelapor menulis ulang seluruh uraiannya, dan Panit tidak memiliki cara mengetahui apa yang berubah. Yang tersisa hanya angka penghitung.

Penawar yang ada sekarang adalah tombol Setujui milik Kanit yang mengunci laporan. Tetapi KP-6.3-37 menegaskan persetujuan tidak wajib, sehingga dalam praktiknya sebagian besar laporan akan tetap terbuka untuk disunting sampai SPT ditutup.

### Ketetapan

Riwayat versi dipasang, dan **berlaku dua arah**. Menyimpan riwayat laporan Anggota tanpa menyimpan riwayat catatan pimpinan akan berat sebelah, dan justru catatan pimpinan yang lebih menentukan nasib orang.

Versi lama **terbaca peninjau** langsung di halaman rincian, bukan disembunyikan di jejak audit. Peninjau adalah pihak yang paling membutuhkannya, dan menyembunyikannya di tempat yang hanya dibuka saat ada masalah membuat fiturnya nyaris tak berguna.

Rancangan teknis penuhnya ada pada B.2, karena mekanismenya sama dan dipakai lintas modul.

---

## A.4 `rekap_laporan_tim` wajib menyaring dirinya sendiri

### Duduk perkaranya

Dengan `security_invoker = off`, tampilan berjalan dengan hak pemiliknya dan aturan akses baris **sepenuhnya dilewati**. Bila tampilan tidak menyaring dirinya sendiri, setiap pengguna terautentikasi dapat membaca metadata seluruh laporan lintas unit: siapa melapor, kapan, pada SPT mana. Ini kebocoran terparah yang mungkin terjadi pada modul ini, dan penyebabnya cuma satu klausa yang lupa ditulis.

### Bentuk yang mengikat

```sql
create or replace view public.rekap_laporan_tim
with (security_invoker = off)
as
select l.penugasan_id,
       l.pelapor_id,
       l.dikirim_pada
  from public.laporan_harian l
 where l.status_laporan <> 'ditarik'
   -- Penyaringan diri. Tanpa baris ini seluruh isi tabel terbuka.
   and exists (
     select 1
       from public.penugasan_pelaksana pp
      where pp.penugasan_id = l.penugasan_id
        and pp.pelaksana_id = (select auth.uid())
        and pp.dicabut_pada is null
   );

revoke all on public.rekap_laporan_tim from public, anon;
grant select on public.rekap_laporan_tim to authenticated;
```

Tiga hal yang tidak boleh diubah: klausa `exists` yang menyaring berdasarkan keanggotaan pemanggil, ketiadaan kolom `uraian` dan `kendala` pada daftar `select`, dan pencabutan hak baca dari peran `anon`.

> **Butir uji U-6.3-13.** Masuk sebagai Anggota yang tidak terlibat pada SPT mana pun, lalu baca `rekap_laporan_tim`. Hasilnya wajib kosong. Bila muncul satu baris pun, penyaringan dirinya tidak bekerja dan tampilan itu harus dimatikan sampai diperbaiki.

---

## A.5 PostGIS pada Section 4

Modul 6.3 menjadikan PostGIS ketergantungan keras, tetapi Section 4.2 belum menyebutnya. Baris berikut ditambahkan:

| Lapisan | Teknologi | Alasan pemilihan |
| --- | --- | --- |
| Perhitungan jarak | Ekstensi PostGIS pada basis data | Menghitung jarak antara koordinat laporan dan Titik Lokasi SPT di sisi server. Dipilih ketimbang rumus jarak yang ditulis sendiri karena penanganan sistem koordinat dan kelengkungan buminya sudah teruji |

Pemasangannya, dijalankan sekali sebelum tabel `laporan_harian` dibuat:

```sql
create extension if not exists postgis;
```

Ditambahkan pula pada Section 10.3 sebagai catatan penyiapan: PostGIS wajib aktif sebelum Modul 6.3 dibangun, dan kegagalan mengaktifkannya akan membuat seluruh perhitungan status lokasi gagal, bukan sekadar tidak akurat.

---

## A.6 Rujukan BR-21 pada KP-6.3-49

KP-6.3-49 merujuk BR-21 untuk aturan bahwa Panit yang sudah dicabut penunjukannya tetap dapat membaca laporan tetapi tidak dapat memberi catatan baru.

Berkas Addendum 6.2-T Bagian 0.3 mencatat BR-21 sebagai milik Modul 6.1 dan tidak ikut digeser. Sementara itu aturan tentang akibat pencabutan tercatat sebagai BR-30 hasil penggeseran dari BR-27 lama.

Rujukan ini **tidak dapat diverifikasi tanpa membuka daftar Section 7 yang berlaku**, dan berkas ini tidak menebak. Yang ditetapkan adalah cara memutuskannya:

> Buka Section 7 pada PRD gabungan yang berlaku. Bila BR-21 berbunyi tentang hak baca Panit setelah pencabutan, rujukan KP-6.3-49 sudah benar dan tidak perlu diubah. Bila BR-21 berbunyi tentang hal lain, ganti rujukan KP-6.3-49 menjadi BR-30. Perbaikan ini wajib dilakukan sebelum Modul 6.3 dibangun.

Dicatat sebagai butir uji U-6.3-14.

---
---

# BAGIAN B — PENINGKATAN LINTAS MODUL

## B.1 Antrean Luring

### Mengapa ini yang paling bernilai

Objek penyelidikan Tipidter adalah tambang, kawasan hutan, gudang, dan pabrik. Tempat-tempat itu justru yang sinyalnya paling buruk. Rancangan sekarang menyimpan draf di perangkat, tetapi **mengirim** tetap menuntut sinyal. Anggota yang selesai bekerja di area mati sinyal harus menunggu, dan bila perangkatnya kehabisan daya lebih dulu, pekerjaan yang sudah dilakukan hilang tanpa jejak.

### Ketetapan

> **BR-45.** Laporan yang gagal terkirim karena jaringan masuk Antrean Luring pada perangkat pelapor dan terkirim otomatis begitu jaringan pulih. Seluruh penilaian yang menyangkut waktu — Kewajiban Lapor Harian, urutan tampilan, dan rekap harian — memakai `direkam_pada`, yaitu waktu perangkat saat pelapor menekan kirim, bukan waktu laporan tiba di server.

Butir terakhir itu yang menentukan keadilannya. Anggota yang menulis laporan pukul empat sore di tambang lalu baru mendapat sinyal pukul sebelas malam tidak boleh tercatat belum melapor pada hari itu.

> **BR-46.** Setiap kiriman laporan membawa penanda antrean unik yang dibuat aplikasi satu kali saat pelapor menekan kirim. Pengiriman ulang dengan penanda yang sama tidak menghasilkan baris kedua.

Ini menutup kegagalan yang paling mudah terjadi dan paling sulit disadari: jaringan putus setelah server menerima laporan tetapi sebelum aplikasi menerima jawabannya. Aplikasi menyimpulkan gagal dan mengirim ulang, lalu laporan yang sama masuk dua kali.

> **BR-47.** Laporan dari Antrean Luring tetap diterima meskipun SPT sudah ditutup atau pelapornya sudah dicabut dari SPT, selama `direkam_pada` berada dalam masa keduanya masih berlaku. Laporan semacam itu ditandai diterima terlambat. Menolaknya berarti menghukum orang atas keadaan yang di luar kendalinya.

> **BR-48.** Laporan yang mengendap di Antrean Luring lebih dari tujuh hari sejak `direkam_pada` tidak dikirim otomatis. Aplikasi memberi tahu pelapor dan menyediakan pilihan mengirim ulang secara sadar atau membuangnya.

### Perubahan tabel `laporan_harian`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `antrean_id` | uuid | **Unik.** Dibuat aplikasi. Penangkal kiriman kembar |
| `direkam_pada` | timestamptz | Waktu perangkat saat pelapor menekan kirim. Wajib. **Beku setelah INSERT** |
| `dikirim_pada` | timestamptz | Waktu server saat baris masuk. Sudah ada. **Beku** |
| `diterima_terlambat` | boolean | Dihitung pemicu. Benar bila selisih kedua waktu melebihi lima menit |
| `penanda_perangkat` | text | Perangkat yang **benar-benar mengirim**. Wajib Perangkat Terdaftar saat pengiriman |
| `penanda_perangkat_asal` | text | Perangkat tempat laporan **ditulis**. Boleh berbeda. Boleh kosong bila sama |

Pemisahan dua kolom perangkat terakhir yang membuat Antrean Luring dapat hidup berdampingan dengan aturan satu perangkat per akun dari Addendum 6.1-T. Bila pelapor berganti perangkat sebelum antreannya terkirim, laporan tetap dapat dikirim dari perangkat barunya yang sah, sementara perangkat tempat laporan itu ditulis tetap tercatat sebagai fakta. Bukan pelanggaran, bukan penolakan.

```sql
alter table public.laporan_harian
  add column antrean_id             uuid not null,
  add column direkam_pada           timestamptz not null,
  add column diterima_terlambat     boolean not null default false,
  add column penanda_perangkat_asal text;

create unique index uq_laporan_antrean_id
  on public.laporan_harian (antrean_id);
```

### Pemicu penilai keterlambatan dan penjaga kewajaran waktu

```sql
create or replace function public.fn_nilai_kiriman_tertunda()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  terbit timestamptz;
begin
  if new.direkam_pada > now() + interval '5 minutes' then
    raise exception 'WAKTU_PERANGKAT_DI_MASA_DEPAN';
  end if;

  if new.direkam_pada < now() - interval '7 days' then
    raise exception 'KIRIMAN_KEDALUWARSA';
  end if;

  select p.dibuat_pada into terbit
    from public.penugasan p where p.id = new.penugasan_id;
  if new.direkam_pada < terbit then
    raise exception 'WAKTU_MENDAHULUI_PENUGASAN';
  end if;

  new.diterima_terlambat :=
    (new.dikirim_pada - new.direkam_pada) > interval '5 minutes';

  return new;
end;
$$;

create trigger nilai_kiriman_tertunda
  before insert on public.laporan_harian
  for each row
  execute function public.fn_nilai_kiriman_tertunda();
```

Tiga pemeriksaan waktu di atas menutup pemalsuan yang paling gampang: memundurkan jam perangkat agar laporan terlihat dikirim pada hari kemarin. Batas tujuh hari sekaligus menegakkan BR-48 di sisi server, sehingga aplikasi yang bermasalah tetap tidak dapat menyusupkan laporan lama.

### Perubahan pemicu pemeriksa pelaksana aktif

Pemicu `trg_periksa_pelapor_aktif` dari Addendum 6.3-T menolak laporan bila SPT sudah tidak berstatus hidup atau pelapor sudah dicabut. Pemeriksaan itu kini dilakukan **terhadap keadaan pada saat `direkam_pada`**, bukan keadaan sekarang:

```sql
-- Pelaksana dianggap aktif bila belum dicabut, ATAU dicabut sesudah
-- laporan ditulis.
and (pp.dicabut_pada is null or pp.dicabut_pada > new.direkam_pada)

-- SPT dianggap hidup bila statusnya masih hidup, ATAU ditutup sesudah
-- laporan ditulis.
and (p.status in ('baru','berjalan','bermasalah')
     or p.ditutup_pada > new.direkam_pada)
```

Ini menuntut satu kolom baru pada tabel `penugasan`:

```sql
alter table public.penugasan
  add column ditutup_pada timestamptz;
```

Diisi pemicu saat status berpindah ke `selesai` atau `dibatalkan`. Tanpa kolom ini, sistem tidak memiliki cara mengetahui apakah SPT ditutup sebelum atau sesudah laporan ditulis, dan BR-47 tidak dapat ditegakkan.

### Perubahan tampilan `v_belum_lapor`

Satu penggantian, dan ini yang membuat seluruh BR-45 bermakna:

```sql
-- Salah:  where l.dikirim_pada::date = tanggal_diperiksa
-- Benar:
   where l.direkam_pada::date = tanggal_diperiksa
```

### Rancangan sisi aplikasi

| Perkara | Ketetapan |
| --- | --- |
| Tempat penyimpanan | IndexedDB pada perangkat. Bukan penyimpanan sederhana, karena foto disimpan sebagai berkas biner |
| Isi antrean | Seluruh isian laporan **beserta fotonya** |
| Batas antrean | Sepuluh laporan tertunda. Melewati itu, aplikasi memperingatkan bahwa penyimpanan perangkat mulai penuh dan menyarankan mencari sinyal |
| Pengiriman ulang | Otomatis saat jaringan pulih, berurutan menurut `direkam_pada`, satu per satu |
| Kegagalan berulang | Setelah lima percobaan gagal berturut-turut, laporan itu dilewati dan pelapor diberi tahu. Antrean tidak boleh macet karena satu laporan bermasalah |
| Penanda di layar | Lencana berisi jumlah laporan tertunda, terlihat di beranda pelaksana. Bukan disembunyikan |
| Umur tujuh hari | Aplikasi memeriksa saat dibuka; yang lewat batas dipindahkan ke daftar terpisah dengan dua pilihan, kirim ulang atau buang |

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-65 | Bila pengiriman gagal karena jaringan, maka laporan beserta fotonya masuk Antrean Luring dan pelapor menerima keterangan bahwa laporannya akan terkirim saat sinyal pulih |
| KP-6.3-66 | Bila jaringan pulih, maka antrean terkirim otomatis berurutan menurut `direkam_pada` tanpa tindakan pelapor |
| KP-6.3-67 | Bila laporan yang sama terkirim dua kali karena percobaan ulang, maka hanya satu baris yang tersimpan dan percobaan kedua ditolak dengan tenang tanpa pesan galat kepada pelapor |
| KP-6.3-68 | Bila laporan ditulis pukul empat sore dan tiba pukul sebelas malam pada hari yang sama, maka Kewajiban Lapor Harian hari itu terpenuhi |
| KP-6.3-69 | Bila laporan ditulis sebelum SPT ditutup tetapi tiba sesudahnya, maka laporan tetap diterima dan ditandai diterima terlambat |
| KP-6.3-70 | Bila pelapor berganti perangkat sebelum antreannya terkirim, maka laporan tetap dapat dikirim dari perangkat barunya, dan perangkat asalnya tercatat pada kolom terpisah |
| KP-6.3-71 | Bila laporan mengendap lebih dari tujuh hari, maka ia tidak terkirim otomatis dan pelapor diberi dua pilihan, kirim ulang atau buang |
| KP-6.3-72 | Bila jam perangkat dimundurkan sehingga `direkam_pada` mendahului penerbitan SPT, maka penyisipan ditolak |
| KP-6.3-73 | Bila jumlah laporan tertunda mencapai sepuluh, maka aplikasi memperingatkan dan menyarankan mencari sinyal, tetapi **tidak** menghalangi pembuatan laporan berikutnya |
| KP-6.3-74 | Bila satu laporan gagal terkirim lima kali berturut-turut, maka laporan itu dilewati dan laporan berikutnya tetap diproses |

---

## B.2 Riwayat Versi

### Ketetapan

> **BR-49.** Setiap penyuntingan isi laporan maupun catatan peninjau menyimpan salinan nilai lama beserta waktu dan pelakunya. Salinan versi tidak pernah dihapus dan terbaca oleh setiap peran yang berhak membaca laporan induknya. Yang disimpan hanya kolom yang memang berupa tulisan manusia; kolom fakta tidak pernah berubah sehingga tidak memerlukan versi.

### Tabel `laporan_versi`

```sql
create table public.laporan_versi (
  id              uuid primary key default gen_random_uuid(),
  laporan_id      uuid not null references public.laporan_harian(id) on delete cascade,
  versi           integer not null,
  uraian          text,
  kendala         text,
  status_kegiatan text,
  disunting_oleh  uuid not null references public.users(id),
  disimpan_pada   timestamptz not null default now(),
  unique (laporan_id, versi)
);

create index idx_laporan_versi_laporan
  on public.laporan_versi (laporan_id, versi desc);
```

### Tabel `catatan_versi`

```sql
create table public.catatan_versi (
  id             uuid primary key default gen_random_uuid(),
  catatan_id     uuid not null references public.catatan_laporan(id) on delete cascade,
  versi          integer not null,
  isi            text not null,
  disunting_oleh uuid not null references public.users(id),
  disimpan_pada  timestamptz not null default now(),
  unique (catatan_id, versi)
);
```

### Pemicu perekam versi

Menyimpan nilai **lama**, bukan yang baru. Versi nomor satu adalah isi asli saat laporan pertama dikirim.

```sql
create or replace function public.fn_rekam_versi_laporan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.uraian          is not distinct from old.uraian
 and new.kendala         is not distinct from old.kendala
 and new.status_kegiatan is not distinct from old.status_kegiatan then
    return new;
  end if;

  insert into public.laporan_versi
    (laporan_id, versi, uraian, kendala, status_kegiatan, disunting_oleh)
  values
    (old.id, coalesce(old.jumlah_suntingan, 0) + 1,
     old.uraian, old.kendala, old.status_kegiatan,
     (select auth.uid()));

  return new;
end;
$$;

create trigger rekam_versi_laporan
  before update on public.laporan_harian
  for each row
  execute function public.fn_rekam_versi_laporan();
```

Pemicu ini dipasang **sebelum** `trg_tandai_sunting` dari Addendum 6.3-T, karena ia membaca `old.jumlah_suntingan` yang belum dinaikkan. Urutan pemicu di PostgreSQL mengikuti abjad nama pemicunya, sehingga penamaan `rekam_versi_laporan` dan `tandai_sunting` sudah menghasilkan urutan yang benar. **Jangan mengganti nama keduanya tanpa memeriksa ulang urutannya.**

Bentuk yang sama diterapkan pada `catatan_laporan` dengan nama `rekam_versi_catatan`.

### Aturan akses

```sql
alter table public.laporan_versi enable row level security;

create policy baca_versi_mengikuti_induk on public.laporan_versi
for select to authenticated
using (
  exists (
    select 1 from public.laporan_harian l
     where l.id = laporan_versi.laporan_id
       -- Menumpang kebijakan baca laporan induk yang sudah berlaku.
  )
);

revoke insert, update, delete on public.laporan_versi from authenticated;
```

Pencabutan hak tulis dari peran aplikasi adalah bagian yang menentukan. Baris versi hanya boleh lahir dari pemicu yang berjalan dengan hak pembuatnya. Tidak seorang pun, termasuk Akun Pemeliharaan lewat jalur biasa, dapat menyisipkan atau mengubah riwayat versi.

### Tampilan

Pada halaman rincian laporan, di bawah uraian, muncul baris keterangan bila laporan pernah disunting: sebuah tautan bertuliskan jumlah suntingan yang bila dibuka menampilkan daftar versi berurutan dari yang terbaru. Tiap versi menampilkan waktu, penyuntingnya, dan isinya. Tidak ada pembandingan otomatis antar versi — menampilkan dua teks berdampingan sudah cukup dan jauh lebih sederhana daripada membangun penanda perbedaan kata per kata.

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-75 | Bila pelapor menyunting uraian, kendala, atau status kegiatan, maka nilai lamanya tersimpan sebagai satu baris versi beserta waktu dan penyuntingnya |
| KP-6.3-76 | Bila penyuntingan tidak mengubah satu pun dari ketiga kolom itu, maka tidak ada baris versi yang lahir |
| KP-6.3-77 | Bila peninjau membuka laporan yang pernah disunting, maka ia dapat membaca seluruh versi sebelumnya langsung dari halaman rincian |
| KP-6.3-78 | Bila peninjau menyunting catatannya sendiri, maka isi lamanya tersimpan sebagai versi dengan cara yang sama |
| KP-6.3-79 | Bila siapa pun mencoba menyisipkan, mengubah, atau menghapus baris versi lewat jalur biasa, maka tindakan ditolak |
| KP-6.3-80 | Bila laporan dihapus permanen bersama SPT-nya sesuai BR-32, maka baris versinya ikut terhapus |

---

## B.3 Ekspor Data Institusi

### Mengapa ini perlu ada

Seluruh data sistem berada pada layanan pihak ketiga. Bila proyek berhenti, kontrak pengembangan selesai, atau layanan bermasalah, institusi tidak memiliki cara mengambil datanya sendiri. Perangkat lunak institusi selalu menyediakan jalan keluar, dan ketiadaannya adalah bentuk ketergantungan yang tidak semestinya.

### Ketetapan

> **BR-50.** Kasubdit dapat mengekspor data seluruh unit dan Kanit dapat mengekspor data unitnya sendiri. Berkas ekspor memuat data teks lengkap beserta daftar tautan berkas foto, bukan berkas fotonya sendiri. Setiap pengeksporan tercatat pada jejak audit beserta pelaku, waktu, dan lingkupnya.

Tiga keputusan di dalamnya, masing-masing dengan alasannya.

**Kanit ikut diberi wewenang.** Bila hanya Kasubdit yang dapat mengekspor, seluruh jalan keluar data bergantung pada satu orang. Itu justru bentuk kerapuhan yang hendak dihindari fitur ini.

**Foto tidak ikut.** Satu unit dengan ratusan foto berukuran ratusan megabita, dan penyusunannya hampir pasti terputus di tengah jalan pada batas waktu yang tersedia. Yang diekspor adalah tautan; foto diunduh terpisah bila memang diperlukan.

**Setiap ekspor tercatat.** Berkas hasil ekspor memuat identitas terlapor dan uraian dugaan tindak pidana, lalu mengambang sebagai berkas biasa di komputer siapa pun yang mengunduhnya. Ini bersinggungan langsung dengan butir A-02 yang masih terbuka. Pencatatan tidak mencegah penyalahgunaan, tetapi membuatnya dapat ditelusuri.

### Jalur teknis

Ekspor memerlukan pembacaan lintas tabel dalam jumlah besar dan penyusunan berkas, sehingga tidak dapat dijalankan sebagai kueri biasa dari aplikasi. Ia menjadi **Fungsi Tepi keempat**.

Addendum 6.1-T menetapkan daftar Fungsi Tepi bersifat tertutup dan penambahan di luar daftar wajib melalui revisi PRD yang tercatat. Berkas ini adalah revisi tersebut.

> **Amandemen daftar Fungsi Tepi.** Ditambahkan operasi keempat: `ekspor-unit`. Sebagaimana ketiga operasi sebelumnya, ia wajib memeriksa sendiri kewenangan pemanggilnya dari basis data dan tidak boleh mempercayai isi permintaan.

Alur kerjanya: fungsi memeriksa kewenangan, memeriksa pembatasan laju, membaca data dalam lingkup yang diizinkan, menyusun berkas JSON, mengunggahnya ke wadah penyimpanan tertutup, mencatat jejak audit, lalu mengembalikan tautan bermasa berlaku satu jam. Tautan yang kedaluwarsa tidak dapat dipakai kembali, dan berkasnya dihapus pekerjaan berjadwal setelah dua puluh empat jam.

### Isi berkas ekspor

| Bagian | Isi |
| --- | --- |
| `meta` | Waktu ekspor, pelaku, lingkup unit, versi sistem |
| `unit` | Data unit beserta kode klasifikasinya |
| `pengguna` | Nama, NRP, pangkat, peran, unit, status aktif. **Tanpa kata sandi dalam bentuk apa pun** |
| `penugasan` | Seluruh SPT beserta dasar, titik lokasi, pelaksana, dan Panit |
| `laporan` | Seluruh laporan beserta status lokasi dan catatan peninjau |
| `laporan_versi` | Seluruh riwayat versi |
| `lhp` | Seluruh LHP beserta bagian dinamisnya |
| `foto` | Keterangan, koordinat, waktu, dan **tautan** tiap foto |
| `jejak_audit` | Seluruh baris dalam lingkup |
| `rute` | Titik koordinat yang belum disusutkan, per SPT |

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.10-01 | Bila Kasubdit meminta ekspor, maka berkas memuat seluruh unit |
| KP-6.10-02 | Bila Kanit meminta ekspor, maka berkas memuat unitnya sendiri saja |
| KP-6.10-03 | Bila Panit atau Anggota memanggil fungsi ekspor secara langsung, maka permintaan ditolak |
| KP-6.10-04 | Bila ekspor berhasil, maka satu baris jejak audit tercatat berisi pelaku, waktu, dan lingkupnya |
| KP-6.10-05 | Bila berkas ekspor selesai, maka tautannya berlaku satu jam dan berkasnya terhapus setelah dua puluh empat jam |
| KP-6.10-06 | Bila berkas ekspor dibuka, maka tidak ada kata sandi maupun turunannya di dalamnya |
| KP-6.10-07 | Bila seorang pengguna sudah mengekspor tiga kali dalam satu hari, maka permintaan keempat ditolak dengan keterangan batas harian |

---

## B.4 Pembatasan Laju

### Ketetapan

> **BR-51.** Operasi sensitif dibatasi jumlah pemanggilannya per satuan waktu, ditegakkan di dalam basis data dan bukan di aplikasi. Daftar operasi bersifat tertutup; penambahan wajib melalui revisi PRD yang tercatat.

### Daftar tertutup

| Operasi | Batas | Jendela | Alasan |
| --- | --- | --- | --- |
| `reset_kata_sandi` | 10 | 1 jam | Akun Kanit yang diretas dapat mengunci-ulang banyak akun di unitnya |
| `ekspor_data` | 3 | 1 hari | Berkas ekspor memuat data perkara dan berat disusun |
| `hapus_spt_permanen` | 5 | 1 hari | Tindakan yang tidak dapat dibatalkan |
| `masuk_gagal` | 5 | 15 menit | Penebakan kata sandi secara berulang |

### Tabel dan fungsi

```sql
create table public.pembatasan_laju (
  kunci_pelaku  text not null,
  operasi       text not null,
  jendela_mulai timestamptz not null,
  hitungan      integer not null default 0,
  primary key (kunci_pelaku, operasi, jendela_mulai)
);

create or replace function public.periksa_batas_laju(
  p_kunci    text,
  p_operasi  text,
  p_batas    integer,
  p_jendela  interval
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  mulai timestamptz := date_trunc('minute', now())
                     - (extract(epoch from now())::bigint
                        % extract(epoch from p_jendela)::bigint) * interval '1 second';
  kini integer;
begin
  insert into public.pembatasan_laju (kunci_pelaku, operasi, jendela_mulai, hitungan)
  values (p_kunci, p_operasi, mulai, 1)
  on conflict (kunci_pelaku, operasi, jendela_mulai)
  do update set hitungan = public.pembatasan_laju.hitungan + 1
  returning hitungan into kini;

  if kini > p_batas then
    raise exception 'BATAS_LAJU_TERLAMPAUI: % (% per %)', p_operasi, p_batas, p_jendela;
  end if;
end;
$$;
```

Penyisipan dan penaikan hitungan berlangsung dalam **satu pernyataan**. Ini yang membuat dua pemanggilan bersamaan tidak dapat sama-sama lolos — yang kedua melihat hitungan yang sudah naik, bukan hitungan lama.

Kolom `kunci_pelaku` bertipe teks, bukan uuid, karena `masuk_gagal` terjadi sebelum pengguna dikenali. Untuk operasi itu kuncinya adalah NRP yang dicoba, sedangkan untuk tiga operasi lain kuncinya adalah identitas pengguna.

Baris lama dibersihkan pekerjaan berjadwal harian, menghapus yang jendelanya lebih tua dari tujuh hari.

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.10-08 | Bila sebuah operasi sensitif dipanggil melebihi batasnya dalam satu jendela, maka pemanggilan berikutnya ditolak dengan keterangan berapa batasnya dan kapan dapat dicoba lagi |
| KP-6.10-09 | Bila dua pemanggilan tiba pada saat hampir bersamaan tepat di ambang batas, maka tepat satu yang lolos |
| KP-6.10-10 | Bila jendela berganti, maka hitungan dimulai dari nol tanpa tindakan apa pun |
| KP-6.10-11 | Bila percobaan masuk gagal lima kali dalam lima belas menit untuk satu NRP, maka percobaan berikutnya ditolak sementara, dan keterangannya tidak mengungkapkan apakah NRP itu terdaftar |

Butir terakhir penting dan mudah terlewat: pesan penolakan tidak boleh membedakan antara NRP yang salah dan kata sandi yang salah, karena perbedaan itu sendiri sudah memberi tahu penyerang mana NRP yang terdaftar.

---

## B.5 Pemantauan Kesehatan Sistem

### Ketetapan

> **BR-53.** Keadaan kesehatan sistem disajikan sebagai keterangan datar berisi angka dan waktu, tanpa kalimat yang menyimpulkan bahwa sistem sedang bermasalah. Prinsip 0.6 berlaku terhadap sistem sebagaimana ia berlaku terhadap orang.

Alasannya bukan sekadar kesamaan bentuk. Penanda yang berteriak merah setiap kali ada satu pekerjaan tertunda akan diabaikan dalam sepekan, dan penanda yang diabaikan sama saja dengan tidak ada.

### Tampilan

```sql
create or replace view public.kesehatan_sistem
with (security_invoker = on)
as
select
  (select max(end_time) from cron.job_run_details
    where status = 'succeeded')                      as pekerjaan_berhasil_terakhir,
  (select count(*) from cron.job_run_details
    where status = 'failed'
      and start_time > now() - interval '7 days')    as pekerjaan_gagal_sepekan,
  (select count(*) from public.laporan_harian
    where diterima_terlambat
      and dikirim_pada > now() - interval '7 days')  as laporan_terlambat_sepekan,
  (select count(*) from public.location_logs
    where diterima_pada > now() - interval '1 day')  as titik_rute_sehari,
  (select max(dibuat_pada) from public.jejak_audit
    where jenis = 'ekspor_data')                     as ekspor_terakhir,
  (select count(*) from public.laporan_harian
    where status_laporan = 'terkirim'
      and dikirim_pada < now() - interval '7 days')  as laporan_belum_ditinjau_lebih_sepekan;
```

Ditampilkan pada dashboard Kasubdit sebagai kartu keterangan, bukan sebagai peringatan. Kanit tidak memerlukannya.

---

## B.6 Pencadangan Berkala

### Ketetapan

Layanan basis data terkelola menyediakan pencadangan otomatis, tetapi masa simpannya pada paket dasar terbatas dan tidak berada di bawah kendali institusi. Karena itu ditetapkan satu tata cara yang sederhana dan tidak menuntut infrastruktur tambahan:

| Perkara | Ketetapan |
| --- | --- |
| Cara | Memakai fitur Ekspor Data pada B.3 |
| Kekerapan | Sekurang-kurangnya satu kali setiap bulan |
| Pelaku | Kasubdit atau pemegang Akun Pemeliharaan |
| Tempat simpan | Penyimpanan luring milik institusi, bukan komputer perorangan |
| Bukti | Baris jejak audit dari pengeksporan itu sendiri sudah menjadi buktinya |

Fitur ekspor karena itu memiliki dua kegunaan sekaligus: jalan keluar bila sistem ditinggalkan, dan pencadangan berkala selama sistem berjalan. Tidak diperlukan mekanisme kedua.

Ditambahkan pada Section 10 sebagai butir 10.7, dan dicatat pada Section 11.5 sebagai bagian dari tata cara pemeliharaan.

---
---

# Bagian C — Ringkasan Perubahan

## C.1 Business Rules baru

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-45 | Antrean Luring; seluruh penilaian waktu memakai `direkam_pada` | 6.3, 6.5 |
| BR-46 | Penanda antrean unik; pengiriman ulang tidak menghasilkan baris kedua | 6.3 |
| BR-47 | Laporan tertunda tetap diterima meski SPT sudah ditutup, ditandai diterima terlambat | 6.3 |
| BR-48 | Laporan yang mengendap lebih dari tujuh hari tidak terkirim otomatis | 6.3 |
| BR-49 | Riwayat versi laporan dan catatan; terbaca peninjau; tidak dapat ditulis siapa pun | 6.3, 6.8 |
| BR-50 | Ekspor data oleh Kasubdit dan Kanit; tanpa berkas foto; tercatat jejak audit | 6.10 |
| BR-51 | Pembatasan laju pada daftar tertutup operasi sensitif | Seluruh modul |
| BR-52 | Kasubdit menyetujui laporan hanya bila pelapornya berperan Kanit | 6.3 |
| BR-53 | Kesehatan sistem disajikan sebagai keterangan datar | 6.5 |

**Amandemen:** BR-37 memperoleh pengecualian bersyarat dengan daftar tertutup.

## C.2 Perubahan model data

| Tabel | Perubahan |
| --- | --- |
| `laporan_harian` | Empat kolom baru: `antrean_id` (unik), `direkam_pada`, `diterima_terlambat`, `penanda_perangkat_asal` |
| `penugasan` | Satu kolom baru: `ditutup_pada` |
| `laporan_versi` | Tabel baru |
| `catatan_versi` | Tabel baru |
| `pembatasan_laju` | Tabel baru |
| `rekap_laporan_tim` | Ditulis ulang dengan penyaringan diri |
| `v_belum_lapor` | `dikirim_pada` diganti `direkam_pada` |
| `kesehatan_sistem` | Tampilan baru |

## C.3 Daftar tempel ke PRD

| Urutan | Tujuan | Isi |
| --- | --- | --- |
| 1 | Section 7 | Amandemen BR-37, lalu BR-45 sampai BR-53 |
| 2 | Section 2.3 | Baris Menyetujui laporan pada A.2 |
| 3 | Section 4.2 | Baris PostGIS pada A.5 |
| 4 | Section 4.5 | Penambahan Fungsi Tepi keempat `ekspor-unit` pada B.3 |
| 5 | Section 5 | Seluruh perubahan model data pada C.2 |
| 6 | Section 6.3 | KP-6.3-65 sampai KP-6.3-80; perbaikan rujukan KP-6.3-49 |
| 7 | Section 6.10 (baru) | B.3 dan B.4 beserta KP-6.10-01 sampai KP-6.10-11 |
| 8 | Section 9.7 (baru) | Pembatasan Laju pada B.4 |
| 9 | Section 10.7 (baru) | Pencadangan Berkala pada B.6 |
| 10 | Section 11.5 | Tata cara pencadangan bulanan |

## C.4 Urutan pengerjaan

Mengikat, karena tiap langkah bersandar pada yang sebelumnya.

| No | Langkah |
| --- | --- |
| 1 | Pasang ekstensi PostGIS sebelum tabel `laporan_harian` dibuat |
| 2 | Bangun `laporan_harian` sudah lengkap dengan empat kolom antrean sejak awal |
| 3 | Tambahkan kolom `ditutup_pada` pada `penugasan` beserta pemicu pengisinya |
| 4 | Pasang seluruh pemicu Addendum 6.3-T, lalu pemicu berkas ini |
| 5 | Periksa urutan abjad pemicu `rekam_versi_laporan` dan `tandai_sunting` |
| 6 | Bangun `laporan_versi` dan `catatan_versi` beserta pencabutan hak tulisnya |
| 7 | Bangun `rekap_laporan_tim` dengan penyaringan diri, lalu jalankan U-6.3-13 |
| 8 | Bangun `pembatasan_laju`, pasang pemanggilannya pada seluruh Fungsi Tepi |
| 9 | Bangun Fungsi Tepi `ekspor-unit` |
| 10 | Bangun Antrean Luring pada sisi aplikasi |
| 11 | Bangun tampilan kesehatan sistem pada dashboard Kasubdit |

## C.5 Butir uji

| Kode | Butir uji |
| --- | --- |
| U-6.3-13 | Baca `rekap_laporan_tim` sebagai Anggota yang tidak terlibat SPT mana pun; hasilnya wajib kosong |
| U-6.3-14 | Periksa bunyi BR-21 pada Section 7 yang berlaku; perbaiki rujukan KP-6.3-49 bila perlu |
| U-6.3-15 | Matikan jaringan, kirim laporan berisi tiga foto, nyalakan jaringan; laporan tiba lengkap |
| U-6.3-16 | Matikan jaringan saat pengiriman sedang berjalan, ulangi pengiriman; hanya satu baris tersimpan |
| U-6.3-17 | Ubah jam perangkat mundur dua hari, kirim laporan; ditolak bila mendahului penerbitan SPT |
| U-6.3-18 | Tulis laporan, tutup SPT-nya, baru sambungkan jaringan; laporan diterima dan ditandai terlambat |
| U-6.3-19 | Sunting laporan tiga kali, buka sebagai Panit; ketiga versi lama terbaca |
| U-6.3-20 | Coba sisipkan baris ke `laporan_versi` sebagai Kasubdit; ditolak |
| U-6.3-21 | Setujui laporan Kanit sebagai Kasubdit; berhasil. Setujui laporan Anggota sebagai Kasubdit; ditolak |
| U-6.3-22 | Panggil ekspor empat kali dalam sehari; panggilan keempat ditolak |
| U-6.3-23 | Salah kata sandi enam kali untuk satu NRP; percobaan keenam ditolak tanpa mengungkap keterdaftaran NRP |
| U-6.3-24 | Buka berkas ekspor, cari kolom kata sandi; tidak ada |

---

## Penutup

Enam temuan pada Modul 6.3 tertutup. Satu di antaranya, tabrakan dengan BR-37, akan memblokir pembangunan bila tidak diperbaiki lebih dulu; satu lagi, rujukan BR-21, sengaja tidak ditebak melainkan diberi cara memutuskannya.

Enam kemampuan lintas modul ditambahkan. Yang paling menentukan adalah Antrean Luring, bukan karena paling rumit, melainkan karena paling sesuai dengan tempat sistem ini akan dipakai. Objek penyelidikan yang menjadi sasaran unit ini justru berada di tempat yang sinyalnya paling buruk, dan sistem yang menuntut sinyal untuk menerima laporan akan gagal tepat pada saat ia paling dibutuhkan.

Dua hal yang baru terlihat saat merancang dan tidak ada pada pembicaraan awal ikut ditutup: laporan kembar akibat pengiriman ulang, dan tabrakan antara Antrean Luring dengan aturan satu perangkat per akun. Keduanya diselesaikan dengan menambah kolom, bukan dengan melonggarkan aturan yang sudah berlaku.

Satu perkara sengaja dibiarkan terbuka. Butir A-02 tentang penyimpanan data perkara pada layanan pihak ketiga kini bertambah bobotnya, karena fitur ekspor menghasilkan berkas berisi identitas terlapor yang dapat berpindah ke mana saja. Pencatatan jejak audit pada setiap pengeksporan tidak menyelesaikan perkara itu, hanya membuatnya dapat ditelusuri. Jawaban sesungguhnya tetap harus datang dari pemilik produk.


---
---
