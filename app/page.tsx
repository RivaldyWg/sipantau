import { redirect } from "next/navigation";

/**
 * proxy.ts sudah mengalihkan "/" ke tujuan yang benar (/masuk
 * atau beranda peran) berdasarkan sesi. Berkas ini hanya jaga-jaga
 * kalau proxy ternyata tidak sempat jalan.
 */
export default function Beranda() {
  redirect("/masuk");
}
