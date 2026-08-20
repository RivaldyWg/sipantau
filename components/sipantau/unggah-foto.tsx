"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { unggahFotoLaporan } from "@/app/(app)/laporan/aksi-foto";

/**
 * Dua jalur unggah foto — §6.3.5: "dua tombol berbeda, Ambil Foto dan
 * Pilih dari Galeri, bukan satu area unggah gabungan. Perbedaan
 * keduanya menentukan status foto, jadi pilihannya harus terlihat
 * sebagai dua jalan berbeda sejak awal."
 *
 * BEDA PERLAKUAN KOORDINAT (BR-42):
 *   - Ambil Foto  -> input capture="environment", DAN coba ambil
 *     geolokasi saat ini sebagai koordinat foto (dianggap "diambil di
 *     sini, sekarang").
 *   - Pilih dari Galeri -> TIDAK PERNAH mengambil geolokasi saat ini.
 *     Foto galeri bisa jadi diambil kapan saja, di mana saja — memberi
 *     koordinat sekarang akan MEMALSUKAN fakta, bukan mencatatnya.
 *
 * Dua <input type="file"> terpisah dipakai (bukan satu input dengan
 * capture kondisional) karena beberapa peramban Android mengabaikan
 * atribut capture yang diubah lewat JavaScript setelah render — dua
 * elemen statis lebih andal lintas perangkat.
 */

export function UnggahFoto({
  laporanId,
  onSelesai,
}: {
  laporanId: string;
  onSelesai?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const inputKamera = useRef<HTMLInputElement>(null);
  const inputGaleri = useRef<HTMLInputElement>(null);

  function unggah(berkas: File, dariKamera: boolean) {
    setError(null);

    function kirim(koordinat: { lat: number; lng: number; akurasi: number } | null) {
      startTransition(async () => {
        const fd = new FormData();
        fd.set("berkas", berkas);
        fd.set("keterangan", keterangan);
        if (koordinat) {
          fd.set("lat", String(koordinat.lat));
          fd.set("lng", String(koordinat.lng));
          fd.set("akurasi_meter", String(koordinat.akurasi));
          fd.set("diambil_pada", new Date().toISOString());
        }

        const hasil = await unggahFotoLaporan(laporanId, fd);
        if (!hasil.ok) {
          setError(hasil.error);
          return;
        }
        setKeterangan("");
        if (inputKamera.current) inputKamera.current.value = "";
        if (inputGaleri.current) inputGaleri.current.value = "";
        onSelesai?.();
      });
    }

    // BR-42: hanya foto dari KAMERA yang mencoba mengambil koordinat
    // saat ini — foto galeri tidak pernah diberi koordinat sekarang.
    if (dariKamera && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          kirim({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            akurasi: pos.coords.accuracy,
          }),
        () => kirim(null), // gagal ambil lokasi -> tetap unggah, tanpa koordinat
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      kirim(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-md border border-[var(--red)] bg-[var(--red-bg)] px-3 py-2 text-sm text-[var(--red)]">
          {error}
        </p>
      )}

      <input
        value={keterangan}
        onChange={(e) => setKeterangan(e.target.value)}
        placeholder="Keterangan foto (opsional)"
        disabled={pending}
        className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      />

      <div className="flex gap-2">
        <input
          ref={inputKamera}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) unggah(f, true);
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => inputKamera.current?.click()}
          className="flex-1"
        >
          {pending ? "Mengunggah…" : "Ambil Foto"}
        </Button>

        <input
          ref={inputGaleri}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) unggah(f, false);
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => inputGaleri.current?.click()}
          className="flex-1"
        >
          Pilih dari Galeri
        </Button>
      </div>
    </div>
  );
}
