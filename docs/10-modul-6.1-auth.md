# Modul 6.1 — Autentikasi & Peran

Modul fondasi. Seluruh modul lain bergantung padanya.

Memuat penggalian modul beserta Addendum 6.1-T (spesifikasi teknis). Di sini pula
lahir dua Fungsi Tepi pertama, Akun Pemeliharaan, aturan satu perangkat per akun,
dan fungsi bantu `sipantau_auth`.

---
---

# SiPANTAU — Revisi PRD v0.3

**Hasil penggalian Modul 6.1 (Autentikasi & Peran) beserta perubahan section yang terdampak**

Tanggal: 31 Juli 2026 · Menggantikan bagian terkait pada versi kerangka 0.2

---

## Cara memakai berkas ini

Berkas ini memuat enam bagian pengganti. Tempel masing-masing menggantikan bagian lama dengan nomor yang sama pada PRD utama, lalu naikkan versi dokumen menjadi 0.3 dan catat pada Riwayat Revisi.

| Urutan tempel | Bagian | Sifat perubahan |
| --- | --- | --- |
| 1 | Section 2.3, 2.4, 2.5 | Ditulis ulang — lingkup Panit dan jalur reset kata sandi berubah |
| 2 | Section 3.1, 3.2 (tambahan), 3.6 (baru) | Penambahan istilah baku |
| 3 | Section 5.1, 5.10–5.14 (baru) | Kolom baru dan lima tabel baru |
| 4 | Section 6.1 | Ditulis ulang penuh — inti berkas ini |
| 5 | Section 7 | BR-07 direvisi, BR-15 sampai BR-21 ditambahkan |
| 6 | Section 9.2, 9.6 | Aturan akses baris dan jejak audit |
| 7 | Lampiran A dan B | A-01 dicoret, A-06 sampai A-08 ditambahkan |

> **Peringatan urutan.** Section 7 dan 9 memiliki kekuatan lebih tinggi daripada Section 6 menurut aturan Section 0.3. Bila salah satu tidak ikut ditempel, Modul 6.1 akan bertentangan dengan dokumen induknya dan AI Agent akan mengikuti aturan lama.

---

## Riwayat Revisi — baris tambahan

| Versi | Status | Perubahan |
| --- | --- | --- |
| 0.3 | Berlaku | Modul 6.1 digali penuh dan berstatus [FINAL]. Lingkup data Panit diubah dari berbasis unit menjadi berbasis penugasan. Panit memperoleh kewenangan membuka Sesi Tugas dan mengirim Laporan Kegiatan Harian. Kanit memperoleh kewenangan mereset kata sandi dalam unitnya. Ditambahkan Akun Pemeliharaan. Ditetapkan aturan satu perangkat per akun. Ditambahkan lima tabel: unit, penugasan_panit, perangkat_masuk, jejak_audit, dan kolom-kolom baru pada users. Butir A-01 terjawab. |

---
---

# 1. Pengganti Section 2.3, 2.4, dan 2.5

## 2.3 Matriks hak akses

**[FINAL]**

Tabel ini mengikat. Implementasi Row Level Security pada Section 9 harus sejalan dengan isinya.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Melihat dashboard | Semua unit | Unit sendiri | Penugasan yang diawasinya | Milik sendiri |
| Menerbitkan SPT | Tidak | **Ya (eksklusif)** | Tidak | Tidak |
| Menugaskan Panit dan Anggota ke SPT | Tidak | **Ya (eksklusif)** | Tidak | Tidak |
| Melihat daftar SPT | Semua unit | Unit sendiri | Yang ia awasi saja | Yang ditujukan padanya |
| Mengubah dan menutup SPT | Tidak | Ya (unit sendiri) | Tidak | Tidak |
| Membuka dan menutup Sesi Tugas | Tidak | Tidak | **Ya** | **Ya** |
| Mengirim Pelaporan Kegiatan Harian | Tidak | Tidak | **Ya** | **Ya** |
| Meninjau dan memberi catatan laporan | Semua unit | Unit sendiri | Penugasan yang diawasinya | Tidak |
| Menyusun LHP Ringkas | Tidak | Tidak | **Tidak** | **Ya** |
| Melihat LHP Ringkas | Semua unit | Unit sendiri | Penugasan yang diawasinya | Milik sendiri |
| Mengekspor LHP ke PDF dan Word | Ya | Ya | Penugasan yang diawasinya | Miliknya sendiri |
| Melihat peta Tracking waktu nyata | Semua unit | Unit sendiri | Penugasan yang diawasinya | Posisi sendiri |
| Melihat rute per SPT | Semua unit | Unit sendiri | Penugasan yang diawasinya | Rute sendiri |
| Mengekspor Kolase foto | Ya | Ya | Penugasan yang diawasinya | Tidak |
| Rekapitulasi lintas unit | **Ya (eksklusif)** | Tidak | Tidak | Tidak |
| Manajemen akun pengguna | **Ya (eksklusif)** | Tidak | Tidak | Tidak |
| Mereset kata sandi | Semua pengguna | Anggota dan Panit di unitnya | Tidak | Tidak |
| Mengelola daftar unit | **Ya (eksklusif)** | Tidak | Tidak | Tidak |

### Perubahan dari versi 0.2 dan alasannya

| Yang berubah | Sebelumnya | Sekarang | Alasan |
| --- | --- | --- | --- |
| Panit membuka Sesi Tugas | Tidak | Ya | Panit kerap ikut turun ke lapangan. Keputusan pemilik produk. |
| Panit mengirim Laporan Harian | Tidak | Ya | Konsekuensi langsung dari kewenangan Sesi Tugas. |
| Panit menyusun LHP Ringkas | Tidak | Tetap tidak | LHP Ringkas disusun Anggota. Ditegaskan pemilik produk. |
| Lingkup data Panit | Seluruh unit | Penugasan yang diawasinya | Tim bersifat dinamis per penugasan, bukan struktur tetap. |
| Kanit mereset kata sandi | Tidak | Ya, terbatas unitnya | Kasubdit tidak selalu aktif memakai sistem. Tanpa ini, pemulihan akun macet. |
| Menugaskan Anggota ke SPT | Belum ditetapkan | Kanit | Jawaban butir A-01. |

## 2.4 Hierarki dan pewarisan lingkup data

**[FINAL]**

Struktur organisasi yang dipakai sistem:

```
Kasubdit
  └── memegang beberapa Unit
        └── setiap Unit diketuai satu Kanit
              ├── beberapa Panit
              └── beberapa Anggota
```

Lingkup data bersifat menurun untuk Kasubdit dan Kanit. Untuk Panit, lingkup data **tidak** mengikuti struktur organisasi melainkan mengikuti penugasan.

| Peran | Melihat data milik | Catatan penting |
| --- | --- | --- |
| Kasubdit | Seluruh unit, seluruh Kanit, Panit, dan Anggota | Lingkup data paling luas, tetapi tidak berwenang menerbitkan SPT |
| Kanit | Unitnya sendiri: seluruh Panit dan Anggota di unit tersebut | Tidak dapat melihat unit lain sekalipun sebagai pembanding |
| Panit | Hanya penugasan tempat ia ditunjuk sebagai Panit Penanggung Jawab, beserta seluruh Anggota di dalamnya | **Tidak** melihat penugasan lain di unitnya. Riwayat penugasan lama yang pernah ia awasi tetap terbaca selamanya. |
| Anggota | Hanya miliknya sendiri | Tidak dapat melihat penugasan atau laporan Anggota lain |

> **Mengapa lingkup Panit tidak mengikuti unit**
>
> Susunan tim ditetapkan Kanit setiap kali SPT diterbitkan, bukan sekali di awal lalu berlaku selamanya. Satu SPT dapat memiliki lebih dari satu Panit Penanggung Jawab, dan seorang Panit dapat mengawasi beberapa SPT sekaligus.
>
> Konsekuensinya, pertanyaan "Anggota siapa saja yang berada di bawah Panit ini" tidak memiliki jawaban tetap. Jawabannya hanya ada dalam konteks satu penugasan tertentu. Karena itu aturan akses baris untuk Panit wajib menelusuri tabel `penugasan_panit`, bukan membandingkan kolom `unit`.

> **Perbedaan lingkup data dan kewenangan tindakan**
>
> Kedua hal ini terpisah dan tidak boleh dicampur saat implementasi. Kasubdit memiliki lingkup data terluas, tetapi kewenangan menerbitkan SPT justru hanya ada pada Kanit. Panit kini memiliki dua kedudukan sekaligus: pengawas atas penugasan yang diawasinya, dan pelaksana atas Sesi Tugas yang ia buka sendiri.
>
> Artinya, pemeriksaan izin dilakukan dua kali: pertama memeriksa apakah peran boleh melakukan tindakan tersebut, kedua memeriksa apakah data yang disentuh berada dalam lingkupnya.

## 2.5 Akun Pemeliharaan

**[FINAL]**

Di luar empat peran organisasi, sistem mengenal satu akun teknis bernama **Akun Pemeliharaan**. Akun ini bukan jabatan dan tidak melekat pada unit mana pun.

| Aspek | Ketetapan |
| --- | --- |
| Jumlah | Tepat satu di seluruh sistem |
| Tujuan | Pemulihan akses saat seluruh jalur normal buntu, dan pendampingan teknis |
| Lingkup data | Seluruh tabel tanpa kecuali, termasuk LHP, laporan harian, foto dokumentasi, dan titik koordinat |
| Pemegang | Pemilik produk (Kanit I) dan developer, keduanya |
| Kewenangan tindakan | Mereset kata sandi, mengaktifkan kembali akun, membaca seluruh data. **Tidak** menerbitkan SPT, **tidak** membuka Sesi Tugas, **tidak** menyusun LHP |
| Pencatatan | Seluruh tindakan wajib masuk jejak audit dan tidak dapat dihapus dari dalam aplikasi |
| Penampakan | Tidak muncul pada daftar personel, tidak dapat dipilih sebagai pelaksana SPT, tidak muncul pada peta |
| Serah terima | Hanya Kasubdit yang dapat mengganti kredensialnya, dan penggantian tercatat pada jejak audit |

> **Catatan untuk pemilik produk**
>
> Lingkup akses penuh pada akun ini adalah keputusan pemilik produk, tercatat pada Lampiran B butir B.7. Karena akun ini dapat membaca identitas pihak dan uraian perkara, keberadaannya sebaiknya tercatat tertulis pada dokumen serah terima proyek, lengkap dengan nama pemegangnya. Butir A-08 pada Lampiran A menampung hal ini.

---
---

# 2. Tambahan Section 3 — Glosarium

## 3.1 Istilah peran — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Panit Penanggung Jawab** | Panit yang ditunjuk Kanit untuk mengawasi satu SPT tertentu. Satu SPT dapat memiliki lebih dari satu Panit Penanggung Jawab. Penunjukan berlaku per SPT, bukan permanen. |
| **Akun Pemeliharaan** | Akun teknis tunggal di luar empat peran organisasi, dipakai untuk pemulihan akses dan pendampingan teknis. Bukan jabatan. Dilarang disebut sebagai peran kelima, akun admin, atau superuser. |

## 3.2 Istilah penugasan dan kegiatan — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Tim** | Susunan Panit Penanggung Jawab dan Anggota pelaksana pada satu SPT. Tim melekat pada SPT, bukan pada unit, dan disusun ulang setiap kali SPT baru diterbitkan. Dilarang dipakai untuk menyebut isi satu unit secara keseluruhan. |

## 3.6 Istilah autentikasi — bagian baru

Bagian ini ditambahkan karena kata "sesi" sebelumnya dipakai untuk dua hal berbeda. Pemisahan ini mengikat.

