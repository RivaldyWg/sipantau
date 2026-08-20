import { PenyinkronAntrean } from "./penyinkron-antrean";

/**
 * Layout /laporan — memasang PenyinkronAntrean SEKALI untuk seluruh
 * sub-rute Modul 6.3, supaya Antrean Luring tetap dicoba dikirim
 * ulang saat pengguna berpindah antar halaman di dalam modul ini
 * (daftar -> rincian -> kirim, dst), bukan hanya saat formulir kirim
 * sedang terbuka.
 */
export default function LayoutLaporan({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PenyinkronAntrean />
      {children}
    </div>
  );
}
