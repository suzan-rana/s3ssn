'use client';

import { useEffect } from 'react';

export function PrintTrigger({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    // Small delay so fonts/layout settle before the print dialog opens
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="font-mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 border border-black/30 hover:bg-black/5 print:hidden"
    >
      ⎙ Print / Save PDF
    </button>
  );
}
