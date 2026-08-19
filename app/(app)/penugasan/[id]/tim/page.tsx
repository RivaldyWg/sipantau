import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type { PenugasanRow } from "@/lib/supabase/types";
import { PanelTim } from "./panel-tim";

/**
 * Kelola Tim — §6.2.5, BR-27, BR-30, KP-6.2-26.
 *
 * Dipisah dari halaman Sunting karena pencabutan menuntut alasan per
 * orang dan tidak pernah berupa penghapusan baris (BR-27) — bentuk
 * antarmukanya beda sama sekali dari formulir isian biasa.
 *
 * Empat syarat minimum ditegakkan PEMICU di database
 * (trg_jaga_pelaksana_anggota_terakhir, trg_jaga_panit_terakhir).
 * Halaman ini hanya menerjemahkan pesannya; jangan menyalin aturannya
 * ke sini sebagai penghalang kedua.
 */

interface ParamHalaman {
  params: Promise<{ id: string }>;
}

interface BarisTim {
  id: string;
  dicabut_pada: string | null;
  alasan_pencabutan: string | null;
  orang: {
    id: string;
    nama: string;
    nrp: string;
    pangkat: string | null;
    peran: string;
    aktif: boolean;
  } | null;
}

export default async function HalamanKelolaTim({ params }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const { id } = await params;

  const berbentukUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!berbentukUuid) notFound();

  const supabase = await klienServer();
  const { data: spt } = await supabase
    .from("penugasan")
    .select("id, unit_id, status, nomor_spt, judul")
    .eq("id", id)
    .maybeSingle<Pick<PenugasanRow, "id" | "unit_id" | "status" | "nomor_spt" | "judul">>();

  if (!spt) notFound();
  if (pengguna.peran !== "kanit" || pengguna.unit_id !== spt.unit_id)
    redirect(`/penugasan/${id}`);
  if (spt.status === "selesai" || spt.status === "dibatalkan")
    redirect(`/penugasan/${id}`);

  const [pelaksana, panit, calon] = await Promise.all([
    supabase
      .from("penugasan_pelaksana")
      .select(
        "id, dicabut_pada, alasan_pencabutan, orang:pelaksana_id(id, nama, nrp, pangkat, peran, aktif)",
      )
      .eq("penugasan_id", id)
      .order("urutan")
      .returns<BarisTim[]>(),
    supabase
      .from("penugasan_panit")
      .select(
        "id, dicabut_pada, alasan_pencabutan, orang:panit_id(id, nama, nrp, pangkat, peran, aktif)",
      )
      .eq("penugasan_id", id)
      .returns<BarisTim[]>(),
    supabase
      .from("users")
      .select("id, nama, nrp, pangkat, peran")
      .eq("unit_id", pengguna.unit_id ?? "")
      .eq("aktif", true)
      .order("nama")
      .returns<
        { id: string; nama: string; nrp: string; pangkat: string | null; peran: string }[]
      >(),
  ]);

  const semuaCalon = calon.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kelola tim</h1>
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

      <div className="rounded-lg border border-border bg-secondary p-3 text-xs text-secondary-foreground">
        Pencabutan tidak menghapus laporan, foto, maupun rute yang sudah
        terekam, dan tidak menghapus baris penghubungnya. Selama penugasan
        hidup, sekurang-kurangnya satu Panit Penanggung Jawab aktif dan satu
        pelaksana berperan Anggota wajib dipertahankan.
      </div>

      <PanelTim
        id={id}
        peranTim="panit"
        judul="Panit Penanggung Jawab"
        anggota={panit.data ?? []}
        calon={semuaCalon.filter((o) => o.peran === "panit")}
      />

      <PanelTim
        id={id}
        peranTim="pelaksana"
        judul="Pelaksana"
        anggota={pelaksana.data ?? []}
        calon={semuaCalon.filter((o) =>
          ["anggota", "panit", "kanit"].includes(o.peran),
        )}
      />
    </div>
  );
}
