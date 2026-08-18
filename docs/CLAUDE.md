# CLAUDE.md — Konteks Proyek SiPANTAU

Berkas ini dibaca setiap awal sesi koding. Isinya **aturan main pembangunan**, bukan spesifikasi produk. Spesifikasi ada di `docs/PRD_SiPANTAU_v0.7_gabungan.md`.

---

## 1. Apa yang sedang dibangun

**SiPANTAU** — Sistem Pengawasan Anggota Terpadu untuk Unit I Subdit IV Ditreskrimsus Polda Jawa Barat. Menggantikan pelaporan lewat pesan singkat dengan sistem terekam: penugasan digital, laporan lapangan berfoto, pelacakan posisi saat bertugas, dan pemantauan pimpinan.

Empat peran: **Kasubdit** (seluruh unit), **Kanit** (unitnya, satu-satunya yang menerbitkan SPT), **Panit** (lingkupnya ditentukan penugasan tempat ia ditunjuk, **bukan** unitnya), **Anggota** (miliknya sendiri). Ditambah **Akun Pemeliharaan**, akun teknis di luar keempatnya.

---

## 2. Dokumen — jangan dibuka semua sekaligus

PRD dipecah tujuh berkas di `docs/`. **Peta lengkapnya ada di `docs/PETA.md`** — buka itu dulu bila ragu berkas mana yang relevan.

### Selalu dibuka, apa pun tugasnya

| Berkas | Isi |
| --- | --- |
| `docs/00-fondasi.md` | Aturan main, peran, glosarium, arsitektur, model data, Business Rules, keamanan |
| `docs/01-koreksi.md` | Tiga berita acara pemeriksaan silang. **Paling mengikat**, menang atas seluruh berkas modul |

### Dibuka sesuai tugas

| Berkas | Untuk |
| --- | --- |
| `docs/10-modul-6.1-auth.md` | Auth, peran, perangkat, `sipantau_auth`, Fungsi Tepi |
| `docs/20-modul-6.2-penugasan.md` | SPT, pelaksana, Panit, pg_cron |
| `docs/30-modul-6.3-pelaporan.md` | Laporan, foto, catatan, Antrean Luring, riwayat versi, ekspor |
| `docs/40-modul-6.4-gps.md` | Sesi Tugas, koordinat, peta |
| `docs/60-modul-6.6-6.9-user-notif.md` | Manajemen akun, pemberitahuan |

### Acuan tampilan

`docs/si-pantau-prototype.html` — dibuka setiap kali menyentuh antarmuka. **Ini acuan visual, bukan sekadar contoh.**

### Aturan membaca

- Urutan kekuatan bila ada pertentangan: **koreksi menang atas modul, modul menang atas fondasi**
- Di dalam `01-koreksi.md`: **W menang atas J, J menang atas I**
- Section 6.1 sampai 6.4, 6.6, dan 6.9 di `00-fondasi.md` berstatus kerangka dan **sudah digantikan** berkas modulnya. Jangan dipakai
- Buka berkas modul **yang sedang dikerjakan saja**. Membuka semuanya membuang ruang dan tidak menambah ketepatan

## 3. Tumpukan teknologi — terkunci

| Lapisan | Teknologi |
| --- | --- |
| Antarmuka | Next.js (App Router) + TypeScript + Tailwind CSS |
| Komponen | Shadcn UI, dengan syarat pada §7 |
| Backend | Supabase — PostgreSQL, Auth, Storage, Realtime |
| Ekstensi wajib | PostGIS, pg_cron |
| Peta | Leaflet + OpenStreetMap |
| Pembungkus | Capacitor (Android), PWA |
| Penempatan | Vercel + Supabase Cloud |

Dilarang menambah pustaka besar tanpa alasan yang ditulis. Yang **dilarang keras**: Redux, ORM apa pun (Prisma, Drizzle), pustaka komponen selain Shadcn.

---

## 4. Struktur folder

```
/app
  /(auth)/masuk                 halaman masuk
  /(app)                        seluruh halaman setelah masuk
    /beranda                    dashboard, isi berbeda per peran
    /penugasan                  daftar dan rincian SPT
    /laporan                    daftar, formulir, rincian laporan
    /peta                       peta waktu nyata
    /personel                   status personel
    /akun                       manajemen user, khusus Kasubdit
    /pemberitahuan
  /api                          hanya bila benar-benar perlu
/components
  /ui                           komponen Shadcn, jangan diedit langsung
  /sipantau                     komponen milik proyek ini
/lib
  /supabase                     klien server, klien browser, tipe
  /auth                         pembacaan peran, penjaga halaman
  /hooks                        hook bersama
  /utils
/stores                         Zustand, lihat §6
/supabase
  /migrations                   SQL berurutan, satu berkas satu langkah
  /functions                    Fungsi Tepi
  /tests                        uji RLS, lihat §9
  /seed                         data contoh
/docs                           PRD dan prototype
```

