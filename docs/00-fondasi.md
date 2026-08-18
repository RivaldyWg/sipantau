# SiPANTAU — Fondasi

**Wajib dibuka pada setiap sesi koding.** Memuat aturan main (Section 0), peran dan
hak akses (Section 2), glosarium (Section 3), arsitektur (Section 4), model data
(Section 5), Business Rules (Section 7), keamanan (Section 9), dan di luar cakupan
(Section 12).

> Section 6.1 sampai 6.4, 6.6, dan 6.9 di berkas ini berstatus **kerangka** dan sudah
> digantikan berkas modulnya masing-masing. Jangan dipakai.

---
---

**DOKUMEN KEBUTUHAN PRODUK**

**SiPANTAU**

Sistem Pengawasan Anggota Terpadu

dalam Pelaksanaan Penyelidikan Lapangan

**Unit I Subdit IV Ditreskrimsus Polda Jawa Barat**

**Versi kerangka 0.2**

Dokumen kerja · Disusun untuk dikonsumsi AI Agent Code

*Bersifat internal --- tidak untuk disebarluaskan*

**Kendali Dokumen**

  ---------------------- ------------------------------------------------------------------------------------------------------------------
  **Nama produk**        SiPANTAU --- Sistem Pengawasan Anggota Terpadu

  **Pemilik produk**     Kanit I Subdit IV / Tipidter Ditreskrimsus Polda Jawa Barat (Action Leader Pelatihan Kepemimpinan Administrator)

  **Lingkup pengguna**   Subdit IV Ditreskrimsus Polda Jawa Barat

  **Versi dokumen**      0.2 (kerangka penuh)

  **Status**             Kerangka --- belum digali per modul

  **Pembaca utama**      AI Agent Code (pembangun sistem)

  **Pembaca sekunder**   Developer, pemilik produk

  **Bahasa**             Indonesia
  ---------------------- ------------------------------------------------------------------------------------------------------------------

**Riwayat Revisi**

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Versi**   **Status**   **Perubahan**
  ----------- ------------ ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0.1         Digantikan   Kerangka awal 12 section. Tiga peran (Kanit, Panit, Anggota). Belum memuat modul dokumentasi foto, kolase, dan LHP.

  0.2         Berlaku      Peran menjadi empat (Kasubdit, Kanit, Panit, Anggota) dengan lingkup dan wewenang final. Ditambah Modul 6.7 (Dokumentasi Foto & Kolase Berkop), Modul 6.8 (LHP Ringkas Otomatis), dan Modul 6.9 (Notifikasi). Ditetapkan konsep tiga lapis pelaporan. Ditambah Prinsip Ekstensibilitas dan Prinsip Non-Menghakimi pada Section 0. Butir konfirmasi klien didaftar pada Lampiran A.
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+---------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Cara memakai dokumen ini**                                                                                                                                  |
|                                                                                                                                                               |
| Dokumen ini adalah kerangka. Setiap section sudah memiliki tempat yang jelas untuk setiap keputusan, tetapi belum digali sampai tingkat terkecil.             |
|                                                                                                                                                               |
| Tahap berikutnya adalah menggali satu modul dalam satu waktu (lihat Section 6.0), lalu menyatukan hasilnya kembali ke dokumen ini sehingga menjadi PRD final. |
|                                                                                                                                                               |
| Dokumen ini boleh diubah kapan saja. Penambahan modul di masa depan cukup menambah nomor baru pada Section 6 tanpa menulis ulang section lain.                |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Daftar Isi**

  -------- --------------------------------------------------------------
  **0**    Meta & Panduan Baca

  **1**    Ringkasan Produk

  **2**    Pengguna & Peran

  **3**    Glosarium & Istilah Baku

  **4**    Arsitektur Sistem & Tech Stack

  **5**    Model Data

  **6**    Modul Fungsional

  **7**    Business Rules Global

  **8**    Edge Case & Error State

  **9**    Keamanan & Row Level Security

  **10**   Kebutuhan Non-Fungsional

  **11**   Alur Aplikasi & Packaging

  **12**   Di Luar Cakupan

  **A**    Lampiran A --- Butir yang Perlu Dikonfirmasi ke Klien

  **B**    Lampiran B --- Daftar Keputusan yang Sudah Final
  -------- --------------------------------------------------------------

**0. Meta & Panduan Baca**

Section ini mengatur bagaimana seluruh dokumen dibaca dan diterjemahkan menjadi kode. Aturan di sini berlaku untuk semua section berikutnya.

**0.1 Pembaca dokumen**

Dokumen ini ditulis untuk dikonsumsi AI Agent Code, bukan pembaca awam. Konsekuensinya, seluruh isi ditulis eksplisit dan tidak boleh menyisakan ruang tafsir. Setiap aturan harus dapat diterjemahkan langsung menjadi logika kode tanpa perlu menebak maksud penulis.

Bila menemukan bagian yang belum cukup jelas untuk diimplementasikan, AI Agent tidak boleh mengarang asumsi sendiri. Bagian tersebut harus dilaporkan sebagai pertanyaan terbuka, bukan diisi dengan perkiraan.

**0.2 Konsistensi istilah**

Gunakan hanya istilah baku yang terdaftar pada Section 3. Sinonim dilarang karena berisiko dibaca sebagai entitas berbeda. Contoh: selalu tulis "Anggota", jangan diganti menjadi "user", "personel", atau "member". Konsistensi ini berlaku pada nama tabel, nama variabel, label antarmuka, dan isi dokumen.

**0.3 Prioritas bila terjadi konflik**

Jika ada dua aturan yang bertentangan, urutan kekuatannya adalah sebagai berikut, dari yang paling menang:

-   Business Rules Global (Section 7)

-   Keamanan & Row Level Security (Section 9)

-   Deskripsi modul (Section 6)

-   Bagian naratif lain

Aturan pada Section 7 dan 9 tidak boleh dilanggar oleh implementasi modul mana pun.

**0.4 Penanda status**

Setiap section diberi penanda agar jelas mana yang sudah matang dan mana yang belum:

  ------------------------------------------------------------------------------------------------------------------
  **Penanda**                  **Arti**
  ---------------------------- -------------------------------------------------------------------------------------
  \[KERANGKA\]                 Struktur sudah ada, isi belum digali. Belum boleh dijadikan dasar implementasi.

  \[DETAIL\]                   Sudah digali, sedang ditinjau. Boleh dijadikan dasar implementasi dengan hati-hati.

  \[FINAL\]                    Sudah disepakati dan terkunci. Boleh langsung diimplementasikan.

  \[PERLU KONFIRMASI KLIEN\]   Menunggu jawaban pemilik produk. Implementasi ditunda sampai terjawab.
  ------------------------------------------------------------------------------------------------------------------

Pada versi 0.2 ini, seluruh Section 6 masih berstatus \[KERANGKA\], kecuali butir-butir yang sudah dinyatakan final dan didaftar pada Lampiran B.

**0.5 Prinsip Ekstensibilitas**

Sistem wajib dibangun modular. Prinsip ini mengikat dan berlaku untuk seluruh implementasi:

-   **Batas modul jelas.** Setiap modul memiliki tanggung jawab tunggal dan tidak mencampuri urusan modul lain.

-   **Penambahan tidak merusak.** Menambah fitur atau modul baru di masa depan tidak boleh mengharuskan penulisan ulang modul yang sudah berjalan.

-   **Skema database bersifat incremental.** Perubahan dilakukan dengan menambah tabel atau kolom baru, bukan membongkar dan menyusun ulang skema yang sudah berisi data.

-   **Komponen antarmuka berdiri sendiri.** Satu halaman atau satu bagian antarmuka dibangun sebagai komponen terpisah agar dapat diubah tanpa merembet.

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Alasan prinsip ini ditegaskan**                                                                                                                                                                                                                                 |
|                                                                                                                                                                                                                                                                   |
| Pemilik produk merencanakan penambahan fitur secara bertahap setelah sistem berjalan. Modularitas tidak muncul dengan sendirinya, ia harus disengaja sejak baris kode pertama. Bila diabaikan, penambahan fitur kecil dapat memaksa pembangunan ulang menyeluruh. |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**0.6 Prinsip Non-Menghakimi**

Sistem menyajikan data dan fakta apa adanya. Sistem tidak menyimpulkan pelanggaran, tidak memberi skor, dan tidak melabeli seseorang sebagai bermasalah. Penilaian sepenuhnya dilakukan manusia, yaitu Panit, Kanit, atau Kasubdit sesuai kewenangannya.

Prinsip ini berlaku lintas modul dan memengaruhi cara data ditampilkan. Contoh penerapannya:

-   Status lokasi ditulis "Terakhir terlihat 40 menit lalu", bukan "Anggota tidak melaksanakan tugas".

-   Laporan tanpa koordinat ditandai "Lokasi tidak terekam" disertai alasan yang dipilih Anggota, bukan ditolak atau dicap palsu.

-   Foto dari galeri dilabeli "Foto lampiran" secara netral, bukan "tidak sah".

**0.7 Cara memberi dokumen ini kepada AI Agent**

Saat membangun sistem, jangan berikan seluruh dokumen sekaligus lalu meminta seluruh sistem dibuat dalam satu langkah. Cara yang benar:

-   Berikan Section 0 sampai 5 sebagai konteks tetap. Bagian ini menjelaskan aturan main, peran, arsitektur, dan model data.

-   Tambahkan satu modul dari Section 6 yang sedang dikerjakan.

-   Sertakan Section 7 dan 9 karena keduanya mengikat semua modul.

-   Nyatakan secara eksplisit: ambil gaya visual dari prototype HTML yang sudah ada, jangan membuat desain baru dari nol.

-   Nyatakan secara eksplisit: jangan mengubah modul lain yang sudah selesai.

**1. Ringkasan Produk**

**1.1 Visi produk**

SiPANTAU menjadikan seluruh kegiatan penyelidikan lapangan terekam, terpantau, dan dapat dipertanggungjawabkan secara digital, sekaligus meringankan pekerjaan administratif Anggota di lapangan.

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Catatan strategis**                                                                                                                                                                                                                        |
|                                                                                                                                                                                                                                              |
| Visi ini sengaja memuat dua sisi. Sisi pertama adalah kepentingan pimpinan, yaitu pengawasan. Sisi kedua adalah kepentingan Anggota, yaitu pelaporan yang lebih ringan lewat LHP Ringkas otomatis.                                           |
|                                                                                                                                                                                                                                              |
| Keseimbangan ini penting untuk tingkat adopsi. Sistem yang hanya menguntungkan pimpinan cenderung ditolak pemakainya. Sistem yang juga meringankan Anggota akan dipakai secara sukarela, dan data pengawasan ikut terekam sebagai akibatnya. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**1.2 Pernyataan masalah**

