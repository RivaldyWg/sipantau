import Link from "next/link";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { KartuSpt } from "@/components/sipantau/kartu-spt";
import { SaringPenugasan } from "@/components/sipantau/saring-penugasan";
import {
  ambilDaftarPenugasan,
  ambilPilihanSaring,
  bacaSaring,
  PER_HALAMAN,
} from "@/lib/penugasan/kueri";

/**
 * Riwayat Penugasan — Lampiran B.9: "submenu Riwayat memuat yang
 * selesai dan dibatalkan dengan penyaring bawaan enam bulan."
 *
 * Enam bulan itu BAWAAN, bukan batas keras: begitu pengguna mengisi
 * rentang tanggalnya sendiri, nilainya dipakai apa adanya. §6.2.5
 * kondisi kosong "Riwayat kosong pada rentang enam bulan" meminta
 * ajakan melebarkan rentang, bukan penolakan.
 */

interface ParamHalaman {
  searchParams: Promise<Record<string, string | undefined>>;
}

function enamBulanLalu(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

export default async function HalamanRiwayatSpt({ searchParams }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const sp = await searchParams;

  const nilai = bacaSaring(sp);
  const pakaiBawaan = !nilai.dari && !nilai.sampai;
  if (pakaiBawaan) nilai.dari = enamBulanLalu();

  const batas = Number(sp.batas) > 0 ? Number(sp.batas) : PER_HALAMAN;

  const [{ daftar, adaLagi, galat }, pilihan] = await Promise.all([
    ambilDaftarPenugasan(nilai, "riwayat", batas),
    ambilPilihanSaring(pengguna.peran),
  ]);

  const paramLagi = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  );
  paramLagi.set("batas", String(batas + PER_HALAMAN));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Riwayat Penugasan
          </h1>
          <p className="text-sm text-muted-foreground">
            Penugasan yang sudah selesai dan yang dibatalkan.
            {pakaiBawaan && " Menampilkan enam bulan terakhir."}
          </p>
        </div>

        <Link
          href="/penugasan"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Penugasan aktif
        </Link>
      </div>

      <SaringPenugasan
        dasar="/penugasan/riwayat"
        nilai={nilai}
        pilihan={pilihan}
        peran={pengguna.peran}
      />

      {galat ? (
        <Kotak
          judul="Riwayat tidak dapat dimuat"
          teks="Terjadi kendala saat membaca data. Muat ulang halaman, dan bila berlanjut hubungi Akun Pemeliharaan."
        />
      ) : daftar.length === 0 ? (
        <Kotak
          judul="Tidak ada penugasan pada rentang ini"
          teks={
            pakaiBawaan
              ? "Belum ada penugasan yang selesai atau dibatalkan dalam enam bulan terakhir. Lebarkan rentang tanggalnya untuk melihat yang lebih lama."
              : "Longgarkan penyaring atau lebarkan rentang tanggal untuk melihat lebih banyak."
          }
          aksi={
            <Link
              href="/penugasan/riwayat?dari=2020-01-01"
              className="mt-3 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Lebarkan rentang
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {daftar.map((s) => (
              <KartuSpt key={s.id} spt={s} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {daftar.length} penugasan ditampilkan.
            </p>
            {adaLagi && (
              <Link
                href={`/penugasan/riwayat?${paramLagi.toString()}`}
                className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Muat Lagi
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Kotak({
  judul,
  teks,
  aksi,
}: {
  judul: string;
  teks: string;
  aksi?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{teks}</p>
      {aksi}
    </div>
  );
}
