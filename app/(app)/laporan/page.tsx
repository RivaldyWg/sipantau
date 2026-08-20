import Link from "next/link";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import { LencanaStatusLaporan, LencanaStatusLokasi } from "@/components/sipantau/lencana-laporan";
import { SaringLaporan, type NilaiSaringLaporan } from "@/components/sipantau/saring-laporan";
import {
  JUDUL_DAFTAR_LAPORAN,
  LABEL_JENIS_LAPORAN,
  waktuLaporan,
} from "@/lib/pelaporan/label";
import type {
  BelumLaporRow,
  LaporanHarianRow,
} from "@/lib/supabase/types";

/**
 * Daftar Laporan — §6.3.5 tabel "Daftar laporan", KP-6.3-57 s/d 62.
 *
 * "Kanit — Semua Laporan — Seluruh laporan di unitnya, dengan rekap
 *  Belum Melapor Hari Ini di kepala halaman." Direalisasikan sebagai
 * bagian tersendiri di puncak halaman (bukan hanya tombol tautan),
 * dibaca dari v_belum_lapor — TIDAK menghitung ulang logikanya di
 * sini (satu sumber kebenaran, sama persis dengan halaman
 * /laporan/belum-lapor).
 *
 * "Panit — Review Laporan — ... yang belum bercatatan di atas."
 * Diurutkan setelah pengambilan data karena PostgREST tidak dapat
 * mengurutkan berdasar "ada tidaknya baris terkait" dalam satu kueri
 * sederhana.
 *
 * TIDAK ADA penyaringan lingkup PERAN di kueri utamanya — RLS
 * "laporan_baca_sesuai_lingkup" (migrasi 0017) sudah memotong
 * barisnya di server. Penyaring pada halaman ini (SPT, jenis, status,
 * dst) beroperasi DI DALAM lingkup yang RLS berikan, bukan
 * menggantikannya.
 */

interface ParamHalaman {
  searchParams: Promise<Record<string, string | undefined>>;
}

function bacaSaring(sp: Record<string, string | undefined>): NilaiSaringLaporan {
  return {
    cari: (sp.cari ?? "").trim(),
    spt: (sp.spt ?? "").trim(),
    jenis: (sp.jenis ?? "").trim(),
    status: (sp.status ?? "").trim(),
    statusLokasi: (sp.status_lokasi ?? "").trim(),
    dari: (sp.dari ?? "").trim(),
    sampai: (sp.sampai ?? "").trim(),
    pelapor: (sp.pelapor ?? "").trim(),
  };
}

