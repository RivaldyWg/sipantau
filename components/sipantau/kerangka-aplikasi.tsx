"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { BilahSamping } from "./bilah-samping";
import { HeaderAplikasi } from "./header-aplikasi";
import { BilahBawah } from "./bilah-bawah";
import type { ButirMenu } from "@/lib/auth/menu";

/**
 * Pembungkus sisi klien untuk kerangka app/(app)/layout.tsx.
 *
 * Ditulis ulang mengikuti struktur tiga-tingkat #sb/#hd/#bb pada
 * si-pantau-mockup-v2.html (docs/CLAUDE.md §7.2, lihat komentar besar
 * di app/globals.css) — MENGGANTIKAN percobaan sebelumnya (laci
 * hamburger sederhana tanpa rel-ikon maupun bilah bawah) yang dibuat
 * sebelum berkas mockup ditemukan di antara dokumen Proyek:
 *
 *   - lebar (>1024px): bilah samping penuh, selalu terlihat
 *   - sedang (768-1024px): otomatis mengecil jadi rel ikon lewat CSS
 *     saja; tombol menu di header bisa memaksanya penuh lagi lewat
 *     kelas "mini" (dua arah — bukan cuma checkbox satu arah)
 *   - sempit (<768px): bilah samping jadi laci geser (kelas "laci"),
 *     navigasi utama berpindah ke bilah bawah (#bb)
 *
 * "mini" dan "laci" sengaja dua state terpisah (bukan satu enum)
 * karena keduanya independen: tombol menu yang sama memicu salah
 * satu tergantung lebar layar saat ditekan (persis tekanMenu() pada
 * mockup), diperiksa lewat window.innerWidth di dalam pawang klik.
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
  const [laci, setLaci] = useState(false);
  const [mini, setMini] = useState(false);

  function tekanMenu() {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setLaci((v) => !v);
    } else {
      setMini((v) => !v);
    }
  }

  return (
    <div
      className={cn(
        "sp-shell",
        `peran-${peran}`,
        mini && "mini",
        laci && "laci",
      )}
    >
      <BilahSamping
        menu={menu}
        nama={nama}
        peran={peran}
        onNavigasi={() => setLaci(false)}
      />

      <div className="sp-tirai" onClick={() => setLaci(false)} />

      <div className="sp-rangka">
        <HeaderAplikasi menu={menu} nama={nama} onTekanMenu={tekanMenu} />
        <main className="sp-utama">{children}</main>
      </div>

      <BilahBawah menu={menu} />
    </div>
  );
}
