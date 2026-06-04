import { cn } from '@/lib/cn';

/**
 * Pixel-segmented bar. The filled cells animate in sequence via per-cell
 * `--i` indices feeding into the seg-pop keyframe (see globals.css).
 */
export function SegBar({
  progress,
  segments = 20,
  tone = 'acid',
  className,
}: {
  progress: number;
  segments?: number;
  tone?: 'acid' | 'magenta' | 'cyan';
  className?: string;
}) {
  const filled = Math.round(progress * segments);
  return (
    <div
      className={cn(
        'segbar',
        tone === 'magenta' && 'magenta',
        tone === 'cyan' && 'cyan',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          data-on={i < filled ? '1' : '0'}
          style={{ ['--i' as string]: i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
