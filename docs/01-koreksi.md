# SiPANTAU — Koreksi Pemeriksaan Silang

**Wajib dibuka pada setiap sesi koding, dan ini yang paling mengikat.**

Tiga berita acara pemeriksaan silang. Dua puluh tujuh titik ditemukan, sepuluh
memblokir, dan hampir seluruhnya berupa kegagalan senyap yang tidak menimbulkan
pesan galat apa pun.

Urutan kekuatan: **W menang atas J, J menang atas I, I menang atas seluruh berkas
modul.** Bila menemukan dua ketentuan bertentangan, yang lebih atas yang berlaku.

---
---

# BERITA ACARA PEMERIKSAAN SILANG — v0.7

**Tanggal: 11 Agustus 2026 · Pemeriksaan atas Modul 6.6 dan 6.9 terhadap seluruh berkas yang berlaku**

Pemeriksaan menemukan enam titik. Dua memblokir, dan keduanya berjenis sama: **sesuatu yang dinyatakan baru padahal sudah ada**. Ini pengulangan ketiga dari pola yang sama — T-13 pada pemeriksaan v0.5, lalu berulang di sini dua kali sekaligus.

Seluruh koreksinya ada pada **Bagian W** di akhir dokumen ini. Bagian W memiliki kekuatan tertinggi, di atas Bagian J, Bagian I, dan seluruh berkas modul.

---

## Ringkasan temuan v0.7

| Kode | Temuan | Tingkat | Koreksi |
| --- | --- | --- | --- |
| W-01 | Modul 6.6 menyatakan menambah nilai `akun_dinonaktifkan` ke `sebab_penutupan`, padahal nilai itu sudah ada dan daftarnya sudah berstatus final | **Memblokir** | W.1 |
| W-02 | Daftar tertutup jenis pemberitahuan hanya mencakup tiga dari tujuh sebab penutupan Sesi Tugas | **Memblokir** | W.2 |
| W-03 | Q-05 menyusun ulang urutan langkah Fungsi Tepi `nonaktifkan-akun` tanpa memeriksa apakah Modul 6.4 sudah menetapkan pelaksananya | Penting | W.3 |
| W-04 | Sebelas butir calon addendum Modul 6.6 dan 6.9 menyentuh modul yang sudah dinyatakan selesai | Penting | W.4 |
| W-05 | Judul baku `spt_ditutup` menyesatkan karena dipakai untuk dua keadaan yang berbeda | Sedang | W.5 |
| W-06 | Pemberitahuan `sesi_menggantung` menyebut pemilik sesi sebagai penerima, padahal ia mungkin tidak dapat menerimanya | Ringan | W.6 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-68 sampai BR-76 | Bersih. BR tertinggi sebelumnya BR-67 |
| Penomoran KP-6.6 dan KP-6.9 | Bersih, belum pernah dipakai |
| Nama tabel `langganan_dorong` | Bersih |
| Nama fungsi `buat_notifikasi`, `penerima_pengawas_spt`, `penerima_pelaksana_spt` | Bersih |
| Nama pemicu `trg_notifikasi_hanya_tandai_baca` | Bersih, berawalan `trg_` sesuai Bagian I.8 |
| Amandemen BR-51 | Sah. Modul 6.4 juga mengamandemennya, dan keduanya menambah operasi berbeda tanpa bertabrakan |
| Penerapan BR-64 zona waktu | Diterapkan pada pengelompokan daftar pemberitahuan |
| Penerapan BR-66 hak akses | Diterapkan pada kedua tabel |
| Daftar Fungsi Tepi | Tidak bertambah. Modul 6.6 memakai dua yang sudah ada |
| Sisa `current_date` polos | Tidak ada yang baru. Yang tersisa pada berkas lama sudah tercakup Bagian J.3 |

---
---

# BAGIAN W — KOREKSI PEMERIKSAAN SILANG v0.7

**Status: [FINAL] · Kekuatan tertinggi dalam dokumen ini**

## W.1 Nilai `akun_dinonaktifkan` sudah ada — W-01

### Duduk perkaranya

Modul 6.6 butir Q-05 menutup dengan kalimat:

> Nilai `akun_dinonaktifkan` ditambahkan ke daftar `sebab_penutupan` pada tabel `sesi_tugas` yang difinalkan Modul 6.4.

Dan daftar langkah setelahnya memuat perintah nomor 2: *"Tambahkan nilai `akun_dinonaktifkan` ke daftar `sebab_penutupan` pada Modul 6.4."*

Modul 6.4 sudah memuat nilai itu. Daftarnya bahkan sudah berstatus **[FINAL]** dengan tujuh nilai lengkap beserta rujukan aturannya:

| Nilai | Kapan dipakai | Rujukan |
| --- | --- | --- |
| `manual` | Pemegang sesi menekan Selesai Tugas | — |
| `keluar_aplikasi` | Pemegang sesi keluar dari aplikasi saat sesi berjalan | BR-19 |
| `pindah_perangkat` | Akun yang sama masuk di perangkat lain | BR-16, BR-25 |
| `menggantung` | Lewat dua jam tanpa pembaruan posisi | BR-54 |
| `spt_ditutup` | Kanit menutup atau membatalkan SPT saat sesi berjalan | BR-38 |
| `dicabut_dari_spt` | Pemegang sesi dicabut dari daftar pelaksana saat sesi berjalan | BR-30 |
| `akun_dinonaktifkan` | Akun dinonaktifkan saat sesi berjalan | BR-20 |

### Mengapa ini memblokir, bukan sekadar mubazir

Bila daftar itu bertipe enum, menambahkan nilai yang sudah ada akan gagal seketika. Bila bertipe batasan pemeriksaan, penggantian daftar dengan versi Modul 6.6 yang lebih pendek akan **menghapus enam nilai lain** — dan penghapusan itu berhasil tanpa galat, lalu seluruh penutupan sesi selain `akun_dinonaktifkan` akan ditolak.

Kegagalannya berpindah dari saat pemasangan ke saat pemakaian, dan itu bentuk yang jauh lebih sulit ditelusuri.

### Ketetapan

> **Perbaikan pada Modul 6.6 butir Q-05.** Hapus kalimat tentang penambahan nilai `sebab_penutupan`. Nilai itu sudah ada dan daftarnya sudah final.
>
> **Perbaikan pada Modul 6.6 daftar langkah.** Hapus perintah nomor 2 seluruhnya.
>
> Daftar tujuh nilai pada Modul 6.4 adalah yang berlaku. Modul mana pun dilarang menambah, mengurangi, atau menyusun ulang daftar itu tanpa revisi tercatat sesuai kebiasaan yang berlaku bagi daftar tertutup.

Yang **tetap berlaku** dari Q-05 adalah pokok persoalannya, dan itu memang temuan sah: Addendum 6.1-T menetapkan langkah Fungsi Tepi `nonaktifkan-akun` tanpa menyebut penutupan Sesi Tugas. Yang keliru hanya cara menyelesaikannya. Lihat W.3.

### Pola yang berulang tiga kali

Ini kejadian ketiga dari jenis yang sama.

| Kejadian | Yang diklaim baru | Kenyataannya |
| --- | --- | --- |
| T-13, pemeriksaan v0.5 | Kolom `penugasan.ditutup_pada` | Sudah ada sejak Modul 6.2, dengan makna yang tidak sama |
| W-01, pemeriksaan ini | Nilai `akun_dinonaktifkan` | Sudah ada di Modul 6.4, daftarnya sudah final |
| W-02, pemeriksaan ini | Daftar jenis pemberitahuan yang dianggap lengkap | Hanya mencakup tiga dari tujuh sebab |

Sebabnya sama pada ketiganya: modul yang digali belakangan menetapkan sesuatu yang bersinggungan dengan modul yang sudah selesai, tanpa membuka kembali modul itu untuk memastikan. Pemeriksaan mandiri modul tidak akan pernah menangkapnya, karena tiap modul memeriksa dirinya sendiri.

> **BR-77.** Sebelum menyatakan sebuah kolom, nilai enum, tabel, atau daftar tertutup sebagai baru, wajib ditelusuri lebih dahulu apakah ia sudah ada pada modul yang telah dinyatakan selesai. Yang ditemukan sudah ada tidak boleh ditambahkan ulang, tidak boleh pula diganti daftarnya secara utuh — yang berlaku adalah daftar pada modul yang lebih dahulu menetapkannya.

## W.2 Daftar jenis pemberitahuan tidak menutup seluruh sebab — W-02

### Duduk perkaranya

Modul 6.9 menetapkan daftar tertutup enam belas jenis pemberitahuan, dan menyatakan tiga di antaranya menutup calon addendum Modul 6.4 butir 16. Ketiga jenis itu:

- `sesi_ditutup_keluar_aplikasi`
- `izin_lokasi_terputus`
- `sesi_menggantung`

Sebab penutupan Sesi Tugas ada **tujuh**. Empat sisanya tidak memiliki jenis pemberitahuan sama sekali.

| Sebab | Ada pemberitahuan? | Akibat |
| --- | --- | --- |
| `manual` | Tidak perlu | Ditutup pemiliknya sendiri, ia sudah tahu |
| `keluar_aplikasi` | Ya | — |
| `menggantung` | Ya | — |
| `pindah_perangkat` | **Tidak** | Sesi tertutup paksa, tidak seorang pun diberi tahu |
| `spt_ditutup` | Tidak langsung | Ada `spt_ditutup`, tetapi ia mengabarkan SPT ditutup, bukan bahwa sesinya ikut terhenti |
| `dicabut_dari_spt` | Tidak langsung | Ada `spt_dicabut`, dengan persoalan yang sama |
| `akun_dinonaktifkan` | Tidak bagi pemiliknya | Ia tidak dapat masuk lagi, sehingga pemberitahuan memang tidak sampai. Ini sah |

