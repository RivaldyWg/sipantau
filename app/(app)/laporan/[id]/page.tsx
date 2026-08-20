import Link from "next/link";
import { notFound } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import { LencanaStatusLaporan, LencanaStatusLokasi } from "@/components/sipantau/lencana-laporan";
import {
  LABEL_ALASAN_LOKASI,
  LABEL_JENIS_LAPORAN,
  LABEL_STATUS_KEGIATAN,
  jarakRingkas,
  waktuLaporan,
} from "@/lib/pelaporan/label";
import { koordinat } from "@/lib/penugasan/label";
import type {
  CatatanLaporanRow,
  LaporanHarianRow,
  LaporanVersiRow,
} from "@/lib/supabase/types";
import { PanelLaporan } from "./panel-laporan";

/**
 * Rincian Laporan — KP-6.3-57 (lingkup baca), §5.19 (catatan),
 * KP-6.3-75 s/d 78 (riwayat versi).
 *
 * KEAMANAN: sama seperti rincian SPT (Langkah 6) — RLS memotong baris
 * di server, jadi laporan di luar kewenangan pulang sebagai nol baris,
 * sama seperti id yang tidak ada. TIDAK membedakan pesan galat.
 */

interface ParamHalaman {
  params: Promise<{ id: string }>;
}

interface BarisCatatanTampil extends CatatanLaporanRow {
  peninjau_nama: string | null;
}

