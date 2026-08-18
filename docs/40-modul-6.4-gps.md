# Modul 6.4 — GPS Tracking & Peta Waktu Nyata

Modul dengan aturan dan kondisi tepi terbanyak. Addendum sudah dilebur ke dalamnya,
tidak berdiri sendiri.

> Memuat daftar tertutup tujuh nilai `sebab_penutupan` yang sudah **final**. Jangan
> ditambah, dikurangi, atau disusun ulang dari modul mana pun.

---
---

# SiPANTAU — Section 6.4 UTUH: GPS Tracking & Peta Waktu Nyata

**Status: [FINAL] · Disusun 2 Agustus 2026 · Berkas tunggal, tanpa lapisan**

Berkas ini adalah Modul 6.4 dalam bentuk utuh. Berkas Revisi Modul 6.4 dan Addendum 6.4-K sudah
**dilebur ke dalamnya** dan keduanya tidak lagi berlaku sebagai berkas terpisah. Tidak ada lapisan
koreksi di dalam berkas ini; setiap ketetapan berdiri di tempatnya sendiri dalam bentuk terakhir
yang berlaku.

Ia menggantikan Section 6.4 pada PRD dasar secara utuh, memfinalkan tabel `sesi_tugas` yang lahir
berstatus [KERANGKA] di Modul 6.2, dan memfinalkan `location_logs` yang sejak versi 0.2 belum
pernah disentuh.

---

## Cara memakai berkas ini

Untuk sesi coding, lampirkan Section 0 sampai 5 dari PRD sebagai konteks tetap, lalu berkas ini
sebagai modul yang sedang dikerjakan, sesuai Section 0.7.

**Bagian 0 wajib dikerjakan lebih dahulu.** Isinya enam belas temuan pra dan pasca penggalian,
tujuh di antaranya memblokir dan lima berupa kegagalan senyap. Tiga di antaranya menyentuh Modul
6.1, 6.2, dan 6.3 yang sudah dinyatakan selesai, sehingga tidak dapat ditunda sampai giliran Modul
6.4 tiba.

**Revisi masa coding.** Bila kelak ditemukan kekeliruan, yang direvisi adalah berkas ini di
tempatnya, bukan lapisan baru di belakangnya. Jejaknya dicatat pada Riwayat Koreksi di bagian
akhir. Kode BR dan KP tidak pernah dipakai ulang, sekalipun aturannya dicabut.

## Penomoran yang berlaku

| Hal | Rentang |
| --- | --- |
| Aturan global yang lahir di modul ini | BR-54 sampai BR-67 |
| Amandemen atas aturan yang sudah ada | BR-51, BR-59, BR-62 |
| **Aturan berikutnya dimulai dari** | **BR-68** |
| Kriteria penerimaan | KP-6.4-01 sampai KP-6.4-72 |
| Butir uji | U-6.4-01 sampai U-6.4-11 |
| Tabel baru | 5.21 `posisi_terkini`, 5.22 `titik_penanda` |
| Calon Addendum 6.4-T | 22 butir |

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.6 | 2 Agu 2026 | Modul 6.4 digali penuh. `sesi_tugas` dan `location_logs` difinalkan. `posisi_terkini` dan `titik_penanda` lahir. Enam belas temuan ditutup. Addendum 6.4-K dilebur, tidak lagi berdiri sendiri |

---
---

# Bagian 0 — Temuan yang wajib dikerjakan lebih dahulu

## P-01 Kebijakan akses baris menyebut kolom yang sudah tidak ada — MEMBLOKIR

### Duduk perkaranya

Addendum 6.1-T memuat tiga kebijakan akses baris yang menyebut `laporan_harian.anggota_id`:
satu kebijakan baca pada Bagian 1.3, dan dua kebijakan tulis pada Bagian 3.4.

Kolom itu sudah tidak ada. Modul 6.2 Section 5.18 menggantinya menjadi `pelapor_id`, dan Modul
6.3 Section 5.4 mencabutnya secara eksplisit dengan alasan yang tertulis: pelapor kini dapat
berperan Anggota, Panit, maupun Kanit.

Kegagalannya berisik — kebijakan ditolak saat dibuat. Yang berbahaya justru penyelesaian
tergesanya, dan bentuknya persis seperti T-13: melakukan cari-ganti buta `anggota_id` menjadi
`pelapor_id` akan **ikut mengubah `location_logs.anggota_id`**, padahal kolom itu perlu keputusan
makna, bukan penggantian nama. Lihat P-02.

### Ketetapan

Pada Addendum 6.1-T Bagian 1.3 dan Bagian 3.4, seluruh rujukan `laporan_harian.anggota_id`
diganti menjadi `pelapor_id`. Rujukan `location_logs.anggota_id` **tidak** ikut diganti menjadi
`pelapor_id`; ia diganti menjadi `pengguna_id` menurut P-02, dengan alasan yang berbeda.

```sql
create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  pelapor_id = (select auth.uid())
  or ...
);
```

> **Butir uji U-6.4-01.** Pasang ketiga kebijakan Addendum 6.1-T apa adanya pada basis data
> kosong yang sudah memuat tabel `laporan_harian` bentuk final. Ketiganya wajib gagal. Bila ada
> yang berhasil, berarti tabelnya dibangun dengan kolom lama dan Modul 6.3 belum diterapkan benar.

## P-02 `location_logs.anggota_id` bernama keliru — MEMBLOKIR SENYAP

### Duduk perkaranya

Sejak BR-31, Kanit dan Panit yang dicantumkan sebagai pelaksana memperoleh kewenangan membuka
Sesi Tugas. Pemilik titik koordinat karena itu dapat berperan anggota, panit, maupun kanit.
Kolom `anggota_id` menyatakan hal yang tidak benar, dan kebijakan tulisnya ikut berbunyi
`anggota_id = (select auth.uid())`.

Sistem tetap berjalan dengan nama yang keliru — itulah kesenyapannya. Yang rusak adalah
keseragaman istilah: `sesi_tugas.pengguna_id`, `laporan_harian.pelapor_id`, dan
`location_logs.anggota_id` adalah tiga nama untuk satu maksud yang sama. Section 0.2 melarangnya
dengan alasan yang tepat: sinonim berisiko dibaca sebagai entitas berbeda.

### Ketetapan

Nama yang berlaku adalah **`pengguna_id`**, mengikuti `sesi_tugas`, bukan `pelapor_id`. Alasannya
tegas: `pelapor_id` membawa makna pelaporan, sedangkan titik koordinat bukan laporan. Yang
disimpan adalah keberadaan seseorang, dan `sesi_tugas` sudah lebih dahulu memakai istilah yang
netral untuk maksud itu.

## P-03 `location_logs` tidak dapat memisahkan sesi — MEMBLOKIR SENYAP

### Duduk perkaranya

Section 5.17 menuliskan alasan tabel `sesi_tugas` dilahirkan: satu SPT berlangsung berhari-hari
dan orang yang sama membuka lalu menutup sesi berkali-kali. Tetapi `location_logs` hanya memiliki
`penugasan_id`.

Akibatnya rute hari pertama dan rute hari ketiga menyatu menjadi satu garis yang melompat
semalaman melintasi kota. Penelusuran rute per sesi mustahil, ringkasan per sesi tidak dapat
dihitung, dan penyusutan data kehilangan pegangan yang paling wajar.

### Ketetapan

Kolom **`sesi_tugas_id` ditambahkan dan bersifat wajib**. Kolom `penugasan_id` **tetap
dipertahankan** meski kini dapat diturunkan darinya, karena dua alasan: BR-13 berbunyi harfiah
bahwa setiap titik wajib terikat pada satu SPT, dan indeks `(penugasan_id, direkam_pada)`
dibutuhkan untuk menggambar rute gabungan satu SPT tanpa menyusuri tabel sesi lebih dahulu.

Keduanya wajib konsisten, dan konsistensinya ditegakkan pemicu, bukan diandaikan. Lihat
Bagian 3 Section 5.7.

## P-04 Sesi menggantung mengunci pemiliknya bila penjadwal berhenti — MEMBLOKIR

### Duduk perkaranya

Tiga ketetapan yang masing-masing benar, bertemu menjadi jebakan:

1. Sesi menggantung ditutup otomatis setelah dua jam tanpa pembaruan posisi, dikerjakan pg_cron
2. Indeks unik parsial `sesi_tugas(pengguna_id) WHERE ditutup_pada IS NULL` sudah final
3. BR-36 melarang kebenaran sistem bergantung pada berjalannya penjadwal

Addendum 6.2-T Bagian 1.6 sudah memperingatkan bahwa penjadwal **benar-benar berhenti** pada
project paket gratis yang dijeda tujuh hari, dan berhentinya tidak menimbulkan galat apa pun.

Bila itu terjadi, sesi menggantung tidak pernah tertutup. Indeks unik lalu menolak setiap upaya
orang itu membuka sesi baru, dengan galat `23505` yang oleh aplikasi diterjemahkan menjadi
"Anda masih dalam Sesi Tugas untuk SPT sekian". Anggota yang kehabisan daya hari Jumat tidak
dapat Mulai Tugas hari Senin, dan tidak ada satu pun keterangan yang menjelaskan sebabnya.

Kemampuan seseorang memulai tugas dengan demikian bergantung pada berjalannya penjadwal. Itu
tepat yang dilarang BR-36.

### Ketetapan

Penutupan sesi menggantung **tidak boleh menjadi tugas penjadwal semata**. Fungsi pembukaan Sesi
Tugas menutup sendiri sesi basi milik pemanggilnya sebelum menyisipkan, di dalam kunci baris yang
sudah diwajibkan Addendum 6.2-T Bagian 8.3.

Penjadwal turun pangkat menjadi kurir pemberitahuan dan perapi data, persis seperti perlakuan
terhadap penanda Lewat Batas pada Addendum 6.2-T Bagian 7 dan penanda Belum Melapor pada
Addendum 6.3-T Celah 7. Pola itu sudah terbukti dua kali; berkas ini memakainya untuk ketiga
kalinya, bukan menciptakan pola baru.

Bentuk fungsinya ada pada calon Addendum 6.4-T butir 1, karena ia menyatakan jalur teknis, bukan
aturan bisnis.

> **Butir uji U-6.4-02.** Buka Sesi Tugas, matikan perangkat, jedakan pekerjaan berjadwal dengan
> `select cron.unschedule('tutup-sesi-menggantung')`, tunggu lewat dua jam, lalu buka Sesi Tugas
> baru dari perangkat lain. Pembukaan wajib berhasil dan sesi lama wajib tertutup dengan sebab
> menggantung. Bila ditolak `23505`, berarti penutupan masih bersandar pada penjadwal.

## P-05 Titik yang mengantre luring ditolak setelah ganti perangkat — PENTING, SENYAP

### Duduk perkaranya

BR-25 menuntut setiap penulisan ke tabel operasional membawa penanda perangkat yang cocok dengan
Perangkat Terdaftar pemiliknya. Addendum 6.3-K sudah memecahkan benturan ini untuk laporan lewat
pemisahan `penanda_perangkat` dan `penanda_perangkat_asal`.

`location_logs` hanya memiliki satu kolom penanda perangkat.

Akibatnya, orang yang berganti perangkat sebelum antrean titiknya terkirim, atau yang kata
sandinya direset sehingga baris `perangkat_masuk`-nya terhapus, kehilangan seluruh titik yang
belum sempat naik. Ditolak basis data, tanpa pesan yang sampai ke siapa pun. Rutenya berlubang,
dan lubang itu terbaca sebagai tidak bertugas.

### Ketetapan

`location_logs` menerima kolom `penanda_perangkat_asal`, mengikuti bentuk dan alasan yang sama
persis dengan `laporan_harian`. Bukan pelanggaran, bukan penolakan — perangkat tempat titik
direkam tetap tercatat sebagai fakta, sementara yang diperiksa Perangkat Terdaftar adalah
perangkat yang benar-benar mengirim.

## P-06 Retensi tidak pernah dimulai bila SPT tidak pernah ditutup — PENTING

### Duduk perkaranya

Retensi sembilan puluh hari dihitung sejak SPT selesai atau dibatalkan. SPT yang tidak pernah
ditutup tidak pernah memulai hitungan, dan Section 8.8 sudah mencatat draf yang ditinggalkan
berbulan-bulan sebagai kondisi tepi nyata. Titiknya hidup abadi di tabel yang Section 10.2 sebut
tumbuh paling cepat.

### Ketetapan

Ambang kedua yang tidak bergantung status SPT: **titik yang `direkam_pada`-nya lebih tua dari
tiga ratus enam puluh lima hari disusutkan tanpa memandang status SPT induknya.** Yang mana pun
yang lebih dahulu tercapai antara ambang ini dan sembilan puluh hari sejak penutupan, itulah yang
berlaku.

Angka satu tahun dipilih karena ia melampaui masa hidup wajar sebuah SPT penyelidikan sekaligus
menutup kemungkinan tabel tumbuh tanpa batas akibat SPT yang terlupakan. Ringkasan rute pada
`sesi_tugas` tetap ada selamanya, sehingga yang hilang adalah titik satuannya, bukan sejarahnya.

## P-07 `sesi_tugas` belum memiliki kolom waktu baku — SEDANG

### Ketetapan

`sesi_tugas` menerima `dibuat_pada` dan `diubah_pada` sesuai I.10 yang berlaku bagi seluruh tabel
tanpa kecuali. Keduanya berbeda maksud dari `dibuka_pada` dan `ditutup_pada`: yang pertama waktu
baris dibuat dan diubah, yang kedua waktu peristiwa lapangan.

Pada `location_logs`, kolom `diterima_pada` **dipertahankan** dan tidak diganti `dibuat_pada`,
karena namanya membawa arti tambahan — waktu titik tiba di sistem, yang berbeda dari
`direkam_pada` dan menjadi dasar penilaian keterlambatan. Ini persis pengecualian yang dibuka
I.10 untuk `dikirim_pada` pada laporan. Keputusan ini ditulis di sini justru agar tidak menjadi
temuan pemeriksaan silang berikutnya.

## P-08 `laporan_harian.sesi_tugas_id` kosong setelah penutupan otomatis — SEDANG

### Duduk perkaranya

Addendum 6.3-T Celah 3 mengisi `laporan_harian.sesi_tugas_id` dari sesi yang sedang berjalan pada
SPT yang sama. Begitu Modul 6.4 memberi sistem kemampuan menutup sesi otomatis, laporan yang
dikirim setelah penutupan otomatis akan berisi kolom kosong.

### Ketetapan

Ini **perilaku yang diharapkan, bukan cacat data**. Modul 6.3 sudah menetapkan laporan boleh
dikirim kapan saja selama SPT hidup, tanpa mensyaratkan Sesi Tugas berjalan. Kolom kosong berarti
laporan disusun di luar sesi, dan itu keadaan yang sah.

Modul 6.8 dilarang memperlakukan kolom kosong pada kolom itu sebagai kekurangan data, dan dilarang
menyimpulkan apa pun darinya. Dicatat pada Section 8.10 dan pada Lampiran B.11.

## P-09 `sesi_tugas` tidak memuat penanda perangkat — SEDANG

### Duduk perkaranya

BR-25 berbunyi "setiap penulisan ke tabel operasional". `sesi_tugas` ditulis dari lapangan oleh
pemegang sesi dan belum pernah diputuskan masuk atau tidak ke dalam cakupan aturan itu.

### Ketetapan

Masuk. `sesi_tugas` menerima `penanda_perangkat text not null` dengan kebijakan penulisan yang
sama seperti `location_logs` dan `laporan_harian`. Tanpa itu, perangkat yang sudah digeser masih
dapat membuka Sesi Tugas selama access token-nya belum kedaluwarsa, dan seluruh lapisan
penegakan Addendum 6.1-T Bagian 3.4 bocor lewat pintu yang belum dijaga.

