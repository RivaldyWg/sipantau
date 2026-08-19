import { notFound } from "next/navigation";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import {
  LABEL_JENIS_DASAR,
  LABEL_JENIS_KEGIATAN,
  koordinat,
  tanggalIndonesia,
} from "@/lib/penugasan/label";
import type {
  PenugasanDasarRow,
  PenugasanLokasiRow,
  PenugasanTampilRow,
} from "@/lib/supabase/types";
import { TombolCetak } from "./tombol-cetak";

/**
 * Cetak Surat Perintah Tugas.
 *
 * ============ INI PERUBAHAN PRD, BUKAN PELAKSANAAN PRD ============
 *
 * PRD v0.7 TIDAK memuat pencetakan SPT. Sebaliknya, ia mengasumsikan
 * alur yang berlawanan:
 *
 *   - Aturan modul 6.2.4 butir 1: "Sistem tidak menerbitkan nomor
 *     surat. Bagian nomor agenda selalu berasal dari manusia."
 *   - §6.2.5: "Berkas surat diunggah dari halaman rincian... karena
 *     surat fisik kerap ditandatangani belakangan."
 *   - BR-25: SPT tidak dapat selesai sebelum PINDAIAN surat perintah
 *     dilampirkan.
 *
 * Artinya PRD membayangkan surat diketik di luar sistem, ditandatangani
 * basah, dipindai, lalu diunggah. Halaman ini ditambahkan atas
 * permintaan pemilik produk pada 19 Agustus 2026, dan wajib dicatat
 * sebagai revisi PRD — lihat docs/02-perubahan-cetak-sprin.md.
 *
 * DUA HAL YANG TETAP TIDAK BERUBAH, sengaja:
 *   1. Nomor SPT tetap diketik manusia. Halaman ini hanya MENCETAK
 *      nomor yang sudah ada, tidak pernah membangkitkannya.
 *   2. Pindaian bertanda tangan tetap wajib diunggah sebelum SPT
 *      dapat ditutup. Keluaran cetak ini adalah KONSEP untuk
 *      ditandatangani, bukan pengganti surat bertanda tangan.
 *
 * KOP MASIH SEMENTARA. Lampiran A butir A-04 ("Berkas kop dan lambang
 * institusi") berstatus Belum terjawab. Kop di bawah disusun dari teks
 * biasa mengikuti bentuk baku surat Polri; begitu berkas kop resmi
 * diterima, ganti bagian <Kop /> saja — sisanya tidak perlu disentuh.
 */

interface ParamHalaman {
  params: Promise<{ id: string }>;
}

interface BarisOrang {
  id: string;
  urutan?: number;
  orang: { nama: string; nrp: string; pangkat: string | null } | null;
}

