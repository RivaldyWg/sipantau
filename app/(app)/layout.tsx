import type { ReactNode } from "react";
import { Suspense } from "react";

import { wajibkanSudahSiap } from "@/lib/auth/pengguna";
import { menuUntukPeran } from "@/lib/auth/menu";
import { KerangkaAplikasi } from "@/components/sipantau/kerangka-aplikasi";
import { PesanSekilasKewenangan } from "@/components/sipantau/pesan-sekilas-kewenangan";

/**
 * Kerangka seluruh halaman setelah masuk (docs/CLAUDE.md §4).
 * proxy.ts sudah menegakkan penjaga rute (KP-6.1-07/08/17/24);
 * wajibkanSudahSiap() di sini adalah lapis kedua yang sekaligus
 * menyediakan data pengguna untuk merender bilah samping.
 *
 * Akun Pemeliharaan SENGAJA memakai kerangka yang sama (supaya
 * "Keluar" tetap ada), tetapi menuUntukPeran('pemeliharaan')
 * mengembalikan larik kosong — KP-6.1-40/42: ia tidak muncul di
 * menu peran operasional mana pun, dan sebaliknya.
 */
export default async function TataLetakApp({
  children,
}: {
  children: ReactNode;
}) {
  const { pengguna } = await wajibkanSudahSiap();
  const menu = menuUntukPeran(pengguna.peran);

  return (
    <>
      <KerangkaAplikasi menu={menu} nama={pengguna.nama} peran={pengguna.peran}>
        {children}
      </KerangkaAplikasi>
      <Suspense fallback={null}>
        <PesanSekilasKewenangan />
      </Suspense>
    </>
  );
}
