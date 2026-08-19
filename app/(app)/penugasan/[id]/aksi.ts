"use server";

import { revalidatePath } from "next/cache";

import { ambilPenggunaSaatIni } from "@/lib/auth/pengguna";
import { klienServer } from "@/lib/supabase/server";
import type { JenisMasalah, StatusPenugasan } from "@/lib/supabase/types";

/**
 * Tindakan pada SPT yang sudah ada — docs/20-modul-6.2-penugasan.md
 * §6.2.5 tabel "Tombol yang tampil", KP-6.2-30 s/d 50.
 *
 * PRINSIP YANG BERLAKU DI SELURUH BERKAS INI:
 *
 * 1. Setiap tindakan memeriksa kewenangannya sendiri di sini DAN
 *    ditegakkan lagi oleh RLS. Aturan modul butir 8: "Kewenangan
 *    tindakan dan lingkup data diperiksa terpisah... Pemeriksaan
 *    dilakukan dua kali."
 *
 * 2. Galat batasan pemeriksaan (kode 23514) diterjemahkan memakai
 *    peta yang SAMA persis dengan §5.4 modul 6.2. Jangan menuliskan
 *    kalimatnya ulang di tempat lain.
 *
 * 3. Jejak audit dicatat lewat fungsi public.catat_jejak_audit yang
 *    sudah ada (migrasi 0005), bukan dengan menyisipkan baris
 *    langsung. Penyuntingan DRAF sengaja tidak dicatat — §"Tambahan
 *    jenis tindakan": "Penyuntingan draf tidak dicatat."
 */

export type Hasil =
  | { ok: true; pesan?: string }
  | { ok: false; error: string };

const PESAN_BATASAN: Record<string, string> = {
  chk_selesai_wajib_berkas:
    "Lampirkan pindaian surat perintah tugas sebelum menutup penugasan.",
  chk_batal_wajib_alasan: "Alasan pembatalan wajib diisi.",
  chk_batas_tidak_mendahului_mulai:
    "Tanggal batas tidak boleh lebih awal daripada tanggal mulai.",
  chk_perpanjangan_alasan_wajib: "Alasan perpanjangan wajib diisi.",
  chk_masalah_uraian_wajib: "Uraian masalah wajib diisi.",
  chk_masalah_alasan_pemulihan_wajib: "Alasan pengembalian wajib diisi.",
  chk_penugasan_dasar_keterangan_wajib:
    "Keterangan wajib diisi bila jenis dasar bernilai Lainnya.",
  chk_penugasan_lokasi_radius_hanya_berkoordinat:
    "Titik tanpa koordinat tidak boleh memiliki radius.",
};

function terjemahkanGalat(error: {
  code?: string;
  message?: string;
} | null): string {
  if (!error) return "Tindakan gagal. Coba lagi.";

  const pesan = error.message ?? "";

  const syarat = pesan.match(/SYARAT_TERBIT_KURANG:\s*(.+)/);
  if (syarat) return `Belum lengkap: ${syarat[1].trim()}.`;

  const jaga = pesan.match(
    /(PELAKSANA_ANGGOTA_TERAKHIR|PANIT_TERAKHIR|DASAR_PENUGASAN_TERAKHIR|LOKASI_TERAKHIR|LOKASI_BERKOORDINAT_TERAKHIR)/,
  );
  if (jaga) {
    return "Tindakan ditolak: setiap SPT wajib mempertahankan minimal satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab, dan satu pelaksana berperan Anggota.";
  }

  if (error.code === "23514") {
    const nama = Object.keys(PESAN_BATASAN).find((k) => pesan.includes(k));
    if (nama) return PESAN_BATASAN[nama];
    return "Data belum memenuhi syarat.";
  }

  if (error.code === "23505") return "Nomor SPT itu sudah dipakai penugasan lain.";
  if (error.code === "42501") return "Anda tidak berwenang melakukan tindakan ini.";

  return "Tindakan gagal. Coba lagi.";
}