Satu modul PRD tidak harus jadi satu folder. Yang penting: **kode satu modul tidak berserak di banyak tempat**.

---

## 5. Aturan basis data

Ini yang paling banyak menghasilkan kegagalan senyap pada pemeriksaan PRD. Ikuti persis.

### 5.1 Setiap tabel dan tampilan wajib punya hak akses, ditulis di berkas migrasi yang sama

```sql
create table public.contoh (...);
alter table public.contoh enable row level security;
grant select, insert, update on public.contoh to authenticated;
-- lalu kebijakan RLS-nya
```

Peran `anon` **tidak pernah** diberi hak apa pun. Sistem ini tidak punya jalur tanpa masuk.

Tidak ada `delete` pada tabel mana pun. Seluruh penghapusan lewat fungsi `security definer` yang memeriksa syaratnya sendiri.

### 5.2 Setiap tampilan wajib menyatakan `security_invoker`

```sql
create view public.contoh_tampil
with (security_invoker = on)   -- WAJIB DITULIS
as select ...;
```

Bawaan PostgreSQL adalah **mati**, yang berarti tampilan melewati seluruh RLS diam-diam. Ini sudah dua kali terjadi pada PRD. Satu-satunya pengecualian adalah `rekap_laporan_tim`, dan ia wajib menyaring dirinya sendiri dengan `auth.uid()`.

### 5.3 Setiap fungsi `security definer` wajib mengunci `search_path`

```sql
create function public.contoh()
returns void
language plpgsql
security definer
set search_path = ''        -- WAJIB
as $$ ... $$;
```

Dengan `search_path` kosong, seluruh nama tabel wajib ditulis lengkap: `public.penugasan`, bukan `penugasan`.

### 5.4 Penamaan

| Jenis | Awalan | Contoh |
| --- | --- | --- |
| Pemicu | `trg_` | `trg_kunci_laporan` |
| Fungsi pemicu | `fn_` | `fn_kunci_laporan` |
| Pekerjaan berjadwal | `kerja_` | `kerja_periksa_lewat_batas` |

**Urutan jalannya pemicu ditentukan abjad nama.** Ini bukan soal kerapian — penamaan yang tidak seragam mengubah urutan tanpa terlihat.

Nama kolom waktu baku: `dibuat_pada`, `diubah_pada`.

### 5.5 Zona waktu

Setiap perhitungan hari kalender **wajib** memakai `Asia/Jakarta`:

```sql
(now() at time zone 'Asia/Jakarta')::date     -- BENAR
current_date                                   -- SALAH
```

Server berjalan UTC. Selisihnya tujuh jam, dan akibatnya angka meleset satu hari **setiap hari** tanpa satu pun galat.

### 5.6 Migrasi berurutan

Satu berkas satu langkah, dinomori. Jangan menggabung pembuatan tabel dengan pemicu dan kebijakan dalam satu berkas raksasa — kalau gagal di tengah, sulit diulang.

---

## 6. Aturan frontend — pengambilan dan pengelolaan data

### 6.1 Tiga jalur, jangan dicampur

| Jalur | Untuk apa | Contoh |
| --- | --- | --- |
| **Server Component** | Data yang tidak berubah saat halaman terbuka | Daftar SPT, rincian penugasan, riwayat laporan, daftar akun |
| **Client Component + Realtime** | Data yang wajib berubah tanpa muat ulang | Peta posisi, penghitung lonceng, status personel, status Sesi Tugas |
| **Server Action** | Seluruh penulisan data | Kirim laporan, terbitkan SPT, tandai dibaca |

**Server Component tidak dapat berlangganan Realtime.** Kalau sebuah data perlu diperbarui hidup, ia wajib Client Component. Jangan mencoba menyiasatinya dengan pemuatan ulang berkala.

### 6.2 Zustand — sempit saja

Zustand **hanya** untuk keadaan yang benar-benar lintas halaman dan tidak berasal dari server:

