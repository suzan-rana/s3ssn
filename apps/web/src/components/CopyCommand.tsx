'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export function CopyCommand({
  command,
  className,
  prompt = '$',
}: {
  command: string;
  className?: string;
  prompt?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        'group w-full text-left flex items-center justify-between gap-4',
        'hud-panel scan-sweep px-5 py-4 hover:-translate-y-0.5 transition-transform',
        className,
      )}
    >
      <span className="font-mono text-[14px] lg:text-[16px] flex items-center gap-3 min-w-0">
        <span className="text-acid select-none">{prompt}</span>
        <span className="truncate">{command}</span>
      </span>
      <span
        className={cn(
          'font-pixel text-[10px] uppercase tracking-[0.18em] shrink-0 transition-colors',
          copied ? 'text-acid' : 'text-ink-300 group-hover:text-acid',
        )}
      >
        {copied ? 'COPIED ✓' : 'COPY ⌘C'}
      </span>
    </button>
  );
}