## P-16 Zona waktu pada seluruh perhitungan hari kalender — MEMBLOKIR

### Duduk perkaranya

Bagian I butir I.2 menetapkan bentuk final tampilan `v_belum_lapor`, dan di dalamnya terdapat:

```sql
and lh.direkam_pada::date = current_date
```

Penulisan `timestamptz::date` memakai pengaturan zona waktu sesi basis data. Basis data terkelola
berjalan pada **UTC**, sedangkan seluruh pemakainya berada di **WIB, yaitu UTC+7**.

Akibatnya, "hari kalender" menurut sistem bergulir pada **pukul tujuh pagi WIB**, bukan tengah
malam:

| Yang terjadi di lapangan | Yang dicatat sistem |
| --- | --- |
| Anggota mengirim laporan pukul 05.30 WIB hari Selasa | Tercatat sebagai laporan hari **Senin** |
| Anggota mengirim laporan pukul 23.00 WIB hari Senin | Tercatat hari Senin — benar, kebetulan |
| Anggota belum melapor sepanjang Senin, melapor 06.00 Selasa | Kewajiban Senin tetap terpenuhi, kewajiban Selasa dianggap belum |

Tidak ada galat. Penanda Belum Melapor sekadar salah, tiap hari, bagi setiap orang, selamanya.
Ini kegagalan senyap dengan jangkauan paling luas di seluruh dokumen: ia menyentuh Kewajiban Lapor
Harian pada Modul 6.3, rekap harian pada Modul 6.5, dan setiap perhitungan harian yang akan lahir
di Modul 6.8.

Modul 6.4 mewarisinya utuh, karena seluruh penilaian waktunya memakai `direkam_pada` yang bertipe
sama.

### Ketetapan

> **BR-64.** Setiap perhitungan yang menyangkut hari kalender, tanggal, atau batas harian wajib
> dilakukan pada zona waktu **`Asia/Jakarta`**, tidak pernah pada zona waktu bawaan basis data.
> Penulisan `timestamptz::date` tanpa penyebutan zona waktu dilarang di seluruh sistem, termasuk
> pada tampilan, pemicu, fungsi, pekerjaan berjadwal, dan kueri sisi aplikasi.

Bentuk yang berlaku bagi `v_belum_lapor`, menggantikan bentuk pada Bagian I.2:

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
        and (lh.direkam_pada at time zone 'Asia/Jakarta')::date
          = (now() at time zone 'Asia/Jakarta')::date
   );
```

**Yang sengaja tidak dilakukan.** Mengubah zona waktu bawaan project menjadi `Asia/Jakarta`
tampak lebih ringkas, tetapi ditolak karena tiga alasan: ia mengubah perilaku setiap kueri yang
sudah ditulis tanpa satu pun tanda terlihat, ia tidak berlaku bagi sambungan yang menyetel zona
waktunya sendiri, dan ia membuat kebenaran sistem bergantung pada satu pengaturan yang dapat
berubah tanpa jejak. Penyebutan eksplisit lebih panjang tetapi tidak dapat bocor diam-diam.

> **Butir uji U-6.4-03.** Setel jam perangkat ke pukul 05.00 WIB, kirim laporan, lalu baca
> `v_belum_lapor`. Baris pengirim wajib **hilang** dari daftar belum melapor. Bila masih ada,
> perbaikan ini belum diterapkan.

> **Butir uji U-6.4-04.** Sisir seluruh berkas dengan pencarian teks `::date`. Setiap kemunculan
> wajib didahului `at time zone 'Asia/Jakarta'`. Ini butir uji terhadap dokumen, bukan terhadap
> sistem, dan dijalankan sebelum sesi coding dimulai.

## P-17 Pendaftaran tabel ke Data API — MEMBLOKIR OPERASIONAL

### Duduk perkaranya

Layanan basis data terkelola yang dipakai sudah mengubah perilaku bawaannya: tabel baru pada
skema publik **tidak lagi terekspos ke Data API secara otomatis**. Ketentuan itu menjadi bawaan
bagi project baru sejak 30 Mei 2026 dan diberlakukan pada seluruh project pada 30 Oktober 2026.

Project SiPANTAU dibuat pada Agustus 2026, sehingga ia project baru dan aturan baru berlaku
penuh.

Yang membuatnya berbahaya bukan aturannya, melainkan **gejalanya**. Tabel yang belum didaftarkan
menjawab permintaan klien dengan hasil kosong atau tidak ditemukan — persis seperti tabel yang
aturan akses barisnya menolak. Pembangun akan memeriksa kebijakan RLS berjam-jam, menuliskan ulang
klausanya, dan mencurigai fungsi bantu peran, padahal seluruhnya sudah benar sejak awal.

Tidak satu pun berkas dalam dokumen ini menyebutkan langkah pendaftaran itu.

### Ketetapan

> **BR-66.** Setiap tabel baru wajib didaftarkan secara sadar ke Data API sebagai langkah
> tersendiri yang tercatat pada urutan pembangunan, terpisah dari pembuatan tabelnya dan terpisah
> dari penyusunan aturan akses barisnya. Kegagalan membaca sebuah tabel baru **wajib diperiksa
> terhadap pendaftaran ini lebih dahulu**, sebelum aturan akses baris dicurigai.

Sebelas tabel yang wajib didaftarkan: `users`, `unit`, `perangkat_masuk`, `jejak_audit`,
`penugasan`, `penugasan_dasar`, `penugasan_lokasi`, `penugasan_pelaksana`, `penugasan_panit`,
`sesi_tugas`, `location_logs`, `posisi_terkini`, `laporan_harian`, `catatan_laporan`,
`laporan_versi`, `catatan_versi`, `notifikasi`.

Dua tabel yang **sengaja tidak didaftarkan**, karena tidak boleh disentuh klien sama sekali:
`pembatasan_laju` dan `titik_penanda`. Keduanya hanya dibaca dan ditulis fungsi ber-`security
definer` dari dalam basis data.

> **Butir uji U-6.4-05.** Setelah seluruh tabel berdiri, baca satu baris dari tiap tabel memakai
> kunci publik sebagai pengguna yang berhak. Tabel yang menjawab kosong sementara barisnya ada di
> basis data berarti belum terdaftar. Jalankan **sebelum** menyusun satu pun kebijakan akses.

Bentuk perintah pendaftarannya diverifikasi terhadap dokumentasi layanan pada saat pembangunan,
bukan disalin dari dokumen ini, karena ketentuannya sedang dalam masa peralihan sampai Oktober
2026. Dicatat sebagai calon Addendum 6.4-T butir 17.

## P-18 Peristiwa penghapusan pada Realtime tidak disaring — PENTING

### Duduk perkaranya

Kebijakan akses baris **tidak diterapkan pada pernyataan penghapusan** dalam mekanisme perubahan
Postgres, karena basis data tidak punya cara memastikan seseorang berhak atas baris yang sudah
tidak ada.

Rancangan Bagian 3 Section 5.21 menghapus baris `posisi_terkini` saat sesi ditutup. Peristiwa penghapusan
itu karena itu disiarkan kepada **seluruh** pelanggan tabel, bukan hanya yang berhak.

### Ketetapan

Perilaku ini **dipertahankan**, karena ia justru dibutuhkan: penanda di peta harus hilang dari
layar setiap pengawas yang berhak, dan penyiaran tanpa penyaringan menjamin tidak ada penanda
hantu yang tertinggal.

Yang dikunci adalah batas kebocorannya:

1. **`replica identity` pada `posisi_terkini` dibiarkan bawaan**, tidak disetel penuh. Dengan
   demikian peristiwa penghapusan hanya membawa kunci utamanya.
2. **Kunci utamanya adalah `sesi_tugas_id`**, sebuah UUID acak tanpa arti. Yang terbaca pelanggan
   yang tidak berhak hanyalah bahwa *sebuah* sesi entah milik siapa telah berakhir. Tidak ada nama,
   tidak ada unit, tidak ada koordinat.
3. **Larangan yang mengikat:** kunci utama tabel mana pun yang masuk publikasi Realtime tidak boleh
   pernah berisi keterangan bermakna. Nomor SPT, NRP, dan nama dilarang menjadi kunci utama pada
   tabel yang dilanggani.

> **Butir uji U-6.4-06.** Berlangganan `posisi_terkini` sebagai Anggota unit lain, lalu tutup sesi
> milik orang di unit yang berbeda. Pelanggan wajib menerima peristiwa penghapusan berisi UUID saja,
> tanpa satu pun kolom lain. Bila kolom lain ikut terkirim, `replica identity` sudah disetel penuh
> dan wajib dikembalikan.

## P-19 Sesi Tugas tidak dapat dibuka dari aplikasi web — MEMBLOKIR SENYAP

### Duduk perkaranya

Section 11.1 menawarkan dua bentuk aplikasi yang setara: berkas pemasangan Android dan aplikasi
web progresif. Tidak satu pun aturan menyatakan bahwa Sesi Tugas hanya dapat dibuka dari yang
pertama.

Padahal perekaman posisi saat layar mati menuntut layanan latar depan beserta pemberitahuan
menetap, dan peramban tidak memilikinya dalam bentuk apa pun. Bukan karena kurang diatur, melainkan
karena sistem operasi memang tidak menyediakannya bagi halaman web.

Jalannya kegagalan:

1. Anggota memasang bentuk web ke layar utama, sebagaimana Section 11.1 mempersilakannya
2. Tombol geser Mulai Tugas muncul, karena tidak ada aturan yang menyembunyikannya
3. Sesi terbuka, Titik pertama terkirim, semuanya tampak berjalan
4. Layar mati. Pengiriman berhenti
5. Dua jam kemudian sesi ditutup dengan sebab menggantung

Anggota merasa sudah bertugas seharian. Kanit melihat penanda abu-abu sejak pagi. Tidak ada galat,
tidak ada peringatan, dan tidak seorang pun mengetahui sebabnya sampai berminggu-minggu kemudian —
saat itu pun dugaannya kemungkinan besar tertuju pada orangnya, bukan pada bentuk aplikasinya.
Justru inilah jenis kekeliruan yang paling merusak kepercayaan, dan yang paling bertentangan
dengan Prinsip 0.6.

### Ketetapan

> **BR-65.** Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang. Pada bentuk web,
> tombol Mulai Tugas **disembunyikan**, bukan ditampilkan dalam keadaan nonaktif (BR-11), dan
> digantikan keterangan singkat beserta tautan pemasangan berkas Android. Seluruh kemampuan lain —
> membaca penugasan, mengirim laporan, mengunggah foto, membaca rute — tetap tersedia penuh pada
> bentuk web.

Penegakannya berlapis dua, mengikuti pola yang sudah dipakai Addendum 6.1-T:

**Lapis pertama, di antarmuka.** Aplikasi memeriksa apakah ia berjalan di dalam wadah Android.
Bila tidak, tombol tidak dirender sama sekali.

**Lapis kedua, di basis data.** Kolom `sesi_tugas.penanda_perangkat` yang sudah ditetapkan P-09
diperluas maknanya: penanda perangkat yang dibuat oleh bentuk web membawa awalan yang dapat
dikenali, dan fungsi pembuka sesi menolaknya. Tanpa lapis kedua, penyembunyian tombol hanyalah
penyembunyian di antarmuka, yang dilarang Section 9.1.

**Yang tidak dilakukan.** Bentuk web tidak dilarang bagi Anggota. Melarangnya akan menghukum orang
yang perangkatnya sedang rusak dan meminjam komputer untuk sekadar mengirim laporan — dan Modul 6.3
sudah menetapkan laporan boleh dikirim tanpa Sesi Tugas berjalan.

## P-20 Arah gerak tidak terekam — SEDANG

Bagian 3 Section 5.7 memuat `kecepatan_mps` tetapi tidak memuat arah. Tanpanya penanda peta tidak dapat
diputar mengikuti arah gerak, dan rute yang digambar kehilangan keterangan yang diberikan perangkat
secara cuma-cuma bersama koordinat.

### Ketetapan

Satu kolom `arah_derajat` ditambahkan pada `location_logs`, sudah tercantum pada Bagian 3
Section 5.7.

Kolom yang sama **tidak** ditambahkan ke `posisi_terkini`, melainkan diturunkan di sisi tampilan
dari dua titik terakhir. Alasannya tercatat pada B.1: setiap kolom pada tabel yang dilanggani
menambah muatan yang dikirim ke setiap pelanggan pada setiap perubahan, dan arah dapat dihitung
tanpa biaya.

## P-21 Panit yang sudah dicabut tetap memantau posisi langsung — SEDANG

### Duduk perkaranya

Bagian 7 di bawah menyamakan aturan baca `posisi_terkini` dengan `location_logs`. Akibatnya
Panit yang penunjukannya sudah dicabut tetap melihat posisi langsung anak buahnya, selamanya,
karena BR-21 memerintahkan hak baca riwayat bertahan.

BR-21 memang benar untuk riwayat: Panit perlu dapat membuka kembali penugasan lama yang pernah ia
awasi, dan itu tidak berakhir bersama penunjukannya. Tetapi **pemantauan langsung bukan riwayat.**
Ia kemampuan operasional yang melekat pada tugas yang sedang berjalan, dan tugas itu sudah
berakhir.

### Ketetapan

> **Amandemen BR-62.** Hak baca `location_logs` bagi Panit bertahan selamanya sesuai BR-21. Hak
> baca `posisi_terkini` **berakhir** saat `dicabut_pada` terisi, bagi Panit maupun bagi sesama
> pelaksana. Pemisahan ini berlaku juga bagi peta waktu nyata secara keseluruhan: yang sudah
> dicabut membaca ke belakang, tidak memantau ke depan.

Bentuk klausa yang berlaku bagi `posisi_terkini`:

| Peran | Syarat |
| --- | --- |
| Pemegang sesi sendiri | Selalu |
| Sesama pelaksana | `dicabut_pada is null` pada barisnya sendiri **dan** pada baris pemegang sesi |
| Panit | Punya baris pada `penugasan_panit` dengan `dicabut_pada is null` |
| Kanit | Unitnya sendiri |
| Kasubdit dan Akun Pemeliharaan | Seluruhnya |

> **Peringatan implementasi.** Klausa Panit pada `location_logs` **mengabaikan** `dicabut_pada`,
> sedangkan klausa Panit pada `posisi_terkini` **memeriksanya**. Kedua tabel bersebelahan dan
> kebijakannya mirip. Menyalin yang satu ke yang lain adalah kesalahan yang paling mungkin terjadi
> pada penutupan modul ini.

> **Butir uji U-6.4-07.** Cabut penunjukan seorang Panit dari sebuah SPT yang sedang berjalan
> sesinya. Ia wajib tetap dapat membuka rute SPT itu, dan wajib **tidak lagi** melihat penanda pada
> peta waktu nyata.

## P-22 Penyusutan dapat menghapus titik sesi yang masih berjalan — SEDANG

BR-59 menetapkan ambang tiga ratus enam puluh lima hari sejak `direkam_pada` tanpa memandang status
SPT. Sebuah sesi yang tidak pernah ditutup selama lebih dari setahun mustahil dalam praktik —
penutupan menggantung terjadi setelah dua jam — tetapi tidak ada apa pun yang menjaganya, dan
"mustahil dalam praktik" bukan penjagaan.

### Ketetapan

> **Amandemen BR-59.** Titik hanya dapat disusutkan bila Sesi Tugas induknya **sudah tertutup**.
> Titik milik sesi yang masih berjalan tidak pernah disusutkan, berapa pun umurnya. Kedua ambang
> lainnya tetap berlaku sebagaimana adanya.

Syarat ini juga menutup lubang yang lebih halus: tanpa penjagaan itu, pekerjaan berjadwal dapat
menghapus titik yang baru saja disisipkan seandainya jam perangkat pengirimnya jauh mundur — dan
pemeriksaan waktu KP-6.4-21 memang menolak yang terlalu jauh, tetapi ambangnya berbeda.

---
---

# Bagian 1 — Tambahan Section 3 Glosarium

## 3.3 Istilah lokasi — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Titik** | Satu baris `location_logs`. Merekam keberadaan seorang pemegang Sesi Tugas pada satu saat, beserta ketelitian dan keadaan perangkatnya |
| **Posisi Terkini** | Titik terakhir yang diterima sistem dari sebuah Sesi Tugas yang masih berjalan. Disimpan terpisah agar peta tidak perlu menyisir seluruh Rute |
| **Titik Diragukan** | Titik yang tetap disimpan tetapi tidak dipakai menggambar garis maupun menghitung jarak, karena ketelitiannya buruk atau perpindahannya tidak wajar. Bukan tuduhan, bukan penolakan |
| **Ringkasan Rute** | Angka dan bentuk kasar sebuah Rute yang disimpan permanen pada `sesi_tugas`, sehingga tetap ada setelah titik satuannya disusutkan |
| **Antrean Titik** | Titik yang tertahan di perangkat karena tanpa jaringan, terkirim otomatis begitu jaringan pulih. Mengikuti pola Antrean Luring pada BR-45 sampai BR-48 |

## 3.9 Istilah Sesi Tugas — bagian baru

| Istilah | Definisi tunggal |
| --- | --- |
| **Sesi Tugas** | Rentang waktu antara Mulai Tugas dan Selesai Tugas untuk satu SPT oleh satu orang. Satu-satunya keadaan di mana posisi direkam. Satu orang memegang paling banyak satu Sesi Tugas berjalan (BR-27) |
| **Sesi Menggantung** | Sesi Tugas yang tidak menerima pembaruan posisi selama lebih dari dua jam. Ditutup sistem dengan sebab yang tercatat. Bukan pernyataan tentang perilaku pemegangnya |
| **Sebab Penutupan** | Keterangan mengapa sebuah Sesi Tugas berakhir. Tujuh nilai tertutup, lihat Section 5.17. Bersifat fakta, tidak satu pun bermuatan penilaian |
| **Izin Terputus** | Keadaan Sesi Tugas yang masih berjalan tetapi izin lokasinya dicabut pengguna di tengah jalan. Sesi tidak ditutup; keadaannya ditandai dan pengawasnya diberi tahu |

---
---

# Bagian 2 — Perubahan Section 2.3 Matriks Hak Akses

Dua baris berubah, satu baris ditambahkan. Sisanya tetap seperti bentuk yang berlaku setelah
Modul 6.2 dan Addendum 6.3-K.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Melihat peta Tracking waktu nyata | Semua unit | Unit sendiri | Penugasan yang diawasinya | Posisi sendiri **dan rekan pelaksana aktif pada SPT yang sama** |
| Melihat rute per SPT | Semua unit | Unit sendiri | Penugasan yang diawasinya | Rute sendiri **dan rute rekan pelaksana aktif pada SPT yang sama** |
| Melihat penanda titik dari lokasi tiruan | **Ya** | Ya (unit sendiri) | **Tidak** | **Tidak** |

### Alasan perubahan

**Rekan satu SPT saling melihat posisi.** Ini keputusan pemilik produk dan sengaja **berbeda**
dari keputusan Modul 6.3 yang menutup isi laporan dari sesama pelaksana. Perbedaannya beralasan
dan wajib dituliskan supaya pemeriksaan silang berikutnya tidak membacanya sebagai
ketidakkonsistenan:

- **Isi laporan** adalah bahan pengawasan. Yang berkepentingan membacanya adalah peninjau, dan
  membukanya kepada rekan tidak menambah kemampuan siapa pun menyelesaikan tugas.
- **Posisi rekan** adalah bahan koordinasi. Tim yang menyisir kawasan tambang atau gudang perlu
  tahu di mana rekannya berada, dan tanpa itu mereka akan memakai saluran luar sistem — yang
  bertentangan dengan semangat BR-04.

**Lingkupnya sempit dan berakhir.** Yang terbuka hanya SPT yang sama, dan hanya selama ia masih
tercantum aktif sebagai pelaksana. Begitu `dicabut_pada` terisi, pembacaan posisi rekan tertutup
seketika. Ini **berbeda** dari BR-21 yang memberi Panit hak baca riwayat selamanya, dan
perbedaannya juga beralasan: hak Panit melekat pada tugas pengawasan yang tidak berakhir bersama
penunjukannya, sedangkan hak rekan melekat pada kerja sama lapangan yang memang berakhir.

**Penanda lokasi tiruan tidak terbuka bagi Panit.** Ia paling dekat dengan tuduhan di antara
seluruh data modul ini, sehingga pembacaannya dibatasi pada peran yang berwenang menilai menurut
Section 0.6. Konsekuensi teknisnya besar dan tidak boleh diselesaikan dengan menyembunyikan kolom
di antarmuka — lihat P-10 pada Bagian 11 dan Section 5.22.

---
---

# Bagian 3 — Perubahan Model Data

## 5.7 Tabel location_logs — pengganti utuh

**[FINAL]**

Menyimpan titik-titik Rute. Tabel dengan pertumbuhan tercepat di seluruh sistem, sehingga setiap
kolom di bawah dipertimbangkan terhadap biayanya.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Kunci utama |
| sesi_tugas_id | uuid | **Baru.** Sesi pemilik titik. Wajib terisi. Menyelesaikan P-03 |
| penugasan_id | uuid | SPT pemilik Rute. Wajib terisi (BR-13). Dipertahankan meski dapat diturunkan dari sesi, karena BR-13 berbunyi harfiah dan indeksnya dibutuhkan |
| pengguna_id | uuid | Pemilik titik. **Mengganti `anggota_id`** (P-02). Boleh berperan anggota, panit, atau kanit |
| lat | numeric | Lintang |
| lng | numeric | Bujur |
| geom | geography(Point,4326) | Dibangkitkan dari lat dan lng. Dipakai menghitung jarak dan mencocokkan ke `penugasan_lokasi` |
| akurasi_meter | numeric | Perkiraan galat. **Diganti nama dari `akurasi`** agar seragam dengan `laporan_harian.akurasi_meter` (Section 0.2) |
| kecepatan_mps | numeric | Kecepatan yang dilaporkan perangkat. Boleh kosong |
| arah_derajat | numeric | Arah gerak dalam derajat, nol berarti utara. Boleh kosong, karena perangkat tidak melaporkannya saat diam (P-20) |
| baterai_persen | smallint | Daya tersisa saat titik direkam. Boleh kosong |
| sumber_lokasi | enum | gps, jaringan, fusi, tidak_diketahui |
| diragukan_sebab | enum | Kosong berarti titik wajar. Nilai: akurasi_buruk, lompatan_tidak_wajar, keduanya |
| antrean_id | uuid | **Unik.** Dibuat aplikasi satu kali per titik. Penangkal kiriman kembar, sejalan BR-46 |
| direkam_pada | timestamptz | Waktu perangkat saat titik diambil. Dasar seluruh penilaian waktu (BR-45) |
| diterima_pada | timestamptz | Waktu server saat baris masuk. Dipertahankan namanya, lihat P-07 |
| diterima_terlambat | boolean | Dihitung pemicu. Benar bila selisih kedua waktu melebihi lima menit |
| penanda_perangkat | text | Perangkat yang **benar-benar mengirim**. Wajib Perangkat Terdaftar saat pengiriman (BR-25) |
| penanda_perangkat_asal | text | Perangkat tempat titik **direkam**. Boleh berbeda, boleh kosong bila sama. Menyelesaikan P-05 |

**Kolom yang dicabut dari versi 0.2:** `anggota_id` (berganti nama menjadi `pengguna_id`),
`akurasi` (berganti nama menjadi `akurasi_meter`).

**Kolom yang sengaja tidak ada di sini:** penanda lokasi tiruan. Ia berada pada tabel terpisah
`titik_penanda`, dan alasannya bukan kerapian melainkan penegakan hak akses. Lihat Section 5.22.

### Indeks yang wajib dibuat sejak awal

```sql
create index idx_location_logs_sesi_waktu
  on public.location_logs (sesi_tugas_id, direkam_pada);

