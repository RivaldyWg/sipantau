"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LABEL_JENIS_MASALAH } from "@/lib/penugasan/label";
import type { StatusPenugasan } from "@/lib/supabase/types";
import {
  batalkanPenugasan,
  bukaKembaliPenugasan,
  hapusPenugasanPermanen,
  kembalikanDariBermasalah,
  perpanjangBatas,
  tandaiBermasalah,
  tutupPenugasan,
} from "./aksi";
import { unggahSuratSpt } from "./aksi-surat";

/**
 * Tombol tindakan halaman rincian — §6.2.5 tabel "Tombol yang tampil".
 *
 * | Kanit pemilik unit      | Sunting, Kelola Tim, Perpanjang Batas,
 * |                         | Unggah Surat, Tutup, Batalkan, Hapus
 * | Kasubdit                | Buka Kembali (hanya pada status selesai)
 * | Panit PJ aktif          | Tandai Bermasalah
 * | Panit yang sudah dicabut| tidak ada, halaman hanya terbaca
 * | Pelaksana               | Tandai Bermasalah, Mulai Tugas (Modul 6.4)
 *
 * BR-11 ditegakkan dengan tidak merender tombol di luar kewenangan
 * sama sekali — bukan merendernya dalam keadaan nonaktif.
 *
 * KP-6.2-43: status selesai/dibatalkan mengunci semuanya, sehingga
 * seluruh tombol penyuntingan hilang pada kedua status itu.
 */

type Tindakan =
  | null
  | "perpanjang"
  | "bermasalah"
  | "pulihkan"
  | "tutup"
  | "batal"
  | "hapus"
  | "surat"
  | "buka_kembali";

interface Props {
  id: string;
  status: StatusPenugasan;
  tanggalBatas: string | null;
  adaBerkasSurat: boolean;
  bolehKelola: boolean; // Kanit unit pemilik
  bolehTandai: boolean; // Panit PJ aktif atau pelaksana
  bolehBukaKembali: boolean; // Kasubdit, atau Kanit pemilik
  adaMasalahTerbuka: boolean;
}

