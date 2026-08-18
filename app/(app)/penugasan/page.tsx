import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { HalamanBelumDibangun } from "@/components/sipantau/halaman-belum-dibangun";

export default async function HalamanDaftarSpt() {
  await wajibkanSudahSiap();
  return (
    <HalamanBelumDibangun
      judul="Daftar SPT"
      keterangan="Tabel penugasan dan halaman ini dibangun pada Langkah 5-6 (docs/CLAUDE.md §10)."
    />
  );
}
