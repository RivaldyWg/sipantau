"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  Inbox,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ButirMenu } from "@/lib/auth/menu";

const IKON_PER_AWALAN: Array<[string, LucideIcon]> = [
  ["/beranda", LayoutDashboard],
  ["/penugasan", ClipboardList],
  ["/peta", MapIcon],
  ["/laporan", Inbox],
  ["/akun", Users],
];

/**
 * Bilah navigasi bawah — diporting dari selector #bb pada
 * si-pantau-mockup-v2.html, hanya tampil di layar <768px lewat
 * media query pada .sp-bb di app/globals.css (jadi komponen ini
 * selalu dirender, disembunyikan/ditampilkan murni lewat CSS supaya
 * tidak ada kedipan saat lebar jendela berubah).
 *
 * Mockup membatasi p.bb pada EMPAT butir per peran (KARANGAN, demi
 * muat di layar sempit) — di sini dipakai empat butir PERTAMA dari
 * menu peran yang sebenarnya (lib/auth/menu.ts), bukan daftar
 * terpisah, supaya tidak ada dua sumber kebenaran navigasi.
 */
export function BilahBawah({ menu }: { menu: ButirMenu[] }) {
  const pathname = usePathname();
  const butir = menu.slice(0, 4);

  return (
    <nav className="sp-bb">
      {butir.map((item) => {
        const aktif = item.cocokAwalan
          ? pathname.startsWith(item.href)
          : pathname === item.href;
        const Ikon =
          IKON_PER_AWALAN.find(([awalan]) => item.href.startsWith(awalan))?.[1] ??
          LayoutDashboard;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(aktif && "on")}
          >
            <Ikon />
            <span>{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