| Istilah | Definisi tunggal |
| --- | --- |
| **Sesi Masuk** | Keadaan seorang pengguna terautentikasi pada satu perangkat. Dimulai saat berhasil masuk, berakhir saat keluar, saat akun dinonaktifkan, atau saat digeser oleh Sesi Masuk baru di perangkat lain. **Tidak ada hubungannya dengan pelacakan posisi.** |
| **Sesi Tugas** | Rentang waktu seorang Anggota atau Panit sedang melaksanakan kegiatan lapangan untuk satu SPT, dibuka dan ditutup melalui tombol. Hanya selama Sesi Tugas posisi direkam. Istilah ini sudah berlaku sejak versi 0.2 dan maknanya tidak berubah. |
| **Kata Sandi Sementara** | Kata sandi yang ditetapkan pembuat akun atau pereset, berlaku tepat satu kali masuk, dan wajib diganti pengguna sebelum dapat memakai sistem. |
| **Kunci Aplikasi** | Lapisan pengaman lokal berupa PIN enam angka atau sidik jari yang ditanyakan saat aplikasi dibuka kembali. Berjalan sepenuhnya di perangkat dan tidak menggantikan Sesi Masuk. |
| **Perangkat Terdaftar** | Satu perangkat yang sedang memegang Sesi Masuk aktif untuk sebuah akun. Setiap akun hanya memiliki satu pada satu waktu. |

---
---

# 3. Pengganti Section 5.1 dan Section 5.10 sampai 5.14

## 5.1 Tabel users

**[FINAL]**

Menyimpan seluruh akun pengguna dari empat peran serta Akun Pemeliharaan, sekaligus posisi terakhir yang diketahui.

Kolom identitas unik tabel ini **wajib bernilai sama** dengan identitas pengguna pada sistem autentikasi bawaan Supabase. Tanpa kesamaan ini, seluruh aturan akses baris pada Section 9 kehilangan pegangannya.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Identitas unik. **Wajib sama** dengan id pada tabel autentikasi Supabase |
| nama | text | Nama lengkap beserta gelar bila ada |
| nrp | text | Nomor registrasi pokok, unik, dipakai sebagai identitas masuk |
| email_sistem | text | Email sintetis berbentuk `<nrp>@sipantau.internal`, dibangkitkan sistem, unik. Tidak pernah ditampilkan kepada pengguna dan tidak pernah dikirimi surat elektronik |
| pangkat | text | Pangkat kepolisian |
| peran | enum | Salah satu dari: kasubdit, kanit, panit, anggota, pemeliharaan |
| unit_id | uuid | Mengacu ke tabel unit. Bernilai kosong hanya untuk peran pemeliharaan |
| aktif | boolean | Penanda akun aktif atau dinonaktifkan |
| wajib_ganti_sandi | boolean | Bernilai benar setelah akun dibuat atau kata sandinya direset. Selama bernilai benar, pengguna hanya boleh membuka halaman penggantian kata sandi |
| terakhir_masuk | timestamptz | Waktu keberhasilan masuk terakhir. Dipakai Modul 6.6. **Tidak boleh** dicampur dengan terakhir_terlihat |
| foto_acuan_wajah | text | **Disediakan kosong.** Tempat berkas foto acuan bila fitur verifikasi wajah kelak dibangun. Sampai fitur itu disetujui, kolom ini tidak diisi dan tidak dibaca modul mana pun |
| sedang_bertugas | boolean | Menyala saat Sesi Tugas berjalan |
| posisi_terakhir_lat | numeric | Lintang koordinat terakhir yang diterima |
| posisi_terakhir_lng | numeric | Bujur koordinat terakhir yang diterima |
| terakhir_terlihat | timestamptz | Waktu koordinat terakhir diterima, dasar penghitungan status hijau, kuning, abu-abu |

> **Mengapa ada email sintetis**
>
> Sistem autentikasi Supabase mensyaratkan email sebagai identitas. Personel tidak seluruhnya memiliki email institusi yang aktif, dan yang mereka hafal adalah NRP. Karena itu antarmuka meminta NRP, lalu sistem menyusun email sintetis di belakang layar sebelum meneruskannya ke Supabase.
>
> Kolom ini bersifat teknis semata. Dilarang menampilkannya di antarmuka mana pun, dilarang memakainya sebagai alamat pengiriman, dan dilarang menjadikannya jalur pemulihan kata sandi.

## 5.10 Tabel unit

**[FINAL]**

Daftar unit di bawah Subdit IV. Dibuat sebagai tabel tersendiri, bukan teks bebas, karena salah ketik pada nama unit akan langsung merusak pembatasan lingkup data.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| nama | text | Nama unit, unik. Contoh: Unit I |
| keterangan | text | Uraian singkat, boleh kosong |
| aktif | boolean | Unit tidak dihapus melainkan dinonaktifkan, sejalan dengan BR-12 |
| urutan | integer | Menentukan urutan tampil pada daftar |

**Data awal.** Sampai daftar resmi diterima dari pemilik produk, tabel diisi empat baris sementara: Unit I, Unit II, Unit III, Unit IV. Baris-baris ini ditandai sebagai data sementara pada berkas seed dan wajib diganti sebelum peluncuran. Lihat Lampiran A butir A-06.

## 5.11 Tabel penugasan_panit

**[FINAL]**

Menghubungkan satu SPT dengan Panit Penanggung Jawabnya. Tabel ini menjadi dasar seluruh aturan akses baris untuk peran Panit.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| panit_id | uuid | Mengacu ke users, wajib berperan panit |
| ditunjuk_oleh | uuid | Mengacu ke users, wajib berperan kanit |
| ditunjuk_pada | timestamptz | Waktu penunjukan |

Pasangan penugasan_id dan panit_id bersifat unik. Baris pada tabel ini **tidak dihapus** meskipun SPT sudah ditutup, agar Panit tetap dapat membaca riwayat penugasan yang pernah ia awasi.

## 5.12 Tabel perangkat_masuk

**[FINAL]**

Menyimpan satu Perangkat Terdaftar per akun, sebagai dasar penegakan aturan satu perangkat.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| user_id | uuid | Mengacu ke users, unik. Satu baris per akun |
| penanda_perangkat | text | Penanda perangkat yang dibangkitkan aplikasi saat pertama dipasang dan disimpan di perangkat |
| keterangan_perangkat | text | Merek dan model perangkat, untuk ditampilkan pada pesan pemberitahuan |
| masuk_pada | timestamptz | Waktu Sesi Masuk ini dimulai |

## 5.13 Tabel jejak_audit

**[FINAL]**

Mencatat tindakan penting beserta pelaku dan waktunya. Tabel ini bersifat hanya-tambah: baris tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran mana pun, termasuk Akun Pemeliharaan.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| pelaku_id | uuid | Mengacu ke users |
| peran_pelaku | enum | Peran pelaku saat tindakan dilakukan, disalin agar riwayat tetap terbaca meski peran berubah kemudian |
| jenis_tindakan | enum | Lihat Section 9.6 |
| sasaran_tabel | text | Nama tabel yang disentuh |
| sasaran_id | uuid | Identitas baris yang disentuh |
| keterangan | text | Uraian singkat, tanpa memuat kata sandi dalam bentuk apa pun |
| waktu | timestamptz | Waktu tindakan |

## 5.14 Kolom tambahan pada tabel penugasan

Satu kolom ditambahkan untuk menampung keputusan butir A-01:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| ditugaskan_oleh | uuid | Mengacu ke users, wajib berperan kanit. Sama dengan diterbitkan_oleh pada keadaan biasa, dipisah agar tetap terbaca bila kelak kewenangan penunjukan dialihkan |

---
---

# 4. Pengganti Section 6.1 — Autentikasi & Peran

**Status: [FINAL]**

## 6.1.1 Deskripsi

Modul ini mengatur cara pengguna masuk ke sistem, cara sistem mengenali peran dan lingkup datanya, serta cara sesi masuk dipelihara dan diakhiri. Yang termasuk urusannya: halaman masuk berbasis NRP, penggantian Kata Sandi Sementara, Kunci Aplikasi lokal, penegakan aturan satu perangkat, pembacaan peran dan unit, perlindungan halaman terhadap akses di luar kewenangan, penanganan perubahan peran dan penonaktifan akun saat pengguna sedang aktif, serta pengakhiran Sesi Masuk.

Yang **bukan** urusannya: pembuatan dan penyuntingan akun, yang menjadi milik Modul 6.6; pengelolaan daftar unit, yang juga milik Modul 6.6; pembukaan dan penutupan Sesi Tugas beserta pelacakan posisi, yang menjadi milik Modul 6.4; dan penyimpanan draf laporan yang belum terkirim, yang menjadi milik Modul 6.3. Modul ini hanya berkewajiban tidak merusak draf tersebut saat Sesi Masuk berakhir.

Modul ini tidak bergantung pada modul mana pun dan seluruh modul lain bergantung padanya. Karena itu ia dikerjakan pertama.

## 6.1.2 Cerita pengguna

| Kode | Cerita |
| --- | --- |
| CP-6.1-01 | Sebagai Anggota, saya ingin masuk memakai NRP dan kata sandi, agar saya tidak perlu mengingat alamat surat elektronik yang tidak pernah saya pakai. |
| CP-6.1-02 | Sebagai pengguna baru, saya ingin diminta mengganti kata sandi pada saat pertama kali masuk, agar kata sandi yang diberikan atasan tidak terus dipakai. |
| CP-6.1-03 | Sebagai Anggota, saya ingin tetap dalam keadaan masuk meski aplikasi saya tutup dan buka berkali-kali sepanjang hari, agar saya tidak kehilangan waktu di lapangan hanya untuk masuk ulang. |
| CP-6.1-04 | Sebagai Anggota, saya ingin aplikasi terkunci PIN atau sidik jari saat dibuka kembali, agar isi perkara tidak terbaca orang lain bila telepon saya hilang atau dipinjam. |
| CP-6.1-05 | Sebagai Kanit, saya ingin mereset kata sandi Anggota dan Panit di unit saya, agar personel yang lupa kata sandi dapat kembali bertugas tanpa menunggu pimpinan Subdit. |
| CP-6.1-06 | Sebagai Kasubdit, saya ingin mereset kata sandi pengguna mana pun, agar tidak ada akun yang terkunci permanen. |
| CP-6.1-07 | Sebagai Kasubdit, saya ingin peran seorang pengguna yang saya ubah langsung berlaku tanpa memaksanya keluar, agar pekerjaannya tidak terputus. |
| CP-6.1-08 | Sebagai pengguna, saya ingin tidak melihat menu yang bukan kewenangan saya, agar tampilan tetap ringkas dan saya tidak menebak-nebak. |
| CP-6.1-09 | Sebagai pengguna, saya ingin dikembalikan ke halaman saya sendiri bila saya membuka tautan yang bukan hak saya, agar saya tidak berhadapan dengan layar galat yang membingungkan. |
| CP-6.1-10 | Sebagai Anggota, saya ingin dapat keluar kapan saja meski sedang dalam Sesi Tugas, agar saya tidak terjebak di lapangan menunggu persetujuan siapa pun. |
| CP-6.1-11 | Sebagai Kanit, saya ingin diberi tahu bila seorang pelaksana keluar aplikasi saat Sesi Tugasnya masih berjalan, agar saya mengetahui keadaan sebenarnya dan dapat menilai sendiri. |
| CP-6.1-12 | Sebagai Anggota yang berganti telepon, saya ingin cukup masuk di telepon baru tanpa mengurus apa pun di telepon lama, agar pergantian perangkat tidak menghambat tugas. |
| CP-6.1-13 | Sebagai pemegang Akun Pemeliharaan, saya ingin dapat memulihkan akses saat seluruh jalur normal buntu, agar sistem tidak pernah terkunci total. |

## 6.1.3 Kriteria penerimaan

Ditulis dengan pola: bila kondisi, maka hasil yang diharapkan.

### Masuk ke sistem

