import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { HalamanBelumDibangun } from "@/components/sipantau/halaman-belum-dibangun";

export default async function HalamanLaporan() {
  await wajibkanSudahSiap();
  return (
    <HalamanBelumDibangun
      judul="Laporan"
      keterangan="Tabel laporan, catatan, dan foto dibangun pada Langkah 7-8 (docs/CLAUDE.md §10)."
    />
  );
}
