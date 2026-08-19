"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";

/**
 * Peta titik lokasi SPT — docs/20-modul-6.2-penugasan.md §6.2.5.
 *
 * Dipakai dua tempat dengan perilaku berbeda:
 *   - Formulir terbitkan/sunting  -> bisaSunting = true
 *   - Halaman rincian             -> bisaSunting = false
 *
 * TIGA KEPUTUSAN TEKNIS YANG PERLU DIKETAHUI SEBELUM MENGUBAH:
 *
 * 1. Leaflet diimpor lewat `await import()` DI DALAM useEffect, bukan
 *    di puncak berkas. Leaflet menyentuh `window` saat modulnya
 *    dievaluasi; impor di puncak akan meledak saat Next.js
 *    memprarender halaman di server, meski berkas ini "use client".
 *
 * 2. Penanda memakai divIcon bernomor, BUKAN ikon gambar bawaan
 *    Leaflet. Selain karena §5.16 memang menamai titik "Titik 1,
 *    Titik 2", ini sekaligus menghindari cacat lama Leaflet di
 *    bundler mana pun: jalur gambar marker-icon.png rusak dan pin
 *    tampil sebagai gambar patah.
 *
 * 3. Pencarian nama tempat memakai Nominatim OpenStreetMap. Layanan
 *    itu meminta pemakaian wajar — karena itu pencarian hanya jalan
 *    saat tombol ditekan, TIDAK saat mengetik. Jangan diubah menjadi
 *    pencarian langsung-ketik tanpa penahan waktu.
 */

export interface TitikPeta {
  nama: string;
  lat: number | null;
  lng: number | null;
  radius_meter: number | null;
}

interface Props {
  titik: TitikPeta[];
  bisaSunting?: boolean;
  /** Indeks titik yang sedang disunting; pin baru jatuh ke sini. */
  indeksAktif?: number;
  onPindahTitik?: (indeks: number, lat: number, lng: number) => void;
  tinggi?: number;
}

