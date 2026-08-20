"use server";

import { revalidatePath } from "next/cache";

import { ambilPenggunaSaatIni } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type {
  AlasanLokasiTidakTerekam,
  JenisCatatanLaporan,
  JenisLaporan,
  StatusKegiatanLaporan,
} from "@/lib/supabase/types";

/**
 * Server Actions Modul 6.3 — docs/30-modul-6.3-pelaporan.md.
 *
 * PRINSIP YANG BERLAKU DI SELURUH BERKAS INI (sama seperti Modul 6.2):
 *
 * 1. Kewenangan diperiksa di sini DAN ditegakkan lagi oleh RLS/trigger
 *    — dua lapis, bukan saling menggantikan.
 *
 * 2. BR-03 di atas segalanya: kirim laporan TIDAK PERNAH ditolak
 *    karena urusan lokasi. `kirimLaporan` di bawah tidak punya satu
 *    pun pemeriksaan yang menolak berdasarkan koordinat — hanya
 *    memvalidasi bahwa data lokasi yang DIKIRIM konsisten (mis. alasan
 *    wajib diisi bila memang tidak ada koordinat), bukan menolak
 *    ketiadaan koordinat itu sendiri.
 *
 * 3. Klien tidak dipercaya untuk fakta lokasi — `kirimLaporan`
 *    mengirim koordinat mentah dan alasan, tetapi status_lokasi,
 *    jarak_meter, lokasi_id_terdekat SELALU dihitung ulang oleh
 *    trigger database (fn_hitung_lokasi_laporan, migrasi 0017), tidak
 *    pernah dikirim dari sini.
 *
 * 4. Jejak audit (§9.6): `sunting_laporan`, `tarik_laporan`,
 *    `setujui_laporan`, `catat_laporan`, `minta_perbaikan_laporan`,
 *    `sunting_catatan_laporan`. Pengiriman laporan TIDAK dicatat
 *    tersendiri (KP-6.3-64) — baris laporan_harian itu sendiri sudah
 *    jadi catatan lengkap.
 */

export type Hasil =
  | { ok: true; id?: string; pesan?: string }
  | { ok: false; error: string };

const PESAN_BATASAN: Record<string, string> = {
  chk_laporan_alasan_lokasi_wajib_bila_tidak_terekam:
    "Pilih alasan lokasi tidak terekam.",
  chk_laporan_alasan_lainnya_wajib: "Uraian alasan lokasi wajib diisi.",
  chk_laporan_alasan_penarikan_wajib: "Alasan penarikan wajib diisi.",
  chk_masalah_uraian_wajib: "Uraian wajib diisi.",
};

function terjemahkanGalat(error: { code?: string; message?: string } | null): string {
  if (!error) return "Tindakan gagal. Coba lagi.";
  const pesan = error.message ?? "";

  if (pesan.includes("BUKAN_PELAKSANA_AKTIF_PADA_SPT_INI")) {
    return "Anda bukan pelaksana aktif pada penugasan ini.";
  }
  if (pesan.includes("SPT_TIDAK_LAGI_MENERIMA_LAPORAN")) {
    return "Penugasan ini sudah tidak menerima laporan baru.";
  }
  if (pesan.includes("WAKTU_PERANGKAT_DI_MASA_DEPAN")) {
    return "Jam perangkat Anda tampak berada di masa depan. Periksa pengaturan waktu perangkat.";
  }
  if (pesan.includes("KIRIMAN_KEDALUWARSA")) {
    return "Laporan ini terlalu lama tertahan (lebih dari 7 hari) dan tidak dapat dikirim otomatis.";
  }
  if (pesan.includes("WAKTU_MENDAHULUI_PENUGASAN")) {
    return "Waktu laporan tidak boleh mendahului waktu penugasan diterbitkan.";
  }
  if (pesan.includes("LAPORAN_SUDAH_TERKUNCI")) {
    return "Laporan ini sudah disetujui atau ditarik dan tidak dapat diubah.";
  }
  if (pesan.includes("SPT_SUDAH_DITUTUP_LAPORAN_IKUT_TERKUNCI")) {
    return "Penugasan sudah ditutup, laporan ikut terkunci.";
  }
  if (pesan.includes("TIDAK_DAPAT_MENINJAU_LAPORAN_SENDIRI")) {
    return "Anda tidak dapat memberi catatan pada laporan sendiri.";
  }
  if (error.code === "23505") {
    return "Laporan ini sepertinya sudah pernah terkirim (kiriman ganda dicegah otomatis).";
  }
  if (error.code === "23514") {
    const nama = Object.keys(PESAN_BATASAN).find((k) => pesan.includes(k));
    if (nama) return PESAN_BATASAN[nama];
    return "Data belum memenuhi syarat.";
  }
  if (error.code === "42501") return "Anda tidak berwenang melakukan tindakan ini.";
  return "Tindakan gagal. Coba lagi.";
}