create index idx_location_logs_penugasan_waktu
  on public.location_logs (penugasan_id, direkam_pada);

create index idx_location_logs_geom
  on public.location_logs using gist (geom);

create unique index uq_location_logs_antrean_id
  on public.location_logs (antrean_id);

create index idx_location_logs_susut
  on public.location_logs (direkam_pada);
```

Indeks yang menyusul pada tabel berisi puluhan juta baris jauh lebih mahal daripada indeks yang
ada sejak baris pertama. Ini bukan pengoptimalan yang ditunda, melainkan bagian dari pembangunan.

## 5.17 Tabel sesi_tugas — pengganti utuh

**[FINAL]** — menggantikan bentuk [KERANGKA] pada Modul 6.2 Section 5.17.

Disimpan **permanen** dan tidak pernah ikut disusutkan. Setelah titik satuannya hilang, baris
inilah satu-satunya yang masih dapat menjawab pertanyaan tentang kegiatan tahun lalu.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Kunci utama |
| penugasan_id | uuid | SPT yang sedang dikerjakan |
| pengguna_id | uuid | Pemegang sesi. Boleh berperan anggota, panit, atau kanit |
| dibuka_pada | timestamptz | Waktu Mulai Tugas, menurut jam perangkat |
| ditutup_pada | timestamptz | Waktu Selesai Tugas. Kosong berarti sesi masih berjalan |
| sebab_penutupan | enum | Kosong selama sesi berjalan. Tujuh nilai tertutup, lihat di bawah |
| ditutup_oleh | uuid | Pengguna yang menutup. **Kosong berarti ditutup sistem** |
| penanda_perangkat | text | Perangkat pembuka sesi (BR-25, P-09) |
| izin_dicabut_pada | timestamptz | Terisi bila izin lokasi dicabut saat sesi berjalan. Boleh kosong |
| izin_dipulihkan_pada | timestamptz | Terisi bila izin diberikan kembali sebelum sesi berakhir |
| titik_terakhir_pada | timestamptz | Disalin dari titik terbaru. Dasar penghitungan Sesi Menggantung dan status Terakhir terlihat |
| jumlah_titik | integer | Bawaan nol. Dinaikkan pemicu |
| jarak_tempuh_meter | numeric | Diisi saat penutupan. Menghitung hanya titik yang tidak diragukan |
| akurasi_median_meter | numeric | Diisi saat penutupan. Keterangan mutu rekaman, bukan penilaian |
| polyline_terkode | text | Bentuk kasar Rute dalam sandi polyline. Diisi saat penutupan |
| lat_awal, lng_awal | numeric | Titik pertama sesi |
| lat_akhir, lng_akhir | numeric | Titik terakhir sesi |
| diringkas_pada | timestamptz | Waktu ringkasan disusun. Kosong berarti ringkasan belum jadi |
| dibuat_pada | timestamptz | Waktu baris dibuat (I.10, P-07) |
| diubah_pada | timestamptz | Waktu baris terakhir diubah (I.10, P-07) |

### Nilai enum sebab_penutupan — [FINAL]

Tujuh nilai, daftar tertutup. Tidak satu pun bermuatan penilaian; ketujuhnya menyebut keadaan.

| Nilai | Kapan dipakai | Rujukan |
| --- | --- | --- |
| `manual` | Pemegang sesi menekan Selesai Tugas | — |
| `keluar_aplikasi` | Pemegang sesi keluar dari aplikasi saat sesi berjalan | BR-19 |
| `pindah_perangkat` | Akun yang sama masuk di perangkat lain, sehingga perangkat lama tidak lagi berhak menulis | BR-16, BR-25 |
| `menggantung` | Lewat dua jam tanpa pembaruan posisi | BR-54 |
| `spt_ditutup` | Kanit menutup atau membatalkan SPT saat sesi masih berjalan | BR-38 |
| `dicabut_dari_spt` | Pemegang sesi dicabut dari daftar pelaksana saat sesi berjalan | BR-30 |
| `akun_dinonaktifkan` | Akun dinonaktifkan saat sesi berjalan | BR-20 |

Empat nilai terakhir ditutup sistem, sehingga `ditutup_oleh` kosong. Dua nilai pertama ditutup
manusia. Nilai `pindah_perangkat` juga ditutup sistem, meski dipicu tindakan manusia di tempat
lain — yang mencatat bukan orangnya melainkan pergeseran perangkat.

> **Mengapa `pindah_perangkat` wajib ada, bukan disamakan dengan `keluar_aplikasi`.** Perangkat
> lama tidak selalu tahu dirinya sudah digeser; Addendum 6.1-T Bagian 3.5 menempatkan deteksinya
> sebagai lapis ketiga yang dapat terlambat. Sesi yang tidak ditutup akan tetap memblokir
> pembukaan sesi baru di perangkat baru lewat indeks unik. Menyamakannya dengan keluar aplikasi
> membuat sebab yang sesungguhnya hilang dari catatan.

### Indeks

Indeks unik parsial `uq_sesi_tugas_satu_aktif_per_orang` sudah ditetapkan Addendum 6.2-T
Bagian 2 dan **tidak dirancang ulang**. Yang ditambahkan:

```sql
create index idx_sesi_tugas_penugasan
  on public.sesi_tugas (penugasan_id, dibuka_pada desc);

create index idx_sesi_tugas_menggantung
  on public.sesi_tugas (titik_terakhir_pada)
  where ditutup_pada is null;