| Kode | Kriteria |
| --- | --- |
| KP-6.1-01 | Bila pengguna memasukkan NRP dan kata sandi yang cocok pada akun berstatus aktif, maka Sesi Masuk terbentuk dan pengguna diarahkan ke beranda perannya. |
| KP-6.1-02 | Bila NRP tidak terdaftar **atau** kata sandi salah, maka ditampilkan satu pesan yang sama untuk kedua keadaan: "NRP atau kata sandi tidak sesuai." Sistem dilarang menyatakan mana yang salah. |
| KP-6.1-03 | Bila akun berstatus tidak aktif, maka masuk ditolak dengan pesan "Akun ini sedang tidak aktif. Hubungi Kanit unit Anda." Kolom terakhir_masuk tidak diperbarui. |
| KP-6.1-04 | Bila NRP dimasukkan dengan spasi di awal atau akhir, maka spasi dibuang sebelum diproses dan masuk tetap berhasil. |
| KP-6.1-05 | Bila proses masuk berhasil, maka kolom terakhir_masuk diperbarui dan satu baris jejak audit bertipe masuk_berhasil dicatat. |
| KP-6.1-06 | Bila jaringan terputus saat tombol Masuk ditekan, maka ditampilkan pesan "Tidak dapat menghubungi server. Periksa jaringan Anda." dan isian NRP tetap terisi. Kata sandi dikosongkan. |

### Kata Sandi Sementara

| Kode | Kriteria |
| --- | --- |
| KP-6.1-07 | Bila akun memiliki wajib_ganti_sandi bernilai benar, maka setelah masuk pengguna langsung diarahkan ke halaman penggantian kata sandi dan tidak dapat membuka halaman lain mana pun. |
| KP-6.1-08 | Bila pengguna pada keadaan tersebut mencoba membuka halaman lain melalui tautan langsung, maka ia dikembalikan ke halaman penggantian kata sandi. |
| KP-6.1-09 | Bila kata sandi baru berhasil disimpan, maka wajib_ganti_sandi menjadi salah, pengguna diarahkan ke beranda perannya, dan satu baris jejak audit bertipe ganti_sandi dicatat. |
| KP-6.1-10 | Bila kata sandi baru sama persis dengan Kata Sandi Sementara, maka penggantian ditolak dengan pesan "Kata sandi baru harus berbeda dari yang diberikan kepada Anda." |
| KP-6.1-11 | Bila kata sandi baru kurang dari delapan karakter, maka penggantian ditolak dan syaratnya ditampilkan. |

### Kunci Aplikasi

| Kode | Kriteria |
| --- | --- |
| KP-6.1-12 | Bila pengguna berhasil masuk untuk pertama kalinya di sebuah perangkat, maka ia ditawari memasang Kunci Aplikasi. Tawaran dapat dilewati dan dapat dipasang kemudian melalui halaman pengaturan. |
| KP-6.1-13 | Bila Kunci Aplikasi terpasang dan aplikasi kembali ke layar depan setelah lebih dari dua menit di latar belakang, maka layar kunci ditampilkan sebelum isi aplikasi terlihat. |
| KP-6.1-14 | Bila perangkat mendukung sidik jari dan pengguna mengizinkannya, maka sidik jari ditawarkan lebih dulu, dengan PIN selalu tersedia sebagai jalur cadangan. |
| KP-6.1-15 | Bila PIN dimasukkan salah lima kali berturut-turut, maka layar kunci digantikan permintaan kata sandi akun. Akun **tidak** dikunci dan **tidak** dinonaktifkan. |
| KP-6.1-16 | Bila Sesi Tugas sedang berjalan, maka Kunci Aplikasi tidak menghentikan pengiriman koordinat. Pelacakan berjalan di lapisan yang berbeda. |

### Peran dan perlindungan halaman

| Kode | Kriteria |
| --- | --- |
| KP-6.1-17 | Bila pengguna membuka halaman di luar kewenangan perannya melalui tautan langsung, maka ia dialihkan ke beranda perannya disertai pesan sekilas "Halaman itu di luar kewenangan Anda." Sistem dilarang menampilkan halaman galat yang membenarkan keberadaan halaman tersebut. |
| KP-6.1-18 | Bila sebuah menu atau tombol berada di luar kewenangan peran, maka unsur tersebut tidak dirender sama sekali, bukan dirender dalam keadaan nonaktif. |
| KP-6.1-19 | Bila lapisan tampilan gagal menyembunyikan sesuatu, maka aturan akses baris pada basis data tetap menolak permintaannya. Penyembunyian di antarmuka tidak dianggap pengamanan. |
| KP-6.1-20 | Bila seorang Panit membuka daftar SPT, maka yang tampil hanya SPT tempat ia tercatat pada penugasan_panit, termasuk yang sudah ditutup. |
| KP-6.1-21 | Bila seorang Panit belum pernah ditunjuk pada SPT mana pun, maka berandanya menampilkan kondisi kosong yang menjelaskan keadaan, bukan layar kosong tanpa keterangan. |

### Perubahan peran dan penonaktifan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.1-22 | Bila peran atau unit pengguna diubah saat ia sedang masuk, maka token disegarkan diam-diam, menu menyesuaikan di tempat, dan sebuah penanda kecil muncul berbunyi "Kewenangan Anda baru saja diperbarui." Pengguna **tidak** dikeluarkan. |
| KP-6.1-23 | Bila pengguna berada di halaman yang menjadi di luar kewenangannya akibat perubahan tersebut, maka ia dialihkan ke beranda peran barunya. |
| KP-6.1-24 | Bila akun dinonaktifkan saat pengguna sedang masuk, maka Sesi Masuk diakhiri dalam waktu paling lama lima belas detik dan pengguna dikembalikan ke halaman masuk dengan pesan "Akun ini sedang tidak aktif. Hubungi Kanit unit Anda." |
| KP-6.1-25 | Bila akun dinonaktifkan saat Sesi Tugas berjalan, maka Sesi Tugas ditutup, seluruh titik koordinat dan laporan yang sudah terkirim tetap tersimpan utuh, dan penutupan ditandai "Sesi ditutup karena akun dinonaktifkan". |

### Keluar dan Sesi Tugas

| Kode | Kriteria |
| --- | --- |
| KP-6.1-26 | Bila pengguna menekan Keluar, maka permintaan dikonfirmasi lebih dulu, dan setelah dikonfirmasi Sesi Masuk berakhir tanpa persetujuan siapa pun. |
| KP-6.1-27 | Bila pengguna keluar saat Sesi Tugas berjalan, maka Sesi Tugas ditutup otomatis, Rute sampai detik itu tersimpan utuh, penutupan ditandai "Sesi ditutup karena keluar aplikasi" beserta waktunya, dan Kanit unit serta seluruh Panit Penanggung Jawab penugasan tersebut menerima pemberitahuan. |
| KP-6.1-28 | Bila keadaan pada KP-6.1-27 terjadi, maka dialog konfirmasi memberi tahu lebih dulu bahwa Sesi Tugas akan ditutup, sehingga pengguna dapat membatalkan. |
| KP-6.1-29 | Bila pengguna keluar, maka draf laporan yang belum terkirim di perangkat itu **tidak** dihapus dan tersedia kembali setelah pengguna yang sama masuk lagi di perangkat yang sama. |

### Satu perangkat per akun

| Kode | Kriteria |
| --- | --- |
| KP-6.1-30 | Bila sebuah akun berhasil masuk di perangkat baru sementara perangkat lama masih memegang Sesi Masuk, maka Sesi Masuk lama berakhir dan baris perangkat_masuk diperbarui menunjuk perangkat baru. Masuk di perangkat baru **tidak** ditolak. |
| KP-6.1-31 | Bila perangkat lama kemudian dipakai, maka ia menampilkan halaman masuk dengan pesan "Akun Anda dipakai masuk di perangkat lain." tanpa nada menuduh. |
| KP-6.1-32 | Bila pergeseran perangkat terjadi saat Sesi Tugas berjalan di perangkat lama, maka Sesi Tugas ditutup, Rute tersimpan utuh, ditandai "Sesi ditutup karena masuk di perangkat lain", dan Kanit serta Panit Penanggung Jawab diberi tahu. |
| KP-6.1-33 | Bila pergeseran perangkat terjadi, maka satu baris jejak audit bertipe geser_perangkat dicatat, memuat keterangan kedua perangkat. |

### Reset kata sandi

| Kode | Kriteria |
| --- | --- |
| KP-6.1-34 | Bila Kanit mereset kata sandi seorang Anggota atau Panit di unitnya, maka sistem menerima tindakan itu, menyalakan wajib_ganti_sandi, dan menampilkan Kata Sandi Sementara satu kali di layar untuk disampaikan secara lisan. |
| KP-6.1-35 | Bila Kanit mencoba mereset kata sandi pengguna di luar unitnya, atau kata sandi sesama Kanit, atau kata sandi Kasubdit, maka permintaan ditolak di tingkat basis data. |
| KP-6.1-36 | Bila Kasubdit mereset kata sandi pengguna mana pun, maka permintaan diterima. |
| KP-6.1-37 | Bila kata sandi direset, maka seluruh Sesi Masuk akun tersebut diakhiri dan baris perangkat_masuk-nya dihapus. |
| KP-6.1-38 | Bila kata sandi direset, maka satu baris jejak audit bertipe reset_sandi dicatat memuat pelaku dan sasaran. Kata sandi itu sendiri dilarang ikut tercatat. |
| KP-6.1-39 | Bila sistem menampilkan Kata Sandi Sementara, maka ia ditampilkan sekali dan tidak dapat dilihat ulang. Bila hilang, reset diulang. |

### Akun Pemeliharaan

| Kode | Kriteria |
| --- | --- |
| KP-6.1-40 | Bila Akun Pemeliharaan masuk, maka berandanya adalah halaman pemeliharaan berisi daftar akun dan tombol reset, bukan dashboard peran mana pun. |
| KP-6.1-41 | Bila Akun Pemeliharaan melakukan tindakan apa pun, termasuk membaca data perkara, maka satu baris jejak audit dicatat. |
| KP-6.1-42 | Bila daftar personel, pemilihan pelaksana SPT, peta, atau rekapitulasi dirender, maka Akun Pemeliharaan tidak muncul di dalamnya. |
| KP-6.1-43 | Bila Akun Pemeliharaan mencoba menerbitkan SPT, membuka Sesi Tugas, atau menyusun LHP Ringkas, maka permintaan ditolak di tingkat basis data. |

## 6.1.4 Aturan modul

