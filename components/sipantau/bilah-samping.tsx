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
import { KeluarTombol } from "./keluar-tombol";
import { inisialNama } from "@/lib/utils/inisial";
import type { ButirMenu } from "@/lib/auth/menu";

const LABEL_PERAN: Record<string, string> = {
  kasubdit: "Kasubdit",
  kanit: "Kanit",
  panit: "Panit",
  anggota: "Anggota",
  pemeliharaan: "Akun Pemeliharaan",
};

/**
 * Bilah samping navy — bentuknya diporting literal dari selector #sb
 * pada si-pantau-mockup-v2.html (docs/CLAUDE.md §7.2; lihat komentar
 * besar di app/globals.css). Hanya merender butir milik peran yang
 * sedang masuk (KP-6.1-18: unsur di luar kewenangan TIDAK dirender
 * sama sekali, bukan dinonaktifkan) — daftar butirnya sendiri tetap
 * dari lib/auth/menu.ts (ATURAN/DATA, bukan dari mockup).
 *
 * Tiga keadaan lebar diatur lewat kelas pada pembungkus .sp-shell
 * (lihat kerangka-aplikasi.tsx), BUKAN di sini:
 *   - lebar (>1024px): penuh, selalu terlihat
 *   - sedang (768-1024px): otomatis mengecil jadi rel ikon, bisa
 *     dipaksa penuh lewat tombol menu di header (kelas .mini)
 *   - sempit (<768px): laci geser dari luar layar (kelas .laci)
 */
export function BilahSamping({
  menu,
  nama,
  peran,
  onNavigasi,
}: {
  menu: ButirMenu[];
  nama: string;
  peran: string;
  onNavigasi: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="sp-sb">
      <div className="sp-sb-merek">
        <div className="sp-sb-tanda">SP</div>
        <div className="sp-sb-nama">
          SI PANTAU
          <small>Subdit IV Ditreskrimsus</small>
        </div>
      </div>

      <div className="sp-sb-orang">
        <div
          className="sp-av"
          style={{ background: "var(--gold)", color: "var(--navy)" }}
        >
          {inisialNama(nama)}
        </div>
        <div className="sp-meta">
          <div className="sp-nm">{nama}</div>
          <div className="sp-rl">{LABEL_PERAN[peran] ?? peran}</div>
        </div>
      </div>

      <nav className="sp-sb-nav">
        {menu.map((item) => {
          const aktif = item.cocokAwalan
            ? pathname.startsWith(item.href)
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigasi}
              className={cn("sp-nav-i", aktif && "on")}
            >
              <IkonMenu href={item.href} />
              <span className="sp-lbl">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sp-sb-kaki">
        <KeluarTombol />
      </div>
    </aside>
  );
}

/**
 * lib/auth/menu.ts belum menyimpan nama ikon per butir (itu detail
 * BENTUK, bukan ATURAN) — dicocokkan lewat awalan rute di sini,
 * meniru padanan ikon per menu pada mockup (dasbor/spt/masuk_kotak/
 * peta/orang). Boleh diperkaya lagi nanti (KARANGAN).
 */
const IKON_PER_AWALAN: Array<[string, LucideIcon]> = [
  ["/beranda", LayoutDashboard],
  ["/penugasan", ClipboardList],
  ["/peta", MapIcon],
  ["/laporan", Inbox],
  ["/akun", Users],
];

function IkonMenu({ href }: { href: string }) {
  const Ikon =
    IKON_PER_AWALAN.find(([awalan]) => href.startsWith(awalan))?.[1] ??
    LayoutDashboard;
  return <Ikon />;
}
