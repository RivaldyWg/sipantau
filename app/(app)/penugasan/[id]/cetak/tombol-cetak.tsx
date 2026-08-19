"use client";

/**
 * Tombol cetak dipisah ke Client Component seminimal mungkin supaya
 * halaman suratnya sendiri tetap Server Component — datanya sensitif
 * dan tidak perlu ikut terkirim sebagai muatan klien.
 */
export function TombolCetak() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Cetak surat
    </button>
  );
}
