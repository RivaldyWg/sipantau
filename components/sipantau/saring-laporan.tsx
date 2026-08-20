import Link from "next/link";

import {
  LABEL_JENIS_LAPORAN,
  LABEL_STATUS_LAPORAN,
  LABEL_STATUS_LOKASI,
} from "@/lib/pelaporan/label";
import { cn } from "@/lib/utils";

/**
 * §6.3.5: "Penyaring: SPT, jenis laporan, status laporan, status
 * lokasi, rentang tanggal, pelapor. Pencarian menyisir uraian dan
 * kendala dalam lingkup data pengguna."
 *
 * Sama seperti SaringPenugasan (Modul 6.2): seluruhnya menulis ke URL
 * lewat form GET / tautan biasa, bukan state klien, supaya Server
 * Component tetap murni dan hasil saringnya bisa dibagikan lewat URL.
 */

export interface NilaiSaringLaporan {
  cari: string;
  spt: string;
  jenis: string;
  status: string;
  statusLokasi: string;
  dari: string;
  sampai: string;
  pelapor: string;
}

export interface PilihanSaringLaporan {
  spt: { id: string; label: string }[];
  pelapor: { id: string; nama: string }[];
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

function bangunTautan(
  dasar: string,
  nilai: NilaiSaringLaporan,
  ubah: Partial<NilaiSaringLaporan>,
): string {
  const gabung = { ...nilai, ...ubah };
  const p = new URLSearchParams();
  if (gabung.cari) p.set("cari", gabung.cari);
  if (gabung.spt) p.set("spt", gabung.spt);
  if (gabung.jenis) p.set("jenis", gabung.jenis);
  if (gabung.status) p.set("status", gabung.status);
  if (gabung.statusLokasi) p.set("status_lokasi", gabung.statusLokasi);
  if (gabung.dari) p.set("dari", gabung.dari);
  if (gabung.sampai) p.set("sampai", gabung.sampai);
  if (gabung.pelapor) p.set("pelapor", gabung.pelapor);
  const s = p.toString();
  return s ? `${dasar}?${s}` : dasar;
}

export function SaringLaporan({
  dasar,
  nilai,
  pilihan,
  tampilkanPelapor,
}: {
  dasar: string;
  nilai: NilaiSaringLaporan;
  pilihan: PilihanSaringLaporan;
  /** Anggota tidak perlu menyaring pelapor — laporan yang tampil sudah miliknya sendiri. */
  tampilkanPelapor: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          name="cari"
          defaultValue={nilai.cari}
          placeholder="Cari uraian atau kendala"
          className={cn(KELAS_INPUT, "lg:col-span-2")}
        />

        <select name="spt" defaultValue={nilai.spt} className={KELAS_INPUT}>
          <option value="">Semua SPT</option>
          {pilihan.spt.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <select name="jenis" defaultValue={nilai.jenis} className={KELAS_INPUT}>
          <option value="">Semua jenis</option>
          {Object.entries(LABEL_JENIS_LAPORAN).map(([n, l]) => (
            <option key={n} value={n}>
              {l}
            </option>
          ))}
        </select>

        <select name="status" defaultValue={nilai.status} className={KELAS_INPUT}>
          <option value="">Semua status</option>
          {Object.entries(LABEL_STATUS_LAPORAN).map(([n, l]) => (
            <option key={n} value={n}>
              {l}
            </option>
          ))}
        </select>

        <select
          name="status_lokasi"
          defaultValue={nilai.statusLokasi}
          className={KELAS_INPUT}
        >
          <option value="">Semua status lokasi</option>
          {Object.entries(LABEL_STATUS_LOKASI).map(([n, l]) => (
            <option key={n} value={n}>
              {l}
            </option>
          ))}
        </select>

        {tampilkanPelapor && (
          <select name="pelapor" defaultValue={nilai.pelapor} className={KELAS_INPUT}>
            <option value="">Semua pelapor</option>
            {pilihan.pelapor.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
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
    </div>
  );
}

export { bangunTautan };