| Kode | Aturan |
| --- | --- |
| AM-6.1-01 | Identitas masuk adalah NRP. Email sintetis dibangkitkan sistem, tidak pernah ditampilkan, dan tidak pernah menjadi jalur pemulihan. |
| AM-6.1-02 | Pesan kegagalan masuk selalu sama untuk NRP tidak terdaftar dan kata sandi salah. Membedakan keduanya membocorkan NRP mana yang terdaftar. |
| AM-6.1-03 | Kata sandi minimal delapan karakter. Tidak ada syarat huruf besar, angka, atau lambang. Syarat rumit pada pengguna lapangan menghasilkan kata sandi yang dituliskan di kertas. |
| AM-6.1-04 | Kata Sandi Sementara wajib diganti sebelum sistem dapat dipakai. Tidak ada jalan melewatinya. |
| AM-6.1-05 | Kunci Aplikasi bersifat lokal di perangkat. PIN tidak dikirim ke server dan tidak dapat dipulihkan dari server. Melupakan PIN diselesaikan dengan masuk ulang memakai kata sandi akun. |
| AM-6.1-06 | Kunci Aplikasi bukan pengaman data. Ia hanya menghalangi mata orang lain pada perangkat yang sama. Pengamanan sesungguhnya tetap pada aturan akses baris. |
| AM-6.1-07 | Sesi Masuk tidak berakhir sendiri karena waktu. Ia berakhir hanya karena pengguna keluar, akun dinonaktifkan, kata sandi direset, atau digeser perangkat lain. |
| AM-6.1-08 | Satu akun memegang satu Perangkat Terdaftar. Masuk di perangkat baru selalu menang atas yang lama. Menolak perangkat baru berisiko mengunci personel yang teleponnya rusak atau hilang. |
| AM-6.1-09 | Peran dan unit dibaca dari basis data, bukan dari apa pun yang tersimpan di perangkat. Nilai yang tersimpan di perangkat hanya untuk mempercepat tampilan dan tidak pernah menjadi dasar keputusan izin. |
| AM-6.1-10 | Perubahan peran diberlakukan melalui penyegaran token diam-diam. Pengguna tidak dikeluarkan. |
| AM-6.1-11 | Penonaktifan akun mengakhiri Sesi Masuk. Ini akibat teknis, bukan pilihan kebijakan: basis data akan menolak seluruh permintaan akun tersebut sehingga menahannya di dalam aplikasi hanya menghasilkan layar galat beruntun. |
| AM-6.1-12 | Seluruh pesan mengikuti Prinsip Non-Menghakimi pada Section 0.6. Pesan menyatakan keadaan, bukan menuduh. "Akun Anda dipakai masuk di perangkat lain", bukan "Anda melanggar aturan perangkat". |
| AM-6.1-13 | Kegagalan masuk berulang tidak mengunci akun. Sistem bersandar pada pembatasan laju bawaan Supabase. Mengunci akun berisiko melumpuhkan personel di lapangan pada saat genting. |
| AM-6.1-14 | Lingkup data Panit ditelusuri melalui penugasan_panit, tidak pernah melalui perbandingan kolom unit. |
| AM-6.1-15 | Akun Pemeliharaan memiliki lingkup baca penuh, namun tidak memiliki kewenangan tindakan operasional. Ia dapat membaca dan memulihkan, tidak dapat menerbitkan maupun melaksanakan. |
| AM-6.1-16 | Baris jejak audit tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran mana pun, termasuk Akun Pemeliharaan. |
| AM-6.1-17 | Kolom foto_acuan_wajah disediakan kosong dan tidak dibaca maupun ditulis modul mana pun sampai fitur verifikasi wajah disetujui secara tertulis. Mengisinya lebih awal berarti menyimpan data biometrik tanpa dasar. |

## 6.1.5 Antarmuka dan kondisi tampilan

Gaya visual seluruh halaman di bawah diambil dari prototype HTML sesuai Section 4.3. Prototype belum memuat halaman masuk, sehingga halaman-halaman berikut disusun mengikuti kaidah visual yang sudah berlaku di prototype: palet warna, bentuk kartu, jarak antar unsur, dan gaya tombol. Dilarang membuat arah desain baru.

### Halaman Masuk

| Aspek | Ketetapan |
| --- | --- |
| Isi | Lambang, nama sistem, isian NRP, isian kata sandi dengan tombol perlihatkan, tombol Masuk |
| Lambang | Placeholder bertuliskan SiPANTAU dengan gaya prototype. **Dilarang** membuat tiruan lambang institusi. Berkas resmi menunggu butir A-04 |
| Yang tidak ada | Tautan daftar akun baru, tautan lupa kata sandi, pilihan ingat saya |
| Kondisi memuat | Tombol Masuk berubah menjadi keadaan menunggu dan tidak dapat ditekan dua kali |
| Kondisi galat | Pesan muncul di atas tombol, berwarna sesuai gaya peringatan prototype. Isian NRP dipertahankan, kata sandi dikosongkan |
| Tanpa jaringan | Pesan tersendiri yang membedakan gangguan jaringan dari kesalahan kredensial |
| Ukuran layar | Diutamakan layar telepon genggam. Pada layar lebar, kartu masuk berada di tengah dengan lebar terbatas |

Tidak disediakan tautan lupa kata sandi karena tidak ada email sungguhan yang dapat dikirimi. Sebagai gantinya, di bawah tombol Masuk terdapat satu baris keterangan: "Lupa kata sandi? Hubungi Kanit unit Anda."

### Halaman Penggantian Kata Sandi Wajib

| Aspek | Ketetapan |
| --- | --- |
| Kapan muncul | Segera setelah masuk bila wajib_ganti_sandi bernilai benar |
| Isi | Keterangan singkat alasannya, isian kata sandi baru, isian ulangi kata sandi baru, tombol Simpan |
| Yang tidak ada | Tombol lewati, tombol kembali, menu navigasi. Halaman ini buntu sampai kata sandi diganti |
| Kondisi galat | Syarat panjang dan syarat berbeda dari sebelumnya ditampilkan di bawah isian terkait |

### Layar Kunci Aplikasi

| Aspek | Ketetapan |
| --- | --- |
| Kapan muncul | Aplikasi kembali dari latar belakang setelah lebih dari dua menit, bila Kunci Aplikasi terpasang |
| Isi | Enam kotak angka, tombol angka besar sesuai kaidah sasaran sentuh Section 10.5, ikon sidik jari bila didukung |
| Setelah lima kali salah | Berganti menjadi permintaan kata sandi akun, bukan penguncian |
| Saat Sesi Tugas berjalan | Terdapat baris keterangan "Sesi Tugas Anda tetap berjalan" agar pengguna tidak menduga pelacakan terhenti |

### Beranda tiap peran

| Peran | Beranda setelah masuk |
| --- | --- |
| Kasubdit | Dashboard lintas unit |
| Kanit | Dashboard unitnya |
| Panit | Daftar SPT yang ia awasi |
| Anggota | Daftar SPT yang ditujukan padanya, dengan aksi Mulai Tugas paling menonjol |
| Akun Pemeliharaan | Halaman pemeliharaan berisi daftar akun dan tombol reset |

Aksi Mulai Tugas pada beranda Anggota memakai kendali geser, bukan tombol tekan, untuk mencegah tersenggol di dalam saku. Rincian kendali ini ditetapkan pada Modul 6.4; Modul 6.1 hanya menetapkan penempatannya di beranda.

### Kondisi kosong

| Halaman | Kondisi kosong |
| --- | --- |
| Beranda Panit tanpa SPT | "Belum ada penugasan yang Anda awasi. Penugasan akan muncul di sini begitu Kanit menunjuk Anda sebagai penanggung jawab." |
| Beranda Anggota tanpa SPT | "Belum ada penugasan untuk Anda saat ini." |
| Halaman pemeliharaan tanpa akun | Tidak berlaku. Sekurang-kurangnya dua akun selalu ada |

### Perbedaan antar peran

Menu yang dirender per peran, sesuai KP-6.1-18. Unsur yang tidak tercantum tidak dirender sama sekali.

| Menu | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Dashboard | Ya | Ya | Ya | Ya |
| Daftar SPT | Ya | Ya | Ya | Ya |
| Terbitkan SPT | — | Ya | — | — |
| Peta Tracking | Ya | Ya | Ya | Ya |
| Laporan | Ya | Ya | Ya | Ya |
| LHP Ringkas | Ya | Ya | Ya | Ya |
| Mulai Tugas | — | — | Ya | Ya |
| Manajemen User | Ya | — | — | — |
| Daftar Unit | Ya | — | — | — |
| Reset Kata Sandi | Ya | Ya | — | — |
| Rekapitulasi Lintas Unit | Ya | — | — | — |
| Pengaturan dan Keluar | Ya | Ya | Ya | Ya |

## 6.1.6 Edge case modul

| Kode | Kondisi | Penanganan |
| --- | --- | --- |
| EC-6.1-01 | Sesi Masuk berakhir saat pengguna sedang mengisi formulir panjang | Isian yang belum terkirim tetap tersimpan di perangkat. Setelah pengguna yang sama masuk lagi di perangkat yang sama, isian dipulihkan. Mekanisme penyimpanannya milik Modul 6.3; Modul 6.1 hanya dilarang menghapus penyimpanan lokal saat Sesi Masuk berakhir |
| EC-6.1-02 | Peran diubah saat pengguna sedang masuk | Token disegarkan diam-diam, menu menyesuaikan, penanda kecil muncul. Bila halaman yang sedang dibuka menjadi di luar kewenangan, dialihkan ke beranda peran baru |
| EC-6.1-03 | Akun dinonaktifkan saat Sesi Tugas berjalan | Sesi Tugas ditutup, Rute dan laporan tersimpan utuh, ditandai "Sesi ditutup karena akun dinonaktifkan", pengguna dikembalikan ke halaman masuk |
| EC-6.1-04 | Pengguna membuka halaman di luar kewenangannya lewat tautan langsung | Dialihkan ke beranda perannya dengan pesan sekilas. Tidak ditampilkan halaman galat. Tidak dicatat sebagai pelanggaran, sesuai Prinsip 0.6 |
| EC-6.1-05 | Masuk di perangkat kedua saat perangkat pertama masih aktif | Perangkat kedua menang. Perangkat pertama keluar dengan pesan netral. Bila Sesi Tugas sedang berjalan di perangkat pertama, berlaku KP-6.1-32 |
| EC-6.1-06 | Perangkat hilang atau rusak, pengguna masuk di perangkat pengganti | Berjalan sendirinya lewat aturan pergeseran perangkat. Tidak ada tindakan tambahan yang diperlukan |
| EC-6.1-07 | Aplikasi dipasang ulang sehingga penanda perangkat berubah | Dianggap perangkat baru. Kunci Aplikasi hilang dan perlu dipasang ulang. Data pengguna tidak terpengaruh |
| EC-6.1-08 | Kanit lupa kata sandinya sendiri | Diselesaikan Kasubdit. Bila Kasubdit tidak dapat dihubungi, diselesaikan Akun Pemeliharaan |
| EC-6.1-09 | Kasubdit lupa kata sandinya sendiri | Hanya dapat diselesaikan Akun Pemeliharaan. Inilah alasan utama akun tersebut ada |
| EC-6.1-10 | Kredensial Akun Pemeliharaan hilang | Tidak dapat dipulihkan dari dalam aplikasi. Perlu penanganan langsung di panel Supabase. Ditulis pada berkas serah terima proyek |
| EC-6.1-11 | Kata sandi direset saat pengguna sedang dalam Sesi Tugas | Sesi Masuk berakhir, Sesi Tugas ditutup, Rute tersimpan utuh, ditandai "Sesi ditutup karena kata sandi direset" |
| EC-6.1-12 | Jam perangkat tidak akurat sehingga token dianggap kedaluwarsa | Ditampilkan pesan yang menyarankan mengaktifkan waktu otomatis pada pengaturan perangkat, bukan pesan galat umum |
| EC-6.1-13 | Panit ditunjuk pada SPT saat ia sedang membuka aplikasi | SPT baru muncul pada daftarnya tanpa perlu masuk ulang |
| EC-6.1-14 | Panit dicabut dari SPT yang sedang berjalan | Baris pada penugasan_panit **tidak** dihapus melainkan ditandai berakhir, agar laporan yang sudah ia tinjau tetap dapat ditelusuri. Rinciannya ditetapkan pada Modul 6.2 |
| EC-6.1-15 | Unit tempat seorang pengguna bertugas dinonaktifkan | Pengguna tetap dapat masuk dan tetap melihat datanya sendiri. Kanit unit tersebut kehilangan kemampuan menerbitkan SPT baru. Penanganan penuh milik Modul 6.6 |
| EC-6.1-16 | Dua peninjau mengubah peran pengguna yang sama secara bersamaan | Perubahan terakhir yang menang, dan keduanya tercatat pada jejak audit |

## 6.1.7 Ketergantungan

**Modul ini tidak bergantung pada modul mana pun.** Ia dikerjakan pertama.

