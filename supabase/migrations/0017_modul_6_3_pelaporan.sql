-- =====================================================================
-- 0017 — Modul 6.3: Pelaporan Kegiatan Harian & Foto (Bagian A)
--
-- Sumber utama: docs/30-modul-6.3-pelaporan.md
--   - Bagian 3 (pengganti Section 6.3, [FINAL])
--   - Addendum 6.3-T (sepuluh celah teknis, [FINAL])
--   - Addendum 6.3-K (Antrean Luring, laporan_versi, Ekspor Data)
--   - docs/01-koreksi.md I.2 (v_belum_lapor: security_invoker=on,
--     bukan off; direkam_pada bukan dikirim_pada), I.13/I.14 (kolom
--     antrean ditulis langsung di create table), I.3 (fn_minta_perbaikan
--     dkk butuh security definer)
--
-- File ini dipecah jadi beberapa bagian bertanda "-- ### BAGIAN" murni
-- untuk memudahkan pembacaan; tetap satu migrasi, dijalankan berurutan.
--
-- CATATAN DESAIN PALING PENTING SEBELUM MEMBACA SISANYA
--
-- 1. Koreksi 01-koreksi.md WAJIB diikuti, bukan Addendum 6.3-T asli,
--    setiap kali keduanya bertentangan (Section 0.3 PRD: dokumen
--    koreksi menang atas dokumen yang dikoreksinya). Tiga koreksi yang
--    memengaruhi migrasi ini:
--      a. penugasan.ditutup_pada TIDAK ditambahkan sebagai kolom baru
--         di sini — ia SUDAH ADA sejak migrasi 0008 (Langkah 6).
--         Setiap pemeriksaan "SPT sudah tertutup" memakai
--         coalesce(p.ditutup_pada, p.dibatalkan_pada), bukan
--         p.ditutup_pada saja, supaya jalur pembatalan ikut terdeteksi.
--      b. v_belum_lapor memakai security_invoker = ON (bukan OFF
--         seperti draf awal Addendum 6.3-T Celah 7), dan menyaring
--         berdasar direkam_pada, bukan dikirim_pada.
--      c. Kolom antrean (antrean_id, direkam_pada, diterima_terlambat,
--         penanda_perangkat_asal) ditulis LANGSUNG di dalam
--         create table, bukan ALTER TABLE menyusul.
--
-- 2. Rekursi RLS. Migrasi 0010 (Langkah 6) sudah pernah menemukan dan
--    menutup rekursi tak berhingga pada kebijakan penugasan <->
--    penugasan_pelaksana dengan menyediakan fungsi security definer
--    (sipantau_auth.penugasan_yang_saya_laksanakan/awasi). Pola yang
--    sama WAJIB dipakai di sini: kebijakan laporan_harian akan dibaca
--    balik oleh kebijakan catatan_laporan dan sebaliknya. Fungsi bantu
--    baru disediakan di Bagian D untuk memutusnya sebelum menulis
--    kebijakan mana pun.
--
-- 3. Klien tidak pernah dipercaya untuk fakta pembuktian (prinsip
--    Addendum 6.3-T). Koordinat mentah boleh dikirim klien;
--    kesimpulannya (jarak, status_lokasi, titik terdekat, sesi_tugas_id,
--    diterima_terlambat) SELALU dihitung ulang server dan menimpa
--    kiriman klien. Kolom-kolom itu juga dibekukan setelah INSERT
--    lewat pemeriksaan eksplisit di trg_kunci_kolom_beku (Bagian D),
--    bukan sekadar didokumentasikan sebagai "seharusnya tidak diubah".
--
-- 4. foto_dokumentasi dibangun MINIMAL di migrasi ini. PRD menandai
--    tabel ini [KERANGKA] — difinalkan Modul 6.7. Kolom yang sudah
--    pasti final menurut BR-42 (lat, lng, akurasi_meter, diambil_pada,
--    milik tiap FOTO sendiri, tidak pernah mewarisi dari laporan
--    induk) dibangun sekarang. Kolom lain yang disebut PRD
--    (tanda_air_*, sumber kamera/galeri) BELUM final formatnya —
--    lihat catatan di Bagian C.
-- =====================================================================


-- ### BAGIAN A — Ekstensi dan tabel laporan_harian

create extension if not exists postgis;

comment on extension postgis is
  'Wajib aktif sebelum laporan_harian dibuat — dipakai trg_hitung_lokasi (Bagian D) untuk ST_Distance. docs/30-modul-6.3-pelaporan.md Addendum A.5.';

-- §5.20, KP-6.3-50/54 — dipindah ke sini (bukan menunggu Bagian H)
-- karena v_belum_lapor (Bagian G) membaca kolom ini. Ditemukan lewat
-- percobaan sungguhan: migrasi gagal di Bagian G saat kolom ini masih
-- ditempatkan setelah view-nya.
alter table public.penugasan
  add column if not exists wajib_lapor_harian boolean not null default true;

comment on column public.penugasan.wajib_lapor_harian is
  '§5.20, KP-6.3-50/54. Bawaan true, dimatikan Kanit per SPT. Saat false, penanda Belum Melapor tidak pernah muncul untuk SPT ini (dijamin oleh klausa p.wajib_lapor_harian=true pada v_belum_lapor, Bagian G).';