- Peran dan unit pengguna yang sedang masuk
- Status Sesi Tugas sedang berjalan atau tidak
- Antrean luring yang belum terkirim
- Keadaan tampilan: bilah samping terbuka, penyaring aktif

**Dilarang menyimpan data server di Zustand.** Daftar SPT, isi laporan, daftar akun — semuanya diambil ulang, tidak disimpan. Ini kesalahan yang paling sering terjadi, dan akibatnya data basi tanpa ada yang tahu.

### 6.3 Yang dilarang

- Redux, MobX, Recoil
- `useEffect` untuk mengambil data — pakai Server Component atau Server Action
- Menyimpan hasil kueri di `useState` lalu dipakai lintas komponen
- Memanggil Supabase langsung dari komponen tampilan; lewat `lib/supabase` saja

---

## 7. Aturan tampilan

### 7.1 Prototype adalah acuan, Shadcn adalah pelengkap

`docs/si-pantau-prototype.html` sudah memuat palet, bentuk kartu, lencana status, bilah samping, dan tata letak dashboard tiga peran. **Itu yang diikuti.**

Shadcn dipakai **hanya** untuk komponen yang rumit dan belum ada di prototype:

| Pakai Shadcn | Ikuti prototype |
| --- | --- |
| Dialog, Sheet, Popover | Kartu, lencana status, lencana prioritas |
| Dropdown, Command, Combobox | Bilah samping, bilah bawah |
| Calendar, DatePicker | Tabel biasa, kartu statistik |
| Toast, Tooltip | Tombol, formulir sederhana |
| Table dengan pengurutan | Umpan aktivitas, keadaan kosong |

Bila ragu: kalau bentuknya sudah ada di prototype, ikuti prototype.

### 7.2 Warna — override tokens Shadcn sejak awal

Sebelum menambah komponen Shadcn pertama, ganti tokens-nya dengan palet prototype:

```
--navy      #0F1C32     bilah samping, teks utama
--primary   #1B2A4A     tombol utama
--gold      #F5A623     aksen, penanda aktif
--bg        #F4F6F9     latar halaman
--blue      #2563EB     status Baru
--amber     #D97706     status Berjalan
--green     #059669     status Selesai
--red       #DC2626     status Bermasalah
```

Kalau tokens tidak diganti, Shadcn akan memakai palet bawaannya dan hasilnya bertabrakan dengan prototype.

### 7.3 Yang mengikat dari PRD

- **Menu dan tombol di luar kewenangan tidak ditampilkan**, bukan ditampilkan dalam keadaan nonaktif (BR-11)
- **Prinsip Non-Menghakimi.** Tulis "Terakhir terlihat 40 menit lalu", bukan "Anggota tidak melaksanakan tugas". Sistem menyajikan fakta, manusia menilai
- Keadaan memuat memakai kerangka abu-abu berkedip, bukan pemutar berputar
- Seluruh antarmuka Bahasa Indonesia
- Halaman yang dipakai Anggota diutamakan untuk layar telepon
- Kontras cukup untuk dibaca di bawah matahari

---

## 8. Fungsi Tepi — daftar tertutup

Hanya empat, dan tidak boleh bertambah tanpa revisi PRD tercatat:

`reset-kata-sandi` · `buat-akun` · `nonaktifkan-akun` · `ekspor-unit`

Fungsi Tepi **hanya** untuk operasi yang mensyaratkan kunci istimewa. Dilarang dipakai sebagai tempat memindahkan logika yang seharusnya di RLS. Setiap Fungsi Tepi wajib memeriksa sendiri kewenangan pemanggilnya dari basis data, tidak percaya isi permintaan.

---

## 9. Uji keamanan — wajib, bukan pilihan

Sistem ini **tidak punya server aplikasi**. Seluruh penegakan hak akses bergantung pada RLS. Kalau satu kebijakan salah, tidak ada lapisan kedua yang menangkap — data perkara langsung terbuka.

**Aturan:** setiap kali menulis kebijakan RLS baru, tambahkan pengujiannya ke `supabase/tests/rls.sql` pada sesi yang sama. Jangan ditunda.

Bentuknya SQL biasa, tanpa framework:

```sql
-- Berpura-pura menjadi seorang Anggota
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid-anggota>"}';

-- Mencoba membaca SPT unit lain — wajib nol baris
select count(*) = 0 as lulus_baca_spt_unit_lain
  from public.penugasan where unit_id = '<uuid-unit-lain>';
```

