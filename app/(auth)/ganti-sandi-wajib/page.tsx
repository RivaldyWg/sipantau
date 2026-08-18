import { redirect } from "next/navigation";

import { ambilPenggunaSaatIni } from "@/lib/auth/pengguna";
import { berandaUntukPeran } from "@/lib/auth/menu";
import { FormulirGantiSandi } from "./formulir-ganti-sandi";

export const metadata = {
  title: "Ganti Kata Sandi — SiPANTAU",
};

/**
 * KP-6.1-07/08: halaman ini buntu — tidak ada tombol lewati, kembali,
 * atau navigasi apa pun (ditegakkan oleh app/(auth)/layout.tsx yang
 * memang tanpa sidebar/menu).
 */
export default async function HalamanGantiSandiWajib() {
  const { pengguna } = await ambilPenggunaSaatIni();

  // Sudah tidak wajib ganti sandi (mis. dibuka lewat tautan lama
  // setelah selesai) -> tidak ada alasan menahannya di sini.
  if (!pengguna.wajib_ganti_sandi) {
    redirect(berandaUntukPeran(pengguna.peran));
  }

  return <FormulirGantiSandi />;
}