export default async function HalamanCetakSprin({ params }: ParamHalaman) {
  // Kewenangan membaca SPT-nya ditegakkan RLS; halaman ini hanya
  // memastikan sesinya sah dan kata sandinya sudah tidak wajib diganti.
  await wajibkanSudahSiap();
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

  const [dasar, lokasi, pelaksana, panit, unit, penerbit] = await Promise.all([
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
      .select("id, urutan, orang:pelaksana_id(nama, nrp, pangkat)")
      .eq("penugasan_id", id)
      .is("dicabut_pada", null)
      .order("urutan")
      .returns<BarisOrang[]>(),
    supabase
      .from("penugasan_panit")
      .select("id, orang:panit_id(nama, nrp, pangkat)")
      .eq("penugasan_id", id)
      .is("dicabut_pada", null)
      .returns<BarisOrang[]>(),
    supabase
      .from("unit")
      .select("nama, keterangan, kode_klasifikasi")
      .eq("id", spt.unit_id)
      .maybeSingle<{
        nama: string;
        keterangan: string | null;
        kode_klasifikasi: string | null;
      }>(),
    supabase
      .from("users")
      .select("nama, nrp, pangkat")
      .eq("id", spt.diterbitkan_oleh ?? spt.ditugaskan_oleh ?? "")
      .maybeSingle<{ nama: string; nrp: string; pangkat: string | null }>(),
  ]);

  const daftarPelaksana = pelaksana.data ?? [];
  const daftarPanit = panit.data ?? [];
  const semuaPetugas = [...daftarPanit, ...daftarPelaksana];

  const konsep = spt.status === "draf";

  return (
    <div className="mx-auto max-w-[21cm]">
      {/* Bilah kendali — tidak ikut tercetak */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 print:hidden">
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            Konsep Surat Perintah Tugas
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cetak, tandatangani, pindai, lalu unggah kembali lewat halaman
            rincian. Pindaian bertanda tangan tetap wajib sebelum penugasan
            dapat ditutup.
          </p>
        </div>
        <TombolCetak />
      </div>

      {konsep && (
        <div className="mb-4 rounded-lg border border-[var(--amber)] bg-[var(--amber-bg)] p-3 text-xs text-[var(--amber)] print:hidden">
          Penugasan ini masih berstatus draf dan nomor SPT-nya mungkin belum
          final. Cetakan hanya untuk pemeriksaan intern.
        </div>
      )}

      {/* ---------------- Lembar surat ---------------- */}
      <article className="surat bg-white p-[2cm] text-[11pt] leading-relaxed text-black shadow-sm print:p-0 print:shadow-none">
        <Kop unit={unit.data} />

        <div className="mt-6 text-center">
          <h2 className="text-[13pt] font-bold uppercase tracking-wide underline">
            Surat Perintah Tugas
          </h2>
          <p className="mt-1 text-[11pt]">
            Nomor: {spt.nomor_spt ?? "………………………………………"}
          </p>
        </div>

        <section className="mt-6">
          <Baris label="Menimbang">
            <p>
              bahwa untuk kepentingan{" "}
              {LABEL_JENIS_KEGIATAN[spt.jenis_kegiatan].toLowerCase()} sebagaimana
              tersebut di bawah ini, dipandang perlu menugaskan personel yang
              namanya tercantum dalam surat perintah ini.
            </p>
          </Baris>

          <Baris label="Dasar">
            {(dasar.data ?? []).length === 0 ? (
              <p className="italic">…………………………………………………………………</p>
            ) : (
              <ol className="list-decimal space-y-1 pl-5">
                {(dasar.data ?? []).map((d) => (
                  <li key={d.id}>
                    {LABEL_JENIS_DASAR[d.jenis]}
                    {d.nomor ? ` Nomor ${d.nomor}` : ""}
                    {d.tanggal ? ` tanggal ${tanggalIndonesia(d.tanggal)}` : ""}
                    {d.keterangan ? `, ${d.keterangan}` : ""}.
                  </li>
                ))}
              </ol>
            )}
          </Baris>
        </section>

        <p className="mt-6 text-center font-bold uppercase tracking-wide">
          Diperintahkan
        </p>

        <section className="mt-4">
          <Baris label="Kepada">
            {semuaPetugas.length === 0 ? (
              <p className="italic">…………………………………………………………………</p>
            ) : (
              <table className="w-full border-collapse text-[10.5pt]">
                <thead>
                  <tr>
                    <th className="border border-black px-2 py-1 text-left">No</th>
                    <th className="border border-black px-2 py-1 text-left">
                      Nama
                    </th>
                    <th className="border border-black px-2 py-1 text-left">
                      Pangkat / NRP
                    </th>
                    <th className="border border-black px-2 py-1 text-left">
                      Kedudukan dalam Tugas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {semuaPetugas.map((p, i) => (
                    <tr key={`${p.id}-${i}`}>
                      <td className="border border-black px-2 py-1">{i + 1}</td>
                      <td className="border border-black px-2 py-1">
                        {p.orang?.nama ?? "—"}
                      </td>
                      <td className="border border-black px-2 py-1">
                        {p.orang?.pangkat ?? "—"} / {p.orang?.nrp ?? "—"}
                      </td>
                      <td className="border border-black px-2 py-1">
                        {i < daftarPanit.length
                          ? "Panit Penanggung Jawab"
                          : "Pelaksana"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Baris>

          <Baris label="Untuk">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Melaksanakan {LABEL_JENIS_KEGIATAN[spt.jenis_kegiatan].toLowerCase()}{" "}
                terhadap {spt.objek ? <strong>{spt.objek}</strong> : "objek sebagaimana terlampir"}
                {spt.sasaran ? (
                  <>
                    {" "}dengan sasaran <strong>{spt.sasaran}</strong>
                  </>
                ) : null}
                {spt.nomor_lp ? `, terkait Laporan Polisi Nomor ${spt.nomor_lp}` : ""}.
              </li>

              {spt.uraian_tugas && (
                <li className="whitespace-pre-line">{spt.uraian_tugas}</li>
              )}

              <li>
                Melaksanakan tugas pada tempat sebagai berikut:
                {(lokasi.data ?? []).length === 0 ? (
                  <span className="italic"> …………………………………</span>
                ) : (
                  <ol className="mt-1 list-[lower-alpha] space-y-0.5 pl-5">
                    {(lokasi.data ?? []).map((l) => (
                      <li key={l.id}>
                        {l.nama}
                        {l.alamat ? `, ${l.alamat}` : ""}
                        {l.lat !== null && l.lng !== null
                          ? ` (${koordinat(l.lat, l.lng)})`
                          : ""}
                        {l.keterangan ? ` — ${l.keterangan}` : ""}
                      </li>
                    ))}
                  </ol>
                )}
              </li>

              <li>
                Melaksanakan tugas terhitung mulai tanggal{" "}
                <strong>{tanggalIndonesia(spt.tanggal_mulai)}</strong> sampai
                dengan <strong>{tanggalIndonesia(spt.tanggal_batas)}</strong>.
              </li>

              <li>
                Melaporkan hasil pelaksanaan tugas kepada pimpinan sebagai bahan
                pertimbangan lebih lanjut.
              </li>

              <li>
                Melaksanakan perintah ini dengan penuh rasa tanggung jawab.
              </li>
            </ol>
          </Baris>
        </section>

        <p className="mt-6">Selesai.</p>

        <TandaTangan
          penerbit={penerbit.data}
          unit={unit.data}
          tanggal={spt.diterbitkan_pada ?? spt.dibuat_pada}
        />
      </article>

      {/* Gaya khusus cetak — dipisah supaya jelas apa yang berubah saat
          dokumen benar-benar dicetak, bukan bercampur di kelas utilitas. */}
      <style>{`
        @page { size: A4; margin: 2cm; }
        @media print {
          html, body { background: #fff !important; }
          body * { visibility: hidden; }
          .surat, .surat * { visibility: visible; }
          .surat { position: absolute; inset: 0; margin: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

/**
 * Kop surat — SEMENTARA.
 * Lampiran A butir A-04 (berkas kop dan lambang institusi) masih
 * berstatus Belum terjawab, jadi lambang Polri sengaja TIDAK dipalsukan
 * sebagai gambar. Yang dicetak hanyalah teks kop baku. Begitu berkas
 * resminya diterima, ganti isi fungsi ini saja.
 */
function Kop({
  unit,
}: {
  unit: { nama: string; keterangan: string | null } | null;
}) {
  return (
    <header className="border-b-[3px] border-double border-black pb-2 text-center">
      <p className="text-[11pt] font-semibold uppercase leading-tight">
        Kepolisian Negara Republik Indonesia
      </p>
      <p className="text-[11pt] font-semibold uppercase leading-tight">
        Daerah Jawa Barat
      </p>
      <p className="text-[12pt] font-bold uppercase leading-tight">
        Direktorat Reserse Kriminal Khusus
      </p>
      {unit?.nama && (
        <p className="text-[10pt] uppercase leading-tight">
          Subdirektorat IV — {unit.nama}
          {unit.keterangan ? ` (${unit.keterangan})` : ""}
        </p>
      )}
    </header>
  );
}

function Baris({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 flex gap-3">
      <div className="w-[90px] shrink-0 font-semibold">{label}</div>
      <div className="w-[14px] shrink-0">:</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TandaTangan({
  penerbit,
  unit,
  tanggal,
}: {
  penerbit: { nama: string; nrp: string; pangkat: string | null } | null;
  unit: { nama: string } | null;
  tanggal: string | null;
}) {
  const waktu = tanggal ? new Date(tanggal) : new Date();
  const teks = waktu.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="mt-8 flex justify-end">
      <div className="w-[9cm] text-[11pt]">
        <p>Dikeluarkan di : Bandung</p>
        <p>pada tanggal : {teks}</p>

        <p className="mt-4 font-semibold uppercase">
          {unit?.nama ? `Kepala ${unit.nama}` : "Kepala Unit"}
        </p>

        {/* Ruang tanda tangan basah — tidak pernah diisi sistem. */}
        <div className="h-[2.5cm]" />

        <p className="font-bold underline">
          {penerbit?.nama ?? "………………………………"}
        </p>
        <p>
          {penerbit?.pangkat ?? "…………"} NRP {penerbit?.nrp ?? "………………"}
        </p>
      </div>
    </div>
  );
}
