'use client';

import { useEffect, useRef, useState } from 'react';

export type CountUpFormat = 'int' | 'comma' | 'k' | 'lv2' | 'duration';

/**
 * Eases a number from 0 to `value` on mount. Single rAF loop, no deps.
 *
 * `format` is a preset string (not a function) because this component renders
 * inside server-rendered trees — passing a function across the RSC boundary
 * throws. Add a new case here when you need a new shape.
 */
export function CountUp({
  value,
  durationMs = 1200,
  format = 'int',
  className,
}: {
  value: number;
  durationMs?: number;
  format?: CountUpFormat;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const target = value;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{render(n, format)}</span>;
}

function render(n: number, fmt: CountUpFormat): string {
  switch (fmt) {
    case 'comma':
      return Math.round(n).toLocaleString();
    case 'k':
      return `${Math.round(n)}k`;
    case 'lv2':
      return String(Math.round(n)).padStart(2, '0');
    case 'duration':
      return formatDuration(Math.round(n));
    case 'int':
    default:
      return String(Math.round(n));
  }
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