Yang bergantung padanya, dan tidak boleh dimulai sebelum modul ini selesai:

| Modul | Yang dibutuhkannya dari 6.1 |
| --- | --- |
| 6.2 Manajemen Penugasan | Pembacaan peran untuk membatasi penerbitan SPT pada Kanit |
| 6.3 Pelaporan Harian | Identitas pengirim laporan dan lingkup datanya |
| 6.4 GPS Tracking | Identitas pemilik titik koordinat dan aturan penutupan Sesi Tugas saat Sesi Masuk berakhir |
| 6.5 Dashboard | Penentuan lingkup data yang ditampilkan |
| 6.6 Manajemen User | Tabel users, unit, dan jejak audit yang dibentuk modul ini |
| 6.7 Kolase | Hak akses foto yang menaunginya |
| 6.8 LHP Ringkas | Pembatasan penyusunan LHP pada Anggota |
| 6.9 Notifikasi | Lingkup data penerima pemberitahuan, sesuai BR-14 |

Yang dibutuhkan dari luar sebelum modul ini dapat dianggap selesai seluruhnya: berkas lambang institusi (butir A-04) dan daftar resmi unit (butir A-06). Keduanya dapat diganti belakangan tanpa mengubah kode, sehingga tidak menahan pembangunan.

---
---

# 5. Perubahan Section 7 — Business Rules Global

## BR-07 direvisi

| Kode | Aturan lama | Aturan baru |
| --- | --- | --- |
| BR-07 | Manajemen akun pengguna dan rekapitulasi lintas unit hanya dapat diakses Kasubdit | **Manajemen akun pengguna, pengelolaan daftar unit, dan rekapitulasi lintas unit hanya dapat diakses Kasubdit. Mereset kata sandi dipisahkan sebagai kewenangan tersendiri dan diatur pada BR-15.** |

## Aturan tambahan

| Kode | Aturan | Modul terkait |
| --- | --- | --- |
| BR-15 | Mereset kata sandi dapat dilakukan Kasubdit terhadap pengguna mana pun, dan Kanit terhadap Anggota dan Panit di unitnya sendiri. Kanit tidak dapat mereset kata sandi sesama Kanit maupun Kasubdit. | 6.1, 6.6 |
| BR-16 | Satu akun hanya memegang satu Sesi Masuk aktif pada satu perangkat. Masuk di perangkat baru mengakhiri Sesi Masuk di perangkat lama, dan tidak pernah ditolak. | 6.1 |
| BR-17 | Sistem memiliki tepat satu Akun Pemeliharaan dengan lingkup baca penuh atas seluruh tabel, tanpa kewenangan menerbitkan SPT, membuka Sesi Tugas, maupun menyusun LHP. Seluruh tindakannya tercatat pada jejak audit. Akun ini tidak muncul pada daftar personel, pemilihan pelaksana, peta, maupun rekapitulasi. | 6.1, 6.5, 6.6 |
| BR-18 | Kata sandi yang ditetapkan pembuat akun atau pereset bersifat sementara dan wajib diganti pengguna sebelum sistem dapat dipakai. | 6.1, 6.6 |
| BR-19 | Keluar aplikasi tidak memerlukan persetujuan siapa pun. Bila dilakukan saat Sesi Tugas berjalan, Sesi Tugas ditutup, Rute tersimpan utuh, penutupan ditandai beserta sebabnya, dan Kanit serta Panit Penanggung Jawab diberi tahu. | 6.1, 6.4, 6.9 |
| BR-20 | Perubahan peran atau unit diberlakukan melalui pembaruan di tempat tanpa mengeluarkan pengguna. Penonaktifan akun mengakhiri Sesi Masuk. | 6.1, 6.6 |
| BR-21 | Lingkup data Panit ditentukan oleh penugasan tempat ia ditunjuk sebagai Panit Penanggung Jawab, bukan oleh unitnya. Penunjukan yang sudah berakhir tetap memberi hak baca atas riwayat penugasan tersebut. | 6.1, 6.2, 6.5 |
| BR-22 | Baris jejak audit bersifat hanya-tambah. Tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran mana pun, termasuk Akun Pemeliharaan. | Seluruh modul |

> **Catatan penomoran.** BR-15 sampai BR-22 melanjutkan penomoran dari BR-14 sesuai aturan penambahan pada Section 7. Tidak ada kode lama yang dipakai ulang.

---
---

# 6. Perubahan Section 9 — Keamanan & Row Level Security

## 9.2 Aturan akses per tabel

**[FINAL] untuk tabel yang menjadi urusan Modul 6.1**

| Tabel | Baca | Tulis |
| --- | --- | --- |
| users | Pengguna membaca barisnya sendiri. Kasubdit membaca seluruh baris. Kanit membaca baris pengguna di unitnya. Panit membaca baris Anggota pada penugasan yang diawasinya. Akun Pemeliharaan membaca seluruh baris | Kasubdit menulis seluruh kolom. Kanit dan Akun Pemeliharaan hanya menulis kolom wajib_ganti_sandi pada sasaran yang diizinkan BR-15. Pengguna menulis kolom kata sandinya sendiri. Kolom peran dan unit_id hanya dapat ditulis Kasubdit |
| unit | Seluruh pengguna terautentikasi membaca baris aktif | Hanya Kasubdit |
| penugasan_panit | Panit membaca barisnya sendiri. Kanit membaca baris pada penugasan di unitnya. Kasubdit dan Akun Pemeliharaan membaca seluruh baris | Hanya Kanit, terbatas pada penugasan di unitnya sendiri |
| perangkat_masuk | Pengguna membaca barisnya sendiri. Akun Pemeliharaan membaca seluruh baris | Pengguna menulis barisnya sendiri. Kasubdit, Kanit sesuai BR-15, dan Akun Pemeliharaan dapat menghapus baris milik orang lain sebagai akibat reset kata sandi |
| jejak_audit | Kasubdit dan Akun Pemeliharaan membaca seluruh baris. Kanit membaca baris yang pelakunya atau sasarannya berada di unitnya | Seluruh pengguna terautentikasi dapat menambah. **Tidak ada** yang dapat mengubah maupun menghapus |

Untuk tabel penugasan, laporan_harian, lhp, foto_dokumentasi, dan location_logs, arah aturannya tetap seperti Section 9.2 versi 0.2, dengan satu perubahan mengikat: **seluruh klausa untuk peran Panit yang sebelumnya membandingkan kolom unit wajib diganti menjadi penelusuran ke tabel penugasan_panit.** Rincian penuh disusun saat modul terkait digali.

> **Peringatan implementasi**
>
> Aturan akses untuk Panit menyentuh dua tabel sekaligus, sehingga rawan menghasilkan kueri yang lambat bila tidak diindeks. Wajib dibuat indeks pada kolom penugasan_id dan panit_id di tabel penugasan_panit sejak awal, bukan setelah sistem terasa lambat.

## 9.6 Jejak audit

**[FINAL]**

Jenis tindakan yang wajib tercatat:

| Jenis | Kapan dicatat |
| --- | --- |
| masuk_berhasil | Setiap keberhasilan masuk |
| keluar | Setiap pengakhiran Sesi Masuk oleh pengguna |
| geser_perangkat | Sesi Masuk berpindah perangkat |
| ganti_sandi | Pengguna mengganti kata sandinya sendiri |
| reset_sandi | Kata sandi direset pihak lain. Kata sandinya sendiri dilarang tercatat |
| ubah_peran | Peran atau unit seorang pengguna diubah |
| nonaktifkan_akun | Akun dinonaktifkan |
| aktifkan_akun | Akun diaktifkan kembali |
| akses_pemeliharaan | Setiap tindakan Akun Pemeliharaan, termasuk pembacaan data perkara |
| terbit_spt, tutup_spt, finalisasi_lhp, ekspor_dokumen | Ditetapkan pada penggalian modul terkait |

Kegagalan masuk **tidak** dicatat pada jejak audit. Mencatatnya berarti menyimpan daftar percobaan yang sebagian besar hanyalah salah ketik, dan berpotensi dibaca sebagai tuduhan, bertentangan dengan Prinsip 0.6.

---
---

# 7. Perubahan Lampiran A dan B

## Lampiran A — daftar diperbarui

| Kode | Butir | Status |
| --- | --- | --- |
| ~~A-01~~ | ~~Penunjukan Anggota ke SPT~~ | **Terjawab.** Kanit menunjuk Panit Penanggung Jawab dan Anggota pelaksana saat menerbitkan SPT. Dipindahkan ke Lampiran B butir B.1 |
| A-02 | Penyimpanan data sensitif pada layanan awan | Belum terjawab |
| A-03 | Angka target metrik keberhasilan | Belum terjawab |
| A-04 | Berkas kop dan lambang institusi | Belum terjawab. Kini juga dibutuhkan halaman masuk Modul 6.1, saat ini memakai placeholder |
| A-05 | Daftar alasan lokasi tidak terekam | Belum terjawab |
| **A-06** | **Daftar resmi unit di bawah Subdit IV** | **Baru.** Nama resmi setiap unit beserta urutannya. Saat ini terisi empat baris sementara dan wajib diganti sebelum peluncuran |
| **A-07** | **Kesediaan Kasubdit memakai sistem** | **Baru.** Manajemen akun dan rekapitulasi lintas unit bersifat eksklusif Kasubdit. Bila peran ini nominal saja, kedua fungsi tersebut mati sejak hari pertama dan perlu jalan keluar |
| **A-08** | **Pencatatan tertulis Akun Pemeliharaan** | **Baru.** Keberadaan akun berakses penuh beserta nama pemegangnya perlu tercatat pada dokumen serah terima proyek, sebagai perlindungan bagi kedua pihak saat terjadi pergantian personel |
| **A-09** | **Panit dan daftar SPT se-unit** | **Baru, [PERLU KONFIRMASI KLIEN].** Saat ini Panit hanya melihat SPT yang ia awasi, sehingga Panit tanpa penugasan aktif melihat halaman kosong. Bila pemilik produk menghendaki Panit tetap melihat daftar ringkas SPT se-unit sebagai bacaan, perubahannya sebatas satu klausa pada aturan akses baris |

## Lampiran B — butir tambahan

### B.1 Peran dan kewenangan — tambahan

- Kanit menunjuk Panit Penanggung Jawab dan Anggota pelaksana saat menerbitkan SPT
- Panit dapat membuka Sesi Tugas dan mengirim Laporan Kegiatan Harian, tetapi tidak menyusun LHP Ringkas dan tidak menerbitkan SPT
- Posisi Panit ikut direkam selama Sesi Tugasnya berjalan, sama seperti Anggota
- Lingkup data Panit ditentukan penugasan yang diawasinya, bukan unitnya
- Panit tetap dapat membaca riwayat penugasan yang pernah ia awasi setelah penugasan ditutup
- Kanit dapat mereset kata sandi Anggota dan Panit di unitnya sendiri
- Pengelolaan daftar unit adalah kewenangan eksklusif Kasubdit

### B.7 Autentikasi — bagian baru

- Identitas masuk adalah NRP, bukan surat elektronik. Email sintetis dibangkitkan sistem di belakang layar
- Kata sandi awal ditetapkan pembuat akun dan wajib diganti pada keberhasilan masuk pertama
- Kata sandi minimal delapan karakter, tanpa syarat kerumitan lain
- Tidak tersedia jalur lupa kata sandi mandiri. Pemulihan melalui Kanit, Kasubdit, atau Akun Pemeliharaan
- Sesi Masuk tidak berakhir karena waktu
- Satu akun memegang satu perangkat. Perangkat baru selalu menang atas yang lama
- Kunci Aplikasi berupa PIN enam angka atau sidik jari, bersifat lokal di perangkat
- Verifikasi wajah **tidak** dibangun pada tahap ini. Kolom foto_acuan_wajah disediakan kosong sebagai tempat fitur tersebut kelak
- Swafoto berwatermark saat Mulai Tugas **tidak** dibangun pada tahap ini
- Terdapat satu Akun Pemeliharaan berakses baca penuh, dipegang pemilik produk dan developer, seluruh tindakannya tercatat pada jejak audit
- Dua akun disemai manual saat pemasangan: satu Kasubdit dan satu Kanit Reskrim
- Kegagalan masuk berulang tidak mengunci akun