/** Ambil SPT beserta pemeriksaan kewenangan dasar. */
async function ambilKonteks(id: string) {
  const { pengguna } = await ambilPenggunaSaatIni();
  const supabase = await klienServer();

  const { data: spt } = await supabase
    .from("penugasan")
    .select("id, unit_id, status, nomor_spt, tanggal_batas, berkas_surat_path")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      unit_id: string;
      status: StatusPenugasan;
      nomor_spt: string | null;
      tanggal_batas: string | null;
      berkas_surat_path: string | null;
    }>();

  return { pengguna, supabase, spt };
}

function kanitPemilik(
  pengguna: { peran: string; unit_id: string | null },
  spt: { unit_id: string },
): boolean {
  return pengguna.peran === "kanit" && pengguna.unit_id === spt.unit_id;
}

/** KP-6.2-43: selesai dan dibatalkan mengunci seluruh kolom. */
function terkunci(status: StatusPenugasan): boolean {
  return status === "selesai" || status === "dibatalkan";
}

// =====================================================================
// Menyunting keterangan SPT — KP-6.2-38, KP-6.2-07, KP-6.2-39
// =====================================================================
export async function suntingPenugasan(
  id: string,
  formData: FormData,
): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat menyunting." };
  if (terkunci(spt.status))
    return {
      ok: false,
      error: "Penugasan berstatus selesai atau dibatalkan tidak dapat disunting.",
    };

  const atau = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v.length ? v : null;
  };

  const perubahan: Record<string, unknown> = {
    judul: String(formData.get("judul") ?? "").trim(),
    objek: atau("objek"),
    sasaran: atau("sasaran"),
    uraian_tugas: atau("uraian_tugas"),
    jenis_kegiatan: String(formData.get("jenis_kegiatan") ?? "penyelidikan"),
    nomor_lp: atau("nomor_lp"),
    sumber_informasi: atau("sumber_informasi"),
    prioritas: String(formData.get("prioritas") ?? "normal"),
    diubah_pada: new Date().toISOString(),
  };

  if (!perubahan.judul) return { ok: false, error: "Judul wajib diisi." };

  // KP-6.2-07: setelah terbit, nomor_spt / unit_id / tanggal_mulai
  // terkunci bagi SIAPA PUN. Selama masih draf, ketiganya boleh.
  if (spt.status === "draf") {
    perubahan.nomor_spt = atau("nomor_spt");
    perubahan.tanggal_mulai = atau("tanggal_mulai");
  }

  const { error } = await supabase
    .from("penugasan")
    .update(perubahan)
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  // "Penyuntingan draf tidak dicatat" — hanya SPT terbit yang masuk audit.
  if (spt.status !== "draf") {
    await supabase.rpc("catat_jejak_audit", {
      p_jenis_tindakan: "sunting_spt",
      p_sasaran_tabel: "penugasan",
      p_sasaran_id: id,
      p_keterangan: `Keterangan penugasan disunting${spt.nomor_spt ? ` (${spt.nomor_spt})` : ""}`,
    });
  }

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  return { ok: true, pesan: "Perubahan tersimpan." };
}

