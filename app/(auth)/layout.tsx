import type { ReactNode } from "react";

/**
 * Kerangka bersama untuk halaman di luar (app): Masuk dan Ganti Kata
 * Sandi Wajib. Kartu di tengah pada layar lebar, penuh pada telepon —
 * docs/10-modul-6.1-auth.md §6.1.5 "Ukuran layar".
 *
 * TANPA navigasi apa pun secara sengaja: halaman Ganti Kata Sandi
 * Wajib wajib buntu (KP-6.1-08), dan halaman Masuk memang tidak
 * mengizinkan tautan lain (§6.1.5 "Yang tidak ada").
 *
 * Bentuknya (panggung navy + lambang besar berhuruf lebar + kartu
 * putih terapung) diporting dari #masuk pada si-pantau-mockup-v2.html
 * (docs/CLAUDE.md §7.2 dan komentar di app/globals.css) — dipakai
 * juga untuk Ganti Kata Sandi Wajib karena mockup tidak merancang
 * halaman terpisah untuk itu dan bahasa visual yang sama tetap wajar
 * (bagian KARANGAN, boleh disesuaikan lagi kalau perlu).
 */
export default function TataLetakAuth({ children }: { children: ReactNode }) {
  return (
    <div className="sp-masuk-panggung">
      <div className="sp-masuk-kotak">
        <div className="sp-masuk-lambang">SP</div>
        <h1>SI PANTAU</h1>
        <div className="sp-sub">Sistem Pengawasan Anggota Terpadu</div>
        <div className="sp-masuk-satuan">
          Unit I Subdit IV Ditreskrimsus
          <br />
          Kepolisian Daerah Jawa Barat
        </div>
        <div className="sp-masuk-form">{children}</div>
        <div className="sp-masuk-kaki">
          Aplikasi internal — bukan untuk disebarluaskan
        </div>
      </div>
    </div>
  );
}