Pengawasan Panit dan Kanit terhadap Anggota dalam pelaksanaan tugas penyelidikan lapangan belum berjalan maksimal pada fungsi pengendalian, supervisi, dan monitoring. Dalam sejumlah kegiatan penyelidikan tertutup, perwira yang ditunjuk tidak melekat langsung dengan Anggota di lapangan.

Kondisi tersebut membuka peluang penyalahgunaan wewenang, antara lain kegiatan di luar objek dan sasaran surat perintah tugas, serta permintaan sejumlah uang kepada pihak yang berkaitan dengan perkara. Akibatnya muncul pengaduan masyarakat yang mencoreng nama baik institusi.

Selain itu, pelaporan berjalan melalui percakapan pesan singkat. Laporan tersebut tidak terekam sebagai arsip sistem, sulit ditelusuri kembali, dan tidak memiliki bukti waktu maupun lokasi.

**Data pendukung**

  ------------------------------------------------------------------------------------------------------------------------------
  **Indikator**                                                                        **Angka**
  ------------------------------------------------------------------------------------ -----------------------------------------
  Pelanggaran Anggota dalam penanganan penyelidikan lapangan (Januari s.d. Mei 2026)   5 perkara

  Pengaduan masyarakat terhadap Subdit IV                                              6 laporan

  Jumlah personel Subdit IV berdasarkan kondisi riil                                   57 orang (Pamen 3, Pama 11, Bintara 43)
  ------------------------------------------------------------------------------------------------------------------------------

**1.3 Tujuan produk**

  ----------------------------------------------------------------------------------------------------------------------------------
  **No**   **Tujuan**                            **Wujud dalam sistem**
  -------- ------------------------------------- -----------------------------------------------------------------------------------
  1        Digitalisasi surat perintah tugas     SPT diterbitkan, disimpan, dan ditelusuri di dalam sistem (Modul 6.2)

  2        Pelaporan yang terekam                Seluruh laporan masuk sistem, tidak ada jalur di luar sistem (Modul 6.3, BR-04)

  3        Pemantauan posisi saat bertugas       Tracking selama Sesi Tugas dan peta waktu nyata (Modul 6.4)

  4        Bukti kegiatan yang kredibel          Foto berstempel waktu dan koordinat dari kamera aplikasi (Modul 6.7)

  5        Meringankan pekerjaan administratif   LHP Ringkas dibuat dari formulir, lalu diekspor menjadi dokumen resmi (Modul 6.8)

  6        Mempercepat keputusan pimpinan        Dashboard sesuai lingkup masing-masing peran (Modul 6.5)
  ----------------------------------------------------------------------------------------------------------------------------------

**1.4 Metrik keberhasilan**

Ukuran berikut dipakai untuk menilai apakah sistem berhasil, bukan sekadar selesai dibangun. Angka target diisi bersama pemilik produk saat modul digali.

  ------------------------------------------------------------------------------------------------------------------------------------------------------
  **Metrik**                                        **Cara ukur**                                                              **Target**
  ------------------------------------------------- -------------------------------------------------------------------------- -------------------------
  Porsi pelaporan yang melalui sistem               Jumlah laporan di sistem dibanding total laporan yang diketahui pimpinan   Diisi saat modul digali

  Kelengkapan jejak lokasi per SPT                  Persentase SPT yang memiliki rute Tracking                                 Diisi saat modul digali

  Porsi laporan berstatus terverifikasi di lokasi   Perbandingan laporan terverifikasi dan laporan tanpa lokasi                Diisi saat modul digali

  Waktu pimpinan mengetahui perkembangan            Selisih waktu kejadian lapangan dan waktu laporan diterima                 Diisi saat modul digali

  Pemakaian LHP Ringkas                             Jumlah LHP yang dibuat lewat sistem per bulan                              Diisi saat modul digali
  ------------------------------------------------------------------------------------------------------------------------------------------------------

**1.5 Batasan proyek**

-   **Sifat aplikasi.** Internal institusi, tidak dipublikasikan ke toko aplikasi umum.

-   **Distribusi.** Berkas aplikasi Android dibagikan langsung ke Anggota, dipasang secara manual.

-   **Sumber daya.** Dikerjakan dengan sumber daya terbatas, sehingga layanan yang dipilih mengutamakan yang tidak berbiaya pada tahap pengembangan.

-   **Waktu.** Mengikuti jadwal aksi perubahan pemilik produk. Tanggal rinci diisi saat perencanaan pelaksanaan.

-   **Platform.** Fokus Android dan peramban. Versi iOS tidak dibuat pada tahap ini.

**2. Pengguna & Peran**

Sistem mengenal empat peran. Peran menentukan menu yang muncul, tindakan yang boleh dilakukan, dan yang paling penting, seberapa luas data yang boleh dilihat.

**2.1 Daftar peran**

  ----------------------------------------------------------------------------
  **Peran**      **Posisi**           **Lingkup data**
  -------------- -------------------- ----------------------------------------
  **Kasubdit**   Pimpinan Subdit IV   Seluruh unit di bawah Subdit IV

  **Kanit**      Kepala Unit          Unit yang dipimpinnya saja

  **Panit**      Perwira Unit         Tim di dalam unitnya

  **Anggota**    Pelaksana lapangan   Penugasan dan laporan miliknya sendiri
  ----------------------------------------------------------------------------

**2.2 Deskripsi dan konteks tiap peran**

**Kasubdit**

Pimpinan tertinggi dalam lingkup sistem. Menggunakan sistem terutama untuk memantau kinerja seluruh unit dan menyiapkan rekapitulasi. Dua kewenangan bersifat eksklusif miliknya, yaitu manajemen akun pengguna dan rekapitulasi lintas unit. Kasubdit tidak menerbitkan SPT.

Perangkat yang dipakai umumnya komputer atau tablet di ruang kerja, sehingga tampilan untuk peran ini diutamakan pada layar lebar.

**Kanit**

Kepala unit dan satu-satunya peran yang berwenang menerbitkan SPT. Memantau seluruh kegiatan penyelidikan di unitnya, meninjau laporan, dan menutup penugasan yang telah selesai. Kanit tidak dapat melihat data unit lain dan tidak dapat mengelola akun pengguna.

Perangkat yang dipakai bervariasi antara komputer di ruang kerja dan telepon genggam saat berada di luar kantor, sehingga tampilan harus nyaman pada kedua ukuran layar.

**Panit**

Perwira unit yang berperan sebagai pengawas dan peninjau. Membaca laporan yang masuk dari Anggota, memberi catatan atau arahan, dan memantau posisi tim saat bertugas. Panit tidak menerbitkan SPT.

**Anggota**

Pelaksana penyelidikan di lapangan dan pemakai paling sering. Membuka Sesi Tugas, mengirim laporan kegiatan harian, mengambil foto dokumentasi, dan menyusun LHP Ringkas setelah kegiatan selesai. Hanya dapat melihat penugasan dan laporan miliknya sendiri.

Perangkat yang dipakai adalah telepon genggam di lapangan, sering dalam kondisi sinyal lemah, cahaya terang, dan baterai terbatas. Seluruh tampilan untuk peran ini dirancang mengutamakan layar kecil.

**2.3 Matriks hak akses**

Tabel ini mengikat. Implementasi Row Level Security pada Section 9 harus sejalan dengan isinya.

  ----------------------------------------------------------------------------------------------------------------------------
  **Kemampuan**                          **Kasubdit**         **Kanit**            **Panit**          **Anggota**
  -------------------------------------- -------------------- -------------------- ------------------ ------------------------
  Melihat dashboard                      Semua unit           Unit sendiri         Tim unit           Milik sendiri

  Menerbitkan SPT                        Tidak                **Ya (eksklusif)**   Tidak              Tidak

  Menugaskan Anggota ke SPT              Tidak                Perlu konfirmasi     Perlu konfirmasi   Tidak

  Melihat daftar SPT                     Semua unit           Unit sendiri         Unit sendiri       Yang ditujukan padanya

  Mengubah dan menutup SPT               Tidak                Ya (unit sendiri)    Tidak              Tidak

  Membuka dan menutup Sesi Tugas         Tidak                Tidak                Tidak              **Ya**

  Mengirim Pelaporan Kegiatan Harian     Tidak                Tidak                Tidak              **Ya**

  Meninjau dan memberi catatan laporan   Semua unit           Unit sendiri         Tim unit           Tidak

  Menyusun LHP Ringkas                   Tidak                Tidak                Tidak              **Ya**

  Melihat LHP Ringkas                    Semua unit           Unit sendiri         Tim unit           Milik sendiri

  Mengekspor LHP ke PDF dan Word         Ya                   Ya                   Ya                 Miliknya sendiri

  Melihat peta Tracking waktu nyata      Semua unit           Unit sendiri         Tim unit           Posisi sendiri

  Melihat rute per SPT                   Semua unit           Unit sendiri         Tim unit           Rute sendiri

  Mengekspor Kolase foto                 Ya                   Ya                   Ya                 Tidak

  Rekapitulasi lintas unit               **Ya (eksklusif)**   Tidak                Tidak              Tidak

  Manajemen akun pengguna                **Ya (eksklusif)**   Tidak                Tidak              Tidak
  ----------------------------------------------------------------------------------------------------------------------------

**2.4 Hierarki dan pewarisan lingkup data**

Lingkup data bersifat menurun. Peran yang lebih tinggi melihat seluruh data peran di bawahnya dalam lingkupnya, tetapi tidak otomatis mewarisi kewenangan tindakan.

  ------------------------------------------------------------------------------------------------------------------------------------------
  **Peran**         **Melihat data milik**                                **Catatan penting**
  ----------------- ----------------------------------------------------- ------------------------------------------------------------------
  Kasubdit          Seluruh unit, seluruh Kanit, Panit, dan Anggota       Lingkup data paling luas, tetapi tidak berwenang menerbitkan SPT

  Kanit             Unitnya sendiri: Panit dan Anggota di unit tersebut   Tidak dapat melihat unit lain sekalipun sebagai pembanding

  Panit             Anggota dalam timnya di unit yang sama                Tidak dapat menerbitkan SPT

  Anggota           Hanya miliknya sendiri                                Tidak dapat melihat penugasan atau laporan Anggota lain
  ------------------------------------------------------------------------------------------------------------------------------------------

