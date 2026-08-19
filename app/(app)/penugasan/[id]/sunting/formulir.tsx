"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LABEL_JENIS_KEGIATAN, LABEL_PRIORITAS } from "@/lib/penugasan/label";
import type { PenugasanRow } from "@/lib/supabase/types";
import { suntingPenugasan } from "../aksi";

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function FormulirSunting({ id, spt }: { id: string; spt: PenugasanRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const masihDraf = spt.status === "draf";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const h = await suntingPenugasan(id, fd);
            if (!h.ok) {
              setError(h.error);
              return;
            }
            router.push(`/penugasan/${id}`);
            router.refresh();
          } catch {
            setError("Tidak dapat menghubungi server. Isian Anda masih utuh.");
          }
        });
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      {error && (
        <p className="rounded-lg border border-[var(--red)] bg-[var(--red-bg)] p-4 text-sm text-[var(--red)]">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* KP-6.2-07: setelah terbit, ketiganya terkunci bagi siapa pun. */}
          <Bidang label="Nomor SPT" className="sm:col-span-2">
            <input
              name="nomor_spt"
              defaultValue={spt.nomor_spt ?? ""}
              readOnly={!masihDraf}
              className={`${KELAS_INPUT} font-mono ${!masihDraf ? "bg-secondary" : ""}`}
              disabled={pending}
            />
            {!masihDraf && (
              <span className="text-xs text-muted-foreground">
                Terkunci sejak penugasan diterbitkan.
              </span>
            )}
          </Bidang>

          <Bidang label="Jenis kegiatan">
            <select
              name="jenis_kegiatan"
              defaultValue={spt.jenis_kegiatan}
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
              defaultValue={spt.prioritas}
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
              defaultValue={spt.judul}
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>

          <Bidang label="Objek">
            <input
              name="objek"
              defaultValue={spt.objek ?? ""}
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>
          <Bidang label="Sasaran">
            <input
              name="sasaran"
              defaultValue={spt.sasaran ?? ""}
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>
          <Bidang label="Nomor LP">
            <input
              name="nomor_lp"
              defaultValue={spt.nomor_lp ?? ""}
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>
          <Bidang label="Sumber informasi">
            <input
              name="sumber_informasi"
              defaultValue={spt.sumber_informasi ?? ""}
              className={KELAS_INPUT}
              disabled={pending}
            />
          </Bidang>

          <Bidang label="Tanggal mulai">
            <input
              type="date"
              name="tanggal_mulai"
              defaultValue={spt.tanggal_mulai ?? ""}
              readOnly={!masihDraf}
              className={`${KELAS_INPUT} ${!masihDraf ? "bg-secondary" : ""}`}
              disabled={pending}
            />
            {!masihDraf && (
              <span className="text-xs text-muted-foreground">
                Terkunci. Untuk mengubah batas waktu, gunakan Perpanjang Batas.
              </span>
            )}
          </Bidang>

          <Bidang label="Tanggal batas">
            <input
              type="date"
              value={spt.tanggal_batas ?? ""}
              readOnly
              className={`${KELAS_INPUT} bg-secondary`}
              disabled
            />
            <span className="text-xs text-muted-foreground">
              Diubah lewat Perpanjang Batas supaya alasannya tercatat.
            </span>
          </Bidang>

          <Bidang label="Uraian tugas" className="sm:col-span-2">
            <textarea
              name="uraian_tugas"
              rows={4}
              defaultValue={spt.uraian_tugas ?? ""}
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
          </Bidang>
        </div>
      </section>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push(`/penugasan/${id}`)}
        >
          Batal
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Dasar penugasan dan titik lokasi disunting pada halaman tersendiri yang
        hadir bersama Langkah 7 — keduanya menuntut pemeriksaan tambahan
        terhadap laporan yang sudah merujuk titiknya (KP-6.2-42).
      </p>
    </form>
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
