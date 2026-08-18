import { klienServer } from "@/lib/supabase/server";
import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import type { PenggunaRow } from "@/lib/supabase/types";

const LABEL_PERAN: Record<string, string> = {
  kasubdit: "Kasubdit",
  kanit: "Kanit",
  panit: "Panit",
  anggota: "Anggota",
  pemeliharaan: "Akun Pemeliharaan",
};

/**
 * Beranda Akun Pemeliharaan — KP-6.1-40: "daftar akun dan tombol
 * reset, bukan dashboard peran mana pun." Tombol reset SENGAJA belum
 * ada (Fungsi Tepi reset-kata-sandi masih ditunda, lihat pesan ke
 * pengguna saat Langkah 3 dimulai) — daftarnya sendiri sudah data
 * sungguhan dari public.users (AM-6.1-15: lingkup baca penuh).
 *
 * KP-6.1-41: setiap tindakan Akun Pemeliharaan wajib jejak audit.
 * Membaca daftar ini terhitung tindakan "membaca data perkara" secara
 * luas -> dicatat di sini juga.
 */
export default async function HalamanPemeliharaan() {
  await wajibkanSudahSiap();
  const supabase = await klienServer();

  const { data: akun } = await supabase
    .from("users")
    .select("id, nama, nrp, peran, unit_id, aktif")
    .order("nama")
    .returns<Pick<PenggunaRow, "id" | "nama" | "nrp" | "peran" | "unit_id" | "aktif">[]>();

  // Jenis "akses_pemeliharaan" persis sesuai daftar §9.6 — bukan
  // nilai baru, "Setiap tindakan Akun Pemeliharaan, termasuk
  // pembacaan data perkara".
  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "akses_pemeliharaan",
    p_keterangan: "membaca daftar akun",
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Halaman Pemeliharaan
        </h1>
        <p className="text-sm text-muted-foreground">
          Daftar seluruh akun. Tombol reset kata sandi akan hadir setelah
          Fungsi Tepi reset-kata-sandi selesai dibangun.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">NRP</th>
              <th className="px-4 py-2 font-medium">Peran</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(akun ?? []).map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-2">{a.nama}</td>
                <td className="px-4 py-2">{a.nrp}</td>
                <td className="px-4 py-2">{LABEL_PERAN[a.peran] ?? a.peran}</td>
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