create table public.laporan_harian (
  id                     uuid primary key default gen_random_uuid(),
  penugasan_id           uuid not null references public.penugasan (id) on delete restrict,
  pelapor_id             uuid not null references public.users (id) on delete restrict,

  -- Diisi otomatis server, boleh kosong (Celah 3 / KP-6.3-05, 06).
  sesi_tugas_id          uuid references public.sesi_tugas (id) on delete set null,

  jenis                  text not null
                           check (jenis in ('pulbaket_awal', 'perkembangan', 'akhir')),
  uraian                 text not null check (length(trim(uraian)) > 0),
  kendala                text,
  status_kegiatan        text not null
                           check (status_kegiatan in ('berjalan', 'selesai', 'bermasalah')),

  -- --- Kolom lokasi, seluruhnya BEKU setelah INSERT (Celah 1, Celah 4) ---
  lokasi_lat             numeric,
  lokasi_lng             numeric,
  akurasi_meter          numeric,
  status_lokasi          text
                           check (status_lokasi in
                             ('terverifikasi', 'di_luar_titik', 'tidak_terekam')),
  lokasi_id              uuid references public.penugasan_lokasi (id) on delete set null,
  lokasi_id_terdekat     uuid references public.penugasan_lokasi (id) on delete set null,
  jarak_meter            numeric,
  alasan_lokasi          text
                           check (alasan_lokasi is null or alasan_lokasi in (
                             'gps_tidak_tertangkap', 'daya_habis', 'izin_lokasi_mati',
                             'area_terbatas', 'disusun_setelah_pulang', 'perangkat_rusak',
                             'lainnya'
                           )),
  alasan_lokasi_lainnya  text,
  -- Opsional bahkan saat di_luar_titik — TIDAK PERNAH diwajibkan
  -- (beda perlakuan dari alasan_lokasi yang wajib saat tidak_terekam).
  keterangan_lokasi      text,

  -- --- Status dan persetujuan ---
  status_laporan         text not null default 'terkirim'
                           check (status_laporan in
                             ('terkirim', 'perlu_diperbaiki', 'disetujui', 'ditarik')),
  disetujui_oleh         uuid references public.users (id) on delete restrict,
  disetujui_pada         timestamptz,
  ditarik_pada           timestamptz,
  alasan_penarikan       text,

  -- --- Riwayat penyuntingan (ringkas; isi lengkap di laporan_versi, Bagian G) ---
  disunting_pada         timestamptz,
  jumlah_suntingan       integer not null default 0,

  -- --- Antrean Luring — BR-45 s/d BR-48, koreksi I.13/I.14: ditulis
  --     langsung di sini, bukan ALTER TABLE menyusul ---
  antrean_id             uuid not null,
  direkam_pada           timestamptz not null,
  diterima_terlambat     boolean not null default false,
  penanda_perangkat      text not null,
  penanda_perangkat_asal text,

  dikirim_pada           timestamptz not null default now(),

  constraint chk_laporan_alasan_lokasi_wajib_bila_tidak_terekam
    check (
      (status_lokasi = 'tidak_terekam' and alasan_lokasi is not null)
      or (status_lokasi is distinct from 'tidak_terekam' and alasan_lokasi is null)
    ),
  constraint chk_laporan_alasan_lainnya_wajib
    check (
      (alasan_lokasi = 'lainnya' and alasan_lokasi_lainnya is not null
        and length(trim(alasan_lokasi_lainnya)) > 0)
      or (alasan_lokasi is distinct from 'lainnya')
    ),
  constraint chk_laporan_alasan_penarikan_wajib
    check (ditarik_pada is null or (alasan_penarikan is not null
      and length(trim(alasan_penarikan)) > 0))
);

comment on table public.laporan_harian is
  'Lapis pertama pelaporan — laporan singkat dari lapangan. Bukan LHP. [FINAL] docs/30-modul-6.3-pelaporan.md §5.4. Sistem menyajikan fakta lokasi (jarak, titik terdekat), tidak pernah menyimpulkan kepatuhan (aturan modul butir 2) — lihat trg_hitung_lokasi di Bagian D.';
comment on column public.laporan_harian.lokasi_id is
  'Titik yang DIPILIH pelapor, boleh berbeda dari lokasi_id_terdekat (hitungan sistem). Keduanya tersimpan berdampingan sebagai fakta, tidak saling membatalkan (KP-6.3-22, KP-6.3-23).';
comment on column public.laporan_harian.antrean_id is
  'Dibuat KLIEN sekali saat pelapor menekan kirim (BR-46). Indeks unik di bawah menolak kiriman kembar bila aplikasi mengirim ulang setelah jawaban server hilang di jalan.';
comment on column public.laporan_harian.direkam_pada is
  'Waktu PERANGKAT saat tombol kirim ditekan — dasar SELURUH penilaian waktu (Kewajiban Lapor Harian, urutan tampilan) per BR-45. Bukan dikirim_pada.';

create unique index uq_laporan_antrean_id on public.laporan_harian (antrean_id);
create index idx_laporan_penugasan on public.laporan_harian (penugasan_id, direkam_pada desc);
create index idx_laporan_pelapor on public.laporan_harian (pelapor_id, direkam_pada desc);
create index idx_laporan_sesi_tugas on public.laporan_harian (sesi_tugas_id) where sesi_tugas_id is not null;
-- Menopang v_belum_lapor (Bagian E) dan pencarian "sudah lapor hari
-- ini": indeks BIASA pada (penugasan_id, pelapor_id, direkam_pada),
-- BUKAN pada direkam_pada::date. Ekspresi ::date di dalam indeks
-- gagal dibuat karena bergantung pada zona waktu sesi (TimeZone),
-- sehingga tidak IMMUTABLE menurut PostgreSQL — ditemukan lewat
-- percobaan sungguhan saat menguji migrasi ini di Postgres lokal,
-- bukan diperkirakan di atas kertas. Kueri v_belum_lapor tetap efisien
-- karena indeks ini menyempitkan ke (penugasan_id, pelapor_id) lebih
-- dulu; perbandingan tanggal pada baris yang tersisa jumlahnya kecil.
create index idx_laporan_penugasan_pelapor_hari
  on public.laporan_harian (penugasan_id, pelapor_id, direkam_pada)
  where status_laporan <> 'ditarik';


-- ### BAGIAN B — Tabel catatan_laporan

create table public.catatan_laporan (
  id             uuid primary key default gen_random_uuid(),
  laporan_id     uuid not null references public.laporan_harian (id) on delete restrict,
  peninjau_id    uuid not null references public.users (id) on delete restrict,
  jenis          text not null check (jenis in ('catatan', 'minta_perbaikan')),
  isi            text not null check (length(trim(isi)) > 0),
  dibuat_pada    timestamptz not null default now(),
  disunting_pada timestamptz
);

comment on table public.catatan_laporan is
  'Catatan peninjau pada laporan. Banyak peninjau, tidak saling menimpa (BR-43). Tidak pernah dihapus. §5.19 [FINAL].';
comment on column public.catatan_laporan.peninjau_id is
  'Tidak boleh sama dengan pelapor_id laporan induk (BR-31) — ditegakkan trg_larang_tinjau_sendiri (Bagian F), BUKAN CHECK constraint, karena pemeriksaannya lintas tabel.';

create index idx_catatan_laporan on public.catatan_laporan (laporan_id, dibuat_pada);


