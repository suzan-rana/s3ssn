'use client';

import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[12px] uppercase tracking-[0.18em] bg-acid text-ink px-4 py-2 hover:bg-bone transition-colors"
    >
      {copied ? 'Copied ✓' : 'Copy token'}
    </button>
  );
}
