# Catatan Kemajuan — Langkah 6 (Halaman Penugasan)

Ditulis 19 Agustus 2026. **Tambahan** untuk `catatan-kemajuan.md` yang
sudah ada di dokumen Project — bukan penggantinya. Sesi ini bekerja
dari `sipantau.zip` yang diunggah pengguna, bukan melanjutkan ruang
kerja sesi lama (sandbox sesi lama sudah hilang).

## Status: SELESAI

Kriteria `docs/CLAUDE.md` §10 baris 6 ("Halaman penugasan: daftar,
formulir terbitkan, rincian — Sesuai prototype") sudah terpenuhi.
`next build` lulus, `eslint` bersih.

## Berkas yang lahir / berubah

| Berkas | Keadaan |
| --- | --- |
| `lib/supabase/types.ts` | **Ditambah** — tipe `PenugasanRow`, `PenugasanTampilRow`, dan empat tabel anak. Sebelumnya hanya `PenggunaRow`. |
| `lib/penugasan/label.ts` | **Baru** — peristilahan, kelas lencana, format tanggal/koordinat. |
| `components/sipantau/lencana-penugasan.tsx` | **Baru** — `LencanaStatus`, `LencanaPrioritas`, `PenandaLewatBatas`. |
| `app/(app)/penugasan/page.tsx` | **Ditulis ulang** dari placeholder — daftar SPT + cari + saring. |
| `app/(app)/penugasan/[id]/page.tsx` | **Baru** — rincian SPT. |
| `app/(app)/penugasan/terbitkan/page.tsx` | **Ditulis ulang** dari placeholder — pemuat data + penjaga peran. |
| `app/(app)/penugasan/terbitkan/formulir.tsx` | **Baru** — Client Component formulir. |
| `app/(app)/penugasan/terbitkan/aksi.ts` | **Baru** — Server Action penerbitan. |
| `lib/auth/menu.ts` | **Diperbaiki** — celah penjaga rute, lihat di bawah. |

Tidak ada migrasi baru. Skema Langkah 5 dipakai apa adanya.

## Keputusan bentuk yang diambil bersama pengguna

1. **Rincian SPT jadi rute sendiri `/penugasan/[id]`**, bukan state di
   halaman daftar seperti mockup. Alasan: tautan bisa dibagikan,
   tahan muat ulang, tombol Back peramban benar. Mockup tetap jadi
   acuan BENTUK, bukan acuan arsitektur rute.

2. **Tailwind utility inline**, bukan kelas `sp-*` baru di
   `globals.css`. Mengikuti pola `app/(app)/akun/page.tsx`. Artinya
   halaman Penugasan **lebih sederhana secara visual** daripada
   mockup (tidak ada bilah kemajuan laporan, tumpukan avatar, kartu
   sesi). Kalau kelak diputuskan memporting bentuk mockup sepenuhnya,
   inilah tempat pekerjaan itu — bukan pekerjaan yang terlewat.

## Celah keamanan yang ditemukan dan ditutup (BARU, bukan dari daftar lama)

`bolehAksesRute()` di `lib/auth/menu.ts` meloloskan
`/penugasan/terbitkan` untuk **semua** peran, karena butir menu
"Daftar SPT" memakai `cocokAwalan: true` pada `/penugasan` dan awalan
itu ikut mencocokkan seluruh sub-rutenya.

- **Dampak nyata:** Anggota/Panit/Kasubdit bisa **membuka formulir**
  Terbitkan SPT lewat tautan langsung. RLS tetap menolak insert-nya
  (`penugasan_tulis_oleh_kanit_unit` mensyaratkan `peran = 'kanit'`),
  jadi **bukan kebocoran data dan bukan penulisan tak sah** — tetapi
  melanggar KP-6.1-17 yang mensyaratkan tautan langsung ikut dijaga.
- **Perbaikan:** ditambahkan daftar `RUTE_KHUSUS_PERAN` yang diperiksa
  **sebelum** pencocokan awalan biasa. Sudah diuji sembilan kasus,
  semua lulus.
- **Untuk sesi berikutnya:** setiap kali menambah sub-rute di bawah
  butir menu ber-`cocokAwalan` yang tidak dimiliki semua peran,
  **daftarkan di `RUTE_KHUSUS_PERAN`**. Kandidat berikutnya yang
  mungkin kena pola sama: sub-rute di bawah `/laporan` pada Langkah 8.

## Hal yang perlu diketahui sebelum Langkah 7

- **Alur penerbitan sengaja dua tahap: simpan draf → terbitkan.**
  Tabel `penugasan` lahir `status = 'draf'`, tabel anak disisipkan,
  baru `status` dinaikkan ke `'baru'` — pemicu
  `trg_periksa_syarat_terbit` hanya menyalak pada perpindahan itu.
  Rangkaian ini **bukan satu transaksi**; kalau penerbitan ditolak
  karena syarat kurang, **draf beserta anaknya sengaja dibiarkan
  hidup** dan id-nya dikembalikan ke halaman. Itu perilaku yang
  diniatkan, bukan kebocoran data setengah jadi.

- **Syarat terbit tidak diduplikasi sebagai penghalang keras di
  klien.** Formulir hanya menampilkan peringatan lunak berwarna
  kuning; tombol tetap bisa ditekan dan pesan `SYARAT_TERBIT_KURANG`
  dari pemicu diterjemahkan ke kalimat Indonesia. Ini disengaja
  (BR-77 — satu sumber kebenaran). Jangan "rapikan" dengan
  memblokir tombol berdasarkan pemeriksaan klien.

- **Menyunting SPT yang sudah ada BELUM dibangun.** Yang ada baru
  membuat baru. Menyunting draf, menutup penugasan (KP-6.2-50),
  membatalkan, dan mencabut pelaksana masih kosong — halaman rincian
  menyebutkannya sebagai "menyusul". Ini pekerjaan Langkah 7-8.

- **Bagian "Rekam kegiatan" pada mockup `HAL.rincian()` sengaja belum
  ada** di halaman rincian: isinya laporan harian Modul 6.3 yang
  tabelnya baru lahir Langkah 7.

- **Pencarian belum menjangkau nama lokasi.** Placeholder mockup
  menyebut "Cari nomor, objek, atau lokasi", tetapi lokasi ada di
  tabel anak. Sekarang yang dicari: `nomor_spt`, `judul`, `objek`,
  `sasaran`. Menambah lokasi butuh kueri kedua atau fungsi
  pencarian di database — ditunda sampai ada kebutuhan nyata.

- **Belum ada halaman bernomor (pagination).** Daftar SPT memulangkan
  seluruh baris yang lolos RLS. Aman untuk volume awal Subdit IV,
  tetapi harus ditinjau sebelum data setahun menumpuk.

## Keterbatasan verifikasi sesi ini (sama seperti sesi-sesi sebelumnya)

Domain `*.supabase.co` diblokir sandbox, jadi **tidak ada satu pun
kueri yang benar-benar dijalankan terhadap Supabase asli**. Yang sudah
dibuktikan hanyalah: proyek ter-compile, TypeScript lulus, ESLint
bersih, dan logika penjaga rute lulus uji unit terpisah.

**Belum terbukti dan wajib diuji pengguna di Vercel:**
1. Kanit menerbitkan SPT lengkap → berhasil, status jadi `baru`.
2. Kanit menerbitkan SPT tidak lengkap → tertahan sebagai draf,
   pesan menyebut apa yang kurang.
3. Anggota membuka `/penugasan` → hanya melihat SPT yang dia
   laksanakan.
4. Anggota membuka `/penugasan/terbitkan` lewat bilah alamat →
   dipentalkan ke `/penugasan`.
5. Anggota membuka `/penugasan/<id milik unit lain>` → halaman 404.
