"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { inisialNama } from "@/lib/utils/inisial";
import { waktuIndonesia } from "@/lib/penugasan/label";
import { kelolaTim } from "../aksi";

interface Orang {
  id: string;
  nama: string;
  nrp: string;
  pangkat: string | null;
  peran: string;
  aktif?: boolean;
}

interface Anggota {
  id: string;
  dicabut_pada: string | null;
  alasan_pencabutan: string | null;
  orang: Orang | null;
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function PanelTim({
  id,
  peranTim,
  judul,
  anggota,
  calon,
}: {
  id: string;
  peranTim: "panit" | "pelaksana";
  judul: string;
  anggota: Anggota[];
  calon: Orang[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [galat, setGalat] = useState<string | null>(null);
  const [tambah, setTambah] = useState("");
  const [cabut, setCabut] = useState<string | null>(null);

  const aktif = anggota.filter((a) => !a.dicabut_pada);
  const dicabut = anggota.filter((a) => a.dicabut_pada);
  const sudahAda = new Set(aktif.map((a) => a.orang?.id));
  const tersedia = calon.filter((o) => !sudahAda.has(o.id));

  function jalankan(fd: FormData) {
    if (pending) return;
    setGalat(null);
    startTransition(async () => {
      try {
        const h = await kelolaTim(id, fd);
        if (!h.ok) {
          setGalat(h.error);
          return;
        }
        setTambah("");
        setCabut(null);
        router.refresh();
      } catch {
        setGalat("Tidak dapat menghubungi server.");
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
        <span className="text-xs text-muted-foreground">{aktif.length} aktif</span>
      </div>

      {galat && (
        <p className="border-b border-border bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
          {galat}
        </p>
      )}

      <ul className="divide-y divide-border">
        {aktif.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada yang ditunjuk.
          </li>
        )}

        {aktif.map((a) => (
          <li key={a.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {inisialNama(a.orang?.nama ?? "?")}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {a.orang?.nama ?? "—"}
                    {a.orang && a.orang.aktif === false && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        Akun nonaktif
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.orang?.pangkat ?? "—"} · {a.orang?.nrp ?? "—"} ·{" "}
                    {a.orang?.peran ?? "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCabut(cabut === a.id ? null : (a.orang?.id ?? null))}
                className="shrink-0 rounded-md border border-input px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
              >
                Cabut
              </button>
            </div>

            {cabut === a.orang?.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  fd.set("tindakan", "cabut");
                  fd.set("peran_tim", peranTim);
                  fd.set("orang_id", a.orang?.id ?? "");
                  jalankan(fd);
                }}
                className="mt-3 flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <label className="text-xs font-medium text-foreground">
                  Alasan pencabutan <span className="text-[var(--red)]">*</span>
                </label>
                <input
                  name="alasan_pencabutan"
                  required
                  placeholder="Mis. dipindahtugaskan ke perkara lain"
                  className={KELAS_INPUT}
                  disabled={pending}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="destructive" disabled={pending}>
                    {pending ? "Memproses…" : "Cabut dari penugasan"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCabut(null)}
                    disabled={pending}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>

      {/* Tambah */}
      <div className="border-t border-border px-4 py-3">
        {tersedia.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Seluruh personel yang memenuhi syarat sudah tercantum.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("tindakan", "tambah");
              fd.set("peran_tim", peranTim);
              fd.set("orang_id", tambah);
              jalankan(fd);
            }}
            className="flex flex-wrap gap-2"
          >
            <select
              value={tambah}
              onChange={(e) => setTambah(e.target.value)}
              className={`${KELAS_INPUT} max-w-xs`}
              disabled={pending}
            >
              <option value="">Pilih personel…</option>
              {tersedia.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nama} — {o.peran}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={pending || !tambah}>
              Tambahkan
            </Button>
          </form>
        )}
      </div>

      {/* Riwayat pencabutan — BR-21/BR-27: barisnya tidak pernah hilang */}
      {dicabut.length > 0 && (
        <div className="border-t border-border bg-secondary/40 px-4 py-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            Pernah tercantum
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {dicabut.map((a) => (
              <li key={a.id} className="text-xs text-muted-foreground">
                <span className="text-foreground">{a.orang?.nama ?? "—"}</span> —
                dicabut {waktuIndonesia(a.dicabut_pada)}
                {a.alasan_pencabutan ? `. ${a.alasan_pencabutan}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
