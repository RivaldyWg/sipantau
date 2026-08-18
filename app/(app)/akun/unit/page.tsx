import { klienServer } from "@/lib/supabase/server";
import { wajibkanSudahSiap } from "@/lib/auth/pengguna";

interface BarisUnit {
  id: string;
  nama: string;
  keterangan: string | null;
  aktif: boolean;
}

/** Daftar Unit — khusus Kasubdit (§6.1.5). Data sungguhan dari public.unit. */
export default async function HalamanDaftarUnit() {
  await wajibkanSudahSiap();
  const supabase = await klienServer();

  const { data: unit } = await supabase
    .from("unit")
    .select("id, nama, keterangan, aktif")
    .order("urutan")
    .returns<BarisUnit[]>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Daftar Unit</h1>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">Keterangan</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(unit ?? []).map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-2">{u.nama}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {u.keterangan ?? "—"}
                </td>
                <td className="px-4 py-2">
                  {u.aktif ? (
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