Yang paling perlu ditutup adalah **`pindah_perangkat`**. Keadaannya begini: seorang pelaksana sedang bertugas di lapangan, lalu akunnya dipakai masuk di perangkat lain — entah oleh dirinya sendiri di perangkat cadangan, entah oleh orang lain. Sesi di perangkat lama tertutup paksa, pelacakan berhenti, dan penanda posisinya hilang dari peta pengawas.

Tidak seorang pun diberi tahu. Pengawas melihat penanda lenyap tanpa keterangan, dan pemegang perangkat lama tidak tahu pelacakannya sudah berhenti sampai ia membuka aplikasi.

### Ketetapan

Daftar tertutup bertambah satu jenis menjadi **tujuh belas**.

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `sesi_ditutup_pindah_perangkat` | Sesi ditutup dengan sebab `pindah_perangkat` | Pemilik sesi, Kanit unit, Panit Penanggung Jawab | Ya | Sesi tugas berpindah perangkat |

Isinya menyebut kejadian tanpa menduga sebabnya, sesuai Prinsip 0.6: *"Sesi tugas pada perangkat sebelumnya berakhir karena akun ini dipakai masuk di perangkat lain."* Bukan *"Akun Anda dipakai orang lain"*, karena sistem tidak mengetahui siapa yang memakainya.

Batasan pemeriksaan pada tabel `notifikasi` diperbarui:

```sql
alter table public.notifikasi
  drop constraint chk_notifikasi_jenis;

alter table public.notifikasi
  add constraint chk_notifikasi_jenis check (jenis in (
    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
    'spt_dicabut', 'spt_ditutup',
    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
    'laporan_perlu_diperbaiki', 'laporan_disetujui',
    'sesi_ditutup_keluar_aplikasi', 'sesi_ditutup_pindah_perangkat',
    'izin_lokasi_terputus', 'sesi_menggantung',
    'akun_dinonaktifkan', 'kata_sandi_direset'
  ));
```

Untuk `spt_ditutup` dan `dicabut_dari_spt`, jenis yang sudah ada dinilai memadai dengan satu syarat: **isinya wajib menyebutkan bahwa Sesi Tugas yang sedang berjalan ikut berakhir**, bila memang ada sesi yang tertutup karenanya. Menambah jenis terpisah akan membuat seseorang menerima dua pemberitahuan untuk satu kejadian.

> **Kriteria tambahan KP-6.9-42.** Bila SPT ditutup atau seorang pelaksana dicabut sementara ia sedang dalam Sesi Tugas, maka isi pemberitahuan `spt_ditutup` atau `spt_dicabut` yang ia terima menyebutkan bahwa Sesi Tugasnya ikut berakhir dan Rutenya tersimpan.

> **Butir uji U-W-01.** Masuk di perangkat kedua sementara Sesi Tugas berjalan di perangkat pertama. Pemilik sesi, Kanit unit, dan Panit Penanggung Jawab masing-masing wajib menerima satu pemberitahuan.

## W.3 Pelaksana penutupan sesi saat akun dinonaktifkan — W-03

### Duduk perkaranya

Q-05 menyusun tujuh langkah Fungsi Tepi `nonaktifkan-akun`, dengan penutupan Sesi Tugas sebagai langkah ketiga.

Modul 6.4 sudah menetapkan bahwa `akun_dinonaktifkan` adalah salah satu dari empat sebab yang **ditutup sistem**, sehingga `ditutup_oleh` kosong. Yang belum ditetapkan di kedua berkas adalah **apa** yang benar-benar menjalankannya: Fungsi Tepi, pemicu pada tabel `users`, atau pekerjaan berjadwal.

Perbedaannya nyata. Bila diserahkan kepada Fungsi Tepi, penonaktifan yang terjadi lewat jalur lain — misalnya pembaruan langsung oleh Akun Pemeliharaan — tidak akan menutup sesinya. Bila diserahkan kepada pemicu, seluruh jalur tertutup dengan sendirinya.

### Ketetapan

Penutupan sesi dijalankan **pemicu pada tabel `users`**, bukan Fungsi Tepi.

```sql
create or replace function public.fn_tutup_sesi_saat_akun_nonaktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.aktif = true and new.aktif = false then
    update public.sesi_tugas
       set ditutup_pada    = now(),
           sebab_penutupan = 'akun_dinonaktifkan'
     where pengguna_id  = new.id
       and ditutup_pada is null;

    new.sedang_bertugas := false;
  end if;
  return new;
end;
$$;

create trigger trg_tutup_sesi_saat_akun_nonaktif
  before update on public.users
  for each row
  execute function public.fn_tutup_sesi_saat_akun_nonaktif();
```

Langkah ketiga pada daftar Q-05 karena itu **dihapus dari Fungsi Tepi**. Fungsi Tepi tetap mengerjakan enam langkah lainnya; penutupan sesi terjadi dengan sendirinya sebagai akibat pembaruan kolom `aktif`, dari jalur mana pun pembaruan itu datang.

Urutan pemicu perlu diperhatikan: nama `trg_tutup_sesi_saat_akun_nonaktif` mendahului nama pemicu lain pada tabel `users` menurut abjad, dan itu memang yang dikehendaki.

## W.4 Calon addendum menyentuh modul yang sudah selesai — W-04

Sebelas butir calon addendum Modul 6.6 dan 6.9 didaftar pada Bagian 12 berkas itu. Butir nomor 6 menyentuh Modul 6.2, 6.3, dan 6.4 yang ketiganya sudah dinyatakan selesai: enam belas titik pemanggilan `buat_notifikasi` tersebar di sana dan tidak satu pun sudah ditulis.

Butir 11 punya persoalan sama: pekerjaan berjadwal penutup sesi menggantung berada di Modul 6.4 dan belum memanggil pembuat pemberitahuan.

Ini bukan kekeliruan berkas itu — ia justru mencatatnya sendiri. Yang perlu ditetapkan adalah cara mengerjakannya, karena "menggali addendum Modul 6.9" tidak dapat menyentuh berkas modul lain.

> **Ketetapan.** Butir 6 dan 11 tidak dikerjakan sebagai addendum modul mana pun, melainkan sebagai **satu berkas tersendiri berjudul Pemasangan Pemberitahuan**, digarap setelah seluruh modul selesai dan sebelum penyatuan final. Berkas itu memuat tujuh belas titik pemanggilan lengkap dengan penerima, judul, dan isinya, disusun menurut modul asalnya.
>
> Sembilan butir lainnya tetap menjadi calon Addendum 6.6-T dan 6.9-T sebagaimana biasa.

Alasannya sederhana: pemanggilan pemberitahuan adalah pekerjaan lintas modul yang bentuknya baru dapat ditulis setelah seluruh kejadian pemicunya diketahui. Mengerjakannya sekarang berarti menuliskannya dua kali.

## W.5 Judul baku `spt_ditutup` menyesatkan — W-05

Jenis `spt_ditutup` dipicu oleh dua keadaan yang berbeda: status berpindah ke `selesai`, dan status berpindah ke `dibatalkan`. Judul bakunya satu, yaitu "Penugasan ditutup".

Bagi pelaksana, kedua keadaan itu sangat berbeda. Yang pertama berarti pekerjaannya selesai; yang kedua berarti pekerjaannya dihentikan. Judul yang sama untuk keduanya membuat pelaksana harus membuka rinciannya untuk mengetahui mana yang terjadi.

> **Ketetapan.** Judul `spt_ditutup` ditentukan saat pembuatan berdasarkan status akhirnya: **"Penugasan selesai"** bila berpindah ke `selesai`, dan **"Penugasan dibatalkan"** bila berpindah ke `dibatalkan`. Nilai `jenis` tetap satu, karena keduanya membuka layar yang sama dan dapat dimatikan bersama.

Ini pengecualian atas AM-6.9-03 yang menetapkan judul diambil dari daftar baku. Pengecualiannya sempit dan dinyatakan: judul boleh dipilih dari dua kemungkinan yang keduanya sudah baku, bukan disusun bebas oleh pemanggil.

## W.6 Penerima `sesi_menggantung` — W-06

Daftar menyebut penerima `sesi_menggantung` adalah pemilik sesi dan Kanit unit.

Sesi menggantung terjadi karena dua jam berlalu tanpa pembaruan posisi. Penyebab yang paling mungkin adalah perangkatnya mati, kehabisan daya, atau kehilangan sinyal — dan pada ketiganya, pemberitahuan tidak akan sampai saat itu juga.

Ini tidak salah. Pemberitahuan tetap menunggu di daftar dan terbaca saat ia membuka aplikasi kembali, dan justru itu gunanya: ia perlu tahu bahwa sesinya sudah ditutup sistem, agar tidak mengira masih terlacak.

> **Ketetapan.** Penerima tetap sebagaimana tertulis. Ditambahkan satu catatan pada Bagian 8 bahwa pemberitahuan ini memang diperkirakan sampai terlambat, dan itu perilaku yang dikehendaki. Ditambahkan pula **Panit Penanggung Jawab** sebagai penerima, karena ia yang memantau langsung dan penanda posisi yang lenyap dari peta adalah urusannya.

---

## W.7 Ringkasan perubahan atas Modul 6.6 dan 6.9

| Letak | Perubahan |
| --- | --- |
| Q-05, kalimat penutup | Dihapus. Nilai `akun_dinonaktifkan` sudah ada |
| Q-05, langkah ketiga Fungsi Tepi | Dipindahkan ke pemicu pada tabel `users` |
| Daftar langkah, perintah nomor 2 | Dihapus |
| Bagian 8, jumlah jenis | Enam belas menjadi **tujuh belas** |
| Bagian 8, jenis baru | `sesi_ditutup_pindah_perangkat` |
| Bagian 8, judul `spt_ditutup` | Dua kemungkinan, dipilih menurut status akhir |
| Bagian 8, penerima `sesi_menggantung` | Ditambah Panit Penanggung Jawab |
| Bagian 12, butir 6 dan 11 | Dipindahkan ke berkas Pemasangan Pemberitahuan tersendiri |
| Section 5.20, batasan `chk_notifikasi_jenis` | Diperbarui dengan tujuh belas nilai |
| Kriteria baru | KP-6.9-42 |
| Aturan baru | BR-77 |

