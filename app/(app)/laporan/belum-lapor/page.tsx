import Link from "next/link";
import { redirect } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type { BelumLaporRow } from "@/lib/supabase/types";

/**
 * Belum Melapor — KP-6.3-51 s/d 56.
 *
 * Membaca view v_belum_lapor (migrasi 0017, security_invoker=ON per
 * koreksi 01-koreksi.md I.2). RLS tabel dasarnya sudah menyaring
 * lingkup: Kanit lihat unitnya, Kasubdit lihat semua. TIDAK ADA filter
 * tambahan di kueri ini.
 *
 * KP-6.3-53: TIDAK ADA kalimat yang menyatakan lalai, malas, atau
 * tidak bekerja — hanya daftar fakta "belum mengirim laporan hari
 * ini", dan tidak ada tombol yang mengunci fungsi apa pun akibat
 * penanda ini.
 */
export default async function HalamanBelumMelapor() {
  const { pengguna } = await wajibkanSudahSiap();

  if (pengguna.peran !== "kanit" && pengguna.peran !== "kasubdit") {
    redirect("/laporan");
  }

  const supabase = await klienServer();

  const { data, error } = await supabase
    .from("v_belum_lapor")
    .select("*")
    .returns<BelumLaporRow[]>();

  const daftar = data ?? [];
  const idPelaksana = [...new Set(daftar.map((d) => d.pelaksana_id))];
  const { data: orang } = idPelaksana.length
    ? await supabase
        .from("users")
        .select("id, nama, nrp, pangkat")
        .in("id", idPelaksana)
        .returns<{ id: string; nama: string; nrp: string; pangkat: string | null }[]>()
    : { data: [] as { id: string; nama: string; nrp: string; pangkat: string | null }[] };
  const petaOrang = new Map((orang ?? []).map((o) => [o.id, o]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Belum Melapor</h1>
          <p className="text-sm text-muted-foreground">
            Pelaksana yang belum mengirim laporan hari ini, pada penugasan yang
            mewajibkan lapor harian.
          </p>
        </div>
        <Link
          href="/laporan"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Kembali
        </Link>
      </div>

      {error ? (
        <Kotak judul="Daftar tidak dapat dimuat" teks="Muat ulang halaman." />
      ) : daftar.length === 0 ? (
        <Kotak
          judul="Semua sudah melapor"
          teks="Tidak ada pelaksana yang tertunda laporannya hari ini."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {daftar.map((d, i) => {
            const o = petaOrang.get(d.pelaksana_id);
            return (
              <li
                key={`${d.penugasan_id}-${d.pelaksana_id}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {o?.nama ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o?.pangkat ?? "—"} · {o?.nrp ?? "—"}
                  </p>
                </div>
                <Link
                  href={`/penugasan/${d.penugasan_id}`}
                  className="shrink-0 text-xs font-medium text-primary underline underline-offset-2"
                >
                  {d.nomor_spt ?? "Lihat SPT"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Daftar ini dihitung ulang setiap kali halaman dibuka dan tidak
        menghentikan atau mengunci fungsi apa pun bagi pelaksana yang
        tercantum.
      </p>
    </div>
  );
}

function Kotak({ judul, teks }: { judul: string; teks: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{teks}</p>
    </div>
  );
}
