import type { Metadata } from "next";
import "@fontsource/barlow-condensed/latin-500.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./globals.css";

/**
 * docs/si-pantau-mockup-v2.html (acuan BENTUK/RASA resmi — lihat
 * komentar di app/globals.css) memakai tiga fon: Barlow Condensed,
 * Inter, JetBrains Mono.
 *
 * Mockup memuatnya lewat <link> ke fonts.googleapis.com saat runtime.
 * Itu DITOLAK di sini, konsisten dengan alasan Langkah 3 yang
 * menghindari next/font/google: peramban pengguna (di jaringan
 * instansi, yang tidak selalu bisa menjangkau domain Google) akan
 * gagal memuat fon setiap kali membuka aplikasi.
 *
 * Dipakai paket @fontsource/* (mengunduh berkas .woff2 dari registry
 * npm sekali saat `npm install`, lalu Next.js membundelnya sebagai
 * bagian aset aplikasi sendiri) sebagai ganti next/font/google: hasil
 * akhirnya SAMA-SAMA fon disajikan sendiri dari domain aplikasi tanpa
 * peramban pengguna pernah menghubungi Google — tapi tanpa next build
 * itu sendiri butuh menjangkau fonts.googleapis.com (terbukti gagal
 * saat dicoba: proxy sandbox pengembangan ini memblokirnya). Paket
 * @fontsource/* justru diunduh lewat pendaftar (registry) npm biasa,
 * jalur yang sudah pasti bisa dijangkau (semua paket proyek ini lewat
 * jalur itu). Ini lebih aman lagi daripada next/font/google, bukan
 * hanya sama amannya.
 */
export const metadata: Metadata = {
  title: "SiPANTAU",
  description: "Sistem Pengawasan Anggota Terpadu — Unit I Subdit IV Ditreskrimsus Polda Jawa Barat",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