const KELAS_INPUT =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function PanelTindakan({
  id,
  status,
  tanggalBatas,
  adaBerkasSurat,
  bolehKelola,
  bolehTandai,
  bolehBukaKembali,
  adaMasalahTerbuka,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [buka, setBuka] = useState<Tindakan>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [kabar, setKabar] = useState<string | null>(null);

  const terkunci = status === "selesai" || status === "dibatalkan";

  function jalankan(fn: () => Promise<{ ok: boolean; error?: string; pesan?: string }>) {
    if (pending) return;
    setGalat(null);
    setKabar(null);
    startTransition(async () => {
      try {
        const h = await fn();
        if (!h.ok) {
          setGalat(h.error ?? "Tindakan gagal.");
          return;
        }
        setBuka(null);
        setKabar(h.pesan ?? "Tersimpan.");
        router.refresh();
      } catch {
        setGalat("Tidak dapat menghubungi server. Periksa jaringan Anda.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {bolehKelola && !terkunci && (
          <>
            <Link
              href={`/penugasan/${id}/sunting`}
              className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Sunting
            </Link>
            <Link
              href={`/penugasan/${id}/tim`}
              className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Kelola Tim
            </Link>
            <Tombol onClick={() => setBuka("perpanjang")}>Perpanjang Batas</Tombol>
            <Tombol onClick={() => setBuka("surat")}>
              {adaBerkasSurat ? "Ganti Surat" : "Unggah Surat"}
            </Tombol>
          </>
        )}

        {/* Cetak konsep SPRIN — tambahan di luar PRD v0.7, lihat
            docs/02-perubahan-cetak-sprin.md */}
        {bolehKelola && (
          <Link
            href={`/penugasan/${id}/cetak`}
            className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cetak Surat
          </Link>
        )}

        {bolehKelola && !terkunci && status !== "draf" && (
          <>
            <Tombol onClick={() => setBuka("tutup")}>Tutup Penugasan</Tombol>
            <Tombol onClick={() => setBuka("batal")} bahaya>
              Batalkan
            </Tombol>
          </>
        )}

        {bolehKelola && !terkunci && (
          <Tombol onClick={() => setBuka("hapus")} bahaya>
            Hapus
          </Tombol>
        )}

        {bolehKelola && adaMasalahTerbuka && (
          <Tombol onClick={() => setBuka("pulihkan")}>
            Kembalikan dari Bermasalah
          </Tombol>
        )}

        {bolehTandai && !terkunci && status !== "draf" && (
          <Tombol onClick={() => setBuka("bermasalah")}>Tandai Bermasalah</Tombol>
        )}

        {bolehBukaKembali && status === "selesai" && (
          <Tombol onClick={() => setBuka("buka_kembali")}>Buka Kembali</Tombol>
        )}
      </div>

      {kabar && (
        <p className="rounded-md border border-[var(--green)] bg-[var(--green-bg)] px-3 py-2 text-sm text-[var(--green)]">
          {kabar}
        </p>
      )}

      {/* ---------------- Panel per tindakan ---------------- */}

      {buka === "perpanjang" && (
        <Kotak judul="Perpanjang batas waktu" onTutup={() => setBuka(null)} galat={galat}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() => perpanjangBatas(id, fd));
            }}
            className="flex flex-col gap-3"
          >
            <Bidang label="Tanggal batas baru" wajib>
              <input
                type="date"
                name="tanggal_batas_baru"
                defaultValue={tanggalBatas ?? ""}
                required
                className={KELAS_INPUT}
                disabled={pending}
              />
            </Bidang>
            <Bidang label="Alasan perpanjangan" wajib>
              <textarea
                name="alasan"
                rows={2}
                required
                className={`${KELAS_INPUT} h-auto py-2`}
                disabled={pending}
              />
            </Bidang>
            <p className="text-xs text-muted-foreground">
              Tanggal boleh dimundurkan ke masa lalu bila memang mengoreksi salah
              ketik. Tidak ada batas berapa kali perpanjangan dilakukan, dan
              seluruh riwayatnya tercatat.
            </p>
            <Kirim pending={pending} label="Simpan perpanjangan" />
          </form>
        </Kotak>
      )}

      {buka === "bermasalah" && (
        <Kotak judul="Tandai bermasalah" onTutup={() => setBuka(null)} galat={galat}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() => tandaiBermasalah(id, fd));
            }}
            className="flex flex-col gap-3"
          >
            <Bidang label="Jenis masalah" wajib>
              <select name="jenis_masalah" required className={KELAS_INPUT} disabled={pending}>
                <option value="">Pilih jenis masalah…</option>
                {Object.entries(LABEL_JENIS_MASALAH).map(([n, l]) => (
                  <option key={n} value={n}>
                    {l}
                  </option>
                ))}
              </select>
            </Bidang>
            <Bidang label="Uraian keadaan" wajib>
              <textarea
                name="uraian"
                rows={3}
                required
                placeholder="Terangkan keadaan yang ditemui di lapangan."
                className={`${KELAS_INPUT} h-auto py-2`}
                disabled={pending}
              />
            </Bidang>
            <p className="text-xs text-muted-foreground">
              Penandaan ini adalah keterangan keadaan, bukan penghentian kegiatan
              dan bukan penilaian atas kinerja siapa pun. Kegiatan tetap berjalan.
            </p>
            <Kirim pending={pending} label="Catat keadaan" />
          </form>
        </Kotak>
      )}

      {buka === "pulihkan" && (
        <Kotak
          judul="Kembalikan dari bermasalah"
          onTutup={() => setBuka(null)}
          galat={galat}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() => kembalikanDariBermasalah(id, fd));
            }}
            className="flex flex-col gap-3"
          >
            <Bidang label="Alasan pengembalian" wajib>
              <textarea
                name="alasan_pemulihan"
                rows={2}
                required
                className={`${KELAS_INPUT} h-auto py-2`}
                disabled={pending}
              />
            </Bidang>
            <Kirim pending={pending} label="Kembalikan ke berjalan" />
          </form>
        </Kotak>
      )}

      {buka === "surat" && (
        <Kotak
          judul={adaBerkasSurat ? "Ganti berkas surat perintah" : "Unggah berkas surat perintah"}
          onTutup={() => setBuka(null)}
          galat={galat}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(async () => {
                const h = await unggahSuratSpt(id, fd);
                return h.ok
                  ? { ok: true, pesan: "Berkas surat tersimpan." }
                  : { ok: false, error: h.error };
              });
            }}
            className="flex flex-col gap-3"
          >
            <Bidang label="Berkas pindaian (PDF, JPG, atau PNG — maksimal 10 MB)" wajib>
              <input
                type="file"
                name="berkas"
                accept="application/pdf,image/jpeg,image/png"
                required
                className="w-full text-sm file:mr-3 file:h-9 file:rounded-md file:border file:border-input file:bg-card file:px-3 file:text-sm"
                disabled={pending}
              />
            </Bidang>
            {adaBerkasSurat && (
              <p className="text-xs text-muted-foreground">
                Berkas yang ada sekarang akan digantikan. Bila pengunggahan
                terputus, berkas lama tetap utuh.
              </p>
            )}
            <Kirim pending={pending} label="Unggah berkas" />
          </form>
        </Kotak>
      )}

      {buka === "tutup" && (
        <Kotak judul="Tutup penugasan" onTutup={() => setBuka(null)} galat={galat}>
          {/* KP-6.2-44: sistem menampilkan daftar hal yang belum beres,
              lalu TETAP mengizinkan penutupan bila Kanit melanjutkan. */}
          <div className="rounded-md border border-[var(--amber)] bg-[var(--amber-bg)] p-3 text-sm text-[var(--amber)]">
            <p className="font-medium">Sebelum menutup, perhatikan:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
              <li>
                Sesi Tugas yang masih terbuka akan ikut ditutup — pemeriksaannya
                hadir setelah Modul 6.4 dibangun.
              </li>
              <li>
                LHP Ringkas yang belum masuk dan pelaksana yang belum pernah
                melapor belum dapat diperiksa sampai Modul 6.3 dibangun.
              </li>
              {!adaBerkasSurat && (
                <li className="font-medium">
                  Berkas surat perintah belum dilampirkan. Penutupan akan ditolak
                  sampai berkas diunggah.
                </li>
              )}
            </ul>
            <p className="mt-2 text-xs">
              Menutup penugasan yang belum rampung tetap merupakan keputusan Anda.
            </p>
          </div>
          <div className="mt-3">
            <Kirim
              pending={pending}
              label="Tetap tutup penugasan"
              onClick={() => jalankan(() => tutupPenugasan(id))}
            />
          </div>
        </Kotak>
      )}

      {buka === "batal" && (
        <Kotak judul="Batalkan penugasan" onTutup={() => setBuka(null)} galat={galat}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              jalankan(() => batalkanPenugasan(id, fd));
            }}
            className="flex flex-col gap-3"
          >
            <Bidang label="Alasan pembatalan" wajib>
              <textarea
                name="alasan_pembatalan"
                rows={3}
                required
                className={`${KELAS_INPUT} h-auto py-2`}
                disabled={pending}
              />
            </Bidang>
            <p className="text-xs text-muted-foreground">
              Seluruh tim akan diberi tahu. Penugasan yang dibatalkan tidak dapat
              dibuka kembali.
            </p>
            <Kirim pending={pending} label="Batalkan penugasan" bahaya />
          </form>
        </Kotak>
      )}

      {buka === "hapus" && (
        <Kotak judul="Hapus permanen" onTutup={() => setBuka(null)} galat={galat}>
          <p className="text-sm text-foreground">
            Penghapusan permanen hanya berjalan bila penugasan ini belum pernah
            memiliki laporan, foto, rute, maupun Sesi Tugas. Bila sudah ada
            jejaknya, gunakan Batalkan disertai alasan.
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--red)]">
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="mt-3">
            <Kirim
              pending={pending}
              label="Hapus permanen"
              bahaya
              onClick={() =>
                jalankan(async () => {
                  const h = await hapusPenugasanPermanen(id);
                  if (h.ok) router.push("/penugasan");
                  return h;
                })
              }
            />
          </div>
        </Kotak>
      )}

      {buka === "buka_kembali" && (
        <Kotak judul="Buka kembali penugasan" onTutup={() => setBuka(null)} galat={galat}>
          <p className="text-sm text-foreground">
            Penugasan akan kembali berstatus berjalan. Berkas ekspor yang
            terlanjur keluar tidak ditarik, dan pembukaan kembali ini tercatat
            pada jejak audit.
          </p>
          <div className="mt-3">
            <Kirim
              pending={pending}
              label="Buka kembali"
              onClick={() => jalankan(() => bukaKembaliPenugasan(id))}
            />
          </div>
        </Kotak>
      )}
    </div>
  );
}

