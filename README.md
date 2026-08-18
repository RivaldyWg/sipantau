# SiPANTAU

Sistem Pengawasan Anggota Terpadu — Unit I Subdit IV Ditreskrimsus Polda Jawa Barat.

Sebelum menyentuh kode apa pun, baca **`docs/CLAUDE.md`** terlebih dahulu. Berkas itu memuat aturan main pembangunan proyek ini (tumpukan teknologi, struktur folder, aturan basis data, aturan frontend, dan urutan pembangunan). Spesifikasi produk lengkap ada di `docs/PETA.md` sebagai peta seluruh dokumen PRD.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Tumpukan teknologi

Next.js (App Router) + TypeScript + Tailwind CSS + Shadcn UI, dengan Supabase (PostgreSQL, Auth, Storage, Realtime) sebagai backend. Rincian lengkap dan batasannya ada di `docs/CLAUDE.md` §3.