## W.8 Butir uji tambahan

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-W-01 | Masuk di perangkat kedua saat Sesi Tugas berjalan di perangkat pertama | Tiga pihak menerima pemberitahuan `sesi_ditutup_pindah_perangkat` |
| U-W-02 | Nonaktifkan akun lewat pembaruan langsung, bukan lewat Fungsi Tepi | Sesi tetap tertutup, membuktikan pemicu yang bekerja |
| U-W-03 | Periksa daftar `sebab_penutupan` setelah seluruh berkas ditempel | Tetap tujuh nilai, tidak berkurang |
| U-W-04 | Tutup SPT yang punya pelaksana sedang bersesi | Isi pemberitahuan menyebut sesinya ikut berakhir |
| U-W-05 | Batalkan SPT | Judul pemberitahuan berbunyi Penugasan dibatalkan, bukan Penugasan ditutup |

---

## Penutup berita acara v0.7

Dua temuan memblokir, dan keduanya adalah pengulangan pola yang sudah pernah ditemukan sebelumnya: sesuatu dinyatakan baru padahal sudah ada. Kejadian pertama pada pemeriksaan v0.5, dan kini dua sekaligus.

Yang membedakan W-01 dari T-13 adalah bentuk kegagalannya. T-13 akan gagal berisik, karena basis data menolak kolom yang sudah ada. W-01 dapat gagal senyap: bila daftar tertutup diganti dengan versi yang lebih pendek, penggantiannya berhasil tanpa galat, dan enam nilai lain lenyap. Baru ketika seseorang menekan Selesai Tugas, penutupan sesi ditolak — dan pada saat itu tidak ada yang menghubungkannya dengan pemasangan yang berlangsung dua minggu sebelumnya.

BR-77 ditetapkan untuk menahan pola ini. Tetapi aturan saja tidak cukup, karena ketiga kejadian sebelumnya juga terjadi meski Prinsip 0.1 sudah melarang mengarang asumsi. Yang benar-benar menangkapnya adalah pemeriksaan silang yang dijalankan ulang setiap kali ada berkas baru, dan itu perlu tetap dikerjakan sampai penyatuan final.


---

---
---

# BERITA ACARA PEMERIKSAAN SILANG — v0.6

**Tanggal: 2 Agustus 2026 · Pemeriksaan atas Modul 6.4 terhadap seluruh berkas yang sudah berlaku**

Modul 6.4 masuk dengan pemeriksaan mandiri dan pemeriksaan tabrakan yang sudah dikerjakan sendiri di dalamnya, dan dua di antaranya menangkap kekeliruan yang **luput dari pemeriksaan silang v0.5**. Keduanya dicatat di bawah sebagai pengakuan, bukan sekadar keterangan.

Pemeriksaan ini menemukan tujuh titik yang belum tertutup. Satu di antaranya membalik penilaian sebuah temuan Modul 6.4 sendiri setelah diverifikasi terhadap dokumentasi layanan, dan satu lagi memperluas jangkauan sebuah aturan yang baru lahir di Modul 6.4 tetapi belum diterapkan ke seluruh tempat yang melanggarnya.

Seluruh koreksinya ada pada **Bagian J** di akhir dokumen ini. Bagian J memiliki kekuatan tertinggi, di atas Bagian I dan di atas seluruh berkas modul.

---

## Yang ditangkap Modul 6.4 dan luput dari pemeriksaan v0.5

| Kode | Yang luput | Akibat bila tidak tertangkap |
| --- | --- | --- |
| P-01 | Tiga kebijakan akses baris Addendum 6.1-T menyebut `laporan_harian.anggota_id`, kolom yang sudah dicabut Modul 6.2 | Pemeriksaan v0.5 menyisir tabrakan nama kolom pada `foto_dokumentasi` tetapi tidak pada `laporan_harian`. Ketiga kebijakan akan ditolak saat dibuat |
| P-16 | Bentuk `v_belum_lapor` pada Bagian I.2 memakai `direkam_pada::date = current_date` tanpa zona waktu | Bagian I.2 disusun pemeriksaan v0.5 sendiri. Di server berzona UTC, batas hari bergeser tujuh jam: laporan pukul 06.00 WIB terhitung hari kemarin, pukul 23.00 WIB terhitung hari besok. Salah tiap hari, tanpa satu pun galat |

Keduanya berjenis sama dengan yang dicari pemeriksaan v0.5, dan tetap lolos. Ini menegaskan bahwa pemeriksaan silang bukan langkah yang dijalankan sekali lalu selesai — ia perlu diulang setiap kali ada berkas baru, termasuk terhadap hasil pemeriksaan sebelumnya.

---

## Ringkasan temuan v0.6

| Kode | Temuan | Tingkat | Koreksi |
| --- | --- | --- | --- |
| V-01 | P-17 menggambarkan gejala kegagalan secara keliru; terverifikasi sebaliknya terhadap dokumentasi layanan | Penting | J.1 |
| V-02 | Daftar tabel pada P-17 salah hitung, kurang satu tabel, dan tidak menyinggung tampilan sama sekali | **Memblokir** | J.2 |
| V-03 | BR-64 dinyatakan tetapi hanya satu dari empat tempat yang melanggarnya diperbaiki | **Memblokir senyap** | J.3 |
| V-04 | P-10 muncul pada Riwayat Koreksi tanpa seksi di Bagian 0 | Sedang | J.4 |
| V-05 | P-11 sampai P-15 dilewati tanpa keterangan | Ringan | J.5 |
| V-06 | Klaim jumlah temuan tidak konsisten antara pembuka dan Riwayat Koreksi | Ringan | J.6 |
| V-07 | Tampilan tidak memiliki hak baca eksplisit, kecuali satu | **Memblokir** | J.7 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-54 sampai BR-67 | Tidak bertabrakan. BR tertinggi sebelumnya BR-53 |
| Amandemen BR-51 | Sah. BR-51 mensyaratkan penambahan lewat revisi PRD tercatat, dan Modul 6.4 menyatakan dirinya sebagai revisi itu |
| Amandemen BR-59 dan BR-62 | Sah. Keduanya lahir di Modul 6.4 sendiri |
| Nama tabel `posisi_terkini` dan `titik_penanda` | Tidak menabrak nama mana pun pada v0.5 |
| Penomoran KP-6.4-01 sampai KP-6.4-72 | Tidak bertabrakan |
| Keputusan memisahkan `posisi_terkini` dari `location_logs` | Beralasan. Tabel dengan pertumbuhan tercepat tidak dijadikan sumber pembacaan waktu nyata |

---
---

# BAGIAN J — KOREKSI PEMERIKSAAN SILANG v0.6

**Status: [FINAL] · Kekuatan tertinggi dalam dokumen ini**

## J.1 Gejala kegagalan pada P-17 — V-01

### Duduk perkaranya

P-17 menetapkan BR-66 tentang pendaftaran tabel ke Data API. Fakta dasarnya benar dan sudah diverifikasi: perubahan itu menjadi bawaan bagi project baru sejak 30 Mei 2026 dan diberlakukan pada seluruh project pada 30 Oktober 2026.

Yang keliru adalah penggambaran gejalanya. P-17 menulis bahwa tabel yang belum didaftarkan *"menjawab permintaan klien dengan hasil kosong atau tidak ditemukan — persis seperti tabel yang aturan akses barisnya menolak"*, lalu menyimpulkan pembangun akan memeriksa kebijakan akses baris berjam-jam tanpa hasil.

Dokumentasi layanan menyatakan sebaliknya. Bila hak akses tidak ada, lapisan Data API mengembalikan **galat yang jelas, bukan kegagalan senyap**, disertai petunjuk yang menyebutkan peran mana yang kurang hak apa, lengkap dengan bentuk perintah pemberian hak yang dibutuhkan.

### Mengapa koreksi ini penting, bukan sekadar meluruskan kalimat

Penilaian yang keliru mengubah cara menanganinya. P-17 memerintahkan: *"Kegagalan membaca sebuah tabel baru wajib diperiksa terhadap pendaftaran ini lebih dahulu, sebelum aturan akses baris dicurigai."*

Perintah itu lahir dari anggapan bahwa kedua kegagalan terlihat sama. Karena kenyataannya tidak sama — yang satu bergalat jelas dengan petunjuk, yang lain diam — perintah itu justru menyesatkan ke arah berlawanan. Pembangun yang menemui hasil kosong tanpa galat akan membuang waktu memeriksa hak akses, padahal hasil kosong tanpa galat justru gejala khas aturan akses baris yang menolak.

### Ketetapan

> **BR-66 (bentuk yang berlaku).** Setiap tabel dan tampilan yang perlu dibaca atau ditulis klien wajib diberi hak akses secara eksplisit sebagai bagian dari pernyataan yang sama dengan pembuatannya, bukan sebagai langkah terpisah yang dikerjakan belakangan. Pemberian hak dan penyusunan aturan akses baris adalah dua lapisan berbeda dan keduanya wajib ada.
>
> **Cara membedakan dua kegagalan yang mirip:**
>
> | Gejala | Sebab | Tempat memeriksa |
> | --- | --- | --- |
> | Galat disertai petunjuk yang menyebutkan peran dan hak yang kurang | Hak akses belum diberikan | Pernyataan pemberian hak |
> | Jawaban berhasil tetapi kosong, tanpa galat | Aturan akses baris menolak seluruh baris | Kebijakan akses baris |
> | Galat tabel tidak ditemukan | Tabel memang belum ada, atau namanya keliru | Skema |
>
> Ketiganya berbeda dan tidak boleh disamakan.

Tingkat P-17 diturunkan dari **memblokir operasional** menjadi **langkah pembangunan biasa**. Ia tetap wajib dikerjakan, tetapi kelalaiannya akan ketahuan pada percobaan pertama, bukan setelah berjam-jam.

