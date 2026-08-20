import Link from "next/link";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import { LencanaStatusLaporan } from "@/components/sipantau/lencana-laporan";
import {
  JUDUL_DAFTAR_LAPORAN,
  LABEL_JENIS_LAPORAN,
  waktuLaporan,
} from "@/lib/pelaporan/label";
import type { LaporanHarianRow } from "@/lib/supabase/types";

/**
 * Daftar Laporan — KP-6.3-57 s/d 62.
 *
 * TIDAK ADA penyaringan lingkup per peran di kueri ini — RLS
 * "laporan_baca_sesuai_lingkup" (migrasi 0017) sudah memotong
 * barisnya di server: pelapor lihat miliknya, Panit lihat SPT yang
 * diawasi, Kanit lihat unitnya, Kasubdit lihat semua (KP-6.3-57).
 * Menambah filter di sini akan menduplikasi aturan yang sudah final.
 *
 * KP-6.3-59: Anggota melihat SELURUH laporannya sendiri termasuk yang
 * ditarik — karena itu tidak ada `.neq('status_laporan', 'ditarik')`
 * di sini untuk peran anggota.
 *
 * KP-6.3-60: Panit — yang belum bercatatan di urutan atas. Diurutkan
 * di JavaScript setelah pengambilan data karena PostgREST tidak dapat
 * mengurutkan berdasar "ada tidaknya baris terkait" dengan mudah lewat
 * satu kueri sederhana.
 */

interface ParamHalaman {
  searchParams: Promise<{ cari?: string }>;
}

export default async function HalamanDaftarLaporan({ searchParams }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const sp = await searchParams;
  const cari = (sp.cari ?? "").trim();

  const teks = JUDUL_DAFTAR_LAPORAN[pengguna.peran] ?? JUDUL_DAFTAR_LAPORAN.kasubdit;
  const supabase = await klienServer();

  let kueri = supabase
    .from("laporan_harian")
    .select(
      "id, penugasan_id, pelapor_id, jenis, uraian, status_laporan, status_lokasi, direkam_pada",
    );

  if (cari) {
    const aman = cari.replace(/[%,()]/g, " ");
    kueri = kueri.ilike("uraian", `%${aman}%`);
  }

  const { data, error } = await kueri
    .order("direkam_pada", { ascending: false })
    .limit(100)
    .returns<
      Pick<
        LaporanHarianRow,
        | "id"
        | "penugasan_id"
        | "pelapor_id"
        | "jenis"
        | "uraian"
        | "status_laporan"
        | "status_lokasi"
        | "direkam_pada"
      >[]
    >();

  const daftar = data ?? [];

  // Untuk menampilkan judul SPT dan nama pelapor tanpa N+1 query.
  const idSpt = [...new Set(daftar.map((l) => l.penugasan_id))];
  const idPelapor = [...new Set(daftar.map((l) => l.pelapor_id))];

  const [spt, pelapor, catatanBelumDiberi] = await Promise.all([
    idSpt.length
      ? supabase
          .from("penugasan")
          .select("id, nomor_spt, judul")
          .in("id", idSpt)
          .returns<{ id: string; nomor_spt: string | null; judul: string }[]>()
      : Promise.resolve({ data: [] as { id: string; nomor_spt: string | null; judul: string }[] }),
    idPelapor.length
      ? supabase
          .from("users")
          .select("id, nama")
          .in("id", idPelapor)
          .returns<{ id: string; nama: string }[]>()
      : Promise.resolve({ data: [] as { id: string; nama: string }[] }),
    pengguna.peran === "panit" && daftar.length
      ? supabase
          .from("catatan_laporan")
          .select("laporan_id")
          .in("laporan_id", daftar.map((l) => l.id))
          .returns<{ laporan_id: string }[]>()
      : Promise.resolve({ data: [] as { laporan_id: string }[] }),
  ]);

  const petaSpt = new Map((spt.data ?? []).map((s) => [s.id, s]));
  const petaPelapor = new Map((pelapor.data ?? []).map((p) => [p.id, p.nama]));
  const punyaCartatan = new Set((catatanBelumDiberi.data ?? []).map((c) => c.laporan_id));

  // KP-6.3-60: Panit — yang belum bercatatan di urutan atas.
  const daftarUrut =
    pengguna.peran === "panit"
      ? [...daftar].sort((a, b) => {
          const aBelum = punyaCartatan.has(a.id) ? 1 : 0;
          const bBelum = punyaCartatan.has(b.id) ? 1 : 0;
          return aBelum - bBelum;
        })
      : daftar;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{teks.judul}</h1>
          <p className="text-sm text-muted-foreground">{teks.sub}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pengguna.peran === "anggota" && (
            <Link
              href="/laporan/riwayat"
              className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Riwayat Saya
            </Link>
          )}
          {(pengguna.peran === "kanit" || pengguna.peran === "kasubdit") && (
            <Link
              href="/laporan/belum-lapor"
              className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Belum Melapor
            </Link>
          )}
        </div>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="search"
          name="cari"
          defaultValue={cari}
          placeholder="Cari isi uraian laporan"
          className="h-10 w-full max-w-md rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Cari
        </button>
      </form>

      {error ? (
        <Kotak
          judul="Daftar tidak dapat dimuat"
          teks="Terjadi kendala saat membaca data laporan. Muat ulang halaman."
        />
      ) : daftarUrut.length === 0 ? (
        <Kotak
          judul={cari ? "Tidak ada laporan yang cocok" : "Belum ada laporan"}
          teks={
            cari
              ? "Ubah kata kunci pencarian untuk melihat laporan lain."
              : "Laporan kegiatan akan tampil di sini begitu dikirim dari lapangan."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {daftarUrut.map((l) => {
            const s = petaSpt.get(l.penugasan_id);
            return (
              <li key={l.id}>
                <Link
                  href={`/laporan/${l.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {LABEL_JENIS_LAPORAN[l.jenis]}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s?.nomor_spt ?? "Belum bernomor"}
                      </span>
                      {pengguna.peran === "panit" && !punyaCartatan.has(l.id) && (
                        <span className="rounded-full bg-[var(--amber-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--amber)]">
                          Belum bercatatan
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-foreground">
                      {l.uraian}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pengguna.peran !== "anggota" &&
                        `${petaPelapor.get(l.pelapor_id) ?? "—"} · `}
                      {waktuLaporan(l.direkam_pada)}
                    </p>
                  </div>

                  <LencanaStatusLaporan status={l.status_laporan} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {daftarUrut.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {daftarUrut.length} laporan ditampilkan sesuai kewenangan Anda.
        </p>
      )}
    </div>
  );
}

function Kotak({ judul, teks }: { judul: string; teks: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{teks}</p>
    </div>
  );
}
