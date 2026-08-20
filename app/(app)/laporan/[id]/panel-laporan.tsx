"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { waktuLaporan, LABEL_JENIS_CATATAN } from "@/lib/pelaporan/label";
import type { CatatanLaporanRow, LaporanHarianRow } from "@/lib/supabase/types";
import {
  beriCatatan,
  setujuiLaporan,
  suntingLaporan,
  tarikLaporan,
} from "../aksi";

/**
 * Panel tindakan + daftar catatan pada halaman rincian laporan.
 *
 * KP-6.3-42: laporan disetujui/ditarik TIDAK menampilkan tombol
 * sunting/tarik/tambah foto sama sekali — bukan menampilkannya dalam
 * keadaan nonaktif (BR-11).
 *
 * KP-6.3-43: peninjau yang membuka laporan sendiri (akuPelapor=true)
 * tidak diberi tombol Beri Catatan — dikendalikan lewat prop
 * bolehTinjau yang sudah menghitung (bukan akuPelapor) di pemanggil.
 */

interface Props {
  laporan: LaporanHarianRow;
  catatan: (CatatanLaporanRow & { peninjau_nama: string | null })[];
  bolehTinjau: boolean;
  bolehSetujui: boolean;
  bolehTarik: boolean;
  bolehSunting: boolean;
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function PanelLaporan({
  laporan,
  catatan,
  bolehTinjau,
  bolehSetujui,
  bolehTarik,
  bolehSunting,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [buka, setBuka] = useState<
    null | "sunting" | "tarik" | "catatan" | "minta_perbaikan" | "setujui"
  >(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [kabar, setKabar] = useState<string | null>(null);

  function jalankan(fn: () => Promise<{ ok: boolean; error?: string; pesan?: string }>) {
    if (pending) return;
    setGalat(null);
    setKabar(null);
    startTransition(async () => {
      try {
        const h = await fn();
        if (!h.ok) {
          setGalat(h.error ?? "Tindakan gagal.");
          return;
        }
        setBuka(null);
        setKabar(h.pesan ?? "Tersimpan.");
        router.refresh();
      } catch {
        setGalat("Tidak dapat menghubungi server. Periksa jaringan Anda.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {bolehSunting && (
          <Tombol onClick={() => setBuka(buka === "sunting" ? null : "sunting")}>
            Sunting Laporan
          </Tombol>
        )}
        {bolehTarik && (
          <Tombol onClick={() => setBuka(buka === "tarik" ? null : "tarik")} bahaya>
            Tarik Laporan
          </Tombol>
        )}
        {bolehTinjau && (
          <>
            <Tombol onClick={() => setBuka(buka === "catatan" ? null : "catatan")}>
              Beri Catatan
            </Tombol>
            <Tombol
              onClick={() => setBuka(buka === "minta_perbaikan" ? null : "minta_perbaikan")}
            >
              Minta Perbaikan
            </Tombol>
          </>
        )}
        {bolehSetujui && laporan.status_laporan !== "disetujui" && (
          <Tombol onClick={() => setBuka(buka === "setujui" ? null : "setujui")}>
            Setujui Laporan
          </Tombol>
        )}
      </div>

      {kabar && (
        <p className="rounded-md border border-[var(--green)] bg-[var(--green-bg)] px-3 py-2 text-sm text-[var(--green)]">
          {kabar}
        </p>
      )}

      {buka === "sunting" && (
        <Kotak judul="Sunting laporan" onTutup={() => setBuka(null)} galat={galat}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() =>
                suntingLaporan(laporan.id, {
                  uraian: String(fd.get("uraian") ?? ""),
                  kendala: String(fd.get("kendala") ?? ""),
                  status_kegiatan: String(fd.get("status_kegiatan") ?? "berjalan") as
                    LaporanHarianRow["status_kegiatan"],
                }),
              );
            }}
            className="flex flex-col gap-3"
          >
            <textarea
              name="uraian"
              defaultValue={laporan.uraian}
              rows={4}
              required
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
            <textarea
              name="kendala"
              defaultValue={laporan.kendala ?? ""}
              placeholder="Kendala (opsional)"
              rows={2}
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
            <select
              name="status_kegiatan"
              defaultValue={laporan.status_kegiatan}
              className={KELAS_INPUT}
              disabled={pending}
            >
              <option value="berjalan">Berjalan</option>
              <option value="selesai">Selesai</option>
              <option value="bermasalah">Bermasalah</option>
            </select>
            <Button type="submit" disabled={pending} className="self-start">
              {pending ? "Menyimpan…" : "Simpan perubahan"}
            </Button>
          </form>
        </Kotak>
      )}

      {buka === "tarik" && (
        <Kotak judul="Tarik laporan" onTutup={() => setBuka(null)} galat={galat}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() => tarikLaporan(laporan.id, String(fd.get("alasan") ?? "")));
            }}
            className="flex flex-col gap-3"
          >
            <label className="text-xs font-medium text-foreground">
              Alasan penarikan <span className="text-[var(--red)]">*</span>
            </label>
            <textarea
              name="alasan"
              required
              rows={2}
              placeholder="Mis. salah kirim ke SPT lain"
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Laporan tetap tersimpan dan tetap terbaca peninjau, ditandai ditarik.
              Bukan penghapusan.
            </p>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className="self-start"
            >
              {pending ? "Memproses…" : "Tarik laporan"}
            </Button>
          </form>
        </Kotak>
      )}