-- ### BAGIAN C — Tabel foto_dokumentasi (MINIMAL — [KERANGKA], final di Modul 6.7)
--
-- Hanya kolom yang BR-42 nyatakan final dibangun sekarang: lat, lng,
-- akurasi_meter, diambil_pada milik tiap foto sendiri. Kolom lain yang
-- disebut §5.6 PRD asli (sumber kamera/galeri, tanda_air_*, lhp_id)
-- SENGAJA belum ditambahkan — formatnya belum final dan menambahnya
-- sekarang berisiko harus diubah lagi saat Modul 6.7 digali. lhp_id
-- khususnya tidak dapat ditambahkan sekarang karena tabel `lhp` belum
-- ada (LHP ditunda, docs/CLAUDE.md §10).

create table public.foto_dokumentasi (
  id            uuid primary key default gen_random_uuid(),
  laporan_id    uuid references public.laporan_harian (id) on delete cascade,
  penugasan_id  uuid not null references public.penugasan (id) on delete restrict,
  diunggah_oleh uuid not null references public.users (id) on delete restrict,
  berkas_path   text not null,
  keterangan    text,

  -- BR-42: koordinat MILIK FOTO INI, tidak pernah diwarisi dari laporan.
  lat           numeric,
  lng           numeric,
  akurasi_meter numeric,
  diambil_pada  timestamptz,

  dibuat_pada   timestamptz not null default now()
);

comment on table public.foto_dokumentasi is
  '[KERANGKA — final di Modul 6.7]. Hanya kolom final BR-42 dibangun sekarang (lat/lng/akurasi/diambil_pada per foto). Jangan tambahkan tanda_air_* atau lhp_id di sini tanpa merujuk revisi Modul 6.7 — lihat catatan Bagian C migrasi ini.';
comment on column public.foto_dokumentasi.lat is
  'Koordinat pengambilan FOTO INI SENDIRI. Boleh kosong (foto dari galeri). TIDAK PERNAH disalin dari laporan_harian.lokasi_lat (BR-42).';

create index idx_foto_laporan on public.foto_dokumentasi (laporan_id) where laporan_id is not null;
create index idx_foto_penugasan on public.foto_dokumentasi (penugasan_id);


-- ### BAGIAN D — Fungsi bantu RLS dan pemicu BEFORE INSERT/UPDATE

-- ---------------------------------------------------------------------
-- Fungsi bantu: memutus rekursi RLS antara laporan_harian dan
-- catatan_laporan, mengikuti pola yang sudah dipakai migrasi 0010
-- untuk penugasan <-> penugasan_pelaksana (lihat catatan desain #2 di
-- puncak berkas ini). Tanpa security definer, kebijakan
-- catatan_laporan yang membaca laporan_harian akan memicu evaluasi
-- kebijakan laporan_harian, yang beberapa cabangnya membaca balik
-- tabel lain — pola yang sudah terbukti berujung rekursi tak
-- berhingga di proyek ini sebelumnya.
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.laporan_yang_boleh_saya_baca()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select l.id
    from public.laporan_harian l
    join public.penugasan p on p.id = l.penugasan_id
   where l.pelapor_id = (select auth.uid())
      or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
      or (
        (select sipantau_auth.peran_saya()) = 'kanit'
        and p.unit_id = (select sipantau_auth.unit_saya())
      )
      or p.id in (select sipantau_auth.penugasan_yang_saya_awasi())
$$;

grant execute on function sipantau_auth.laporan_yang_boleh_saya_baca() to authenticated;

comment on function sipantau_auth.laporan_yang_boleh_saya_baca() is
  'Pemutus rekursi RLS laporan_harian <-> catatan_laporan. KP-6.3-57: pelapor sendiri, Panit pengawas SPT (aktif ATAU pernah, BR-21/BR-30 — lihat catatan kebijakan baca di Bagian F), Kanit unit pemilik, Kasubdit, Pemeliharaan.';

-- ---------------------------------------------------------------------
-- Celah 1 — Kalkulasi lokasi di server (BEFORE INSERT, urutan alfabet
-- membuat trigger ini jalan sebelum trg_isi_sesi_tugas dan
-- trg_periksa_pelapor_aktif — ketiganya independen jadi urutan aman
-- per catatan Addendum 6.3-T).
-- ---------------------------------------------------------------------
create or replace function public.fn_hitung_lokasi_laporan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  titik record;
begin
  if new.lokasi_lat is null or new.lokasi_lng is null then
    new.status_lokasi := 'tidak_terekam';
    return new;
  end if;

  select id, radius_meter,
         public.ST_Distance(
           public.ST_MakePoint(lng, lat)::public.geography,
           public.ST_MakePoint(new.lokasi_lng, new.lokasi_lat)::public.geography
         ) as jarak
    into titik
    from public.penugasan_lokasi
   where penugasan_id = new.penugasan_id and lat is not null
   order by jarak asc
   limit 1;

  if titik is null then
    -- KP-6.3-25: SPT tanpa satu pun titik berkoordinat -> di_luar_titik
    -- tanpa perhitungan, bukan galat.
    new.status_lokasi := 'di_luar_titik';
    new.lokasi_id_terdekat := null;
    new.jarak_meter := null;
    return new;
  end if;

  new.lokasi_id_terdekat := titik.id;
  new.jarak_meter := titik.jarak;
  new.status_lokasi := case when titik.jarak <= titik.radius_meter
                             then 'terverifikasi' else 'di_luar_titik' end;
  return new;
end;
$$;

create trigger trg_hitung_lokasi
  before insert on public.laporan_harian
  for each row
  execute function public.fn_hitung_lokasi_laporan();

comment on function public.fn_hitung_lokasi_laporan() is
  'BR-03: TIDAK PERNAH menolak laporan karena lokasi. Hanya menghitung fakta (jarak, titik terdekat, status) — tidak pernah menyimpulkan pelanggaran. Addendum 6.3-T Celah 1, KP-6.3-16 s/d 18. CATATAN TEKNIS: seluruh pemanggilan ST_Distance/ST_MakePoint/geography dikualifikasi public.* secara eksplisit — set search_path="" mengunci pencarian nama (kebijakan proyek, migrasi 0003), dan PostGIS terpasang di skema public, sehingga tanpa kualifikasi eksplisit fungsi ini gagal dengan "type geography does not exist" walau ekstensinya aktif. Ditemukan lewat percobaan sungguhan, bukan diperkirakan di atas kertas.';

