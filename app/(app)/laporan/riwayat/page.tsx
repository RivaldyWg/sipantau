import Link from "next/link";
import { redirect } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import { LencanaStatusLaporan } from "@/components/sipantau/lencana-laporan";
import { LABEL_JENIS_LAPORAN, waktuLaporan } from "@/lib/pelaporan/label";
import type { LaporanHarianRow } from "@/lib/supabase/types";

/**
 * Riwayat Laporan — KP-6.3-59: khusus Anggota, memuat SELURUH
 * laporannya sendiri termasuk yang ditarik. RLS "laporan_baca_sesuai_
 * lingkup" sudah membatasi ke pelapor_id = diri sendiri untuk peran
 * anggota; halaman ini menambah `redirect` supaya peran lain yang
 * datang lewat tautan langsung diarahkan ke /laporan biasa, bukan
 * melihat halaman kosong yang membingungkan.
 */
export default async function HalamanRiwayatLaporan() {
  const { pengguna } = await wajibkanSudahSiap();

  if (pengguna.peran !== "anggota") {
    redirect("/laporan");
  }

  const supabase = await klienServer();

  const { data, error } = await supabase
    .from("laporan_harian")
    .select("id, penugasan_id, jenis, uraian, status_laporan, direkam_pada")
    .eq("pelapor_id", pengguna.id)
    .order("direkam_pada", { ascending: false })
    .returns<
      Pick<
        LaporanHarianRow,
        "id" | "penugasan_id" | "jenis" | "uraian" | "status_laporan" | "direkam_pada"
      >[]
    >();

  const daftar = data ?? [];
  const idSpt = [...new Set(daftar.map((l) => l.penugasan_id))];
  const { data: spt } = idSpt.length
    ? await supabase
        .from("penugasan")
        .select("id, nomor_spt, judul")
        .in("id", idSpt)
        .returns<{ id: string; nomor_spt: string | null; judul: string }[]>()
    : { data: [] as { id: string; nomor_spt: string | null; judul: string }[] };
  const petaSpt = new Map((spt ?? []).map((s) => [s.id, s]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Riwayat Laporan</h1>
          <p className="text-sm text-muted-foreground">
            Seluruh laporan yang pernah Anda kirim, termasuk yang ditarik.
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
        <Kotak judul="Riwayat tidak dapat dimuat" teks="Muat ulang halaman." />
      ) : daftar.length === 0 ? (
        <Kotak
          judul="Belum ada laporan"
          teks="Laporan yang Anda kirim akan tampil di sini."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {daftar.map((l) => {
            const s = petaSpt.get(l.penugasan_id);
            return (
              <li key={l.id}>
                <Link
                  href={`/laporan/${l.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {LABEL_JENIS_LAPORAN[l.jenis]}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s?.nomor_spt ?? "Belum bernomor"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-foreground">
                      {l.uraian}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {waktuLaporan(l.direkam_pada)}
                    </p>
                  </div>
                  <LencanaStatusLaporan status={l.status_laporan} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
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
