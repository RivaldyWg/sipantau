"use client";

import { useEffect, useState, useTransition } from "react";

import { hapusFotoLaporan, tautanFoto } from "@/app/(app)/laporan/aksi-foto";
import type { FotoDokumentasiRow } from "@/lib/supabase/types";

/**
 * Deretan thumbnail foto — §6.3.5: ".thumbs". Dipakai untuk kedua
 * kelompok yang diminta rincian laporan: "foto berkoordinat" (dekat
 * peta) dan "foto tanpa koordinat" (kelompok terpisah di bawahnya).
 * Pemanggil yang memutuskan pengelompokannya (lihat halaman rincian),
 * komponen ini hanya merender satu deret apa adanya.
 */
export function GaleriFoto({
  foto,
  bolehHapus,
}: {
  foto: FotoDokumentasiRow[];
  bolehHapus: boolean;
}) {
  const [tautan, setTautan] = useState<Record<string, string | null>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dibatalkan = false;
    (async () => {
      const hasil: Record<string, string | null> = {};
      for (const f of foto) {
        hasil[f.id] = await tautanFoto(f.berkas_path);
      }
      if (!dibatalkan) setTautan(hasil);
    })();
    return () => {
      dibatalkan = true;
    };
  }, [foto]);

  if (foto.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="rounded-md border border-[var(--red)] bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {foto.map((f) => (
          <div key={f.id} className="group relative h-24 w-24 shrink-0">
            {tautan[f.id] ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL bertanda tangan berumur pendek, tidak cocok untuk next/image
              <img
                src={tautan[f.id] ?? undefined}
                alt={f.keterangan ?? "Foto dokumentasi"}
                className="h-24 w-24 rounded-md border border-border object-cover"
              />
            ) : (
              <div className="h-24 w-24 animate-pulse rounded-md border border-border bg-secondary" />
            )}

            {bolehHapus && (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const h = await hapusFotoLaporan(f.id);
                    if (!h.ok) setError(h.error);
                  });
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="Hapus foto"
              >
                ×
              </button>
            )}

            {f.keterangan && (
              <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                {f.keterangan}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
