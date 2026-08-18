import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { HalamanBelumDibangun } from "@/components/sipantau/halaman-belum-dibangun";

export default async function HalamanTerbitkanSpt() {
  await wajibkanSudahSiap();
  return (
    <HalamanBelumDibangun
      judul="Terbitkan SPT"
      keterangan="Formulir penerbitan SPT dibangun pada Langkah 6 (docs/CLAUDE.md §10)."
    />
  );
}
