import Link from "next/link";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import {
  LencanaPrioritas,
  LencanaStatus,
  PenandaLewatBatas,
} from "@/components/sipantau/lencana-penugasan";
import {
  LABEL_JENIS_KEGIATAN,
  LABEL_STATUS,
  SARINGAN_STATUS,
  saringanSah,
  tanggalIndonesia,
} from "@/lib/penugasan/label";
import type { PenugasanTampilRow } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

/**
 * Daftar SPT — docs/20-modul-6.2-penugasan.md, mockup HAL.penugasan().
 *
 * TIGA HAL YANG SENGAJA DIPUTUSKAN BEGINI:
 *
 * 1. Membaca tampilan `penugasan_tampil`, bukan tabel `penugasan`.
 *    Tampilan itu menambahkan `lewat_batas` dan `hari_terlampaui` yang
 *    dihitung di zona Asia/Jakarta (migrasi 0014). Membaca tabel
 *    langsung berarti penanda merah harus dihitung ulang di klien
 *    dengan zona peramban — bisa meleset sehari.
 *
 * 2. TIDAK ADA penyaringan lingkup per peran di kueri ini. Kebijakan
 *    RLS "penugasan_baca_sesuai_lingkup" (migrasi 0010) sudah
 *    memotong barisnya di server: Kasubdit melihat semua kecuali draf
 *    orang lain, Kanit sebatas unitnya, Panit sebatas yang diawasi,
 *    Anggota sebatas yang dilaksanakan. Menambah filter unit_id di
 *    sini akan menduplikasi aturan yang sudah final dan berisiko
 *    menyimpang darinya (BR-77).
 *
 * 3. Cari dan saring lewat searchParams, bukan state klien. Halaman
 *    tetap Server Component, URL hasil penyaringan bisa dikirim ke
 *    orang lain, dan tombol Back peramban bekerja wajar.
 */

interface ParamHalaman {
  searchParams: Promise<{ cari?: string; saring?: string }>;
}

const JUDUL_PERAN: Record<string, { judul: string; sub: string }> = {
  anggota: {
    judul: "Tugas saya",
    sub: "Penugasan yang ditujukan kepada Anda beserta status laporannya.",
  },
  panit: {
    judul: "Penugasan saya",
    sub: "Penugasan tempat Anda ditunjuk sebagai Panit Penanggung Jawab.",
  },
  kanit: {
    judul: "Kelola penugasan",
    sub: "Penugasan pada unit Anda. Terbitkan surat perintah dan tunjuk pelaksana.",
  },
  kasubdit: {
    judul: "Semua penugasan",
    sub: "Seluruh penugasan penyelidikan lapangan pada Subdit IV.",
  },
};

export default async function HalamanDaftarSpt({ searchParams }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const sp = await searchParams;

  const cari = (sp.cari ?? "").trim();
  const saring = saringanSah(sp.saring);
  const teks = JUDUL_PERAN[pengguna.peran] ?? JUDUL_PERAN.kasubdit;

  const supabase = await klienServer();
  let kueri = supabase
    .from("penugasan_tampil")
    .select(
      "id, nomor_spt, jenis_kegiatan, judul, objek, sasaran, prioritas, status, tanggal_mulai, tanggal_batas, lewat_batas, hari_terlampaui, dibuat_pada",
    );

  if (saring !== "semua") {
    kueri = kueri.eq("status", saring);
  }

  if (cari) {
    // Kolom yang dicari mengikuti placeholder mockup: "Cari nomor,
    // objek, atau lokasi". Lokasi ada di tabel anak, jadi tidak ikut
    // di sini — pencarian lintas tabel anak ditunda sampai ada
    // kebutuhan nyata, supaya kueri daftar tetap satu perjalanan.
    const aman = cari.replace(/[%,()]/g, " ");
    kueri = kueri.or(
      `nomor_spt.ilike.%${aman}%,judul.ilike.%${aman}%,objek.ilike.%${aman}%,sasaran.ilike.%${aman}%`,
    );
  }

  const { data, error } = await kueri
    .order("dibuat_pada", { ascending: false })
    .returns<PenugasanTampilRow[]>();

  const daftar = data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{teks.judul}</h1>
          <p className="text-sm text-muted-foreground">{teks.sub}</p>
        </div>

        {pengguna.peran === "kanit" && (
          <Link
            href="/penugasan/terbitkan"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Terbitkan penugasan
          </Link>
        )}
      </div>

      <BilahSaring cari={cari} saring={saring} />

      {error ? (
        <KotakPesan
          judul="Daftar tidak dapat dimuat"
          teks="Terjadi kendala saat membaca data penugasan. Muat ulang halaman, dan bila berlanjut hubungi Akun Pemeliharaan."
        />
      ) : daftar.length === 0 ? (
        <KotakPesan
          judul={
            cari || saring !== "semua"
              ? "Tidak ada penugasan yang cocok"
              : "Belum ada penugasan"
          }
          teks={
            cari || saring !== "semua"
              ? "Ubah kata kunci pencarian atau pilih penyaring lain untuk melihat penugasan."
              : "Penugasan akan tampil di sini begitu diterbitkan."
          }
          aksi={
            cari || saring !== "semua" ? (
              <Link
                href="/penugasan"
                className="mt-3 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Tampilkan semua
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {daftar.map((s) => (
            <KartuSpt key={s.id} spt={s} />
          ))}
        </div>
      )}

      {daftar.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {daftar.length} penugasan ditampilkan sesuai kewenangan Anda.
        </p>
      )}
    </div>
  );
}

/**
 * Penyaring: kolom cari berupa form GET (tanpa JavaScript pun jalan),
 * pilihan status berupa tautan biasa. Keduanya menulis ke URL supaya
 * hasilnya bisa ditandai dan dibagikan.
 */
function BilahSaring({ cari, saring }: { cari: string; saring: string }) {
  return (
    <div className="flex flex-col gap-3">
      <form method="get" className="flex gap-2">
        {saring !== "semua" && (
          <input type="hidden" name="saring" value={saring} />
        )}
        <input
          type="search"
          name="cari"
          defaultValue={cari}
          placeholder="Cari nomor SPT, judul, objek, atau sasaran"
          className="h-10 w-full max-w-md rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Cari
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SARINGAN_STATUS.map((f) => {
          const params = new URLSearchParams();
          if (cari) params.set("cari", cari);
          if (f !== "semua") params.set("saring", f);
          const href = params.toString()
            ? `/penugasan?${params.toString()}`
            : "/penugasan";

          return (
            <Link
              key={f}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                saring === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {f === "semua" ? "Semua" : LABEL_STATUS[f]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function KartuSpt({ spt }: { spt: PenugasanTampilRow }) {
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

      <div>
        <h2 className="text-sm font-semibold leading-snug text-foreground">
          {spt.judul}
        </h2>
        {spt.objek && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {spt.objek}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <dt className="text-muted-foreground">Jenis</dt>
          <dd className="text-foreground">
            {LABEL_JENIS_KEGIATAN[spt.jenis_kegiatan]}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Batas waktu</dt>
          <dd className="text-foreground">
            {tanggalIndonesia(spt.tanggal_batas)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <LencanaStatus status={spt.status} />
        <PenandaLewatBatas
          lewatBatas={spt.lewat_batas}
          hariTerlampaui={spt.hari_terlampaui}
        />
      </div>
    </Link>
  );
}

function KotakPesan({
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
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {teks}
      </p>
      {aksi}
    </div>
  );
}
