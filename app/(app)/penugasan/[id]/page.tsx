import Link from "next/link";
import { notFound } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import {
  LencanaPrioritas,
  LencanaStatus,
  PenandaLewatBatas,
} from "@/components/sipantau/lencana-penugasan";
import { PetaTitik } from "@/components/sipantau/peta-titik";
import {
  LABEL_JENIS_DASAR,
  LABEL_JENIS_KEGIATAN,
  LABEL_JENIS_MASALAH,
  koordinat,
  tanggalIndonesia,
  waktuIndonesia,
} from "@/lib/penugasan/label";
import { inisialNama } from "@/lib/utils/inisial";
import type {
  PenugasanDasarRow,
  PenugasanLokasiRow,
  PenugasanMasalahRow,
  PenugasanPerpanjanganRow,
  PenugasanTampilRow,
} from "@/lib/supabase/types";
import { catatTandaTerima } from "./aksi";
import { tautanSurat } from "./aksi-surat";
import { PanelTindakan } from "./panel-tindakan";

/**
 * Rincian Penugasan — §6.2.5.
 *
 * "Badan halaman: keterangan penugasan, daftar dasar penugasan, peta
 *  dengan seluruh titik bernomor beserta lingkaran radiusnya, daftar
 *  Panit Penanggung Jawab, daftar pelaksana beserta penanda sudah atau
 *  belum membuka, rekam kegiatan, riwayat perpanjangan, serta kotak
 *  berkas surat perintah."
 *
 * "Rekam kegiatan" SENGAJA belum ada — isinya laporan harian Modul 6.3
 * yang tabelnya baru lahir Langkah 7.
 *
 * KEAMANAN: RLS memotong baris di server, sehingga SPT di luar
 * kewenangan pulang sebagai nol baris — sama persis dengan id yang
 * tidak ada. Halaman ini karena itu TIDAK boleh membedakan pesannya;
 * perbedaan pesan itu sendiri membocorkan keberadaan SPT unit lain.
 */

interface ParamHalaman {
  params: Promise<{ id: string }>;
}

interface BarisOrang {
  id: string;
  urutan?: number;
  dibaca_pada?: string | null;
  orang: {
    id: string;
    nama: string;
    nrp: string;
    pangkat: string | null;
    aktif: boolean;
  } | null;
}