// =====================================================================
// Perpanjang batas — KP-6.2-41
// =====================================================================
export async function perpanjangBatas(
  id: string,
  formData: FormData,
): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat memperpanjang." };
  if (terkunci(spt.status))
    return { ok: false, error: "Penugasan sudah terkunci." };

  const baru = String(formData.get("tanggal_batas_baru") ?? "").trim();
  const alasan = String(formData.get("alasan") ?? "").trim();

  if (!baru) return { ok: false, error: "Tanggal batas baru wajib diisi." };
  if (!alasan) return { ok: false, error: "Alasan perpanjangan wajib diisi." };

  // 6.2.6: memundurkan tanggal ke masa lalu DIIZINKAN — koreksi salah
  // ketik juga perlu jalan. Karena itu tidak ada pemeriksaan "harus
  // lebih maju" di sini, dan jangan ditambahkan.
  const { error: galatRiwayat } = await supabase
    .from("penugasan_perpanjangan")
    .insert({
      penugasan_id: id,
      tanggal_batas_lama: spt.tanggal_batas,
      tanggal_batas_baru: baru,
      alasan,
      diubah_oleh: pengguna.id,
    });

  if (galatRiwayat) return { ok: false, error: terjemahkanGalat(galatRiwayat) };

  const { error } = await supabase
    .from("penugasan")
    .update({ tanggal_batas: baru, diubah_pada: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "perpanjang_batas",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: `Batas waktu diubah dari ${spt.tanggal_batas ?? "kosong"} menjadi ${baru}. Alasan: ${alasan}`,
  });

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  return { ok: true, pesan: "Batas waktu diperbarui." };
}

// =====================================================================
// Tandai bermasalah — KP-6.2-30 s/d 34, BR-26
// =====================================================================
export async function tandaiBermasalah(
  id: string,
  formData: FormData,
): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (terkunci(spt.status))
    return { ok: false, error: "Penugasan sudah terkunci." };

  const jenis = String(formData.get("jenis_masalah") ?? "") as JenisMasalah;
  const uraian = String(formData.get("uraian") ?? "").trim();

  if (!jenis) return { ok: false, error: "Jenis masalah wajib dipilih." };
  if (!uraian) return { ok: false, error: "Uraian masalah wajib diisi." };

  // Kewenangannya ditegakkan RLS "masalah_tulis_oleh_yang_terlibat"
  // (Kanit pemilik, Panit pengawas, atau pelaksana). Tidak diulang di
  // sini karena keanggotaannya perlu kueri tersendiri yang justru
  // menduplikasi klausa RLS-nya.
  const { error } = await supabase.from("penugasan_masalah").insert({
    penugasan_id: id,
    jenis_masalah: jenis,
    uraian,
    ditandai_oleh: pengguna.id,
  });

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "tandai_bermasalah",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: `Ditandai bermasalah: ${jenis}`,
  });

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  // KP-6.2-34: bermasalah adalah keterangan keadaan, bukan penghentian.
  return { ok: true, pesan: "Keadaan tercatat. Kegiatan tidak dihentikan." };
}

// =====================================================================
// Kembalikan dari bermasalah — KP-6.2-35
// =====================================================================
export async function kembalikanDariBermasalah(
  id: string,
  formData: FormData,
): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat mengembalikan." };

  const alasan = String(formData.get("alasan_pemulihan") ?? "").trim();
  if (!alasan) return { ok: false, error: "Alasan pengembalian wajib diisi." };

  const { error } = await supabase
    .from("penugasan_masalah")
    .update({
      dipulihkan_pada: new Date().toISOString(),
      dipulihkan_oleh: pengguna.id,
      alasan_pemulihan: alasan,
    })
    .eq("penugasan_id", id)
    .is("dipulihkan_pada", null);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "kembalikan_dari_bermasalah",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: `Dikembalikan dari bermasalah. Alasan: ${alasan}`,
  });

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  return { ok: true, pesan: "Penugasan kembali berjalan." };
}

// =====================================================================
// Tutup penugasan — KP-6.2-44, 45, 46
// =====================================================================
export async function tutupPenugasan(id: string): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat menutup." };
  if (terkunci(spt.status))
    return { ok: false, error: "Penugasan sudah terkunci." };

  // KP-6.2-45 ditegakkan chk_selesai_wajib_berkas di database; dicegat
  // lebih awal di sini hanya supaya pesannya tidak berupa galat mentah.
  if (!spt.berkas_surat_path) {
    return {
      ok: false,
      error: PESAN_BATASAN.chk_selesai_wajib_berkas,
    };
  }

  const { error } = await supabase
    .from("penugasan")
    .update({
      status: "selesai",
      ditutup_oleh: pengguna.id,
      ditutup_pada: new Date().toISOString(),
      diubah_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "tutup_spt",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: `Penugasan ditutup${spt.nomor_spt ? ` (${spt.nomor_spt})` : ""}`,
  });

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  // KP-6.2-46 (menutup Sesi Tugas yang masih terbuka) menunggu Modul
  // 6.4 — pemicunya hidup di tabel sesi_tugas dan dibangun Langkah 10.
  return { ok: true, pesan: "Penugasan ditutup." };
}

