import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Dimatikan: Next.js 16 menulis ulang /CLAUDE.md dan /AGENTS.md di akar
  // proyek setiap kali `next dev` berjalan. Proyek ini sudah punya
  // docs/CLAUDE.md sebagai aturan main pembangunan (dibaca CLAUDE.md
  // sendiri di §2), dan dua berkas CLAUDE.md yang berbeda isi akan
  // membingungkan — sesi mana pun bisa membaca yang salah.
  agentRules: false,
};

export default nextConfig;