```

Indeks parsial kedua membuat penyisiran sesi menggantung menyentuh hanya baris yang masih
berjalan — puluhan baris, bukan puluhan ribu.

## 5.21 Tabel posisi_terkini — tabel baru

**[FINAL]**

Satu baris per Sesi Tugas yang sedang berjalan. Di-*upsert* setiap kali titik baru masuk, dan
**dihapus** saat sesi ditutup. Isinya tidak pernah lebih banyak dari jumlah orang yang sedang
bertugas.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| sesi_tugas_id | uuid | Kunci utama |
| penugasan_id | uuid | Menentukan siapa yang berhak melihat |
| pengguna_id | uuid | Unik. Menegakkan kembali BR-27 pada lapisan ini |
| unit_id | uuid | Disalin dari penugasan. Mencegah peta membaca ulang tabel `penugasan` untuk menyaring lingkup |
| lat, lng | numeric | Posisi terakhir |
| akurasi_meter | numeric | Ketelitian titik terakhir |
| baterai_persen | smallint | Daya saat titik terakhir |
| sumber_lokasi | enum | Sama seperti pada titik |
| izin_terputus | boolean | Benar bila izin lokasi sedang dicabut. Bawaan salah |
| direkam_pada | timestamptz | Waktu perangkat saat titik terakhir. **Dasar status Terakhir terlihat** |
| dibuat_pada | timestamptz | Waktu baris dibuat (I.10) |
| diubah_pada | timestamptz | Waktu titik terakhir tiba (I.10) |

### Mengapa tabel tersendiri

Peta pimpinan berlangganan tabel ini, bukan `location_logs`. Tiga akibatnya:

- **Kejadian waktu nyata turun drastis.** Satu baris berubah per orang, bukan satu baris baru per
  titik. Tiga puluh orang bertugas menghasilkan tiga puluh baris yang diperbarui, bukan ribuan
  baris baru per jam.
- **Status Terakhir terlihat menjadi pembacaan satu baris.** Tanpa tabel ini, setiap penyegaran
  peta harus mencari titik terbaru tiap orang di dalam tabel terbesar sistem.
- **Penyusutan tidak menyentuh peta.** `location_logs` dapat disusutkan sebebas apa pun tanpa
  memengaruhi tampilan peta, karena keduanya tidak lagi saling bergantung.

### Peristiwa penghapusan dan replica identity

Aturan akses baris **tidak diterapkan pada pernyataan penghapusan** dalam mekanisme perubahan
Postgres, karena basis data tidak punya cara memastikan seseorang berhak atas baris yang sudah
tidak ada. Baris `posisi_terkini` dihapus setiap kali sesi ditutup, sehingga peristiwa itu
disiarkan kepada seluruh pelanggan tabel, bukan hanya yang berhak.

Perilaku ini **dipertahankan**, karena justru dibutuhkan: penanda di peta harus hilang dari layar
setiap pengawas, dan penyiaran tanpa penyaringan menjamin tidak ada penanda hantu yang tertinggal.
Yang dikunci adalah batas kebocorannya.

1. **`replica identity` dibiarkan bawaan**, tidak disetel penuh. Peristiwa penghapusan karena itu
   hanya membawa kunci utamanya.
2. **Kunci utamanya `sesi_tugas_id`**, sebuah UUID acak tanpa arti. Yang terbaca pelanggan yang
   tidak berhak hanyalah bahwa sebuah sesi entah milik siapa telah berakhir — tanpa nama, tanpa
   unit, tanpa koordinat.
3. **Larangan yang mengikat:** kunci utama tabel mana pun yang masuk publikasi Realtime tidak
   boleh berisi keterangan bermakna. Nomor SPT, NRP, dan nama dilarang menjadi kunci utama pada
   tabel yang dilanggani.

### Yang sengaja tidak ada di tabel ini

Penanda lokasi tiruan **tidak** disalin ke sini. Alasannya menentukan dan mudah terlewat: tabel
ini dilanggani lewat Realtime, dan Realtime mengirim **seluruh baris** kepada setiap pelanggan
yang lolos aturan akses baris. Panit dan sesama pelaksana berhak melihat posisi rekan, sehingga
mereka lolos. Bila kolom itu ada di sini, ia ikut terkirim kepada mereka — bocor tanpa pernah
ditampilkan di layar mana pun, dan tanpa satu pun galat.

Ini bentuk kegagalan senyap yang sama persis dengan T-02, hanya lewat pintu yang berbeda.

Akibat yang diterima: penanda lokasi tiruan muncul saat rute ditelusuri, bukan pada peta waktu
nyata. Diterima sebagai batas rancangan, dicatat pada Section 8.10.

## 5.22 Tabel titik_penanda — tabel baru

**[FINAL]**

Menyimpan satu-satunya keterangan pada modul ini yang pembacaannya dibatasi lebih sempit daripada
titiknya sendiri.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| location_log_id | uuid | Kunci utama, mengacu ke `location_logs` |
| penugasan_id | uuid | Disalin. Dipakai aturan akses baris tanpa perlu menggabung tabel |
| unit_id | uuid | Disalin dari penugasan. Dipakai aturan akses baris |
| lokasi_tiruan | boolean | Benar bila perangkat melaporkan titik berasal dari penyedia lokasi tiruan |
| dibuat_pada | timestamptz | I.10 |

Baris hanya dibuat bila `lokasi_tiruan` bernilai benar. Titik wajar tidak menghasilkan baris di
sini sama sekali, sehingga tabel ini tetap kecil.

> **Mengapa tabel terpisah, bukan satu kolom pada `location_logs`.** PostgreSQL mengenal hak akses
> per kolom, tetapi hak itu melekat pada peran basis data, bukan pada peran aplikasi. Pada
> Supabase seluruh pengguna yang berhasil masuk memakai satu peran basis data yang sama, yaitu
> `authenticated`. Karena itu `grant select (kolom)` **tidak dapat** membedakan Kanit dari Panit.
>
> Aturan akses baris bekerja per baris, bukan per kolom. Satu-satunya cara menegakkan keputusan
> "hanya Kanit dan Kasubdit yang melihat" tanpa bersandar pada penyembunyian di antarmuka adalah
> memindahkan keterangannya ke baris tersendiri yang punya aturannya sendiri.
>
> Menyembunyikannya di antarmuka saja melanggar Section 9.1 butir keempat, yang menyatakan
> menyembunyikan tombol tidak dianggap pengamanan.

## 5.8 Hubungan antar entitas — tambahan

```
penugasan
  └── sesi_tugas                (jamak, milik 6.4)
        ├── location_logs       (jamak, disusutkan)
        │     └── titik_penanda (nol atau satu, akses lebih sempit)
        └── posisi_terkini      (nol atau satu, hanya selama sesi berjalan)
