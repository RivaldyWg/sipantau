# PETA.md — Berkas mana yang dibuka untuk tugas apa

Dokumen dipecah tujuh berkas agar tiap sesi koding hanya membuka yang perlu. Jangan pernah membuka seluruhnya sekaligus.

---

## Dua berkas yang selalu dibuka

| Berkas | Isi |
| --- | --- |
| `docs/00-fondasi.md` | Aturan main, peran, glosarium, arsitektur, model data, Business Rules, keamanan |
| `docs/01-koreksi.md` | Tiga berita acara. **Paling mengikat.** Menang atas seluruh berkas modul |

Keduanya wajib ada di setiap sesi, apa pun yang dikerjakan.

---

## Berkas modul — buka yang sedang dikerjakan saja

| Berkas | Isi | Ukuran |
| --- | --- | --- |
| `docs/10-modul-6.1-auth.md` | Autentikasi, peran, perangkat, Akun Pemeliharaan, `sipantau_auth` | 77 KB |
| `docs/20-modul-6.2-penugasan.md` | SPT, pelaksana, Panit, pg_cron | 96 KB |
| `docs/30-modul-6.3-pelaporan.md` | Laporan harian, foto, catatan, Antrean Luring, riwayat versi, ekspor | 94 KB |
| `docs/40-modul-6.4-gps.md` | Sesi Tugas, titik koordinat, peta, posisi terkini | 101 KB |
| `docs/60-modul-6.6-6.9-user-notif.md` | Manajemen akun, pemberitahuan | 61 KB |

---

## Peta tugas ke berkas

Cari tugas yang sedang dikerjakan, buka berkas yang tertulis di sebelahnya.

### Basis data

| Yang dikerjakan | Buka |
| --- | --- |
| Tabel `unit`, `users`, `perangkat_masuk`, `jejak_audit` | fondasi + koreksi + **6.1** |
| Tabel `penugasan` beserta anaknya | fondasi + koreksi + **6.2** |
| Tabel `laporan_harian`, `catatan_laporan`, `foto_dokumentasi` | fondasi + koreksi + **6.3** |
| Tabel `laporan_versi`, `catatan_versi`, `pembatasan_laju` | fondasi + koreksi + **6.3** |
| Tabel `sesi_tugas`, `location_logs`, `posisi_terkini`, `titik_penanda` | fondasi + koreksi + **6.4** |
| Tabel `notifikasi`, `langganan_dorong` | fondasi + koreksi + **6.6/6.9** |
| Fungsi `sipantau_auth` | fondasi + koreksi + **6.1** |
| Pekerjaan berjadwal pg_cron | fondasi + koreksi + **6.2** |
| Kebijakan RLS tabel mana pun | fondasi + koreksi + berkas modul pemilik tabelnya |

### Halaman dan komponen

| Yang dikerjakan | Buka |
| --- | --- |
| Halaman masuk, ganti kata sandi | fondasi + koreksi + **6.1** |
| Daftar dan rincian SPT, formulir terbitkan | fondasi + koreksi + **6.2** |
| Formulir laporan, unggah foto, peninjauan | fondasi + koreksi + **6.3** |
| Tombol Mulai Tugas, peta waktu nyata | fondasi + koreksi + **6.4** |
| Manajemen akun, lonceng, daftar pemberitahuan | fondasi + koreksi + **6.6/6.9** |
| Dashboard | fondasi + koreksi + **seluruh modul** yang datanya ditampilkan |

### Lintas modul

| Yang dikerjakan | Buka |
| --- | --- |
| Antrean Luring | fondasi + koreksi + **6.3** |
| Fungsi Tepi | fondasi + koreksi + **6.1** (tiga) dan **6.3** (ekspor) |
| Uji RLS | fondasi + koreksi + berkas modul tabel yang diuji |
| Zona waktu, hak akses, `security_invoker` | **koreksi** saja |

---

## Bila ragu berkas mana

Cari nama tabelnya di tabel peta di atas. Kalau tidak ketemu, buka `00-fondasi.md` Section 5 — seluruh tabel terdaftar di sana beserta modul pemiliknya.

**Jangan menebak.** Membuka berkas yang salah menghasilkan rancangan yang menabrak keputusan yang sudah ada, dan itu sudah tiga kali terjadi saat penyusunan PRD.

---

## Yang belum ada

Tiga modul belum digali dan belum punya berkas:

| Modul | Keterangan |
| --- | --- |
| 6.5 Dashboard | Sebagian besar sudah ada di prototype. Bangun merujuk modul lain |
| 6.7 Foto & Kolase | Tahap berikutnya |
| 6.8 LHP Ringkas | Tahap berikutnya. Tertahan butir A-02 |

Satu berkas lagi belum dibuat: **Pemasangan Pemberitahuan** — tujuh belas titik pemanggilan `buat_notifikasi` yang tersebar di Modul 6.2, 6.3, 6.4, dan 6.6. Dikerjakan setelah seluruh modul selesai.