-- ---------------------------------------------------------------------
-- Celah 3 — Pengisian sesi_tugas_id otomatis, terikat SPT yang sama
-- (KP-6.3-05, 06). Klien tidak pernah mengirim kolom ini.
-- ---------------------------------------------------------------------
create or replace function public.fn_isi_sesi_tugas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select id into new.sesi_tugas_id
    from public.sesi_tugas
   where pengguna_id = (select auth.uid())
     and penugasan_id = new.penugasan_id
     and ditutup_pada is null
   limit 1;
  return new;
end;
$$;

create trigger trg_isi_sesi_tugas
  before insert on public.laporan_harian
  for each row
  execute function public.fn_isi_sesi_tugas();

comment on function public.fn_isi_sesi_tugas() is
  'Sesi aktif pelapor di SPT LAIN (sah per BR-24) tidak ikut tertaut keliru karena penugasan_id disyaratkan sama. Kosong bukan penanda kurang sah (KP-6.3-06) — sesi_tugas belum punya RLS sampai Langkah 10, tapi fungsi ini security definer sehingga tidak terpengaruh.';

-- ---------------------------------------------------------------------
-- Celah 10 + koreksi BR-47/coalesce — Pemeriksaan gabungan pelaksana
-- aktif DAN SPT hidup, dinilai pada saat direkam_pada (bukan waktu
-- sekarang) supaya laporan dari Antrean Luring yang tiba setelah SPT
-- ditutup/pelaksana dicabut tetap diterima (BR-47).
-- ---------------------------------------------------------------------
create or replace function public.fn_periksa_pelapor_aktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  spt record;
begin
  select status, coalesce(ditutup_pada, dibatalkan_pada) as tertutup_pada
    into spt
    from public.penugasan
   where id = new.penugasan_id;

  if spt is null then
    raise exception 'PENUGASAN_TIDAK_DITEMUKAN';
  end if;

  if not (
    spt.status in ('baru', 'berjalan', 'bermasalah')
    or spt.tertutup_pada > new.direkam_pada
  ) then
    raise exception 'SPT_TIDAK_LAGI_MENERIMA_LAPORAN';
  end if;

  if not exists (
    select 1 from public.penugasan_pelaksana
     where penugasan_id = new.penugasan_id
       and pelaksana_id = new.pelapor_id
       and (dicabut_pada is null or dicabut_pada > new.direkam_pada)
  ) then
    raise exception 'BUKAN_PELAKSANA_AKTIF_PADA_SPT_INI';
  end if;

  return new;
end;
$$;

create trigger trg_periksa_pelapor_aktif
  before insert on public.laporan_harian
  for each row
  execute function public.fn_periksa_pelapor_aktif();

comment on function public.fn_periksa_pelapor_aktif() is
  'KP-6.3-01, 04. Dinilai pada direkam_pada (BUKAN now()) — koreksi 01-koreksi.md agar laporan Antrean Luring yang tiba setelah SPT tertutup tetap diterima (BR-47) selama ditulis sebelum penutupan. coalesce(ditutup_pada, dibatalkan_pada) menutup jalur pembatalan yang terlewat draf awal Addendum 6.3-T.';

-- ---------------------------------------------------------------------
-- Penjaga kewajaran waktu (bagian dari Antrean Luring, BR-45/BR-48) —
-- mencegah pemalsuan lewat jam perangkat yang dimundurkan, dan
-- menghitung diterima_terlambat.
-- ---------------------------------------------------------------------
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

  select dibuat_pada into terbit
    from public.penugasan where id = new.penugasan_id;
  if new.direkam_pada < terbit then
    raise exception 'WAKTU_MENDAHULUI_PENUGASAN';
  end if;

  new.diterima_terlambat := (now() - new.direkam_pada) > interval '5 minutes';

  return new;
end;
$$;

create trigger trg_nilai_kiriman_tertunda
  before insert on public.laporan_harian
  for each row
  execute function public.fn_nilai_kiriman_tertunda();

comment on function public.fn_nilai_kiriman_tertunda() is
  'BR-48: kiriman lebih dari 7 hari sejak direkam_pada ditolak — klien wajib menawarkan kirim ulang sadar atau buang, bukan mengirim otomatis. Menutup pemalsuan termudah: memundurkan jam perangkat agar laporan tampak dikirim kemarin.';


-- ### BAGIAN E — Pemicu BEFORE UPDATE: kunci, pembekuan kolom, minta-perbaikan

-- ---------------------------------------------------------------------
-- Celah 2 — Penguncian: laporan disetujui/ditarik terkunci bagi
-- SIAPA PUN, dan SPT tertutup ikut mengunci semua laporannya
-- (BR-40, KP-6.3-35, KP-6.3-36). Trigger PERTAMA secara alfabet pada
-- event UPDATE (trg_kunci... < trg_tandai...) sehingga tidak ada
-- kolom yang sempat berubah sebelum pemeriksaan kunci dijalankan.
-- ---------------------------------------------------------------------
create or replace function public.fn_kunci_laporan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  status_spt text;
begin
  if old.status_laporan in ('disetujui', 'ditarik') then
    raise exception 'LAPORAN_SUDAH_TERKUNCI';
  end if;

  select status into status_spt from public.penugasan where id = old.penugasan_id;
  if status_spt in ('selesai', 'dibatalkan') then
    raise exception 'SPT_SUDAH_DITUTUP_LAPORAN_IKUT_TERKUNCI';
  end if;

  return new;
end;
$$;

create trigger trg_kunci_laporan
  before update on public.laporan_harian
  for each row
  execute function public.fn_kunci_laporan();

