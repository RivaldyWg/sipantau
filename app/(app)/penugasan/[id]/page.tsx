import Link from "next/link";
import { notFound } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import {
  LencanaPrioritas,
  LencanaStatus,
  PenandaLewatBatas,
} from "@/components/sipantau/lencana-penugasan";
import {
  LABEL_JENIS_DASAR,
  LABEL_JENIS_KEGIATAN,
  koordinat,
  tanggalIndonesia,
  waktuIndonesia,
} from "@/lib/penugasan/label";
import type {
  PenugasanDasarRow,
  PenugasanLokasiRow,
  PenugasanTampilRow,
} from "@/lib/supabase/types";

/**
 * Rincian SPT — mockup HAL.rincian().
 *
 * Dibuat sebagai rute tersendiri (bukan state di halaman daftar
 * seperti mockup) supaya tautan ke satu SPT bisa dikirim ke orang
 * lain, bertahan saat halaman dimuat ulang, dan tombol Back peramban
 * bekerja per langkah.
 *
 * KEAMANAN — kenapa cukup notFound():
 * RLS "penugasan_baca_sesuai_lingkup" memotong baris di server. SPT
 * di luar kewenangan pembaca akan pulang sebagai nol baris, sama
 * persis dengan id yang memang tidak ada. Halaman ini karena itu
 * TIDAK boleh membedakan pesannya ("bukan hak Anda" vs "tidak
 * ditemukan") — perbedaan pesan itu sendiri membocorkan keberadaan
 * SPT unit lain.
 *
 * Bagian "Rekam kegiatan" pada mockup SENGAJA belum ada di sini:
 * isinya laporan harian (Modul 6.3) yang tabelnya baru dibangun pada
 * Langkah 7. Yang ditampilkan sekarang adalah empat tabel anak yang
 * sudah hidup: dasar, lokasi, pelaksana, panit.
 */

interface ParamHalaman {
  params: Promise<{ id: string }>;
}

interface BarisOrang {
  id: string;
  urutan?: number;
  dibaca_pada?: string | null;
  ditunjuk_pada?: string;
  orang: { nama: string; nrp: string; pangkat: string | null } | null;
}

