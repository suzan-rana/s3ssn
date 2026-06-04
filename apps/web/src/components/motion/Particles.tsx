'use client';

import { useMemo } from 'react';

/**
 * Pure-DOM floating particles. Pre-seeded with deterministic positions on
 * mount so we don't get hydration mismatches. No canvas, no rAF — just CSS
 * keyframes with randomised delays and drift vectors per node.
 */
export function Particles({
  count = 28,
  tone = 'mixed',
  className,
}: {
  count?: number;
  tone?: 'acid' | 'magenta' | 'cyan' | 'mixed';
  className?: string;
}) {
  const dots = useMemo(() => {
    const out: Array<{
      left: string;
      bottom: string;
      delay: string;
      dur: string;
      dx: string;
      dy: string;
      cls: string;
      size: number;
    }> = [];
    const tones = tone === 'mixed' ? ['', 'magenta', 'cyan'] : [tone === 'acid' ? '' : tone];
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random based on i so SSR == CSR.
      const r = (seed: number) => {
        const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
        return x - Math.floor(x);
      };
      out.push({
        left: `${(r(1) * 100).toFixed(2)}%`,
        bottom: `${(r(2) * 30).toFixed(2)}%`,
        delay: `${(r(3) * 12).toFixed(2)}s`,
        dur: `${(10 + r(4) * 10).toFixed(2)}s`,
        dx: `${(-30 + r(5) * 60).toFixed(0)}px`,
        dy: `${(-200 - r(6) * 200).toFixed(0)}px`,
        cls: tones[i % tones.length] ?? '',
        size: 2 + Math.floor(r(7) * 3),
      });
    }
    return out;
  }, [count, tone]);

  return (
    <div className={'pointer-events-none absolute inset-0 overflow-hidden ' + (className ?? '')}>
      {dots.map((d, i) => (
        <span
          key={i}
          className={`particle ${d.cls}`}
          style={
            {
              left: d.left,
              bottom: d.bottom,
              width: `${d.size}px`,
              height: `${d.size}px`,
              animationDelay: d.delay,
              animationDuration: d.dur,
              '--dx': d.dx,
              '--dy': d.dy,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
