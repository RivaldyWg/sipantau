"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { KeluarTombol } from "./keluar-tombol";
import type { ButirMenu } from "@/lib/auth/menu";

const LABEL_PERAN: Record<string, string> = {
  kasubdit: "Kasubdit",
  kanit: "Kanit",
  panit: "Panit",
  anggota: "Anggota",
  pemeliharaan: "Akun Pemeliharaan",
};

/**
 * Bilah samping navy — docs/CLAUDE.md §7.2. Hanya merender butir
 * milik peran yang sedang masuk (KP-6.1-18: unsur di luar kewenangan
 * TIDAK dirender sama sekali, bukan dinonaktifkan).
 *
 * Di layar sempit (< breakpoint md Tailwind, 768px) ini menjadi laci
 * geser (drawer) yang disembunyikan di luar layar sampai dibuka lewat
 * tombol hamburger di KerangkaAplikasi — tanpa ini, lebar tetap 256px
 * "memakan" sebagian besar layar HP dan menyisakan konten yang
 * terpotong sempit. Ditemukan lewat pengujian di perangkat fisik
 * sungguhan (bukan cuma tangkapan layar), bukan diperkirakan di atas
 * kertas. Di layar lebar (md ke atas) tetap statis dan selalu tampak
 * seperti semula.
 */
export function BilahSamping({
  menu,
  nama,
  peran,
  terbuka,
  onTutup,
}: {
  menu: ButirMenu[];
  nama: string;
  peran: string;
  terbuka: boolean;
  onTutup: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col bg-[var(--sp-navy)] text-white transition-transform duration-200 ease-in-out",
        "md:static md:z-auto md:translate-x-0",
        terbuka ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sp-gold)] text-sm font-bold text-[var(--sp-navy)]">
          SP
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">SiPANTAU</p>
          <p className="text-xs leading-tight text-white/60">
            {LABEL_PERAN[peran] ?? peran}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {menu.map((item) => {
            const aktif = item.cocokAwalan
              ? pathname.startsWith(item.href)
              : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onTutup}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    aktif
                      ? "bg-[var(--sp-gold)] text-[var(--sp-navy)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <p className="truncate px-3 pb-2 text-xs text-white/50">{nama}</p>
        <KeluarTombol />
      </div>
    </aside>
  );
}
