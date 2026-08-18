import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { HalamanBelumDibangun } from "@/components/sipantau/halaman-belum-dibangun";

export default async function HalamanPeta() {
  await wajibkanSudahSiap();
  return (
    <HalamanBelumDibangun
      judul="Peta Tracking"
      keterangan="Peta waktu nyata (Leaflet + OpenStreetMap) dibangun pada Langkah 10 (docs/CLAUDE.md §10), setelah Sesi Tugas dan location_logs ada."
    />
  );
}