Butir uji U-6.4-05 tetap berlaku dengan satu penyesuaian: yang dicari bukan tabel yang menjawab kosong, melainkan tabel yang **bergalat**. Tabel yang menjawab kosong justru menunjukkan hak aksesnya sudah ada dan yang bekerja adalah aturan akses baris.

## J.2 Daftar tabel pada P-17 — V-02

### Duduk perkaranya

Tiga kekeliruan pada satu daftar.

**Pertama, hitungannya salah.** Tertulis "Sebelas tabel yang wajib didaftarkan", lalu tujuh belas nama disebutkan.

**Kedua, satu tabel hilang.** `foto_dokumentasi` tidak ada dalam daftar. Tabel itu sudah dipakai sejak Modul 6.3 — setiap foto yang diunggah pelaksana menyisipkan satu baris ke sana dari sisi klien. Tanpa hak akses, seluruh pengunggahan foto gagal. Ini yang membuat temuan ini memblokir, bukan sekadar tidak rapi.

**Ketiga, tampilan tidak disinggung sama sekali.** Lihat J.7.

### Ketetapan

Daftar yang berlaku, disusun menurut peran yang membutuhkannya. Peran `anon` tidak pernah diberi hak apa pun pada tabel mana pun, karena SiPANTAU tidak memiliki jalur tanpa masuk.

**Tabel yang dibaca dan ditulis klien**

```sql
grant select, insert, update on public.laporan_harian    to authenticated;
grant select, insert, update on public.catatan_laporan   to authenticated;
grant select, insert         on public.foto_dokumentasi  to authenticated;
grant select, insert         on public.location_logs     to authenticated;
grant select, insert, update on public.sesi_tugas        to authenticated;
grant select, insert, update on public.penugasan         to authenticated;
grant select, insert, update on public.penugasan_dasar   to authenticated;
grant select, insert, update on public.penugasan_lokasi  to authenticated;
grant select, insert, update on public.penugasan_pelaksana to authenticated;
grant select, insert, update on public.penugasan_panit   to authenticated;
grant select, update         on public.notifikasi        to authenticated;
grant select, update         on public.users             to authenticated;
```

**Tabel yang hanya dibaca klien**

```sql
grant select on public.unit           to authenticated;
grant select on public.jejak_audit    to authenticated;
grant select on public.laporan_versi  to authenticated;
grant select on public.catatan_versi  to authenticated;
grant select on public.posisi_terkini to authenticated;
```

**Tabel yang sengaja tidak diberi hak apa pun**

```sql
-- Tidak ada pernyataan pemberian hak untuk kedua tabel ini.
-- Keduanya hanya disentuh fungsi ber-security definer dari dalam basis data.
--   public.pembatasan_laju
--   public.titik_penanda
--   public.perangkat_masuk
```

`perangkat_masuk` ditambahkan ke kelompok terakhir, berbeda dari daftar asli P-17. Penulisannya seluruhnya lewat Fungsi Tepi dan pemicu, dan tidak ada satu pun layar yang membacanya langsung. Membukanya berarti memberi tahu setiap pengguna perangkat apa saja yang dipakai rekan-rekannya, tanpa ada yang membutuhkannya.

Tidak ada `delete` pada satu tabel pun. Seluruh penghapusan berjalan lewat fungsi ber-`security definer` yang memeriksa syaratnya sendiri, sesuai BR-12 dan BR-32.

> **Butir uji U-J-01.** Unggah satu foto sebagai pelaksana pada basis data yang seluruh hak aksesnya sudah dipasang. Bila gagal dengan galat hak akses pada `foto_dokumentasi`, berarti daftar ini belum diterapkan penuh.

## J.3 Jangkauan BR-64 — V-03

### Duduk perkaranya

Ini temuan terpenting pada pemeriksaan v0.6.

P-16 menetapkan BR-64: setiap perhitungan yang menyangkut hari kalender wajib dilakukan pada zona waktu `Asia/Jakarta`. Aturannya benar dan alasannya kuat. Tetapi P-16 hanya memperbaiki **satu** tempat, yaitu `v_belum_lapor`.

Penelusuran atas seluruh berkas yang berlaku menemukan **tiga tempat lain** yang melanggar aturan yang sama:

| Tempat | Bentuk yang melanggar | Berkas asal |
| --- | --- | --- |
| `kerja_periksa_lewat_batas` | `p.tanggal_batas < current_date` | Addendum 6.2-T Bagian 1.5 |
| `penugasan_tampil`, kolom `lewat_batas` | `p.tanggal_batas < current_date` | Addendum 6.2-T Bagian 7.2 |
| `penugasan_tampil`, kolom `hari_terlampaui` | `current_date - p.tanggal_batas` | Addendum 6.2-T Bagian 7.2 |

Ketiganya membandingkan kolom bertipe tanggal dengan `current_date`, dan `current_date` mengikuti zona waktu basis data. Pada server berzona UTC, hasilnya bergeser tujuh jam.

Akibatnya nyata dan senyap sekaligus. Sebuah SPT yang batas waktunya hari ini akan **ditandai lewat batas sejak pukul 17.00 WIB kemarin**, karena pada saat itu server sudah berganti tanggal. Kanit melihat penanda merah pada penugasan yang sebenarnya masih punya sisa waktu satu hari penuh. Pemberitahuan lewat batas juga terkirim sehari lebih awal. Tidak ada galat, tidak ada yang mencurigai apa pun — angkanya sekadar meleset satu hari, setiap hari.

Aturan yang dinyatakan tetapi tidak diterapkan ke seluruh tempat yang melanggarnya adalah bentuk kegagalan tersendiri, dan mudah terjadi justru ketika aturannya lahir di modul yang berbeda dari tempat pelanggarannya.

### Ketetapan

Ketiga tempat diperbaiki. Bentuk yang berlaku bagi `penugasan_tampil`, menggantikan bentuk pada Addendum 6.2-T Bagian 7.2:

```sql
create or replace view public.penugasan_tampil
with (security_invoker = on)
as
select p.*,
       (p.tanggal_batas is not null
        and p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
        and p.status in ('baru', 'berjalan', 'bermasalah'))      as lewat_batas,
       ((now() at time zone 'Asia/Jakarta')::date - p.tanggal_batas)
                                                                 as hari_terlampaui
  from public.penugasan p;

grant select on public.penugasan_tampil to authenticated;
```

Bentuk yang berlaku bagi `kerja_periksa_lewat_batas`, menggantikan klausa penyaring pada Addendum 6.2-T Bagian 1.5:

```sql
     where p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
       and p.status in ('baru', 'berjalan', 'bermasalah')
       and p.lewat_batas_diberitahukan_pada is null
```

> **Perluasan BR-64.** Aturan ini berlaku surut terhadap seluruh berkas yang sudah dinyatakan selesai, bukan hanya terhadap modul yang lahir sesudahnya. Sebelum sesi coding dimulai, seluruh kemunculan `current_date` dan `now()::date` pada dokumen wajib ditelusuri dan dipastikan sudah didahului `at time zone 'Asia/Jakarta'`. Empat tempat sudah ditemukan dan diperbaiki; penelusuran tetap wajib diulang setiap kali modul baru masuk.

> **Butir uji U-J-02.** Setel jam sistem ke pukul 18.00 WIB, buat SPT yang batas waktunya hari ini, lalu buka daftar penugasan. Penanda Lewat Batas **tidak boleh** muncul. Bila muncul, salah satu dari ketiga tempat di atas belum diperbaiki.

## J.4 Seksi P-10 yang hilang — V-04

Riwayat Koreksi Modul 6.4 memuat baris P-10 berbunyi *"BR-61 tidak dapat ditegakkan lewat hak akses per kolom → tabel `titik_penanda` terpisah"*. Tidak ada seksi P-10 pada Bagian 0.

Substansinya tidak hilang — tabel `titik_penanda` berdiri lengkap pada Section 5.22. Yang hilang adalah penjelasan mengapa keputusan itu diambil, yaitu bahwa Postgres tidak dapat membatasi hak baca sampai tingkat kolom dengan cara yang dibutuhkan BR-61, sehingga kolom yang lingkup bacanya berbeda harus dipisahkan ke tabel tersendiri.

> **Ketetapan.** Alasan itu dicatat sebagai pengantar Section 5.22, bukan sebagai seksi P-10 baru. Baris P-10 pada Riwayat Koreksi tetap dipertahankan karena keputusannya memang diambil, dengan keterangan bahwa uraiannya berada di Section 5.22.

## J.5 P-11 sampai P-15 — V-05

Penomoran melompat dari P-10 ke P-16 tanpa keterangan. Dari susunannya, lompatan itu tampak disengaja untuk memisahkan temuan sebelum penggalian dari temuan sesudahnya.

> **Ketetapan.** Lompatan dipertahankan, dan sebabnya dicatat pada pengantar Bagian 0: P-01 sampai P-10 adalah temuan sebelum penggalian, P-16 sampai P-22 adalah temuan sesudahnya. Nomor P-11 sampai P-15 tidak pernah dipakai dan tidak boleh dipakai kelak, sesuai kebiasaan yang sudah berlaku bagi kode BR dan KP.

## J.6 Klaim jumlah temuan — V-06

Pembuka menyebut enam belas temuan, yang cocok dengan jumlah seksi. Riwayat Koreksi memuat tujuh belas baris karena memuat P-10 yang tidak berseksi.

> **Ketetapan.** Jumlah yang berlaku adalah **tujuh belas temuan**, karena P-10 adalah keputusan yang benar-benar diambil dan berbuah tabel tersendiri. Pembuka dan Riwayat Revisi diperbaiki dari "enam belas" menjadi "tujuh belas". Jumlah seksi tetap enam belas, dan itu bukan ketidaksesuaian setelah J.4 menjelaskan letaknya.

## J.7 Hak baca tampilan — V-07

### Duduk perkaranya

P-17 menyusun daftar tabel yang wajib diberi hak akses, tetapi tidak menyinggung tampilan sama sekali.

