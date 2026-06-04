import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Stat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  tone?: 'acid' | 'magenta' | 'cyan';
}) {
  return (
    <div className="p-6 lg:p-8 border-r last:border-r-0 hairline relative scanlines">
      <span className={cn('hud-chip mb-4', tone === 'magenta' && 'magenta', tone === 'cyan' && 'cyan')}>
        {label}
      </span>
      <div
        className={cn(
          'mt-4 font-display font-extrabold tracking-tightest leading-none text-[44px] lg:text-[56px] tnum',
          tone === 'acid' && 'glow-acid',
          tone === 'magenta' && 'glow-magenta',
          tone === 'cyan' && 'glow-cyan',
        )}
      >
        {value}
      </div>
      {caption && (
        <div className="mt-4 font-pixel text-[10px] text-ink-300 uppercase tracking-[0.18em]">
          {caption}
        </div>
      )}
    </div>
  );
}
