"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  LABEL_ALASAN_LOKASI,
  LABEL_JENIS_LAPORAN,
  LABEL_STATUS_KEGIATAN,
} from "@/lib/pelaporan/label";
import type {
  AlasanLokasiTidakTerekam,
  JenisLaporan,
  StatusKegiatanLaporan,
} from "@/lib/supabase/types";
import {
  ambilDraf,
  hapusDraf,
  simpanDraf,
  tambahKeAntrean,
  type DrafLaporan,
} from "@/lib/pelaporan/antrean-luring";
import { kirimLaporan, type MasukanKirimLaporan } from "../aksi";
import { tandaiBermasalah } from "../../penugasan/[id]/aksi";
import { LABEL_JENIS_MASALAH } from "@/lib/penugasan/label";
import type { JenisMasalah } from "@/lib/supabase/types";

/**
 * Formulir Kirim Laporan — KP-6.3-01 s/d 25, KP-6.3-11 s/d 15 (draf).
 *
 * BR-03 DI ATAS SEGALANYA: tidak ada satu pun jalur di formulir ini
 * yang menahan tombol Kirim karena koordinat. Kegagalan mengambil
 * geolokasi hanya memindahkan formulir ke keadaan "tidak_terekam" dan
 * meminta alasan — bukan mencegah pengiriman.
 *
 * ALUR PENGIRIMAN:
 *   1. Coba kirim langsung lewat Server Action (kirimLaporan).
 *   2. Bila gagal karena JARINGAN (bukan galat validasi server), baris
 *      dipindah ke Antrean Luring (IndexedDB) untuk dicoba ulang nanti
 *      oleh PenyinkronAntrean (dipasang di layout /laporan, lihat
 *      berkas terpisah) — BUKAN dicoba ulang di sini, supaya logika
 *      retry hanya ada di SATU tempat.
 *   3. Bila gagal karena VALIDASI SERVER (mis. bukan pelaksana aktif),
 *      ditampilkan sebagai galat ke pengguna — tidak masuk antrean,
 *      karena mencoba ulang tidak akan mengubah hasilnya.
 *
 * Draf (belum ditekan kirim) tersimpan otomatis tiap beberapa detik ke
 * IndexedDB, terpisah total dari Antrean Luring — lihat catatan di
 * lib/pelaporan/antrean-luring.ts.
 */

