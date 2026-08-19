import "server-only";

import { klienServer } from "@/lib/supabase/server";
import { STATUS_AKTIF, STATUS_RIWAYAT } from "@/lib/penugasan/label";
import type { RingkasanSpt } from "@/components/sipantau/kartu-spt";
import type { StatusPenugasan } from "@/lib/supabase/types";
import type { NilaiSaring } from "@/components/sipantau/saring-penugasan";

/**
 * Pengambilan daftar SPT untuk halaman Daftar dan Riwayat.
 *
 * TIDAK ADA penyaringan lingkup per peran di sini. RLS
 * "penugasan_baca_sesuai_lingkup" (migrasi 0010) sudah memotong
 * barisnya di server. Menambahnya di sini berarti menduplikasi aturan
 * final dan berisiko menyimpang darinya (BR-77).
 *
 * B.9: "Daftar Penugasan memuat yang aktif saja; submenu Riwayat
 * memuat yang selesai dan dibatalkan dengan penyaring bawaan enam
 * bulan." Pemisahannya dilakukan lewat argumen `lingkup`.
 */

export const PER_HALAMAN = 20; // §6.2.5 "Pemuatan bertahap 20 baris"

export interface HasilDaftar {
  daftar: RingkasanSpt[];
  adaLagi: boolean;
  galat: boolean;
}

export function bacaSaring(sp: Record<string, string | undefined>): NilaiSaring {
  return {
    cari: (sp.cari ?? "").trim(),
    status: (sp.status ?? "").trim(),
    prioritas: (sp.prioritas ?? "").trim(),
    dari: (sp.dari ?? "").trim(),
    sampai: (sp.sampai ?? "").trim(),
    panit: (sp.panit ?? "").trim(),
    unit: (sp.unit ?? "").trim(),
    cepat: (sp.cepat ?? "").trim(),
  };
}

export async function ambilDaftarPenugasan(
  nilai: NilaiSaring,
  lingkup: "aktif" | "riwayat",
  batas: number,
): Promise<HasilDaftar> {
  const supabase = await klienServer();

  const statusLingkup: StatusPenugasan[] =
    lingkup === "aktif" ? STATUS_AKTIF : STATUS_RIWAYAT;

  // Penyaring status memilih SATU status, tetapi tetap harus berada di
  // dalam lingkup halamannya — Riwayat tidak boleh menampilkan SPT
  // berjalan hanya karena URL-nya disunting.
  const statusDipakai =
    nilai.status && statusLingkup.includes(nilai.status as StatusPenugasan)
      ? [nilai.status as StatusPenugasan]
      : statusLingkup;

  let kueri = supabase
    .from("penugasan_tampil")
    .select(
      `id, nomor_spt, jenis_kegiatan, judul, objek, sasaran, prioritas, status,
       tanggal_mulai, tanggal_batas, unit_id, lewat_batas, hari_terlampaui,
       dibuat_pada, diubah_pada, diterbitkan_pada, alasan_pembatalan,
       uraian_tugas, nomor_lp, sumber_informasi, berkas_surat_path,
       diterbitkan_oleh, ditugaskan_oleh, ditutup_oleh, ditutup_pada,
       dibatalkan_oleh, dibatalkan_pada, lewat_batas_diberitahukan_pada`,
    )
    .in("status", statusDipakai);

  if (nilai.prioritas) kueri = kueri.eq("prioritas", nilai.prioritas);
  if (nilai.unit) kueri = kueri.eq("unit_id", nilai.unit);

  // Rentang tanggal disaring pada tanggal_mulai — itu tanggal yang
  // dipahami pengguna sebagai "kapan tugasnya", bukan kapan barisnya
  // dibuat.
  if (nilai.dari) kueri = kueri.gte("tanggal_mulai", nilai.dari);
  if (nilai.sampai) kueri = kueri.lte("tanggal_mulai", nilai.sampai);

  if (nilai.cepat === "lewat_batas") kueri = kueri.eq("lewat_batas", true);
  if (nilai.cepat === "bermasalah") kueri = kueri.eq("status", "bermasalah");

  if (nilai.cari) {
    const aman = nilai.cari.replace(/[%,()]/g, " ");
    kueri = kueri.or(
      `nomor_spt.ilike.%${aman}%,judul.ilike.%${aman}%,objek.ilike.%${aman}%,sasaran.ilike.%${aman}%`,
    );
  }

  // Penyaring Panit menuntut penyempitan lewat tabel anak lebih dulu —
  // PostgREST tidak menyaring induk berdasarkan anak dalam satu kueri
  // tanpa relasi bertingkat, jadi id-nya diambil terpisah.
  if (nilai.panit) {
    const { data: idSpt } = await supabase
      .from("penugasan_panit")
      .select("penugasan_id")
      .eq("panit_id", nilai.panit)
      .is("dicabut_pada", null)
      .returns<{ penugasan_id: string }[]>();

    const daftarId = (idSpt ?? []).map((r) => r.penugasan_id);
    if (daftarId.length === 0) return { daftar: [], adaLagi: false, galat: false };
    kueri = kueri.in("id", daftarId);
  }

  // Diminta satu lebih banyak dari batas untuk tahu apakah masih ada
  // sisanya, tanpa perlu kueri hitung terpisah.
  const { data, error } = await kueri
    .order("dibuat_pada", { ascending: false })
    .limit(batas + 1)
    .returns<RingkasanSpt[]>();

  if (error) return { daftar: [], adaLagi: false, galat: true };

  const semua = data ?? [];
  const adaLagi = semua.length > batas;
  const daftar = adaLagi ? semua.slice(0, batas) : semua;

  await lengkapiRingkasan(daftar);

  return { daftar, adaLagi, galat: false };
}

