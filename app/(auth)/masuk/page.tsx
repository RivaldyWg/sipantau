import { FormulirMasuk } from "./formulir-masuk";

export const metadata = {
  title: "Masuk — SiPANTAU",
};

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ nonaktif?: string }>;
}) {
  const { nonaktif } = await searchParams;

  return (
    <>
      {nonaktif && (
        <p className="mb-4 rounded-md bg-[var(--sp-red)]/10 px-3 py-2 text-sm text-[var(--sp-red)]">
          Akun ini sedang tidak aktif. Hubungi Kanit unit Anda.
        </p>
      )}
      <FormulirMasuk />
    </>
  );
}
