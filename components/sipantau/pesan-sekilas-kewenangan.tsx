"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * KP-6.1-17: "...ia dialihkan ke beranda perannya disertai pesan
 * sekilas 'Halaman itu di luar kewenangan Anda.'" — proxy.ts
 * menambahkan ?diluar_kewenangan=1 saat memantulkan. Komponen ini
 * menampilkannya sekali lalu membersihkan query-nya dari alamat.
 */
export function PesanSekilasKewenangan() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const munculSekarang = searchParams.get("diluar_kewenangan") === "1";

  const [tersembunyi, setTersembunyi] = useState(false);
  const sudahDibersihkan = useRef(false);

  useEffect(() => {
    if (!munculSekarang) return;

    if (!sudahDibersihkan.current) {
      sudahDibersihkan.current = true;
      router.replace(pathname);
    }

    const t = setTimeout(() => setTersembunyi(true), 4000);
    return () => clearTimeout(t);
  }, [munculSekarang, pathname, router]);

  if (!munculSekarang || tersembunyi) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-[var(--sp-navy)] px-4 py-2 text-sm text-white shadow-lg">
      Halaman itu di luar kewenangan Anda.
    </div>
  );
}