```

`location_logs` mengacu ke `sesi_tugas` **dan** ke `penugasan`. Keduanya wajib menunjuk SPT yang
sama, dan kesamaannya ditegakkan pemicu, bukan diandaikan. Bentuknya ada pada calon Addendum
6.4-T butir 3.

## 5.9 Kebijakan penyimpanan dan penyusutan data — pengganti

- **Rute disimpan per penugasan dan per sesi.** Setiap titik wajib memiliki `penugasan_id`
  (BR-13) dan `sesi_tugas_id` (BR-55).
- **Penyusutan `location_logs`.** Titik dihapus bila salah satu tercapai lebih dahulu: sembilan
  puluh hari sejak SPT-nya selesai atau dibatalkan, atau tiga ratus enam puluh lima hari sejak
  `direkam_pada` tanpa memandang status SPT (P-06).
- **`sesi_tugas` tidak pernah disusutkan.** Ringkasan Rute di dalamnya menggantikan titik satuan
  yang sudah hilang.
- **`posisi_terkini` bukan arsip.** Barisnya dihapus saat sesi ditutup dan tidak pernah dibaca
  sebagai riwayat.
- **`titik_penanda` ikut terhapus bersama titiknya**, lewat `on delete cascade`.
- **Data laporan dan LHP tidak dihapus otomatis.** Tidak berubah dari versi 0.2.

---
---

# Bagian 4 — Pengganti Section 6.4 secara utuh

**Status: [FINAL]**

## 6.4.1 Deskripsi

Modul ini mengatur perekaman posisi selama Sesi Tugas dan penyajiannya bagi pihak yang berhak.
Tanggung jawabnya berhenti pada tiga hal: membuka dan menutup Sesi Tugas, mengumpulkan serta
menyimpan Titik selama sesi berjalan, dan menyajikan posisi itu di peta beserta status Terakhir
terlihat.

**Yang bukan urusannya.** Penerbitan dan penutupan SPT milik Modul 6.2. Isi laporan dan titik
lokasi laporan milik Modul 6.3. Susunan halaman ringkasan dan kartu angka milik Modul 6.5.
Pengiriman pemberitahuan milik Modul 6.9 — modul ini hanya menyisipkan baris ke tabel
`notifikasi` dan tidak menentukan bagaimana ia sampai ke penerimanya.

Modul ini juga **tidak menyimpulkan apa pun**. Ia tidak menghitung kepatuhan, tidak menandai
kelalaian, dan tidak memberi nilai kepada siapa pun. Setiap keterangan yang dihasilkannya berupa
fakta bertanggal: kapan sesi dibuka, kapan titik terakhir diterima, berapa jauh jaraknya, dan
apa sebab sesi berakhir. Penilaian atas fakta-fakta itu sepenuhnya urusan manusia (Section 0.6,
BR-05).

## 6.4.2 Cerita pengguna

| Sebagai | Saya ingin | Agar |
| --- | --- | --- |
| Anggota | menekan satu tombol geser untuk Mulai Tugas | saya tidak perlu mengisi apa pun sebelum berangkat |
| Anggota | tahu dengan pasti kapan posisi saya direkam dan kapan tidak | saya percaya sistem ini tidak mengikuti saya di luar jam tugas |
| Anggota | posisi saya tetap terekam meski aplikasi berada di latar belakang | saya dapat memakai kamera dan aplikasi lain sambil bertugas |
| Anggota | titik yang tertahan tanpa sinyal tetap terkirim setelah saya kembali | rute saya tidak berlubang gara-gara lokasi yang memang tidak bersinyal |
| Anggota | melihat rute saya sendiri persis seperti yang dilihat pimpinan | tidak ada data tentang saya yang tidak saya ketahui |
| Anggota | melihat posisi rekan pada SPT yang sama | kami dapat membagi wilayah tanpa saling menelepon |
| Panit | melihat posisi seluruh pelaksana pada penugasan yang saya awasi | saya dapat mengarahkan mereka tanpa harus hadir di tempat |
| Kanit | melihat siapa saja yang sedang bertugas di unit saya beserta posisinya | saya tahu keadaan lapangan tanpa menunggu laporan masuk |
| Kanit | menelusuri rute sebuah SPT setelah kegiatannya selesai | saya dapat memeriksa kesesuaian kegiatan dengan sasaran surat perintah |
| Kanit | tahu mengapa seseorang berhenti mengirim posisi | saya tidak salah menduga, dan saya dapat menanyakannya dengan tepat |
| Kasubdit | melihat peta seluruh unit dalam satu tampilan | saya memperoleh gambaran menyeluruh tanpa membuka satu per satu |
| Anggota | Sesi Tugas saya yang terlupa tertutup tidak menghalangi tugas berikutnya | saya tidak terkunci gara-gara baterai habis kemarin |

## 6.4.3 Kriteria penerimaan

### Membuka Sesi Tugas

| Kode | Kriteria |
| --- | --- |
| KP-6.4-01 | Bila pengguna tercantum sebagai pelaksana aktif pada sebuah SPT berstatus baru, berjalan, atau bermasalah, maka tombol geser Mulai Tugas tersedia pada halaman rincian SPT tersebut |
| KP-6.4-02 | Bila GPS perangkat tidak aktif atau izin lokasi belum diberikan, maka Mulai Tugas ditolak disertai keterangan langkah yang perlu dilakukan, bukan sekadar penolakan (BR-02) |
| KP-6.4-03 | Bila pengguna sudah memegang Sesi Tugas berjalan pada SPT lain, maka pembukaan ditolak disertai nomor SPT yang sedang terbuka dan waktu pembukaannya (BR-27) |
| KP-6.4-04 | Bila pengguna memiliki Sesi Tugas berjalan yang tidak menerima pembaruan posisi lebih dari dua jam, maka pembukaan sesi baru **berhasil**, dan sesi lama ditutup dengan sebab menggantung dalam transaksi yang sama |
| KP-6.4-05 | Bila Sesi Tugas berhasil dibuka, maka satu Titik pertama dikirim seketika tanpa menunggu ambang jarak maupun ambang waktu |
| KP-6.4-06 | Bila pengguna membuka Sesi Tugas dari perangkat yang bukan Perangkat Terdaftar miliknya, maka penulisan ditolak basis data (BR-25) |
| KP-6.4-07 | Bila SPT sedang dihapus permanen pada saat hampir bersamaan, maka salah satu dari kedua tindakan gagal dan tidak ada keadaan setengah jadi (Addendum 6.2-T Bagian 8.3) |
| KP-6.4-08 | Bila pengguna membuka Sesi Tugas untuk pertama kalinya, maka permintaan izin lokasi sepanjang waktu ditampilkan lebih dahulu disertai penjelasan singkat alasannya (Section 11.2) |

### Pengiriman Titik

| Kode | Kriteria |
| --- | --- |
| KP-6.4-09 | Bila perpindahan sejak Titik terakhir melebihi dua puluh lima meter, maka Titik baru dikirim |
| KP-6.4-10 | Bila sudah lewat tiga puluh detik sejak pengiriman terakhir, maka Titik baru dikirim meski pengguna tidak berpindah |
| KP-6.4-11 | Bila aplikasi berada di latar belakang, maka pengiriman Titik tetap berjalan dengan ambang yang sama |
| KP-6.4-12 | Bila tidak ada Sesi Tugas berjalan, maka tidak satu pun Titik dikirim atau disimpan, dalam keadaan apa pun (BR-01) |
| KP-6.4-13 | Bila sebuah Titik masuk, maka `sesi_tugas.titik_terakhir_pada` dan baris `posisi_terkini` diperbarui dalam transaksi yang sama |
| KP-6.4-14 | Bila ketelitian sebuah Titik lebih buruk dari seratus meter, maka Titik tetap disimpan dan ditandai diragukan dengan sebab akurasi buruk |
| KP-6.4-15 | Bila sebuah Titik menyiratkan kecepatan melebihi seratus lima puluh kilometer per jam terhadap Titik wajar sebelumnya, maka Titik tetap disimpan dan ditandai diragukan dengan sebab lompatan tidak wajar |
| KP-6.4-16 | Bila sebuah Titik ditandai diragukan, maka ia tidak dipakai menggambar garis Rute dan tidak ikut dihitung dalam jarak tempuh, tetapi tetap terbaca sebagai baris data |
| KP-6.4-17 | Bila perangkat melaporkan Titik berasal dari penyedia lokasi tiruan, maka satu baris `titik_penanda` dibuat, dan barisnya hanya terbaca Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan |

### Antrean Titik

| Kode | Kriteria |
| --- | --- |
| KP-6.4-18 | Bila jaringan tidak tersedia, maka Titik disimpan di perangkat dan dikirim otomatis begitu jaringan pulih |
| KP-6.4-19 | Bila Titik yang sama dikirim ulang karena jawaban server tidak sampai, maka tidak ada baris kedua yang tersimpan (sejalan BR-46) |
| KP-6.4-20 | Bila Titik tiba lebih dari lima menit setelah `direkam_pada`, maka ia ditandai diterima terlambat dan tetap masuk pada urutan waktunya, bukan pada waktu tibanya (BR-45) |
| KP-6.4-21 | Bila `direkam_pada` sebuah Titik berada di masa depan lebih dari lima menit, atau mendahului `dibuka_pada` sesinya, maka Titik ditolak |
| KP-6.4-22 | Bila Titik mengendap di perangkat lebih dari empat puluh delapan jam sejak `direkam_pada`, maka ia tidak dikirim otomatis dan dibuang tanpa mengganggu pengiriman Titik yang lebih baru |
| KP-6.4-23 | Bila pengguna berganti perangkat sebelum antreannya terkirim, maka Titik tetap dapat dikirim dari perangkat barunya yang sah, dan perangkat asalnya tercatat sebagai fakta |

### Menutup Sesi Tugas

| Kode | Kriteria |
| --- | --- |
| KP-6.4-24 | Bila pengguna menggeser tombol Selesai Tugas, maka sesi ditutup dengan sebab manual dan pengiriman Titik berhenti seketika |
| KP-6.4-25 | Bila pengguna keluar dari aplikasi saat sesi berjalan, maka sesi ditutup dengan sebab keluar aplikasi tanpa memerlukan persetujuan siapa pun, Rute tersimpan utuh, dan Kanit serta Panit Penanggung Jawab diberi tahu (BR-19) |
| KP-6.4-26 | Bila akun yang sama masuk di perangkat lain, maka sesi ditutup dengan sebab pindah perangkat |
| KP-6.4-27 | Bila sesi tidak menerima pembaruan posisi selama lebih dari dua jam, maka sesi ditutup dengan sebab menggantung, baik oleh pekerjaan berjadwal maupun oleh pembukaan sesi berikutnya, mana yang lebih dahulu terjadi |
| KP-6.4-28 | Bila Kanit menutup atau membatalkan SPT saat masih ada sesi berjalan padanya, maka sesi-sesi itu ditutup dengan sebab SPT ditutup |
| KP-6.4-29 | Bila pelaksana dicabut dari SPT saat sesinya berjalan, maka sesinya ditutup dengan sebab dicabut dari SPT, dan Rute yang sudah terekam tetap tersimpan (BR-30) |
| KP-6.4-30 | Bila sebuah sesi ditutup dengan sebab apa pun, maka Ringkasan Rute disusun dalam transaksi yang sama dan barisnya di `posisi_terkini` dihapus |
| KP-6.4-31 | Bila sebuah sesi ditutup, maka baris `sesi_tugas` tidak pernah dihapus, termasuk saat titik-titiknya disusutkan |

### Peta waktu nyata dan status Terakhir terlihat

| Kode | Kriteria |
| --- | --- |
| KP-6.4-32 | Bila pengguna membuka peta, maka yang tampil hanya pemegang Sesi Tugas berjalan dalam lingkup datanya, bukan seluruh personel |
| KP-6.4-33 | Bila Titik terakhir diterima kurang dari dua menit lalu, maka penanda berwarna hijau bertulis Aktif |
| KP-6.4-34 | Bila Titik terakhir diterima antara dua dan lima belas menit lalu, maka penanda berwarna kuning bertulis Terakhir terlihat sekian menit lalu |
| KP-6.4-35 | Bila Titik terakhir diterima lebih dari lima belas menit lalu, maka penanda berwarna abu-abu bertulis Terakhir terlihat sekian waktu lalu |
| KP-6.4-36 | Bila status berwarna abu-abu, maka tidak satu pun kalimat pada tampilan menyebutkan sebab, kelalaian, atau dugaan (Section 0.6, BR-05) |
| KP-6.4-37 | Bila daya perangkat pada Titik terakhir tercatat, maka angkanya ditampilkan sebagai keterangan datar berdampingan dengan waktu, tanpa kalimat penafsir |
| KP-6.4-38 | Bila izin lokasi sedang terputus pada sebuah sesi, maka keadaan itu ditampilkan sebagai keterangan tersendiri, bukan digabungkan ke dalam warna status |
| KP-6.4-39 | Bila seluruh perhitungan waktu status dilakukan, maka yang dipakai adalah `direkam_pada`, bukan waktu tiba di server (BR-45) |
| KP-6.4-40 | Bila peta terbuka dan Titik baru masuk, maka penanda berpindah tanpa memuat ulang halaman |

### Penelusuran Rute

| Kode | Kriteria |
| --- | --- |
| KP-6.4-41 | Bila pengguna membuka Rute sebuah SPT, maka tersedia pilihan menampilkan seluruh sesi sekaligus atau satu sesi saja |
| KP-6.4-42 | Bila sebuah sesi ditampilkan, maka garisnya hanya menghubungkan Titik yang tidak diragukan |
| KP-6.4-43 | Bila Titik satuan sebuah sesi sudah disusutkan, maka Ringkasan Rute tetap dapat ditampilkan berupa garis kasar beserta angkanya |
| KP-6.4-44 | Bila Rute ditampilkan, maka titik-titik lokasi SPT dari `penugasan_lokasi` ikut digambar sebagai pembanding |
| KP-6.4-45 | Bila sebuah SPT belum pernah memiliki Sesi Tugas, maka halaman Rute menampilkan kondisi kosong yang menyatakan belum ada kegiatan terekam, bukan galat |
| KP-6.4-46 | Bila pengguna berperan Anggota membuka menu Rute Saya, maka ia melihat seluruh sesinya sendiri lintas SPT, termasuk yang sudah selesai |
| KP-6.4-47 | Bila Rute diekspor, maka pengeksporannya tercatat pada jejak audit (Section 9.4) |

### Lingkup data dan jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.4-48 | Bila pengguna berperan Anggota, maka ia membaca Titik miliknya sendiri dan Titik rekan pelaksana aktif pada SPT yang sama, dan tidak lebih dari itu |
| KP-6.4-49 | Bila seorang pelaksana sudah dicabut dari SPT, maka pembacaan posisi rekan pada SPT itu tertutup baginya seketika, sedangkan Rute miliknya sendiri tetap terbaca |
| KP-6.4-50 | Bila pengguna berperan Panit, maka ia membaca Titik pada penugasan tempat ia ditunjuk, tanpa memandang `dicabut_pada` (BR-21) |
| KP-6.4-51 | Bila pengguna berperan Panit, maka baris `titik_penanda` tidak terbaca olehnya dalam bentuk apa pun, termasuk lewat permintaan langsung ke basis data |
| KP-6.4-52 | Bila peta waktu nyata dibuka, maka pembukaannya tercatat pada jejak audit dengan jenis tindakan tersendiri (Section 9.4) |
| KP-6.4-53 | Bila Akun Pemeliharaan membaca data lokasi, maka pembacaannya tercatat sebagaimana tindakan lainnya (BR-17) |
| KP-6.4-54 | Bila Akun Pemeliharaan mencoba membuka Sesi Tugas, maka ditolak (BR-17) |
| KP-6.4-55 | Bila pengiriman Titik melampaui batas laju yang ditetapkan, maka pengiriman berikutnya ditolak sampai jendelanya berganti (BR-51) |

### Izin dan daya

| Kode | Kriteria |
| --- | --- |
| KP-6.4-56 | Bila izin lokasi dicabut saat Sesi Tugas berjalan, maka sesi **tetap terbuka**, ditandai izin terputus, dan Kanit serta Panit Penanggung Jawab diberi tahu |
| KP-6.4-57 | Bila izin lokasi diberikan kembali sebelum sesi berakhir, maka penandanya dilepas dan pengiriman Titik berjalan kembali tanpa membuka sesi baru |
| KP-6.4-58 | Bila izin terputus berlanjut sampai dua jam tanpa Titik masuk, maka sesi ditutup dengan sebab menggantung, mengikuti aturan yang sama dengan sebab lain |
| KP-6.4-59 | Bila perangkat menghentikan proses latar belakang, maka aplikasi menampilkan panduan pengaturan penghematan daya yang sesuai dengan mereknya (Section 11.3) |
| KP-6.4-60 | Bila Sesi Tugas berjalan, maka pemberitahuan sistem yang menetap ditampilkan sepanjang sesi dan tidak dapat disingkirkan pengguna |

### Gerakan penanda pada peta

| Kode | Kriteria |
| --- | --- |
| KP-6.4-61 | Bila Titik baru diterima, maka penanda pada peta berpindah lewat gerakan berkelanjutan dari kedudukan lama ke kedudukan baru, bukan berpindah seketika |
| KP-6.4-62 | Bila penanda sedang bergerak, maka ia diputar mengikuti arah yang dihitung dari dua kedudukan terakhir |
| KP-6.4-63 | Bila Titik terakhir sudah lebih tua dari dua menit, maka gerakan berhenti dan penanda diam pada kedudukan terakhirnya. Penanda tidak pernah bergerak menuju kedudukan yang diperkirakan sistem |

Butir terakhir menutup godaan yang sering muncul: memperkirakan posisi berikutnya agar penanda
tampak terus bergerak. Itu menampilkan sesuatu yang tidak pernah diterima sistem, dan bertentangan
dengan Prinsip 0.6 pada tingkat yang paling dasar.

### Bentuk aplikasi dan syarat pelacakan latar belakang

| Kode | Kriteria |
| --- | --- |
| KP-6.4-64 | Bila izin lokasi latar belakang belum diberikan, maka aplikasi tidak menjalankan layanan latar depan sama sekali, dan Mulai Tugas ditolak dengan keterangan langkah yang perlu dilakukan |
| KP-6.4-65 | Bila layanan latar depan berhenti sementara Sesi Tugas masih berjalan, maka pada pembukaan aplikasi berikutnya pengguna diberi tahu bahwa pelacakan sempat terhenti, disertai tombol menyalakannya kembali. Keterangannya menyebut kejadian, tidak menyebut sebab |
| KP-6.4-66 | Bila aplikasi mendeteksi pengiriman Titik terhenti lebih dari lima menit padahal Sesi Tugas berjalan dan izin masih diberikan, maka panduan pengaturan penghematan daya sesuai merek perangkat ditampilkan |
| KP-6.4-67 | Bila pengguna membuka SiPANTAU dalam bentuk web, maka tombol Mulai Tugas tidak dirender sama sekali, digantikan keterangan dan tautan pemasangan berkas Android |
| KP-6.4-68 | Bila permintaan pembukaan sesi datang dari penanda perangkat bentuk web, maka basis data menolaknya, tanpa bergantung pada penyembunyian tombol |

### Zona waktu, pencabutan, dan penyusutan

| Kode | Kriteria |
| --- | --- |
| KP-6.4-69 | Bila perhitungan hari kalender dilakukan di mana pun dalam sistem, maka ia memakai zona waktu `Asia/Jakarta` |
| KP-6.4-70 | Bila Panit sudah dicabut penunjukannya, maka ia tetap membaca rute SPT itu dan tidak lagi melihat penanda pada peta waktu nyata |
| KP-6.4-71 | Bila Sesi Tugas masih berjalan, maka Titik miliknya tidak pernah disusutkan, berapa pun umurnya |
| KP-6.4-72 | Bila baris `posisi_terkini` dihapus, maka peristiwa yang disiarkan hanya memuat kunci utamanya |

## 6.4.4 Aturan modul

1. Tidak ada perekaman posisi di luar Sesi Tugas, dalam bentuk apa pun, termasuk untuk keperluan
   diagnosis atau pengujian di lingkungan produksi.
2. Sesi Tugas dibuka dan ditutup oleh manusia. Sistem hanya menutup, tidak pernah membuka.
3. Setiap penutupan wajib memiliki sebab dari daftar tertutup. Tidak ada penutupan tanpa sebab.
4. Ambang dua puluh lima meter dan tiga puluh detik bersifat mengikat dan tidak boleh diubah
   diam-diam oleh kode. Perubahan ambang menuntut revisi PRD yang tercatat.
5. Titik tidak pernah ditolak karena mutunya. Yang buruk ditandai, bukan dibuang — kecuali
   ketiga pemeriksaan waktu pada KP-6.4-21, yang menolak karena datanya tidak dapat dipercaya
   sama sekali, bukan karena mutunya rendah.
6. Ringkasan Rute disusun tepat satu kali, saat penutupan, dan tidak pernah dihitung ulang.
7. Modul ini tidak pernah menutup SPT, tidak pernah mengubah statusnya, dan tidak pernah
   menyentuh tabel milik Modul 6.2 selain membaca dan mengunci barisnya.
8. Seluruh keterangan waktu di antarmuka ditulis relatif dan netral. Tidak ada kata yang
   menyatakan seseorang tidak bertugas, terlambat, atau menghilang.
9. Setiap perhitungan hari kalender memakai zona waktu `Asia/Jakarta` secara eksplisit. Penulisan
   `timestamptz::date` tanpa penyebutan zona waktu dilarang, termasuk di dalam fungsi dan pemicu.
10. Koordinat disajikan apa adanya. Rute tidak pernah ditempelkan ke jaringan jalan, tidak pernah
    diluruskan, dan tidak pernah disesuaikan terhadap titik lokasi SPT.
11. Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang. Bentuk web menyembunyikan
    tombolnya dan tetap memiliki seluruh kemampuan lain.

## 6.4.5 Antarmuka dan kondisi tampilan

### Kartu Sesi Tugas pada halaman rincian SPT — sisi pelaksana

Tombol geser ala Shopee Food menjadi aksi utamanya, sesuai keputusan Modul 6.1. Geser ke kanan
untuk Mulai Tugas, geser ke kanan lagi untuk Selesai Tugas. Tidak ada dialog konfirmasi tambahan;
gerakan menggeser sudah menjadi konfirmasinya.

Di bawah tombol, tiga baris keterangan saat sesi berjalan: lama sesi berjalan, jumlah Titik
terkirim, dan jumlah Titik yang masih mengantre. Baris ketiga muncul hanya bila antreannya tidak
kosong.

### Layar Peta — sisi pengawas

Peta Leaflet dengan penanda per pemegang sesi. Menekan penanda membuka lembar bawah berisi nama,
nomor SPT, status Terakhir terlihat, daya perangkat, dan tombol menuju Rute sesi berjalan.

Penyaring di atas peta: unit (hanya bagi Kasubdit), SPT, dan status warna. Daftar di samping peta
pada layar lebar, menjadi lembar tarik pada layar telepon.

### Layar Rute

Garis rute per sesi dengan warna berbeda, disertai penanda titik lokasi SPT sebagai pembanding.
Panel samping memuat daftar sesi beserta waktu, sebab penutupan, jarak tempuh, dan jumlah Titik.
Sesi yang titiknya sudah disusutkan ditampilkan dengan garis putus-putus beserta keterangan bahwa
yang tergambar adalah bentuk kasarnya.

### Layar Rute Saya — sisi pelaksana

Isinya persis sama dengan yang dilihat pengawas atas dirinya, tanpa satu pun bagian yang
disembunyikan. Ini disengaja: orang yang dilacak berhak melihat seluruh data tentang dirinya, dan
keterbukaan itu yang membuat sistem ini dipakai secara sukarela, sebagaimana catatan strategis
pada Section 1.1.

### Kondisi kosong

| Keadaan | Yang ditampilkan |
| --- | --- |
| Tidak ada yang bertugas dalam lingkup pengguna | Peta tetap tampil pada wilayah unit, disertai keterangan bahwa belum ada Sesi Tugas berjalan |
| SPT belum pernah memiliki sesi | Halaman Rute menyatakan belum ada kegiatan terekam |
| Sesi berjalan tetapi belum ada Titik masuk | Penanda belum muncul, disertai keterangan menunggu posisi pertama |
| Anggota belum pernah membuka sesi | Rute Saya menyatakan belum ada riwayat, disertai penjelasan bahwa perekaman hanya berjalan selama Sesi Tugas |

### Kondisi memuat dan galat

| Keadaan | Yang ditampilkan |
| --- | --- |
| Peta sedang memuat | Kerangka peta dengan penanda pudar, bukan layar kosong |
| Sambungan waktu nyata terputus | Keterangan datar bahwa pembaruan tertunda, disertai waktu pembaruan terakhir. Data lama tetap ditampilkan, tidak dikosongkan |
| Pembukaan sesi ditolak `23505` | Nomor dan judul SPT yang sedang terbuka, beserta jalan keluarnya (Addendum 6.2-T Bagian 2.3) |
| Pembukaan sesi ditolak karena perangkat | Keterangan bahwa akun sedang aktif di perangkat lain, disertai arahan masuk ulang |
| Batas laju terlampaui | Keterangan berapa batasnya dan kapan dapat dicoba lagi (KP-6.10-08) |

### Perbedaan antar peran

| Peran | Yang terlihat |
| --- | --- |
| Kasubdit | Peta seluruh unit, seluruh Rute, penanda lokasi tiruan, ringkasan lintas unit |
| Kanit | Peta unitnya, Rute unitnya, penanda lokasi tiruan pada unitnya |
| Panit | Peta dan Rute pada penugasan yang ia awasi. Tanpa penanda lokasi tiruan |
| Anggota | Posisi dan Rute sendiri, ditambah rekan pelaksana aktif pada SPT yang sama. Tanpa penanda lokasi tiruan |
| Akun Pemeliharaan | Membaca seluruhnya, tidak dapat membuka Sesi Tugas, tidak muncul di peta (BR-17) |

## 6.4.6 Edge case modul

| Kondisi | Penanganan |
| --- | --- |
| Sinyal posisi hilang di tengah sesi | Tidak ada tindakan. Status berpindah warna dengan sendirinya karena `direkam_pada` menua |
| Izin lokasi dicabut di tengah sesi | Sesi tetap terbuka, ditandai izin terputus, pengawas diberi tahu (KP-6.4-56) |
| Perangkat mati atau kehabisan daya | Sesi menggantung setelah dua jam. Daya terakhir yang tercatat membantu menjelaskan tanpa menuduh |
| Titik berakurasi sangat rendah | Disimpan, ditandai diragukan, tidak menggambar garis |
| Indikasi lokasi tiruan | Dicatat sebagai fakta pada tabel terpisah. Tidak pernah menghasilkan penolakan maupun kesimpulan |
| Sesi tidak pernah ditutup pengguna | Ditutup sistem dengan sebab menggantung, lewat penjadwal maupun lewat pembukaan sesi berikutnya |
| Waktu perangkat jauh berbeda dari server | Tiga pemeriksaan pada KP-6.4-21 menolak yang tidak masuk akal, sisanya diterima apa adanya |
| Titik menumpuk saat jaringan hilang lalu terkirim sekaligus | Antrean Titik, dengan penanda unik penangkal kembar |
| Dua pembaruan posisi tiba hampir bersamaan | Keduanya masuk. `posisi_terkini` di-*upsert* dengan syarat `direkam_pada` lebih baru, sehingga yang lebih lama tidak menimpa yang lebih baru |
| Sesi dibuka pada dua perangkat sekaligus | Mustahil. Indeks unik parsial menolak yang kedua sebelum sampai ke aplikasi |
| SPT disunting saat sesi berjalan | Dibiarkan. Sesi tidak terganggu, sesuai keputusan Modul 6.2 |
| Titik lokasi SPT dihapus setelah rute digambar | Rute tidak terpengaruh. `location_logs` tidak mengacu ke `penugasan_lokasi` sama sekali |
| Akun dinonaktifkan saat sesi berjalan | Sesi ditutup dengan sebabnya sendiri, Rute tersimpan utuh (BR-20) |
| Laporan masuk setelah sesi ditutup otomatis | `sesi_tugas_id` kosong. Sah dan diharapkan, lihat P-08 |
| Penjadwal berhenti berhari-hari | Tidak ada yang terkunci. Penutupan sesi menggantung tetap terjadi lewat jalur pembukaan sesi (P-04) |

## 6.4.7 Ketergantungan

| Modul | Sifat ketergantungan |
| --- | --- |
| 6.1 Autentikasi & Peran | Wajib selesai lebih dahulu. Fungsi bantu peran dan unit, Perangkat Terdaftar, dan BR-16 sampai BR-25 menjadi fondasi seluruh aturan akses modul ini |
| 6.2 Manajemen Penugasan | Wajib selesai lebih dahulu. `penugasan`, `penugasan_pelaksana`, `penugasan_panit`, indeks unik parsial `sesi_tugas`, dan syarat penguncian baris induk pada Bagian 8.3 |
| 6.3 Pelaporan Harian | Berkaitan dua arah. `laporan_harian.sesi_tugas_id` diisi dari sesi yang berjalan, dan Antrean Titik meniru pola Antrean Luring |
| 6.5 Dashboard | Bergantung pada modul ini. Peta pada dashboard membaca `posisi_terkini` |
| 6.8 LHP Ringkas | Bergantung pada modul ini. Ringkasan Rute menjadi bahan isian otomatis |
| 6.9 Notifikasi | Bergantung pada modul ini. Modul ini menyisipkan baris `notifikasi`, modul 6.9 yang mengantarkannya |
| 6.10 Ekspor & Pembatasan Laju | Berkaitan. Pengiriman Titik masuk daftar tertutup pembatasan laju |

---
---

# Bagian 5 — Tambahan Section 7 Business Rules Global

| Kode | Aturan | Modul terkait |
| --- | --- | --- |
| BR-54 | Sesi Tugas yang tidak menerima pembaruan posisi lebih dari dua jam ditutup sistem dengan sebab menggantung. Penutupan itu **tidak boleh bergantung pada berjalannya penjadwal**; jalur kedua yang tidak bersandar pada penjadwal wajib ada, sejalan BR-36 | 6.4 |
| BR-55 | Setiap Titik wajib terikat pada satu Sesi Tugas, dan sesi itu wajib menunjuk SPT yang sama dengan `penugasan_id` Titik tersebut. Kesamaannya ditegakkan basis data, bukan diandaikan | 6.4 |
| BR-56 | Setiap penutupan Sesi Tugas wajib memiliki sebab dari daftar tertutup tujuh nilai. Baris `sesi_tugas` tidak pernah dihapus dan tidak pernah disusutkan | 6.4, 6.5, 6.8 |
| BR-57 | Titik tidak pernah ditolak karena mutunya. Titik berketelitian buruk atau berperpindahan tidak wajar tetap disimpan dan ditandai. Penolakan hanya berlaku bagi Titik yang waktunya tidak dapat dipercaya | 6.4 |
| BR-58 | Ringkasan Rute disusun tepat satu kali saat penutupan sesi dan disimpan permanen. Penyusutan Titik tidak boleh menghilangkan sejarah sebuah Sesi Tugas | 6.4, 6.8 |
| BR-59 | Titik disusutkan bila salah satu tercapai lebih dahulu: sembilan puluh hari sejak SPT selesai atau dibatalkan, atau tiga ratus enam puluh lima hari sejak `direkam_pada` tanpa memandang status SPT | 6.4 |
| BR-60 | Titik yang tertahan tanpa jaringan mengikuti pola Antrean Luring BR-45 sampai BR-48, dengan ambang kedaluwarsa empat puluh delapan jam, bukan tujuh hari | 6.4 |
| BR-61 | Keterangan bahwa sebuah Titik berasal dari penyedia lokasi tiruan hanya terbaca Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan. Penegakannya wajib pada tingkat baris basis data; penyembunyian di antarmuka tidak dianggap pengamanan | 6.4, 6.5 |
| BR-62 | Pelaksana aktif sebuah SPT saling membaca posisi dan Rute pada SPT tersebut. Hak itu berakhir seketika saat `dicabut_pada` terisi, berbeda dari hak baca Panit yang bertahan selamanya menurut BR-21 | 6.4, 6.5 |
| BR-63 | Pembukaan peta waktu nyata, penelusuran Rute suatu SPT, dan pengeksporan Rute dicatat pada jejak audit sebagai pembukaan data lokasi yang bersifat luas | 6.4, 6.5, 6.10 |

| BR-64 | Setiap perhitungan yang menyangkut hari kalender, tanggal, atau batas harian wajib dilakukan pada zona waktu `Asia/Jakarta`, tidak pernah pada zona waktu bawaan basis data. Penulisan `timestamptz::date` tanpa penyebutan zona waktu dilarang di seluruh sistem, termasuk pada tampilan, pemicu, fungsi, pekerjaan berjadwal, dan kueri sisi aplikasi | Seluruh modul |
| BR-65 | Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang. Pada bentuk web tombolnya disembunyikan, bukan ditampilkan nonaktif (BR-11), dan digantikan keterangan beserta tautan pemasangan. Seluruh kemampuan lain tetap tersedia penuh pada bentuk web | 6.1, 6.4 |
| BR-66 | Setiap tabel baru wajib didaftarkan secara sadar ke Data API sebagai langkah tersendiri yang tercatat pada urutan pembangunan, terpisah dari pembuatan tabelnya dan dari penyusunan aturan aksesnya. Kegagalan membaca tabel baru wajib diperiksa terhadap pendaftaran ini lebih dahulu, sebelum aturan akses baris dicurigai | Seluruh modul |
| BR-67 | Koordinat disajikan apa adanya. Rute tidak pernah ditempelkan, diluruskan, atau disesuaikan terhadap jaringan jalan maupun terhadap titik lokasi SPT, baik pada penyimpanan maupun pada penyajian | 6.4, 6.5, 6.8 |

> **Catatan penomoran.** BR-54 sampai BR-67 melanjutkan dari BR-53 sesuai aturan penambahan pada
> Section 7 dan pemeriksaan yang diwajibkan Addendum 6.2-T Bagian 0.4. Tidak ada kode lama yang
> dipakai ulang. **Modul berikutnya mulai dari BR-68.**

## Amandemen atas aturan yang sudah ada

| Kode | Yang berubah | Alasan |
| --- | --- | --- |
| BR-51 | Daftar tertutup operasi yang dibatasi lajunya bertambah satu baris, lihat di bawah | Penambahan wajib lewat revisi PRD yang tercatat, dan revisi itu adalah berkas ini |
| BR-59 | Ditambahkan syarat: Titik hanya dapat disusutkan bila Sesi Tugas induknya **sudah tertutup**. Titik milik sesi yang masih berjalan tidak pernah disusutkan, berapa pun umurnya. Kedua ambang lainnya tetap berlaku | P-22. "Mustahil dalam praktik" bukan penjagaan |
| BR-62 | Dipisahkan: hak baca `location_logs` bertahan setelah pencabutan sesuai BR-21, sedangkan hak baca `posisi_terkini` **berakhir** saat pencabutan, bagi Panit maupun sesama pelaksana | P-21. Riwayat selamanya masuk akal; pemantauan langsung selamanya tidak |

**Amandemen BR-51.** Daftar tertutup operasi yang dibatasi lajunya bertambah satu baris. Karena
BR-51 mensyaratkan penambahan lewat revisi PRD yang tercatat, revisi itu adalah berkas ini.

| Operasi | Batas | Jendela | Alasan |
| --- | --- | --- | --- |
| `kirim_titik` | 600 | 5 menit | Melindungi kuota dari klien rusak. Angka ini memberi ruang bagi pengosongan antrean lima jam sekaligus, sementara pemakaian wajar hanya sepuluh per lima menit |

---
---

# Bagian 6 — Tambahan Section 8.10 Pelacakan posisi

Daftar kondisi tepi lintas modul yang lahir dari Modul 6.4. Penanganan rincinya ada pada 6.4.6.

- Sesi Tugas menggantung sementara penjadwal sedang berhenti
- Izin lokasi dicabut lalu diberikan kembali dalam satu sesi yang sama
- Titik tiba setelah sesinya sudah ditutup sistem
- Titik tiba setelah SPT-nya ditutup atau dibatalkan
- Antrean Titik terkirim dari perangkat yang berbeda dari perangkat perekamnya
- Ringkasan Rute disusun untuk sesi yang tidak pernah menerima satu Titik pun
- Dua Titik dengan `direkam_pada` yang sama persis tiba bersamaan
- Titik satuan sudah disusutkan sementara LHP yang merujuknya baru disusun kemudian
- Laporan harian masuk tanpa `sesi_tugas_id` karena sesinya sudah tertutup otomatis

---
---

# Bagian 7 — Tambahan Section 9

## 9.2 Aturan akses per tabel

**[FINAL] untuk tabel yang menjadi urusan Modul 6.4**

| Tabel | Baca | Tulis |
| --- | --- | --- |
| `sesi_tugas` | Pemegangnya sendiri; pelaksana aktif SPT yang sama; Panit dengan penunjukan pada SPT itu tanpa memandang `dicabut_pada`; Kanit unit pemilik; Kasubdit; Akun Pemeliharaan | Penyisipan hanya lewat fungsi pembuka sesi, oleh pelaksana aktif dari Perangkat Terdaftar. Pembaruan tidak pernah dilakukan klien secara langsung — seluruhnya lewat fungsi dan pemicu ber-`security definer` |
| `location_logs` | Pemiliknya sendiri; pelaksana **aktif** SPT yang sama (BR-62); Panit dengan penunjukan tanpa memandang `dicabut_pada` (BR-21); Kanit unit pemilik; Kasubdit; Akun Pemeliharaan | Penyisipan hanya oleh pemiliknya sendiri, dari Perangkat Terdaftar, dan hanya bila sesi yang dirujuk masih berjalan dan miliknya. Pembaruan dan penghapusan tertutup bagi seluruh peran |
| `posisi_terkini` | Pemegang sesi sendiri; pelaksana yang **belum dicabut** pada SPT yang sama; Panit dengan penunjukan yang **belum dicabut**; Kanit unit pemilik; Kasubdit; Akun Pemeliharaan. Berbeda dari `location_logs`, tabel ini **memeriksa** `dicabut_pada` bagi Panit (BR-62 teramandemen) | Tertutup bagi seluruh peran. Hanya pemicu ber-`security definer` yang menulisnya |
| `titik_penanda` | **Hanya** Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan (BR-61) | Tertutup bagi seluruh peran. Hanya pemicu yang menulisnya |

> **Tiga hal yang wajib diperhatikan saat implementasi**
>
> Pertama, klausa baca `location_logs` untuk **rekan pelaksana memeriksa `dicabut_pada`**,
> sedangkan klausa baca untuk **Panit mengabaikannya**. Keduanya berada dalam satu kebijakan yang
> sama dan mudah tertukar. Tertukar ke satu arah melanggar BR-21, tertukar ke arah lain melanggar
> BR-62. Ini kesalahan paling mungkin di modul ini.
>
> Dan yang kedua kalinya mudah tertukar: pada `posisi_terkini`, klausa Panit **memeriksa**
> `dicabut_pada`, kebalikan dari `location_logs`. Kedua tabel bersebelahan dan kebijakannya mirip.
> Menyalin yang satu ke yang lain adalah kesalahan yang paling mungkin terjadi pada penutupan
> modul ini.
>
> Kedua, `posisi_terkini` adalah **tabel**, bukan tampilan, sehingga BR-37 tidak berlaku padanya.
> Yang berlaku aturan akses baris biasa. Tetapi ia dilanggani lewat Realtime, dan aturan akses
> barisnya dievaluasi bagi setiap pelanggan. Menambahkan tabel ke publikasi tanpa menguji aturan
> aksesnya dari peran yang tidak berhak menghasilkan kebocoran yang tidak menimbulkan galat apa
> pun — jenis kegagalan yang sama dengan T-02.
>
> Ketiga, `titik_penanda` tidak boleh digabungkan ke dalam kueri yang sama dengan `location_logs`
> untuk peran yang tidak berhak. Penggabungan yang aturannya benar akan menghasilkan baris kosong,
> bukan galat — sehingga kekeliruan di sini terlihat seperti data yang memang tidak ada.

## 9.4 Data lokasi dan data perkara — amandemen

Kalimat berikut ditambahkan pada akhir Section 9.4:

> Pembukaan data lokasi yang bersifat luas dicatat pada jejak audit. Yang termasuk luas adalah
> pembukaan peta waktu nyata, penelusuran Rute suatu SPT, dan pengeksporan Rute. Pembacaan
> seseorang atas Rutenya sendiri **tidak** dicatat, karena ia bukan pembukaan yang meluas dan
> pencatatannya hanya akan menghasilkan bising tanpa manfaat pengawasan.

## 9.6 Jenis tindakan jejak audit — tambahan

`buka_sesi_tugas`, `tutup_sesi_tugas`, `buka_peta_langsung`, `buka_rute_spt`, `ekspor_rute`,
`susut_titik`.

Penyisipan Titik **tidak** dicatat tersendiri. Ribuan baris jejak audit per hari akan menenggelamkan
tindakan yang benar-benar perlu ditelusuri, dan Titik itu sendiri sudah merupakan catatannya.

---
---

# Bagian 8 — Perubahan Section 4, 10, dan 11

## 4.2 Tumpukan teknologi — baris tambahan

| Bagian | Pilihan | Catatan |
| --- | --- | --- |
| Pembaruan waktu nyata | Supabase Realtime | Berlangganan **hanya** tabel `posisi_terkini`. `location_logs` sengaja tidak dimasukkan ke publikasi |

## 4.5 Batasan arsitektur — butir tambahan

> **Publikasi waktu nyata bersifat menentukan.** Tabel yang masuk publikasi Realtime mengirimkan
> seluruh isi barisnya kepada setiap pelanggan yang lolos aturan akses baris. Karena itu keputusan
> tentang kolom mana yang boleh berada pada tabel yang dilanggani adalah keputusan keamanan,
> bukan keputusan rancangan data. Lihat Section 5.21.

## 10.1 Kinerja — angka yang sebelumnya ditunda

| Aspek | Sasaran |
| --- | --- |
| Jeda pembaruan posisi di peta | Paling lama tiga detik sejak Titik diterima basis data |
| Waktu muat peta berisi tiga puluh penanda | Paling lama dua detik pada jaringan seluler 4G |
| Waktu tampil Rute satu sesi berisi seribu Titik | Paling lama tiga detik |
| Jumlah pemegang sesi bersamaan yang wajib tertangani | Enam puluh |

## 10.2 Volume data — angka yang sebelumnya ditunda

Seorang pemegang sesi selama delapan jam menghasilkan paling banyak sembilan ratus enam puluh
Titik bila ia bergerak terus-menerus, dan jauh lebih sedikit bila ia diam mengamati. Enam puluh
orang bertugas bersamaan menghasilkan paling banyak sekitar lima puluh delapan ribu baris per
hari kerja.

Dengan retensi BR-59, tabel mengendap pada kisaran beberapa juta baris — masih jauh di bawah
batas layanan terkelola, dan itulah alasan penyusutan ditetapkan sekarang, bukan nanti.

## 10.3 Kesesuaian perangkat — angka yang sebelumnya ditunda

Versi Android minimum: **Android 8.0**. Alasannya bukan selera melainkan batas teknis — pelacakan
latar belakang yang dapat diandalkan menuntut layanan latar depan beserta pemberitahuan menetap,
dan perilakunya baru seragam sejak versi tersebut.

## 11.2 Urutan permintaan izin — penegasan

Urutan yang sudah mengikat tidak berubah. Yang ditambahkan adalah bentuk permintaannya, mengikuti
pola aplikasi ojol sesuai keputusan yang sudah terkunci:

1. Layar penjelasan **sebelum** dialog sistem muncul, memuat satu kalimat alasan dan satu kalimat
   yang menegaskan perekaman hanya berjalan selama Sesi Tugas
2. Dialog sistem untuk izin lokasi saat aplikasi dipakai
3. Layar kedua yang menerangkan mengapa pilihan Izinkan sepanjang waktu diperlukan, disertai
   gambar langkah membukanya di pengaturan sistem
4. Tombol yang membuka halaman pengaturan aplikasi secara langsung, bukan sekadar menyuruh
   pengguna mencarinya sendiri

## 11.3 Pengaturan penghematan daya — penegasan

Panduan disajikan **saat dibutuhkan**, yaitu ketika aplikasi mendeteksi pengiriman Titik terhenti
padahal sesi berjalan, bukan hanya sekali pada pemakaian pertama. Panduan menyesuaikan merek
perangkat yang terdeteksi.

## 11.6 Syarat teknis pelacakan latar belakang — bagian baru

Bagian ini bukan aturan bisnis melainkan syarat yang bila terlewat membuat seluruh Modul 6.4 tidak
berjalan.

### Izin yang wajib dideklarasikan

`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`,
`FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, dan `POST_NOTIFICATIONS`. Layanannya
dideklarasikan dengan jenis `location`.

