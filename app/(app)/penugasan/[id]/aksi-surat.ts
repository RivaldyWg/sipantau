"use server";

import { revalidatePath } from "next/cache";

import { ambilPenggunaSaatIni } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type { StatusPenugasan } from "@/lib/supabase/types";

/**
 * Berkas surat perintah tugas — §6.2.5 ("Berkas surat diunggah dari
 * halaman rincian, bukan dari formulir ini, karena surat fisik kerap
 * ditandatangani belakangan"), BR-25, KP-6.2-45.
 *
 * Tata nama berkas MENGIKAT: `spt/<penugasan_id>/<berkas>`. Kelima
 * kebijakan Storage pada migrasi 0016 membaca segmen kedua untuk
 * menautkan berkas ke barisnya — mengubah polanya di sini tanpa
 * mengubah migrasinya akan membuat seluruh unggahan ditolak.
 *
 * Wadahnya TERTUTUP. Halaman tidak boleh menyusun URL publik; ia
 * meminta tautan bermasa berlaku pendek lewat createSignedUrl.
 */

export type HasilSurat =
  | { ok: true; path: string }
  | { ok: false; error: string };

const JENIS_DIIZINKAN = ["application/pdf", "image/jpeg", "image/png"];
const BATAS_BYTE = 10 * 1024 * 1024;

export async function unggahSuratSpt(
  id: string,
  formData: FormData,
): Promise<HasilSurat> {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  const { data: spt } = await supabase
    .from("penugasan")
    .select("id, unit_id, status, nomor_spt, berkas_surat_path")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      unit_id: string;
      status: StatusPenugasan;
      nomor_spt: string | null;
      berkas_surat_path: string | null;
    }>();

  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };

  if (pengguna.peran !== "kanit" || pengguna.unit_id !== spt.unit_id) {
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat mengunggah surat." };
  }
  if (spt.status === "selesai" || spt.status === "dibatalkan") {
    return { ok: false, error: "Penugasan sudah terkunci." };
  }

  const berkas = formData.get("berkas");
  if (!(berkas instanceof File) || berkas.size === 0) {
    return { ok: false, error: "Pilih berkas pindaian surat lebih dulu." };
  }
  if (!JENIS_DIIZINKAN.includes(berkas.type)) {
    return { ok: false, error: "Berkas harus berupa PDF, JPG, atau PNG." };
  }
  if (berkas.size > BATAS_BYTE) {
    return { ok: false, error: "Ukuran berkas melebihi 10 MB." };
  }

  const ekstensi =
    berkas.type === "application/pdf"
      ? "pdf"
      : berkas.type === "image/png"
        ? "png"
        : "jpg";

  // Nama berkas dibubuhi cap waktu supaya unggahan baru tidak tertahan
  // singgahan (cache) tautan lama. Berkas lama dihapus di bawah —
  // 6.2.6: "Berkas terakhir menggantikan yang sebelumnya."
  const path = `spt/${id}/surat-${Date.now()}.${ekstensi}`;

  const { error: galatUnggah } = await supabase.storage
    .from("dokumentasi")
    .upload(path, berkas, { contentType: berkas.type, upsert: false });

  if (galatUnggah) {
    return {
      ok: false,
      error:
        "Berkas gagal diunggah. Berkas lama tetap utuh — periksa jaringan lalu ulangi.",
    };
  }

  const { error: galatBaris } = await supabase
    .from("penugasan")
    .update({
      berkas_surat_path: path,
      diubah_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (galatBaris) {
    // Baris gagal diperbarui — buang berkas yang baru saja naik supaya
    // tidak ada berkas yatim di wadah.
    await supabase.storage.from("dokumentasi").remove([path]);
    return { ok: false, error: "Berkas naik tetapi gagal ditautkan. Coba lagi." };
  }

  // Baru sekarang berkas lama dibuang — setelah penggantinya benar-benar
  // tercatat, bukan sebelumnya. §6.2.5: "Bila pengunggahan berkas surat
  // terputus, berkas lama tetap utuh."
  if (spt.berkas_surat_path && spt.berkas_surat_path !== path) {
    await supabase.storage.from("dokumentasi").remove([spt.berkas_surat_path]);
  }

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "unggah_surat_spt",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: spt.berkas_surat_path
      ? "Berkas surat perintah diganti"
      : "Berkas surat perintah dilampirkan",
  });

  revalidatePath(`/penugasan/${id}`);
  return { ok: true, path };
}

/**
 * Tautan bermasa berlaku pendek untuk membuka berkas surat.
 * Dipanggil dari Server Component tiap kali halaman rincian dirender,
 * bukan disimpan — tautan bertanda tangan memang berumur pendek.
 */
export async function tautanSurat(path: string): Promise<string | null> {
  const supabase = await klienServer();
  const { data } = await supabase.storage
    .from("dokumentasi")
    .createSignedUrl(path, 300); // lima menit
  return data?.signedUrl ?? null;
}
