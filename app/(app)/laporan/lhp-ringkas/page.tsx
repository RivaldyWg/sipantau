import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { HalamanBelumDibangun } from "@/components/sipantau/halaman-belum-dibangun";

export default async function HalamanLhpRingkas() {
  await wajibkanSudahSiap();
  return (
    <HalamanBelumDibangun
      judul="LHP Ringkas"
      keterangan="Fitur ini tertulis 'ditunda ke tahap berikutnya' pada docs/CLAUDE.md §10, di luar 13 langkah utama. Tautan menu tetap ditampilkan sesuai tabel §6.1.5, isinya menyusul setelah keputusan pemilik produk."
    />
  );
}