-- ---------------------------------------------------------------------
-- Celah 4 — Pembekuan kolom fakta + pencatatan penyuntingan isi milik
-- pelapor. HANYA uraian, kendala, status_kegiatan yang boleh berubah
-- oleh pelapor; seluruh kolom lain dipaksa kembali ke nilai lama bila
-- ada yang mencoba mengubahnya lewat jalur biasa (mis. klien nakal
-- yang mengirim payload penuh, bukan hanya kolom yang disunting).
--
-- Trigger KEDUA secara alfabet pada UPDATE (trg_kunci < trg_tandai),
-- jadi baris ini tidak pernah dieksekusi bila laporan sudah terkunci
-- — pemeriksaan Celah 2 sudah melempar galat lebih dulu.
-- ---------------------------------------------------------------------
create or replace function public.fn_tandai_sunting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Kolom beku: kembalikan paksa ke nilai lama, apa pun yang dikirim.
  new.penugasan_id           := old.penugasan_id;
  new.pelapor_id              := old.pelapor_id;
  new.sesi_tugas_id           := old.sesi_tugas_id;
  new.jenis                   := old.jenis;
  new.lokasi_lat               := old.lokasi_lat;
  new.lokasi_lng               := old.lokasi_lng;
  new.akurasi_meter            := old.akurasi_meter;
  new.status_lokasi            := old.status_lokasi;
  new.lokasi_id_terdekat       := old.lokasi_id_terdekat;
  new.jarak_meter              := old.jarak_meter;
  new.alasan_lokasi            := old.alasan_lokasi;
  new.alasan_lokasi_lainnya    := old.alasan_lokasi_lainnya;
  new.antrean_id               := old.antrean_id;
  new.direkam_pada             := old.direkam_pada;
  new.diterima_terlambat       := old.diterima_terlambat;
  new.penanda_perangkat        := old.penanda_perangkat;
  new.penanda_perangkat_asal   := old.penanda_perangkat_asal;
  new.dikirim_pada             := old.dikirim_pada;
  -- lokasi_id (pilihan pelapor) TIDAK dibekukan di sini secara
  -- eksplisit oleh daftar Addendum 6.3-T, tetapi §5.4 menandainya
  -- "Beku setelah INSERT" pada tabel kolom — dibekukan juga.
  new.lokasi_id                := old.lokasi_id;

  -- Kolom persetujuan: BUKAN dibekukan tanpa syarat. Kanit yang
  -- menyetujui (status_laporan berpindah ke 'disetujui' pada UPDATE
  -- ini) MEMANG menulis disetujui_oleh/disetujui_pada — membekukannya
  -- tanpa syarat di sini adalah BUG nyata yang ditemukan lewat uji
  -- fungsional sungguhan: nilai yang baru saja ditulis Kanit langsung
  -- tertimpa balik ke NULL oleh trigger ini pada UPDATE yang sama.
  -- Yang dibekukan hanyalah UPAYA MENGUBAH kolom persetujuan di LUAR
  -- perpindahan status itu sendiri (mis. memalsukan disetujui_pada
  -- tanpa benar-benar mengubah status_laporan).
  if not (old.status_laporan is distinct from 'disetujui'
          and new.status_laporan = 'disetujui') then
    new.disetujui_oleh := old.disetujui_oleh;
    new.disetujui_pada := old.disetujui_pada;
  end if;
  -- ditarik_pada/alasan_penarikan: pola sama untuk penarikan oleh
  -- pelapor sendiri (ditegakkan lewat RLS: hanya pelapor yang boleh
  -- UPDATE selain Kanit, dan Kanit tidak pernah mengisi kolom ini).
  if not (old.ditarik_pada is null and new.ditarik_pada is not null) then
    new.ditarik_pada := old.ditarik_pada;
    new.alasan_penarikan := old.alasan_penarikan;
  end if;

  -- Naikkan jumlah_suntingan HANYA bila salah satu dari tiga kolom
  -- yang memang boleh berubah benar-benar berubah (bukan setiap UPDATE
  -- — kolom persetujuan pun lewat UPDATE, dan itu bukan "penyuntingan").
  if new.uraian is distinct from old.uraian
     or new.kendala is distinct from old.kendala
     or new.status_kegiatan is distinct from old.status_kegiatan
  then
    new.disunting_pada := now();
    new.jumlah_suntingan := old.jumlah_suntingan + 1;

    -- Celah 5 (arah balik): penyuntingan pelapor pada laporan yang
    -- diminta diperbaiki mengembalikan statusnya ke terkirim.
    if old.status_laporan = 'perlu_diperbaiki' then
      new.status_laporan := 'terkirim';
    end if;
  else
    new.disunting_pada := old.disunting_pada;
    new.jumlah_suntingan := old.jumlah_suntingan;
  end if;

  return new;
end;
$$;

create trigger trg_tandai_sunting
  before update on public.laporan_harian
  for each row
  execute function public.fn_tandai_sunting();

comment on function public.fn_tandai_sunting() is
  'Membekukan seluruh kolom fakta; hanya uraian/kendala/status_kegiatan yang benar-benar dapat berubah lewat UPDATE biasa. Menaikkan jumlah_suntingan hanya saat salah satu dari ketiganya benar-benar berubah (KP-6.3-33, 34, 26). Riwayat versi lengkap dicatat trigger terpisah di Bagian G (urutan alfabet: rekam_versi_laporan < tandai_sunting).';

-- ---------------------------------------------------------------------
-- Celah 5 (arah maju) — catatan berjenis minta_perbaikan memindahkan
-- laporan ke perlu_diperbaiki. AFTER INSERT pada catatan_laporan.
-- security definer WAJIB (koreksi I.3): pemanggilnya Panit, yang
-- menurut §9.2 tidak punya hak tulis sama sekali atas laporan_harian.
-- Tanpa security definer, setiap "minta perbaikan" oleh Panit gagal
-- total.
-- ---------------------------------------------------------------------
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

create trigger trg_minta_perbaikan
  after insert on public.catatan_laporan
  for each row
  execute function public.fn_minta_perbaikan();

comment on function public.fn_minta_perbaikan() is
  'security definer WAJIB — koreksi 01-koreksi.md I.3: pemanggilnya Panit yang tidak memiliki hak tulis langsung atas laporan_harian (§9.2). Tanpa ini, setiap Minta Perbaikan oleh Panit gagal total, bukan hanya sebagian.';

-- ---------------------------------------------------------------------
-- Celah 6 — Larangan meninjau laporan sendiri, lewat TRIGGER bukan
-- CHECK (BR-31) karena pemeriksaannya lintas tabel. security definer
-- WAJIB dengan alasan sama seperti fn_minta_perbaikan (I.3): fungsi
-- ini membaca laporan_harian yang haknya terbatas.
-- ---------------------------------------------------------------------
create or replace function public.fn_larang_tinjau_sendiri()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pemilik uuid;
begin
  select pelapor_id into pemilik
    from public.laporan_harian where id = new.laporan_id;

  if pemilik = new.peninjau_id then
    raise exception 'TIDAK_DAPAT_MENINJAU_LAPORAN_SENDIRI';
  end if;

  return new;
end;
$$;

