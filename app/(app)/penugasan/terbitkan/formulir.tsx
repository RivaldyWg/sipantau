"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PetaTitik, cariTempat } from "@/components/sipantau/peta-titik";
import {
  LABEL_JENIS_DASAR,
  LABEL_JENIS_KEGIATAN,
  LABEL_PRIORITAS,
} from "@/lib/penugasan/label";
import type { JenisDasarPenugasan } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { terbitkanPenugasan } from "./aksi";

/**
 * Formulir Penerbitan Penugasan — §6.2.5.
 *
 * "Empat langkah, dapat disimpan sebagai draf kapan saja pada langkah
 *  mana pun:
 *    1. Keterangan penugasan
 *    2. Dasar penugasan
 *    3. Titik lokasi — peta Leaflet dengan daftar titik bernomor di
 *       sampingnya. Setiap titik dapat diatur dengan pin, ketikan
 *       koordinat, atau pencarian nama tempat, dan memiliki pengatur
 *       radius.
 *    4. Susunan tim"
 *
 * KENAPA SATU <form> UNTUK EMPAT LANGKAH: berpindah langkah TIDAK
 * boleh kehilangan isian langkah sebelumnya, dan §6.2.5 juga meminta
 * "Bila layanan tidak terjangkau saat menekan Terbitkan, isian
 * formulir tidak hilang". Bidang langkah yang tidak sedang tampil
 * disembunyikan lewat CSS, bukan dilepas dari pohon — melepasnya akan
 * membuat nilainya hilang dari FormData.
 *
 * Peringatan kelengkapan bersifat LUNAK. Yang menegakkan syarat terbit
 * tetap pemicu trg_periksa_syarat_terbit di database (BR-77, satu
 * sumber kebenaran). Jangan mengubahnya menjadi penghalang keras.
 */

interface Orang {
  id: string;
  nama: string;
  nrp: string;
  pangkat: string | null;
  peran: string;
}

interface BarisDasar {
  jenis: JenisDasarPenugasan | "";
  nomor: string;
  tanggal: string;
  keterangan: string;
}