+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Perbedaan lingkup data dan kewenangan tindakan**                                                                                                                                       |
|                                                                                                                                                                                          |
| Kedua hal ini terpisah dan tidak boleh dicampur saat implementasi. Kasubdit memiliki lingkup data terluas, tetapi kewenangan menerbitkan SPT justru hanya ada pada Kanit.                |
|                                                                                                                                                                                          |
| Artinya, pemeriksaan izin harus dilakukan dua kali: pertama memeriksa apakah peran boleh melakukan tindakan tersebut, kedua memeriksa apakah data yang disentuh berada dalam lingkupnya. |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**2.5 Butir yang belum ditetapkan**

+-------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\] Penugasan Anggota ke SPT**                                                           |
|                                                                                                                   |
| SPT diterbitkan oleh Kanit. Belum ditetapkan siapa yang menentukan Anggota mana yang masuk ke dalam SPT tersebut. |
|                                                                                                                   |
| Kemungkinan pertama, Kanit sekaligus menetapkan Anggota saat menerbitkan SPT.                                     |
|                                                                                                                   |
| Kemungkinan kedua, Kanit menerbitkan SPT dan Panit yang membagi Anggota ke dalamnya.                              |
|                                                                                                                   |
| Ditunda ke penggalian Modul 6.2. Sampai terjawab, implementasi bagian ini ditahan.                                |
+-------------------------------------------------------------------------------------------------------------------+

**3. Glosarium & Istilah Baku**

Setiap istilah di bawah ini memiliki satu makna tunggal. Dilarang memakai sinonim di bagian mana pun, termasuk pada nama tabel, nama variabel, dan label antarmuka. Bila sebuah istilah baru muncul saat penggalian modul, istilah tersebut wajib didaftarkan di sini terlebih dahulu.

**3.1 Istilah peran**

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**      **Definisi tunggal**
  ---------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kasubdit**     Peran tertinggi dalam sistem. Pimpinan Subdit IV. Lingkup data seluruh unit. Pemegang eksklusif manajemen akun pengguna dan rekapitulasi lintas unit. Tidak menerbitkan SPT.

  **Kanit**        Kepala Unit. Lingkup data unitnya sendiri. Satu-satunya peran yang berwenang menerbitkan SPT.

  **Panit**        Perwira Unit. Pengawas dan peninjau laporan di dalam unitnya. Tidak menerbitkan SPT.

  **Anggota**      Pelaksana penyelidikan di lapangan. Lingkup data miliknya sendiri. Dilarang diganti dengan kata user, personel, atau member.
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.2 Istilah penugasan dan kegiatan**

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**         **Definisi tunggal**
  ------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **SPT**             Surat Perintah Tugas. Satu penugasan penyelidikan yang diterbitkan Kanit. Memuat objek, sasaran, lokasi, prioritas, jangka waktu, dan daftar Anggota pelaksana.

  **Sesi Tugas**      Periode antara Anggota menekan Mulai Tugas hingga menekan Selesai Tugas. Tracking hanya berjalan di dalam periode ini. Satu Sesi Tugas selalu terikat pada satu SPT.

  **Mulai Tugas**     Tindakan Anggota membuka Sesi Tugas. Ditolak bila GPS tidak aktif atau izin lokasi tidak diberikan.

  **Selesai Tugas**   Tindakan Anggota menutup Sesi Tugas. Menghentikan Tracking.

  **Prioritas**       Tingkat kepentingan SPT. Tiga nilai: Normal, Penting, Urgent.

  **Status SPT**      Kondisi penugasan. Empat nilai: Baru, Berjalan, Selesai, Bermasalah.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.3 Istilah lokasi**

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**                   **Definisi tunggal**
  ----------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Tracking**                  Pengiriman koordinat posisi Anggota ke sistem selama Sesi Tugas berlangsung. Tidak berjalan di luar Sesi Tugas.

  **Rute**                      Kumpulan titik koordinat yang terkumpul selama satu Sesi Tugas, tersimpan terikat pada SPT yang bersangkutan.

  **Terverifikasi di lokasi**   Status laporan atau foto yang koordinatnya berhasil direkam dan dianggap sah oleh sistem.

  **Lokasi tidak terekam**      Status laporan yang dikirim tanpa koordinat sah. Wajib disertai alasan yang dipilih Anggota. Bukan penolakan dan bukan tuduhan.

  **Terakhir terlihat**         Selisih waktu antara sekarang dan koordinat terakhir yang diterima sistem dari seorang Anggota.

  **Soft gate**                 Istilah internal dokumen ini untuk mekanisme boleh mengirim tetapi ditandai. Istilah ini tidak boleh muncul di antarmuka. Yang tampil bagi pemakai adalah label Lokasi tidak terekam.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.4 Istilah dokumentasi dan pelaporan**

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**                       **Definisi tunggal**
  --------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Foto lapangan terverifikasi**   Foto yang diambil langsung dari kamera di dalam aplikasi. Otomatis diberi tanda air berisi waktu, koordinat, dan nama lokasi.

  **Foto lampiran**                 Foto yang dipilih dari galeri perangkat. Tanpa tanda air karena waktu dan lokasinya tidak dapat dijamin. Label bersifat netral, bukan penilaian.

  **Tanda air**                     Teks berisi waktu, koordinat, dan nama lokasi yang ditanamkan pada gambar sebelum gambar dikompresi dan diunggah.

  **Kolase**                        Satu gambar gabungan berisi beberapa foto yang disusun dalam kisi, diberi kepala institusi di bagian atas. Dibuat sesuai permintaan, bukan otomatis saat pengiriman laporan.

  **Pelaporan Kegiatan Harian**     Laporan singkat berkala dari lapangan selama SPT berjalan. Lapis pertama pelaporan.

  **LHP Ringkas**                   Laporan Hasil Penyelidikan versi ringkas. Disusun Anggota melalui formulir terstruktur, lalu diekspor menjadi dokumen PDF berkop dan Word. Lapis kedua pelaporan. Merupakan keluaran resmi terakhir di dalam sistem.

  **LHP Resmi Lengkap**             Dokumen penyidikan penuh yang disusun manual oleh Anggota di luar sistem. Lapis ketiga pelaporan. Berada di luar cakupan sistem.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.5 Tiga lapis pelaporan**

Konsep ini mengikat dan menjadi dasar pemisahan Modul 6.3, Modul 6.8, dan Section 12.

  -------------------------------------------------------------------------------------------------------------------------------------
  **Lapis**   **Nama**                    **Waktu terjadi**                               **Posisi terhadap sistem**
  ----------- --------------------------- ----------------------------------------------- ---------------------------------------------
  1           Pelaporan Kegiatan Harian   Selama SPT berjalan, berulang                   Di dalam sistem (Modul 6.3)

  2           LHP Ringkas                 Setelah kegiatan selesai, sekali per kegiatan   Di dalam sistem (Modul 6.8)

  3           LHP Resmi Lengkap           Setelah LHP Ringkas, bila perkara berlanjut     Di luar sistem, disusun manual (Section 12)
  -------------------------------------------------------------------------------------------------------------------------------------

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Mengapa lapis ketiga sengaja dikeluarkan**                                                                                                                                                             |
|                                                                                                                                                                                                          |
| LHP Resmi Lengkap adalah dokumen penyidikan penuh yang menuntut pertimbangan hukum penyidik. Memasukkannya ke sistem akan membuat cakupan membengkak jauh melampaui waktu dan sumber daya yang tersedia. |
|                                                                                                                                                                                                          |
| AI Agent dilarang membangun fitur apa pun yang menyerupai penyusunan LHP Resmi Lengkap, sekalipun terlihat sebagai lanjutan alami dari Modul 6.8.                                                        |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**4. Arsitektur Sistem & Tech Stack**

**4.1 Gambaran arsitektur**

Sistem terdiri atas satu aplikasi sisi klien yang berkomunikasi dengan satu layanan backend terkelola, ditambah layanan peta pihak ketiga yang bersifat baca saja.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Lapisan**                **Peran dalam sistem**
  -------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------
  Aplikasi klien             Seluruh antarmuka pemakai. Dijalankan di peramban, dipasang sebagai aplikasi web progresif, atau dibungkus menjadi berkas aplikasi Android.

  Layanan backend            Autentikasi, basis data, penyimpanan berkas foto, dan pembaruan data waktu nyata. Tidak ada server aplikasi terpisah yang ditulis manual.

  Layanan peta               Penyedia ubin peta. Hanya dipakai untuk menampilkan latar peta. Tidak ada data penyelidikan yang dikirim ke layanan ini.

  Pelacakan latar belakang   Komponen pada bungkus aplikasi Android yang menjaga pengiriman koordinat tetap berjalan saat layar terkunci.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**4.2 Tumpukan teknologi**

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Lapisan**                **Teknologi**                                        **Alasan pemilihan**
  -------------------------- ---------------------------------------------------- -----------------------------------------------------------------------------------------------------------------
  Antarmuka                  Next.js dengan React dan TypeScript                  Satu kerangka kerja untuk halaman dan komponen, mendukung pemisahan modul yang rapi

  Penataan visual             Tailwind CSS                                         Penataan berbasis kelas, cepat dan konsisten dengan prototype yang sudah ada

  Backend dan basis data     Supabase (PostgreSQL)                                Menyediakan autentikasi, basis data, penyimpanan berkas, dan pembaruan waktu nyata tanpa menulis server sendiri

  Peta                        Leaflet dengan OpenStreetMap                         Ringan, tanpa biaya, cukup untuk kebutuhan menampilkan posisi dan rute

  Pembacaan posisi            Geolocation API peramban                             Tersedia langsung di peramban, dipakai untuk Tracking saat aplikasi aktif

  Pelacakan latar belakang   Capacitor dengan pengaya background geolocation      Menjaga pengiriman koordinat saat aplikasi tidak berada di layar depan

  Pembungkus aplikasi        Aplikasi web progresif dan berkas aplikasi Android   Dapat dipasang ke layar utama atau dibagikan sebagai berkas pemasangan

  Penempatan antarmuka       Vercel                                               Penempatan otomatis dari repositori, tanpa biaya pada skala ini

  Penempatan backend         Supabase Cloud                                       Terkelola penuh, tidak perlu mengurus server
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**4.3 Aturan pengambilan gaya visual**

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Aturan mengikat**                                                                                                                                                               |
|                                                                                                                                                                                   |
| Gaya visual diambil dari prototype HTML yang sudah tersedia: palet warna, jarak antar elemen, bentuk kartu, gaya lencana status, gaya tabel, dan tata letak bilah samping.        |
|                                                                                                                                                                                   |
| AI Agent dilarang membuat arah desain baru dari nol, mengganti palet warna, atau mengubah tata letak dasar tanpa permintaan eksplisit.                                            |
|                                                                                                                                                                                   |
| Bila muncul komponen yang belum ada di prototype, komponen tersebut dibuat mengikuti kaidah visual yang sudah berlaku di prototype, bukan mengikuti gaya bawaan pustaka mana pun. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**4.4 Kebijakan penanganan foto**