interface TitikLokasi {
  id: string;
  nama: string;
  lat: number | null;
  lng: number | null;
  radius_meter: number | null;
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

type StatusGeo = "mencoba" | "berhasil" | "gagal" | "tidak_didukung";

export function FormulirKirimLaporan({
  penugasanId,
  titikLokasi,
  lewatBatas,
}: {
  penugasanId: string;
  titikLokasi: TitikLokasi[];
  lewatBatas: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kabar, setKabar] = useState<string | null>(null);

  const [jenis, setJenis] = useState<JenisLaporan>("perkembangan");
  const [uraian, setUraian] = useState("");
  const [kendala, setKendala] = useState("");
  const [statusKegiatan, setStatusKegiatan] =
    useState<StatusKegiatanLaporan>("berjalan");
  const [lokasiId, setLokasiId] = useState<string>("");
  const [keteranganLokasi, setKeteranganLokasi] = useState("");
  const [alasanLokasi, setAlasanLokasi] =
    useState<AlasanLokasiTidakTerekam | "">("");
  const [alasanLainnya, setAlasanLainnya] = useState("");

  const [statusGeo, setStatusGeo] = useState<StatusGeo>(() =>
    typeof navigator !== "undefined" && navigator.geolocation
      ? "mencoba"
      : "tidak_didukung",
  );
  const [koordinat, setKoordinat] = useState<{
    lat: number;
    lng: number;
    akurasi: number;
  } | null>(null);

  const [draftMuat, setDraftMuat] = useState(false);

  // §6.3.5: memilih status kegiatan "bermasalah" TIDAK langsung
  // menyimpan — sistem membuka penuntun Tandai Bermasalah milik
  // Modul 6.2 supaya jenis masalah dan uraiannya terisi lewat satu
  // pintu yang sama (tabel penugasan_masalah, bukan kolom terpisah di
  // laporan_harian). "sudahBermasalah" mengizinkan status_kegiatan
  // benar-benar berpindah begitu penuntunnya selesai diisi — tanpa
  // penanda ini, memilih ulang "bermasalah" tanpa mengisi penuntun
  // akan diam-diam tersimpan sebagai status_kegiatan=bermasalah tanpa
  // baris penugasan_masalah yang menyertainya.
  const [bukaPenuntunBermasalah, setBukaPenuntunBermasalah] = useState(false);
  const [sudahTandaiBermasalah, setSudahTandaiBermasalah] = useState(false);
  const [pendingTandai, startTransitionTandai] = useTransition();
  const [errorTandai, setErrorTandai] = useState<string | null>(null);

  // --- Ambil geolokasi begitu formulir terbuka. Kegagalan TIDAK
  // menghalangi apa pun — hanya memindahkan formulir ke mode alasan
  // manual (KP-6.3-19, BR-03). ---
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setKoordinat({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: pos.coords.accuracy,
        });
        setStatusGeo("berhasil");
      },
      () => setStatusGeo("gagal"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // --- Muat draf tersimpan (KP-6.3-13), sekali saat formulir terbuka. ---
  useEffect(() => {
    let dibatalkan = false;
    ambilDraf(penugasanId)
      .then((draf) => {
        if (dibatalkan || !draf) return;
        setJenis(draf.jenis as JenisLaporan);
        setUraian(draf.uraian);
        setKendala(draf.kendala);
        setStatusKegiatan(draf.status_kegiatan as StatusKegiatanLaporan);
        setLokasiId(draf.lokasi_id ?? "");
        setDraftMuat(true);
      })
      .catch(() => {
        // IndexedDB tidak tersedia (mis. mode penyamaran ketat) — draf
        // sekadar tidak ada, bukan kegagalan yang perlu ditampilkan.
      });
    return () => {
      dibatalkan = true;
    };
  }, [penugasanId]);

  // --- Simpan draf otomatis, ditahan (debounce) satu detik. ---
  useEffect(() => {
    if (!uraian && !kendala) return;
    const t = setTimeout(() => {
      const draf: DrafLaporan = {
        penugasan_id: penugasanId,
        jenis,
        uraian,
        kendala,
        status_kegiatan: statusKegiatan,
        lokasi_id: lokasiId || null,
        disimpan_pada: new Date().toISOString(),
      };
      simpanDraf(draf).catch(() => {
        /* draf gagal tersimpan lokal — bukan galat yang perlu diganggu ke pengguna */
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [penugasanId, jenis, uraian, kendala, statusKegiatan, lokasiId]);

  const perluAlasan = statusGeo !== "berhasil";

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setKabar(null);

    if (!uraian.trim()) {
      setError("Uraian kegiatan wajib diisi.");
      return;
    }
    if (perluAlasan && !alasanLokasi) {
      setError("Pilih alasan lokasi tidak terekam.");
      return;
    }
    if (alasanLokasi === "lainnya" && !alasanLainnya.trim()) {
      setError("Uraian alasan lainnya wajib diisi.");
      return;
    }

    const antreanId = crypto.randomUUID();
    const direkamPada = new Date().toISOString();

    const masukan: MasukanKirimLaporan = {
      penugasan_id: penugasanId,
      jenis,
      uraian,
      kendala,
      status_kegiatan: statusKegiatan,
      lokasi_id: lokasiId || null,
      lokasi_lat: koordinat?.lat ?? null,
      lokasi_lng: koordinat?.lng ?? null,
      akurasi_meter: koordinat?.akurasi ?? null,
      alasan_lokasi: perluAlasan && alasanLokasi ? alasanLokasi : null,
      alasan_lokasi_lainnya: alasanLokasi === "lainnya" ? alasanLainnya : null,
      keterangan_lokasi: keteranganLokasi || null,
      antrean_id: antreanId,
      direkam_pada: direkamPada,
    };

    startTransition(async () => {
      try {
        const hasil = await kirimLaporan(masukan);
        if (!hasil.ok) {
          // Galat VALIDASI (bukan pelaksana aktif, dsb) — tampilkan,
          // JANGAN masukkan ke antrean karena mencoba ulang tidak akan
          // mengubah hasilnya.
          setError(hasil.error);
          return;
        }
        await hapusDraf(penugasanId);
        router.push(hasil.id ? `/laporan/${hasil.id}` : "/laporan");
        router.refresh();
      } catch {
        // Galat JARINGAN — masuk Antrean Luring, akan dicoba ulang
        // otomatis oleh PenyinkronAntrean begitu jaringan pulih (BR-45).
        try {
          await tambahKeAntrean({
            antrean_id: antreanId,
            penugasan_id: penugasanId,
            jenis,
            uraian,
            kendala,
            status_kegiatan: statusKegiatan,
            lokasi_id: lokasiId || null,
            lokasi_lat: koordinat?.lat ?? null,
            lokasi_lng: koordinat?.lng ?? null,
            akurasi_meter: koordinat?.akurasi ?? null,
            alasan_lokasi: perluAlasan && alasanLokasi ? alasanLokasi : null,
            alasan_lokasi_lainnya: alasanLokasi === "lainnya" ? alasanLainnya : null,
            keterangan_lokasi: keteranganLokasi || null,
            direkam_pada: direkamPada,
            percobaan_terakhir: null,
            jumlah_percobaan: 0,
            galat_terakhir: null,
          });
          await hapusDraf(penugasanId);
          setKabar(
            "Jaringan tidak tersedia. Laporan tersimpan di perangkat dan akan " +
              "terkirim otomatis begitu jaringan pulih.",
          );
          setUraian("");
          setKendala("");
        } catch {
          setError(
            "Tidak dapat menghubungi server, dan laporan gagal disimpan sebagai " +
              "antrean. Coba lagi, atau simpan sebagai draf.",
          );
        }
      }
    });
  }

  function simpanSebagaiDrafManual() {
    simpanDraf({
      penugasan_id: penugasanId,
      jenis,
      uraian,
      kendala,
      status_kegiatan: statusKegiatan,
      lokasi_id: lokasiId || null,
      disimpan_pada: new Date().toISOString(),
    })
      .then(() => setKabar("Draf tersimpan di perangkat ini."))
      .catch(() => setError("Draf gagal disimpan di perangkat ini."));
  }

  return (
    <>
      {bukaPenuntunBermasalah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-lg">
            <h2 className="mb-1 text-sm font-semibold text-foreground">
              Tandai bermasalah
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Menandai status kegiatan sebagai bermasalah mencatat keadaan ini
              pada penugasan (bukan hanya pada laporan ini). Kegiatan tidak
              dihentikan.
            </p>

            {errorTandai && (
              <p className="mb-3 rounded-md border border-[var(--red)] bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">
                {errorTandai}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setErrorTandai(null);
                const fd = new FormData(e.currentTarget);
                startTransitionTandai(async () => {
                  try {
                    const h = await tandaiBermasalah(penugasanId, fd);
                    if (!h.ok) {
                      setErrorTandai(h.error);
                      return;
                    }
                    setSudahTandaiBermasalah(true);
                    setStatusKegiatan("bermasalah");
                    setBukaPenuntunBermasalah(false);
                  } catch {
                    setErrorTandai("Tidak dapat menghubungi server.");
                  }
                });
              }}
              className="flex flex-col gap-3"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Jenis masalah <span className="text-[var(--red)]">*</span>
                </span>
                <select
                  name="jenis_masalah"
                  required
                  className={KELAS_INPUT}
                  disabled={pendingTandai}
                >
                  <option value="">Pilih jenis masalah…</option>
                  {Object.entries(LABEL_JENIS_MASALAH).map(([n, l]) => (
                    <option key={n} value={n as JenisMasalah}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Uraian keadaan <span className="text-[var(--red)]">*</span>
                </span>
                <textarea
                  name="uraian"
                  required
                  rows={3}
                  placeholder="Terangkan keadaan yang ditemui di lapangan."
                  className={`${KELAS_INPUT} h-auto py-2`}
                  disabled={pendingTandai}
                />
              </label>

              <div className="flex gap-2">
                <Button type="submit" disabled={pendingTandai}>
                  {pendingTandai ? "Mencatat…" : "Catat keadaan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pendingTandai}
                  onClick={() => setBukaPenuntunBermasalah(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form onSubmit={kirim} className="flex flex-col gap-5" noValidate>
      {/* §6.3.5, KP-6.3-03: peringatan tampil, pengiriman TETAP diizinkan. */}
      {lewatBatas && (
        <p className="rounded-md border border-[var(--amber)] bg-[var(--amber-bg)] px-3 py-2 text-sm text-[var(--amber)]">
          Penugasan ini sudah melewati tanggal batas. Laporan tetap dapat
          dikirim.
        </p>
      )}

      {draftMuat && (
        <p className="rounded-md border border-border bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          Draf sebelumnya untuk penugasan ini dimuat ulang.
        </p>
      )}

      {kabar && (
        <p className="rounded-lg border border-[var(--green)] bg-[var(--green-bg)] p-4 text-sm text-[var(--green)]">
          {kabar}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-[var(--red)] bg-[var(--red-bg)] p-4 text-sm text-[var(--red)]">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang label="Jenis laporan">
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value as JenisLaporan)}
              className={KELAS_INPUT}
              disabled={pending}
            >
              {Object.entries(LABEL_JENIS_LAPORAN).map(([n, l]) => (
                <option key={n} value={n}>
                  {l}
                </option>
              ))}
            </select>
          </Bidang>

          <Bidang label="Status kegiatan">
            <select
              value={statusKegiatan}
              onChange={(e) => {
                const nilai = e.target.value as StatusKegiatanLaporan;
                if (nilai === "bermasalah" && !sudahTandaiBermasalah) {
                  // Belum diset — dibuka penuntunnya dulu, select
                  // tetap menampilkan nilai LAMA sampai penuntun
                  // selesai (lihat value={statusKegiatan} di bawah,
                  // bukan {nilai}).
                  setBukaPenuntunBermasalah(true);
                  return;
                }
                setStatusKegiatan(nilai);
              }}
              className={KELAS_INPUT}
              disabled={pending}
            >
              {Object.entries(LABEL_STATUS_KEGIATAN).map(([n, l]) => (
                <option key={n} value={n}>
                  {l}
                </option>
              ))}
            </select>
          </Bidang>

          <Bidang label="Uraian kegiatan" wajib className="sm:col-span-2">
            <textarea
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              rows={4}
              required
              placeholder="Ceritakan kegiatan yang dilakukan…"
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
          </Bidang>

          <Bidang label="Kendala di lapangan" className="sm:col-span-2">
            <textarea
              value={kendala}
              onChange={(e) => setKendala(e.target.value)}
              rows={2}
              placeholder="Opsional"
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
          </Bidang>
        </div>
      </section>

      {/* §6.3.4 butir 2/3: fakta lokasi apa adanya, tidak ada tombol
          "coba lagi mendesak" yang terkesan mendesak kepatuhan. */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Lokasi</h2>

        {statusGeo === "mencoba" && (
          <p className="text-sm text-muted-foreground">Mengambil lokasi perangkat…</p>
        )}

        {statusGeo === "berhasil" && koordinat && (
          <p className="text-sm text-foreground">
            Koordinat berhasil direkam (± {Math.round(koordinat.akurasi)} m). Sistem
            akan menghitung titik terdekat secara otomatis setelah laporan terkirim.
          </p>
        )}

        {(statusGeo === "gagal" || statusGeo === "tidak_didukung") && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Koordinat tidak berhasil direkam. Laporan tetap dapat dikirim —
              pilih alasannya di bawah.
            </p>
            <Bidang label="Alasan lokasi tidak terekam" wajib>
              <select
                value={alasanLokasi}
                onChange={(e) =>
                  setAlasanLokasi(e.target.value as AlasanLokasiTidakTerekam)
                }
                required
                className={KELAS_INPUT}
                disabled={pending}
              >
                <option value="">Pilih alasan…</option>
                {Object.entries(LABEL_ALASAN_LOKASI).map(([n, l]) => (
                  <option key={n} value={n}>
                    {l}
                  </option>
                ))}
              </select>
            </Bidang>
            {alasanLokasi === "lainnya" && (
              <Bidang label="Uraian alasan lainnya" wajib>
                <input
                  value={alasanLainnya}
                  onChange={(e) => setAlasanLainnya(e.target.value)}
                  required
                  className={KELAS_INPUT}
                  disabled={pending}
                />
              </Bidang>
            )}
          </div>
        )}

        {titikLokasi.length > 0 && (
          <div className="mt-3">
            <Bidang label="Titik lokasi (opsional — pilihan Anda sendiri)">
              <select
                value={lokasiId}
                onChange={(e) => setLokasiId(e.target.value)}
                className={KELAS_INPUT}
                disabled={pending}
              >
                <option value="">Biarkan sistem menebak</option>
                {titikLokasi.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
            </Bidang>
          </div>
        )}

        {statusGeo === "berhasil" && (
          <div className="mt-3">
            <Bidang label="Keterangan lokasi (opsional)">
              <input
                value={keteranganLokasi}
                onChange={(e) => setKeteranganLokasi(e.target.value)}
                placeholder="Mis. sedang di warung dekat lokasi"
                className={KELAS_INPUT}
                disabled={pending}
              />
            </Bidang>
          </div>
        )}
      </section>

      {/* §6.3.5: "Panel Sebelum Mengirim pada prototype dipertahankan,
          tetapi butir ketiganya diganti. Kalimat 'Laporan yang
          terkirim tidak dapat diubah' sudah tidak benar; penggantinya
          menerangkan bahwa laporan masih dapat diperbaiki sampai
          disetujui Kanit." */}
      <section className="rounded-lg border border-border bg-secondary p-4">
        <h2 className="mb-2 text-xs font-semibold text-secondary-foreground">
          Sebelum mengirim
        </h2>
        <ul className="flex flex-col gap-1 text-xs text-secondary-foreground">
          <li>• Pastikan uraian kegiatan sudah menggambarkan yang sebenarnya terjadi.</li>
          <li>• Foto dapat ditambahkan setelah laporan terkirim, dari halaman rincian.</li>
          <li>
            • Laporan masih dapat disunting sampai disetujui Kanit atau sampai
            SPT ditutup — bukan langsung terkunci begitu terkirim.
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim Laporan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={simpanSebagaiDrafManual}
        >
          Simpan sebagai Draf
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Draf tersimpan hanya di perangkat ini dan tidak terbaca siapa pun,
        termasuk pimpinan. Draf akan hilang bila data aplikasi dibersihkan atau
        aplikasi dipasang ulang.
      </p>
      </form>
    </>
  );
}

function Bidang({
  label,
  wajib,
  className,
  children,
}: {
  label: string;
  wajib?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium text-foreground">
        {label}
        {wajib && <span className="text-[var(--red)]"> *</span>}
      </span>
      {children}
    </label>
  );
}