export default async function HalamanDaftarLaporan({ searchParams }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const sp = await searchParams;
  const nilai = bacaSaring(sp);

  const teks = JUDUL_DAFTAR_LAPORAN[pengguna.peran] ?? JUDUL_DAFTAR_LAPORAN.kasubdit;
  const supabase = await klienServer();

  let kueri = supabase
    .from("laporan_harian")
    .select(
      "id, penugasan_id, pelapor_id, jenis, uraian, status_laporan, status_lokasi, direkam_pada",
    );

  if (nilai.spt) kueri = kueri.eq("penugasan_id", nilai.spt);
  if (nilai.jenis) kueri = kueri.eq("jenis", nilai.jenis);
  if (nilai.status) kueri = kueri.eq("status_laporan", nilai.status);
  if (nilai.statusLokasi) kueri = kueri.eq("status_lokasi", nilai.statusLokasi);
  if (nilai.pelapor) kueri = kueri.eq("pelapor_id", nilai.pelapor);
  if (nilai.dari) kueri = kueri.gte("direkam_pada", nilai.dari);
  if (nilai.sampai) kueri = kueri.lte("direkam_pada", `${nilai.sampai}T23:59:59`);
  if (nilai.cari) {
    const aman = nilai.cari.replace(/[%,()]/g, " ");
    kueri = kueri.or(`uraian.ilike.%${aman}%,kendala.ilike.%${aman}%`);
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

  // Pilihan penyaring SPT dan pelapor — dari SELURUH laporan dalam
  // lingkup pengguna (bukan hanya yang sudah tersaring), supaya
  // pilihan tetap lengkap saat penyaring lain sedang aktif.
  const [pilihanSptMentah, pilihanPelaporMentah, belumLapor] = await Promise.all([
    supabase
      .from("laporan_harian")
      .select("penugasan_id")
      .returns<{ penugasan_id: string }[]>(),
    pengguna.peran !== "anggota"
      ? supabase
          .from("laporan_harian")
          .select("pelapor_id")
          .returns<{ pelapor_id: string }[]>()
      : Promise.resolve({ data: [] as { pelapor_id: string }[] }),
    pengguna.peran === "kanit" || pengguna.peran === "kasubdit"
      ? supabase.from("v_belum_lapor").select("*").returns<BelumLaporRow[]>()
      : Promise.resolve({ data: [] as BelumLaporRow[] }),
  ]);

  const idSptUnik = [...new Set((pilihanSptMentah.data ?? []).map((r) => r.penugasan_id))];
  const idPelaporUnik = [
    ...new Set((pilihanPelaporMentah.data ?? []).map((r) => r.pelapor_id)),
  ];

  const [sptDetail, pelaporDetail] = await Promise.all([
    idSptUnik.length
      ? supabase
          .from("penugasan")
          .select("id, nomor_spt, judul")
          .in("id", idSptUnik)
          .returns<{ id: string; nomor_spt: string | null; judul: string }[]>()
      : Promise.resolve({ data: [] as { id: string; nomor_spt: string | null; judul: string }[] }),
    idPelaporUnik.length
      ? supabase
          .from("users")
          .select("id, nama")
          .in("id", idPelaporUnik)
          .returns<{ id: string; nama: string }[]>()
      : Promise.resolve({ data: [] as { id: string; nama: string }[] }),
  ]);

  const petaSpt = new Map((sptDetail.data ?? []).map((s) => [s.id, s]));
  const petaPelaporNama = new Map((pelaporDetail.data ?? []).map((p) => [p.id, p.nama]));

  // Untuk kartu daftar: judul SPT + nama pelapor per baris.
  // petaSpt di atas sudah mencakup SELURUH SPT dalam lingkup pengguna
  // (termasuk yang muncul di daftar), jadi tidak perlu peta terpisah.

  const catatanBelumDiberi =
    pengguna.peran === "panit" && daftar.length
      ? await supabase
          .from("catatan_laporan")
          .select("laporan_id")
          .in("laporan_id", daftar.map((l) => l.id))
          .returns<{ laporan_id: string }[]>()
      : { data: [] as { laporan_id: string }[] };

  const punyaCartatan = new Set((catatanBelumDiberi.data ?? []).map((c) => c.laporan_id));

  const daftarUrut =
    pengguna.peran === "panit"
      ? [...daftar].sort((a, b) => {
          const aBelum = punyaCartatan.has(a.id) ? 1 : 0;
          const bBelum = punyaCartatan.has(b.id) ? 1 : 0;
          return aBelum - bBelum;
        })
      : daftar;

  const daftarBelumLapor = belumLapor.data ?? [];
  const idPelaksanaBelumLapor = [...new Set(daftarBelumLapor.map((d) => d.pelaksana_id))];
  const { data: orangBelumLapor } = idPelaksanaBelumLapor.length
    ? await supabase
        .from("users")
        .select("id, nama")
        .in("id", idPelaksanaBelumLapor)
        .returns<{ id: string; nama: string }[]>()
    : { data: [] as { id: string; nama: string }[] };
  const petaOrangBelumLapor = new Map((orangBelumLapor ?? []).map((o) => [o.id, o.nama]));

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
        </div>
      </div>

      {/* §6.3.5: rekap Belum Melapor Hari Ini DI KEPALA HALAMAN untuk Kanit. */}
      {(pengguna.peran === "kanit" || pengguna.peran === "kasubdit") && (
        <section
          className={
            daftarBelumLapor.length > 0
              ? "rounded-lg border border-[var(--amber)] bg-[var(--amber-bg)] p-4"
              : "rounded-lg border border-[var(--green)] bg-[var(--green-bg)] p-4"
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              className={
                daftarBelumLapor.length > 0
                  ? "text-sm font-semibold text-[var(--amber)]"
                  : "text-sm font-semibold text-[var(--green)]"
              }
            >
              Belum Melapor Hari Ini ({daftarBelumLapor.length})
            </h2>
            {daftarBelumLapor.length > 0 && (
              <Link
                href="/laporan/belum-lapor"
                className="text-xs font-medium text-[var(--amber)] underline underline-offset-2"
              >
                Lihat selengkapnya
              </Link>
            )}
          </div>
          {daftarBelumLapor.length > 0 ? (
            <p className="mt-1 text-xs text-[var(--amber)]">
              {[...new Set(daftarBelumLapor.map((d) => d.pelaksana_id))]
                .slice(0, 5)
                .map((id) => petaOrangBelumLapor.get(id) ?? "—")
                .join(", ")}
              {idPelaksanaBelumLapor.length > 5 &&
                ` dan ${idPelaksanaBelumLapor.length - 5} lainnya`}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--green)]">
              Seluruh pelaksana sudah melapor hari ini.
            </p>
          )}
        </section>
      )}

      <SaringLaporan
        dasar="/laporan"
        nilai={nilai}
        pilihan={{
          spt: idSptUnik.map((id) => {
            const s = petaSpt.get(id);
            return { id, label: s?.nomor_spt ?? s?.judul ?? id };
          }),
          pelapor: idPelaporUnik.map((id) => ({
            id,
            nama: petaPelaporNama.get(id) ?? id,
          })),
        }}
        tampilkanPelapor={pengguna.peran !== "anggota"}
      />

      {error ? (
        <Kotak
          judul="Daftar tidak dapat dimuat"
          teks="Terjadi kendala saat membaca data laporan. Muat ulang halaman."
        />
      ) : daftarUrut.length === 0 ? (
        <Kotak
          judul="Tidak ada laporan yang cocok"
          teks="Ubah kata kunci atau longgarkan penyaring untuk melihat laporan lain."
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
                        `${petaPelaporNama.get(l.pelapor_id) ?? "—"} · `}
                      {waktuLaporan(l.direkam_pada)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <LencanaStatusLaporan status={l.status_laporan} />
                    {l.status_lokasi && (
                      <LencanaStatusLokasi status={l.status_lokasi} />
                    )}
                  </div>
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