/**
 * Melengkapi kartu dengan titik lokasi pertama dan susunan tim.
 *
 * Diambil dalam dua kueri massal, bukan satu kueri per kartu — dua
 * puluh kartu berarti empat puluh perjalanan bolak-balik kalau
 * dikerjakan per baris.
 */
async function lengkapiRingkasan(daftar: RingkasanSpt[]): Promise<void> {
  if (daftar.length === 0) return;

  const supabase = await klienServer();
  const idSpt = daftar.map((s) => s.id);

  const [lokasi, pelaksana] = await Promise.all([
    supabase
      .from("penugasan_lokasi")
      .select("penugasan_id, urutan, nama")
      .in("penugasan_id", idSpt)
      .order("urutan")
      .returns<{ penugasan_id: string; urutan: number; nama: string }[]>(),
    supabase
      .from("penugasan_pelaksana")
      .select("penugasan_id, urutan, orang:pelaksana_id(nama)")
      .in("penugasan_id", idSpt)
      .is("dicabut_pada", null)
      .order("urutan")
      .returns<
        {
          penugasan_id: string;
          urutan: number;
          orang: { nama: string } | null;
        }[]
      >(),
  ]);

  const petaLokasi = new Map<string, { pertama: string; jumlah: number }>();
  for (const l of lokasi.data ?? []) {
    const ada = petaLokasi.get(l.penugasan_id);
    if (ada) ada.jumlah += 1;
    else petaLokasi.set(l.penugasan_id, { pertama: l.nama, jumlah: 1 });
  }

  const petaTim = new Map<string, { nama: string }[]>();
  for (const p of pelaksana.data ?? []) {
    if (!p.orang) continue;
    const ada = petaTim.get(p.penugasan_id) ?? [];
    ada.push({ nama: p.orang.nama });
    petaTim.set(p.penugasan_id, ada);
  }

  for (const s of daftar) {
    const l = petaLokasi.get(s.id);
    s.lokasi_pertama = l?.pertama ?? null;
    s.jumlah_lokasi = l?.jumlah ?? 0;
    s.pelaksana = petaTim.get(s.id) ?? [];
  }
}

/** Pilihan penyaring Panit dan unit, sesuai kewenangan pembacanya. */
export async function ambilPilihanSaring(peran: string): Promise<{
  panit: { id: string; nama: string }[];
  unit: { id: string; nama: string }[];
}> {
  const supabase = await klienServer();

  const [panit, unit] = await Promise.all([
    peran === "kanit" || peran === "kasubdit"
      ? supabase
          .from("users")
          .select("id, nama")
          .eq("peran", "panit")
          .eq("aktif", true)
          .order("nama")
          .returns<{ id: string; nama: string }[]>()
      : Promise.resolve({ data: [] as { id: string; nama: string }[] }),
    peran === "kasubdit"
      ? supabase
          .from("unit")
          .select("id, nama")
          .eq("aktif", true)
          .order("urutan")
          .returns<{ id: string; nama: string }[]>()
      : Promise.resolve({ data: [] as { id: string; nama: string }[] }),
  ]);

  return { panit: panit.data ?? [], unit: unit.data ?? [] };
}

/**
 * B.9: "Menu Penugasan disembunyikan bagi Panit yang belum pernah
 * ditunjuk sama sekali." Dipakai bilah samping dan halaman daftar.
 * Memeriksa SELURUH penunjukan tanpa memandang dicabut_pada — "belum
 * pernah" berarti benar-benar tidak ada barisnya (BR-21).
 */
export async function panitPernahDitunjuk(): Promise<boolean> {
  const supabase = await klienServer();
  const { count } = await supabase
    .from("penugasan_panit")
    .select("id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}