Urutan pemrosesan foto dari kamera aplikasi bersifat mengikat dan tidak boleh diubah urutannya:

-   Foto diambil melalui kamera di dalam aplikasi.

-   Sistem membaca koordinat dan waktu pada saat pengambilan.

-   Tanda air ditanamkan pada gambar.

-   Gambar dikompresi hingga paling besar 300 kilobita.

-   Gambar diunggah ke penyimpanan berkas.

Untuk foto dari galeri, langkah kedua dan ketiga dilewati karena waktu dan lokasi tidak dapat dijamin. Kompresi tetap dilakukan.

**4.5 Batasan arsitektur yang perlu diperhatikan**

-   **Tidak ada server aplikasi manual.** Seluruh logika data ditegakkan lewat aturan basis data dan aturan akses baris, bukan lewat kode server terpisah. Konsekuensinya, aturan keamanan pada Section 9 menjadi sangat menentukan.

-   **Ketergantungan pada layanan terkelola.** Bila layanan backend mengalami gangguan, seluruh sistem terpengaruh. Penanganan kondisi luring dibahas pada Section 8.2.

-   **Batas kuota layanan gratis.** Volume titik koordinat berpotensi cepat membesar. Strategi penyimpanan dan penyusutan data dibahas pada Section 5.9 dan Section 10.2.

**5. Model Data**

Section ini mendaftar seluruh entitas beserta kolom utamanya. Daftar kolom bersifat indikatif pada versi kerangka ini dan akan difinalkan saat modul terkait digali. Tipe data ditulis dalam istilah PostgreSQL.

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Aturan penamaan**                                                                                                                                                                   |
|                                                                                                                                                                                       |
| Nama tabel dan kolom ditulis dalam huruf kecil dengan pemisah garis bawah, memakai istilah Indonesia yang sama dengan Glosarium. Contoh: penugasan, laporan_harian, foto_dokumentasi. |
|                                                                                                                                                                                       |
| Setiap tabel wajib memiliki kolom identitas unik, kolom waktu pembuatan, dan kolom waktu perubahan terakhir. Ketiganya tidak diulang pada daftar di bawah agar tabel tetap ringkas.   |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**5.1 Tabel users**

Menyimpan seluruh akun pengguna dari empat peran, sekaligus posisi terakhir yang diketahui.

  --------------------------------------------------------------------------------------------------------------------------
  **Kolom**             **Tipe**       **Keterangan**
  --------------------- -------------- -------------------------------------------------------------------------------------
  nama                  text           Nama lengkap beserta gelar bila ada

  nrp                   text           Nomor registrasi pokok, unik

  pangkat               text           Pangkat kepolisian

  peran                 enum           Salah satu dari: kasubdit, kanit, panit, anggota

  unit                  text           Unit tempat pengguna bertugas

  aktif                 boolean        Penanda akun aktif atau dinonaktifkan

  sedang_bertugas       boolean        Menyala saat Sesi Tugas berjalan

  posisi_terakhir_lat   numeric        Lintang koordinat terakhir yang diterima

  posisi_terakhir_lng   numeric        Bujur koordinat terakhir yang diterima

  terakhir_terlihat     timestamptz    Waktu koordinat terakhir diterima, dasar penghitungan status hijau, kuning, abu-abu
  --------------------------------------------------------------------------------------------------------------------------

**5.2 Tabel penugasan**

Menyimpan SPT. Hanya Kanit yang boleh membuat baris pada tabel ini.

  ------------------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- --------------------------------------------------------------------
  nomor_spt          text           Nomor surat perintah tugas, unik

  judul               text           Judul penyelidikan

  objek               text           Objek penyelidikan

  sasaran             text           Sasaran kegiatan

  lokasi               text           Lokasi penugasan dalam bentuk teks

  lokasi_lat          numeric        Lintang titik sasaran, dipakai menghitung kedekatan lokasi laporan

  lokasi_lng          numeric        Bujur titik sasaran

  unit                 text           Unit pemilik penugasan, menentukan siapa yang boleh melihat

  prioritas            enum           normal, penting, urgent

  status                enum           baru, berjalan, selesai, bermasalah

  tanggal_mulai        date           Awal berlakunya penugasan

  tanggal_batas        date           Batas waktu penugasan

  diterbitkan_oleh     uuid           Mengacu ke users, wajib berperan kanit
  ------------------------------------------------------------------------------------------------------

**5.3 Tabel penugasan_anggota**

Menghubungkan satu SPT dengan beberapa Anggota. Satu SPT dapat memuat lebih dari satu Anggota, dan satu Anggota dapat terlibat dalam lebih dari satu SPT.

  --------------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- ----------------------------------------------------------------
  penugasan_id        uuid           Mengacu ke penugasan

  anggota_id           uuid           Mengacu ke users, wajib berperan anggota

  sesi_aktif           boolean        Menyala saat Anggota ini sedang dalam Sesi Tugas untuk SPT ini

  sesi_mulai           timestamptz    Waktu Mulai Tugas terakhir

  sesi_selesai         timestamptz    Waktu Selesai Tugas terakhir
  --------------------------------------------------------------------------------------------------

**5.4 Tabel laporan_harian**

Lapis pertama pelaporan. Laporan singkat berkala dari lapangan.

  -----------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- -------------------------------------------------------
  penugasan_id        uuid           SPT yang dilaporkan

  anggota_id           uuid           Pengirim laporan

  jenis                 enum           pulbaket awal, perkembangan, akhir

  uraian                text           Uraian kegiatan

  kendala               text           Kendala di lapangan, boleh kosong

  status_kegiatan       enum           berjalan, selesai, bermasalah

  lokasi_lat            numeric        Koordinat saat laporan dikirim, boleh kosong

  lokasi_lng            numeric        Koordinat saat laporan dikirim, boleh kosong

  status_lokasi         enum           terverifikasi, tidak_terekam

  alasan_lokasi         text           Wajib diisi bila status_lokasi bernilai tidak_terekam

  catatan_peninjau      text           Catatan dari Panit, Kanit, atau Kasubdit

  ditinjau_oleh         uuid           Mengacu ke users
  -----------------------------------------------------------------------------------------

**5.5 Tabel lhp**

Lapis kedua pelaporan. Formulir terstruktur yang menjadi dasar dokumen ekspor. Sebagian kolom terisi otomatis dari penugasan dan Sesi Tugas.

  -------------------------------------------------------------------------------------------
  **Kolom**               **Tipe**       **Keterangan**
  ----------------------- -------------- ----------------------------------------------------
  penugasan_id             uuid           SPT yang menjadi dasar

  disusun_oleh              uuid           Anggota penyusun

  dasar                     text           Dasar penugasan, terisi otomatis dari nomor SPT

  waktu_kegiatan            text           Waktu pelaksanaan, terisi otomatis dari Sesi Tugas

  tempat_kegiatan           text           Tempat atau lokasi kejadian

  perkara                   text           Uraian singkat perkara

  dasar_hukum                text           Pasal atau undang-undang yang disangkakan

  kronologis                 text           Uraian hasil kegiatan dan fakta lapangan

  langkah                    text           Langkah yang telah dilakukan

  rencana_tindak_lanjut     text           Rencana berikutnya

  kesimpulan                 text           Kesimpulan sementara

  catatan                    text           Catatan tambahan, boleh kosong

  status                     enum           draf, final
  -------------------------------------------------------------------------------------------

Bagian yang jumlahnya berubah-ubah tidak disimpan sebagai kolom teks, melainkan sebagai tabel anak agar dapat ditambah dan dikurangi:

  --------------------------------------------------------------------------------------------------------------
  **Tabel anak**       **Isi**
  -------------------- -----------------------------------------------------------------------------------------
  lhp_petugas           Daftar petugas pelaksana. Terisi otomatis dari Anggota pada SPT, masih dapat disunting.

  lhp_pihak              Daftar pelapor dan terlapor. Memuat peran pihak, nama, dan data pengenal bila ada.

  lhp_saksi               Daftar saksi yang diperiksa beserta kedudukannya.

  lhp_barang_bukti       Daftar barang bukti beserta keterangannya.
  --------------------------------------------------------------------------------------------------------------

+---------------------------------------------------------------------------------------------------------------------------------------------------+
| **Peringatan data sensitif**                                                                                                                      |
|                                                                                                                                                   |
| Tabel lhp dan tabel anaknya memuat data paling sensitif dalam sistem, antara lain identitas terlapor, nomor pengenal, dan uraian perkara.         |
|                                                                                                                                                   |
| Aturan akses baris untuk kelompok tabel ini harus disusun paling ketat. Rinciannya dibahas pada Section 9.                                        |
|                                                                                                                                                   |
| Terdapat butir kebijakan yang masih menunggu jawaban pemilik produk mengenai penyimpanan data ini pada layanan awan. Lihat Lampiran A butir A-02. |
+---------------------------------------------------------------------------------------------------------------------------------------------------+

**5.6 Tabel foto_dokumentasi**

  ----------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- ------------------------------------------------------------
  laporan_id           uuid           Laporan harian yang menaungi, boleh kosong

  lhp_id                uuid           LHP yang menaungi, boleh kosong

  penugasan_id          uuid           SPT terkait, selalu terisi

  diunggah_oleh          uuid           Anggota pengunggah

  sumber                  enum           kamera, galeri

  berkas_path             text           Lokasi berkas pada penyimpanan

  keterangan              text           Keterangan foto

  tanda_air_waktu         timestamptz    Waktu pengambilan, terisi hanya untuk sumber kamera

  tanda_air_lat            numeric        Lintang saat pengambilan, terisi hanya untuk sumber kamera

  tanda_air_lng            numeric        Bujur saat pengambilan, terisi hanya untuk sumber kamera

  tanda_air_lokasi         text           Nama lokasi hasil penerjemahan koordinat
  ----------------------------------------------------------------------------------------------

**5.7 Tabel location_logs**

Menyimpan titik-titik Rute selama Sesi Tugas. Tabel dengan pertumbuhan paling cepat, sehingga memerlukan perhatian khusus pada indeks dan penyusutan data.

  ------------------------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- --------------------------------------------------------------------------
  penugasan_id         uuid           SPT pemilik Rute. Wajib terisi, tidak ada titik tanpa konteks penugasan.

  anggota_id            uuid           Pemilik titik

  lat                    numeric        Lintang

  lng                    numeric        Bujur

  akurasi                 numeric        Perkiraan galat dalam meter

  direkam_pada             timestamptz    Waktu titik direkam di perangkat

  diterima_pada             timestamptz    Waktu titik diterima sistem, dapat berbeda bila pengiriman tertunda
  ------------------------------------------------------------------------------------------------------------

