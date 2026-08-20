"use server";

import { revalidatePath } from "next/cache";

import { ambilPenggunaSaatIni } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";

/**
 * Unggah foto laporan — §6.3.5 ("dua tombol berbeda, Ambil Foto dan
 * Pilih dari Galeri, bukan satu area unggah gabungan"), BR-42.
 *
 * Tata nama berkas MENGIKAT: `laporan/<laporan_id>/<berkas>` — migrasi
 * 0018 (kebijakan Storage) dan fn_bersihkan_foto_yatim (migrasi 0017)
 * SUDAH mengasumsikan pola ini. Jangan diubah tanpa menyesuaikan
 * keduanya.
 *
 * PERBEDAAN KAMERA VS GALERI MENENTUKAN KOORDINAT (BR-42): foto dari
 * kamera membawa koordinat pengambilannya sendiri (diambil lewat
 * geolocation browser pada saat difoto, dikirim sebagai parameter
 * terpisah dari berkasnya); foto dari galeri TIDAK PERNAH diberi
 * koordinat pinjaman dari laporan induk — tetap kosong kecuali metadata
 * EXIF-nya sendiri suatu saat dibaca (belum dilakukan sesi ini).
 *
 * [KERANGKA — final di Modul 6.7]: hanya kolom final BR-42 yang
 * dipakai (lat/lng/akurasi/diambil_pada per foto). Kolom sumber
 * (kamera/galeri) BELUM ada di skema — lihat catatan di migrasi 0017
 * Bagian C. Untuk sekarang, sumbernya HANYA memengaruhi apakah
 * koordinat ikut terkirim, bukan disimpan sebagai kolom tersendiri.
 */

export type HasilFoto =
  | { ok: true; id: string; path: string }
  | { ok: false; error: string };

const JENIS_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"];
const BATAS_BYTE = 10 * 1024 * 1024;

export async function unggahFotoLaporan(
  laporanId: string,
  formData: FormData,
): Promise<HasilFoto> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  const { data: laporan } = await supabase
    .from("laporan_harian")
    .select("id, penugasan_id, pelapor_id, status_laporan")
    .eq("id", laporanId)
    .maybeSingle<{
      id: string;
      penugasan_id: string;
      pelapor_id: string;
      status_laporan: string;
    }>();

  if (!laporan) return { ok: false, error: "Laporan tidak ditemukan." };

  // KP-6.3-42: laporan disetujui/ditarik tidak lagi menerima foto baru.
  if (laporan.pelapor_id !== pengguna.id) {
    return { ok: false, error: "Hanya pelapor yang dapat menambah foto." };
  }
  if (["disetujui", "ditarik"].includes(laporan.status_laporan)) {
    return { ok: false, error: "Laporan ini sudah terkunci." };
  }

  const berkas = formData.get("berkas");
  if (!(berkas instanceof File) || berkas.size === 0) {
    return { ok: false, error: "Pilih berkas foto lebih dulu." };
  }
  if (!JENIS_DIIZINKAN.includes(berkas.type)) {
    return { ok: false, error: "Berkas harus berupa JPG, PNG, atau WebP." };
  }
  if (berkas.size > BATAS_BYTE) {
    return { ok: false, error: "Ukuran berkas melebihi 10 MB." };
  }

  // BR-42: koordinat MILIK FOTO INI SENDIRI — dikirim terpisah dari
  // berkasnya, TIDAK PERNAH disalin dari laporan_harian.lokasi_lat.
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lng = formData.get("lng") ? Number(formData.get("lng")) : null;
  const akurasi = formData.get("akurasi_meter")
    ? Number(formData.get("akurasi_meter"))
    : null;
  const diambilPada = formData.get("diambil_pada")
    ? String(formData.get("diambil_pada"))
    : null;
  const keterangan = String(formData.get("keterangan") ?? "").trim() || null;

  const ekstensi =
    berkas.type === "image/png" ? "png" : berkas.type === "image/webp" ? "webp" : "jpg";
  const path = `laporan/${laporanId}/foto-${Date.now()}.${ekstensi}`;

  const { error: galatUnggah } = await supabase.storage
    .from("dokumentasi")
    .upload(path, berkas, { contentType: berkas.type, upsert: false });

  if (galatUnggah) {
    return { ok: false, error: "Berkas gagal diunggah. Periksa jaringan lalu ulangi." };
  }

  const { data, error: galatBaris } = await supabase
    .from("foto_dokumentasi")
    .insert({
      laporan_id: laporanId,
      penugasan_id: laporan.penugasan_id,
      diunggah_oleh: pengguna.id,
      berkas_path: path,
      keterangan,
      lat,
      lng,
      akurasi_meter: akurasi,
      diambil_pada: diambilPada,
    })
    .select("id")
    .single<{ id: string }>();

  if (galatBaris || !data) {
    // Baris gagal tercatat — buang berkas yang baru saja naik supaya
    // tidak ada berkas yatim di wadah (fn_bersihkan_foto_yatim juga
    // akan menyapunya lewat pg_cron, tapi tidak perlu menunggu 24 jam).
    await supabase.storage.from("dokumentasi").remove([path]);
    return { ok: false, error: "Berkas naik tetapi gagal ditautkan. Coba lagi." };
  }

  revalidatePath(`/laporan/${laporanId}`);
  return { ok: true, id: data.id, path };
}

export async function hapusFotoLaporan(fotoId: string): Promise<HasilFoto> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  const { data: foto } = await supabase
    .from("foto_dokumentasi")
    .select("id, berkas_path, laporan_id, diunggah_oleh")
    .eq("id", fotoId)
    .maybeSingle<{
      id: string;
      berkas_path: string;
      laporan_id: string | null;
      diunggah_oleh: string;
    }>();

  if (!foto) return { ok: false, error: "Foto tidak ditemukan." };
  if (foto.diunggah_oleh !== pengguna.id) {
    return { ok: false, error: "Hanya pengunggah yang dapat menghapus foto ini." };
  }

  // RLS "foto_hapus_oleh_pengunggah_sebelum_terkunci" (migrasi 0017)
  // menegakkan syarat status laporan; kebijakan Storage 0018
  // menegakkan hal yang sama untuk berkasnya. Kedua penghapusan di
  // bawah akan ditolak sendiri-sendiri bila laporan sudah terkunci —
  // tidak perlu memeriksa ulang statusnya di sini.
  const { error: galatBaris } = await supabase
    .from("foto_dokumentasi")
    .delete()
    .eq("id", fotoId);

  if (galatBaris) {
    return { ok: false, error: "Foto ini sudah terkunci dan tidak dapat dihapus." };
  }

  await supabase.storage.from("dokumentasi").remove([foto.berkas_path]);

  if (foto.laporan_id) revalidatePath(`/laporan/${foto.laporan_id}`);
  return { ok: true, id: fotoId, path: foto.berkas_path };
}

export async function tautanFoto(path: string): Promise<string | null> {
  const supabase = await klienServer();
  const { data } = await supabase.storage
    .from("dokumentasi")
    .createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
