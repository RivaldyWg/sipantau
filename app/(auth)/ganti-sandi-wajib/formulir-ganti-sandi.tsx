"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { gantiSandi } from "./aksi";

export function FormulirGantiSandi() {
  const router = useRouter();
  const [sandiBaru, setSandiBaru] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    // Pemeriksaan sisi klien duluan (KP-6.1-11 dan kecocokan
    // pengulangan) — server tetap memeriksa ulang, ini hanya supaya
    // pengguna tidak menunggu jaringan untuk galat yang sudah jelas.
    if (sandiBaru.length < 8) {
      setError("Kata sandi baru minimal delapan karakter.");
      return;
    }
    if (sandiBaru !== ulangi) {
      setError("Ulangi kata sandi baru tidak sama dengan isian sebelumnya.");
      return;
    }

    const fd = new FormData();
    fd.set("sandi_baru", sandiBaru);
    fd.set("ulangi_sandi_baru", ulangi);

    startTransition(async () => {
      try {
        const hasil = await gantiSandi(fd);
        if (!hasil.ok) {
          setError(hasil.error);
          return;
        }
        router.push(hasil.tujuan);
        router.refresh();
      } catch {
        setError("Tidak dapat menghubungi server. Periksa jaringan Anda.");
      }
    });
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5" noValidate>
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Ganti Kata Sandi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Akun Anda masih memakai Kata Sandi Sementara. Buat kata sandi baru
          sebelum melanjutkan — langkah ini tidak dapat dilewati.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="sandi_baru"
          className="text-sm font-medium text-foreground"
        >
          Kata sandi baru
        </label>
        <input
          id="sandi_baru"
          type="password"
          autoComplete="new-password"
          value={sandiBaru}
          onChange={(e) => setSandiBaru(e.target.value)}
          disabled={pending}
          className="h-11 rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground">Minimal delapan karakter.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ulangi_sandi_baru"
          className="text-sm font-medium text-foreground"
        >
          Ulangi kata sandi baru
        </label>
        <input
          id="ulangi_sandi_baru"
          type="password"
          autoComplete="new-password"
          value={ulangi}
          onChange={(e) => setUlangi(e.target.value)}
          disabled={pending}
          className="h-11 rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
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
        {pending ? "Menyimpan…" : "Simpan"}
      </Button>
    </form>
  );
}
