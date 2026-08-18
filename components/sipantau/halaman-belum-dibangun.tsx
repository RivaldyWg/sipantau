export function HalamanBelumDibangun({
  judul,
  keterangan,
}: {
  judul: string;
  keterangan: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <h1 className="text-lg font-semibold text-foreground">{judul}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {keterangan}
      </p>
    </div>
  );
}
