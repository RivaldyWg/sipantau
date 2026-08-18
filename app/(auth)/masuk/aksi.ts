"use server";

import { klienServer } from "@/lib/supabase/server";
import { berandaUntukPeran } from "@/lib/auth/menu";
import type { Peran } from "@/lib/supabase/types";

export type HasilMasuk =
  | { ok: true; tujuan: string }
  | { ok: false; error: string; nrp: string };

/**
 * Server Action Halaman Masuk — docs/10-modul-6.1-auth.md §6.1.3
 * KP-6.1-01 s/d 06. Sengaja TIDAK memanggil redirect() di sini (lihat
 * catatan pada formulir-masuk.tsx) — action ini dipanggil langsung
 * dari client, bukan lewat <form action>, supaya kegagalan jaringan
 * bisa dibedakan dari kegagalan kredensial (KP-6.1-06 vs KP-6.1-02).
 */
export async function masuk(formData: FormData): Promise<HasilMasuk> {
  const nrp = String(formData.get("nrp") ?? "").trim(); // KP-6.1-04
  const kataSandi = String(formData.get("kata_sandi") ?? "");

  if (!nrp || !kataSandi) {
    return { ok: false, error: "NRP dan kata sandi wajib diisi.", nrp };
  }

  // AM-6.1-01: identitas masuk adalah NRP, email sintetis dibangkitkan
  // sistem dan tidak pernah ditampilkan.
  const emailSistem = `${nrp}@sipantau.internal`;
  const supabase = await klienServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailSistem,
    password: kataSandi,
  });

  // KP-6.1-02 / AM-6.1-02: satu pesan yang sama untuk NRP tidak
  // terdaftar maupun kata sandi salah — tidak pernah dibedakan.
  const pesanKredensialSalah = "NRP atau kata sandi tidak sesuai.";

  if (error || !data.user) {
    return { ok: false, error: pesanKredensialSalah, nrp };
  }

  const { data: baris, error: errBaris } = await supabase
    .from("users")
    .select("peran, aktif, wajib_ganti_sandi")
    .eq("id", data.user.id)
    .maybeSingle<{ peran: Peran; aktif: boolean; wajib_ganti_sandi: boolean }>();

  if (errBaris || !baris) {
    // Ada di auth.users tapi tidak ada di public.users — seharusnya
    // tidak pernah terjadi pada alur normal (baris dibuat bersamaan
    // lewat Fungsi Tepi buat-akun), diperlakukan sama seperti
    // kredensial salah, bukan pesan teknis yang membingungkan.
    await supabase.auth.signOut({ scope: "local" });
    return { ok: false, error: pesanKredensialSalah, nrp };
  }

  if (!baris.aktif) {
    // KP-6.1-03: akun tidak aktif -> tolak, jangan perbarui terakhir_masuk.
    await supabase.auth.signOut({ scope: "local" });
    return {
      ok: false,
      error: "Akun ini sedang tidak aktif. Hubungi Kanit unit Anda.",
      nrp,
    };
  }

  // KP-6.1-05: terakhir_masuk diperbarui + jejak audit masuk_berhasil.
  // Kegagalan di sini TIDAK menggagalkan proses masuk (baris auth
  // sudah sah) — dicatat, bukan diblokir, karena mencatat gagal bukan
  // alasan menolak personel yang kredensialnya benar.
  await supabase.rpc("catat_masuk_berhasil");

  // KP-6.1-07: Kata Sandi Sementara aktif -> langsung ke halaman
  // penggantian, mendahului beranda peran mana pun.
  return {
    ok: true,
    tujuan: baris.wajib_ganti_sandi
      ? "/ganti-sandi-wajib"
      : berandaUntukPeran(baris.peran),
  };
}