// =====================================================================
// Batalkan — KP-6.2-47
// =====================================================================
export async function batalkanPenugasan(
  id: string,
  formData: FormData,
): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat membatalkan." };
  if (terkunci(spt.status))
    return { ok: false, error: "Penugasan sudah terkunci." };

  const alasan = String(formData.get("alasan_pembatalan") ?? "").trim();
  if (!alasan) return { ok: false, error: PESAN_BATASAN.chk_batal_wajib_alasan };

  const { error } = await supabase
    .from("penugasan")
    .update({
      status: "dibatalkan",
      alasan_pembatalan: alasan,
      dibatalkan_oleh: pengguna.id,
      dibatalkan_pada: new Date().toISOString(),
      diubah_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "batal_spt",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: `Penugasan dibatalkan. Alasan: ${alasan}`,
  });

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  return { ok: true, pesan: "Penugasan dibatalkan." };
}

// =====================================================================
// Buka kembali — KP-6.2-50, B.9
// =====================================================================
export async function bukaKembaliPenugasan(id: string): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };

  // B.9: "Pembukaan kembali SPT selesai dapat dilakukan Kanit unit
  // pemilik dan Kasubdit; SPT dibatalkan tidak dapat dibuka kembali."
  const boleh = pengguna.peran === "kasubdit" || kanitPemilik(pengguna, spt);
  if (!boleh)
    return { ok: false, error: "Anda tidak berwenang membuka kembali penugasan ini." };

  if (spt.status === "dibatalkan")
    return {
      ok: false,
      error: "Penugasan yang dibatalkan tidak dapat dibuka kembali.",
    };
  if (spt.status !== "selesai")
    return { ok: false, error: "Hanya penugasan berstatus selesai yang dapat dibuka kembali." };

  const { error } = await supabase
    .from("penugasan")
    .update({
      status: "berjalan",
      ditutup_oleh: null,
      ditutup_pada: null,
      diubah_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: terjemahkanGalat(error) };

  await supabase.rpc("catat_jejak_audit", {
    p_jenis_tindakan: "buka_kembali_spt",
    p_sasaran_tabel: "penugasan",
    p_sasaran_id: id,
    p_keterangan: `Penugasan dibuka kembali${spt.nomor_spt ? ` (${spt.nomor_spt})` : ""}`,
  });

  revalidatePath(`/penugasan/${id}`);
  revalidatePath("/penugasan");
  return { ok: true, pesan: "Penugasan dibuka kembali." };
}

// =====================================================================
// Hapus permanen — KP-6.2-48, BR-29/BR-32
// =====================================================================
export async function hapusPenugasanPermanen(id: string): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat menghapus." };

  // Syarat "belum pernah ada jejak kegiatan" diperiksa di dalam fungsi
  // database hapus_penugasan_permanen (migrasi 0013), bukan di sini —
  // pemeriksaannya melintasi tabel yang sebagiannya belum lahir.
  const { error } = await supabase.rpc("hapus_penugasan_permanen", {
    p_id: id,
  });

  if (error) {
    const pesan = error.message ?? "";
    if (pesan.includes("ADA_JEJAK_KEGIATAN") || pesan.includes("SESI")) {
      return {
        ok: false,
        error:
          "Penugasan ini sudah memiliki jejak kegiatan, jadi tidak dapat dihapus. Batalkan saja disertai alasan.",
      };
    }
    return { ok: false, error: terjemahkanGalat(error) };
  }

  revalidatePath("/penugasan");
  return { ok: true, pesan: "Penugasan dihapus permanen." };
}

