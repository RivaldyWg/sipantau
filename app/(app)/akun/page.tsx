import { klienServer } from "@/lib/supabase/server";
import { wajibkanSudahSiap } from "@/lib/auth/pengguna";

const LABEL_PERAN: Record<string, string> = {
  kasubdit: "Kasubdit",
  kanit: "Kanit",
  panit: "Panit",
  anggota: "Anggota",
  pemeliharaan: "Akun Pemeliharaan",
};

interface BarisAkun {
  id: string;
  nama: string;
  nrp: string;
  peran: string;
  aktif: boolean;
  unit: { nama: string } | null;
}

/**
 * Manajemen User — khusus Kasubdit (§6.1.5, §4). Daftar sudah data
 * sungguhan (RLS S1 sudah menguji Kasubdit membaca seluruh akun).
 * Tombol tambah/nonaktifkan/reset SENGAJA belum ada — masing-masing
 * lewat Fungsi Tepi buat-akun/nonaktifkan-akun/reset-kata-sandi yang
 * belum dibangun (§8, ditunda dari Langkah 3).
 */
export default async function HalamanManajemenUser() {
  await wajibkanSudahSiap();
  const supabase = await klienServer();

  const { data: akun } = await supabase
    .from("users")
    .select("id, nama, nrp, peran, aktif, unit:unit_id(nama)")
    .order("nama")
    .returns<BarisAkun[]>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Manajemen User
        </h1>
        <p className="text-sm text-muted-foreground">
          Tambah akun, nonaktifkan, dan reset kata sandi akan hadir setelah
          Fungsi Tepi terkait selesai dibangun.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">NRP</th>
              <th className="px-4 py-2 font-medium">Peran</th>
              <th className="px-4 py-2 font-medium">Unit</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(akun ?? []).map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-2">{a.nama}</td>
                <td className="px-4 py-2">{a.nrp}</td>
                <td className="px-4 py-2">{LABEL_PERAN[a.peran] ?? a.peran}</td>
                <td className="px-4 py-2">{a.unit?.nama ?? "—"}</td>
                <td className="px-4 py-2">
                  {a.aktif ? (
                    <span className="text-[var(--sp-green)]">Aktif</span>
                  ) : (
                    <span className="text-[var(--sp-red)]">Tidak aktif</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