**5.8 Hubungan antar entitas**

  ---------------------------------------------------------------------------------------------------------------
  **Hubungan**                         **Jenis**        **Catatan**
  ------------------------------------ ---------------- ---------------------------------------------------------
  users ke penugasan                   satu ke banyak   Melalui kolom diterbitkan_oleh, hanya untuk peran kanit

  penugasan ke penugasan_anggota       satu ke banyak   Satu SPT dapat memuat beberapa Anggota

  users ke penugasan_anggota           satu ke banyak   Satu Anggota dapat terlibat di beberapa SPT

  penugasan ke laporan_harian          satu ke banyak   Beberapa laporan per SPT

  penugasan ke lhp                     satu ke banyak   Umumnya satu LHP per kegiatan, tidak dibatasi keras

  lhp ke tabel anak lhp                satu ke banyak   Petugas, pihak, saksi, dan barang bukti

  laporan_harian ke foto_dokumentasi   satu ke banyak   Beberapa foto per laporan

  lhp ke foto_dokumentasi              satu ke banyak   Foto dapat dilampirkan pada LHP

  penugasan ke location_logs           satu ke banyak   Rute selalu terikat pada SPT
  ---------------------------------------------------------------------------------------------------------------

**5.9 Kebijakan penyimpanan dan penyusutan data**

-   **Rute disimpan per penugasan.** Tidak ada pelacakan terus-menerus tanpa konteks. Setiap titik wajib memiliki penugasan_id.

-   **Foto disimpan satuan.** Foto tidak digabung saat pengiriman. Kolase dibentuk hanya saat diminta dan tidak mengubah berkas asli.

-   **Penyusutan location_logs.** Diperlukan aturan pengarsipan atau penghapusan titik lama agar volume terkendali. Ambang waktu dan mekanismenya ditetapkan saat Modul 6.4 digali.

-   **Data laporan dan LHP tidak dihapus otomatis.** Keduanya merupakan arsip kegiatan dan hanya dapat dihapus melalui tindakan yang tercatat pada jejak audit.

**6. Modul Fungsional**

Seluruh modul pada section ini masih berstatus \[KERANGKA\]. Yang tercantum di bawah adalah lingkup tanggung jawab tiap modul dan butir-butir yang sudah diputuskan. Rincian akan diisi saat modul digali satu per satu.

**6.0 Kerangka penggalian tiap modul**

Saat digali, setiap modul disusun memakai kerangka yang sama agar tidak ada bagian yang terlewat:

  ------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Bagian**                       **Isi yang harus ada**
  -------------------------------- ---------------------------------------------------------------------------------------------------------------------------
  Deskripsi                        Tanggung jawab modul dalam satu paragraf. Apa yang termasuk dan apa yang bukan urusannya.

  Cerita pengguna                  Ditulis dengan pola: sebagai \[peran\], saya ingin \[tindakan\], agar \[manfaat\]. Satu cerita untuk setiap kemampuan.

  Kriteria penerimaan              Kondisi terukur yang membuat modul dianggap benar. Ditulis dengan pola: bila \[kondisi\], maka \[hasil yang diharapkan\].

  Aturan modul                     Aturan yang hanya berlaku di modul ini. Aturan lintas modul ditulis di Section 7.

  Antarmuka dan kondisi tampilan   Halaman yang terlibat, kondisi kosong, kondisi memuat, kondisi galat, dan perbedaan tampilan antar peran.

  Edge case modul                  Kondisi tepi khusus modul ini. Kondisi tepi lintas modul ditulis di Section 8.

  Ketergantungan                   Modul lain yang harus selesai lebih dulu.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------

**6.1 Autentikasi & Peran**

Mengatur masuknya pengguna ke sistem dan penentuan peran. Menjadi fondasi seluruh modul lain karena setiap tampilan dan setiap akses data bergantung pada peran yang terdeteksi.

**Lingkup**

-   Masuk dan keluar sistem

-   Pembacaan peran dan unit pengguna yang sedang masuk

-   Perlindungan halaman berdasarkan peran, termasuk penanganan pengguna yang mencoba membuka halaman di luar kewenangannya

-   Pengelolaan sesi masuk, termasuk masa berlaku dan pembaruan otomatis

**Butir yang sudah final**

-   Terdapat empat peran: Kasubdit, Kanit, Panit, Anggota

-   Menu dan tombol yang tidak sesuai kewenangan tidak ditampilkan sama sekali, bukan ditampilkan dalam keadaan nonaktif

**Ketergantungan**

Tidak bergantung pada modul lain. Seluruh modul lain bergantung padanya, sehingga modul ini dikerjakan pertama.

**6.2 Manajemen Penugasan (SPT)**

Mengatur penerbitan, penyuntingan, dan penutupan SPT beserta penunjukan Anggota pelaksana.

**Lingkup**

-   Penerbitan SPT baru oleh Kanit

-   Penunjukan Anggota ke dalam SPT

-   Penyuntingan dan penutupan SPT

-   Daftar SPT dengan penyaring dan pencarian, mengikuti lingkup data tiap peran

-   Halaman rincian SPT, memuat keterangan penugasan, daftar Anggota pelaksana, dan rekam kegiatan

**Butir yang sudah final**

-   Hanya Kanit yang berwenang menerbitkan SPT

-   Prioritas memiliki tiga nilai: Normal, Penting, Urgent

-   Status memiliki empat nilai: Baru, Berjalan, Selesai, Bermasalah

-   Satu SPT dapat memuat lebih dari satu Anggota

**Butir yang menunggu keputusan**

+---------------------------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\]**                                                                                                        |
|                                                                                                                                       |
| Siapa yang menunjuk Anggota ke dalam SPT: Kanit sendiri saat menerbitkan, atau Panit setelah SPT terbit. Lihat Lampiran A butir A-01. |
+---------------------------------------------------------------------------------------------------------------------------------------+

**6.3 Pelaporan Kegiatan Harian & Foto**

Lapis pertama pelaporan. Laporan singkat berkala yang dikirim Anggota dari lapangan selama SPT berjalan, agar pimpinan mengetahui perkembangan tanpa menunggu kegiatan selesai.

**Lingkup**

-   Formulir laporan singkat: jenis laporan, uraian kegiatan, kendala, status kegiatan

-   Pelampiran foto pada laporan

-   Penetapan status lokasi laporan

-   Peninjauan laporan dan pemberian catatan oleh Panit, Kanit, atau Kasubdit

-   Riwayat laporan milik Anggota yang bersangkutan

**Butir yang sudah final**

-   Laporan dengan koordinat sah ditandai Terverifikasi di lokasi

-   Laporan tanpa koordinat sah tetap boleh dikirim, tetapi Anggota wajib memilih alasan, dan laporan ditandai Lokasi tidak terekam beserta alasannya

-   Tidak ada jalur pelaporan di luar sistem. Percakapan pesan singkat tidak diakui sebagai pelaporan resmi

-   Sistem tidak menolak dan tidak menuduh. Penilaian dilakukan manusia

**Yang perlu ditetapkan saat penggalian**

-   Daftar pilihan alasan saat lokasi tidak terekam

-   Ambang jarak yang membuat sebuah koordinat dianggap berada di lokasi tugas

-   Apakah laporan yang sudah terkirim dapat disunting, dan bila ya, dalam batas waktu berapa lama

**6.4 GPS Tracking & Peta Waktu Nyata**

Mengatur perekaman posisi Anggota selama Sesi Tugas dan penyajiannya di peta bagi pimpinan. Modul dengan aturan terbanyak dan kondisi tepi paling rumit.

**Lingkup**

-   Tombol Mulai Tugas dan Selesai Tugas pada sisi Anggota

-   Pengiriman koordinat selama Sesi Tugas, termasuk saat aplikasi berada di latar belakang

-   Penyimpanan Rute terikat pada SPT

-   Peta waktu nyata pada sisi pimpinan, menampilkan posisi Anggota yang sedang bertugas

-   Penelusuran Rute suatu SPT setelah kegiatan selesai

-   Penyajian status Terakhir terlihat

**Butir yang sudah final**

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Aturan**                      **Ketetapan**
  ------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Kapan Tracking berjalan         Hanya selama Sesi Tugas aktif. Di luar itu tidak ada perekaman posisi sama sekali.

  Syarat Mulai Tugas              GPS wajib aktif dan izin lokasi wajib diberikan. Bila tidak, Sesi Tugas tidak dapat dibuka.

  Frekuensi pengiriman            Gabungan jarak dan waktu. Koordinat dikirim bila perpindahan melebihi 25 meter, atau bila sudah lewat 30 detik sejak pengiriman terakhir, mana yang lebih dulu tercapai.

  Penyimpanan Rute                Per penugasan. Setiap titik wajib memiliki penugasan_id.

  Penentuan siapa yang bertugas   Ditentukan Anggota sendiri melalui tombol, bukan menyala otomatis.
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Penyajian status Terakhir terlihat**

  ----------------------------------------------------------------------------
  **Warna**      **Rentang waktu**     **Teks yang ditampilkan**
  -------------- --------------------- ---------------------------------------
  **Hijau**      Kurang dari 2 menit   Aktif

  **Kuning**     2 sampai 15 menit     Terakhir terlihat sekian menit lalu

  **Abu-abu**    Lebih dari 15 menit   Terakhir terlihat sekian waktu lalu
  ----------------------------------------------------------------------------

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Penerapan Prinsip Non-Menghakimi pada modul ini**                                                                                                                                          |
|                                                                                                                                                                                              |
| Status abu-abu tidak boleh diberi teks yang menyimpulkan kelalaian. Sistem hanya menyampaikan berapa lama koordinat terakhir diterima.                                                       |
|                                                                                                                                                                                              |
| Penyebab koordinat berhenti masuk bisa bermacam-macam: sinyal hilang, baterai habis, perangkat dimatikan, atau memang izin dicabut. Sistem tidak berwenang memilih penyebab mana yang benar. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Yang perlu ditetapkan saat penggalian**

-   Ambang waktu penyusutan data titik koordinat

-   Perlakuan terhadap titik dengan akurasi sangat rendah

-   Perlakuan terhadap indikasi lokasi palsu

-   Perlakuan bila Sesi Tugas tidak pernah ditutup Anggota

**6.5 Dashboard & Monitoring**

Menyajikan ringkasan keadaan sesuai lingkup masing-masing peran. Merupakan halaman pertama yang dilihat setiap pengguna setelah masuk.

**Lingkup**

-   Kartu ringkasan angka, berbeda isi untuk tiap peran

-   Daftar penugasan yang sedang berjalan

-   Umpan aktivitas terbaru

