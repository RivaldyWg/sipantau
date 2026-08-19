"use server";

import { revalidatePath } from "next/cache";

import { ambilPenggunaSaatIni } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type {
  JenisDasarPenugasan,
  JenisKegiatan,
  PrioritasPenugasan,
} from "@/lib/supabase/types";

/**
 * Server Action penerbitan SPT — docs/20-modul-6.2-penugasan.md,
 * KP-6.2-04, BR-33.
 *
 * ALUR YANG DIPILIH: simpan-lalu-terbitkan, bukan sekali tembak.
 *
 * Tabel `penugasan` lahir berstatus 'draf', dan pemicu
 * trg_periksa_syarat_terbit (migrasi 0012) baru menyalak pada
 * PERPINDAHAN draf -> baru. Artinya baris induk memang harus ada
 * lebih dulu sebelum tabel anak (dasar, lokasi, panit, pelaksana)
 * bisa merujuknya, dan pemeriksaan kelengkapan baru bisa berjalan
 * setelah semuanya masuk. Urutannya karena itu:
 *
 *   1. insert penugasan (status 'draf')
 *   2. insert keempat tabel anak
 *   3. update status 'draf' -> 'baru'  <- di sinilah pemicu memeriksa
 *
 * KENAPA DRAF YANG TERTINGGAL TIDAK DIANGGAP CACAT: langkah-langkah
 * di atas bukan satu transaksi (PostgREST memulangkan tiap perintah
 * sendiri-sendiri). Bila langkah 3 gagal karena syarat kurang, baris
 * draf beserta anaknya SENGAJA dibiarkan hidup — itu draf yang sah,
 * bisa dilengkapi dan diterbitkan kemudian. Menghapusnya justru
 * membuang pekerjaan Kanit yang sudah diketik. Yang dikembalikan ke
 * pemanggil adalah id draf itu, supaya halaman bisa menunjuk ke sana.
 *
 * VALIDASI TIDAK DIDUPLIKASI: syarat terbit tetap ditegakkan pemicu di
 * database (satu sumber kebenaran, BR-77). Yang dilakukan di sini
 * hanyalah menerjemahkan pesan galat pemicu ke kalimat yang bisa
 * dibaca pengguna.
 */

export type HasilTerbit =
  | { ok: true; id: string; status: "draf" | "baru" }
  | { ok: false; error: string; id?: string };

interface MasukanDasar {
  jenis: JenisDasarPenugasan;
  nomor: string;
  tanggal: string;
  keterangan: string;
}

interface MasukanLokasi {
  nama: string;
  alamat: string;
  lat: string;
  lng: string;
  radius_meter: string;
}

function bacaJson<T>(formData: FormData, kunci: string): T[] {
  try {
    const mentah = String(formData.get(kunci) ?? "[]");
    const hasil = JSON.parse(mentah);
    return Array.isArray(hasil) ? (hasil as T[]) : [];
  } catch {
    return [];
  }
}

/** Ubah "" menjadi null supaya kolom opsional benar-benar kosong. */
function atauNull(nilai: FormDataEntryValue | null): string | null {
  const teks = String(nilai ?? "").trim();
  return teks.length > 0 ? teks : null;
}

