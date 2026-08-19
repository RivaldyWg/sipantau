import Link from "next/link";

import {
  LABEL_PRIORITAS,
  LABEL_STATUS,
  SARINGAN_STATUS,
} from "@/lib/penugasan/label";
import { cn } from "@/lib/utils";

/**
 * Bilah penyaring daftar penugasan — §6.2.5.
 *
 * "Bagian atas memuat judul yang berbeda tiap peran, tombol tindakan,
 *  kotak pencarian, tiga tombol cepat (Lewat Batas, Bermasalah, Belum
 *  Ada Laporan), dan baris penyaring."
 *
 * "Penyaring: status, prioritas, rentang tanggal, Panit Penanggung
 *  Jawab (Kanit dan Kasubdit saja), unit (Kasubdit saja)."
 *
 * Seluruhnya menulis ke URL, bukan ke state klien — komponen ini
 * Server Component dan halaman pemanggilnya tetap dapat dibagikan
 * tautannya. Kotak cari dan rentang tanggal berupa satu form GET;
 * tombol cepat dan cip status berupa tautan biasa.
 *
 * "Belum Ada Laporan" SENGAJA belum aktif: tabel laporan_harian baru
 * lahir Langkah 7. Tombolnya dirender nonaktif dengan keterangan,
 * BUKAN disembunyikan — ketiadaannya sementara dan bersyarat data,
 * bukan bersyarat kewenangan, sehingga BR-11 tidak berlaku di sini.
 */

export interface NilaiSaring {
  cari: string;
  status: string;
  prioritas: string;
  dari: string;
  sampai: string;
  panit: string;
  unit: string;
  cepat: string;
}

export interface PilihanSaring {
  panit: { id: string; nama: string }[];
  unit: { id: string; nama: string }[];
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

function bangunTautan(
  dasar: string,
  nilai: NilaiSaring,
  ubah: Partial<NilaiSaring>,
): string {
  const gabung = { ...nilai, ...ubah };
  const p = new URLSearchParams();
  if (gabung.cari) p.set("cari", gabung.cari);
  if (gabung.status && gabung.status !== "semua") p.set("status", gabung.status);
  if (gabung.prioritas) p.set("prioritas", gabung.prioritas);
  if (gabung.dari) p.set("dari", gabung.dari);
  if (gabung.sampai) p.set("sampai", gabung.sampai);
  if (gabung.panit) p.set("panit", gabung.panit);
  if (gabung.unit) p.set("unit", gabung.unit);
  if (gabung.cepat) p.set("cepat", gabung.cepat);
  const s = p.toString();
  return s ? `${dasar}?${s}` : dasar;
}

export function SaringPenugasan({
  dasar,
  nilai,
  pilihan,
  peran,
}: {
  dasar: string;
  nilai: NilaiSaring;
  pilihan: PilihanSaring;
  peran: string;
}) {
  const bolehSaringPanit = peran === "kanit" || peran === "kasubdit";
  const bolehSaringUnit = peran === "kasubdit";

  return (
    <div className="flex flex-col gap-3">
      {/* Tiga tombol cepat */}
      <div className="flex flex-wrap gap-2">
        <TombolCepat
          aktif={nilai.cepat === "lewat_batas"}
          href={bangunTautan(dasar, nilai, {
            cepat: nilai.cepat === "lewat_batas" ? "" : "lewat_batas",
          })}
          warna="merah"
        >
          Lewat Batas
        </TombolCepat>

        <TombolCepat
          aktif={nilai.cepat === "bermasalah"}
          href={bangunTautan(dasar, nilai, {
            cepat: nilai.cepat === "bermasalah" ? "" : "bermasalah",
          })}
          warna="kuning"
        >
          Bermasalah
        </TombolCepat>

        <span
          title="Hadir setelah tabel laporan dibangun pada Langkah 7"
          className="inline-flex cursor-not-allowed items-center rounded-full border border-dashed border-input px-3 py-1 text-xs text-[var(--ink-3)]"
        >
          Belum Ada Laporan
        </span>
      </div>

      {/* Cari + rentang tanggal + prioritas + panit + unit */}
      <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {nilai.status && nilai.status !== "semua" && (
          <input type="hidden" name="status" value={nilai.status} />
        )}
        {nilai.cepat && <input type="hidden" name="cepat" value={nilai.cepat} />}

        <input
          type="search"
          name="cari"
          defaultValue={nilai.cari}
          placeholder="Cari nomor, judul, objek, sasaran"
          className={cn(KELAS_INPUT, "lg:col-span-2")}
        />

        <select name="prioritas" defaultValue={nilai.prioritas} className={KELAS_INPUT}>
          <option value="">Semua prioritas</option>
          {Object.entries(LABEL_PRIORITAS).map(([n, l]) => (
            <option key={n} value={n}>
              {l}
            </option>
          ))}
        </select>

        {bolehSaringPanit && (
          <select name="panit" defaultValue={nilai.panit} className={KELAS_INPUT}>
            <option value="">Semua Panit</option>
            {pilihan.panit.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        )}

        {bolehSaringUnit && (
          <select name="unit" defaultValue={nilai.unit} className={KELAS_INPUT}>
            <option value="">Semua unit</option>
            {pilihan.unit.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">Dari</span>
          <input type="date" name="dari" defaultValue={nilai.dari} className={KELAS_INPUT} />
        </label>

        <label className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">Sampai</span>
          <input
            type="date"
            name="sampai"
            defaultValue={nilai.sampai}
            className={KELAS_INPUT}
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-10 flex-1 rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Terapkan
          </button>
          <Link
            href={dasar}
            className="inline-flex h-10 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            Bersihkan
          </Link>
        </div>
      </form>

      {/* Cip status */}
      <div className="flex flex-wrap gap-2">
        {SARINGAN_STATUS.map((f) => (
          <Link
            key={f}
            href={bangunTautan(dasar, nilai, { status: f })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              (nilai.status || "semua") === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            {f === "semua" ? "Semua" : LABEL_STATUS[f]}
          </Link>
        ))}
      </div>
    </div>
  );
}

function TombolCepat({
  aktif,
  href,
  warna,
  children,
}: {
  aktif: boolean;
  href: string;
  warna: "merah" | "kuning";
  children: React.ReactNode;
}) {
  const kelasAktif =
    warna === "merah"
      ? "border-[var(--red)] bg-[var(--red)] text-white"
      : "border-[var(--amber)] bg-[var(--amber)] text-white";
  const kelasDiam =
    warna === "merah"
      ? "border-[var(--red)] bg-[var(--red-bg)] text-[var(--red)]"
      : "border-[var(--amber)] bg-[var(--amber-bg)] text-[var(--amber)]";

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        aktif ? kelasAktif : kelasDiam,
      )}
    >
      {children}
    </Link>
  );
}
