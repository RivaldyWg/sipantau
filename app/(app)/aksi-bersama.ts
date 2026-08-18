"use server";

import { klienServer } from "@/lib/supabase/server";

/**
 * KP-6.1-26: mengakhiri Sesi Masuk perangkat ini saja (bukan seluruh
 * perangkat — itu hanya terjadi lewat reset kata sandi, KP-6.1-37,
 * yang masih ditunda). Konfirmasi dilakukan di sisi tampilan lewat
 * AlertDialog SEBELUM aksi ini dipanggil (komponen KeluarTombol).
 */
export async function keluar() {
  const supabase = await klienServer();
  // §9.6: "keluar — Setiap pengakhiran Sesi Masuk oleh pengguna."
  // Dicatat SEBELUM signOut, karena catat_jejak_audit butuh auth.uid()
  // dari sesi yang masih aktif.
  await supabase.rpc("catat_jejak_audit", { p_jenis_tindakan: "keluar" });
  await supabase.auth.signOut({ scope: "local" });
}