Yang **wajib** diuji untuk tiap tabel:
1. Peran yang berhak dapat membaca miliknya
2. Peran yang tidak berhak **tidak** dapat membaca milik orang lain
3. Peran yang tidak berhak **tidak** dapat menulis
4. Tampilan tidak membocorkan lintas unit

Butir uji sudah tersebar di PRD dengan kode `U-`. Kumpulkan ke berkas itu sambil membangun.

---

## 10. Urutan pembangunan

Berurutan, tiap langkah bersandar pada yang sebelumnya.

| No | Langkah | Selesai bila |
| --- | --- | --- |
| 1 | Project Supabase, aktifkan PostGIS dan pg_cron, buat wadah `dokumentasi` | Ekstensi aktif, wadah ada |
| 2 | Tabel `unit` dan `users` beserta RLS dan fungsi bantu `sipantau_auth` | Empat akun contoh dapat masuk |
| 3 | Auth: halaman masuk, penjaga halaman per peran, ganti kata sandi pertama | Tiap peran melihat menu berbeda |
| 4 | **Bangun APK kosong dan pasang di HP** | Terpasang dan terbuka. Jangan tunda ke akhir |
| 5 | Tabel penugasan beserta anak, RLS, pemicu, batasan | Kanit dapat menerbitkan SPT |
| 6 | Halaman penugasan: daftar, formulir terbitkan, rincian | Sesuai prototype |
| 7 | Tabel laporan, catatan, foto beserta RLS dan pemicu | Anggota dapat mengirim laporan berfoto |
| 8 | Halaman laporan dan peninjauan | Panit dapat memberi catatan |
| 9 | Dashboard tiap peran | Isi berbeda sesuai lingkup |
| 10 | GPS: Sesi Tugas, `location_logs`, `posisi_terkini`, peta | Titik masuk, peta hidup |
| 11 | Pelacakan latar belakang, uji di HP fisik berbagai merek | Titik tetap masuk saat layar terkunci |
| 12 | Pemberitahuan dan lonceng | — |
| 13 | pg_cron dan pekerjaan berjadwal | Terlihat di `cron.job_run_details` |

**Ditunda ke tahap berikutnya:** kolase berkop, LHP ringkas, ekspor data, riwayat versi, antrean luring, pemberitahuan dorong.

Langkah 4 sengaja diletakkan lebih awal. Kalau Capacitor bermasalah, lebih baik ketahuan di hari ketiga daripada hari kesebelas.

---

## 11. Kesalahan yang sudah terbukti terjadi

Pemeriksaan silang PRD menemukan 27 titik, sepuluh memblokir, dan hampir seluruhnya **kegagalan senyap** — tidak menimbulkan pesan galat apa pun. Ini yang paling sering:

| Kesalahan | Akibat |
| --- | --- |
| Tampilan lupa menyatakan `security_invoker` | Melewati seluruh RLS. Tidak ada galat |
| Fungsi lupa `security definer` | Gagal hanya ketika dipanggil peran tertentu |
| `current_date` tanpa zona waktu | Angka meleset satu hari, setiap hari |
| Menganggap kolom atau nilai enum sebagai baru padahal sudah ada | Daftar tertutup terganti versi lebih pendek, nilai lain lenyap |
| Aturan diterapkan di satu tempat, tempat lain yang melanggar terlewat | Sebagian sistem patuh, sebagian tidak |
| Nama pemicu tidak berawalan `trg_` | Urutan jalannya berubah tanpa terlihat |
| Menaruh data server di Zustand | Data basi tanpa ada yang tahu |

**Sebelum menyatakan sesuatu baru** — kolom, nilai enum, tabel, daftar tertutup — telusuri dulu apakah sudah ada. Ini sudah tiga kali terjadi (BR-77).

---

## 12. Cara bekerja di sesi ini

- **Satu modul dalam satu waktu.** Jangan mengerjakan beberapa modul sekaligus
- **Jangan mengubah modul yang sudah selesai** tanpa diminta
- Kalau menemukan pertentangan di PRD, **laporkan, jangan tebak** mana yang benar
- Kalau sebuah aturan tidak jelas cara menegakkannya, **katakan**, jangan diisi perkiraan
- Setelah menulis kebijakan RLS, **langsung tambahkan pengujiannya**
- Setelah menulis tampilan, **periksa `security_invoker` sudah ditulis**
- Sebelum menulis `current_date`, **periksa apakah ia perhitungan hari kalender**
