"use server";

import { klienServer } from "@/lib/supabase/server";
import { berandaUntukPeran } from "@/lib/auth/menu";
import type { Peran } from "@/lib/supabase/types";

export type HasilGantiSandi =
  | { ok: true; tujuan: string }
  | { ok: false; error: string };

/**
 * Server Action Halaman Ganti Kata Sandi Wajib.
 * docs/10-modul-6.1-auth.md §6.1.3 KP-6.1-09/10/11, AM-6.1-03/04.
 *
 * CATATAN TEKNIK — verifikasi KP-6.1-10 ("kata sandi baru harus
 * berbeda dari Kata Sandi Sementara"):
 * Sistem tidak pernah menyimpan kata sandi lama dalam bentuk yang
 * bisa dibandingkan langsung (hanya hash lewat Supabase Auth), dan
 * tidak ada API resmi "bandingkan dengan kata sandi saat ini". Maka
 * dipakai cara tidak langsung: coba masuk ulang memakai kata sandi
 * BARU pada akun yang sama. Bila percobaan itu BERHASIL, berarti
 * kata sandi baru sama persis dengan kata sandi yang sedang aktif
 * sekarang (Kata Sandi Sementara) -> ditolak. Bila GAGAL (kredensial
 * tidak valid), berarti kata sandi baru sungguh berbeda -> lanjut.
 * Hasil percobaan itu sendiri tidak dipakai untuk apa pun selain
 * pemeriksaan ini.
 */
export async function gantiSandi(formData: FormData): Promise<HasilGantiSandi> {
  const sandiBaru = String(formData.get("sandi_baru") ?? "");
  const ulangiSandiBaru = String(formData.get("ulangi_sandi_baru") ?? "");

  if (sandiBaru.length < 8) {
    // KP-6.1-11
    return {
      ok: false,
      error: "Kata sandi baru minimal delapan karakter.",
    };
  }

  if (sandiBaru !== ulangiSandiBaru) {
    return {
      ok: false,
      error: "Ulangi kata sandi baru tidak sama dengan isian sebelumnya.",
    };
  }

  const supabase = await klienServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return {
      ok: false,
      error: "Sesi masuk tidak ditemukan. Silakan masuk kembali.",
    };
  }

  // KP-6.1-10 — lihat catatan teknik di atas.
  const { data: percobaan } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: sandiBaru,
  });

  if (percobaan.user) {
    return {
      ok: false,
      error: "Kata sandi baru harus berbeda dari yang diberikan kepada Anda.",
    };
  }

  const { error: errUbah } = await supabase.auth.updateUser({
    password: sandiBaru,
  });

  if (errUbah) {
    return {
      ok: false,
      error: "Kata sandi gagal disimpan. Coba lagi sesaat lagi.",
    };
  }

  // KP-6.1-09: wajib_ganti_sandi -> salah, + jejak audit ganti_sandi.
  const { error: errSelesai } = await supabase.rpc(
    "selesaikan_ganti_sandi_wajib",
  );

  if (errSelesai) {
    return {
      ok: false,
      error:
        "Kata sandi tersimpan, tetapi status akun gagal diperbarui. Hubungi Kasubdit.",
    };
  }

  const { data: baris } = await supabase
    .from("users")
    .select("peran")
    .eq("id", user.id)
    .maybeSingle<{ peran: Peran }>();

  return { ok: true, tujuan: berandaUntukPeran(baris?.peran ?? "anggota") };
}
