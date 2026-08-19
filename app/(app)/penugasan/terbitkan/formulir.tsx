"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  LABEL_JENIS_DASAR,
  LABEL_JENIS_KEGIATAN,
  LABEL_PRIORITAS,
} from "@/lib/penugasan/label";
import type { JenisDasarPenugasan } from "@/lib/supabase/types";
import { terbitkanPenugasan } from "./aksi";

/**
 * Formulir Terbitkan SPT.
 *
 * Client Component karena baris Dasar dan Titik Lokasi bisa
 * ditambah/dikurangi sebelum dikirim — jumlahnya tidak diketahui saat
 * halaman dirender di server. Keduanya dikirim sebagai satu field JSON
 * (bukan nama field berindeks) supaya urutannya terjaga persis.
 *
 * Peringatan kelengkapan di bawah adalah BANTUAN, bukan penegakan.
 * Yang menegakkan syarat terbit tetap pemicu di database
 * (trg_periksa_syarat_terbit, migrasi 0012) — tombol tetap bisa
 * ditekan, dan pesan galat dari pemicu ditampilkan apa adanya kalau
 * ternyata masih ada yang kurang. Menyalin aturannya ke sini sebagai
 * penghalang keras akan menciptakan sumber kebenaran kedua yang bisa
 * menyimpang diam-diam (BR-77).
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
  lat: string;
  lng: string;
  radius_meter: string;
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const KELAS_LABEL = "text-xs font-medium text-foreground";

export function FormulirTerbitkan({
  calonPanit,
  calonPelaksana,
}: {
  calonPanit: Orang[];
  calonPelaksana: Orang[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [idDraf, setIdDraf] = useState<string | null>(null);

  const [dasar, setDasar] = useState<BarisDasar[]>([
    { jenis: "", nomor: "", tanggal: "", keterangan: "" },
  ]);
  const [lokasi, setLokasi] = useState<BarisLokasi[]>([
    { nama: "", alamat: "", lat: "", lng: "", radius_meter: "300" },
  ]);
  const [panitTerpilih, setPanitTerpilih] = useState<string[]>([]);
  const [pelaksanaTerpilih, setPelaksanaTerpilih] = useState<string[]>([]);
  const [nomorSpt, setNomorSpt] = useState("");

  function alihkan(
    daftar: string[],
    set: (v: string[]) => void,
    id: string,
  ) {
    set(daftar.includes(id) ? daftar.filter((x) => x !== id) : [...daftar, id]);
  }

  // Cerminan lima syarat pemicu, dipakai untuk peringatan lunak saja.
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

  function kirim(e: React.FormEvent<HTMLFormElement>, terbitkan: boolean) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setIdDraf(null);

    const fd = new FormData(e.currentTarget);
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
        setError("Tidak dapat menghubungi server. Periksa jaringan Anda.");
      }
    });
  }

  return (
    <form
      onSubmit={(e) => kirim(e, true)}
      className="flex flex-col gap-5"
      noValidate
    >
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

      <Bagian judul="Identitas penugasan">
        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang label="Nomor SPT">
            <input
              name="nomor_spt"
              value={nomorSpt}
              onChange={(e) => setNomorSpt(e.target.value)}
              placeholder="SPT/000/VIII/2026/Ditreskrimsus"
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>

          <Bidang label="Jenis kegiatan">
            <select
              name="jenis_kegiatan"
              defaultValue="penyelidikan"
              className={KELAS_INPUT}
              disabled={pending}
            >
              {Object.entries(LABEL_JENIS_KEGIATAN).map(([nilai, label]) => (
                <option key={nilai} value={nilai}>
                  {label}
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
            <input
              name="sumber_informasi"
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>

          <Bidang label="Prioritas">
            <select
              name="prioritas"
              defaultValue="normal"
              className={KELAS_INPUT}
              disabled={pending}
            >
              {Object.entries(LABEL_PRIORITAS).map(([nilai, label]) => (
                <option key={nilai} value={nilai}>
                  {label}
                </option>
              ))}
            </select>
          </Bidang>

          <div className="grid grid-cols-2 gap-3">
            <Bidang label="Tanggal mulai">
              <input
                type="date"
                name="tanggal_mulai"
                className={KELAS_INPUT}
                disabled={pending}
              />
            </Bidang>
            <Bidang label="Tanggal batas">
              <input
                type="date"
                name="tanggal_batas"
                className={KELAS_INPUT}
                disabled={pending}
              />
            </Bidang>
          </div>

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

      <Bagian
        judul="Dasar penugasan"
        keterangan="Landasan terbitnya SPT. Sekurang-kurangnya satu wajib ada."
        aksi={
          <TombolTambah
            onClick={() =>
              setDasar([
                ...dasar,
                { jenis: "", nomor: "", tanggal: "", keterangan: "" },
              ])
            }
            disabled={pending}
          />
        }
      >
        <div className="flex flex-col gap-3">
          {dasar.map((d, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <select
                value={d.jenis}
                onChange={(e) => {
                  const baru = [...dasar];
                  baru[i] = {
                    ...d,
                    jenis: e.target.value as JenisDasarPenugasan,
                  };
                  setDasar(baru);
                }}
                className={KELAS_INPUT}
                disabled={pending}
              >
                <option value="">Pilih jenis dasar…</option>
                {Object.entries(LABEL_JENIS_DASAR).map(([nilai, label]) => (
                  <option key={nilai} value={nilai}>
                    {label}
                  </option>
                ))}
              </select>

              <input
                value={d.nomor}
                onChange={(e) => {
                  const baru = [...dasar];
                  baru[i] = { ...d, nomor: e.target.value };
                  setDasar(baru);
                }}
                placeholder="Nomor"
                className={KELAS_INPUT}
                disabled={pending}
              />

              <input
                type="date"
                value={d.tanggal}
                onChange={(e) => {
                  const baru = [...dasar];
                  baru[i] = { ...d, tanggal: e.target.value };
                  setDasar(baru);
                }}
                className={KELAS_INPUT}
                disabled={pending}
              />

              <input
                value={d.keterangan}
                onChange={(e) => {
                  const baru = [...dasar];
                  baru[i] = { ...d, keterangan: e.target.value };
                  setDasar(baru);
                }}
                placeholder={
                  d.jenis === "lainnya"
                    ? "Keterangan (wajib untuk jenis Lainnya)"
                    : "Keterangan"
                }
                className={`${KELAS_INPUT} sm:col-span-2`}
                disabled={pending}
              />

              <TombolHapus
                onClick={() => setDasar(dasar.filter((_, x) => x !== i))}
                disabled={pending || dasar.length === 1}
              />
            </div>
          ))}
        </div>
      </Bagian>

      <Bagian
        judul="Titik lokasi"
        keterangan="Sekurang-kurangnya satu titik wajib berkoordinat. Titik tanpa koordinat tidak memiliki radius."
        aksi={
          <TombolTambah
            onClick={() =>
              setLokasi([
                ...lokasi,
                { nama: "", alamat: "", lat: "", lng: "", radius_meter: "300" },
              ])
            }
            disabled={pending}
          />
        }
      >
        <div className="flex flex-col gap-3">
          {lokasi.map((l, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={l.nama}
                  onChange={(e) => {
                    const baru = [...lokasi];
                    baru[i] = { ...l, nama: e.target.value };
                    setLokasi(baru);
                  }}
                  placeholder="Nama titik"
                  className={KELAS_INPUT}
                  disabled={pending}
                />
                <input
                  value={l.alamat}
                  onChange={(e) => {
                    const baru = [...lokasi];
                    baru[i] = { ...l, alamat: e.target.value };
                    setLokasi(baru);
                  }}
                  placeholder="Alamat"
                  className={KELAS_INPUT}
                  disabled={pending}
                />
                <TombolHapus
                  onClick={() => setLokasi(lokasi.filter((_, x) => x !== i))}
                  disabled={pending || lokasi.length === 1}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input
                  value={l.lat}
                  onChange={(e) => {
                    const baru = [...lokasi];
                    baru[i] = { ...l, lat: e.target.value };
                    setLokasi(baru);
                  }}
                  inputMode="decimal"
                  placeholder="Lintang (-6.9175)"
                  className={KELAS_INPUT}
                  disabled={pending}
                />
                <input
                  value={l.lng}
                  onChange={(e) => {
                    const baru = [...lokasi];
                    baru[i] = { ...l, lng: e.target.value };
                    setLokasi(baru);
                  }}
                  inputMode="decimal"
                  placeholder="Bujur (107.6191)"
                  className={KELAS_INPUT}
                  disabled={pending}
                />
                <input
                  value={l.radius_meter}
                  onChange={(e) => {
                    const baru = [...lokasi];
                    baru[i] = { ...l, radius_meter: e.target.value };
                    setLokasi(baru);
                  }}
                  inputMode="numeric"
                  placeholder="Radius meter (100–2000)"
                  className={KELAS_INPUT}
                  disabled={pending || !l.lat.trim() || !l.lng.trim()}
                />
              </div>
            </div>
          ))}
        </div>
      </Bagian>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bagian
          judul="Panit Penanggung Jawab"
          keterangan="Sekurang-kurangnya satu wajib ditunjuk."
        >
          <DaftarPilih
            orang={calonPanit}
            terpilih={panitTerpilih}
            onAlih={(id) => alihkan(panitTerpilih, setPanitTerpilih, id)}
            disabled={pending}
            kosong="Belum ada akun berperan Panit pada unit Anda."
          />
        </Bagian>

        <Bagian
          judul="Pelaksana"
          keterangan="Boleh Anggota, Panit, atau Kanit — tetapi sekurang-kurangnya satu harus berperan Anggota."
        >
          <DaftarPilih
            orang={calonPelaksana}
            terpilih={pelaksanaTerpilih}
            onAlih={(id) =>
              alihkan(pelaksanaTerpilih, setPelaksanaTerpilih, id)
            }
            disabled={pending}
            kosong="Belum ada akun aktif pada unit Anda."
            tampilkanPeran
          />
        </Bagian>
      </div>

      {kurang.length > 0 && (
        <div className="rounded-lg border border-[var(--amber)] bg-[var(--amber-bg)] p-4 text-sm text-[var(--amber)]">
          Belum lengkap untuk diterbitkan: {kurang.join(", ")}. Anda tetap
          dapat menyimpannya sebagai draf dan melengkapinya nanti.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Terbitkan penugasan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={(e) => {
            const form = (e.currentTarget as HTMLButtonElement).form;
            if (!form) return;
            kirim(
              {
                preventDefault: () => {},
                currentTarget: form,
              } as unknown as React.FormEvent<HTMLFormElement>,
              false,
            );
          }}
        >
          Simpan sebagai draf
        </Button>
      </div>
    </form>
  );
}

function Bagian({
  judul,
  keterangan,
  aksi,
  children,
}: {
  judul: string;
  keterangan?: string;
  aksi?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
          {keterangan && (
            <p className="mt-0.5 text-xs text-muted-foreground">{keterangan}</p>
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
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className={KELAS_LABEL}>
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
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
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

function TombolTambah({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-9 shrink-0 rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
    >
      Tambah baris
    </button>
  );
}

function TombolHapus({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 shrink-0 rounded-md border border-input px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
    >
      Hapus
    </button>
  );
}
