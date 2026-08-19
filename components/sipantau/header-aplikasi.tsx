"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { inisialNama } from "@/lib/utils/inisial";
import type { ButirMenu } from "@/lib/auth/menu";

/**
 * Header atas — diporting dari selector #hd pada
 * si-pantau-mockup-v2.html (tombol menu + jejak/breadcrumb + avatar
 * di kanan). Lonceng pemberitahuan mockup SENGAJA belum diporting:
 * itu menampilkan halaman "pemberitahuan" yang bergantung pada Modul
 * 6.6-6.9 (docs/60-modul-6.6-6.9-user-notif.md) yang belum dibangun
 * (lihat catatan-kemajuan.md, Langkah 7-9 belum dikerjakan) —
 * ditambahkan begitu modul itu sungguh ada, bukan sebagai tautan
 * yang belum bertujuan.
 */
export function HeaderAplikasi({
  menu,
  nama,
  onTekanMenu,
}: {
  menu: ButirMenu[];
  nama: string;
  onTekanMenu: () => void;
}) {
  const pathname = usePathname();
  const aktif = menu.find((item) =>
    item.cocokAwalan ? pathname.startsWith(item.href) : pathname === item.href,
  );

  return (
    <header className="sp-hd">
      <button
        type="button"
        className="sp-ikon-btn"
        aria-label="Menu"
        onClick={onTekanMenu}
      >
        <Menu />
      </button>

      <div className="sp-jejak">
        <span>SiPANTAU</span>
        <span className="sep">/</span>
        <span className="kini">{aktif?.label ?? "Beranda"}</span>
      </div>

      <div className="sp-hd-kanan">
        <div
          className="sp-av"
          style={{
            width: 34,
            height: 34,
            fontSize: 12,
            background: "var(--gold)",
            color: "var(--navy)",
          }}
        >
          {inisialNama(nama)}
        </div>
      </div>
    </header>
  );
}