export default async function HalamanRincianSpt({ params }: ParamHalaman) {
  const { pengguna } = await wajibkanSudahSiap();
  const { id } = await params;

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

  // B.9: "Tanda terima tercatat otomatis saat pelaksana membuka
  // rincian SPT." Fungsi database diam saja bila pemanggilnya bukan
  // pelaksana, jadi tidak perlu dijaga di sini.
  await catatTandaTerima(id);

  const [dasar, lokasi, pelaksana, panit, unit, perpanjangan, masalah] =
    await Promise.all([
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
          "id, urutan, dibaca_pada, orang:pelaksana_id(id, nama, nrp, pangkat, aktif)",
        )
        .eq("penugasan_id", id)
        .is("dicabut_pada", null)
        .order("urutan")
        .returns<BarisOrang[]>(),
      supabase
        .from("penugasan_panit")
        .select("id, orang:panit_id(id, nama, nrp, pangkat, aktif)")
        .eq("penugasan_id", id)
        .is("dicabut_pada", null)
        .returns<BarisOrang[]>(),
      supabase
        .from("unit")
        .select("nama")
        .eq("id", spt.unit_id)
        .maybeSingle<{ nama: string }>(),
      supabase
        .from("penugasan_perpanjangan")
        .select("id, tanggal_batas_lama, tanggal_batas_baru, alasan, dibuat_pada")
        .eq("penugasan_id", id)
        .order("dibuat_pada", { ascending: false })
        .returns<PenugasanPerpanjanganRow[]>(),
      supabase
        .from("penugasan_masalah")
        .select(
          "id, jenis_masalah, uraian, ditandai_pada, dipulihkan_pada, alasan_pemulihan",
        )
        .eq("penugasan_id", id)
        .order("ditandai_pada", { ascending: false })
        .returns<PenugasanMasalahRow[]>(),
    ]);

  const daftarPelaksana = pelaksana.data ?? [];
  const daftarPanit = panit.data ?? [];
  const daftarLokasi = lokasi.data ?? [];
  const daftarMasalah = masalah.data ?? [];
  const sudahBaca = daftarPelaksana.filter((p) => p.dibaca_pada).length;

  const bolehKelola =
    pengguna.peran === "kanit" && pengguna.unit_id === spt.unit_id;
  const akuPanitAktif = daftarPanit.some((p) => p.orang?.id === pengguna.id);
  const akuPelaksana = daftarPelaksana.some((p) => p.orang?.id === pengguna.id);
  const bolehBukaKembali = pengguna.peran === "kasubdit" || bolehKelola;
  const adaMasalahTerbuka = daftarMasalah.some((m) => !m.dipulihkan_pada);

  const urlSurat = spt.berkas_surat_path
    ? await tautanSurat(spt.berkas_surat_path)
    : null;

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

      <PanelTindakan
        id={id}
        status={spt.status}
        tanggalBatas={spt.tanggal_batas}
        adaBerkasSurat={Boolean(spt.berkas_surat_path)}
        bolehKelola={bolehKelola}
        bolehTandai={akuPanitAktif || akuPelaksana}
        bolehBukaKembali={bolehBukaKembali}
        adaMasalahTerbuka={adaMasalahTerbuka && bolehKelola}
      />

      {spt.status === "dibatalkan" && spt.alasan_pembatalan && (
        <div className="rounded-lg border border-[var(--red)] bg-[var(--red-bg)] p-4 text-sm text-[var(--red)]">
          <strong className="font-semibold">Penugasan dibatalkan.</strong>{" "}
          {spt.alasan_pembatalan}
        </div>
      )}

      {/* Keterangan penugasan */}
      <section className="rounded-lg border border-border bg-card p-4">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Butir label="Jenis kegiatan">
            {LABEL_JENIS_KEGIATAN[spt.jenis_kegiatan]}
          </Butir>
          <Butir label="Satuan">{unit.data?.nama ?? "—"}</Butir>
          <Butir label="Sasaran">{spt.sasaran ?? "—"}</Butir>
          <Butir label="Mulai">{tanggalIndonesia(spt.tanggal_mulai)}</Butir>
          <Butir label="Batas waktu">{tanggalIndonesia(spt.tanggal_batas)}</Butir>
          <Butir label="Nomor LP">{spt.nomor_lp ?? "—"}</Butir>
          <Butir label="Sumber informasi">{spt.sumber_informasi ?? "—"}</Butir>
          <Butir label="Diterbitkan">{waktuIndonesia(spt.diterbitkan_pada)}</Butir>
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

      {/* Peta titik bernomor beserta lingkaran radiusnya */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Titik lokasi</h2>
          <span className="text-xs text-muted-foreground">
            {daftarLokasi.length} titik, berurutan
          </span>
        </div>

        {daftarLokasi.length === 0 ? (
          <Kosong teks="Belum ada titik lokasi yang ditetapkan." />
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="p-4">
              <PetaTitik
                titik={daftarLokasi.map((l) => ({
                  nama: l.nama,
                  lat: l.lat === null ? null : Number(l.lat),
                  lng: l.lng === null ? null : Number(l.lng),
                  radius_meter: l.radius_meter,
                }))}
                tinggi={300}
              />
            </div>

            <ol className="divide-y divide-border border-t border-border lg:border-l lg:border-t-0">
              {daftarLokasi.map((l) => (
                <li key={l.id} className="flex gap-3 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {l.urutan}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{l.nama}</p>
                    {l.alamat && (
                      <p className="text-xs text-muted-foreground">{l.alamat}</p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground">
                      {koordinat(
                        l.lat === null ? null : Number(l.lat),
                        l.lng === null ? null : Number(l.lng),
                      )}
                      {l.radius_meter ? ` · radius ${l.radius_meter} m` : ""}
                    </p>
                    {l.keterangan && (
                      <p className="mt-0.5 text-xs text-foreground">{l.keterangan}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
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
                      {d.nomor ?? "Tanpa nomor"} · {tanggalIndonesia(d.tanggal)}
                    </p>
                    {d.keterangan && (
                      <p className="mt-1 text-xs text-foreground">{d.keterangan}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Kartu>

        <Kartu judul="Berkas surat perintah" jumlah={spt.berkas_surat_path ? 1 : 0}>
          {spt.berkas_surat_path ? (
            <div className="px-4 py-4">
              <p className="text-sm text-foreground">
                Pindaian surat perintah sudah dilampirkan.
              </p>
              {urlSurat ? (
                <a
                  href={urlSurat}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Buka berkas
                </a>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Tautan berkas tidak dapat dibuat saat ini. Muat ulang halaman.
                </p>
              )}
            </div>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Belum ada pindaian surat perintah.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Penugasan tidak dapat ditutup sebelum berkas ini dilampirkan.
              </p>
            </div>
          )}
        </Kartu>

        <Kartu judul="Pelaksana" jumlah={daftarPelaksana.length}>
          {daftarPelaksana.length === 0 ? (
            <Kosong teks="Belum ada pelaksana yang ditunjuk." />
          ) : (
            <ul className="divide-y divide-border">
              {daftarPelaksana.map((p) => (
                <BarisTim
                  key={p.id}
                  orang={p.orang}
                  kanan={
                    <span
                      className={
                        p.dibaca_pada
                          ? "shrink-0 rounded-full bg-[var(--green-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--green)]"
                          : "shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {p.dibaca_pada ? "Sudah membuka" : "Belum membuka"}
                    </span>
                  }
                />
              ))}
            </ul>
          )}
        </Kartu>

        <Kartu judul="Panit Penanggung Jawab" jumlah={daftarPanit.length}>
          {daftarPanit.length === 0 ? (
            <Kosong teks="Belum ada Panit Penanggung Jawab yang ditunjuk." />
          ) : (
            <ul className="divide-y divide-border">
              {daftarPanit.map((p) => (
                <BarisTim key={p.id} orang={p.orang} />
              ))}
            </ul>
          )}
        </Kartu>

        <Kartu judul="Riwayat perpanjangan" jumlah={perpanjangan.data?.length ?? 0}>
          {(perpanjangan.data ?? []).length === 0 ? (
            <Kosong teks="Batas waktu belum pernah diubah." />
          ) : (
            <ol className="divide-y divide-border">
              {(perpanjangan.data ?? []).map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <p className="text-sm text-foreground">
                    {tanggalIndonesia(r.tanggal_batas_lama)} →{" "}
                    <strong>{tanggalIndonesia(r.tanggal_batas_baru)}</strong>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {waktuIndonesia(r.dibuat_pada)}
                  </p>
                  <p className="mt-1 text-xs text-foreground">{r.alasan}</p>
                </li>
              ))}
            </ol>
          )}
        </Kartu>

        <Kartu judul="Catatan keadaan" jumlah={daftarMasalah.length}>
          {daftarMasalah.length === 0 ? (
            <Kosong teks="Belum ada keadaan yang ditandai." />
          ) : (
            <ol className="divide-y divide-border">
              {daftarMasalah.map((m) => (
                <li key={m.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {LABEL_JENIS_MASALAH[m.jenis_masalah]}
                    </span>
                    {m.dipulihkan_pada ? (
                      <span className="rounded-full bg-[var(--green-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--green)]">
                        Sudah dikembalikan
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--amber-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--amber)]">
                        Masih terbuka
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {waktuIndonesia(m.ditandai_pada)}
                  </p>
                  <p className="mt-1 text-xs text-foreground">{m.uraian}</p>
                  {m.alasan_pemulihan && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pengembalian: {m.alasan_pemulihan}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Kartu>
      </div>

      <p className="text-xs text-muted-foreground">
        Rekam kegiatan dan laporan lapangan hadir pada Langkah 7 (Modul 6.3),
        setelah tabel laporan harian dibangun.
      </p>
    </div>
  );
}

function BarisTim({
  orang,
  kanan,
}: {
  orang: BarisOrang["orang"];
  kanan?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {inisialNama(orang?.nama ?? "?")}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            {orang?.nama ?? "—"}
            {/* 6.2.6: akun nonaktif ditampilkan dengan penandanya, barisnya
                TIDAK dicabut dan laporannya tetap terhitung. */}
            {orang && !orang.aktif && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Akun nonaktif
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {orang?.pangkat ?? "—"} · {orang?.nrp ?? "—"}
          </p>
        </div>
      </div>
      {kanan}
    </li>
  );
}

function Butir({ label, children }: { label: string; children: React.ReactNode }) {
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
  return (
    <p className="px-4 py-6 text-center text-sm text-muted-foreground">{teks}</p>
  );
}
