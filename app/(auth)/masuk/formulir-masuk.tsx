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

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col items-center gap-1 pb-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sp-primary)] text-lg font-bold text-white">
          SP
        </div>
        <h1 className="mt-2 text-lg font-semibold text-foreground">
          SiPANTAU
        </h1>
        <p className="text-xs text-muted-foreground">
          Sistem Pengawasan Unit I Subdit IV
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nrp" className="text-sm font-medium text-foreground">
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
          className="h-11 rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          placeholder="Contoh: 87654321"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="kata_sandi"
          className="text-sm font-medium text-foreground"
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
            className="h-11 w-full rounded-md border border-input bg-transparent px-3 pr-16 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setTampilkanSandi((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {tampilkanSandi ? "Sembunyikan" : "Perlihatkan"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-[var(--sp-red)]/10 px-3 py-2 text-sm text-[var(--sp-red)]"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Memproses…" : "Masuk"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Lupa kata sandi? Hubungi Kanit unit Anda.
      </p>
    </form>
  );
}
