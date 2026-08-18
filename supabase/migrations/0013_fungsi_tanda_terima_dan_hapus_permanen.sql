-- =====================================================================
-- 0013 — Fungsi catat_tanda_terima dan hapus_penugasan_permanen
-- Sumber: Addendum 6.2-T Bagian 4 (tanda terima), Bagian 8 (hapus
--         permanen)
--         docs/01-koreksi.md J.3/W (zona waktu Asia/Jakarta)
--
-- CATATAN DESAIN
--
-- 1. KEJANGGALAN PRD YANG DISELESAIKAN DI SINI (dicatat sebelumnya
--    pada claude/catatan-kemajuan.md sebagai kejanggalan #3): Addendum
--    6.2-T Bagian 8.2 menulis contoh INSERT ke jejak_audit memakai
--    kolom "jenis", "ringkasan", "rincian". Tabel jejak_audit yang
--    SUNGGUHAN dibangun di migrasi 0002 memakai kolom berbeda:
--    pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel,
--    sasaran_id, keterangan (docs/10-modul-6.1-auth.md §5.13,
--    [FINAL], lebih dahulu ada). Mengikuti BR-77 dan aturan umum
--    "tabel sungguhan menang atas contoh kode pada addendum lain",
--    fungsi di bawah memakai nama kolom tabel yang sungguhan.
--    peran_pelaku diisi lewat subquery ke users, bukan dikirim
--    sebagai parameter, mengikuti pola public.catat_jejak_audit
--    (migrasi 0005).
--
-- 2. hapus_penugasan_permanen DIKURANGI dari bentuk lengkap Addendum
--    6.2-T Bagian 8.2 — pemeriksaan terhadap public.location_logs,
--    public.laporan_harian, public.foto_dokumentasi DIHILANGKAN
--    SEMENTARA karena ketiga tabel itu belum ada (lahir Langkah 7
--    dan Langkah 10). Ini PERSIS mengikuti instruksi eksplisit
--    Addendum 6.2-T Bagian 8.4: "Tabel yang belum ada ...
--    pemeriksaannya dihapus sementara dan WAJIB ditambahkan kembali
--    begitu tabelnya lahir." DICATAT SEBAGAI BUTIR TERTUNDA (setara
--    U-6.2-08 pada addendum) — jangan lupa saat Langkah 7 dan
--    Langkah 10.
--
-- 3. Kewenangan diperiksa ULANG di dalam fungsi (bukan dipercayakan
--    ke RLS pemanggil), karena fungsi ber-security definer melewati
--    RLS sepenuhnya. Pola yang sama dengan seluruh fungsi security
--    definer lain di proyek ini.
-- =====================================================================

-- ---------------------------------------------------------------------
-- catat_tanda_terima — KP-6.2-28
-- ---------------------------------------------------------------------
create or replace function public.catat_tanda_terima(p_penugasan_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.penugasan_pelaksana
     set dibaca_pada = now()
   where penugasan_id = p_penugasan_id
     and pelaksana_id = (select auth.uid())
     and dibaca_pada is null
     and dicabut_pada is null;
$$;

grant execute on function public.catat_tanda_terima(uuid) to authenticated;

comment on function public.catat_tanda_terima is
  'Tanda terima SPT — dipanggil klien setelah rincian berhasil dimuat. Kegagalannya tidak boleh mengganggu tampilan. Addendum 6.2-T Bagian 4.';

-- ---------------------------------------------------------------------
-- hapus_penugasan_permanen — BR-32, KP-6.2-48/49
-- ---------------------------------------------------------------------
create or replace function public.hapus_penugasan_permanen(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
  n int;
begin
  -- Penguncian baris induk sampai transaksi selesai — inilah yang
  -- menutup jendela waktu terhadap pembukaan Sesi Tugas bersamaan
  -- (Addendum 6.2-T Bagian 8.3, mengikat untuk Modul 6.4).
  select * into p
    from public.penugasan
   where id = p_id
     for update;

  if not found then
    raise exception 'PENUGASAN_TIDAK_DITEMUKAN';
  end if;

  -- Kewenangan diperiksa ulang, tidak dipercayakan kepada pemanggil.
  if (select sipantau_auth.peran_saya()) <> 'kanit'
     or p.unit_id is distinct from (select sipantau_auth.unit_saya()) then
    raise exception 'TIDAK_BERWENANG';
  end if;

  select count(*) into n from public.sesi_tugas where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: Sesi Tugas'; end if;

  -- CATATAN: pemeriksaan location_logs, laporan_harian,
  -- foto_dokumentasi BELUM disertakan — lihat catatan desain butir 2
  -- di atas. Tabel-tabel itu belum ada.

  -- Jejak audit dicatat SEBELUM penghapusan, selagi datanya masih ada.
  -- Nama kolom mengikuti tabel sungguhan (catatan desain butir 1),
  -- BUKAN contoh pada Addendum 6.2-T Bagian 8.2.
  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id, keterangan)
  values (
    (select auth.uid()),
    (select sipantau_auth.peran_saya()),
    'hapus_spt',
    'penugasan',
    p.id,
    coalesce(p.nomor_spt, '(tanpa nomor)') || ' — ' || coalesce(p.judul, '(tanpa judul)')
  );

  delete from public.penugasan where id = p_id;
end;
$$;

grant execute on function public.hapus_penugasan_permanen(uuid) to authenticated;

comment on function public.hapus_penugasan_permanen is
  'Penghapusan permanen SPT — hanya bila belum ada jejak kegiatan (BR-32). Pemeriksaan location_logs/laporan_harian/foto_dokumentasi tertunda, lihat catatan berkas migrasi ini.';