create trigger trg_larang_tinjau_sendiri
  before insert on public.catatan_laporan
  for each row
  execute function public.fn_larang_tinjau_sendiri();

-- ---------------------------------------------------------------------
-- KP-6.2-30 (Modul 6.2, ditegakkan lagi di sini karena tabel pemicunya
-- baru lahir sekarang) — laporan pertama pada SPT berstatus baru
-- memindahkannya ke berjalan. Bersyarat status='baru' sehingga
-- idempoten dengan sendirinya; TIDAK menyentuh status 'bermasalah'
-- (pengembaliannya tetap tindakan sadar Kanit, migrasi 0015).
-- ---------------------------------------------------------------------
create or replace function public.trg_laporan_pertama_menjalankan_spt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.penugasan
     set status = 'berjalan', diubah_pada = now()
   where id = new.penugasan_id
     and status = 'baru';
  return new;
end;
$$;

create trigger laporan_pertama_menjalankan_spt
  after insert on public.laporan_harian
  for each row
  execute function public.trg_laporan_pertama_menjalankan_spt();

comment on function public.trg_laporan_pertama_menjalankan_spt() is
  'security definer supaya Anggota (tanpa hak tulis penugasan) tetap bisa memicu perpindahan status. Bersyarat status=baru: laporan kedua dst tidak mengubah apa pun. Tidak menyentuh bermasalah (KP-6.2-35 tetap milik Kanit).';


-- ### BAGIAN F — RLS laporan_harian dan catatan_laporan

alter table public.laporan_harian enable row level security;
grant select, insert, update on public.laporan_harian to authenticated;

-- BACA — KP-6.3-57: pelapor sendiri, Panit pengawas (BR-21/BR-30:
-- TETAP dapat membaca meski sudah dicabut, tanpa memandang
-- dicabut_pada — karena itu memakai penugasan_yang_saya_awasi() versi
-- Modul 6.2 yang SUDAH mencakup baris tercabut sekaligus baris aktif;
-- lihat definisinya di migrasi 0010 — ia tidak menyaring dicabut_pada
-- sama sekali, sehingga sifat "tetap terbaca setelah dicabut" otomatis
-- terwarisi di sini tanpa perlu ditulis ulang), Kanit unit pemilik,
-- Kasubdit, Pemeliharaan.
drop policy if exists "laporan_baca_sesuai_lingkup" on public.laporan_harian;
create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  pelapor_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
       where unit_id = (select sipantau_auth.unit_saya())
    )
  )
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
);

-- TULIS (insert) — hanya pelaksana aktif dari Perangkat Terdaftar.
-- Kelengkapan "aktif" dan "SPT hidup" sudah diperiksa lebih ketat
-- (bersyarat direkam_pada) oleh trg_periksa_pelapor_aktif; klausa RLS
-- ini cukup memastikan identitas pengirim dan perangkatnya sah, bukan
-- menduplikasi pemeriksaan waktu yang sudah dilakukan trigger.
drop policy if exists "laporan_tulis_hanya_dari_perangkat_terdaftar" on public.laporan_harian;
create policy "laporan_tulis_hanya_dari_perangkat_terdaftar"
on public.laporan_harian
for insert
to authenticated
with check (
  pelapor_id = (select auth.uid())
  and penanda_perangkat = (select sipantau_auth.perangkat_saya())
);

-- UBAH — pelapornya sendiri (dibatasi lebih lanjut oleh trg_kunci_laporan
-- dan trg_tandai_sunting menjadi hanya tiga kolom), ATAU Kanit unit
-- pemilik (untuk kolom persetujuan saja — pembatasannya juga di
-- trigger, RLS di sini hanya soal SIAPA, bukan KOLOM MANA).
drop policy if exists "laporan_ubah_pelapor_atau_kanit_setuju" on public.laporan_harian;
create policy "laporan_ubah_pelapor_atau_kanit_setuju"
on public.laporan_harian
for update
to authenticated
using (
  pelapor_id = (select auth.uid())
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
       where unit_id = (select sipantau_auth.unit_saya())
    )
  )
)
with check (
  pelapor_id = (select auth.uid())
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
       where unit_id = (select sipantau_auth.unit_saya())
    )
  )
);

-- catatan_laporan — mengikuti hak baca laporan induk lewat fungsi
-- pemutus rekursi (Bagian D). TULIS: Panit dengan penunjukan AKTIF
-- (BR-21/BR-30: berbeda dari baca, di sini Panit yang SUDAH dicabut
-- TIDAK boleh menulis catatan baru — memakai in (select ... where
-- dicabut_pada is null) langsung, bukan fungsi penugasan_yang_saya_awasi
-- yang tidak menyaring pencabutan), Kanit unit pemilik, Kasubdit.
alter table public.catatan_laporan enable row level security;
grant select, insert, update on public.catatan_laporan to authenticated;

drop policy if exists "catatan_baca_mengikuti_induk" on public.catatan_laporan;
create policy "catatan_baca_mengikuti_induk"
on public.catatan_laporan
for select
to authenticated
using (
  laporan_id in (select sipantau_auth.laporan_yang_boleh_saya_baca())
);

drop policy if exists "catatan_tulis_oleh_peninjau_berwenang" on public.catatan_laporan;
create policy "catatan_tulis_oleh_peninjau_berwenang"
on public.catatan_laporan
for insert
to authenticated
with check (
  peninjau_id = (select auth.uid())
  and (
    (
      (select sipantau_auth.peran_saya()) = 'kanit'
      and laporan_id in (
        select l.id from public.laporan_harian l
          join public.penugasan p on p.id = l.penugasan_id
         where p.unit_id = (select sipantau_auth.unit_saya())
      )
    )
    or (select sipantau_auth.peran_saya()) = 'kasubdit'
    or laporan_id in (
      select l.id from public.laporan_harian l
       where l.penugasan_id in (
         select penugasan_id from public.penugasan_panit
          where panit_id = (select auth.uid()) and dicabut_pada is null
       )
    )
  )
);

-- UBAH — hanya penulisnya sendiri (KP-6.3-47, KP-6.3-48). Trigger
-- rekam_versi_catatan (Bagian G) menyimpan isi lama sebelum tertimpa.
drop policy if exists "catatan_ubah_oleh_penulis_sendiri" on public.catatan_laporan;
create policy "catatan_ubah_oleh_penulis_sendiri"
on public.catatan_laporan
for update
to authenticated
using (peninjau_id = (select auth.uid()))
with check (peninjau_id = (select auth.uid()));

