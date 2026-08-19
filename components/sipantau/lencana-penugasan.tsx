import { cn } from "@/lib/utils";
import {
  KELAS_LENCANA_PRIORITAS,
  KELAS_LENCANA_STATUS,
  LABEL_PRIORITAS,
  LABEL_STATUS,
} from "@/lib/penugasan/label";
import type {
  PrioritasPenugasan,
  StatusPenugasan,
} from "@/lib/supabase/types";

const DASAR =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize";

export function LencanaStatus({
  status,
  className,
}: {
  status: StatusPenugasan;
  className?: string;
}) {
  return (
    <span className={cn(DASAR, KELAS_LENCANA_STATUS[status], className)}>
      {LABEL_STATUS[status]}
    </span>
  );
}

export function LencanaPrioritas({
  prioritas,
  className,
}: {
  prioritas: PrioritasPenugasan;
  className?: string;
}) {
  // Prioritas normal tidak diberi lencana supaya yang penting/urgent
  // benar-benar menonjol — kalau semua kartu berlencana, tidak ada
  // yang menonjol.
  if (prioritas === "normal") return null;

  return (
    <span className={cn(DASAR, KELAS_LENCANA_PRIORITAS[prioritas], className)}>
      {LABEL_PRIORITAS[prioritas]}
    </span>
  );
}

/**
 * Penanda Lewat Batas — bersandar pada kolom turunan `lewat_batas` dan
 * `hari_terlampaui` dari tampilan penugasan_tampil, BUKAN dihitung
 * ulang di sini. Menghitung ulang di klien akan memakai zona waktu
 * peramban dan bisa berbeda satu hari dari dasar perhitungan server
 * (Asia/Jakarta, migrasi 0014).
 */
export function PenandaLewatBatas({
  lewatBatas,
  hariTerlampaui,
  className,
}: {
  lewatBatas: boolean | null;
  hariTerlampaui: number | null;
  className?: string;
}) {
  if (!lewatBatas) return null;

  const hari = hariTerlampaui ?? 0;
  const keterangan =
    hari > 0 ? `Lewat batas ${hari} hari` : "Lewat batas";

  return (
    <span
      className={cn(
        DASAR,
        "bg-[var(--red-bg)] font-semibold text-[var(--red)]",
        className,
      )}
    >
      {keterangan}
    </span>
  );
}
