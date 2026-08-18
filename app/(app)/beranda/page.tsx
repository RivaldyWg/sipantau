import { wajibkanSudahSiap } from "@/lib/auth/pengguna";

/**
 * Beranda per peran — docs/10-modul-6.1-auth.md §6.1.5 "Beranda tiap
 * peran" dan "Kondisi kosong". Isi sesungguhnya (dashboard berisi
 * data, daftar SPT sungguhan) baru lahir pada Langkah 5 dan 9
 * (docs/CLAUDE.md §10) — halaman ini hanya menegakkan BENTUK dan
 * KESESUAIAN PERANNYA lebih dulu, sesuai kriteria selesai Langkah 3
 * "Tiap peran melihat menu berbeda".
 */
export default async function HalamanBeranda() {
  const { pengguna } = await wajibkanSudahSiap();

  if (pengguna.peran === "kasubdit") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Dashboard Lintas Unit
        </h1>
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Ringkasan lintas seluruh unit hadir pada Langkah 9 (docs/CLAUDE.md
          §10), setelah data penugasan dan laporan ada.
        </div>
      </div>
    );
  }

  if (pengguna.peran === "kanit") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Dashboard Unit
        </h1>
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Ringkasan unit Anda hadir pada Langkah 9, setelah data penugasan
          dan laporan ada.
        </div>
      </div>
    );
  }

  if (pengguna.peran === "panit") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Daftar SPT yang Anda Awasi
        </h1>
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Belum ada penugasan yang Anda awasi. Penugasan akan muncul di sini
          begitu Kanit menunjuk Anda sebagai penanggung jawab.
        </div>
        <ElemenMulaiTugas />
      </div>
    );
  }

  // anggota
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">
        Daftar SPT untuk Anda
      </h1>
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada penugasan untuk Anda saat ini.
      </div>
      <ElemenMulaiTugas />
    </div>
  );
}

/**
 * Penempatan saja — §6.1.5: "Rincian kendali ini ditetapkan pada
 * Modul 6.4; Modul 6.1 hanya menetapkan penempatannya di beranda."
 * Kendali geser sungguhan (bukan tombol tekan, supaya tidak
 * tersenggol di saku) dibangun pada Langkah 10.
 */
function ElemenMulaiTugas() {
  return (
    <div className="rounded-lg bg-[var(--sp-primary)] p-4 text-center text-sm text-white/80">
      Kendali Mulai Tugas hadir di sini pada Langkah 10 (GPS dan Sesi Tugas).
    </div>
  );
}