-- Penghapusan tertutup bagi SEMUA peran (BR-43) — tidak ada policy
-- for delete, dan bawaan RLS adalah tolak.


-- ### BAGIAN G — View rekap_laporan_tim dan v_belum_lapor

-- Celah 8 — kehadiran rekan tanpa membocorkan isi. security_invoker
-- OFF (bawaan) SENGAJA: view ini perlu melihat MELAMPAUI RLS ketat
-- laporan_harian, lalu ia sendiri yang menyaring hanya tiga kolom
-- aman. Ini SATU-SATUNYA pengecualian BR-37 dalam migrasi ini, dan
-- pengecualiannya disengaja serta didokumentasikan (bukan lalai) —
-- kontras dengan v_belum_lapor di bawah yang justru TIDAK butuh
-- pengecualian ini (lihat koreksi 01-koreksi.md di baris berikutnya).
create or replace view public.rekap_laporan_tim
with (security_invoker = off) as
select penugasan_id, pelapor_id, direkam_pada
  from public.laporan_harian
 where status_laporan <> 'ditarik';

grant select on public.rekap_laporan_tim to authenticated;

comment on view public.rekap_laporan_tim is
  'KP-6.3-58: sesama pelaksana tahu REKANNYA sudah lapor + waktunya, tidak melihat isi. security_invoker=off disengaja (Addendum 6.3-T Celah 8) — HANYA tiga kolom ini yang boleh terekspos, jangan tambah kolom tanpa meninjau ulang keputusan ini.';

-- Celah 7, DIKOREKSI 01-koreksi.md I.2 — v_belum_lapor.
--
-- BEDA DARI DRAF ADDENDUM 6.3-T ASLI DALAM DUA HAL:
--   1. security_invoker = ON (bukan OFF). RLS ketat pada
--      penugasan_pelaksana/penugasan/laporan_harian SUDAH menghasilkan
--      penyaringan yang tepat dengan sendirinya (Kanit->unitnya,
--      Kasubdit->semua, pelaksana->barisnya sendiri). Draf awal dengan
--      security_invoker=off membocorkan SELURUH pelaksana yang belum
--      lapor di SELURUH unit kepada siapa pun yang berhasil masuk —
--      celah yang ditemukan setelah Addendum 6.3-T ditulis.
--   2. Menyaring direkam_pada, bukan dikirim_pada (BR-45) — supaya
--      Anggota yang menulis laporan sore hari di area tanpa sinyal
--      tidak tercatat "belum lapor" hanya karena laporannya baru
--      benar-benar tiba tengah malam.
create or replace view public.v_belum_lapor
with (security_invoker = on) as
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
     select 1 from public.laporan_harian lh
      where lh.penugasan_id = pp.penugasan_id
        and lh.pelapor_id = pp.pelaksana_id
        and lh.status_laporan <> 'ditarik'
        and lh.direkam_pada::date = current_date
   );

grant select on public.v_belum_lapor to authenticated;

comment on view public.v_belum_lapor is
  'KOREKSI 01-koreksi.md I.2: security_invoker=ON (bukan off seperti draf awal Addendum 6.3-T) — draf awal membocorkan seluruh pelaksana belum-lapor lintas unit ke siapa pun yang masuk. RLS tabel dasar sudah cukup menyaring. Dihitung dinamis tiap dibuka, bukan disimpan (KP-6.3-56) — pg_cron hanya kurir pemberitahuan, bukan sumber kebenaran.';


-- ### BAGIAN H — RLS foto_dokumentasi, pembersih foto yatim (Celah 9)
--
-- (wajib_lapor_harian sudah ditambahkan di Bagian A — lihat catatan
-- di sana soal urutan.)

-- foto_dokumentasi — mengikuti hak baca/tulis laporan induknya. Foto
-- tanpa laporan_id (mis. kelak dipakai LHP) sengaja tidak dicakup
-- kebijakan ini — akan ditinjau ulang saat Modul 6.7/6.8 digali.
alter table public.foto_dokumentasi enable row level security;
grant select, insert, delete on public.foto_dokumentasi to authenticated;

drop policy if exists "foto_baca_mengikuti_laporan" on public.foto_dokumentasi;
create policy "foto_baca_mengikuti_laporan"
on public.foto_dokumentasi
for select
to authenticated
using (
  laporan_id is not null
  and laporan_id in (select sipantau_auth.laporan_yang_boleh_saya_baca())
);

drop policy if exists "foto_unggah_oleh_pelapor" on public.foto_dokumentasi;
create policy "foto_unggah_oleh_pelapor"
on public.foto_dokumentasi
for insert
to authenticated
with check (
  diunggah_oleh = (select auth.uid())
  and laporan_id in (
    select id from public.laporan_harian
     where pelapor_id = (select auth.uid())
       and status_laporan not in ('disetujui', 'ditarik')
  )
);

-- KP-6.3-42: laporan disetujui/ditarik tidak lagi menerima foto baru
-- (WITH CHECK di atas sudah menegakkannya). Penghapusan foto memakai
-- syarat sama agar foto tidak bisa dicabut dari laporan yang terkunci.
drop policy if exists "foto_hapus_oleh_pengunggah_sebelum_terkunci" on public.foto_dokumentasi;
create policy "foto_hapus_oleh_pengunggah_sebelum_terkunci"
on public.foto_dokumentasi
for delete
to authenticated
using (
  diunggah_oleh = (select auth.uid())
  and laporan_id in (
    select id from public.laporan_harian
     where pelapor_id = (select auth.uid())
       and status_laporan not in ('disetujui', 'ditarik')
  )
);

-- Celah 9 — pembersih foto yatim: baris foto_dokumentasi yang gagal
-- tersimpan padahal berkasnya sudah terunggah ke Storage (KP-6.3-32).
-- Bukan sebaliknya — ini TIDAK menghapus foto yang barisnya ada tapi
-- berkasnya hilang; itu kerusakan berbeda yang butuh penanganan lain.
create or replace function public.fn_bersihkan_foto_yatim()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects
   where bucket_id = 'dokumentasi'
     and (storage.foldername(name))[1] = 'laporan'
     and created_at < now() - interval '24 hours'
     and name not in (select berkas_path from public.foto_dokumentasi);
end;
$$;