-   Peta posisi Anggota yang sedang bertugas

-   Ringkasan status personel

-   Rekapitulasi lintas unit, khusus Kasubdit

**Butir yang sudah final**

-   Isi dashboard mengikuti lingkup data pada matriks Section 2.3

-   Tombol penerbitan SPT hanya muncul pada dashboard Kanit

-   Menu dan rekapitulasi lintas unit hanya muncul pada dashboard Kasubdit

**6.6 Manajemen User**

Pengelolaan akun seluruh pengguna sistem. Kewenangan eksklusif Kasubdit.

**Lingkup**

-   Penambahan akun baru

-   Penyuntingan data akun, termasuk peran dan unit

-   Penonaktifan akun

-   Daftar akun beserta waktu akses terakhir

**Butir yang sudah final**

-   Hanya Kasubdit yang dapat membuka modul ini

-   Akun tidak dihapus, melainkan dinonaktifkan, agar riwayat laporan dan penugasan tetap utuh

**6.7 Dokumentasi Foto & Kolase Berkop**

Mengatur pengambilan, penandaan, penyimpanan, dan penyusunan foto dokumentasi lapangan.

**Lingkup**

-   Pengambilan foto melalui kamera aplikasi beserta penanaman tanda air

-   Pemilihan foto dari galeri perangkat

-   Kompresi sebelum pengunggahan

-   Penayangan foto satuan dengan tampilan layar penuh

-   Penyusunan dan pengunduhan Kolase berkop institusi

**Butir yang sudah final**

  -----------------------------------------------------------------------------------------------------------------------------------
  **Aturan**                     **Ketetapan**
  ------------------------------ ----------------------------------------------------------------------------------------------------
  Cara penyimpanan               Foto disimpan satuan dan tetap dapat dilihat terpisah. Kolase tidak menggantikan berkas asli.

  Foto dari kamera aplikasi      Diberi tanda air berisi waktu, koordinat, dan nama lokasi. Dilabeli Foto lapangan terverifikasi.

  Foto dari galeri               Tanpa tanda air. Dilabeli Foto lampiran secara netral.

  Jumlah minimum foto kamera     Tidak ada. Anggota bebas melampirkan foto dari sumber mana pun. Sistem cukup menandai sumbernya.

  Waktu pembuatan Kolase         Sesuai permintaan, melalui tindakan Ekspor Kolase. Bukan otomatis saat laporan dikirim.

  Kepala Kolase                  Memakai kop institusi Ditreskrimsus Polda Jawa Barat pada bagian atas gambar.

  Tata letak foto dalam Kolase   Foto ditampilkan utuh tanpa pemotongan. Sel kisi berukuran seragam, ruang sisa diisi latar netral.
  -----------------------------------------------------------------------------------------------------------------------------------

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Alasan foto tidak dipotong dalam Kolase**                                                                                                                                                                  |
|                                                                                                                                                                                                              |
| Foto penyelidikan sering memuat keterangan penting di tepi bingkai, misalnya papan nama, nomor kendaraan, atau keadaan sekitar. Pemotongan otomatis berisiko menghilangkan justru bagian yang menjadi bukti. |
|                                                                                                                                                                                                              |
| Ruang kosong yang timbul dinilai sebagai harga yang jauh lebih murah dibanding kehilangan keterangan.                                                                                                        |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Yang perlu ditetapkan saat penggalian**

-   Susunan kisi Kolase menurut jumlah foto

-   Berkas kop institusi dan ukurannya

-   Format keluaran Kolase

-   Tata letak dan ukuran teks tanda air pada foto

**6.8 LHP Ringkas Otomatis**

Lapis kedua pelaporan. Anggota mengisi formulir terstruktur, sistem menyusunnya menjadi dokumen resmi yang siap dikirim ke pimpinan. Modul ini merupakan nilai tambah terbesar bagi Anggota karena menggantikan pengetikan dokumen secara manual.

**Lingkup**

-   Formulir terstruktur mengikuti kerangka LHP yang berlaku

-   Pengisian otomatis sebagian bagian dari data yang sudah ada di sistem

-   Bagian dengan jumlah baris berubah-ubah, dapat ditambah dan dikurangi

-   Penyimpanan sebagai draf sebelum difinalkan

-   Pelampiran foto dokumentasi

-   Ekspor menjadi dokumen PDF berkop dan dokumen Word

**Pembagian pengisian**

  ------------------------------------------------------------------------------------------------
  **Terisi otomatis dari sistem**                           **Diisi Anggota**
  --------------------------------------------------------- --------------------------------------
  Dasar penugasan, diambil dari nomor SPT                   Uraian perkara

  Waktu kegiatan, diambil dari Sesi Tugas                   Dasar hukum yang disangkakan

  Tempat kegiatan, diambil dari lokasi SPT atau koordinat   Pihak pelapor dan terlapor

  Daftar petugas, diambil dari Anggota pada SPT             Uraian kronologis dan fakta lapangan

  Kepala surat dan bagian penutup, dari templat institusi   Daftar saksi yang diperiksa

                                                            Daftar barang bukti

                                                            Langkah yang telah dilakukan

                                                            Rencana tindak lanjut

                                                            Kesimpulan dan catatan
  ------------------------------------------------------------------------------------------------

**Butir yang sudah final**

-   Format ekspor: PDF berkop resmi dan Word, keduanya tersedia

-   Bagian petugas, pihak, saksi, dan barang bukti bersifat dinamis, jumlah barisnya dapat ditambah dan dikurangi

-   Daftar petugas terisi otomatis dari Anggota pada SPT, tetapi masih dapat disunting

-   LHP Resmi Lengkap tidak dibuat di sistem ini

**Butir yang menunggu keputusan**

+------------------------------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\]**                                                                                                           |
|                                                                                                                                          |
| Penyimpanan data sensitif penyelidikan pada layanan awan pihak ketiga yang servernya berada di luar negeri. Lihat Lampiran A butir A-02. |
|                                                                                                                                          |
| Butir ini dibahas bersamaan dengan penggalian Modul 6.8 dan Section 9.                                                                   |
+------------------------------------------------------------------------------------------------------------------------------------------+

**6.9 Notifikasi**

Menyampaikan kejadian penting kepada pengguna yang berkepentingan, agar tidak perlu memeriksa sistem secara berkala.

**Lingkup**

-   Pemberitahuan di dalam aplikasi, ditandai dengan lonceng dan penghitung

-   Daftar pemberitahuan dan penandaan sudah dibaca

-   Ruang untuk pemberitahuan dorong pada aplikasi Android, bila dibutuhkan pada tahap lanjut

**Kejadian yang memicu pemberitahuan**

  ---------------------------------------------------------------------------------
  **Kejadian**                                **Penerima**
  ------------------------------------------- -------------------------------------
  SPT baru diterbitkan dan Anggota ditunjuk   Anggota yang ditunjuk

  Laporan Kegiatan Harian masuk               Panit dan Kanit pada unit terkait

  Catatan peninjau diberikan pada laporan     Anggota penyusun laporan

  SPT ditandai bermasalah                     Kanit unit terkait dan Kasubdit

  LHP Ringkas difinalkan                      Panit dan Kanit pada unit terkait

  Batas waktu SPT terlampaui                  Anggota pelaksana, Panit, dan Kanit
  ---------------------------------------------------------------------------------

Pemberitahuan mengikuti lingkup data. Pengguna tidak boleh menerima pemberitahuan mengenai data yang tidak berhak ia lihat.

**7. Business Rules Global**

Aturan pada section ini berlaku lintas modul dan memiliki kekuatan tertinggi. Bila deskripsi modul mana pun bertentangan dengan aturan di bawah, aturan di bawah yang berlaku. Setiap aturan diberi kode agar dapat dirujuk dari modul lain.

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kode**   **Aturan**                                                                                                                                           **Modul terkait**
  ---------- ---------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------
  BR-01      Tracking hanya berjalan selama Sesi Tugas aktif. Di luar Sesi Tugas, sistem tidak merekam posisi Anggota sama sekali.                                6.4

  BR-02      Tindakan Mulai Tugas ditolak bila GPS tidak aktif atau izin lokasi tidak diberikan.                                                                  6.4

  BR-03      Laporan tetap boleh dikirim tanpa koordinat sah, tetapi Anggota wajib memilih alasan, dan laporan ditandai Lokasi tidak terekam beserta alasannya.   6.3

  BR-04      Tidak ada jalur pelaporan di luar sistem. Percakapan pesan singkat tidak diakui sebagai pelaporan resmi.                                             6.3, 6.8

  BR-05      Sistem menyajikan data apa adanya dan tidak menyimpulkan pelanggaran. Penilaian dilakukan manusia sesuai kewenangannya.                              Seluruh modul

  BR-06      SPT hanya dapat diterbitkan oleh Kanit.                                                                                                              6.2

  BR-07      Manajemen akun pengguna dan rekapitulasi lintas unit hanya dapat diakses Kasubdit.                                                                   6.5, 6.6

  BR-08      Foto dari kamera aplikasi wajib diberi tanda air waktu dan koordinat. Foto dari galeri dilabeli Foto lampiran tanpa tanda air.                       6.7

  BR-09      Kolase dibuat sesuai permintaan dan tidak mengubah berkas foto asli. Foto tetap tersimpan satuan.                                                    6.7

  BR-10      LHP Resmi Lengkap berada di luar cakupan sistem dan tidak boleh dibangun.                                                                            6.8, Section 12

  BR-11      Menu, tombol, dan tindakan yang berada di luar kewenangan peran tidak ditampilkan, bukan ditampilkan dalam keadaan nonaktif.                         Seluruh modul

  BR-12      Akun pengguna tidak dihapus, melainkan dinonaktifkan, agar riwayat penugasan dan laporan tetap utuh.                                                 6.6

  BR-13      Setiap titik koordinat wajib terikat pada satu SPT. Tidak ada perekaman posisi tanpa konteks penugasan.                                              6.4

  BR-14      Pemberitahuan mengikuti lingkup data. Pengguna tidak menerima pemberitahuan mengenai data yang tidak berhak ia lihat.                                6.9
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+-------------------------------------------------------------------------------------------------------------------------------------------+
| **Cara menambah aturan baru**                                                                                                             |
|                                                                                                                                           |
| Aturan baru diberi kode berikutnya secara berurutan dan tidak menggunakan kembali kode yang sudah dipakai, sekalipun aturan lama dicabut. |
|                                                                                                                                           |
| Aturan yang dicabut ditandai sebagai dicabut beserta alasannya, bukan dihapus dari daftar, agar riwayat keputusan tetap dapat ditelusuri. |
+-------------------------------------------------------------------------------------------------------------------------------------------+