export async function terbitkanPenugasan(
  formData: FormData,
): Promise<HasilTerbit> {
  const { pengguna } = await ambilPenggunaSaatIni();

  // Lapisan kedua di atas RLS (KP-6.1-19: menyembunyikan tombol saja
  // tidak dianggap pengamanan). RLS insert pada `penugasan` tetap
  // mensyaratkan peran kanit + unit sendiri.
  if (pengguna.peran !== "kanit") {
    return { ok: false, error: "Hanya Kanit yang dapat menerbitkan penugasan." };
  }
  if (!pengguna.unit_id) {
    return {
      ok: false,
      error: "Akun Anda belum terhubung ke unit mana pun. Hubungi Kasubdit.",
    };
  }

  const judul = String(formData.get("judul") ?? "").trim();
  if (!judul) {
    return { ok: false, error: "Judul penugasan wajib diisi." };
  }

  const tanggalMulai = atauNull(formData.get("tanggal_mulai"));
  const tanggalBatas = atauNull(formData.get("tanggal_batas"));

  // Dicegat lebih awal supaya pesannya jelas — constraint
  // chk_batas_tidak_mendahului_mulai akan menolaknya juga, tetapi
  // dengan pesan Postgres mentah.
  if (tanggalMulai && tanggalBatas && tanggalBatas < tanggalMulai) {
    return {
      ok: false,
      error: "Tanggal batas tidak boleh mendahului tanggal mulai.",
    };
  }

  const terbitkanSekarang = String(formData.get("terbitkan")) === "1";
  const supabase = await klienServer();

  // --- Langkah 1: baris induk, selalu lahir sebagai draf ------------
  const { data: induk, error: galatInduk } = await supabase
    .from("penugasan")
    .insert({
      nomor_spt: atauNull(formData.get("nomor_spt")),
      jenis_kegiatan: String(
        formData.get("jenis_kegiatan") ?? "penyelidikan",
      ) as JenisKegiatan,
      judul,
      objek: atauNull(formData.get("objek")),
      sasaran: atauNull(formData.get("sasaran")),
      uraian_tugas: atauNull(formData.get("uraian_tugas")),
      nomor_lp: atauNull(formData.get("nomor_lp")),
      sumber_informasi: atauNull(formData.get("sumber_informasi")),
      unit_id: pengguna.unit_id,
      prioritas: String(
        formData.get("prioritas") ?? "normal",
      ) as PrioritasPenugasan,
      status: "draf",
      tanggal_mulai: tanggalMulai,
      tanggal_batas: tanggalBatas,
      ditugaskan_oleh: pengguna.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (galatInduk || !induk) {
    return {
      ok: false,
      error:
        galatInduk?.code === "23505"
          ? "Nomor SPT itu sudah dipakai penugasan lain."
          : "Penugasan gagal disimpan. Periksa isian, lalu coba lagi.",
    };
  }

  const id = induk.id;

  // --- Langkah 2: tabel anak ----------------------------------------
  const dasar = bacaJson<MasukanDasar>(formData, "dasar")
    .filter((d) => d.jenis)
    .map((d, i) => ({
      penugasan_id: id,
      urutan: i + 1,
      jenis: d.jenis,
      nomor: d.nomor?.trim() || null,
      tanggal: d.tanggal?.trim() || null,
      keterangan: d.keterangan?.trim() || null,
    }));

  const lokasi = bacaJson<MasukanLokasi>(formData, "lokasi")
    .filter((l) => l.nama?.trim())
    .map((l, i) => {
      const lat = l.lat?.trim() ? Number(l.lat) : null;
      const lng = l.lng?.trim() ? Number(l.lng) : null;
      const adaKoordinat =
        lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);
      return {
        penugasan_id: id,
        urutan: i + 1,
        nama: l.nama.trim(),
        alamat: l.alamat?.trim() || null,
        // chk_penugasan_lokasi_radius_hanya_berkoordinat: titik tanpa
        // koordinat tidak boleh punya radius.
        lat: adaKoordinat ? lat : null,
        lng: adaKoordinat ? lng : null,
        radius_meter: adaKoordinat
          ? Number(l.radius_meter) || 300
          : null,
      };
    });

  const idPanit = formData.getAll("panit").map(String).filter(Boolean);
  const idPelaksana = formData
    .getAll("pelaksana")
    .map(String)
    .filter(Boolean);

  // PromiseLike, bukan Promise: builder PostgREST hanya punya .then(),
  // tidak punya .catch()/.finally(). Promise.all menerima keduanya.
  const sisipan: PromiseLike<{ error: { message: string } | null }>[] = [];

  if (dasar.length) {
    sisipan.push(supabase.from("penugasan_dasar").insert(dasar));
  }
  if (lokasi.length) {
    sisipan.push(supabase.from("penugasan_lokasi").insert(lokasi));
  }
  if (idPanit.length) {
    sisipan.push(
      supabase.from("penugasan_panit").insert(
        idPanit.map((panit_id) => ({
          penugasan_id: id,
          panit_id,
          ditunjuk_oleh: pengguna.id,
        })),
      ),
    );
  }
  if (idPelaksana.length) {
    sisipan.push(
      supabase.from("penugasan_pelaksana").insert(
        idPelaksana.map((pelaksana_id, i) => ({
          penugasan_id: id,
          pelaksana_id,
          urutan: i + 1,
        })),
      ),
    );
  }

  const hasilSisipan = await Promise.all(sisipan);
  const gagalAnak = hasilSisipan.find((h) => h.error);

  if (gagalAnak) {
    return {
      ok: false,
      id,
      error:
        "Sebagian rincian gagal disimpan. Penugasan tersimpan sebagai draf — buka drafnya untuk memeriksa.",
    };
  }

  // --- Langkah 3: terbitkan (pemicu memeriksa syarat di sini) --------
  if (!terbitkanSekarang) {
    revalidatePath("/penugasan");
    return { ok: true, id, status: "draf" };
  }

  const { error: galatTerbit } = await supabase
    .from("penugasan")
    .update({
      status: "baru",
      diterbitkan_oleh: pengguna.id,
      diterbitkan_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (galatTerbit) {
    const pesan = galatTerbit.message ?? "";
    const cocok = pesan.match(/SYARAT_TERBIT_KURANG:\s*(.+)/);

    revalidatePath("/penugasan");
    return {
      ok: false,
      id,
      error: cocok
        ? `Penugasan tersimpan sebagai draf, tetapi belum bisa diterbitkan karena belum lengkap: ${cocok[1].trim()}.`
        : "Penugasan tersimpan sebagai draf, tetapi penerbitannya ditolak server. Buka drafnya untuk memeriksa.",
    };
  }

  revalidatePath("/penugasan");
  return { ok: true, id, status: "baru" };
}
