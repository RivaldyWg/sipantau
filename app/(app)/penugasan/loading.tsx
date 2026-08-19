import { KerangkaKartu } from "@/components/sipantau/kartu-spt";

/**
 * §6.2.5: "Daftar memakai kerangka abu-abu tiga kartu selama memuat,
 * bukan pemutar lingkaran."
 */
export default function MemuatDaftarSpt() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="h-6 w-52 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-secondary" />
      </div>
      <KerangkaKartu jumlah={3} />
    </div>
  );
}