Sejak Android 14, jenis layanan latar depan wajib dinyatakan di manifes beserta izin yang sesuai
bagi jenis tersebut. Yang paling berbahaya: bila aplikasi belum memperoleh izin lokasi latar
belakang lalu mencoba menjalankan layanan latar depan berjenis lokasi, sistem melempar galat
keamanan dan **aplikasi mati seketika**.

> **KP-6.4-64.** Bila izin lokasi latar belakang belum diberikan, maka aplikasi tidak menjalankan
> layanan latar depan sama sekali, dan Mulai Tugas ditolak dengan keterangan langkah yang perlu
> dilakukan.

### Batasan yang tidak dapat dihindari

Layanan latar depan hanya dapat dinyalakan saat aplikasi berada di depan. Ini kebetulan sejalan
dengan rancangan — Mulai Tugas memang ditekan saat Anggota membuka aplikasi — tetapi ia menutup
satu kemungkinan yang mungkin terpikir kemudian: menyalakan kembali pelacakan dari latar belakang
setelah layanannya mati bukanlah hal yang dapat dilakukan aplikasi sendiri.

> **KP-6.4-65.** Bila layanan latar depan berhenti sementara Sesi Tugas masih berjalan, maka pada
> pembukaan aplikasi berikutnya pengguna diberi tahu bahwa pelacakan sempat terhenti, disertai
> tombol menyalakannya kembali. Keterangannya menyebut kejadian, tidak menyebut sebab.

