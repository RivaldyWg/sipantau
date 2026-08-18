-- =====================================================================
-- 0011 — Tabel sesi_tugas (kerangka) dan notifikasi (kerangka)
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 3 §5.17 (sesi_tugas),
--         Addendum 6.2-T Bagian 1.4 (notifikasi), Bagian 2.2 (indeks
--         unik satu sesi aktif per orang, BR-27)
--         docs/01-koreksi.md W.1 (tujuh nilai sebab_penutupan, FINAL,
--         dilarang ditambah/dikurangi tanpa revisi tercatat),
--         W.2 (tujuh belas nilai notifikasi.jenis, FINAL)
--
-- CATATAN DESAIN
--
-- 1. Kedua tabel berstatus [KERANGKA] — bentuk akhirnya ditetapkan
--    Modul 6.4 (sesi_tugas) dan Modul 6.9 (notifikasi). Dibentuk di
--    sini karena Modul 6.2 sudah membutuhkannya: penjadwal lewat batas
--    (migrasi 0014) menyisipkan notifikasi, dan BR-27 (satu sesi aktif
--    per orang) perlu indeksnya sejak awal sesuai Addendum 6.2-T
--    Bagian 2.2.
--
-- 2. sebab_penutupan memakai TUJUH nilai final dari koreksi W.1, BUKAN
--    daftar pendek yang mungkin muncul di modul lain. Daftar ini
--    dinyatakan final dan dilarang diubah tanpa revisi PRD tercatat
--    (BR-77) — lihat docs/01-koreksi.md W.1.
--
-- 3. notifikasi.jenis memakai TUJUH BELAS nilai final dari koreksi
--    W.2, sudah termasuk sesi_ditutup_pindah_perangkat yang baru
--    ditambahkan di sana. Modul 6.2 sendiri hanya memakai satu nilai
--    (spt_lewat_batas) tetapi daftar tertutupnya sudah final lintas
--    modul, sehingga ditulis lengkap di sini sesuai BR-77 (jangan
--    menyatakan daftar tertutup sebagian padahal sudah final).
--
-- 4. RLS sesi_tugas SENGAJA belum diberi kebijakan apa pun (deny
--    sebagai bawaan) — "Ditetapkan pada Modul 6.4" per Addendum
--    6.2-T Bagian 7. GRANT tetap diberikan sekarang mengikuti daftar
--    J.2 (select, insert, update), karena J.2 tidak menyatakan
--    grant-nya tertunda, hanya kebijakannya. Baris tidak akan bisa
--    dibaca/ditulis siapa pun sampai Langkah 10 menambah policy.
--
-- 5. RLS notifikasi diberi kebijakan MINIMAL (baca dan tandai-baca
--    milik sendiri) karena polanya sudah jelas dan tidak bergantung
--    pada modul lain — sistem (fungsi security definer) yang menyisip
--    baris, bukan klien. Dapat diperluas saat Modul 6.9 digali bila
--    ternyata kurang.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabel sesi_tugas [KERANGKA]
-- ---------------------------------------------------------------------
create table public.sesi_tugas (
  id                uuid primary key default gen_random_uuid(),
  penugasan_id      uuid not null references public.penugasan (id) on delete restrict,
  pengguna_id       uuid not null references public.users (id) on delete restrict,
  dibuka_pada       timestamptz not null default now(),
  ditutup_pada      timestamptz,
  sebab_penutupan   text
                      check (sebab_penutupan is null or sebab_penutupan in (
                        'manual', 'keluar_aplikasi', 'pindah_perangkat', 'menggantung',
                        'spt_ditutup', 'dicabut_dari_spt', 'akun_dinonaktifkan'
                      )),
  dibuat_pada       timestamptz not null default now(),
  diubah_pada       timestamptz not null default now(),

  constraint chk_sesi_tugas_sebab_wajib_bila_tertutup
    check (ditutup_pada is null or sebab_penutupan is not null)
);

comment on table public.sesi_tugas is
  '[KERANGKA] Bentuk akhir ditetapkan Modul 6.4. Dibentuk di Modul 6.2 karena sudah dibutuhkan (BR-27). docs/20-modul-6.2-penugasan.md §5.17.';
comment on column public.sesi_tugas.sebab_penutupan is
  'Daftar tertutup TUJUH nilai, FINAL per docs/01-koreksi.md W.1. Dilarang ditambah/dikurangi tanpa revisi PRD tercatat (BR-77).';

-- BR-27: satu Sesi Tugas aktif per orang, lintas seluruh SPT.
-- Addendum 6.2-T Bagian 2.2 — penegakan tingkat basis data, bukan
-- pemeriksaan aplikasi, agar dua permintaan bersamaan tidak lolos.
create unique index uq_sesi_tugas_satu_aktif_per_orang
  on public.sesi_tugas (pengguna_id)
  where ditutup_pada is null;

create index idx_sesi_tugas_penugasan
  on public.sesi_tugas (penugasan_id);

alter table public.sesi_tugas enable row level security;
grant select, insert, update on public.sesi_tugas to authenticated;
-- Sengaja tanpa satu pun "create policy" — lihat catatan desain butir
-- 4. Penolakan adalah bawaan sampai Langkah 10 (Modul 6.4).

-- ---------------------------------------------------------------------
-- Tabel notifikasi [KERANGKA]
-- ---------------------------------------------------------------------
create table public.notifikasi (
  id            uuid primary key default gen_random_uuid(),
  penerima_id   uuid not null references public.users (id) on delete restrict,
  jenis         text not null
                  check (jenis in (
                    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
                    'spt_dicabut', 'spt_ditutup',
                    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
                    'laporan_perlu_diperbaiki', 'laporan_disetujui',
                    'sesi_ditutup_keluar_aplikasi', 'sesi_ditutup_pindah_perangkat',
                    'izin_lokasi_terputus', 'sesi_menggantung',
                    'akun_dinonaktifkan', 'kata_sandi_direset'
                  )),
  penugasan_id  uuid references public.penugasan (id) on delete cascade,
  judul         text not null,
  isi           text,
  dibaca_pada   timestamptz,
  dibuat_pada   timestamptz not null default now()
);

comment on table public.notifikasi is
  '[KERANGKA] Bentuk akhir ditetapkan Modul 6.9. Dibentuk di Modul 6.2 untuk penjadwal lewat batas. Addendum 6.2-T Bagian 1.4.';
comment on column public.notifikasi.jenis is
  'Daftar tertutup TUJUH BELAS nilai, FINAL per docs/01-koreksi.md W.2 (BR-68). Dilarang ditambah/dikurangi tanpa revisi PRD tercatat.';

create index idx_notifikasi_penerima_belum_dibaca
  on public.notifikasi (penerima_id, dibuat_pada desc)
  where dibaca_pada is null;

alter table public.notifikasi enable row level security;
grant select, update on public.notifikasi to authenticated;
-- Sengaja tanpa grant insert: penyisipan hanya lewat fungsi security
-- definer (kerja_periksa_lewat_batas, migrasi 0014, dan fungsi modul
-- lain kelak). Klien hanya membaca dan menandai baca miliknya sendiri.

create policy "notifikasi_baca_milik_sendiri"
on public.notifikasi
for select
to authenticated
using (penerima_id = (select auth.uid()));

create policy "notifikasi_tandai_baca_milik_sendiri"
on public.notifikasi
for update
to authenticated
using (penerima_id = (select auth.uid()))
with check (penerima_id = (select auth.uid()));