// =====================================================================
// Kirim laporan — KP-6.3-01 s/d 25. Dipanggil baik dari pengiriman
// langsung (jaringan tersedia) maupun dari mekanisme retry Antrean
// Luring (lib/pelaporan/antrean-luring.ts) — keduanya memakai fungsi
// yang SAMA PERSIS supaya perilakunya tidak pernah berbeda tergantung
// jalur mana yang dipakai.
// =====================================================================

export interface MasukanKirimLaporan {
  penugasan_id: string;
  jenis: JenisLaporan;
  uraian: string;
  kendala: string;
  status_kegiatan: StatusKegiatanLaporan;
  lokasi_id: string | null;
  lokasi_lat: number | null;
  lokasi_lng: number | null;
  akurasi_meter: number | null;
  alasan_lokasi: AlasanLokasiTidakTerekam | null;
  alasan_lokasi_lainnya: string | null;
  keterangan_lokasi: string | null;
  /** Dibuat KLIEN sekali saat tombol kirim ditekan (BR-46). */
  antrean_id: string;
  /** Waktu PERANGKAT saat tombol kirim ditekan (BR-45). */
  direkam_pada: string;
}

export async function kirimLaporan(masukan: MasukanKirimLaporan): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (!masukan.uraian.trim()) {
    return { ok: false, error: "Uraian kegiatan wajib diisi." };
  }

  // KP-6.3-07: perangkat pengirim wajib Perangkat Terdaftar. RLS
  // sudah menegakkannya (laporan_tulis_hanya_dari_perangkat_terdaftar,
  // migrasi 0017), tapi kita perlu tahu penanda perangkatnya di sini
  // untuk mengisi kolom — bukan untuk memvalidasi (validasi tetap di
  // database, satu sumber kebenaran).
  const { data: perangkat } = await supabase
    .from("perangkat_masuk")
    .select("penanda_perangkat")
    .eq("user_id", pengguna.id)
    .maybeSingle<{ penanda_perangkat: string }>();

  if (!perangkat) {
    return {
      ok: false,
      error: "Perangkat Anda tidak terdaftar. Masuk ulang untuk mendaftarkan perangkat ini.",
    };
  }

  const { data, error } = await supabase
    .from("laporan_harian")
    .insert({
      penugasan_id: masukan.penugasan_id,
      pelapor_id: pengguna.id,
      jenis: masukan.jenis,
      uraian: masukan.uraian.trim(),
      kendala: masukan.kendala.trim() || null,
      status_kegiatan: masukan.status_kegiatan,
      lokasi_id: masukan.lokasi_id,
      lokasi_lat: masukan.lokasi_lat,
      lokasi_lng: masukan.lokasi_lng,
      akurasi_meter: masukan.akurasi_meter,
      alasan_lokasi: masukan.alasan_lokasi,
      alasan_lokasi_lainnya: masukan.alasan_lokasi_lainnya?.trim() || null,
      keterangan_lokasi: masukan.keterangan_lokasi?.trim() || null,
      antrean_id: masukan.antrean_id,
      direkam_pada: masukan.direkam_pada,
      penanda_perangkat: perangkat.penanda_perangkat,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    // Kiriman ganda (antrean_id sama) BUKAN kegagalan dari sudut
    // pandang pengguna — baris sebelumnya sudah tersimpan sah.
    // BR-46 menegaskan ini harus diam-diam berhasil, bukan galat.
    if (error.code === "23505") {
      return { ok: true, pesan: "Laporan sudah tersimpan sebelumnya." };
    }
    return { ok: false, error: terjemahkanGalat(error) };
  }

  revalidatePath("/laporan");
  revalidatePath(`/penugasan/${masukan.penugasan_id}`);
  return { ok: true, id: data.id, pesan: "Laporan terkirim." };
}

// =====================================================================
// Sunting laporan milik sendiri — KP-6.3-26, hanya tiga kolom yang
// benar-benar tersimpan (sisanya dibekukan trigger meski dikirim).
// =====================================================================

export async function suntingLaporan(
  id: string,
  masukan: {
    uraian: string;
    kendala: string;
    status_kegiatan: StatusKegiatanLaporan;
  },
): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (!masukan.uraian.trim()) {
    return { ok: false, error: "Uraian kegiatan wajib diisi." };
  }

  const { error } = await supabase
    .from("laporan_harian")
    .update({
      uraian: masukan.uraian.trim(),
      kendala: masukan.kendala.trim() || null,
      status_kegiatan: masukan.status_kegiatan,
    })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  const { data: laporan } = await supabase
    .from("laporan_harian")
    .select("penugasan_id")
    .eq("id", id)
    .maybeSingle<{ penugasan_id: string }>();

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "sunting_laporan",
    p_sasaran_tabel: "laporan_harian",
    p_sasaran_id: id,
    p_keterangan: `Laporan disunting oleh ${pengguna.nama}`,
  });

  revalidatePath(`/laporan/${id}`);
  if (laporan) revalidatePath(`/penugasan/${laporan.penugasan_id}`);
  return { ok: true, pesan: "Perubahan tersimpan." };
}