Tampilan adalah relasi, sama seperti tabel, dan hak bacanya diatur dengan cara yang sama. Penelusuran atas seluruh berkas menemukan hanya **satu** tampilan yang memiliki pernyataan pemberian hak, yaitu `rekap_laporan_tim` pada Bagian I.A.4. Lima tampilan lain tidak memilikinya.

Akibatnya seragam: seluruh layar yang membaca tampilan itu gagal, dan kegagalannya bergalat jelas sesuai J.1 — jadi akan ketahuan cepat, tetapi tetap memblokir sampai diperbaiki.

### Ketetapan

```sql
grant select on public.penugasan_tampil     to authenticated;
grant select on public.v_belum_lapor        to authenticated;
grant select on public.rekap_laporan_tim    to authenticated;  -- sudah ada di Bagian I
grant select on public.kesehatan_sistem     to authenticated;
grant select on public.kesehatan_penjadwal  to authenticated;
```

Ditambah tampilan apa pun yang lahir dari Modul 6.4 untuk peta dan rute.

**Dua tampilan kesehatan diberi hak kepada seluruh peran terautentikasi, bukan hanya Kasubdit.** Ini disengaja dan bukan kelalaian. Pembatasan siapa yang boleh melihatnya ditegakkan di lapisan antarmuka menurut BR-11 dan di lapisan aturan akses baris tabel di baliknya, bukan dengan menahan hak baca tampilannya. Menahan hak baca akan menghasilkan galat yang membingungkan bagi peran lain, sedangkan menyembunyikan menunya sudah cukup dan sesuai dengan cara seluruh sistem ini bekerja.

Perlu dicatat satu batas yang tidak dapat dihindari: `kesehatan_penjadwal` membaca skema `cron`, dan peran terautentikasi tidak memiliki hak baca ke sana. Tampilan itu karena itu akan menjawab kosong bagi siapa pun, termasuk Kasubdit, kecuali hak bacanya diberikan secara khusus atau tampilan itu diubah menjadi fungsi ber-`security definer`.

> **Ketetapan tambahan.** `kesehatan_penjadwal` diubah dari tampilan menjadi fungsi ber-`security definer` yang memeriksa sendiri bahwa pemanggilnya berperan Kasubdit. Ini satu-satunya cara membacanya tanpa membuka skema `cron` kepada seluruh pengguna. Bentuk akhirnya ditetapkan saat Modul 6.5 digali, karena di sanalah ia ditampilkan.

Dicatat sebagai butir tertunda pada Modul 6.5.

---

## J.8 Urutan pengerjaan yang diperbarui

Menggantikan bagian yang bertumpang tindih pada Bagian I.15.

| No | Langkah | Rujukan |
| --- | --- | --- |
| 1 | Pasang PostGIS dan pg_cron, buat wadah penyimpanan `dokumentasi` | Bagian I.9, A.5 |
| 2 | Kerjakan seluruh temuan Bagian 0 Modul 6.4, terutama P-01, P-16, dan P-17 | Modul 6.4 |
| 3 | Bangun seluruh tabel dengan pemberian hak akses **di dalam pernyataan yang sama** | J.1, J.2 |
| 4 | Telusuri seluruh kemunculan `current_date` pada dokumen, pastikan sudah berzona `Asia/Jakarta` | J.3 |
| 5 | Pasang seluruh batasan pemeriksaan dan indeks unik parsial | Bagian I, Addendum 6.2-T |
| 6 | Pasang seluruh fungsi dan pemicu dalam bentuk yang sudah dikeraskan | Bagian I.3, I.4, I.5 |
| 7 | Aktifkan aturan akses baris dan susun kebijakannya, diuji dengan empat akun berbeda peran | Section 9 |
| 8 | Bangun seluruh tampilan dengan `security_invoker` yang dinyatakan tegas dan hak bacanya | J.7, Bagian I.2 |
| 9 | Pasang pekerjaan berjadwal | Addendum 6.2-T Bagian 1 |
| 10 | Bangun sisi aplikasi | Seluruh modul |

## J.9 Butir uji tambahan

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-J-01 | Unggah foto sebagai pelaksana | Hak akses `foto_dokumentasi` sudah diberikan |
| U-J-02 | Setel jam ke 18.00 WIB, buat SPT berbatas hari ini, buka daftar | Penanda Lewat Batas tidak muncul |
| U-J-03 | Baca kelima tampilan sebagai Anggota | Tidak ada yang bergalat hak akses |
| U-J-04 | Jalankan pekerjaan lewat batas pada pukul 18.00 WIB | Tidak ada pemberitahuan terkirim untuk SPT yang batasnya hari ini |
| U-J-05 | Coba baca `pembatasan_laju` dan `titik_penanda` dari klien | Keduanya bergalat hak akses, bukan menjawab kosong |

---

## Penutup berita acara v0.6

Tiga temuan memblokir. Satu di antaranya, jangkauan BR-64, berjenis yang belum pernah muncul pada pemeriksaan sebelumnya: bukan aturan yang keliru, bukan pula aturan yang bertabrakan, melainkan **aturan yang benar tetapi tidak diterapkan ke seluruh tempat yang melanggarnya**. Ini mudah terjadi ketika aturan lahir di satu modul sedangkan pelanggarannya berada di modul lain yang sudah dinyatakan selesai, dan tidak akan tertangkap oleh pemeriksaan mandiri modul mana pun — karena tiap modul memeriksa dirinya sendiri, bukan yang di belakangnya.

Satu temuan lain membalik penilaian Modul 6.4 sendiri setelah diverifikasi terhadap dokumentasi layanan. Ini pantas dicatat bukan karena keliru menilai adalah hal buruk, melainkan karena penilaian yang keliru tentang **bagaimana sesuatu gagal** menghasilkan perintah penanganan yang menyesatkan ke arah berlawanan. Menuliskan gejala secara tepat sama pentingnya dengan menemukan celahnya.

Dan dua temuan Modul 6.4 sendiri, P-01 dan P-16, lolos dari pemeriksaan silang v0.5 yang sudah dijalankan dengan sengaja mencari jenis yang sama persis. Kesimpulannya bukan bahwa pemeriksaan itu gagal, melainkan bahwa satu putaran tidak pernah cukup. Setiap berkas baru mewajibkan putaran baru, termasuk terhadap hasil putaran sebelumnya.


---

---
---

# BERITA ACARA PEMERIKSAAN SILANG — v0.5

**Tanggal: 2 Agustus 2026 · Pemeriksaan atas delapan berkas penyusun PRD**

Pemeriksaan dilakukan atas seluruh berkas yang menyusun dokumen ini, mencakup penomoran aturan, penamaan tabel dan kolom, urutan pemicu basis data, deklarasi tampilan, dan pengerasan fungsi. Empat belas titik ditemukan. Satu di antaranya gugur setelah diverifikasi, lima memblokir pembangunan, dan delapan sisanya perlu diperbaiki sebelum modul berikutnya digali.

Seluruh koreksinya ada pada **Bagian I** di akhir dokumen ini, dan Bagian I memiliki kekuatan tertinggi bila bertentangan dengan bagian mana pun di atasnya.

---

## Ringkasan temuan

| Kode | Temuan | Tingkat | Koreksi |
| --- | --- | --- | --- |
| T-01 | Nama kolom berkas foto bertabrakan antara PRD dasar dan Addendum 6.3-T | **Memblokir** | I.1 |
| T-02 | Tampilan `v_belum_lapor` tidak mendeklarasikan `security_invoker` sehingga melewati seluruh aturan akses baris | **Memblokir** | I.2 |
| T-03 | Fungsi `fn_minta_perbaikan` akan gagal saat dipanggil Panit karena berjalan dengan hak pemanggil | **Memblokir** | I.3 |
| T-04 | Delapan fungsi Addendum 6.3-T tidak mengunci `search_path` | **Memblokir** | I.4 |
| T-05 | Daftar kolom beku pada prosa tidak sama dengan yang benar-benar ditegakkan kode | Penting | I.5 |
| T-06 | Addendum 6.3-T merujuk BR-24 dengan penomoran sebelum penggeseran | Penting | I.6 |
| T-07 | Rujukan BR-21 pada KP-6.3-49 | **Gugur** | I.7 |
| T-08 | Penamaan pemicu Addendum 6.3-K tidak seragam sehingga urutan jalannya tidak sebagaimana dimaksud | Sedang | I.8 |
| T-09 | Wadah penyimpanan berkas foto belum dideklarasikan di mana pun | Sedang | I.9 |
| T-10 | Nama kolom waktu pembuatan belum dibakukan padahal sudah dirujuk fungsi | Sedang | I.10 |
| T-11 | Jumlah modul berubah menjadi sepuluh, belum tercermin pada Checklist | Ringan | I.11 |
| T-12 | Pemeriksaan baris kosong pada fungsi hitung lokasi memakai bentuk yang rapuh | Ringan | I.12 |
| T-13 | Addendum 6.3-K menambahkan kolom `penugasan.ditutup_pada` padahal sudah ada sejak Modul 6.2, dengan makna yang tidak sama | **Memblokir** | I.13 |
| T-14 | Kolom antrean pada `laporan_harian` ditulis sebagai `ALTER TABLE`, bertentangan dengan urutan pembangunan yang menyatukannya sejak awal | Ringan | I.14 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-01 sampai BR-53 | Tidak ada tabrakan tersisa. Penggeseran pada Addendum 6.2-T sudah menyelesaikan bentrokan lama, dan BR-38 sampai BR-53 tidak beririsan |
| Penomoran KP tiap modul | Tidak ada tabrakan. KP-6.3 berhenti di 64 lalu dilanjut 65 oleh Addendum 6.3-K |
| Urutan pemicu `BEFORE INSERT` pada `laporan_harian` | Aman. Ketiga pemicu Addendum 6.3-T saling bebas |
| Tampilan `penugasan_tampil` dan `kesehatan_penjadwal` | Keduanya sudah `security_invoker = on` sesuai BR-37 |
| Aturan Antrean Luring terhadap aturan satu perangkat per akun | Tidak bertabrakan. Pemisahan dua kolom perangkat pada Addendum 6.3-K menyelesaikannya |

