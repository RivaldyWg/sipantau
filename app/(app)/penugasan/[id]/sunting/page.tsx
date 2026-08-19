import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type { PenugasanRow } from "@/lib/supabase/types";
import { FormulirSunting } from "./formulir";

/**
 * Sunting keterangan SPT — KP-6.2-38, KP-6.2-07, KP-6.2-43.
 *
 * KP-6.2-38 menyebut Kanit dapat menyunting judul, objek, sasaran,
 * uraian tugas, jenis kegiatan, nomor LP, sumber informasi, prioritas,
 * dasar penugasan, titik lokasi, dan susunan tim.
 *
 * Halaman ini menggarap KETERANGANNYA saja. Dasar penugasan dan titik
 * lokasi disunting lewat halaman ini juga (bagian bawah formulir),
 * sedangkan susunan tim punya halamannya sendiri (Kelola Tim) karena
 * pencabutan menuntut alasan per orang.
 */

interface ParamHalaman {
  params: Promise<{ id: string }>;
}

export default async function HalamanSuntingSpt({ params }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const { id } = await params;

  const berbentukUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!berbentukUuid) notFound();

  const supabase = await klienServer();
  const { data: spt } = await supabase
    .from("penugasan")
    .select("*")
    .eq("id", id)
    .maybeSingle<PenugasanRow>();

  if (!spt) notFound();

  if (pengguna.peran !== "kanit" || pengguna.unit_id !== spt.unit_id) {
    redirect(`/penugasan/${id}`);
  }

  // KP-6.2-43: selesai dan dibatalkan mengunci seluruh kolom dan tidak
  // menampilkan tombol sunting sama sekali.
  if (spt.status === "selesai" || spt.status === "dibatalkan") {
    redirect(`/penugasan/${id}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Sunting penugasan
          </h1>
          <p className="text-sm text-muted-foreground">
            {spt.nomor_spt ?? "Belum bernomor"} — {spt.judul}
          </p>
        </div>
        <Link
          href={`/penugasan/${id}`}
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Kembali
        </Link>
      </div>

      {spt.status !== "draf" && (
        <div className="rounded-lg border border-border bg-secondary p-3 text-xs text-secondary-foreground">
          Penugasan ini sudah terbit. Nomor SPT, satuan, dan tanggal mulai
          terkunci dan tidak dapat diubah oleh siapa pun. Perubahan lain
          tercatat pada jejak audit.
        </div>
      )}

      <FormulirSunting id={id} spt={spt} />
    </div>
  );
}
