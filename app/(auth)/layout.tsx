import type { ReactNode } from "react";

/**
 * Kerangka bersama untuk halaman di luar (app): Masuk dan Ganti Kata
 * Sandi Wajib. Kartu di tengah pada layar lebar, penuh pada telepon —
 * docs/10-modul-6.1-auth.md §6.1.5 "Ukuran layar".
 *
 * TANPA navigasi apa pun secara sengaja: halaman Ganti Kata Sandi
 * Wajib wajib buntu (KP-6.1-08), dan halaman Masuk memang tidak
 * mengizinkan tautan lain (§6.1.5 "Yang tidak ada").
 */
export default function TataLetakAuth({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sp-navy)] p-4">
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg sm:p-8">
        {children}
      </div>
    </div>
  );
}