function Tombol({
  onClick,
  bahaya,
  children,
}: {
  onClick: () => void;
  bahaya?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        bahaya
          ? "inline-flex h-9 items-center rounded-md border border-[var(--red)] px-3 text-sm font-medium text-[var(--red)] transition-colors hover:bg-[var(--red-bg)]"
          : "inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      }
    >
      {children}
    </button>
  );
}

function Kotak({
  judul,
  galat,
  onTutup,
  children,
}: {
  judul: string;
  galat: string | null;
  onTutup: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{judul}</h2>
        <button
          type="button"
          onClick={onTutup}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Tutup
        </button>
      </div>
      {galat && (
        <p className="mb-3 rounded-md border border-[var(--red)] bg-[var(--red-bg)] px-3 py-2 text-sm text-[var(--red)]">
          {galat}
        </p>
      )}
      {children}
    </section>
  );
}

function Bidang({
  label,
  wajib,
  children,
}: {
  label: string;
  wajib?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">
        {label}
        {wajib && <span className="text-[var(--red)]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Kirim({
  pending,
  label,
  bahaya,
  onClick,
}: {
  pending: boolean;
  label: string;
  bahaya?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={pending}
      variant={bahaya ? "destructive" : "default"}
      className="self-start"
    >
      {pending ? "Memproses…" : label}
    </Button>
  );
}
