'use client';

import { useEffect, useState } from 'react';

/**
 * Self-destructing "+N XP" toast. Fires once on mount, fades out after the
 * animation finishes. Drop it on a page after a goal is met or on initial
 * load to greet returning players.
 */
export function XpToast({
  amount,
  label = 'XP gained',
  delayMs = 800,
}: {
  amount: number;
  label?: string;
  delayMs?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delayMs);
    const t2 = setTimeout(() => setVisible(false), delayMs + 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [delayMs]);

  if (!visible) return null;
  return (
    <div className="xp-toast hud-panel scan-sweep px-4 py-3 shadow-glow-acid">
      <div className="font-pixel text-[9px] uppercase tracking-[0.24em] text-acid">{label}</div>
      <div className="font-display font-extrabold text-[28px] leading-none glow-acid tnum mt-1">
        +{amount.toLocaleString()}
      </div>
    </div>
  );
}
