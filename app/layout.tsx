import type { Metadata } from "next";
import "./globals.css";

// Sengaja TIDAK memakai next/font/google (Geist): fon itu diambil dari
// fonts.googleapis.com saat build, dan jaringan instansi tidak selalu dapat
// menjangkaunya. Dipakai tumpukan fon sistem lewat CSS biasa di globals.css.

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