      {(buka === "catatan" || buka === "minta_perbaikan") && (
        <Kotak
          judul={buka === "minta_perbaikan" ? "Minta perbaikan" : "Beri catatan"}
          onTutup={() => setBuka(null)}
          galat={galat}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() =>
                beriCatatan(
                  laporan.id,
                  buka === "minta_perbaikan" ? "minta_perbaikan" : "catatan",
                  String(fd.get("isi") ?? ""),
                ),
              );
            }}
            className="flex flex-col gap-3"
          >
            <textarea
              name="isi"
              required
              rows={3}
              placeholder={
                buka === "minta_perbaikan"
                  ? "Jelaskan apa yang perlu diperbaiki pelapor."
                  : "Tulis catatan Anda."
              }
              className={`${KELAS_INPUT} h-auto py-2`}
              disabled={pending}
            />
            {buka === "minta_perbaikan" && (
              <p className="text-xs text-muted-foreground">
                Laporan akan berpindah ke status Perlu Diperbaiki dan pelapor
                menerima pemberitahuan.
              </p>
            )}
            <Button type="submit" disabled={pending} className="self-start">
              {pending ? "Mengirim…" : "Kirim"}
            </Button>
          </form>
        </Kotak>
      )}

      {buka === "setujui" && (
        <Kotak judul="Setujui laporan" onTutup={() => setBuka(null)} galat={galat}>
          <p className="text-sm text-foreground">
            Setelah disetujui, laporan ini terkunci bagi siapa pun — tidak dapat
            disunting maupun ditarik. Persetujuan tidak wajib dan bukan syarat
            keabsahan laporan.
          </p>
          <Button
            onClick={() => jalankan(() => setujuiLaporan(laporan.id))}
            disabled={pending}
            className="mt-3"
          >
            {pending ? "Memproses…" : "Setujui laporan ini"}
          </Button>
        </Kotak>
      )}

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Catatan ({catatan.length})
          </h2>
        </div>
        {catatan.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada catatan.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {catatan.map((c) => (
              <li key={c.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {c.peninjau_nama ?? "—"}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                    {LABEL_JENIS_CATATAN[c.jenis]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {waktuLaporan(c.dibuat_pada)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                  {c.isi}
                </p>
                {c.disunting_pada && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Disunting {waktuLaporan(c.disunting_pada)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Tombol({
  onClick,
  bahaya,
  children,
}: {
  onClick: () => void;
  bahaya?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        bahaya
          ? "inline-flex h-9 items-center rounded-md border border-[var(--red)] px-3 text-sm font-medium text-[var(--red)] transition-colors hover:bg-[var(--red-bg)]"
          : "inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      }
    >
      {children}
    </button>
  );
}

function Kotak({
  judul,
  galat,
  onTutup,
  children,
}: {
  judul: string;
  galat: string | null;
  onTutup: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
        <button
          type="button"
          onClick={onTutup}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Tutup
        </button>
      </div>
      {galat && (
        <p className="mb-3 rounded-md border border-[var(--red)] bg-[var(--red-bg)] px-3 py-2 text-sm text-[var(--red)]">
          {galat}
        </p>
      )}
      {children}
    </section>
  );
}