const PUSAT_BAWAAN: [number, number] = [-6.9175, 107.6191]; // Bandung
const UBIN = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATRIBUSI = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function PetaTitik({
  titik,
  bisaSunting = false,
  indeksAktif = 0,
  onPindahTitik,
  tinggi = 320,
}: Props) {
  const wadahRef = useRef<HTMLDivElement | null>(null);
  const petaRef = useRef<L.Map | null>(null);
  const lapisanRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);

  const [siap, setSiap] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Disimpan dalam ref supaya penangan klik peta selalu membaca nilai
  // terbaru tanpa perlu memasang ulang penangannya setiap render.
  const aktifRef = useRef(indeksAktif);
  const pindahRef = useRef(onPindahTitik);
  const suntingRef = useRef(bisaSunting);
  useEffect(() => {
    aktifRef.current = indeksAktif;
    pindahRef.current = onPindahTitik;
    suntingRef.current = bisaSunting;
  }, [indeksAktif, onPindahTitik, bisaSunting]);

  // --- Pemasangan peta, sekali saja -----------------------------------
  useEffect(() => {
    let dibatalkan = false;

    (async () => {
      try {
        const leaflet = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        if (dibatalkan || !wadahRef.current || petaRef.current) return;

        leafletRef.current = leaflet;

        const peta = leaflet.map(wadahRef.current, {
          center: PUSAT_BAWAAN,
          zoom: 12,
          scrollWheelZoom: false, // supaya menggulir halaman tidak tersangkut peta
        });

        leaflet.tileLayer(UBIN, { attribution: ATRIBUSI, maxZoom: 19 }).addTo(peta);
        lapisanRef.current = leaflet.layerGroup().addTo(peta);

        peta.on("click", (e: L.LeafletMouseEvent) => {
          if (!suntingRef.current) return;
          pindahRef.current?.(aktifRef.current, e.latlng.lat, e.latlng.lng);
        });

        petaRef.current = peta;
        setSiap(true);

        // Leaflet salah menghitung ukuran bila wadahnya baru muncul
        // (mis. di dalam langkah wizard yang sebelumnya tersembunyi).
        setTimeout(() => peta.invalidateSize(), 120);
      } catch {
        if (!dibatalkan) {
          setGalat("Peta tidak dapat dimuat. Koordinat masih dapat diketik manual.");
        }
      }
    })();

    return () => {
      dibatalkan = true;
      petaRef.current?.remove();
      petaRef.current = null;
      lapisanRef.current = null;
    };
  }, []);

  // --- Gambar ulang penanda tiap kali titik berubah --------------------
  useEffect(() => {
    const leaflet = leafletRef.current;
    const peta = petaRef.current;
    const lapisan = lapisanRef.current;
    if (!leaflet || !peta || !lapisan || !siap) return;

    lapisan.clearLayers();

    const berkoordinat = titik
      .map((t, i) => ({ ...t, urutan: i + 1 }))
      .filter((t) => t.lat !== null && t.lng !== null);

    berkoordinat.forEach((t) => {
      const aktif = t.urutan - 1 === indeksAktif && bisaSunting;

      const ikon = leaflet.divIcon({
        className: "",
        html: `<div style="
          display:flex;align-items:center;justify-content:center;
          width:28px;height:28px;border-radius:50%;
          background:${aktif ? "var(--gold)" : "var(--primary)"};
          color:#fff;font:600 13px/1 var(--body),system-ui,sans-serif;
          border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)
        ">${t.urutan}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      leaflet
        .marker([t.lat as number, t.lng as number], {
          icon: ikon,
          draggable: bisaSunting,
        })
        .on("dragend", (e: L.DragEndEvent) => {
          const p = (e.target as L.Marker).getLatLng();
          pindahRef.current?.(t.urutan - 1, p.lat, p.lng);
        })
        .bindTooltip(`Titik ${t.urutan}${t.nama ? ` — ${t.nama}` : ""}`)
        .addTo(lapisan);

      if (t.radius_meter) {
        leaflet
          .circle([t.lat as number, t.lng as number], {
            radius: t.radius_meter,
            color: "var(--primary)",
            weight: 1,
            fillOpacity: 0.08,
          })
          .addTo(lapisan);
      }
    });

    if (berkoordinat.length === 1) {
      peta.setView(
        [berkoordinat[0].lat as number, berkoordinat[0].lng as number],
        15,
      );
    } else if (berkoordinat.length > 1) {
      peta.fitBounds(
        leaflet.latLngBounds(
          berkoordinat.map((t) => [t.lat as number, t.lng as number] as [number, number]),
        ),
        { padding: [40, 40], maxZoom: 16 },
      );
    }
  }, [titik, siap, indeksAktif, bisaSunting]);

  return (
    <div className="relative overflow-hidden rounded-md border border-border">
      <div ref={wadahRef} style={{ height: tinggi }} className="w-full" />

      {/* §6.2.5: kotak abu-abu bertuliskan Memuat peta selama ubin belum tiba */}
      {!siap && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-secondary text-sm text-muted-foreground"
          style={{ height: tinggi }}
        >
          {galat ?? "Memuat peta…"}
        </div>
      )}

      {bisaSunting && siap && (
        <p className="border-t border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          Klik peta untuk menjatuhkan pin Titik {indeksAktif + 1}, atau seret pin
          yang sudah ada untuk menggesernya.
        </p>
      )}
    </div>
  );
}

/**
 * Pencarian nama tempat lewat Nominatim.
 *
 * Dipisah dari komponen peta supaya formulir bisa memakainya tanpa
 * ikut memuat Leaflet, dan supaya kegagalan jaringannya tidak
 * merobohkan peta.
 */
export async function cariTempat(
  kueri: string,
): Promise<{ nama: string; lat: number; lng: number }[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", kueri);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "id");

  const jawaban = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!jawaban.ok) throw new Error("gagal");

  const hasil = (await jawaban.json()) as {
    display_name: string;
    lat: string;
    lon: string;
  }[];

  return hasil.map((h) => ({
    nama: h.display_name,
    lat: Number(h.lat),
    lng: Number(h.lon),
  }));
}