// =====================================================================
// Tarik laporan — KP-6.3-38 s/d 41. Alasan wajib, baris tetap ada.
// =====================================================================

export async function tarikLaporan(id: string, alasan: string): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (!alasan.trim()) {
    return { ok: false, error: "Alasan penarikan wajib diisi." };
  }

  const { error } = await supabase
    .from("laporan_harian")
    .update({
      status_laporan: "ditarik",
      ditarik_pada: new Date().toISOString(),
      alasan_penarikan: alasan.trim(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "tarik_laporan",
    p_sasaran_tabel: "laporan_harian",
    p_sasaran_id: id,
    p_keterangan: `Ditarik oleh ${pengguna.nama}. Alasan: ${alasan.trim()}`,
  });

  revalidatePath("/laporan");
  revalidatePath(`/laporan/${id}`);
  return { ok: true, pesan: "Laporan ditarik." };
}

// =====================================================================
// Setujui laporan — KP-6.3-36 s/d 37, hanya Kanit unit pemilik.
// =====================================================================

export async function setujuiLaporan(id: string): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (pengguna.peran !== "kanit") {
    return { ok: false, error: "Hanya Kanit yang dapat menyetujui laporan." };
  }

  const { error } = await supabase
    .from("laporan_harian")
    .update({
      status_laporan: "disetujui",
      disetujui_oleh: pengguna.id,
      disetujui_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "setujui_laporan",
    p_sasaran_tabel: "laporan_harian",
    p_sasaran_id: id,
    p_keterangan: `Disetujui oleh ${pengguna.nama}`,
  });

  revalidatePath("/laporan");
  revalidatePath(`/laporan/${id}`);
  return { ok: true, pesan: "Laporan disetujui dan terkunci." };
}

// =====================================================================
// Catatan — beri catatan / minta perbaikan. KP-6.3-43 s/d 49.
// =====================================================================

export async function beriCatatan(
  laporanId: string,
  jenis: JenisCatatanLaporan,
  isi: string,
): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (!isi.trim()) {
    return { ok: false, error: "Isi catatan wajib diisi." };
  }

  const { error } = await supabase.from("catatan_laporan").insert({
    laporan_id: laporanId,
    peninjau_id: pengguna.id,
    jenis,
    isi: isi.trim(),
  });

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan:
      jenis === "minta_perbaikan" ? "minta_perbaikan_laporan" : "catat_laporan",
    p_sasaran_tabel: "catatan_laporan",
    p_sasaran_id: laporanId,
    p_keterangan: `${jenis === "minta_perbaikan" ? "Minta perbaikan" : "Catatan"} oleh ${pengguna.nama}`,
  });

  revalidatePath(`/laporan/${laporanId}`);
  return {
    ok: true,
    pesan: jenis === "minta_perbaikan" ? "Perbaikan diminta." : "Catatan tersimpan.",
  };
}

export async function suntingCatatan(id: string, isi: string): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (!isi.trim()) {
    return { ok: false, error: "Isi catatan wajib diisi." };
  }

  const { data: catatan, error } = await supabase
    .from("catatan_laporan")
    .update({ isi: isi.trim() })
    .eq("id", id)
    .select("laporan_id")
    .single<{ laporan_id: string }>();

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "sunting_catatan_laporan",
    p_sasaran_tabel: "catatan_laporan",
    p_sasaran_id: id,
    p_keterangan: `Catatan disunting oleh ${pengguna.nama}`,
  });

  revalidatePath(`/laporan/${catatan.laporan_id}`);
  return { ok: true, pesan: "Catatan diperbarui." };
}

// =====================================================================
// Matikan/nyalakan Kewajiban Lapor Harian — KP-6.3-50, hanya Kanit.
// =====================================================================

export async function aturWajibLaporHarian(
  penugasanId: string,
  wajib: boolean,
): Promise<Hasil> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  if (pengguna.peran !== "kanit") {
    return { ok: false, error: "Hanya Kanit yang dapat mengubah pengaturan ini." };
  }

  const { error } = await supabase
    .from("penugasan")
    .update({ wajib_lapor_harian: wajib, diubah_pada: new Date().toISOString() })
    .eq("id", penugasanId);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  revalidatePath(`/penugasan/${penugasanId}`);
  revalidatePath("/laporan/belum-lapor");
  return {
    ok: true,
    pesan: wajib ? "Kewajiban lapor harian dinyalakan." : "Kewajiban lapor harian dimatikan.",
  };
}
