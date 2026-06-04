'use client';

import { ReactNode, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/cn';

/**
 * Cursor-driven perspective tilt. Updates CSS vars on the inner `.tilt` element.
 * `max` caps the rotation in degrees. Set `glow` to also paint a spotlight.
 */
export function TiltCard({
  children,
  max = 6,
  glow = true,
  className,
}: {
  children: ReactNode;
  max?: number;
  glow?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (x - 0.5) * 2 * max;
    const ry = -(y - 0.5) * 2 * max;
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };

  const reset = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('tilt', glow && 'spotlight', className)}
    >
      {children}
    </div>
  );
}