### Ambang tiga puluh detik saat layar mati

Ambang itu **tidak dapat** ditegakkan memakai penjadwal pekerjaan sistem operasi, yang jarak
terpendeknya lima belas menit, maupun memakai alarm, yang ditahan saat perangkat tidur. Satu-satunya
tempat ia dapat berjalan adalah di dalam layanan latar depan itu sendiri, memakai pendengar lokasi
miliknya.

Ini bukan pilihan rancangan melainkan batas sistem operasi, dan ia menentukan pilihan plugin.

### Pemilihan plugin

Dua pilihan yang masuk akal untuk anggaran proyek ini, keduanya tanpa biaya lisensi:

| Plugin | Kelebihan | Yang perlu diperhitungkan |
| --- | --- | --- |
| `@capacitor-community/background-geolocation` | Sudah mendukung Capacitor v7 dan sudah memperbaiki pelacakan latar belakang untuk Android 14. Titik diterima di lapisan JavaScript, sehingga pengiriman memakai pustaka klien yang sama dengan seluruh aplikasi | Bergantung pada hidupnya lapisan web. Bila prosesnya dimatikan, pengiriman berhenti sampai aplikasi dibuka kembali |
| `@capgo/background-geolocation` | Layanannya dipertahankan dan dijalankan ulang sistem, sehingga pengiriman berlanjut meski aplikasi digeser keluar dari daftar aplikasi terbaru. Titik dapat dikirim langsung dari lapisan native | Pengiriman native berada di luar pustaka klien, sehingga penyegaran token autentikasi wajib diurus sendiri di sisi native. Menambah satu tempat yang dapat gagal |

**Yang saya sarankan:** mulai dengan yang pertama, karena ia menyatu dengan sisa aplikasi dan tidak
menambah penanganan token. Pindah ke yang kedua **hanya bila** pengujian di perangkat sungguhan
menunjukkan pengiriman terlalu sering terhenti. Keputusan itu diambil berdasarkan hasil pengujian,
bukan di atas kertas — sejalan dengan Section 10.4 yang sudah menetapkan dampak daya diukur, bukan
diperkirakan.

### Merek yang menghentikan proses latar belakang secara sepihak

Sejumlah merek menghentikan layanan latar depan di luar aturan Android. Panduan pengaturannya
disajikan **saat dibutuhkan**, yaitu ketika aplikasi mendeteksi pengiriman terhenti padahal sesi
berjalan, bukan hanya sekali pada pemakaian pertama.

> **KP-6.4-66.** Bila aplikasi mendeteksi pengiriman Titik terhenti lebih dari lima menit padahal
> Sesi Tugas berjalan dan izin masih diberikan, maka panduan pengaturan penghematan daya sesuai
> merek perangkat ditampilkan.

---
---

# Bagian 9 — Perubahan Section 12 Di Luar Cakupan

| Tidak dibangun | Alasan |
| --- | --- |
| Penempelan rute ke jaringan jalan | Bertentangan dengan BR-67. Rute yang menyimpang — masuk halaman gudang, berhenti di tepi kebun, memotong kawasan tambang — justru keterangan yang paling bernilai bagi penyelidikan. Menempelkannya menghapus tepat bagian yang paling perlu dilihat |
| Perkiraan posisi di antara dua Titik | Menampilkan kedudukan yang tidak pernah diterima sistem. Bertentangan dengan Prinsip 0.6 |
| Pembukaan Sesi Tugas dari bentuk web | Bertentangan dengan BR-65. Peramban tidak memiliki layanan latar depan, sehingga pelacakan berhenti begitu layar mati tanpa satu pun tanda |

---
---

# Bagian 10 — Perubahan Lampiran A dan B

## Lampiran A — butir tambahan

| Kode | Butir | Pertanyaan | Dampak bila tidak terjawab |
| --- | --- | --- | --- |
| A-17 | Rekan pelaksana saling melihat posisi | Apakah pimpinan menyetujui bahwa sesama pelaksana pada satu SPT saling melihat posisi dan Rute, mengingat data lokasi termasuk yang dilindungi Section 9.4 | Aturan akses `location_logs` dan `posisi_terkini` disusun dengan lingkup yang lebih luas daripada Modul 6.3. Bila ditolak, klausa rekan dicabut tanpa mengubah bagian lain |\n| A-18 | Perlakuan atas indikasi lokasi tiruan | Apakah Kanit menghendaki pemberitahuan aktif saat penanda muncul, atau cukup terlihat saat Rute ditelusuri | Modul 6.9 tidak dapat menetapkan apakah jenis pemberitahuan ini ada. Bawaan yang dipakai sementara: tanpa pemberitahuan aktif |
| A-19 | Kanit sebagai pelaksana terlihat di peta | Apakah pimpinan berkeberatan bahwa Kanit yang dicantumkan sebagai pelaksana muncul pada peta yang dibaca Panit di unitnya sendiri | Bawaan yang dipakai sementara: muncul, sejalan dengan BR-31 yang menyamakan kedudukan seluruh pelaksana. Bila berkeberatan, klausa penyaring ditambahkan tanpa mengubah bagian lain |

## Lampiran B — butir tambahan

### B.11 Pelacakan posisi — bagian baru

- Perekaman posisi berjalan hanya selama Sesi Tugas dan tidak pernah di luar itu
- Rute disimpan terikat pada SPT sekaligus pada sesi yang menghasilkannya
- Sesi Tugas menggantung ditutup sistem setelah dua jam, lewat dua jalur yang saling menggantikan
- Sebab penutupan memiliki tujuh nilai tertutup, seluruhnya berupa keadaan dan bukan penilaian
- Titik berketelitian buruk atau berperpindahan tidak wajar ditandai, tidak dibuang
- Indikasi lokasi tiruan disimpan sebagai fakta pada tabel dengan akses lebih sempit
- Ringkasan Rute disimpan permanen pada `sesi_tugas` dan menggantikan Titik yang sudah disusutkan
- Peta waktu nyata disuapi `posisi_terkini`, bukan `location_logs`
- Sesama pelaksana aktif satu SPT saling melihat posisi; haknya berakhir saat pencabutan
- Pemegang sesi melihat seluruh data tentang dirinya persis seperti yang dilihat pengawasnya
- Laporan yang masuk di luar Sesi Tugas berisi `sesi_tugas_id` kosong, dan itu keadaan yang sah
- Seluruh perhitungan hari kalender memakai zona waktu `Asia/Jakarta`, bukan zona waktu bawaan
- Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang; bentuk web menyembunyikan tombolnya
- Rute tidak pernah ditempelkan ke jaringan jalan dan posisi tidak pernah diperkirakan
- Panit yang sudah dicabut tetap membaca rute, tidak lagi memantau peta waktu nyata

---
---

# Bagian 11 — Pemeriksaan mandiri: calon Addendum 6.4-T

**Bukan untuk ditempel ke PRD.** Ini hasil pemeriksaan atas berkas ini sendiri: bagian mana yang
menyatakan hasil akhir tanpa menjelaskan jalur teknisnya. **Dua puluh dua titik ditemukan.**
Jumlahnya naik dari sepuluh pada Modul 6.3, sesuai pola yang sudah tercatat pada Checklist.

| No | Yang dinyatakan tanpa jalur teknis | Rujukan | Mengapa tidak boleh diasumsikan |
| --- | --- | --- | --- |
| 1 | Fungsi pembuka Sesi Tugas yang menutup sendiri sesi basi milik pemanggil | P-04, KP-6.4-04 | Wajib menggabungkan `for update` pada `penugasan` (Addendum 6.2-T 8.3), penutupan sesi lama, penyusunan ringkasannya, dan penyisipan sesi baru — seluruhnya dalam satu transaksi. Urutan salah menghasilkan galat `23505` yang menyesatkan |
| 2 | Pembaruan `posisi_terkini` dan `titik_terakhir_pada` saat Titik masuk | KP-6.4-13 | Butuh `on conflict do update` bersyarat `direkam_pada` lebih baru, jika tidak Titik antrean yang tiba belakangan akan menimpa posisi terkini dengan posisi lama |
| 3 | Kesamaan `penugasan_id` dan `sesi_tugas_id` | BR-55 | Kunci asing tidak dapat menegakkan kesamaan lintas dua kolom. Wajib pemicu |
| 4 | Penandaan Titik diragukan | KP-6.4-14, KP-6.4-15 | Pemeriksaan lompatan menuntut pembacaan Titik wajar sebelumnya pada sesi yang sama. Bentuk kueri yang salah membuat setiap penyisipan menyapu indeks |
| 5 | Tiga pemeriksaan waktu Titik | KP-6.4-21 | Meniru `fn_nilai_kiriman_tertunda`, tetapi pembandingnya `sesi_tugas.dibuka_pada`, bukan `penugasan.dibuat_pada` |
| 6 | Penyusunan Ringkasan Rute | KP-6.4-30, BR-58 | Jarak tempuh lewat PostGIS, akurasi median, dan penyandian polyline. Perlu ditetapkan mana yang dihitung di basis data dan mana di aplikasi |
| 7 | Satu fungsi penutup sesi yang dipanggil enam jalur berbeda | Section 5.17 | Enam pemanggil dengan sebab berbeda. Menuliskannya enam kali menjamin keenamnya lambat laun berbeda perilaku |
| 8 | Penutupan sesi saat SPT ditutup dan saat pelaksana dicabut | KP-6.4-28, KP-6.4-29 | Pemicunya hidup di tabel milik Modul 6.2, dan urutannya terhadap pemicu yang sudah ada di sana belum diperiksa |
| 9 | Pekerjaan berjadwal penutup sesi menggantung dan penyusut Titik | BR-54, BR-59 | Wajib memenuhi BR-36: penjadwal hanya salah satu dari dua jalur, bukan satu-satunya |
| 10 | Aturan akses baris keempat tabel | Bagian 7 | Klausa rekan aktif dan klausa Panit berada dalam satu kebijakan dengan perlakuan `dicabut_pada` yang berlawanan |
| 11 | Larangan klien menulis `posisi_terkini` | Bagian 7 | Menutup penulisan sambil tetap membiarkan pemicu menulis menuntut `security definer` beserta pencabutan hak yang benar |
| 12 | Pemanggilan pembatasan laju pada pengiriman Titik | BR-51 amandemen | **Berbeda dari tiga operasi lain.** Ketiganya berjalan lewat Fungsi Tepi, sedangkan Titik disisipkan langsung lewat PostgREST. Pemanggilan `periksa_batas_laju` karena itu harus dari pemicu, dan akibatnya terhadap penyisipan massal belum ditetapkan |
| 13 | Pengosongan Antrean Titik secara massal | KP-6.4-18, KP-6.4-19 | Penyisipan banyak baris dengan `on conflict (antrean_id) do nothing`. Perlu ditetapkan bagaimana kegagalan sebagian dilaporkan ke aplikasi |
| 14 | Pemasukan `posisi_terkini` ke publikasi Realtime | Section 4.2 | Beserta butir uji yang membuktikan aturan aksesnya benar-benar berlaku bagi pelanggan yang tidak berhak |
| 15 | Urutan abjad pemicu pada `location_logs` | Bagian I.8 | Empat pemicu `BEFORE INSERT` pada satu tabel. Urutannya menentukan, dan penamaan yang tidak dirancang mengubahnya tanpa terlihat |
| 16 | Pembuatan baris `notifikasi` dari modul ini | KP-6.4-25, KP-6.4-56 | Nilai `jenis` yang dipakai belum terdaftar, dan Modul 6.9 belum digali |
| 17 | Bentuk perintah pendaftaran tabel ke Data API | P-17 | Ketentuannya sedang dalam masa peralihan sampai Oktober 2026, sehingga wajib diverifikasi terhadap dokumentasi saat pembangunan, bukan disalin dari dokumen ini |
| 18 | Pengenalan bentuk web pada penanda perangkat | P-19, KP-6.4-68 | Awalan yang dipakai, cara membangkitkannya, dan cara fungsi pembuka sesi menolaknya |
| 19 | Penjagaan sesi berjalan pada pekerjaan penyusutan | P-22 | Klausa penggabungan ke `sesi_tugas` beserta biayanya pada tabel terbesar sistem |
| 20 | Penyisiran zona waktu atas seluruh kueri yang sudah tertulis | P-16 | Termasuk yang berada di dalam fungsi dan pemicu, bukan hanya pada tampilan |
| 21 | Deteksi berhentinya layanan latar depan dari sisi aplikasi | KP-6.4-65 | Cara membedakan layanan yang mati dari perangkat yang sekadar tanpa sinyal |
| 22 | Perhitungan arah gerak di sisi tampilan | P-20, KP-6.4-62 | Dari dua kedudukan terakhir, termasuk perlakuan saat keduanya berimpit |