interface BarisLokasi {
  nama: string;
  alamat: string;
  keterangan: string;
  lat: string;
  lng: string;
  radius_meter: string;
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const LANGKAH = [
  "Keterangan penugasan",
  "Dasar penugasan",
  "Titik lokasi",
  "Susunan tim",
];

export function FormulirTerbitkan({
  calonPanit,
  calonPelaksana,
  kerangkaNomor,
}: {
  calonPanit: Orang[];
  calonPelaksana: Orang[];
  kerangkaNomor: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [langkah, setLangkah] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [idDraf, setIdDraf] = useState<string | null>(null);

  const [nomorSpt, setNomorSpt] = useState("");
  const [dasar, setDasar] = useState<BarisDasar[]>([
    { jenis: "", nomor: "", tanggal: "", keterangan: "" },
  ]);
  const [lokasi, setLokasi] = useState<BarisLokasi[]>([
    { nama: "", alamat: "", keterangan: "", lat: "", lng: "", radius_meter: "300" },
  ]);
  const [titikAktif, setTitikAktif] = useState(0);
  const [panitTerpilih, setPanitTerpilih] = useState<string[]>([]);
  const [pelaksanaTerpilih, setPelaksanaTerpilih] = useState<string[]>([]);

  const adaAnggota = pelaksanaTerpilih.some(
    (id) => calonPelaksana.find((o) => o.id === id)?.peran === "anggota",
  );

  const kurang = [
    !nomorSpt.trim() && "nomor SPT",
    !dasar.some((d) => d.jenis) && "dasar penugasan",
    !lokasi.some((l) => l.nama.trim() && l.lat.trim() && l.lng.trim()) &&
      "titik lokasi berkoordinat",
    panitTerpilih.length === 0 && "Panit Penanggung Jawab",
    !adaAnggota && "pelaksana berperan Anggota",
  ].filter(Boolean) as string[];

  function ubahLokasi(i: number, tambal: Partial<BarisLokasi>) {
    setLokasi((lama) => lama.map((l, x) => (x === i ? { ...l, ...tambal } : l)));
  }

  function kirim(form: HTMLFormElement, terbitkan: boolean) {
    if (pending) return;
    setError(null);
    setIdDraf(null);

    const fd = new FormData(form);
    fd.set("dasar", JSON.stringify(dasar.filter((d) => d.jenis)));
    fd.set("lokasi", JSON.stringify(lokasi.filter((l) => l.nama.trim())));
    fd.delete("panit");
    fd.delete("pelaksana");
    panitTerpilih.forEach((id) => fd.append("panit", id));
    pelaksanaTerpilih.forEach((id) => fd.append("pelaksana", id));
    fd.set("terbitkan", terbitkan ? "1" : "0");

    startTransition(async () => {
      try {
        const hasil = await terbitkanPenugasan(fd);
        if (!hasil.ok) {
          setError(hasil.error);
          if (hasil.id) setIdDraf(hasil.id);
          return;
        }
        router.push(`/penugasan/${hasil.id}`);
        router.refresh();
      } catch {
        setError(
          "Tidak dapat menghubungi server. Isian Anda masih utuh — coba simpan sebagai draf.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        kirim(e.currentTarget, true);
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Penanda langkah */}
      <ol className="flex flex-wrap gap-2">
        {LANGKAH.map((l, i) => (
          <li key={l}>
            <button
              type="button"
              onClick={() => setLangkah(i)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                i === langkah
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  i === langkah
                    ? "bg-primary-foreground text-primary"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {i + 1}
              </span>
              {l}
            </button>
          </li>
        ))}
      </ol>

      {error && (
        <div className="rounded-lg border border-[var(--red)] bg-[var(--red-bg)] p-4 text-sm text-[var(--red)]">
          <p>{error}</p>
          {idDraf && (
            <button
              type="button"
              onClick={() => router.push(`/penugasan/${idDraf}`)}
              className="mt-2 underline underline-offset-2"
            >
              Buka draf yang tersimpan
            </button>
          )}
        </div>
      )}

      {/* ---------- Langkah 1: keterangan ---------- */}
      <Bagian tampil={langkah === 0} judul="Keterangan penugasan">
        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang label="Nomor SPT" className="sm:col-span-2">
            <input
              name="nomor_spt"
              value={nomorSpt}
              onChange={(e) => setNomorSpt(e.target.value)}
              placeholder={kerangkaNomor}
              className={`${KELAS_INPUT} font-mono`}
              disabled={pending}
            />
            <span className="text-xs text-muted-foreground">
              Kerangka yang disodorkan:{" "}
              <button
                type="button"
                onClick={() => setNomorSpt(kerangkaNomor)}
                className="font-mono underline underline-offset-2"
              >
                {kerangkaNomor}
              </button>
              . Nomor agenda berasal dari buku agenda Bagian Administrasi —
              sistem tidak pernah membangkitkannya.
            </span>
          </Bidang>

          <Bidang label="Jenis kegiatan">
            <select
              name="jenis_kegiatan"
              defaultValue="penyelidikan"
              className={KELAS_INPUT}
              disabled={pending}
            >
              {Object.entries(LABEL_JENIS_KEGIATAN).map(([n, l]) => (
                <option key={n} value={n}>
                  {l}
                </option>
              ))}
            </select>
          </Bidang>

          <Bidang label="Prioritas">
            <select
              name="prioritas"
              defaultValue="normal"
              className={KELAS_INPUT}
              disabled={pending}
            >
              {Object.entries(LABEL_PRIORITAS).map(([n, l]) => (
                <option key={n} value={n}>
                  {l}
                </option>
              ))}
            </select>
          </Bidang>

          <Bidang label="Judul penugasan" wajib className="sm:col-span-2">
            <input
              name="judul"
              required
              placeholder="Penyelidikan dugaan penambangan tanpa izin"
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>

          <Bidang label="Objek">
            <input name="objek" className={KELAS_INPUT} disabled={pending} />
          </Bidang>
          <Bidang label="Sasaran">
            <input name="sasaran" className={KELAS_INPUT} disabled={pending} />
          </Bidang>
          <Bidang label="Nomor LP">
            <input name="nomor_lp" className={KELAS_INPUT} disabled={pending} />
          </Bidang>
          <Bidang label="Sumber informasi">
            <input name="sumber_informasi" className={KELAS_INPUT} disabled={pending} />
          </Bidang>
          <Bidang label="Tanggal mulai">
            <input type="date" name="tanggal_mulai" className={KELAS_INPUT} disabled={pending} />
          </Bidang>
          <Bidang label="Tanggal batas">
            <input type="date" name="tanggal_batas" className={KELAS_INPUT} disabled={pending} />
          </Bidang>

          <Bidang label="Uraian tugas" className="sm:col-span-2">
            <textarea
              name="uraian_tugas"
              rows={3}
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
          </Bidang>
        </div>
      </Bagian>

      {/* ---------- Langkah 2: dasar ---------- */}
      <Bagian
        tampil={langkah === 1}
        judul="Dasar penugasan"
        keterangan="Landasan terbitnya SPT. Sekurang-kurangnya satu wajib ada sebelum penugasan dapat diterbitkan."
        aksi={
          <TombolKecil
            onClick={() =>
              setDasar([...dasar, { jenis: "", nomor: "", tanggal: "", keterangan: "" }])
            }
            disabled={pending}
          >
            Tambah dasar
          </TombolKecil>
        }
      >
        <div className="flex flex-col gap-3">
          {dasar.map((d, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Dasar {i + 1}
                </span>
                <TombolKecil
                  onClick={() => setDasar(dasar.filter((_, x) => x !== i))}
                  disabled={pending || dasar.length === 1}
                >
                  Hapus
                </TombolKecil>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={d.jenis}
                  onChange={(e) =>
                    setDasar(
                      dasar.map((x, y) =>
                        y === i
                          ? { ...x, jenis: e.target.value as JenisDasarPenugasan }
                          : x,
                      ),
                    )
                  }
                  className={KELAS_INPUT}
                  disabled={pending}
                >
                  <option value="">Pilih jenis dasar…</option>
                  {Object.entries(LABEL_JENIS_DASAR).map(([n, l]) => (
                    <option key={n} value={n}>
                      {l}
                    </option>
                  ))}
                </select>

                <input
                  value={d.nomor}
                  onChange={(e) =>
                    setDasar(dasar.map((x, y) => (y === i ? { ...x, nomor: e.target.value } : x)))
                  }
                  placeholder="Nomor surat atau laporan"
                  className={KELAS_INPUT}
                  disabled={pending}
                />

                <input
                  type="date"
                  value={d.tanggal}
                  onChange={(e) =>
                    setDasar(dasar.map((x, y) => (y === i ? { ...x, tanggal: e.target.value } : x)))
                  }
                  className={KELAS_INPUT}
                  disabled={pending}
                />

                <input
                  value={d.keterangan}
                  onChange={(e) =>
                    setDasar(
                      dasar.map((x, y) => (y === i ? { ...x, keterangan: e.target.value } : x)),
                    )
                  }
                  placeholder={
                    d.jenis === "lainnya"
                      ? "Keterangan (wajib untuk jenis Lainnya)"
                      : "Keterangan singkat"
                  }
                  className={`${KELAS_INPUT} sm:col-span-3`}
                  disabled={pending}
                />
              </div>
            </div>
          ))}
        </div>
      </Bagian>

      {/* ---------- Langkah 3: titik lokasi ---------- */}
      <Bagian
        tampil={langkah === 2}
        judul="Titik lokasi"
        keterangan="Sekurang-kurangnya satu titik wajib berkoordinat. Titik tanpa koordinat diperbolehkan dan bukan kekurangan data — ada tempat yang memang tidak dapat dijatuhi pin."
        aksi={
          <TombolKecil
            onClick={() => {
              setLokasi([
                ...lokasi,
                { nama: "", alamat: "", keterangan: "", lat: "", lng: "", radius_meter: "300" },
              ]);
              setTitikAktif(lokasi.length);
            }}
            disabled={pending}
          >
            Tambah titik
          </TombolKecil>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <PetaTitik
            titik={lokasi.map((l) => ({
              nama: l.nama,
              lat: l.lat.trim() ? Number(l.lat) : null,
              lng: l.lng.trim() ? Number(l.lng) : null,
              radius_meter: l.radius_meter ? Number(l.radius_meter) : null,
            }))}
            bisaSunting
            indeksAktif={titikAktif}
            onPindahTitik={(i, lat, lng) =>
              ubahLokasi(i, { lat: lat.toFixed(6), lng: lng.toFixed(6) })
            }
            tinggi={420}
          />

          <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
            {lokasi.map((l, i) => (
              <BarisLokasiSunting
                key={i}
                indeks={i}
                nilai={l}
                aktif={i === titikAktif}
                pending={pending}
                bisaHapus={lokasi.length > 1}
                onPilih={() => setTitikAktif(i)}
                onUbah={(t) => ubahLokasi(i, t)}
                onHapus={() => {
                  setLokasi(lokasi.filter((_, x) => x !== i));
                  setTitikAktif(0);
                }}
              />
            ))}
          </div>
        </div>
      </Bagian>

      {/* ---------- Langkah 4: susunan tim ---------- */}
      <Bagian
        tampil={langkah === 3}
        judul="Susunan tim"
        keterangan="Tim melekat pada SPT ini saja. Tidak ada susunan tim yang berlaku permanen di tingkat unit."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-medium text-foreground">
              Panit Penanggung Jawab
              <span className="text-[var(--red)]"> *</span>
            </h3>
            <DaftarPilih
              orang={calonPanit}
              terpilih={panitTerpilih}
              onAlih={(id) =>
                setPanitTerpilih((p) =>
                  p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
                )
              }
              disabled={pending}
              kosong="Belum ada akun berperan Panit pada unit Anda."
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium text-foreground">
              Pelaksana
              <span className="text-[var(--red)]"> *</span>
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Boleh Anggota, Panit, atau Kanit — termasuk Anda sendiri. Tetapi
              sekurang-kurangnya satu harus berperan Anggota.
            </p>
            <DaftarPilih
              orang={calonPelaksana}
              terpilih={pelaksanaTerpilih}
              onAlih={(id) =>
                setPelaksanaTerpilih((p) =>
                  p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
                )
              }
              disabled={pending}
              kosong="Belum ada akun aktif pada unit Anda."
              tampilkanPeran
            />
          </div>
        </div>
      </Bagian>

      {kurang.length > 0 && (
        <div className="rounded-lg border border-[var(--amber)] bg-[var(--amber-bg)] p-4 text-sm text-[var(--amber)]">
          Belum lengkap untuk diterbitkan: {kurang.join(", ")}. Anda tetap dapat
          menyimpannya sebagai draf dan melengkapinya kapan saja.
        </div>
      )}

      {/* Kendali langkah dan penyimpanan */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending || langkah === 0}
            onClick={() => setLangkah((l) => Math.max(0, l - 1))}
          >
            Sebelumnya
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending || langkah === LANGKAH.length - 1}
            onClick={() => setLangkah((l) => Math.min(LANGKAH.length - 1, l + 1))}
          >
            Berikutnya
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* "dapat disimpan sebagai draf kapan saja pada langkah mana pun" */}
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={(e) => {
              const form = (e.currentTarget as HTMLButtonElement).form;
              if (form) kirim(form, false);
            }}
          >
            Simpan sebagai draf
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan…" : "Terbitkan penugasan"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Satu titik lokasi: tiga cara mengatur koordinat sesuai §6.2.5 —
 * pin (lewat peta), ketikan koordinat (kolom di bawah), dan pencarian
 * nama tempat (tombol Cari).
 */
function BarisLokasiSunting({
  indeks,
  nilai,
  aktif,
  pending,
  bisaHapus,
  onPilih,
  onUbah,
  onHapus,
}: {
  indeks: number;
  nilai: BarisLokasi;
  aktif: boolean;
  pending: boolean;
  bisaHapus: boolean;
  onPilih: () => void;
  onUbah: (t: Partial<BarisLokasi>) => void;
  onHapus: () => void;
}) {
  const [mencari, setMencari] = useState(false);
  const [hasil, setHasil] = useState<{ nama: string; lat: number; lng: number }[]>([]);
  const [pesanCari, setPesanCari] = useState<string | null>(null);

  const adaKoordinat = Boolean(nilai.lat.trim() && nilai.lng.trim());

  async function cari() {
    const kueri = nilai.nama.trim() || nilai.alamat.trim();
    if (!kueri) {
      setPesanCari("Isi nama titik atau alamatnya lebih dulu.");
      return;
    }
    setMencari(true);
    setPesanCari(null);
    setHasil([]);
    try {
      const h = await cariTempat(kueri);
      if (h.length === 0) setPesanCari("Tempat tidak ditemukan. Coba kata lain.");
      setHasil(h);
    } catch {
      setPesanCari("Pencarian tempat sedang tidak dapat dijangkau.");
    } finally {
      setMencari(false);
    }
  }

  return (
    <div
      onClick={onPilih}
      className={cn(
        "cursor-pointer rounded-md border p-3 transition-colors",
        aktif ? "border-[var(--gold)] bg-[var(--amber-bg)]/30" : "border-border",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-foreground">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white",
              aktif ? "bg-[var(--gold)]" : "bg-primary",
            )}
          >
            {indeks + 1}
          </span>
          Titik {indeks + 1}
        </span>
        <TombolKecil onClick={onHapus} disabled={pending || !bisaHapus}>
          Hapus
        </TombolKecil>
      </div>

      <div className="flex flex-col gap-2">
        <input
          value={nilai.nama}
          onChange={(e) => onUbah({ nama: e.target.value })}
          placeholder="Nama tempat"
          className={KELAS_INPUT}
          disabled={pending}
        />
        <input
          value={nilai.alamat}
          onChange={(e) => onUbah({ alamat: e.target.value })}
          placeholder="Alamat lengkap"
          className={KELAS_INPUT}
          disabled={pending}
        />
        <input
          value={nilai.keterangan}
          onChange={(e) => onUbah({ keterangan: e.target.value })}
          placeholder="Peran titik ini, mis. lokasi transaksi"
          className={KELAS_INPUT}
          disabled={pending}
        />

        <div className="flex gap-2">
          <TombolKecil onClick={cari} disabled={pending || mencari}>
            {mencari ? "Mencari…" : "Cari nama tempat"}
          </TombolKecil>
          {adaKoordinat && (
            <TombolKecil
              onClick={() => onUbah({ lat: "", lng: "", radius_meter: "" })}
              disabled={pending}
            >
              Kosongkan koordinat
            </TombolKecil>
          )}
        </div>

        {pesanCari && <p className="text-xs text-muted-foreground">{pesanCari}</p>}

        {hasil.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-md border border-border p-1">
            {hasil.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    onUbah({
                      lat: h.lat.toFixed(6),
                      lng: h.lng.toFixed(6),
                      radius_meter: nilai.radius_meter || "300",
                    });
                    setHasil([]);
                  }}
                  className="w-full rounded px-2 py-1.5 text-left text-xs text-foreground hover:bg-secondary"
                >
                  {h.nama}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2">
          <input
            value={nilai.lat}
            onChange={(e) => onUbah({ lat: e.target.value })}
            inputMode="decimal"
            placeholder="Lintang"
            className={`${KELAS_INPUT} font-mono text-xs`}
            disabled={pending}
          />
          <input
            value={nilai.lng}
            onChange={(e) => onUbah({ lng: e.target.value })}
            inputMode="decimal"
            placeholder="Bujur"
            className={`${KELAS_INPUT} font-mono text-xs`}
            disabled={pending}
          />
        </div>

        {/* §5.16: radius bawaan 300 m, rentang 100–2000, dan kosong bila
            titik tanpa koordinat. */}
        {adaKoordinat && (
          <label className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">
              Radius {nilai.radius_meter || 300} m
            </span>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={Number(nilai.radius_meter) || 300}
              onChange={(e) => onUbah({ radius_meter: e.target.value })}
              className="w-full accent-[var(--primary)]"
              disabled={pending}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function Bagian({
  tampil,
  judul,
  keterangan,
  aksi,
  children,
}: {
  tampil: boolean;
  judul: string;
  keterangan?: string;
  aksi?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Disembunyikan lewat CSS, BUKAN dilepas dari pohon — melepasnya
  // membuat nilai bidangnya hilang dari FormData saat disimpan.
  return (
    <section
      className={cn("rounded-lg border border-border bg-card p-4", !tampil && "hidden")}
      aria-hidden={!tampil}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
          {keterangan && (
            <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
              {keterangan}
            </p>
          )}
        </div>
        {aksi}
      </div>
      {children}
    </section>
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
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-foreground">
        {label}
        {wajib && <span className="text-[var(--red)]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function DaftarPilih({
  orang,
  terpilih,
  onAlih,
  disabled,
  kosong,
  tampilkanPeran,
}: {
  orang: Orang[];
  terpilih: string[];
  onAlih: (id: string) => void;
  disabled: boolean;
  kosong: string;
  tampilkanPeran?: boolean;
}) {
  if (orang.length === 0) {
    return <p className="text-sm text-muted-foreground">{kosong}</p>;
  }

  return (
    <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-md border border-border p-1">
      {orang.map((o) => (
        <label
          key={o.id}
          className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary"
        >
          <input
            type="checkbox"
            checked={terpilih.includes(o.id)}
            onChange={() => onAlih(o.id)}
            disabled={disabled}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <span className="min-w-0">
            <span className="block text-sm text-foreground">{o.nama}</span>
            <span className="block text-xs text-muted-foreground">
              {o.pangkat ?? "—"} · {o.nrp}
              {tampilkanPeran ? ` · ${o.peran}` : ""}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

function TombolKecil({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className="h-8 shrink-0 rounded-md border border-input px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
    >
      {children}
    </button>
  );
}