export default async function HalamanRincianSpt({ params }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const { id } = await params;

  // Id yang bukan UUID akan membuat Postgres melempar galat tipe,
  // bukan mengembalikan nol baris — dipotong lebih dulu di sini.
  const berbentukUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!berbentukUuid) notFound();

  const supabase = await klienServer();

  const { data: spt } = await supabase
    .from("penugasan_tampil")
    .select("*")
    .eq("id", id)
    .maybeSingle<PenugasanTampilRow>();

  if (!spt) notFound();

  const [dasar, lokasi, pelaksana, panit, unit] = await Promise.all([
    supabase
      .from("penugasan_dasar")
      .select("id, urutan, jenis, nomor, tanggal, keterangan")
      .eq("penugasan_id", id)
      .order("urutan")
      .returns<PenugasanDasarRow[]>(),
    supabase
      .from("penugasan_lokasi")
      .select("id, urutan, nama, alamat, keterangan, lat, lng, radius_meter")
      .eq("penugasan_id", id)
      .order("urutan")
      .returns<PenugasanLokasiRow[]>(),
    supabase
      .from("penugasan_pelaksana")
      .select(
        "id, urutan, dibaca_pada, orang:pelaksana_id(nama, nrp, pangkat)",
      )
      .eq("penugasan_id", id)
      .is("dicabut_pada", null)
      .order("urutan")
      .returns<BarisOrang[]>(),
    supabase
      .from("penugasan_panit")
      .select("id, ditunjuk_pada, orang:panit_id(nama, nrp, pangkat)")
      .eq("penugasan_id", id)
      .is("dicabut_pada", null)
      .returns<BarisOrang[]>(),
    supabase
      .from("unit")
      .select("nama")
      .eq("id", spt.unit_id)
      .maybeSingle<{ nama: string }>(),
  ]);

  const daftarPelaksana = pelaksana.data ?? [];
  const sudahBaca = daftarPelaksana.filter((p) => p.dibaca_pada).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {spt.nomor_spt ?? "Belum bernomor"}
            </span>
            <LencanaStatus status={spt.status} />
            <LencanaPrioritas prioritas={spt.prioritas} />
            <PenandaLewatBatas
              lewatBatas={spt.lewat_batas}
              hariTerlampaui={spt.hari_terlampaui}
            />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{spt.judul}</h1>
          {spt.objek && (
            <p className="mt-1 text-sm text-muted-foreground">{spt.objek}</p>
          )}
        </div>

        <Link
          href="/penugasan"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Kembali
        </Link>
      </div>

      {spt.status === "dibatalkan" && spt.alasan_pembatalan && (
        <div className="rounded-lg border border-[var(--red)] bg-[var(--red-bg)] p-4 text-sm text-[var(--red)]">
          <strong className="font-semibold">Penugasan dibatalkan.</strong>{" "}
          {spt.alasan_pembatalan}
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-4">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Butir label="Jenis kegiatan">
            {LABEL_JENIS_KEGIATAN[spt.jenis_kegiatan]}
          </Butir>
          <Butir label="Satuan">{unit.data?.nama ?? "—"}</Butir>
          <Butir label="Sasaran">{spt.sasaran ?? "—"}</Butir>
          <Butir label="Mulai">{tanggalIndonesia(spt.tanggal_mulai)}</Butir>
          <Butir label="Batas waktu">
            {tanggalIndonesia(spt.tanggal_batas)}
          </Butir>
          <Butir label="Nomor LP">{spt.nomor_lp ?? "—"}</Butir>
          <Butir label="Sumber informasi">{spt.sumber_informasi ?? "—"}</Butir>
          <Butir label="Diterbitkan">
            {waktuIndonesia(spt.diterbitkan_pada)}
          </Butir>
          <Butir label="Tanda terima">
            {daftarPelaksana.length > 0
              ? `${sudahBaca} dari ${daftarPelaksana.length} pelaksana`
              : "—"}
          </Butir>
        </dl>

        {spt.uraian_tugas && (
          <div className="mt-4 border-t border-border pt-4">
            <h2 className="text-xs font-medium text-muted-foreground">
              Uraian tugas
            </h2>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">
              {spt.uraian_tugas}
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu judul="Dasar penugasan" jumlah={dasar.data?.length ?? 0}>
          {(dasar.data ?? []).length === 0 ? (
            <Kosong teks="Belum ada dasar penugasan yang dicatat." />
          ) : (
            <ol className="divide-y divide-border">
              {(dasar.data ?? []).map((d) => (
                <li key={d.id} className="flex gap-3 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                    {d.urutan}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {LABEL_JENIS_DASAR[d.jenis]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.nomor ?? "Tanpa nomor"} ·{" "}
                      {tanggalIndonesia(d.tanggal)}
                    </p>
                    {d.keterangan && (
                      <p className="mt-1 text-xs text-foreground">
                        {d.keterangan}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Kartu>

        <Kartu judul="Titik lokasi" jumlah={lokasi.data?.length ?? 0}>
          {(lokasi.data ?? []).length === 0 ? (
            <Kosong teks="Belum ada titik lokasi yang ditetapkan." />
          ) : (
            <ol className="divide-y divide-border">
              {(lokasi.data ?? []).map((l) => (
                <li key={l.id} className="flex gap-3 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                    {l.urutan}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {l.nama}
                    </p>
                    {l.alamat && (
                      <p className="text-xs text-muted-foreground">
                        {l.alamat}
                      </p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground">
                      {koordinat(l.lat, l.lng)}
                      {l.radius_meter ? ` · radius ${l.radius_meter} m` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Kartu>

        <Kartu judul="Pelaksana" jumlah={daftarPelaksana.length}>
          {daftarPelaksana.length === 0 ? (
            <Kosong teks="Belum ada pelaksana yang ditunjuk." />
          ) : (
            <ul className="divide-y divide-border">
              {daftarPelaksana.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {p.orang?.nama ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.orang?.pangkat ?? "—"} · {p.orang?.nrp ?? "—"}
                    </p>
                  </div>
                  <span
                    className={
                      p.dibaca_pada
                        ? "shrink-0 rounded-full bg-[var(--green-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--green)]"
                        : "shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {p.dibaca_pada ? "Sudah dibaca" : "Belum dibaca"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kartu>

        <Kartu
          judul="Panit Penanggung Jawab"
          jumlah={panit.data?.length ?? 0}
        >
          {(panit.data ?? []).length === 0 ? (
            <Kosong teks="Belum ada Panit Penanggung Jawab yang ditunjuk." />
          ) : (
            <ul className="divide-y divide-border">
              {(panit.data ?? []).map((p) => (
                <li key={p.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {p.orang?.nama ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.orang?.pangkat ?? "—"} · {p.orang?.nrp ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Kartu>
      </div>

      <p className="text-xs text-muted-foreground">
        Rekam kegiatan dan laporan lapangan hadir pada Langkah 7 (Modul 6.3),
        setelah tabel laporan harian dibangun.
        {pengguna.peran === "kanit" &&
          " Penyuntingan dan penutupan penugasan menyusul pada langkah yang sama."}
      </p>
    </div>
  );
}

function Butir({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Kartu({
  judul,
  jumlah,
  children,
}: {
  judul: string;
  jumlah: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
        <span className="text-xs text-muted-foreground">{jumlah}</span>
      </div>
      {children}
    </section>
  );
}

function Kosong({ teks }: { teks: string }) {
  return <p className="px-4 py-6 text-center text-sm text-muted-foreground">{teks}</p>;
}