**8. Edge Case & Error State**

Daftar kondisi tepi yang wajib memiliki penanganan tertulis. Pada versi kerangka ini yang dicantumkan adalah daftar kondisinya. Penanganan rinci ditetapkan saat modul terkait digali. AI Agent dilarang menentukan penanganan sendiri untuk kondisi yang belum memiliki ketetapan.

**8.1 Posisi dan GPS**

-   Sinyal posisi hilang di tengah Sesi Tugas

-   Izin lokasi dicabut pengguna saat Sesi Tugas sedang berjalan

-   Perangkat mati atau kehabisan daya saat bertugas

-   Koordinat diterima dengan akurasi sangat rendah

-   Terdapat indikasi pemakaian lokasi palsu

-   Sesi Tugas tidak pernah ditutup oleh Anggota

-   Perangkat mengirim koordinat dengan waktu yang jauh berbeda dari waktu server

**8.2 Jaringan**

-   Pengguna menekan kirim laporan dalam keadaan tanpa jaringan

-   Pengunggahan foto terputus di tengah jalan

-   Titik koordinat menumpuk saat jaringan hilang, lalu terkirim sekaligus saat jaringan pulih

-   Layanan backend tidak dapat dijangkau

**8.3 Foto**

-   Berkas melebihi batas ukuran meski sudah dikompresi

-   Format berkas tidak didukung

-   Penanaman tanda air gagal karena koordinat belum tersedia saat pengambilan

-   Kompresi gagal pada perangkat berkemampuan rendah

-   Penyusunan Kolase diminta pada laporan yang belum memiliki foto

**8.4 Kejadian bersamaan**

-   Dua pembaruan posisi tiba pada saat hampir bersamaan

-   SPT disunting Kanit saat Anggota sedang dalam Sesi Tugas untuk SPT tersebut

-   Dua peninjau memberi catatan pada laporan yang sama secara bersamaan

-   Anggota membuka Sesi Tugas pada dua perangkat sekaligus

**8.5 Sesi masuk dan peran**

-   Sesi masuk kedaluwarsa saat pengguna sedang mengisi formulir panjang

-   Peran pengguna diubah Kasubdit saat pengguna tersebut sedang masuk

-   Akun dinonaktifkan saat pengguna sedang dalam Sesi Tugas

-   Pengguna mencoba membuka halaman di luar kewenangannya melalui tautan langsung

**8.6 Keutuhan data**

-   SPT hendak dihapus padahal sudah memiliki laporan, foto, atau Rute

-   Anggota dikeluarkan dari SPT padahal sudah mengirim laporan untuk SPT tersebut

-   LHP dibuat untuk SPT yang sudah ditutup

-   Data rujukan hilang, misalnya penugasan yang diacu tidak lagi ditemukan

**8.7 LHP**

-   Bagian dinamis dikirim dalam keadaan kosong

-   Data pengisian otomatis tidak tersedia, misalnya Sesi Tugas tidak pernah dibuka

-   Ekspor dokumen gagal di tengah proses

-   Draf ditinggalkan dalam waktu lama tanpa difinalkan

-   Isi formulir melebihi ruang yang tersedia pada tata letak dokumen ekspor

**9. Keamanan & Row Level Security**

Karena sistem tidak memiliki server aplikasi yang ditulis manual, penegakan hak akses sepenuhnya bergantung pada aturan akses baris di tingkat basis data. Section ini karena itu bersifat menentukan, bukan pelengkap.

**9.1 Prinsip**

-   **Penolakan sebagai bawaan.** Setiap tabel dimulai dengan keadaan tidak dapat diakses siapa pun, lalu izin dibuka satu per satu sesuai kebutuhan.

-   **Dua lapis pemeriksaan.** Pemeriksaan kewenangan tindakan dan pemeriksaan lingkup data dilakukan terpisah, sesuai catatan pada Section 2.4.

-   **Aturan mengikuti matriks.** Seluruh aturan akses baris wajib sejalan dengan matriks hak akses pada Section 2.3. Bila terjadi perbedaan, matriks yang berlaku dan aturan diperbaiki.

-   **Perlindungan tidak boleh hanya di antarmuka.** Menyembunyikan tombol tidak dianggap sebagai pengamanan. Setiap pembatasan wajib ditegakkan juga di tingkat basis data.

**9.2 Aturan akses per tabel**

Disusun rinci saat penggalian. Kerangka arahnya sebagai berikut:

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Tabel**               **Arah aturan**
  ----------------------- ------------------------------------------------------------------------------------------------------------------------------------------------
  users                   Pengguna dapat membaca datanya sendiri. Pimpinan membaca data dalam lingkupnya. Penulisan dan penonaktifan hanya oleh Kasubdit.

  penugasan               Pembacaan mengikuti lingkup unit. Penulisan hanya oleh Kanit pada unitnya sendiri.

  penugasan_anggota       Anggota membaca barisnya sendiri. Pimpinan membaca dalam lingkupnya. Penulisan mengikuti keputusan butir A-01.

  laporan_harian          Anggota menulis dan membaca laporannya sendiri. Pimpinan membaca dan memberi catatan dalam lingkupnya.

  lhp dan tabel anaknya   Aturan paling ketat. Anggota menulis dan membaca LHP miliknya. Pimpinan membaca dalam lingkupnya. Perlu penetapan siapa yang boleh mengekspor.

  foto_dokumentasi        Mengikuti hak akses laporan atau LHP yang menaunginya.

  location_logs           Anggota membaca Rute miliknya. Pimpinan membaca dalam lingkupnya. Penulisan hanya oleh Anggota pemilik selama Sesi Tugas aktif.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**9.3 Penyimpanan berkas foto**

Berkas foto tidak boleh dapat diakses siapa pun yang mengetahui tautannya. Akses berkas mengikuti hak akses laporan atau LHP yang menaunginya, dan diberikan melalui tautan bermasa berlaku terbatas.

**9.4 Data lokasi dan data perkara**

Dua kelompok data ini memerlukan perlakuan khusus. Data lokasi mengungkap pergerakan seseorang, sedangkan data perkara memuat identitas pihak dan uraian dugaan tindak pidana. Keduanya hanya boleh dibuka kepada peran yang berkepentingan dalam lingkupnya, dan setiap pembukaan yang bersifat luas dicatat pada jejak audit.

**9.5 Butir kebijakan yang menunggu jawaban**

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\] Penyimpanan data sensitif pada layanan awan**                                                                                                                                                                                |
|                                                                                                                                                                                                                                                           |
| Sistem direncanakan memakai layanan basis data terkelola yang servernya berada di luar wilayah Indonesia. Modul LHP Ringkas memuat identitas pihak, nomor pengenal, dan uraian perkara.                                                                   |
|                                                                                                                                                                                                                                                           |
| Pemilik produk perlu memastikan apakah penyimpanan data tersebut pada layanan pihak ketiga di luar negeri diperbolehkan menurut ketentuan yang berlaku di lingkungan institusi.                                                                           |
|                                                                                                                                                                                                                                                           |
| Butir ini dicatat sebagai kehati-hatian, bukan sebagai penghalang. Bila terdapat batasan, tersedia beberapa arah penyelesaian: penyandian kolom tertentu, pemisahan data paling sensitif, atau pemasangan layanan basis data pada server milik institusi. |
|                                                                                                                                                                                                                                                           |
| Sampai butir ini terjawab, pembangunan Modul 6.8 dapat berjalan pada bagian yang tidak menyimpan data pengenal, sedangkan penyimpanan data pengenal ditahan.                                                                                              |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**9.6 Jejak audit**

Sistem mencatat tindakan penting beserta pelaku dan waktunya. Daftar tindakan yang dicatat ditetapkan saat penggalian, sekurang-kurangnya mencakup penerbitan dan penutupan SPT, penonaktifan akun, perubahan peran, finalisasi LHP, dan pengeksporan dokumen.

**10. Kebutuhan Non-Fungsional**

Kebutuhan yang tidak berupa fitur, tetapi menentukan apakah sistem dapat dipakai dalam keadaan sebenarnya di lapangan.

**10.1 Kinerja**

  ---------------------------------------------------------------------------------------------------------------------------------
  **Aspek**                                **Sasaran**
  ---------------------------------------- ----------------------------------------------------------------------------------------
  Waktu muat halaman utama                 Ditetapkan saat penggalian, mengingat sebagian pengguna memakai jaringan seluler lemah

  Jeda pembaruan posisi di peta            Sedapat mungkin mengikuti frekuensi pengiriman koordinat

  Jumlah Anggota bertugas bersamaan        Perkiraan awal mengikuti jumlah personel Subdit IV

  Waktu penyusunan Kolase dan ekspor LHP   Ditetapkan saat penggalian modul terkait
  ---------------------------------------------------------------------------------------------------------------------------------

**10.2 Volume data**

Tabel titik koordinat merupakan tabel dengan pertumbuhan tercepat. Perkiraan kasar: seorang Anggota yang bertugas selama satu hari kerja dapat menghasilkan ratusan hingga seribu titik. Bila puluhan Anggota bertugas bersamaan, pertumbuhan harian mencapai puluhan ribu baris.

Karena itu diperlukan pembatasan yang disengaja: Rute hanya disimpan per penugasan, terdapat aturan penyusutan data lama, dan indeks disusun agar penelusuran Rute tetap cepat. Ambang dan mekanismenya ditetapkan saat Modul 6.4 digali.

**10.3 Kesesuaian perangkat**

-   **Versi Android minimum.** Ditetapkan saat penggalian, dengan mempertimbangkan perangkat yang benar-benar dipakai Anggota.

-   **Perangkat berkemampuan rendah.** Kompresi foto dan penyusunan Kolase harus tetap berjalan, meski lebih lambat.

-   **Keragaman ketelitian posisi.** Ketelitian GPS antar perangkat berbeda jauh. Sistem tidak boleh berasumsi seluruh perangkat memberi koordinat setelitinya.

-   **Pengelolaan daya yang agresif.** Sejumlah merek perangkat menghentikan proses latar belakang secara sepihak. Diperlukan panduan pengaturan bagi Anggota, lihat Section 11.3.

**10.4 Daya dan kuota**

Frekuensi gabungan jarak dan waktu dipilih justru untuk menekan pemakaian daya dan kuota. Saat Anggota diam mengamati satu titik, koordinat tidak dikirim berulang-ulang. Dampak sebenarnya terhadap daya diukur saat pengujian di perangkat nyata, bukan diperkirakan di atas kertas.

**10.5 Kemudahan pemakaian**

-   Seluruh antarmuka memakai Bahasa Indonesia

-   Sasaran sentuh berukuran cukup besar untuk dipakai sambil berdiri di lapangan