### B.8 Di luar cakupan — tambahan pada Section 12

| Tidak dibangun | Alasan |
| --- | --- |
| Pencocokan wajah otomatis | Menuntut deteksi kehidupan, akurasi anjlok pada cahaya matahari dan perangkat kelas bawah, serta menimbulkan kewajiban perlindungan data biometrik. Ditunda ke tahap berikutnya |
| Pendaftaran akun mandiri | Akun dibuat Kasubdit. Tidak ada jalur pendaftaran sendiri dalam bentuk apa pun |
| Pemulihan kata sandi lewat surat elektronik atau pesan singkat | Tidak ada alamat surat elektronik sungguhan, dan pesan singkat menimbulkan biaya per pesan di luar anggaran |
| Penguncian akun akibat kegagalan masuk berulang | Berisiko melumpuhkan personel di lapangan. Bersandar pada pembatasan laju bawaan layanan |

---

## Yang perlu Anda kerjakan setelah menempel berkas ini

1. Naikkan versi PRD menjadi 0.3 pada Kendali Dokumen dan Riwayat Revisi
2. Ubah penanda status Modul 6.1 dari [KERANGKA] menjadi [FINAL]
3. Perbarui Checklist Progres: centang Tahap 2 baris 6.1, dan coret butir A-01 pada Tahap 1
4. Ekspor ulang ke Word dan Markdown agar keduanya sinkron
5. Kejar ke pemilik produk: butir A-04, A-06, A-07, A-08, dan A-09

Modul berikutnya yang tepat digali adalah **6.2 Manajemen Penugasan (SPT)**, karena tabel `penugasan_panit` sudah terbentuk di sini dan penunjukan tim menjadi urusannya.


---
---

# SiPANTAU — Addendum 6.1-T

**Spesifikasi Teknis Implementasi Modul 6.1**

Tanggal: 31 Juli 2026 · Pelengkap berkas Revisi PRD v0.3 · Status: [FINAL]

---

## Mengapa addendum ini ada

Berkas Revisi v0.3 menetapkan perilaku modul secara lengkap menurut kerangka Section 6.0, tetapi pada tiga titik ia menyatakan hasil akhir tanpa menyebutkan jalur teknis yang menghasilkannya. Menurut Section 0.1, bagian yang belum cukup jelas untuk diimplementasikan tidak boleh diisi perkiraan oleh AI Agent. Ketiga titik itu ditutup di sini.

| Celah | Kriteria terdampak | Ditutup pada |
| --- | --- | --- |
| Bagaimana perubahan peran menjadi berlaku | KP-6.1-22, KP-6.1-23 | Bagian 1 |
| Lewat jalur apa reset kata sandi dieksekusi | KP-6.1-34 sampai KP-6.1-39, BR-15 | Bagian 2 |
| Bagaimana perangkat lama dipaksa keluar | KP-6.1-30 sampai KP-6.1-33, BR-16 | Bagian 3 |

Addendum ini ditempel sebagai **Section 6.1.8** pada PRD, ditambah lima perubahan pada section lain yang didaftar di Bagian 5.

> **Dua koreksi terhadap berkas v0.3.** Rumusan KP-6.1-22 dan penjelasan BR-16 pada berkas v0.3 mengandung asumsi teknis yang keliru. Keduanya diganti di Bagian 4. Berkas v0.3 tetap berlaku untuk seluruh butir lainnya.

---
---

# Bagian 1 — Peran dan lingkup data dibaca dari mana

## 1.1 Keputusan pokok

**Peran dan unit tidak disimpan di dalam token.** Seluruh pemeriksaan kewenangan di tingkat basis data membaca tabel `users` melalui fungsi bantu.

Ada dua rancangan yang lazim dipakai pada Supabase, dan pilihan di antara keduanya menentukan seluruh perilaku KP-6.1-22:

| | Rancangan A — peran di dalam token | Rancangan B — peran dibaca tiap kueri |
| --- | --- | --- |
| Cara kerja | Peran ditanamkan sebagai klaim tambahan pada JWT lewat custom access token hook. Aturan akses baris membaca klaim itu | Aturan akses baris memanggil fungsi bantu yang menyelidik tabel `users` |
| Kecepatan | Sedikit lebih cepat, tidak ada pembacaan tabel | Ada satu pembacaan tabel, dapat ditekan (lihat 1.4) |
| Ketepatan waktu | **Basi.** Peran lama tetap berlaku sampai token disegarkan, bawaannya sampai satu jam | **Seketika.** Perubahan berlaku pada kueri berikutnya |
| Kerumitan | Perlu hook, perlu pemaksaan penyegaran token, perlu penanganan token basi | Tidak ada mekanisme tambahan |
| Risiko kelas kesalahan | Seluruh kelas kesalahan "token basi": pengguna masih memegang kewenangan yang sudah dicabut | Tidak ada |

**Rancangan B dipilih.** Alasannya bukan kerapian melainkan keamanan: pada Rancangan A, seorang pengguna yang perannya baru saja diturunkan tetap memegang kewenangan lamanya sampai tokennya kedaluwarsa. Pada sistem yang memuat data perkara, jendela selebar itu tidak dapat diterima. Rancangan B juga membuat KP-6.1-22 terpenuhi tanpa mekanisme apa pun: tidak ada token yang perlu disegarkan karena peran memang tidak pernah ada di dalamnya.

Konsekuensi yang wajib dicatat: rumusan "token disegarkan diam-diam" pada KP-6.1-22 versi v0.3 **keliru dan dicabut**. Penggantinya ada di Bagian 4.

## 1.2 Skema fungsi bantu

Fungsi bantu ditempatkan pada skema tersendiri yang **tidak** didaftarkan sebagai Exposed Schema pada pengaturan API, agar tidak dapat dipanggil langsung lewat REST oleh pemegang kunci publik, namun tetap dapat dievaluasi oleh aturan akses baris.

```sql
-- Skema khusus fungsi bantu kewenangan.
-- JANGAN tambahkan skema ini ke daftar "Exposed schemas" pada API Settings.
create schema if not exists sipantau_auth;
grant usage on schema sipantau_auth to authenticated;
```

### Fungsi 1 — peran pengguna yang sedang masuk

```sql
create or replace function sipantau_auth.peran_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select peran::text
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

grant execute on function sipantau_auth.peran_saya() to authenticated;
```

### Fungsi 2 — unit pengguna yang sedang masuk

```sql
create or replace function sipantau_auth.unit_saya()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select unit_id
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

grant execute on function sipantau_auth.unit_saya() to authenticated;
```

### Fungsi 3 — daftar penugasan yang diawasi, untuk peran Panit

```sql
create or replace function sipantau_auth.penugasan_yang_saya_awasi()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_panit
  where panit_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.penugasan_yang_saya_awasi() to authenticated;
```

### Fungsi 4 — penanda Perangkat Terdaftar

```sql
create or replace function sipantau_auth.perangkat_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select penanda_perangkat
  from public.perangkat_masuk
  where user_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.perangkat_saya() to authenticated;
```

> **Tiga hal yang wajib ada pada setiap fungsi di atas, dan sering terlewat**
>
> `security definer` — fungsi dijalankan dengan hak pembuatnya sehingga melewati aturan akses baris tabel `users`. Tanpa ini, kebijakan pada tabel `users` yang memanggil `peran_saya()` akan memanggil dirinya sendiri dan menghasilkan galat rekursi tak berhingga. Ini kesalahan paling sering pada pola ini.
>
> `stable` — memberi tahu PostgreSQL bahwa hasilnya tidak berubah dalam satu pernyataan, sehingga boleh disimpan sementara.
>
> `set search_path = ''` — mengunci jalur pencarian nama. Konsekuensinya seluruh nama tabel wajib ditulis lengkap dengan skemanya, seperti `public.users`. Tanpa ini, fungsi ber-`security definer` dapat disalahgunakan lewat penyisipan skema.

## 1.3 Cara memakainya di aturan akses baris

Contoh kebijakan pembacaan tabel `users`, menggantikan arah aturan pada Section 9.2:

```sql
alter table public.users enable row level security;

create policy "users_baca_sesuai_lingkup"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
);
```

Contoh kebijakan untuk peran Panit pada tabel yang terikat penugasan:

```sql
create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  anggota_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
      where unit_id = (select sipantau_auth.unit_saya())
    )
  )
  or (
    (select sipantau_auth.peran_saya()) = 'panit'
    and penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
  )
);
```

## 1.4 Menekan biaya pembacaan

Tiga hal ini mengikat, bukan saran:

1. **Bungkus setiap panggilan fungsi bantu dalam `(select ...)`.** Bentuk `(select sipantau_auth.peran_saya())` membuat PostgreSQL menghitungnya satu kali per pernyataan, bukan satu kali per baris. Menuliskannya tanpa pembungkus pada tabel berisi puluhan ribu baris titik koordinat akan terasa sangat lambat.
2. **Pakai bentuk himpunan untuk lingkup Panit,** yaitu `penugasan_id in (select ...)`, bukan fungsi berparameter yang dipanggil per baris.
3. **Indeks wajib dibuat sejak awal,** bukan setelah sistem terasa lambat:

```sql
create index if not exists idx_penugasan_panit_panit
  on public.penugasan_panit (panit_id, penugasan_id);

create index if not exists idx_users_unit
  on public.users (unit_id) where aktif = true;

create index if not exists idx_laporan_penugasan
  on public.laporan_harian (penugasan_id);

create index if not exists idx_location_logs_penugasan
  on public.location_logs (penugasan_id, waktu desc);
```

## 1.5 Lapisan antarmuka

Basis data sudah tepat waktu dengan sendirinya. Yang belum adalah tampilan: menu di layar masih menampilkan susunan lama sampai aplikasi tahu ada perubahan. Tiga lapis penanganan:

**Lapis 1 — Realtime.** Aplikasi menyimak barisnya sendiri pada tabel `users`.

```sql
alter publication supabase_realtime add table public.users;
```

```javascript
supabase
  .channel('kewenangan-saya')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
    (payload) => {
      simpanKeStorePeran(payload.new)          // menu digambar ulang
      if (!payload.new.aktif) keluarPaksa()      // penonaktifan, lihat KP-6.1-24
      else tampilkanPenanda('Kewenangan Anda baru saja diperbarui.')
    })
  .subscribe()
```

**Lapis 2 — Pembacaan ulang saat aplikasi kembali ke depan.** Realtime dapat putus tanpa pemberitahuan di jaringan lemah. Setiap kali aplikasi kembali dari latar belakang dan setiap kali pengguna berpindah halaman, baris `users` miliknya dibaca ulang.

**Lapis 3 — Basis data sebagai penentu.** Bila kedua lapis di atas gagal dan menu lama masih terlihat, penekanan tombolnya tetap ditolak aturan akses baris. Tampilan yang basi menghasilkan pesan galat, bukan kebocoran kewenangan. Inilah alasan Rancangan B dipilih.

> **Catatan tentang Realtime dan aturan akses baris.** Aliran `postgres_changes` menghormati aturan akses baris. Pengguna hanya menerima perubahan pada baris yang boleh ia baca. Karena kebijakan `users_baca_sesuai_lingkup` mengizinkan pengguna membaca barisnya sendiri, penyimakan di atas berjalan tanpa izin tambahan.

---
---

# Bagian 2 — Jalur eksekusi reset kata sandi

## 2.1 Duduk perkaranya

