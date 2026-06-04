import { cn } from '@/lib/cn';

export interface Achievement {
  id: string;
  glyph: string;
  name: string;
  hint: string;
  unlocked: boolean;
}

export function AchievementGrid({ items }: { items: Achievement[] }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {items.map((a, i) => (
        <div
          key={a.id}
          className={cn(
            'hud-panel p-3 aspect-square flex flex-col items-center justify-center text-center stagger-in transition-transform hover:-translate-y-0.5 hover:scale-[1.03]',
            !a.unlocked && 'opacity-35 grayscale',
            a.unlocked && 'cursor-pointer',
          )}
          style={{ ['--i' as string]: i } as React.CSSProperties}
          title={a.hint}
        >
          <div
            className={cn(
              'font-display text-[36px] leading-none mb-1 transition-transform group-hover:scale-110',
              a.unlocked ? 'glow-acid animate-pulse-soft' : 'text-ink-300',
            )}
          >
            {a.glyph}
          </div>
          <div className="font-pixel text-[8px] uppercase tracking-[0.18em] text-ink-200">
            {a.name}
          </div>
        </div>
      ))}
    </div>
  );
}