---
---

# Bagian 12 — Pemeriksaan tabrakan dengan yang sudah ada

Selain sembilan temuan Bagian 0, rancangan berkas ini diperiksa terhadap kolom, tabel, dan aturan
yang sudah berdiri. Enam titik ditemukan, tiga di antaranya sengaja menyimpang dan karena itu
dinyatakan di sini agar tidak terbaca sebagai kekeliruan pada pemeriksaan silang berikutnya.

| Kode | Titik | Sifat | Ketetapan |
| --- | --- | --- | --- |
| P-10 | Penegakan BR-61 lewat hak akses per kolom **tidak mungkin** | Batas teknis | Pada Supabase seluruh pengguna memakai satu peran basis data `authenticated`, sehingga `grant select (kolom)` tidak dapat membedakan Kanit dari Panit. Diselesaikan dengan tabel `titik_penanda` (Section 5.22), bukan dengan penyembunyian di antarmuka yang dilarang Section 9.1 |
| P-11 | `akurasi` diganti nama menjadi `akurasi_meter` | Menyimpang dari versi 0.2, disengaja | Section 0.2 melarang sinonim, dan `laporan_harian` sudah memakai `akurasi_meter`. Perubahan aman karena tabel belum pernah dibangun |
| P-12 | `diterima_pada` dipertahankan, tidak menjadi `dibuat_pada` | Menyimpang dari I.10, disengaja | I.10 sendiri membuka pengecualian bagi nama yang membawa arti tambahan, dan `diterima_pada` menjadi dasar penilaian keterlambatan. Sama persis dengan alasan `dikirim_pada` dipertahankan pada laporan |
| P-13 | Hak baca rekan **berakhir** saat pencabutan, hak baca Panit **tidak** | Menyimpang dari pola BR-21, disengaja | Dinyatakan pada Bagian 2 beserta alasannya. Tanpa pernyataan ini, pemeriksaan silang berikutnya akan membacanya sebagai penerapan BR-21 yang keliru |
| P-14 | `posisi_terkini` menyalin `unit_id` dari `penugasan` | Redundansi disengaja | Tanpa salinan, setiap penyaringan lingkup peta menggabung tabel `penugasan` pada setiap kejadian waktu nyata. Nilainya tidak pernah berubah selama SPT hidup, sehingga risiko ketidakcocokan mendekati nol |
| P-15 | Section 12 melarang pelacakan di luar Sesi Tugas | Diperiksa, bersih | `posisi_terkini` dihapus saat sesi ditutup, sehingga tidak ada baris posisi yang bertahan di luar sesi. Tidak melanggar BR-01 maupun BR-13 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-54 sampai BR-67 | Tidak ada tabrakan. Kode tertinggi sebelumnya BR-53, sudah diperiksa terhadap seluruh berkas dan addendum sesuai Addendum 6.2-T Bagian 0.4 |
| Amandemen BR-51, BR-59, BR-62 | Ketiganya amandemen, bukan kode baru. Tidak ada kode yang dipakai ulang |
| Penomoran KP-6.4-01 sampai KP-6.4-72 | Ruang kode 6.4 belum pernah dipakai, tidak ada lompatan |
| Penomoran butir uji U-6.4-01 sampai U-6.4-11 | Tidak beririsan dengan U-6.2, U-6.3, maupun U-I |
| Indeks unik parsial `sesi_tugas` | Tidak dirancang ulang. Dipakai apa adanya dari Addendum 6.2-T Bagian 2 |
| Pengisian otomatis `laporan_harian.sesi_tugas_id` | Tidak terputus. Kolom yang dibaca `fn_isi_sesi_tugas` — `pengguna_id`, `penugasan_id`, `ditutup_pada` — seluruhnya tetap ada pada bentuk final `sesi_tugas` |
| Syarat `for update` Addendum 6.2-T Bagian 8.3 | Dipatuhi dan diperluas, lihat calon addendum butir 1 |
| BR-37 terhadap tabel baru | Tidak berlaku. Keempat tabel baru adalah tabel, bukan tampilan. Modul ini tidak membuat satu pun tampilan |
| BR-45 terhadap `location_logs` | Sudah terpenuhi sejak versi 0.2. Kolom `direkam_pada` sudah ada dan menjadi dasar seluruh penilaian waktu |
| Penyusutan terhadap `laporan_harian.sesi_tugas_id` | Tidak menghasilkan rujukan yatim, karena `sesi_tugas` tidak pernah dihapus |
| `titik_penanda` terhadap penyusutan | Ikut terhapus lewat `on delete cascade`, tidak meninggalkan baris tanpa induk |
| BR-64 terhadap BR-45 | Tidak bertentangan. BR-45 menetapkan **kolom mana** yang dipakai menilai waktu, BR-64 menetapkan **zona waktu mana** yang dipakai membacanya |
| BR-65 terhadap Section 11.1 dan BR-11 | Tidak mencabut bentuk web, hanya membatasi satu kemampuan, dan tombolnya disembunyikan bukan dinonaktifkan |
| BR-67 terhadap Addendum 6.3-T Celah 1 | Tidak bertentangan. Perhitungan jarak laporan ke titik SPT tetap berjalan; yang dilarang adalah **menggeser** koordinatnya |
| Amandemen BR-62 terhadap BR-21 | Tidak mencabut BR-21. Riwayat tetap terbaca selamanya; yang berakhir hanya pemantauan langsung |
| Amandemen BR-59 terhadap BR-58 | Sejalan. Ringkasan Rute tetap permanen, dan titik satuannya kini terjaga selama sesinya berjalan |
| `arah_derajat` terhadap daftar kolom beku | Tidak berlaku. Daftar kolom beku milik `laporan_harian`, dan `location_logs` tertutup bagi pembaruan oleh peran mana pun |

## Yang belum dapat diperiksa

Urutan pemicu pada `penugasan` — pemicu penutup sesi yang lahir dari KP-6.4-28 hidup berdampingan
dengan pemicu Modul 6.2 pada tabel yang sama. Pemeriksaannya menuntut daftar lengkap pemicu
`penugasan` beserta peristiwanya, dan itu pekerjaan Addendum 6.4-T butir 8, bukan berkas ini.

Ini disebutkan terus terang mengikuti catatan penutup Berita Acara: dugaan tidak sama dengan
temuan, dan menuliskan cara memutuskannya lebih baik daripada menebak ke arah mana pun.

---
---

# Bagian 13 — Butir uji Modul 6.4

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-6.4-01 | Pasang ketiga kebijakan Addendum 6.1-T apa adanya pada basis data yang sudah memuat `laporan_harian` bentuk final | Ketiganya gagal. Bila ada yang berhasil, tabelnya dibangun dengan kolom lama |
| U-6.4-02 | Buka sesi, matikan perangkat, jedakan pekerjaan berjadwal, tunggu lewat dua jam, buka sesi baru dari perangkat lain | Berhasil, dan sesi lama tertutup dengan sebab menggantung |
| U-6.4-03 | Kirim laporan pada pukul 05.00 WIB, lalu baca `v_belum_lapor` | Baris pengirim hilang dari daftar belum melapor |
| U-6.4-04 | Sisir seluruh dokumen mencari `::date` tanpa penyebutan zona waktu | Tidak ada satu pun tersisa. Dijalankan sebelum sesi coding dimulai |
| U-6.4-05 | Baca satu baris tiap tabel memakai kunci publik sebagai pengguna yang berhak | Tidak ada tabel yang menjawab kosong padahal barisnya ada. Dijalankan sebelum menyusun satu pun kebijakan akses |
| U-6.4-06 | Berlangganan `posisi_terkini` sebagai Anggota unit lain, lalu tutup sesi milik orang di unit berbeda | Peristiwa penghapusan hanya memuat UUID, tanpa kolom lain |
| U-6.4-07 | Cabut penunjukan Panit saat sesinya berjalan | Rute tetap terbaca, penanda pada peta waktu nyata hilang |
| U-6.4-08 | Buka SiPANTAU dari peramban, cari tombol Mulai Tugas, lalu kirim permintaan pembukaan sesi langsung ke basis data dari sana | Tombol tidak ada, dan permintaan langsungnya ditolak |
| U-6.4-09 | Cabut izin lokasi latar belakang, tekan Mulai Tugas | Ditolak dengan keterangan langkahnya. Aplikasi tidak mati |
| U-6.4-10 | Buka Sesi Tugas, matikan layar satu jam, periksa jumlah Titik | Titik terus bertambah mengikuti ambang yang berlaku |
| U-6.4-11 | Ulangi U-6.4-10 pada perangkat merek yang dikenal agresif menghentikan proses latar belakang | Bila terhenti, panduan penghematan daya muncul dengan sendirinya |

---
---

# Bagian 14 — Riwayat Koreksi

Menggantikan lapisan addendum. Yang disimpan cukup keterangan perubahannya; teks lamanya tidak
diulang, karena bentuk yang berlaku sudah berdiri di tempatnya masing-masing di atas.

| Kode | Yang keliru | Menjadi | Sifat kegagalannya |
| --- | --- | --- | --- |
| P-01 | Tiga kebijakan Addendum 6.1-T menyebut `laporan_harian.anggota_id` | Diganti `pelapor_id`; `location_logs` diperlakukan terpisah | Berisik saat kebijakan dibuat, tetapi penyelesaian tergesanya menimbulkan cacat kedua |
| P-02 | `location_logs.anggota_id` keliru sejak Kanit dan Panit boleh memegang sesi | Diganti `pengguna_id` | Senyap. Sistem jalan dengan nama yang menyesatkan |
| P-03 | Rute tidak dapat dipisah per sesi | Kolom `sesi_tugas_id` ditambahkan | Senyap. Rute berhari-hari menyatu jadi satu garis |
| P-04 | Sesi menggantung mengunci pemiliknya bila penjadwal berhenti | Fungsi pembuka sesi menutup sendiri sesi basi milik pemanggilnya | Senyap sampai seseorang tidak dapat Mulai Tugas tanpa sebab yang jelas |
| P-05 | Titik antrean ditolak setelah ganti perangkat | Kolom `penanda_perangkat_asal` ditambahkan | Senyap. Rute berlubang, dan lubangnya terbaca sebagai tidak bertugas |
| P-06 | Retensi tidak pernah dimulai bila SPT tidak ditutup | Ambang kedua, tiga ratus enam puluh lima hari | Pertumbuhan tabel tanpa batas |
| P-07 | `sesi_tugas` tanpa kolom waktu baku | `dibuat_pada` dan `diubah_pada` ditambahkan | Pelanggaran I.10 |
| P-08 | `sesi_tugas_id` kosong pada laporan di luar sesi | Dinyatakan sebagai keadaan yang sah | Berisiko dibaca modul lain sebagai cacat data |
| P-09 | `sesi_tugas` tanpa penanda perangkat | Kolom ditambahkan | Lapisan penegakan BR-25 bocor lewat pintu yang belum dijaga |
| P-10 | BR-61 tidak dapat ditegakkan lewat hak akses per kolom | Tabel `titik_penanda` terpisah | Batas teknis, bukan kekeliruan |
| P-16 | Perhitungan hari kalender memakai zona waktu bawaan | BR-64, seluruhnya memakai `Asia/Jakarta` | Senyap. Angka salah tiap hari, tanpa satu pun galat |
| P-17 | Tabel baru tidak otomatis terekspos ke Data API | BR-66 dan langkah tersendiri pada urutan pembangunan | Gejalanya menyerupai kesalahan aturan akses, sehingga menyesatkan |
| P-18 | Peristiwa penghapusan Realtime tidak disaring | Dipertahankan, batas kebocorannya dikunci | Batas teknis yang dipahami, bukan kekeliruan |
| P-19 | Sesi Tugas dapat dibuka dari bentuk web | BR-65, hanya dari aplikasi Android terpasang | Senyap. Fitur utama diam-diam tidak berjalan bagi sebagian pemakai |
| P-20 | Arah gerak tidak terekam | Kolom `arah_derajat` ditambahkan | Kekurangan tampilan |
| P-21 | Panit yang dicabut tetap memantau posisi langsung | BR-62 diamandemen, `posisi_terkini` memeriksa `dicabut_pada` | Lingkup data lebih luas dari yang dimaksud |
| P-22 | Penyusutan dapat menghapus titik sesi yang berjalan | BR-59 diamandemen | Tidak terjaga apa pun, meski mustahil dalam praktik |

Tujuh temuan memblokir. Lima berupa kegagalan senyap, dan kelimanya berbeda sifat: nama kolom yang
keliru, aturan yang saling mengunci, angka yang salah tanpa galat, gejala yang menyesatkan yang
memperbaikinya, dan fitur yang diam-diam tidak berjalan bagi sebagian pemakai.

Yang terakhir tidak ditemukan lewat pemeriksaan dokumen. Ia muncul karena pemilik produk
menanyakan hal yang paling mendasar — apakah ini benar-benar berjalan saat layar mati. Itu pola
yang layak dibawa ke modul berikutnya: pemeriksaan dokumen menemukan yang tidak konsisten,
pertanyaan tentang apa yang sebenarnya terjadi di tangan pemakai menemukan yang tidak berjalan.

---

## Yang perlu dikerjakan setelah menempel berkas ini

| Urutan | Langkah |
| --- | --- |
| 1 | Kerjakan Bagian 0 lebih dahulu. P-01, P-16, dan P-17 menyentuh modul yang sudah dinyatakan selesai dan tidak dapat ditunda |
| 2 | Tempelkan Bagian 1 sampai 10 ke tempatnya masing-masing pada PRD |
| 3 | Naikkan versi PRD menjadi 0.6 dan perbarui Riwayat Revisi |
| 4 | Perbarui Checklist Progres: Modul 6.4 selesai, **aturan berikutnya mulai BR-68**, artefak `sesi_tugas` dan `location_logs` dicentang, butir A-17 sampai A-19 ditambahkan |
| 5 | Gali Addendum 6.4-T memakai dua puluh dua butir pada Bagian 11 |
| 6 | Barulah lanjut ke Modul 6.7 sesuai urutan yang sudah ditetapkan |


---
---