Mengubah kata sandi **pengguna lain** hanya dapat dilakukan lewat Admin API Supabase, yang mensyaratkan kunci `service_role`. Kunci itu memberi akses penuh ke seluruh basis data dan melewati seluruh aturan akses baris. Menaruhnya di aplikasi klien berarti membagikannya kepada siapa pun yang memasang berkas aplikasi Android tersebut.

Sementara itu Section 4.5 menyatakan tidak ada server aplikasi manual. Keduanya perlu didamaikan, dan pendamainya adalah **Fungsi Tepi Supabase**.

## 2.2 Amandemen Section 4.5

Butir pertama Section 4.5 diganti menjadi:

> **Tidak ada server aplikasi manual.** Seluruh logika data ditegakkan lewat aturan basis data dan aturan akses baris, bukan lewat kode server terpisah yang ditulis dan di-hosting sendiri.
>
> Pengecualian tunggal adalah **Fungsi Tepi**, yaitu fungsi tanpa server yang merupakan bagian dari layanan backend terkelola yang sama dan disebarkan dari project yang sama. Fungsi Tepi **hanya** boleh dipakai untuk operasi yang secara teknis mensyaratkan kunci `service_role` dan karena itu tidak mungkin dijalankan dari klien. Fungsi Tepi dilarang dipakai sebagai tempat memindahkan logika bisnis yang seharusnya berada pada aturan akses baris.

Daftar tertutup operasi yang boleh memakai Fungsi Tepi:

| Fungsi | Modul | Alasan mensyaratkan kunci istimewa |
| --- | --- | --- |
| `reset-kata-sandi` | 6.1 | Mengubah kata sandi pengguna lain |
| `buat-akun` | 6.6 | Membuat pengguna baru pada sistem autentikasi |
| `nonaktifkan-akun` | 6.6 | Menonaktifkan akun sekaligus mengakhiri sesinya |

Penambahan di luar daftar ini memerlukan revisi PRD yang tercatat.

## 2.3 Spesifikasi Fungsi Tepi `reset-kata-sandi`

**Masukan**

```json
{ "user_id_sasaran": "uuid" }
```

**Keluaran berhasil**

```json
{ "kata_sandi_sementara": "Kn7pRx4mTq2w" }
```

**Urutan langkah, mengikat**

| No | Langkah | Catatan |
| --- | --- | --- |
| 1 | Baca token pemanggil dari kepala `Authorization`, sahkan identitasnya | Memakai klien ber-kunci publik, bukan `service_role` |
| 2 | Tolak bila token tidak sah | Kode 401 |
| 3 | Dengan klien ber-`service_role`, baca baris `users` milik pemanggil: peran, unit_id, aktif | |
| 4 | Tolak bila pemanggil tidak aktif | Kode 403 |
| 5 | Baca baris `users` milik sasaran: peran, unit_id | Tolak bila tidak ditemukan, kode 404 |
| 6 | **Periksa kewenangan menurut BR-15** | Rinciannya di bawah |
| 7 | Bangkitkan Kata Sandi Sementara | Aturannya di bawah |
| 8 | Ubah kata sandi sasaran lewat Admin API | |
| 9 | Setel `wajib_ganti_sandi = true` pada baris sasaran | |
| 10 | Hapus baris `perangkat_masuk` milik sasaran | Perangkat lama kehilangan hak tulis seketika, lihat Bagian 3 |
| 11 | Sisipkan baris `jejak_audit` bertipe `reset_sandi` | **Tanpa** memuat kata sandinya |
| 12 | Kembalikan Kata Sandi Sementara | Ditampilkan sekali, lihat KP-6.1-39 |

**Pemeriksaan kewenangan pada langkah 6**

```
peran_pemanggil = 'kasubdit'      → diizinkan untuk sasaran mana pun
peran_pemanggil = 'pemeliharaan'  → diizinkan untuk sasaran mana pun
peran_pemanggil = 'kanit'         → diizinkan HANYA bila
                                      peran_sasaran ∈ {'anggota','panit'}
                                      DAN unit_id_sasaran = unit_id_pemanggil
selain itu                        → tolak, kode 403
```

**Aturan pembangkitan Kata Sandi Sementara**

- Panjang dua belas karakter
- Hanya huruf dan angka, tanpa lambang
- **Karakter yang mudah tertukar dibuang:** angka nol, huruf O besar, angka satu, huruf I besar, huruf l kecil. Kata sandi ini disampaikan secara lisan atau lewat pesan singkat, dan satu karakter salah dengar berarti satu reset ulang
- Dibangkitkan dengan pembangkit acak kriptografis, bukan `Math.random()`

**Syarat keamanan yang mengikat**

- Kunci `service_role` disimpan sebagai rahasia Fungsi Tepi. **Dilarang** berada di berkas `.env` sisi klien, dilarang memakai awalan `NEXT_PUBLIC_`, dilarang masuk ke repositori
- Fungsi memeriksa sendiri kewenangan pemanggil dengan membaca basis data. **Dilarang** memercayai peran atau unit yang dikirim dalam badan permintaan
- Kata sandi dilarang muncul di catatan log dalam bentuk apa pun

## 2.4 Butir yang wajib diuji, bukan diasumsikan

Dokumentasi Supabase menyatakan bahwa sebuah sesi berakhir ketika penggunanya mengubah kata sandi. Yang **belum pasti** adalah apakah perubahan kata sandi yang dilakukan lewat Admin API oleh pihak lain memberi akibat yang sama.

Karena itu addendum ini **tidak** bersandar pada perilaku tersebut. Yang menjamin perangkat lama berhenti menulis adalah langkah 10, yaitu penghapusan baris `perangkat_masuk`, dipadu penegakan pada Bagian 3.4. Perilaku pengakhiran sesi diperlakukan sebagai bonus yang perlu diperiksa saat pengujian, dan dicatat sebagai butir uji U-6.1-07.

---
---

# Bagian 3 — Mekanisme pemaksaan keluar di perangkat lama

## 3.1 Dua kenyataan yang membatasi rancangan

**Pertama, pilihan bawaan tidak tersedia.** Supabase memiliki pengaturan "Single session per user" yang persis menjawab BR-16, tetapi pengaturan tersebut termasuk fasilitas berbayar pada paket Pro. Selain itu pemeriksaannya baru dijalankan ketika sesi disegarkan, bukan seketika saat masuk di perangkat lain. Proyek ini berjalan pada paket tanpa biaya sesuai Section 4.2, sehingga BR-16 wajib ditegakkan sendiri.

**Kedua, token tidak dapat dicabut seketika.** Ini sifat JWT dan berlaku di seluruh layanan yang memakainya. Saat sesi diakhiri, seluruh refresh token dihancurkan, tetapi access token yang sudah beredar tetap sah sampai waktu kedaluwarsanya yang tertulis di dalam token itu sendiri. Artinya, apa pun yang dilakukan, ada jendela waktu ketika perangkat lama masih memegang token yang sah.

Kesimpulannya: pencabutan token **tidak boleh** menjadi satu-satunya pengaman. Ia dipakai, tetapi penegakan yang menentukan berada di basis data.

## 3.2 Empat lapis

| Lapis | Fungsi | Kecepatan | Dapat gagal? |
| --- | --- | --- | --- |
| 1. Pencatatan | Menetapkan perangkat mana yang sah | Seketika | Tidak |
| 2. Pencabutan token | Mematikan kemampuan memperpanjang sesi | Seketika untuk refresh token | Tidak |
| 3. Deteksi di perangkat lama | Memberi tahu pengguna dan menutup Sesi Tugas dengan rapi | Beberapa detik | **Ya**, bila jaringan mati |
| 4. Penegakan basis data | Menolak penulisan dari perangkat yang bukan Perangkat Terdaftar | Seketika | Tidak |

Lapis 3 memberi pengalaman yang baik. Lapis 4 yang memberi jaminan.

## 3.3 Lapis 1 dan 2 — di perangkat baru, tepat setelah masuk

```javascript
// Penanda perangkat dibangkitkan sekali saat pemasangan pertama,
// lalu disimpan permanen di perangkat.
// BUKAN pengenal perangkat keras: dibatasi Android dan menyentuh ranah privasi.
async function penandaPerangkat() {
  let p = await Preferences.get({ key: 'penanda_perangkat' })
  if (!p.value) {
    p = { value: crypto.randomUUID() }
    await Preferences.set({ key: 'penanda_perangkat', value: p.value })
  }
  return p.value
}

// Dijalankan segera setelah masuk berhasil.
async function daftarkanPerangkat(userId) {
  const penanda = await penandaPerangkat()

  // LAPIS 1 — baris ini adalah satu-satunya sumber kebenaran
  // tentang perangkat mana yang sedang sah.
  await supabase.from('perangkat_masuk').upsert({
    user_id: userId,
    penanda_perangkat: penanda,
    keterangan_perangkat: await keteranganPerangkat(),
    masuk_pada: new Date().toISOString()
  }, { onConflict: 'user_id' })

  // LAPIS 2 — cabut refresh token seluruh sesi lain,
  // sesi perangkat ini sendiri dipertahankan.
  await supabase.auth.signOut({ scope: 'others' })

  await catatJejakAudit('geser_perangkat', { penanda_baru: penanda })
}
```

Dua catatan penting tentang `scope: 'others'`:

- Cakupan ini mengakhiri seluruh sesi selain sesi yang sedang berjalan, jadi perangkat baru tidak ikut terlempar keluar. Cakupan bawaannya adalah `global` yang justru akan mengeluarkan perangkat baru itu sendiri — **wajib ditulis eksplisit.**
- Pada cakupan ini tidak ada peristiwa keluar yang dibangkitkan, sehingga perangkat lama **tidak** akan tahu dari penyimak peristiwa autentikasi. Ia baru menyadari saat gagal memperpanjang sesi. Inilah alasan Lapis 3 diperlukan.

## 3.4 Lapis 4 — penegakan di basis data

Ini bagian yang paling menentukan dan paling mudah terlewat. Karena access token perangkat lama masih sah untuk sementara waktu, penulisan darinya harus ditolak oleh basis data, bukan oleh aplikasi.

**Kolom tambahan.** Setiap tabel operasional yang ditulis dari lapangan memuat penanda perangkat penulisnya:

```sql
alter table public.location_logs
  add column penanda_perangkat text not null;

alter table public.laporan_harian
  add column penanda_perangkat text not null;
```

Kolom ini sekaligus berguna sebagai keterangan asal data saat menelusuri kejadian di kemudian hari.

**Kebijakan penulisan.**

```sql
create policy "location_logs_tulis_hanya_dari_perangkat_terdaftar"
on public.location_logs
for insert
to authenticated
with check (
  anggota_id = (select auth.uid())
  and penanda_perangkat = (select sipantau_auth.perangkat_saya())
);

create policy "laporan_tulis_hanya_dari_perangkat_terdaftar"
on public.laporan_harian
for insert
to authenticated
with check (
  anggota_id = (select auth.uid())
  and penanda_perangkat = (select sipantau_auth.perangkat_saya())
);
```

Akibatnya berlaku seketika dan tidak bergantung pada apa pun:

- Perangkat lama menyisipkan titik koordinat → ditolak, sebab penandanya sudah tidak cocok
- Perangkat lama mengirim laporan → ditolak
- Baris `perangkat_masuk` dihapus akibat reset kata sandi → seluruh penulisan ditolak, sebab fungsi `perangkat_saya()` mengembalikan nilai kosong
- Perangkat lama membaca data → **masih bisa**, sampai access token-nya kedaluwarsa. Yang terbaca hanyalah data milik pengguna itu sendiri, sehingga risikonya diterima. Dicatat pada Section 8.5 sebagai kondisi tepi yang diketahui

## 3.5 Lapis 3 — deteksi di perangkat lama