export default async function HalamanRincianLaporan({ params }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const { id } = await params;

  const berbentukUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!berbentukUuid) notFound();

  const supabase = await klienServer();

  const { data: laporan } = await supabase
    .from("laporan_harian")
    .select("*")
    .eq("id", id)
    .maybeSingle<LaporanHarianRow>();

  if (!laporan) notFound();

  const [spt, pelapor, lokasi, lokasiTerdekat, catatanMentah, versi] = await Promise.all([
    supabase
      .from("penugasan")
      .select("id, nomor_spt, judul, unit_id, status")
      .eq("id", laporan.penugasan_id)
      .maybeSingle<{
        id: string;
        nomor_spt: string | null;
        judul: string;
        unit_id: string;
        status: string;
      }>(),
    supabase
      .from("users")
      .select("nama, nrp, pangkat")
      .eq("id", laporan.pelapor_id)
      .maybeSingle<{ nama: string; nrp: string; pangkat: string | null }>(),
    laporan.lokasi_id
      ? supabase
          .from("penugasan_lokasi")
          .select("nama")
          .eq("id", laporan.lokasi_id)
          .maybeSingle<{ nama: string }>()
      : Promise.resolve({ data: null }),
    laporan.lokasi_id_terdekat
      ? supabase
          .from("penugasan_lokasi")
          .select("nama")
          .eq("id", laporan.lokasi_id_terdekat)
          .maybeSingle<{ nama: string }>()
      : Promise.resolve({ data: null }),
    supabase
      .from("catatan_laporan")
      .select("*")
      .eq("laporan_id", id)
      .order("dibuat_pada")
      .returns<CatatanLaporanRow[]>(),
    supabase
      .from("laporan_versi")
      .select("*")
      .eq("laporan_id", id)
      .order("dibuat_pada", { ascending: false })
      .returns<LaporanVersiRow[]>(),
  ]);

  const daftarCatatan = catatanMentah.data ?? [];
  const idPeninjau = [...new Set(daftarCatatan.map((c) => c.peninjau_id))];
  const { data: peninjauData } = idPeninjau.length
    ? await supabase
        .from("users")
        .select("id, nama")
        .in("id", idPeninjau)
        .returns<{ id: string; nama: string }[]>()
    : { data: [] as { id: string; nama: string }[] };
  const petaPeninjau = new Map((peninjauData ?? []).map((p) => [p.id, p.nama]));

  const catatan: BarisCatatanTampil[] = daftarCatatan.map((c) => ({
    ...c,
    peninjau_nama: petaPeninjau.get(c.peninjau_id) ?? null,
  }));

  const akuPelapor = pengguna.id === laporan.pelapor_id;
  const akuKanitPemilik =
    pengguna.peran === "kanit" && pengguna.unit_id === spt.data?.unit_id;
  const bolehTinjau =
    akuKanitPemilik ||
    pengguna.peran === "kasubdit" ||
    (pengguna.peran === "panit" && !akuPelapor);
  const terkunci =
    laporan.status_laporan === "disetujui" || laporan.status_laporan === "ditarik";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {LABEL_JENIS_LAPORAN[laporan.jenis]}
            </span>
            <LencanaStatusLaporan status={laporan.status_laporan} />
            {laporan.status_lokasi && (
              <LencanaStatusLokasi status={laporan.status_lokasi} />
            )}
            {laporan.diterima_terlambat && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                Diterima terlambat
              </span>
            )}
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {spt.data?.judul ?? "Penugasan"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {spt.data?.nomor_spt ?? "Belum bernomor"} · {pelapor.data?.nama ?? "—"} ·{" "}
            {waktuLaporan(laporan.direkam_pada)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/penugasan/${laporan.penugasan_id}`}
            className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Lihat SPT
          </Link>
          <Link
            href="/laporan"
            className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Kembali
          </Link>
        </div>
      </div>

      {laporan.status_laporan === "ditarik" && laporan.alasan_penarikan && (
        <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-secondary-foreground">
          <strong className="font-semibold">Laporan ditarik.</strong>{" "}
          {laporan.alasan_penarikan}
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Butir label="Status kegiatan">
            {LABEL_STATUS_KEGIATAN[laporan.status_kegiatan]}
          </Butir>
          <Butir label="Kendala">{laporan.kendala ?? "—"}</Butir>
        </dl>

        <div className="mt-4 border-t border-border pt-4">
          <h2 className="text-xs font-medium text-muted-foreground">Uraian kegiatan</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground">
            {laporan.uraian}
          </p>
          {laporan.jumlah_suntingan > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Disunting {laporan.jumlah_suntingan}×, terakhir {waktuLaporan(laporan.disunting_pada)}
              {" — "}
              <RiwayatVersiTautan
                versi={versi.data ?? []}
                sumber="laporan"
              />
            </p>
          )}
        </div>
      </section>

      {/* §6.3.4 butir 2: tiga fakta lokasi berdampingan, tidak ada kesimpulan */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Keterangan lokasi
        </h2>
        {laporan.status_lokasi === "tidak_terekam" ? (
          <div className="text-sm text-foreground">
            <p>Koordinat tidak berhasil direkam.</p>
            {laporan.alasan_lokasi && (
              <p className="mt-1 text-muted-foreground">
                Alasan: {LABEL_ALASAN_LOKASI[laporan.alasan_lokasi]}
                {laporan.alasan_lokasi === "lainnya" && laporan.alasan_lokasi_lainnya
                  ? ` — ${laporan.alasan_lokasi_lainnya}`
                  : ""}
              </p>
            )}
          </div>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <Butir label="Koordinat">
              {koordinat(laporan.lokasi_lat, laporan.lokasi_lng)}
              {laporan.akurasi_meter !== null &&
                ` (± ${Math.round(laporan.akurasi_meter)} m)`}
            </Butir>
            <Butir label="Titik terdekat (hitungan sistem)">
              {lokasiTerdekat.data?.nama ?? "—"}
              {laporan.jarak_meter !== null &&
                ` · ${jarakRingkas(laporan.jarak_meter)}`}
            </Butir>
            {lokasi.data && (
              <Butir label="Titik pilihan pelapor">{lokasi.data.nama}</Butir>
            )}
            {laporan.keterangan_lokasi && (
              <Butir label="Keterangan dari pelapor">
                {laporan.keterangan_lokasi}
              </Butir>
            )}
          </dl>
        )}
      </section>

      <PanelLaporan
        laporan={laporan}
        catatan={catatan}
        bolehTinjau={bolehTinjau}
        bolehSetujui={akuKanitPemilik}
        bolehTarik={akuPelapor && !terkunci}
        bolehSunting={akuPelapor && !terkunci}
      />
    </div>
  );
}

function Butir({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function RiwayatVersiTautan({
  versi,
  sumber,
}: {
  versi: LaporanVersiRow[];
  sumber: "laporan" | "catatan";
}) {
  const relevan = versi.filter((v) =>
    sumber === "laporan" ? v.laporan_id !== null : v.catatan_id !== null,
  );
  if (relevan.length === 0) return null;

  return (
    <details className="mt-1 inline-block">
      <summary className="cursor-pointer text-xs text-primary underline underline-offset-2">
        Lihat {relevan.length} versi sebelumnya
      </summary>
      <ol className="mt-2 flex flex-col gap-2 border-l-2 border-border pl-3">
        {relevan.map((v) => (
          <li key={v.id} className="text-xs">
            <p className="text-muted-foreground">{waktuLaporan(v.dibuat_pada)}</p>
            <p className="mt-0.5 whitespace-pre-line text-foreground">{v.isi_lama}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}
