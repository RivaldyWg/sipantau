import Link from "next/link";

import {
  LencanaPrioritas,
  LencanaStatus,
  PenandaLewatBatas,
} from "@/components/sipantau/lencana-penugasan";
import { tanggalIndonesia, umurHari } from "@/lib/penugasan/label";
import { inisialNama } from "@/lib/utils/inisial";
import type { PenugasanTampilRow } from "@/lib/supabase/types";

/**
 * Kartu SPT — §6.2.5: "Kartu SPT memuat: nomor SPT, judul, lencana
 * prioritas, lencana status, nama titik lokasi pertama, tanggal batas,
 * jumlah laporan masuk dibanding jumlah pelaksana, deretan foto kecil
 * anggota tim, serta dua penanda kondisional — Lewat Batas berwarna
 * merah dan lencana jumlah Sesi Tugas berjalan."
 *
 * DUA BUTIR YANG SENGAJA BELUM ADA, keduanya karena datanya belum lahir:
 *   - "jumlah laporan masuk dibanding jumlah pelaksana" -> tabel
 *     laporan_harian baru dibangun Langkah 7 (Modul 6.3). Yang
 *     ditampilkan sekarang hanya jumlah pelaksananya.
 *   - "lencana jumlah Sesi Tugas berjalan" -> Modul 6.4, Langkah 10.
 *
 * "Deretan foto kecil anggota tim" dibaca sebagai avatar berinisial,
 * karena tabel users tidak punya kolom foto dan mockup pun memakai
 * inisial.
 */

export interface RingkasanSpt extends PenugasanTampilRow {
  lokasi_pertama?: string | null;
  jumlah_lokasi?: number;
  pelaksana?: { nama: string }[];
}

export function KartuSpt({ spt }: { spt: RingkasanSpt }) {
  const tim = spt.pelaksana ?? [];
  const umur = spt.status === "draf" ? umurHari(spt.dibuat_pada) : null;

  return (
    <Link
      href={`/penugasan/${spt.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {spt.nomor_spt ?? "Belum bernomor"}
        </span>
        <LencanaPrioritas prioritas={spt.prioritas} />
      </div>

      <h2 className="text-sm font-semibold leading-snug text-foreground">
        {spt.judul}
      </h2>

      {spt.lokasi_pertama && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground">
            1
          </span>
          <span className="min-w-0">
            {spt.lokasi_pertama}
            {(spt.jumlah_lokasi ?? 0) > 1 && (
              <span className="text-[var(--ink-3)]">
                {" "}
                dan {(spt.jumlah_lokasi ?? 1) - 1} titik lainnya
              </span>
            )}
          </span>
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Batas waktu:{" "}
        <span className="text-foreground">
          {tanggalIndonesia(spt.tanggal_batas)}
        </span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center">
          {tim.slice(0, 3).map((o, i) => (
            <span
              key={i}
              title={o.nama}
              className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-[9px] font-semibold text-primary-foreground first:ml-0"
            >
              {inisialNama(o.nama)}
            </span>
          ))}
          {tim.length > 3 && (
            <span className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-[9px] font-semibold text-secondary-foreground">
              +{tim.length - 3}
            </span>
          )}
          {tim.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              {tim.length} pelaksana
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <LencanaStatus status={spt.status} />
          <PenandaLewatBatas
            lewatBatas={spt.lewat_batas}
            hariTerlampaui={spt.hari_terlampaui}
          />
          {/* 6.2.6: "Draf ditinggalkan berbulan-bulan... Ditandai pada
              daftar draf dengan umurnya." */}
          {umur !== null && umur >= 1 && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              Draf {umur} hari
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** §6.2.5: "Daftar memakai kerangka abu-abu tiga kartu selama memuat." */
export function KerangkaKartu({ jumlah = 3 }: { jumlah?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: jumlah }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="h-3 w-2/5 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-6 w-full animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}