---
---

# BAGIAN I — KOREKSI HASIL PEMERIKSAAN SILANG

**Status: [FINAL] · Kekuatan tertinggi dalam dokumen ini**

## I.1 Nama kolom berkas foto — T-01

### Duduk perkaranya

Section 5.6 PRD dasar menamai kolom penunjuk berkas `berkas_path`. Addendum 6.3-T Celah 9 memakai `jalur_berkas` pada fungsi pembersih foto yatim. Keduanya menunjuk hal yang sama dengan nama berbeda.

Akibatnya bukan sekadar tidak rapi. Fungsi `fn_bersihkan_foto_yatim` menyaring dengan `name NOT IN (SELECT jalur_berkas FROM foto_dokumentasi)`. Bila kolom itu tidak ada, fungsi gagal setiap kali dijalankan, dan karena ia berjalan sebagai pekerjaan berjadwal tengah malam, kegagalannya tidak akan terlihat siapa pun. Berkas yatim menumpuk diam-diam.

### Ketetapan

Nama yang berlaku adalah **`berkas_path`**, karena ia lebih dahulu ada dan sudah terdaftar pada model data induk. Perbaikan pada Addendum 6.3-T Celah 9:

```sql
create or replace function public.fn_bersihkan_foto_yatim()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects
   where bucket_id = 'dokumentasi'
     and created_at < now() - interval '24 hours'
     and name not in (
       select f.berkas_path
         from public.foto_dokumentasi f
        where f.berkas_path is not null
     );
end;
$$;
```

Penambahan `where f.berkas_path is not null` bukan sekadar kehati-hatian. Dalam SQL, `not in` terhadap kumpulan yang memuat satu saja nilai kosong akan menghasilkan kumpulan hampa — artinya **tidak satu pun berkas terhapus**, tanpa galat apa pun. Ini kegagalan senyap kedua yang tersembunyi di dalam fungsi yang sama.

## I.2 Tampilan `v_belum_lapor` — T-02

### Duduk perkaranya

Addendum 6.3-T Celah 7 membuat tampilan tanpa menyebutkan `security_invoker` sama sekali. Nilai bawaan PostgreSQL untuk pengaturan itu adalah mati, yang berarti tampilan berjalan dengan hak pemiliknya dan **seluruh aturan akses baris pada ketiga tabel di baliknya dilewati**.

Section 9.2 Modul 6.3 menyatakan tampilan ini terbaca oleh Kanit unit pemilik dan Kasubdit. Kenyataannya, tanpa deklarasi dan tanpa penyaringan diri, setiap pengguna yang berhasil masuk dapat membaca daftar seluruh pelaksana yang belum melapor di seluruh unit.

Ini setingkat dengan temuan A.4 pada Addendum 6.3-K, tetapi luput dari sana karena di sana yang diperiksa hanya tampilan yang **sengaja** dimatikan pengamanannya. Yang ini tidak sengaja — dan justru itu yang membuatnya lebih berbahaya.

### Ketetapan

Berbeda dengan `rekap_laporan_tim`, tampilan ini **tidak memerlukan pengecualian BR-37**. Dengan `security_invoker = on`, aturan akses baris ketiga tabel di baliknya justru menghasilkan penyaringan yang tepat dengan sendirinya: Kanit membaca unitnya, Kasubdit membaca seluruhnya, dan pelaksana hanya melihat barisnya sendiri, yang tidak berbahaya karena ia memang berhak tahu dirinya belum melapor.

```sql
create or replace view public.v_belum_lapor
with (security_invoker = on)
as
select pp.penugasan_id,
       pp.pelaksana_id,
       p.unit_id,
       p.nomor_spt
  from public.penugasan_pelaksana pp
  join public.penugasan p on p.id = pp.penugasan_id
 where p.status in ('baru', 'berjalan', 'bermasalah')
   and p.wajib_lapor_harian = true
   and pp.dicabut_pada is null
   and not exists (
     select 1
       from public.laporan_harian lh
      where lh.penugasan_id = pp.penugasan_id
        and lh.pelapor_id   = pp.pelaksana_id
        and lh.status_laporan <> 'ditarik'
        and lh.direkam_pada::date = current_date
   );
```

Dua perubahan lain menyertainya. Kolom `unit_id` dan `nomor_spt` ditambahkan karena Modul 6.9 akan membutuhkannya untuk menentukan penerima pemberitahuan tanpa harus membaca ulang tabel `penugasan`. Dan `dikirim_pada` diganti `direkam_pada` sesuai BR-45 — tanpa penggantian ini, seorang Anggota yang menulis laporan sore hari di area tanpa sinyal akan tercatat belum melapor meski laporannya sudah tiba.

> **Butir uji U-I-01.** Masuk sebagai Anggota dari unit lain, lalu baca `v_belum_lapor`. Hasilnya wajib hanya memuat barisnya sendiri, bukan baris orang lain dan bukan baris unit lain.

## I.3 Fungsi `fn_minta_perbaikan` — T-03

### Duduk perkaranya

Fungsi ini melakukan pembaruan pada `laporan_harian` ketika seorang peninjau menyisipkan catatan berjenis minta perbaikan. Ia ditulis tanpa `security definer`, sehingga berjalan dengan hak pemanggilnya.

Pemanggilnya adalah Panit. Menurut Section 9.2, hak tulis pada `laporan_harian` hanya dimiliki pelapornya sendiri dan Kanit untuk kolom persetujuan. **Panit tidak memiliki hak tulis sama sekali.**

Akibatnya, setiap kali Panit meminta perbaikan, penyisipan catatannya akan gagal seluruhnya — bukan hanya perpindahan statusnya. Fitur ini tidak akan pernah berjalan sekali pun.

Kegagalan yang sama mengintai `fn_periksa_pelapor_aktif` dan `fn_larang_tinjau_sendiri`, yang membaca tabel di luar lingkup pemanggilnya.

### Ketetapan

```sql
create or replace function public.fn_minta_perbaikan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.jenis = 'minta_perbaikan' then
    update public.laporan_harian
       set status_laporan = 'perlu_diperbaiki'
     where id = new.laporan_id
       and status_laporan not in ('disetujui', 'ditarik');
  end if;
  return new;
end;
$$;
```

Ini menerbitkan pertanyaan yang harus dijawab sekalian: pembaruan di atas berjalan dengan hak pemilik, sehingga ia melewati aturan akses baris. Yang menjaga agar Panit tidak dapat mengubah sembarang laporan adalah pemicu `trg_larang_tinjau_sendiri` dan kebijakan penyisipan pada `catatan_laporan`. Keduanya wajib ada sebelum fungsi ini dipasang, bukan sesudahnya.

## I.4 Pengerasan seluruh fungsi Addendum 6.3-T — T-04

Addendum 6.1-T menetapkan setiap fungsi yang berjalan dengan hak pemilik wajib mengunci `search_path` menjadi kosong. Alasannya, tanpa penguncian itu seseorang yang dapat membuat skema baru dapat menyisipkan tabel bernama sama dan membuat fungsi membaca tabel yang keliru.

Kedelapan fungsi Addendum 6.3-T ditulis tanpa penguncian itu, dan tujuh di antaranya juga tanpa `security definer`.

### Ketetapan

| Fungsi | `security definer` | `set search_path = ''` | Alasan |
| --- | --- | --- | --- |
| `fn_hitung_lokasi_laporan` | Ya | Ya | Membaca `penugasan_lokasi` di luar lingkup pelapor |
| `fn_kunci_laporan` | Ya | Ya | Membaca status `penugasan` |
| `fn_isi_sesi_tugas` | Ya | Ya | Membaca `sesi_tugas` |
| `fn_tandai_sunting` | Tidak | Ya | Hanya menyentuh baris yang sedang diubah |
| `fn_minta_perbaikan` | Ya | Ya | Menulis ke tabel di luar hak pemanggil, lihat I.3 |
| `fn_larang_tinjau_sendiri` | Ya | Ya | Membaca `laporan_harian` milik orang lain |
| `fn_bersihkan_foto_yatim` | Ya | Ya | Sudah `security definer`, kurang `search_path` |
| `fn_periksa_pelapor_aktif` | Ya | Ya | Membaca `penugasan` dan `penugasan_pelaksana` |

Seluruh nama tabel di dalam kedelapan fungsi wajib ditulis lengkap dengan skemanya, misalnya `public.penugasan`, bukan `penugasan` saja. Dengan `search_path` kosong, nama tanpa skema tidak akan ditemukan dan fungsi gagal.

## I.5 Daftar kolom beku — T-05

### Duduk perkaranya

Prosa Addendum 6.3-T Celah 1 menyebut empat belas kolom beku. Kode `fn_tandai_sunting` hanya benar-benar mengembalikan sepuluh. Empat yang disebut tetapi tidak ditegakkan: `alasan_lokasi`, `alasan_lokasi_lainnya`, `penanda_perangkat`, dan `dikirim_pada`.

Kolom `jenis` juga semestinya beku — Modul 6.3 menyatakan yang dapat disunting hanya `uraian`, `kendala`, dan `status_kegiatan` — tetapi tidak disebut pada daftar mana pun. Ditambah empat kolom baru dari Addendum 6.3-K, daftar sesungguhnya menjadi sembilan belas.

Yang tidak ditegakkan berarti dapat diubah. Seorang pelapor yang mengirim permintaan pembaruan langsung ke basis data dapat mengganti alasan lokasinya, atau lebih buruk, mengganti penanda perangkatnya.

### Ketetapan