comment on function public.fn_bersihkan_foto_yatim() is
  'Celah 9, KP-6.3-32. Hanya menyapu prefiks laporan/ pada wadah dokumentasi (bukan spt/ milik migrasi 0016) supaya tidak ikut membersihkan berkas surat SPT yang caranya berbeda.';

select cron.schedule(
  'bersih-foto-yatim',
  '0 2 * * *',                          -- 02:00 UTC, sekitar 09:00 WIB
  $$ select public.fn_bersihkan_foto_yatim() $$
);


-- ### BAGIAN I — Jejak audit (§9.6)
--
-- Tidak ada tabel/kolom baru di sini — jejak audit dicatat lewat
-- pemanggilan public.catat_jejak_audit (sudah ada, migrasi 0005) dari
-- Server Action, PERSIS pola yang dipakai Langkah 6. Bagian ini hanya
-- mencatat KEENAM jenis tindakan yang §9.6 tetapkan, sebagai referensi
-- bagi kode aplikasi (Bagian J dan seterusnya):
--
--   sunting_laporan, tarik_laporan, setujui_laporan, catat_laporan,
--   minta_perbaikan_laporan, sunting_catatan_laporan
--
-- KP-6.3-64: pengiriman laporan TIDAK dicatat tersendiri — baris
-- laporan_harian itu sendiri sudah menjadi catatan lengkap (waktu,
-- pengirim, penanda perangkat).


-- ### BAGIAN J — laporan_versi (Addendum 6.3-K B.2, riwayat penyuntingan)
--
-- KP-6.3-75 s/d 80. Menyimpan nilai LAMA sebelum tertimpa, untuk
-- laporan_harian (uraian/kendala/status_kegiatan) dan catatan_laporan
-- (isi). Baris versi HANYA lahir dari trigger security definer;
-- authenticated tidak diberi hak insert/update/delete sama sekali
-- (REVOKE eksplisit di bawah) — tidak seorang pun, termasuk lewat
-- jalur Akun Pemeliharaan biasa, dapat menulis riwayat secara langsung.

create table public.laporan_versi (
  id           uuid primary key default gen_random_uuid(),
  -- Salah satu dari dua kolom ini terisi, tidak pernah keduanya —
  -- satu baris riwayat berasal dari SATU sumber (laporan ATAU catatan).
  laporan_id   uuid references public.laporan_harian (id) on delete cascade,
  catatan_id   uuid references public.catatan_laporan (id) on delete cascade,
  isi_lama     text not null,
  disunting_oleh uuid not null references public.users (id) on delete restrict,
  dibuat_pada  timestamptz not null default now(),

  constraint chk_laporan_versi_satu_sumber
    check (
      (laporan_id is not null and catatan_id is null)
      or (laporan_id is null and catatan_id is not null)
    )
);

comment on table public.laporan_versi is
  'Addendum 6.3-K B.2, KP-6.3-75 s/d 80. Riwayat nilai lama sebelum disunting. HANYA lahir dari trigger security definer — authenticated tidak punya hak tulis sama sekali (revoke di bawah), lihat BR-32 untuk penghapusan bersama SPT.';

create index idx_laporan_versi_laporan on public.laporan_versi (laporan_id, dibuat_pada desc) where laporan_id is not null;
create index idx_laporan_versi_catatan on public.laporan_versi (catatan_id, dibuat_pada desc) where catatan_id is not null;

-- Pemicu rekam_versi_laporan — nama dipilih agar SECARA ALFABET jatuh
-- SEBELUM trg_tandai_sunting pada event UPDATE yang sama, sehingga
-- nilai lama sempat direkam sebelum fn_tandai_sunting menimpanya.
-- PERINGATAN: jangan mengganti nama trigger ini atau trg_tandai_sunting
-- tanpa memeriksa ulang urutan alfabetnya — urutan yang salah membuat
-- versi yang tersimpan adalah nilai yang SUDAH tertimpa, bukan nilai
-- lama yang sebenarnya.
create or replace function public.fn_rekam_versi_laporan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.uraian is distinct from old.uraian
     or new.kendala is distinct from old.kendala
     or new.status_kegiatan is distinct from old.status_kegiatan
  then
    insert into public.laporan_versi (laporan_id, isi_lama, disunting_oleh)
    values (
      old.id,
      format(e'Uraian: %s\nKendala: %s\nStatus kegiatan: %s',
             coalesce(old.uraian, ''), coalesce(old.kendala, ''),
             coalesce(old.status_kegiatan, '')),
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create trigger rekam_versi_laporan
  before update on public.laporan_harian
  for each row
  execute function public.fn_rekam_versi_laporan();

comment on function public.fn_rekam_versi_laporan() is
  'Nama "rekam_versi_laporan" SENGAJA < "trg_tandai_sunting" secara alfabet agar jalan LEBIH DULU pada event UPDATE yang sama (PostgreSQL menjalankan trigger sama-event berurutan alfabet). Jangan ganti nama tanpa memeriksa ulang urutan ini — lihat Addendum 6.3-T catatan urutan trigger.';

-- Pemicu rekam_versi_catatan — pola sama untuk catatan_laporan.
create or replace function public.fn_rekam_versi_catatan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.isi is distinct from old.isi then
    insert into public.laporan_versi (catatan_id, isi_lama, disunting_oleh)
    values (old.id, old.isi, (select auth.uid()));
    new.disunting_pada := now();
  end if;
  return new;
end;
$$;

create trigger rekam_versi_catatan
  before update on public.catatan_laporan
  for each row
  execute function public.fn_rekam_versi_catatan();

alter table public.laporan_versi enable row level security;

drop policy if exists "versi_baca_mengikuti_induk" on public.laporan_versi;
create policy "versi_baca_mengikuti_induk"
on public.laporan_versi
for select
to authenticated
using (
  (laporan_id is not null and laporan_id in (select sipantau_auth.laporan_yang_boleh_saya_baca()))
  or (catatan_id is not null and catatan_id in (
        select id from public.catatan_laporan
         where laporan_id in (select sipantau_auth.laporan_yang_boleh_saya_baca())
      ))
);

-- KP-6.3-79: authenticated TIDAK diberi hak tulis sama sekali. Baris
-- hanya lahir dari kedua trigger di atas (security definer, berjalan
-- dengan hak pemiliknya, melewati grant biasa).
revoke insert, update, delete on public.laporan_versi from authenticated;
grant select on public.laporan_versi to authenticated;
