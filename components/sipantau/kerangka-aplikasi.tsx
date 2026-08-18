"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { BilahSamping } from "./bilah-samping";
import type { ButirMenu } from "@/lib/auth/menu";

/**
 * Pembungkus sisi klien untuk kerangka app/(app)/layout.tsx.
 *
 * Menyimpan status buka/tutup bilah samping (BilahSamping) sebagai
 * laci geser di layar sempit, dan menampilkan bilah atas kecil khusus
 * HP (tombol hamburger + nama aplikasi) yang disembunyikan di layar
 * lebar lewat md:hidden — di layar lebar BilahSamping tetap statis
 * seperti semula, bilah atas ini tidak dirender sama sekali.
 *
 * Ditambahkan setelah ditemukan lewat pengujian di perangkat fisik:
 * tanpa ini, bilah samping selebar tetap 256px menyisakan konten
 * yang terpotong sempit di layar HP (docs/CLAUDE.md §7.2 tidak
 * menyebut perilaku responsif secara eksplisit, tapi kegunaan di
 * perangkat genggam adalah premis dasar seluruh proyek ini — lihat
 * docs/00-fondasi.md).
 */
export function KerangkaAplikasi({
  menu,
  nama,
  peran,
  children,
}: {
  menu: ButirMenu[];
  nama: string;
  peran: string;
  children: ReactNode;
}) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <BilahSamping
        menu={menu}
        nama={nama}
        peran={peran}
        terbuka={terbuka}
        onTutup={() => setTerbuka(false)}
      />

      {terbuka && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setTerbuka(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 bg-[var(--sp-navy)] px-4 py-3 text-white md:hidden">
          <button
            type="button"
            aria-label={terbuka ? "Tutup menu" : "Buka menu"}
            onClick={() => setTerbuka((v) => !v)}
            className="rounded-md p-1.5 hover:bg-white/10"
          >
            {terbuka ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold">SiPANTAU</span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
