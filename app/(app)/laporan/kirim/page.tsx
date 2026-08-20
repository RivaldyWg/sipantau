import Link from "next/link";
import { redirect } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import { FormulirKirimLaporan } from "./formulir";

/**
 * Kirim Laporan — §6.3.2 (kebutuhan pelaksana), KP-6.3-01 s/d 25.
 *
 * Diakses lewat /laporan/kirim?penugasan=<id>, ditautkan dari halaman
 * rincian SPT (tombol "Kirim Laporan" pada Modul 6.2, ditambahkan
 * sebagai tautan sederhana, bukan Server Action — lihat catatan di
 * halaman rincian SPT bila ditambahkan belakangan).
 *
 * KP-6.3-01/04: SPT yang tidak lagi menerima laporan (selesai/
 * dibatalkan) atau yang pengguna bukan pelaksana aktifnya TIDAK
 * muncul sebagai pilihan — di sini ditegakkan dengan redirect bila
 * parameter penugasan mengarah ke SPT yang tidak valid untuk pengguna
 * ini, dan dengan daftar pilihan (bila parameter kosong) yang hanya
 * berisi SPT yang lolos kedua syarat itu.
 */

interface ParamHalaman {
  searchParams: Promise<{ penugasan?: string }>;
}

export default async function HalamanKirimLaporan({ searchParams }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const sp = await searchParams;
  const supabase = await klienServer();

  // KP-6.3-01: hanya SPT tempat pengguna pelaksana AKTIF dan berstatus
  // hidup yang boleh dipilih. RLS penugasan_pelaksana + kueri status
  // di sini adalah lapisan tampilan; trg_periksa_pelapor_aktif
  // (migrasi 0017) tetap penegak utamanya di database.
  const { data: spt } = await supabase
    .from("penugasan")
    .select("id, nomor_spt, judul, status, tanggal_batas")
    .in("status", ["baru", "berjalan", "bermasalah"])
    .in(
      "id",
      (
        await supabase
          .from("penugasan_pelaksana")
          .select("penugasan_id")
          .eq("pelaksana_id", pengguna.id)
          .is("dicabut_pada", null)
          .returns<{ penugasan_id: string }[]>()
      ).data?.map((r) => r.penugasan_id) ?? [],
    )
    .order("dibuat_pada", { ascending: false })
    .returns<
      { id: string; nomor_spt: string | null; judul: string; status: string; tanggal_batas: string | null }[]
    >();

  const daftarSpt = spt ?? [];
  const penugasanId = sp.penugasan;
  const sptDipilih = penugasanId
    ? daftarSpt.find((s) => s.id === penugasanId)
    : undefined;

  if (penugasanId && !sptDipilih) {
    // SPT diminta lewat URL tetapi tidak ada dalam daftar yang sah
    // (bukan pelaksana aktif, atau SPT tidak lagi hidup) — kembali ke
    // pemilihan, bukan galat mentah.
    redirect("/laporan/kirim");
  }

  if (daftarSpt.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <h1 className="text-sm font-semibold text-foreground">
          Tidak ada penugasan aktif
        </h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Anda belum menjadi pelaksana aktif pada penugasan mana pun yang masih
          menerima laporan.
        </p>
        <Link
          href="/penugasan"
          className="mt-3 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Lihat penugasan saya
        </Link>
      </div>
    );
  }

  const target = sptDipilih ?? daftarSpt[0];

  const { data: lokasi } = await supabase
    .from("penugasan_lokasi")
    .select("id, nama, lat, lng, radius_meter")
    .eq("penugasan_id", target.id)
    .order("urutan")
    .returns<
      { id: string; nama: string; lat: number | null; lng: number | null; radius_meter: number | null }[]
    >();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kirim Laporan</h1>
          <p className="text-sm text-muted-foreground">
            {target.nomor_spt ?? "Belum bernomor"} — {target.judul}
          </p>
        </div>
        <Link
          href={`/penugasan/${target.id}`}
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Lihat SPT
        </Link>
      </div>

      {daftarSpt.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {daftarSpt.map((s) => (
            <Link
              key={s.id}
              href={`/laporan/kirim?penugasan=${s.id}`}
              className={
                s.id === target.id
                  ? "rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  : "rounded-full border border-input bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
              }
            >
              {s.nomor_spt ?? s.judul}
            </Link>
          ))}
        </div>
      )}

      <FormulirKirimLaporan
        penugasanId={target.id}
        titikLokasi={lokasi ?? []}
        lewatBatas={
          Boolean(target.tanggal_batas) &&
          new Date(target.tanggal_batas as string) < new Date()
        }
      />
    </div>
  );
}