// =====================================================================
// Kelola tim — tambah/cabut pelaksana dan Panit (BR-27, KP-6.2-26)
// =====================================================================
export async function kelolaTim(
  id: string,
  formData: FormData,
): Promise<Hasil> {
  const { pengguna, supabase, spt } = await ambilKonteks(id);
  if (!spt) return { ok: false, error: "Penugasan tidak ditemukan." };
  if (!kanitPemilik(pengguna, spt))
    return { ok: false, error: "Hanya Kanit unit pemilik yang dapat mengelola tim." };
  if (terkunci(spt.status))
    return { ok: false, error: "Penugasan sudah terkunci." };

  const tindakan = String(formData.get("tindakan") ?? "");
  const orangId = String(formData.get("orang_id") ?? "");
  const tabel =
    String(formData.get("peran_tim") ?? "pelaksana") === "panit"
      ? "penugasan_panit"
      : "penugasan_pelaksana";
  const kolomOrang = tabel === "penugasan_panit" ? "panit_id" : "pelaksana_id";

  if (!orangId) return { ok: false, error: "Pilih orangnya lebih dulu." };

  if (tindakan === "tambah") {
    const isi: Record<string, unknown> = {
      penugasan_id: id,
      [kolomOrang]: orangId,
    };
    if (tabel === "penugasan_panit") isi.ditunjuk_oleh = pengguna.id;

    const { error } = await supabase.from(tabel).insert(isi);
    if (error) {
      if (error.code === "23505")
        return { ok: false, error: "Orang itu sudah tercantum pada penugasan ini." };
      return { ok: false, error: terjemahkanGalat(error) };
    }

    await supabase.rpc("catat_jejak_audit", {
      p_jenis_tindakan:
        tabel === "penugasan_panit" ? "tunjuk_panit" : "tambah_pelaksana",
      p_sasaran_tabel: tabel,
      p_sasaran_id: id,
      p_keterangan: "Anggota tim ditambahkan",
    });
  } else if (tindakan === "cabut") {
    const alasan = String(formData.get("alasan_pencabutan") ?? "").trim();
    if (!alasan) return { ok: false, error: "Alasan pencabutan wajib diisi." };

    // BR-27: pencabutan adalah PENANDAAN, tidak pernah penghapusan
    // baris — laporan dan rute yang sudah terekam tidak boleh
    // kehilangan induknya.
    const { error } = await supabase
      .from(tabel)
      .update({
        dicabut_pada: new Date().toISOString(),
        dicabut_oleh: pengguna.id,
        alasan_pencabutan: alasan,
      })
      .eq("penugasan_id", id)
      .eq(kolomOrang, orangId)
      .is("dicabut_pada", null);

    if (error) return { ok: false, error: terjemahkanGalat(error) };

    await supabase.rpc("catat_jejak_audit", {
      p_jenis_tindakan:
        tabel === "penugasan_panit" ? "cabut_panit" : "cabut_pelaksana",
      p_sasaran_tabel: tabel,
      p_sasaran_id: id,
      p_keterangan: `Dicabut. Alasan: ${alasan}`,
    });
  } else {
    return { ok: false, error: "Tindakan tidak dikenal." };
  }

  revalidatePath(`/penugasan/${id}`);
  return { ok: true, pesan: "Susunan tim diperbarui." };
}

// =====================================================================
// Catat tanda terima — B.9, dipanggil saat pelaksana membuka rincian
// =====================================================================
export async function catatTandaTerima(id: string): Promise<void> {
  const supabase = await klienServer();
  // Fungsi ini sengaja diam bila pemanggilnya bukan pelaksana —
  // ia hanya menulis bila ada barisnya (migrasi 0013).
  await supabase.rpc("catat_tanda_terima", { p_penugasan_id: id });
}
