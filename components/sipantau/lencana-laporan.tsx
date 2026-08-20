import { cn } from "@/lib/utils";
import {
  KELAS_LENCANA_STATUS_LAPORAN,
  KELAS_LENCANA_STATUS_LOKASI,
  LABEL_STATUS_LAPORAN,
  LABEL_STATUS_LOKASI,
} from "@/lib/pelaporan/label";
import type { StatusLaporan, StatusLokasiLaporan } from "@/lib/supabase/types";

const DASAR =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export function LencanaStatusLaporan({
  status,
  className,
}: {
  status: StatusLaporan;
  className?: string;
}) {
  return (
    <span className={cn(DASAR, KELAS_LENCANA_STATUS_LAPORAN[status], className)}>
      {LABEL_STATUS_LAPORAN[status]}
    </span>
  );
}

/**
 * §6.3.4 aturan modul butir 2: hanya menyajikan fakta, tidak pernah
 * menyimpulkan pelanggaran — lencana ini netral secara sengaja, tidak
 * memakai warna merah/tanda seru untuk "di_luar_titik" atau
 * "tidak_terekam" seperti halnya lencana Lewat Batas pada Modul 6.2.
 */
export function LencanaStatusLokasi({
  status,
  className,
}: {
  status: StatusLokasiLaporan;
  className?: string;
}) {
  return (
    <span className={cn(DASAR, KELAS_LENCANA_STATUS_LOKASI[status], className)}>
      {LABEL_STATUS_LOKASI[status]}
    </span>
  );
}