-   Kontras warna cukup untuk dibaca di bawah cahaya matahari langsung

-   Tampilan mengutamakan layar telepon genggam pada seluruh halaman yang dipakai Anggota

-   Bagian yang dipakai pimpinan tetap nyaman pada layar lebar

**11. Alur Aplikasi & Packaging**

Mengatur bagaimana aplikasi sampai ke tangan Anggota dan bagaimana Anggota menyiapkan perangkatnya. Bagian ini kerap diabaikan padahal menjadi penyebab paling sering kegagalan pemakaian di lapangan.

**11.1 Penyebaran aplikasi**

-   Berkas pemasangan Android dibagikan langsung kepada Anggota melalui saluran internal

-   Anggota perlu mengizinkan pemasangan dari sumber di luar toko aplikasi

-   Aplikasi tidak diterbitkan di toko aplikasi umum

-   Tersedia pula bentuk aplikasi web progresif yang dapat dipasang ke layar utama tanpa berkas pemasangan

**11.2 Urutan permintaan izin**

Urutan berikut bersifat mengikat karena menentukan keberhasilan Tracking:

-   Izin lokasi saat aplikasi dipakai, diminta pada pemakaian pertama

-   Izin lokasi sepanjang waktu, diminta saat Anggota pertama kali membuka Sesi Tugas, disertai penjelasan singkat alasannya

-   Izin kamera, diminta saat Anggota pertama kali mengambil foto

-   Izin penyimpanan, diminta hanya bila diperlukan untuk mengunduh hasil ekspor

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Batasan sistem operasi yang tidak dapat dihindari**                                                                                                                                         |
|                                                                                                                                                                                               |
| Izin lokasi sepanjang waktu tidak dapat diberikan dari dalam aplikasi. Pengguna harus memilihnya sendiri melalui pengaturan sistem.                                                           |
|                                                                                                                                                                                               |
| Karena itu diperlukan panduan bergambar bagi Anggota. Tanpa panduan, banyak pengguna berhenti pada pilihan izin hanya saat aplikasi dipakai, sehingga Tracking latar belakang tidak berjalan. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**11.3 Pengaturan penghematan daya**

Sebagian perangkat menghentikan proses latar belakang untuk menghemat daya, sehingga pengiriman koordinat terputus meski Sesi Tugas masih berjalan. Diperlukan panduan penonaktifan penghematan daya khusus untuk aplikasi ini, disertai langkah terpisah untuk merek yang dikenal paling agresif.

**11.4 Pengenalan bagi Anggota**

Pada pemakaian pertama, Anggota dituntun melalui langkah singkat: pengenalan tombol Mulai Tugas, cara mengirim laporan, cara mengambil foto, dan penjelasan bahwa Tracking hanya berjalan selama Sesi Tugas. Penjelasan terakhir penting untuk menjaga kepercayaan.

**11.5 Pembaruan aplikasi**

-   Pembaruan bagian antarmuka pada bentuk web berlaku langsung tanpa tindakan pengguna

-   Pembaruan pada bentuk aplikasi Android memerlukan pembagian berkas baru dan pemasangan ulang

-   Diperlukan penanda versi di dalam aplikasi agar mudah diketahui siapa yang masih memakai versi lama

**12. Di Luar Cakupan**

Daftar berikut bersifat mengikat. AI Agent dilarang membangun hal-hal di bawah ini sekalipun tampak sebagai kelanjutan yang wajar dari modul yang sedang dikerjakan. Bila muncul kebutuhan yang menyerupai salah satu butir ini, kebutuhan tersebut dilaporkan sebagai usulan, bukan langsung dibangun.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Tidak dibangun**                                     **Alasan**
  ------------------------------------------------------ -----------------------------------------------------------------------------------------------------
  LHP Resmi Lengkap                                      Dokumen penyidikan penuh yang menuntut pertimbangan hukum penyidik. Disusun manual di luar sistem.

  Penilaian atau pemeringkatan Anggota secara otomatis   Bertentangan dengan Prinsip Non-Menghakimi pada Section 0.6.

  Percakapan atau forum di dalam aplikasi                Menambah cakupan tanpa menjawab masalah utama. Komunikasi tetap memakai saluran yang ada.

  Penyambungan ke sistem institusi lain                  Memerlukan izin dan koordinasi di luar kendali proyek pada tahap ini.

  Versi iOS                                              Perangkat Anggota didominasi Android. Ditunda ke tahap berikutnya.

  Penerbitan di toko aplikasi umum                       Aplikasi bersifat internal. Penerbitan publik menambah persyaratan yang tidak sebanding manfaatnya.

  Pelacakan posisi di luar Sesi Tugas                    Bertentangan dengan BR-01 dan BR-13. Tidak boleh dibangun dalam bentuk apa pun.

  Penolakan laporan karena lokasi tidak terekam          Bertentangan dengan BR-03. Laporan tetap harus dapat dikirim.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------

**Lampiran A --- Butir yang Perlu Dikonfirmasi ke Klien**

Daftar pertanyaan terbuka yang menunggu jawaban pemilik produk. Selama belum terjawab, bagian yang bergantung padanya tidak diimplementasikan.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kode**   **Butir**                                     **Pertanyaan**                                                                                                                                      **Dampak bila tidak terjawab**
  ---------- --------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  A-01       Penunjukan Anggota ke SPT                     Siapa yang menentukan Anggota mana yang masuk ke dalam SPT: Kanit saat menerbitkan, atau Panit setelah SPT terbit                   Aturan akses baris pada tabel penugasan_anggota tidak dapat disusun. Modul 6.2 tertahan sebagian.

  A-02       Penyimpanan data sensitif pada layanan awan   Apakah identitas pihak, nomor pengenal, dan uraian perkara boleh disimpan pada layanan pihak ketiga yang servernya di luar negeri   Penyimpanan data pengenal pada Modul 6.8 tertahan. Perlu arah penyelesaian alternatif bila tidak diperbolehkan.

  A-03       Angka target metrik keberhasilan              Berapa angka sasaran untuk tiap metrik pada Section 1.4                                                                             Keberhasilan sistem tidak dapat diukur secara obyektif.

  A-04       Berkas kop institusi                          Berkas gambar kop untuk Kolase dan templat kop untuk dokumen LHP                                                                    Modul 6.7 dan 6.8 tidak dapat menghasilkan keluaran akhir.

  A-05       Daftar alasan lokasi tidak terekam            Pilihan alasan apa saja yang disediakan bagi Anggota                                                                                Modul 6.3 tidak dapat menerapkan BR-03 sepenuhnya.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Lampiran B --- Daftar Keputusan yang Sudah Final**

Ringkasan seluruh keputusan yang sudah terkunci pada versi 0.2. Butir-butir ini tidak perlu ditanyakan ulang saat penggalian modul, dan hanya dapat diubah melalui revisi dokumen yang tercatat pada Riwayat Revisi.

**B.1 Peran dan kewenangan**

-   Terdapat empat peran: Kasubdit, Kanit, Panit, Anggota

-   Kasubdit melihat seluruh unit; Kanit melihat unitnya sendiri; Panit melihat timnya; Anggota melihat miliknya sendiri

-   Menerbitkan SPT adalah kewenangan eksklusif Kanit

-   Manajemen akun pengguna dan rekapitulasi lintas unit adalah kewenangan eksklusif Kasubdit

-   Panit berperan sebagai pengawas dan peninjau, bukan penerbit penugasan

**B.2 Posisi dan Sesi Tugas**

-   Tracking berjalan hanya selama Sesi Tugas

-   Sesi Tugas dibuka dan ditutup Anggota melalui tombol, tidak menyala otomatis

-   Mulai Tugas mensyaratkan GPS aktif dan izin lokasi diberikan

-   Koordinat dikirim bila perpindahan melebihi 25 meter atau sudah lewat 30 detik sejak pengiriman terakhir, mana yang lebih dulu

-   Rute disimpan per penugasan, tidak ada pelacakan tanpa konteks

-   Status kehadiran ditulis sebagai Terakhir terlihat dengan tiga tingkat warna, tanpa menyimpulkan penyebabnya

**B.3 Pelaporan**

-   Terdapat tiga lapis pelaporan; lapis pertama dan kedua di dalam sistem, lapis ketiga di luar sistem

-   Laporan dengan koordinat sah ditandai Terverifikasi di lokasi

-   Laporan tanpa koordinat sah tetap dapat dikirim, wajib disertai alasan, ditandai Lokasi tidak terekam

-   Tidak ada jalur pelaporan di luar sistem

-   LHP Ringkas diekspor ke PDF berkop dan Word

-   Bagian petugas, pihak, saksi, dan barang bukti pada LHP bersifat dinamis

**B.4 Foto dan dokumentasi**

-   Foto disimpan satuan, bukan digabung saat pengiriman

-   Foto dari kamera aplikasi diberi tanda air waktu dan koordinat, dilabeli Foto lapangan terverifikasi

-   Foto dari galeri tanpa tanda air, dilabeli Foto lampiran

-   Tidak ada jumlah minimum foto dari kamera

-   Kolase dibuat sesuai permintaan, memakai kop institusi, foto ditampilkan utuh tanpa pemotongan

-   Foto dikompresi hingga paling besar 300 kilobita sebelum diunggah

**B.5 Teknologi dan penyebaran**

-   Antarmuka memakai Next.js dengan React dan TypeScript serta Tailwind CSS

-   Backend dan basis data memakai Supabase

-   Peta memakai Leaflet dengan OpenStreetMap

-   Pelacakan latar belakang memakai Capacitor

-   Disebarkan sebagai aplikasi web progresif dan berkas pemasangan Android internal, tidak melalui toko aplikasi umum

-   Gaya visual diambil dari prototype HTML yang sudah ada, tanpa membuat arah desain baru

**B.6 Prinsip yang mengikat**

-   Prinsip Ekstensibilitas: sistem dibangun modular, penambahan fitur tidak boleh memaksa penulisan ulang modul lain

-   Prinsip Non-Menghakimi: sistem menyajikan data, manusia yang menilai

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Akhir dokumen versi kerangka 0.2**                                                                                                                                                                            |
|                                                                                                                                                                                                                 |
| Langkah berikutnya adalah menggali satu modul dari Section 6 sampai tingkat terkecil memakai kerangka pada Section 6.0, lalu menyatukan hasilnya kembali ke dokumen ini.                                        |
|                                                                                                                                                                                                                 |
| Urutan penggalian yang disarankan mengikuti ketergantungan antar modul: 6.1 lebih dahulu karena menjadi fondasi, disusul 6.2 sebagai inti alur kerja, lalu 6.4 yang memiliki aturan dan kondisi tepi terbanyak. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
