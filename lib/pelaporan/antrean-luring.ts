"use client";

/**
 * Penyimpanan sisi klien untuk Modul 6.3 — dua hal yang BERBEDA
 * disengaja tidak digabung strukturnya (docs/30-modul-6.3-pelaporan.md
 * §3.8, BR-45 s/d BR-48, KP-6.3-11 s/d 15):
 *
 * 1. DRAF — isian yang BELUM ditekan kirim sama sekali. Tidak pernah
 *    menyentuh basis data, tidak pernah terbaca siapa pun termasuk
 *    pimpinan (KP-6.3-12). Hilang kalau data aplikasi dibersihkan, dan
 *    pengguna WAJIB diberi tahu soal itu di dekat tombol Simpan Draf
 *    (KP-6.3-15) — teks itu ada di formulir, bukan di sini.
 *
 * 2. ANTREAN — isian yang SUDAH ditekan kirim oleh pengguna, tetapi
 *    permintaan ke server gagal karena jaringan. Baris ini AKTIF
 *    dicoba kirim ulang otomatis begitu jaringan pulih (BR-45).
 *    Setiap baris antrean membawa `antrean_id` yang dibuat SEKALI saat
 *    pengguna menekan kirim (BR-46) — dikirim ulang dengan id yang
 *    sama supaya percobaan kedua/ketiga tidak menghasilkan baris
 *    kembar di server (indeks unik `uq_laporan_antrean_id`, migrasi
 *    0017).
 *
 * Satu draf tidak pernah "naik pangkat" jadi satu baris antrean di
 * tempat yang sama — begitu pengguna menekan kirim, isian pindah total
 * ke object store antrean dan draf yang bersangkutan dihapus
 * (KP-6.3-14). Keduanya tetap dua object store terpisah supaya
 * pertanyaan "apakah ini sudah ditekan kirim atau belum" selalu
 * terjawab oleh DI OBJECT STORE MANA baris itu berada, bukan oleh
 * sebuah kolom status yang bisa lupa diperbarui.
 *
 * IndexedDB dipakai (bukan localStorage) karena antrean bisa menyimpan
 * banyak baris terstruktur dan Server Action tidak dapat menuliskan
 * langsung ke sini — retry hanya jalan dari peramban.
 */

const NAMA_DB = "sipantau-pelaporan";
const VERSI_DB = 1;
const TOKO_DRAF = "draf";
const TOKO_ANTREAN = "antrean";

export interface DrafLaporan {
  /** Kunci: penugasan_id — satu draf aktif per SPT (KP-6.3-13). */
  penugasan_id: string;
  jenis: string;
  uraian: string;
  kendala: string;
  status_kegiatan: string;
  lokasi_id: string | null;
  disimpan_pada: string;
}

export interface BarisAntrean {
  /** Kunci: antrean_id — dibuat sekali saat kirim (BR-46). */
  antrean_id: string;
  penugasan_id: string;
  jenis: string;
  uraian: string;
  kendala: string;
  status_kegiatan: string;
  lokasi_id: string | null;
  lokasi_lat: number | null;
  lokasi_lng: number | null;
  akurasi_meter: number | null;
  alasan_lokasi: string | null;
  alasan_lokasi_lainnya: string | null;
  keterangan_lokasi: string | null;
  /** Waktu PERANGKAT saat tombol kirim ditekan (BR-45) — beku sejak baris ini lahir. */
  direkam_pada: string;
  percobaan_terakhir: string | null;
  jumlah_percobaan: number;
  galat_terakhir: string | null;
}

function bukaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia di lingkungan ini."));
      return;
    }
    const req = indexedDB.open(NAMA_DB, VERSI_DB);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TOKO_DRAF)) {
        db.createObjectStore(TOKO_DRAF, { keyPath: "penugasan_id" });
      }
      if (!db.objectStoreNames.contains(TOKO_ANTREAN)) {
        db.createObjectStore(TOKO_ANTREAN, { keyPath: "antrean_id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function transaksi<T>(
  toko: string,
  mode: IDBTransactionMode,
  kerja: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await bukaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(toko, mode);
    const store = tx.objectStore(toko);
    const req = kerja(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

// ------------------------------- Draf -------------------------------

export async function simpanDraf(draf: DrafLaporan): Promise<void> {
  await transaksi(TOKO_DRAF, "readwrite", (s) => s.put(draf));
}

export async function ambilDraf(
  penugasanId: string,
): Promise<DrafLaporan | undefined> {
  return transaksi(TOKO_DRAF, "readonly", (s) => s.get(penugasanId));
}

export async function hapusDraf(penugasanId: string): Promise<void> {
  await transaksi(TOKO_DRAF, "readwrite", (s) => s.delete(penugasanId));
}

// ------------------------------ Antrean ------------------------------

export async function tambahKeAntrean(baris: BarisAntrean): Promise<void> {
  await transaksi(TOKO_ANTREAN, "readwrite", (s) => s.put(baris));
}

export async function daftarAntrean(): Promise<BarisAntrean[]> {
  return transaksi(TOKO_ANTREAN, "readonly", (s) => s.getAll());
}

export async function hapusDariAntrean(antreanId: string): Promise<void> {
  await transaksi(TOKO_ANTREAN, "readwrite", (s) => s.delete(antreanId));
}

export async function perbaruiPercobaanAntrean(
  antreanId: string,
  galat: string,
): Promise<void> {
  const baris = await transaksi<BarisAntrean | undefined>(
    TOKO_ANTREAN,
    "readonly",
    (s) => s.get(antreanId),
  );
  if (!baris) return;
  baris.jumlah_percobaan += 1;
  baris.percobaan_terakhir = new Date().toISOString();
  baris.galat_terakhir = galat;
  await transaksi(TOKO_ANTREAN, "readwrite", (s) => s.put(baris));
}

/**
 * BR-48: kiriman yang mengendap lebih dari tujuh hari sejak
 * direkam_pada TIDAK dikirim otomatis lagi. Dipisah dari daftarAntrean
 * biasa supaya pemanggil bisa menawarkan pilihan sadar (kirim ulang
 * atau buang), bukan mencoba mengirimnya diam-diam dan pasti ditolak
 * server (fn_nilai_kiriman_tertunda, migrasi 0017).
 */
export async function antreanKedaluwarsa(): Promise<BarisAntrean[]> {
  const semua = await daftarAntrean();
  const batas = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return semua.filter((b) => new Date(b.direkam_pada).getTime() < batas);
}

export async function antreanMasihBerlaku(): Promise<BarisAntrean[]> {
  const semua = await daftarAntrean();
  const batas = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return semua.filter((b) => new Date(b.direkam_pada).getTime() >= batas);
}
