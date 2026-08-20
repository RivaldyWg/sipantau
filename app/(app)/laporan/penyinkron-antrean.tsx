"use client";

import { useEffect, useRef, useState } from "react";

import {
  antreanKedaluwarsa,
  antreanMasihBerlaku,
  hapusDariAntrean,
  perbaruiPercobaanAntrean,
  type BarisAntrean,
} from "@/lib/pelaporan/antrean-luring";
import { kirimLaporan } from "./aksi";

/**
 * Pengirim ulang otomatis Antrean Luring — BR-45, BR-48.
 *
 * Dipasang SEKALI di layout /laporan (bukan di formulir kirim),
 * supaya antrean tetap dicoba dikirim ulang meski pengguna sedang
 * membuka halaman lain di dalam /laporan — mis. baru menutup formulir
 * kirim, jaringan pulih sedetik kemudian saat ia sudah pindah ke
 * daftar laporan.
 *
 * TIDAK merender apa pun ke pengguna kecuali pesan singkat saat ada
 * antrean sedang dikirim — formulir kirim laporan sendiri sudah
 * memberi tahu penggunanya di titik pengiriman awal.
 */
export function PenyinkronAntrean() {
  const [sedangMengirim, setSedangMengirim] = useState(0);
  const [kedaluwarsa, setKedaluwarsa] = useState<BarisAntrean[]>([]);
  const berjalan = useRef(false);

  async function cobaKirimSemua() {
    if (berjalan.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    berjalan.current = true;

    try {
      const baris = await antreanMasihBerlaku();
      setSedangMengirim(baris.length);

      for (const b of baris) {
        try {
          const hasil = await kirimLaporan({
            penugasan_id: b.penugasan_id,
            jenis: b.jenis as Parameters<typeof kirimLaporan>[0]["jenis"],
            uraian: b.uraian,
            kendala: b.kendala,
            status_kegiatan:
              b.status_kegiatan as Parameters<typeof kirimLaporan>[0]["status_kegiatan"],
            lokasi_id: b.lokasi_id,
            lokasi_lat: b.lokasi_lat,
            lokasi_lng: b.lokasi_lng,
            akurasi_meter: b.akurasi_meter,
            alasan_lokasi:
              b.alasan_lokasi as Parameters<typeof kirimLaporan>[0]["alasan_lokasi"],
            alasan_lokasi_lainnya: b.alasan_lokasi_lainnya,
            keterangan_lokasi: b.keterangan_lokasi,
            antrean_id: b.antrean_id,
            direkam_pada: b.direkam_pada,
          });

          if (hasil.ok) {
            await hapusDariAntrean(b.antrean_id);
          } else {
            // Galat VALIDASI (bukan lagi galat jaringan) — baris ini
            // tidak akan pernah berhasil dikirim ulang apa adanya.
            // Dibiarkan di antrean dengan catatan galat supaya
            // pengguna dapat melihatnya, TIDAK dihapus diam-diam
            // (kehilangan pekerjaan pengguna tanpa sepengetahuannya
            // lebih buruk daripada baris menumpuk di antrean).
            await perbaruiPercobaanAntrean(b.antrean_id, hasil.error);
          }
        } catch {
          // Masih gagal jaringan — biarkan di antrean, coba lagi nanti.
          await perbaruiPercobaanAntrean(b.antrean_id, "Jaringan tidak tersedia");
        }
      }

      setKedaluwarsa(await antreanKedaluwarsa());
    } finally {
      berjalan.current = false;
      setSedangMengirim(0);
    }
  }

  useEffect(() => {
    cobaKirimSemua();

    function saatOnline() {
      cobaKirimSemua();
    }
    window.addEventListener("online", saatOnline);

    // Jaga-jaga tambahan: percobaan berkala setiap dua menit selama
    // halaman terbuka, untuk kasus peramban tidak membangkitkan
    // peristiwa 'online' dengan andal (terjadi pada sebagian WebView).
    const interval = setInterval(cobaKirimSemua, 120000);

    return () => {
      window.removeEventListener("online", saatOnline);
      clearInterval(interval);
    };
  }, []);

  if (sedangMengirim === 0 && kedaluwarsa.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {sedangMengirim > 0 && (
        <p className="rounded-md border border-[var(--blue)] bg-[var(--blue-bg)] px-3 py-2 text-xs text-[var(--blue)]">
          Mengirim {sedangMengirim} laporan tertunda dari perangkat ini…
        </p>
      )}
      {kedaluwarsa.length > 0 && (
        <div className="rounded-md border border-[var(--amber)] bg-[var(--amber-bg)] px-3 py-2 text-xs text-[var(--amber)]">
          <p className="font-medium">
            {kedaluwarsa.length} laporan tertunda lebih dari 7 hari dan tidak
            dikirim otomatis.
          </p>
          <button
            type="button"
            className="mt-1 underline underline-offset-2"
            onClick={async () => {
              for (const b of kedaluwarsa) await hapusDariAntrean(b.antrean_id);
              setKedaluwarsa([]);
            }}
          >
            Buang laporan yang kedaluwarsa
          </button>
        </div>
      )}
    </div>
  );
}
