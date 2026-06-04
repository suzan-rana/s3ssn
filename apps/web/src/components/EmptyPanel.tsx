export function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="p-10 lg:p-16 hatch border-b hairline">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
        Empty state · scaffold
      </div>
      <p className="font-display text-[22px] tracking-tightest text-ink-200 max-w-[640px]">
        {label}
      </p>
    </div>
  );
}
