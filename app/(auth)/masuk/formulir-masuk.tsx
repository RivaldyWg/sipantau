"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { masuk } from "./aksi";

/**
 * Server Action masuk() dipanggil LANGSUNG (bukan lewat <form
 * action={...}>) supaya kegagalan jaringan pada permintaannya sendiri
 * bisa ditangkap lewat try/catch dan dibedakan dari kegagalan
 * kredensial biasa (KP-6.1-06 vs KP-6.1-02). masuk() sengaja tidak
 * pernah memanggil redirect() sendiri — navigasi sukses dilakukan di
 * sini lewat router.push(), supaya jalur redirect() Next.js (yang
 * melempar sinyal khusus) tidak tertangkap keliru oleh catch di
 * bawah sebagai galat jaringan.
 */
export function FormulirMasuk() {
  const router = useRouter();
  const [nrp, setNrp] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return; // tombol tidak dapat ditekan dua kali
    setError(null);

    const fd = new FormData();
    fd.set("nrp", nrp);
    fd.set("kata_sandi", kataSandi);

    startTransition(async () => {
      try {
        const hasil = await masuk(fd);
        if (!hasil.ok) {
          setError(hasil.error);
          setNrp(hasil.nrp); // KP-6.1-02/06: NRP dipertahankan
          setKataSandi(""); //              kata sandi dikosongkan
          return;
        }
        router.push(hasil.tujuan);
        router.refresh();
      } catch {
        // KP-6.1-06: permintaan itu sendiri gagal mencapai server.
        setError("Tidak dapat menghubungi server. Periksa jaringan Anda.");
        setKataSandi("");
      }
    });
  }

  const kelasMasukan =
    "h-11 w-full rounded-[var(--r-sm)] border border-[var(--line-2)] px-3 text-base outline-none transition-all duration-200 focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(27,42,74,0.08)] disabled:opacity-50";

  return (
    <form onSubmit={kirim} className="flex flex-col gap-[15px]" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nrp"
          className="text-xs font-semibold text-[var(--ink-2)]"
        >
          NRP
        </label>
        <input
          id="nrp"
          name="nrp"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          value={nrp}
          onChange={(e) => setNrp(e.target.value)}
          disabled={pending}
          className={kelasMasukan}
          placeholder="Contoh: 87654321"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="kata_sandi"
          className="text-xs font-semibold text-[var(--ink-2)]"
        >
          Kata sandi
        </label>
        <div className="relative">
          <input
            id="kata_sandi"
            name="kata_sandi"
            type={tampilkanSandi ? "text" : "password"}
            autoComplete="current-password"
            value={kataSandi}
            onChange={(e) => setKataSandi(e.target.value)}
            disabled={pending}
            className={`${kelasMasukan} pr-16`}
          />
          <button
            type="button"
            onClick={() => setTampilkanSandi((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-[var(--ink-3)] hover:text-[var(--ink)]"
            tabIndex={-1}
          >
            {tampilkanSandi ? "Sembunyikan" : "Perlihatkan"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[var(--r-sm)] bg-[var(--red-bg)] px-3 py-2 text-sm text-[var(--red)]"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-[46px] w-full rounded-[var(--r-sm)] bg-[var(--primary)] text-[14px] font-semibold text-white transition-colors hover:bg-[var(--navy)]"
      >
        {pending ? "Memproses…" : "Masuk"}
      </Button>

      <p className="text-center text-xs text-[var(--ink-3)]">
        Lupa kata sandi? Hubungi Kanit unit Anda.
      </p>
    </form>
  );
}
