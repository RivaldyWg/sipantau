/**
 * Dua huruf inisial dari nama pengguna untuk lencana avatar bulat di
 * bilah samping/header — hiasan murni, bukan data (KARANGAN, bentuk
 * meniru avatar berinisial pada si-pantau-mockup-v2.html). Diambil
 * dari huruf pertama dua kata pertama nama; pangkat/gelar di depan
 * nama (mis. "AKBP", "Brigadir") tetap ikut terhitung sebagai kata
 * biasa — cukup untuk hiasan, tidak perlu daftar pangkat baku.
 */
export function inisialNama(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "?";
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return (kata[0][0] + kata[1][0]).toUpperCase();
}
