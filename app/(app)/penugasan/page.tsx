import Link from "next/link";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { KartuSpt } from "@/components/sipantau/kartu-spt";
import { SaringPenugasan } from "@/components/sipantau/saring-penugasan";
import { JUDUL_DAFTAR } from "@/lib/penugasan/label";
import {
  ambilDaftarPenugasan,
  ambilPilihanSaring,
  bacaSaring,
  panitPernahDitunjuk,
  PER_HALAMAN,
} from "@/lib/penugasan/kueri";

/**
 * Daftar Penugasan — §6.2.5, Lampiran B.9.
 *
 * B.9: "Daftar Penugasan memuat yang aktif saja; submenu Riwayat
 * memuat yang selesai dan dibatalkan." Halaman ini karena itu HANYA
 * menampilkan draf/baru/berjalan/bermasalah.
 *
 * Judul dan subjudulnya mengikuti PRD, bukan mockup — B.9 menutup
 * perkaranya: "Prototype menyesuaikan PRD bila keduanya bertentangan."
 */

interface ParamHalaman {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function HalamanDaftarSpt({ searchParams }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const sp = await searchParams;

  const nilai = bacaSaring(sp);
  const batas = Number(sp.batas) > 0 ? Number(sp.batas) : PER_HALAMAN;
  const teks = JUDUL_DAFTAR[pengguna.peran] ?? JUDUL_DAFTAR.kasubdit;

  // B.9: Panit yang belum pernah ditunjuk sama sekali tidak melihat
  // menu Penugasan. Bilah samping menyembunyikan tautannya; halaman
  // ini tetap perlu menangani kedatangan lewat tautan langsung.
  if (pengguna.peran === "panit" && !(await panitPernahDitunjuk())) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <h1 className="text-sm font-semibold text-foreground">
          Belum ada penugasan untuk Anda
        </h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Penugasan akan muncul di sini begitu Kanit menunjuk Anda sebagai Panit
          Penanggung Jawab.
        </p>
      </div>
    );
  }

  const [{ daftar, adaLagi, galat }, pilihan] = await Promise.all([
    ambilDaftarPenugasan(nilai, "aktif", batas),
    ambilPilihanSaring(pengguna.peran),
  ]);

  const adaSaring = Boolean(
    nilai.cari ||
      nilai.status ||
      nilai.prioritas ||
      nilai.dari ||
      nilai.sampai ||
      nilai.panit ||
      nilai.unit ||
      nilai.cepat,
  );

  const paramLagi = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  );
  paramLagi.set("batas", String(batas + PER_HALAMAN));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{teks.judul}</h1>
          <p className="text-sm text-muted-foreground">{teks.sub}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* KP-6.2-01 + BR-11: peran selain Kanit tidak melihatnya sama
              sekali, bukan melihatnya dalam keadaan nonaktif. */}
          {pengguna.peran === "kanit" && (
            <Link
              href="/penugasan/terbitkan"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Terbitkan Penugasan
            </Link>
          )}
          <Link
            href="/penugasan/riwayat"
            className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Riwayat
          </Link>
        </div>
      </div>

      <SaringPenugasan
        dasar="/penugasan"
        nilai={nilai}
        pilihan={pilihan}
        peran={pengguna.peran}
      />

      {galat ? (
        <Kotak
          judul="Daftar tidak dapat dimuat"
          teks="Terjadi kendala saat membaca data penugasan. Muat ulang halaman, dan bila berlanjut hubungi Akun Pemeliharaan."
        />
      ) : daftar.length === 0 ? (
        adaSaring ? (
          <Kotak
            judul="Tidak ada penugasan yang cocok"
            teks="Ubah kata kunci pencarian atau longgarkan penyaring untuk melihat penugasan."
            aksi={
              <Link
                href="/penugasan"
                className="mt-3 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Tampilkan Semua
              </Link>
            }
          />
        ) : (
          <KosongSesuaiPeran peran={pengguna.peran} />
        )
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {daftar.map((s) => (
              <KartuSpt key={s.id} spt={s} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {daftar.length} penugasan aktif ditampilkan sesuai kewenangan Anda.
            </p>
            {adaLagi && (
              <Link
                href={`/penugasan?${paramLagi.toString()}`}
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

/** §6.2.5 tabel "Kondisi kosong" — beda kalimat per peran, tanpa nada menyalahkan. */
function KosongSesuaiPeran({ peran }: { peran: string }) {
  if (peran === "kanit") {
    return (
      <Kotak
        judul="Belum ada penugasan pada unit Anda"
        teks="Terbitkan penugasan pertama untuk mulai menugaskan personel ke lapangan."
        aksi={
          <Link
            href="/penugasan/terbitkan"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Terbitkan Penugasan
          </Link>
        }
      />
    );
  }

  if (peran === "panit") {
    return (
      <Kotak
        judul="Tidak ada penugasan aktif yang Anda awasi"
        teks="Penugasan yang sudah selesai atau dibatalkan dapat dilihat pada Riwayat."
        aksi={
          <Link
            href="/penugasan/riwayat"
            className="mt-3 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Buka Riwayat
          </Link>
        }
      />
    );
  }

  if (peran === "anggota") {
    return (
      <Kotak
        judul="Belum ada penugasan untuk Anda saat ini"
        teks="Penugasan yang ditujukan kepada Anda akan tampil di sini begitu diterbitkan."
      />
    );
  }

  return (
    <Kotak
      judul="Belum ada penugasan aktif"
      teks="Penugasan akan tampil di sini begitu unit menerbitkannya."
    />
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
