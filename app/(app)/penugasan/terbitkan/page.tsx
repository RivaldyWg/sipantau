import Link from "next/link";
import { redirect } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import { FormulirTerbitkan } from "./formulir";

/**
 * Terbitkan SPT — docs/20-modul-6.2-penugasan.md, KP-6.2-04.
 *
 * Penjaga peran berlapis, sengaja tidak bersandar pada satu lapis saja:
 *   1. Butir menu hanya dirender untuk Kanit (lib/auth/menu.ts)
 *   2. proxy.ts menolak rute ini untuk peran lain lewat RUTE_KHUSUS_PERAN
 *   3. Halaman ini memeriksa lagi (di bawah) — kalau lapis 2 kelak
 *      diubah keliru, halaman tetap tidak terbuka
 *   4. RLS insert `penugasan` mensyaratkan peran kanit + unit sendiri
 *   5. Server Action memeriksa sekali lagi sebelum menulis
 *
 * KP-6.1-19 menyebut penyembunyian tampilan saja tidak dianggap
 * pengamanan — lapis 1 memang bukan pengamanan, tiga lapis di
 * bawahnya yang menegakkan.
 */
export default async function HalamanTerbitkanSpt() {
  const { pengguna } = await wajibkanSudahSiap();

  if (pengguna.peran !== "kanit") {
    redirect("/penugasan");
  }

  const supabase = await klienServer();

  // Calon pelaksana dibatasi ke unit Kanit sendiri. RLS baca `users`
  // memang sudah membatasi Kanit ke unitnya, tetapi filter eksplisit
  // di sini membuat maksudnya terbaca dan tidak berubah diam-diam
  // kalau kebijakan baca users kelak dilonggarkan untuk keperluan lain.
  const { data: orang } = await supabase
    .from("users")
    .select("id, nama, nrp, pangkat, peran")
    .eq("unit_id", pengguna.unit_id ?? "")
    .eq("aktif", true)
    .order("nama")
    .returns<
      {
        id: string;
        nama: string;
        nrp: string;
        pangkat: string | null;
        peran: string;
      }[]
    >();

  const daftar = orang ?? [];

  // BR-34: pelaksana boleh Anggota, Panit, atau Kanit. Panit
  // Penanggung Jawab hanya dari yang berperan panit.
  const calonPanit = daftar.filter((o) => o.peran === "panit");
  const calonPelaksana = daftar.filter((o) =>
    ["anggota", "panit", "kanit"].includes(o.peran),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Terbitkan penugasan
          </h1>
          <p className="text-sm text-muted-foreground">
            Susun surat perintah tugas, tetapkan titik lokasi, dan tunjuk
            pelaksananya.
          </p>
        </div>
        <Link
          href="/penugasan"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Kembali
        </Link>
      </div>

      <FormulirTerbitkan
        calonPanit={calonPanit}
        calonPelaksana={calonPelaksana}
      />
    </div>
  );
}