```javascript
// Perangkat menyimak barisnya sendiri pada perangkat_masuk.
supabase
  .channel('perangkat-saya')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'perangkat_masuk', filter: `user_id=eq.${userId}` },
    async (payload) => {
      const penandaLokal = await penandaPerangkat()
      const digeser = payload.eventType === 'DELETE'
                   || payload.new.penanda_perangkat !== penandaLokal
      if (digeser) await tanganiPergeseran(payload.eventType)
    })
  .subscribe()

async function tanganiPergeseran(jenis) {
  // Urutannya mengikat: tutup Sesi Tugas dulu agar Rute tersimpan utuh.
  if (sedangDalamSesiTugas()) {
    await tutupSesiTugas({
      sebab: jenis === 'DELETE'
        ? 'Sesi ditutup karena kata sandi direset'
        : 'Sesi ditutup karena masuk di perangkat lain'
    })
  }
  await supabase.auth.signOut({ scope: 'local' })
  tampilkanHalamanMasuk('Akun Anda dipakai masuk di perangkat lain.')
}
```

Cadangan bila Realtime putus: pemeriksaan yang sama dijalankan setiap kali aplikasi kembali dari latar belakang, dengan membaca satu baris `perangkat_masuk`. Bila baris tidak ada atau penandanya berbeda, `tanganiPergeseran` dipanggil.

```sql
alter publication supabase_realtime add table public.perangkat_masuk;
```

## 3.6 Masa berlaku access token

| Pilihan | Jendela perangkat lama masih dapat membaca | Akibat |
| --- | --- | --- |
| 3600 detik (bawaan) | Sampai satu jam | Penyegaran paling jarang, paling hemat kuota dan daya |
| 900 detik | Sampai lima belas menit | Penyegaran empat kali lebih sering |

**Tetap pada 3600 detik.** Jendela tersebut hanya memengaruhi pembacaan data milik pengguna itu sendiri, sedangkan seluruh penulisan sudah tertutup Lapis 4. Memperpendeknya berarti menambah percobaan penyegaran pada perangkat lapangan yang justru sering kehilangan sinyal, dengan imbalan yang kecil.

Bila kelak pemilik produk menghendaki jendela lebih sempit, perubahannya hanya satu angka pada pengaturan Auth dan tidak menyentuh kode.

## 3.7 Akibat yang diterima

Seorang pengguna yang berganti-ganti antara dua perangkat harus masuk ulang setiap kali berpindah. Ini akibat langsung BR-16 dan bukan cacat. Bila di kemudian hari ternyata memberatkan, jalan keluarnya adalah meninjau ulang BR-16, bukan menambal mekanismenya.

---
---

# Bagian 4 — Koreksi terhadap berkas Revisi v0.3

## 4.1 KP-6.1-22 diganti

| | Rumusan |
| --- | --- |
| ~~Lama~~ | ~~Bila peran atau unit pengguna diubah saat ia sedang masuk, maka token disegarkan diam-diam, menu menyesuaikan di tempat, dan sebuah penanda kecil muncul.~~ |
| **Baru** | **Bila peran atau unit pengguna diubah saat ia sedang masuk, maka kewenangannya di tingkat basis data berlaku seketika pada kueri berikutnya tanpa penyegaran token apa pun, sebab peran tidak disimpan di dalam token. Menu di layar digambar ulang begitu perubahan baris `users` diterima lewat Realtime atau lewat pembacaan ulang saat aplikasi kembali ke depan, disertai penanda kecil berbunyi "Kewenangan Anda baru saja diperbarui." Pengguna tidak dikeluarkan.** |

## 4.2 Kriteria penerimaan tambahan

| Kode | Kriteria |
| --- | --- |
| KP-6.1-44 | Bila tampilan menu belum sempat menyesuaikan setelah perubahan peran dan pengguna menekan tombol yang sudah bukan kewenangannya, maka basis data menolak permintaan itu dan pengguna menerima pesan bahwa kewenangannya telah berubah, bukan galat teknis. |
| KP-6.1-45 | Bila Fungsi Tepi `reset-kata-sandi` dipanggil oleh peran yang tidak berwenang menurut BR-15, maka fungsi menolak dengan kode 403 meski pemanggil mengirim peran palsu di badan permintaan. |
| KP-6.1-46 | Bila perangkat yang bukan Perangkat Terdaftar mengirim titik koordinat atau laporan, maka basis data menolaknya, terlepas dari apakah token perangkat itu masih sah. |
| KP-6.1-47 | Bila Realtime terputus dan perangkat lama tidak menerima pemberitahuan pergeseran, maka pemeriksaan saat aplikasi kembali ke depan tetap mendeteksinya dan menjalankan penanganan yang sama. |

## 4.3 Aturan global tambahan

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-23 | Peran dan unit tidak disimpan di dalam token autentikasi. Seluruh pemeriksaan kewenangan di tingkat basis data membaca tabel `users` melalui fungsi bantu ber-`security definer` pada skema yang tidak diekspos ke API. | Seluruh modul |
| BR-24 | Fungsi Tepi hanya boleh dipakai untuk operasi yang mensyaratkan kunci `service_role`. Pemeriksaan kewenangan wajib ditegakkan ulang di dalam fungsi tersebut dengan membaca basis data, bukan memercayai isi permintaan. Kunci `service_role` dilarang berada di sisi klien dalam bentuk apa pun. | 6.1, 6.6 |
| BR-25 | Setiap penulisan ke tabel operasional wajib menyertakan penanda perangkat, dan ditolak basis data bila tidak cocok dengan Perangkat Terdaftar pemiliknya. | 6.1, 6.3, 6.4 |

## 4.4 Perubahan Section 5

| Tabel | Perubahan |
| --- | --- |
| `location_logs` | Kolom baru `penanda_perangkat text not null` |
| `laporan_harian` | Kolom baru `penanda_perangkat text not null` |

## 4.5 Tambahan Section 8.5 — kondisi tepi yang diketahui

- Perangkat yang sudah digeser masih dapat **membaca** data milik penggunanya sendiri sampai access token-nya kedaluwarsa. Penulisan sudah tertutup sejak detik pergeseran. Diterima sebagai batas yang melekat pada JWT, bukan cacat implementasi.

## 4.6 Tambahan Section 3.6 — Glosarium

| Istilah | Definisi tunggal |
| --- | --- |
| **Fungsi Tepi** | Fungsi tanpa server yang berjalan di dalam layanan backend terkelola dan disebarkan dari project yang sama. Dipakai hanya untuk operasi yang mensyaratkan kunci istimewa. Bukan server aplikasi terpisah. Dilarang disebut sebagai backend, API, atau server. |
| **Penanda Perangkat** | Untai acak yang dibangkitkan aplikasi sekali saat pemasangan pertama dan disimpan di perangkat. Bukan pengenal perangkat keras. |

---
---

# Bagian 5 — Daftar tempel dan urutan pengerjaan

## 5.1 Tempel ke PRD

| Urutan | Tujuan | Isi |
| --- | --- | --- |
| 1 | Section 4.5 butir pertama | Amandemen pada 2.2 |
| 2 | Section 3.6 | Dua istilah pada 4.6 |
| 3 | Section 5.4 dan 5.7 | Kolom pada 4.4 |
| 4 | Section 6.1.8 (baru) | Bagian 1, 2, dan 3 berkas ini seluruhnya |
| 5 | Section 6.1.3 | Ganti KP-6.1-22, tambah KP-6.1-44 sampai 47 |
| 6 | Section 7 | BR-23, BR-24, BR-25 |
| 7 | Section 8.5 | Butir pada 4.5 |

## 5.2 Urutan pengerjaan saat sesi coding

Urutan ini mengikat karena setiap langkah bersandar pada langkah sebelumnya.

| No | Langkah | Selesai bila |
| --- | --- | --- |
| 1 | Buat skema `sipantau_auth` dan empat fungsi bantu | Fungsi dapat dipanggil dari SQL Editor dan mengembalikan nilai yang benar |
| 2 | Buat tabel `unit`, `users`, `perangkat_masuk`, `jejak_audit` beserta indeks | Skema terbentuk, data semai masuk |
| 3 | Aktifkan aturan akses baris pada keempat tabel dan tulis kebijakannya | Uji dengan tiga akun berbeda peran, masing-masing hanya melihat yang seharusnya |
| 4 | Halaman masuk berbasis NRP dan alur email sintetis | Masuk berhasil, `terakhir_masuk` terisi |
| 5 | Penggantian Kata Sandi Sementara | Halaman buntu sampai kata sandi diganti |
| 6 | Pendaftaran perangkat dan `signOut({ scope: 'others' })` | Baris `perangkat_masuk` terbentuk dan berpindah dengan benar |
| 7 | Penyimakan Realtime pada `users` dan `perangkat_masuk` | Perubahan peran terlihat di layar tanpa muat ulang |
| 8 | Fungsi Tepi `reset-kata-sandi` | Kanit dapat mereset di unitnya, ditolak di luar unitnya |
| 9 | Kunci Aplikasi PIN dan sidik jari | Terkunci setelah dua menit di latar belakang |
| 10 | Perlindungan halaman dan pengalihan | Tautan langsung ke halaman terlarang mengalihkan, bukan menampilkan galat |

## 5.3 Butir uji yang wajib dijalankan di perangkat sungguhan

Bukan di peramban komputer. Sebagian hanya muncul pada perangkat Android sungguhan dengan jaringan yang tidak stabil.

| Kode | Butir uji | Yang dibuktikan |
| --- | --- | --- |
| U-6.1-01 | Ubah peran seorang pengguna dari Kasubdit sementara pengguna itu sedang membuka aplikasi | Menu berubah tanpa keluar, dan tombol lama sudah ditolak basis data |
| U-6.1-02 | Nonaktifkan akun yang sedang dalam Sesi Tugas | Sesi Tugas tertutup, Rute utuh, pengguna kembali ke halaman masuk |
| U-6.1-03 | Masuk di telepon kedua sementara telepon pertama masih terbuka | Telepon pertama keluar dengan pesan netral |
| U-6.1-04 | Ulangi U-6.1-03 dengan telepon pertama dalam keadaan mode pesawat, lalu nyalakan jaringannya | Deteksi tetap terjadi saat jaringan kembali, dan penulisan tertunda ditolak |
| U-6.1-05 | Kanit mereset kata sandi Anggota di unit lain | Ditolak dengan kode 403 |
| U-6.1-06 | Panggil Fungsi Tepi langsung dari luar aplikasi dengan peran palsu di badan permintaan | Ditolak |
| U-6.1-07 | Periksa apakah sesi sasaran benar-benar berakhir setelah kata sandinya direset | Menentukan apakah langkah pada 2.4 perlu penanganan tambahan |
| U-6.1-08 | Buka aplikasi setelah tiga jam tanpa dipakai | Masih dalam keadaan masuk, sesuai AM-6.1-07 |
| U-6.1-09 | Panit tanpa penugasan membuka aplikasi | Kondisi kosong tampil, bukan layar kosong atau galat |
| U-6.1-10 | Sisipkan titik koordinat lewat alat luar dengan penanda perangkat yang salah | Ditolak basis data |

---

## Penutup

Setelah addendum ini ditempel, Modul 6.1 tidak lagi menyisakan titik yang mengharuskan AI Agent menebak. Setiap kriteria penerimaan memiliki jalur teknis yang tertulis, dan setiap jalur teknis memiliki batas yang dinyatakan terus terang, termasuk yang tidak dapat diatasi seperti masa berlaku access token.

Satu butir sengaja dibiarkan terbuka dan ditandai sebagai butir uji, bukan asumsi: perilaku pengakhiran sesi setelah reset kata sandi lewat Admin API. Rancangan ini tidak bersandar padanya, sehingga hasil pengujian apa pun tidak akan membatalkan apa yang sudah dibangun.


---
---
