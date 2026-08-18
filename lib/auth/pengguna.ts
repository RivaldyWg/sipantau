import "server-only";
import { redirect } from "next/navigation";

import { klienServer } from "@/lib/supabase/server";
import type { PenggunaRow } from "@/lib/supabase/types";

export interface PenggunaSaatIni {
  authId: string;
  pengguna: PenggunaRow;
}

/**
 * Ambil pengguna yang sedang masuk (Server Component/Action saja).
 *
 * Menegakkan tiga hal dari docs/10-modul-6.1-auth.md §6.1.3 pada
 * setiap navigasi (bukan hidup selama sesi terbuka — lihat catatan
 * "yang ditunda" pada pesan ke pengguna soal KP-6.1-22..25):
 *   - Tidak ada sesi sama sekali          -> redirect /masuk
 *   - Baris public.users tidak ditemukan  -> keluar paksa, redirect /masuk
 *   - Akun aktif = salah (KP-6.1-24)      -> keluar paksa, redirect /masuk
 *
 * TIDAK memeriksa wajib_ganti_sandi di sini — dipisah ke
 * wajibkanSudahSiap() supaya halaman ganti-sandi-wajib sendiri bisa
 * memanggil fungsi ini tanpa ikut memantul balik ke dirinya sendiri.
 */
export async function ambilPenggunaSaatIni(): Promise<PenggunaSaatIni> {
  const supabase = await klienServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  const { data: pengguna, error } = await supabase
    .from("users")
    .select(
      "id, nama, nrp, email_sistem, pangkat, peran, unit_id, aktif, wajib_ganti_sandi, terakhir_masuk, sedang_bertugas, dibuat_pada, diubah_pada",
    )
    .eq("id", user.id)
    .maybeSingle<PenggunaRow>();

  if (error || !pengguna) {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/masuk");
  }

  if (!pengguna.aktif) {
    // KP-6.1-24: akun dinonaktifkan -> Sesi Masuk diakhiri.
    await supabase.auth.signOut({ scope: "local" });
    redirect("/masuk?nonaktif=1");
  }

  return { authId: user.id, pengguna };
}

/**
 * Sama seperti ambilPenggunaSaatIni(), tetapi juga menegakkan
 * KP-6.1-07/08: selama wajib_ganti_sandi benar, pengguna dipentalkan
 * ke halaman Ganti Kata Sandi Wajib dari halaman mana pun di (app).
 */
export async function wajibkanSudahSiap(): Promise<PenggunaSaatIni> {
  const hasil = await ambilPenggunaSaatIni();

  if (hasil.pengguna.wajib_ganti_sandi) {
    redirect("/ganti-sandi-wajib");
  }

  return hasil;
}