```sql
create or replace function public.fn_tandai_sunting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.uraian          is distinct from old.uraian
  or new.kendala         is distinct from old.kendala
  or new.status_kegiatan is distinct from old.status_kegiatan then
    new.disunting_pada   := now();
    new.jumlah_suntingan := coalesce(old.jumlah_suntingan, 0) + 1;

    if old.status_laporan = 'perlu_diperbaiki' then
      new.status_laporan := 'terkirim';
    end if;
  end if;

  -- Sembilan belas kolom beku. Daftar ini lengkap; menambah kolom fakta
  -- baru pada laporan_harian mewajibkan menambahkannya di sini juga.
  new.penugasan_id           := old.penugasan_id;
  new.pelapor_id             := old.pelapor_id;
  new.sesi_tugas_id          := old.sesi_tugas_id;
  new.jenis                  := old.jenis;
  new.lokasi_lat             := old.lokasi_lat;
  new.lokasi_lng             := old.lokasi_lng;
  new.akurasi_meter          := old.akurasi_meter;
  new.status_lokasi          := old.status_lokasi;
  new.lokasi_id              := old.lokasi_id;
  new.lokasi_id_terdekat     := old.lokasi_id_terdekat;
  new.jarak_meter            := old.jarak_meter;
  new.alasan_lokasi          := old.alasan_lokasi;
  new.alasan_lokasi_lainnya  := old.alasan_lokasi_lainnya;
  new.penanda_perangkat      := old.penanda_perangkat;
  new.penanda_perangkat_asal := old.penanda_perangkat_asal;
  new.antrean_id             := old.antrean_id;
  new.direkam_pada           := old.direkam_pada;
  new.dikirim_pada           := old.dikirim_pada;
  new.diterima_terlambat     := old.diterima_terlambat;

  return new;
end;
$$;
```

Perhatikan bahwa `keterangan_lokasi` sengaja **tidak** dibekukan. Kolom itu berisi keterangan pelapor tentang keberadaannya bila laporannya terekam di luar titik, dan itu tulisan manusia, bukan fakta yang direkam sistem.

Perpindahan status dari perlu diperbaiki ke terkirim juga dipindahkan ke dalam blok yang sama, karena pada bentuk aslinya ia diperiksa dua kali dengan syarat yang sedikit berbeda.

## I.6 Rujukan BR-24 pada Addendum 6.3-T — T-06

Celah 3 menulis bahwa sesi aktif pada SPT lain sah menurut BR-24. Setelah penggeseran penomoran pada Addendum 6.2-T Bagian 0.2, BR-24 berbunyi tentang Fungsi Tepi dan kunci istimewa — bukan tentang Sesi Tugas.

Aturan yang dimaksud adalah **BR-27**: satu Sesi Tugas aktif per orang, lintas seluruh SPT.

> **Perbaikan.** Pada Addendum 6.3-T Celah 3, ganti rujukan BR-24 menjadi BR-27.

Ini persis jenis kekeliruan yang diperingatkan Addendum 6.2-T Bagian 0.4: berkas yang digali pada waktu berbeda memakai penomoran yang berlaku saat itu, tanpa mengetahui penomorannya sudah bergeser.

## I.7 Rujukan BR-21 pada KP-6.3-49 — T-07, GUGUR

Addendum 6.3-K butir A.6 menyisakan rujukan ini untuk diverifikasi. Verifikasi sudah dilakukan.

BR-21 berbunyi: lingkup data Panit ditentukan oleh penugasan tempat ia ditunjuk, bukan oleh unitnya, dan penunjukan yang sudah berakhir tetap memberi hak baca atas riwayat penugasan tersebut.

KP-6.3-49 menyatakan Panit yang sudah dicabut tetap dapat membaca laporan tetapi tidak dapat memberi catatan baru. Bagian pertama persis BR-21.

> **Ketetapan.** Rujukan BR-21 pada KP-6.3-49 **benar dan tidak diubah**. Butir A.6 pada Addendum 6.3-K dinyatakan selesai, dan butir uji U-6.3-14 dicabut.

Bagian kedua kriteria itu — larangan memberi catatan baru — berasal dari keputusan penggalian Modul 6.2 dan tidak memiliki kode aturan tersendiri. Itu tidak menjadikannya kurang mengikat, tetapi bila kelak dirujuk dari modul lain, sebaiknya diangkat menjadi aturan bernomor.

## I.8 Penamaan pemicu Addendum 6.3-K — T-08

### Duduk perkaranya

PostgreSQL menjalankan pemicu dengan peristiwa yang sama menurut urutan abjad namanya. Addendum 6.3-T menamai seluruh pemicunya dengan awalan `trg_`. Addendum 6.3-K menamai dua pemicunya tanpa awalan itu: `periksa_wewenang_setuju` dan `rekam_versi_laporan`.

Akibatnya keduanya berjalan **sebelum** seluruh pemicu Addendum 6.3-T, termasuk sebelum `trg_kunci_laporan` yang memeriksa apakah laporan sudah terkunci. Perekaman versi karena itu terjadi lebih dahulu daripada pemeriksaan kunci.

Ini tidak sampai merusak data, karena penolakan oleh pemicu mana pun membatalkan seluruh transaksi termasuk baris versi yang sempat tersisip. Tetapi ia menyalahi maksud rancangannya, dan menggantungkan kebenaran pada perilaku pembatalan transaksi adalah bentuk kerapuhan yang tidak perlu.

### Ketetapan

Kedua pemicu diganti namanya menjadi `trg_periksa_wewenang_setuju` dan `trg_rekam_versi_laporan`. Urutan yang dihasilkan:

| Urutan | Pemicu | Tugas |
| --- | --- | --- |
| 1 | `trg_kunci_laporan` | Menolak bila laporan atau SPT sudah terkunci |
| 2 | `trg_larang_tinjau_sendiri` | Peristiwa berbeda, pada tabel catatan |
| 3 | `trg_minta_perbaikan` | Peristiwa berbeda, pada tabel catatan |
| 4 | `trg_periksa_wewenang_setuju` | Memeriksa siapa yang berhak menyetujui |
| 5 | `trg_rekam_versi_laporan` | Menyimpan salinan nilai lama |
| 6 | `trg_tandai_sunting` | Menaikkan penghitung dan membekukan kolom fakta |

Pemeriksaan kunci kini berjalan lebih dahulu, sebagaimana dimaksud semula.

> **Aturan penamaan, ditambahkan pada Section 0.5.** Seluruh pemicu diberi nama berawalan `trg_` dan seluruh fungsi pemicu berawalan `fn_`. Penamaan bukan sekadar kerapian: urutan jalannya pemicu ditentukan abjad nama, sehingga penamaan yang tidak seragam mengubah urutan tanpa terlihat.

## I.9 Wadah penyimpanan berkas — T-09

Fungsi `fn_bersihkan_foto_yatim` menyebut wadah bernama `dokumentasi`. Nama itu tidak dideklarasikan di berkas mana pun, dan Section 9.3 hanya menyebut berkas foto tidak boleh terbuka bagi siapa pun yang mengetahui tautannya.

### Ketetapan

Satu wadah tertutup bernama **`dokumentasi`**, dibuat sebelum Modul 6.3 dibangun.

```sql
insert into storage.buckets (id, name, public)
values ('dokumentasi', 'dokumentasi', false)
on conflict (id) do nothing;
```

Susunan nama berkas di dalamnya: `{penugasan_id}/{laporan_id}/{uuid}.{ekstensi}`. Susunan ini dipilih agar penghapusan seluruh berkas milik satu SPT dapat dilakukan dengan satu awalan, yang akan dibutuhkan Modul 6.10 saat mengekspor dan saat SPT dihapus permanen menurut BR-32.

Akses berkas diberikan lewat tautan bermasa berlaku terbatas, tidak pernah lewat tautan tetap. Masa berlakunya lima belas menit untuk penayangan biasa dan satu jam untuk berkas ekspor.

## I.10 Nama kolom waktu pembuatan — T-10

Section 5 PRD dasar mewajibkan setiap tabel memiliki kolom waktu pembuatan tetapi tidak membakukan namanya. Fungsi `fn_nilai_kiriman_tertunda` pada Addendum 6.3-K sudah merujuk `penugasan.dibuat_pada`, dan tabel `notifikasi` pada Addendum 6.2-T juga memakainya.

> **Ketetapan.** Nama baku adalah `dibuat_pada` untuk waktu pembuatan dan `diubah_pada` untuk waktu perubahan terakhir. Berlaku bagi seluruh tabel tanpa kecuali, termasuk yang sudah terlanjur ditulis dengan nama lain.

Tabel yang memakai nama lain untuk maksud yang sama tetap dibiarkan bila namanya membawa arti tambahan: `dikirim_pada` pada laporan bukan sekadar waktu pembuatan baris, melainkan waktu laporan tiba, dan itu berbeda dari `direkam_pada`.

## I.11 Jumlah modul — T-11

Addendum 6.3-K memperkenalkan Section 6.10 untuk Ekspor Data dan Pembatasan Laju. Jumlah modul fungsional karena itu menjadi sepuluh, bukan sembilan.

| Modul | Status |
| --- | --- |
| 6.1 Autentikasi & Peran | Final |
| 6.2 Manajemen Penugasan | Final |
| 6.3 Pelaporan Kegiatan Harian & Foto | Final |
| 6.4 GPS Tracking & Peta Waktu Nyata | Belum digali |
| 6.5 Dashboard & Monitoring | Belum digali |
| 6.6 Manajemen User | Belum digali |
| 6.7 Dokumentasi Foto & Kolase | Belum digali |
| 6.8 LHP Ringkas Otomatis | Belum digali |
| 6.9 Notifikasi | Belum digali |
| **6.10 Ekspor Data & Pembatasan Laju** | **Baru, sudah bersisi** |

Modul 6.10 lahir sudah dengan kriteria penerimaannya sendiri, sehingga ia tidak menambah pekerjaan penggalian. Yang perlu diperbarui hanya Checklist Progres.

## I.12 Pemeriksaan baris kosong pada hitung lokasi — T-12

`fn_hitung_lokasi_laporan` memeriksa ketiadaan titik lokasi dengan `IF titik IS NULL`. Pada tipe rekaman, bentuk itu bernilai benar hanya bila **seluruh** medannya kosong. Ia kebetulan bekerja untuk keadaan sekarang, tetapi akan diam-diam meleset bila kelak baris ditemukan dengan sebagian medan kosong.

> **Ketetapan.** Ganti menjadi `IF NOT FOUND THEN`, yang memeriksa tepat apa yang dimaksud, yaitu apakah pernyataan sebelumnya menemukan baris.

## I.13 Kolom `penugasan.ditutup_pada` sudah ada — T-13

### Duduk perkaranya

Addendum 6.3-K Bagian B.1 menulis: *"Ini menuntut satu kolom baru pada tabel `penugasan`"* lalu mengeluarkan `alter table public.penugasan add column ditutup_pada timestamptz;`.

Modul 6.2 Section 5.2, baris yang mendefinisikan tabel `penugasan`, sudah memuat kolom ini sejak awal:

```
| ditutup_oleh | uuid | Kanit yang menutup ke status selesai |
| ditutup_pada | timestamptz | Waktu penutupan |
```

Dijalankan apa adanya, `ALTER TABLE ... ADD COLUMN ditutup_pada` akan gagal dengan galat kolom sudah ada — kegagalan yang justru berteriak dan mudah ditemukan. Yang lebih berbahaya adalah bila seseorang menghapus baris `ALTER TABLE` itu karena melihat kolomnya sudah ada, lalu menganggap perkaranya selesai. Ia belum selesai, karena maknanya berbeda.

Kolom lama pada Modul 6.2 hanya terisi ketika SPT ditutup lewat jalur **selesai** — tertulis eksplisit "Kanit yang menutup **ke status selesai**". Penutupan lewat jalur **dibatalkan** memakai pasangan kolom terpisah yang juga sudah ada sejak Modul 6.2: `dibatalkan_oleh` dan `dibatalkan_pada`.

Sementara itu BR-47 pada Addendum 6.3-K butuh mengetahui apakah SPT sudah **tertutup dengan cara apa pun** — selesai maupun dibatalkan — sebelum atau sesudah sebuah laporan ditulis. Bila fungsi `fn_nilai_kiriman_tertunda` dan pemicu `trg_periksa_pelapor_aktif` hanya membaca `ditutup_pada` sebagaimana tertulis, SPT yang **dibatalkan** tidak akan pernah terdeteksi tertutup. Laporan yang ditulis sebelum pembatalan lalu tiba sesudahnya akan diproses seolah SPT masih hidup, padahal BR-47 dimaksudkan menandainya diterima terlambat, bukan memprosesnya seperti biasa.

### Ketetapan

Tidak ada kolom baru. Yang dipakai adalah kolom yang sudah ada, digabung.

> **Perbaikan pada Addendum 6.3-K Bagian B.1.** Hapus seluruhnya pernyataan `alter table public.penugasan add column ditutup_pada timestamptz`. Kolom itu tidak pernah ditambahkan.
>
> Pada pemicu `fn_nilai_kiriman_tertunda` dan pada perubahan `trg_periksa_pelapor_aktif`, setiap rujukan `p.ditutup_pada` diganti menjadi ungkapan gabungan:
>
> ```sql
> coalesce(p.ditutup_pada, p.dibatalkan_pada)
> ```

Bentuk lengkap perubahan pada `trg_periksa_pelapor_aktif` yang berlaku:

```sql
and (p.status in ('baru','berjalan','bermasalah')
     or coalesce(p.ditutup_pada, p.dibatalkan_pada) > new.direkam_pada)
```

Dan pada `fn_nilai_kiriman_tertunda`, bagian yang merujuk waktu penerbitan tidak berubah, tetapi setiap pemeriksaan tambahan yang hendak dilakukan terhadap waktu penutupan wajib memakai bentuk gabungan yang sama, bukan `p.ditutup_pada` saja.

Baris pada tabel C.2 (Perubahan model data) Addendum 6.3-K yang berbunyi *"penugasan — Satu kolom baru: ditutup_pada"* dinyatakan tidak berlaku.

> **Butir uji U-I-07.** Buat SPT, tulis laporan dari perangkat yang lalu dimatikan jaringannya, batalkan SPT tersebut, baru sambungkan kembali jaringan agar laporan yang tertunda terkirim. Laporan wajib diterima dan ditandai diterima terlambat, persis seperti bila SPT ditutup lewat jalur selesai. Bila laporan diproses seolah SPT masih hidup, perbaikan ini belum diterapkan dengan benar.

## I.14 Kolom antrean ditulis sebagai `ALTER TABLE` — T-14

Addendum 6.3-K Bagian B.1 menyajikan keempat kolom antrean (`antrean_id`, `direkam_pada`, `diterima_terlambat`, `penanda_perangkat_asal`) dalam bentuk `ALTER TABLE ... ADD COLUMN`, seolah tabel `laporan_harian` sudah berdiri lebih dahulu tanpanya.

Ini tidak salah secara teknis untuk sistem yang belum berjalan — tabelnya memang belum pernah dibangun sungguhan, sehingga tidak ada risiko galat seperti T-13. Tetapi ia bertentangan dengan urutan pembangunan yang sama-sama tertulis pada berkas yang sama, yang menyatakan tabel ini dibangun **lengkap sejak awal** dengan seluruh kolom antrean sudah tercantum pada `create table`.

> **Ketetapan.** Bentuk `ALTER TABLE` pada Bagian B.1 dibaca sebagai **daftar kolom yang wajib ada**, bukan sebagai urutan perintah yang benar-benar dijalankan berurutan. Saat membangun, keempat kolom itu, ditambah kolom `penanda_perangkat` yang sudah ada dari Addendum 6.1-T, ditulis langsung sebagai bagian dari satu pernyataan `create table public.laporan_harian`, mengikuti I.13 pada Addendum 6.3-K Bagian C.4 poin 3.

---

## I.15 Urutan pengerjaan setelah koreksi

Menggantikan urutan pada Addendum 6.3-K Bagian C.4 pada bagian yang bertumpang tindih.

| No | Langkah | Rujukan |
| --- | --- | --- |
| 1 | Pasang ekstensi PostGIS | A.5 |
| 2 | Buat wadah penyimpanan `dokumentasi` | I.9 |
| 3 | Bangun `laporan_harian` lengkap dengan empat kolom antrean sejak awal | B.1 |
| 4 | Tambahkan `ditutup_pada` pada `penugasan` beserta pemicu pengisinya | B.1 |
| 5 | Pasang kedelapan fungsi Addendum 6.3-T dalam bentuk yang sudah dikeraskan | I.3, I.4, I.5, I.12 |
| 6 | Pasang pemicu Addendum 6.3-K dengan nama berawalan `trg_` | I.8 |
| 7 | Bangun `laporan_versi` dan `catatan_versi`, cabut hak tulisnya | B.2 |
| 8 | Bangun `v_belum_lapor` dengan `security_invoker = on` | I.2 |
| 9 | Bangun `rekap_laporan_tim` dengan penyaringan diri | A.4 |
| 10 | Bangun `pembatasan_laju` dan pasang pemanggilannya | B.4 |
| 11 | Bangun Fungsi Tepi `ekspor-unit` | B.3 |
| 12 | Bangun Antrean Luring pada sisi aplikasi | B.1 |

## I.16 Butir uji tambahan

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-I-01 | Baca `v_belum_lapor` sebagai Anggota unit lain | Hanya barisnya sendiri yang tampil |
| U-I-02 | Sisipkan catatan minta perbaikan sebagai Panit | Berhasil, dan status laporan berpindah |
| U-I-03 | Kosongkan `berkas_path` satu baris foto, jalankan pembersih foto yatim | Berkas lain tetap terhapus, tidak lumpuh seluruhnya |
| U-I-04 | Kirim permintaan pembaruan langsung ke basis data yang mengubah `penanda_perangkat` | Nilainya tidak berubah |
| U-I-05 | Sunting laporan lalu periksa urutan baris versi | Nomor versi berurutan tanpa lompatan |
| U-I-06 | Setujui laporan lalu coba menyuntingnya | Ditolak `trg_kunci_laporan`, bukan oleh pemicu lain |
| U-I-07 | Tulis laporan luring, batalkan SPT-nya, baru sambungkan jaringan | Laporan diterima dan ditandai diterima terlambat, sama seperti jalur selesai |

---

## Penutup berita acara

Lima temuan memblokir pembangunan. Empat di antaranya berupa kegagalan senyap yang tidak akan menampilkan pesan galat saat sistem berjalan: nama kolom yang keliru pada pekerjaan berjadwal, tampilan yang melewati aturan akses tanpa pernah menimbulkan galat, fungsi yang gagal hanya ketika dipanggil peran tertentu, dan kolom yang dinyatakan beku tetapi sebenarnya masih dapat diubah. Temuan kelima berbeda sifatnya — ia justru akan gagal secara berisik, kolom yang diklaim baru ternyata sudah ada dan pernyataan pembuatannya akan ditolak basis data seketika. Yang membuatnya tetap layak dicatat setara dengan yang lain adalah akibat sampingannya: kolom lama yang sudah ada itu maknanya tidak sepenuhnya sama dengan yang dibutuhkan, dan penyelesaian yang tergesa — sekadar menghapus baris yang gagal — akan meninggalkan cacat senyap kedua di baliknya.

Ini pola yang pantas dicatat untuk penggalian modul berikutnya. Kekeliruan yang berteriak akan ditemukan pada hari pertama pengujian. Yang berbahaya adalah yang diam, dan pemeriksaan silang antar berkas adalah satu-satunya cara menemukannya sebelum sistem dipakai.

Satu temuan gugur setelah diverifikasi. Itu juga pantas dicatat: dugaan tidak sama dengan temuan, dan menuliskan cara memutuskannya, sebagaimana dilakukan Addendum 6.3-K butir A.6, lebih baik daripada menebak ke arah mana pun.


---

---
---
