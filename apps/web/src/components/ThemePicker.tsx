'use client';

import { useTransition } from 'react';
import { setThemeAction } from '@/app/(theme)/actions';
import { THEME_META, THEMES, type Theme } from '@/lib/theme';
import { cn } from '@/lib/cn';

export function ThemePicker({
  current,
  size = 'lg',
}: {
  current: Theme;
  size?: 'sm' | 'lg';
}) {
  const [pending, start] = useTransition();

  const isLg = size === 'lg';

  return (
    <div
      className={cn(
        'grid gap-3',
        isLg ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-3',
      )}
    >
      {THEMES.map((t) => {
        const meta = THEME_META[t];
        const active = current === t;
        return (
          <button
            key={t}
            type="button"
            disabled={pending}
            onClick={() => start(() => setThemeAction(t))}
            className={cn(
              'group relative text-left transition-all hover:-translate-y-0.5 disabled:opacity-60',
              'border-2 overflow-hidden',
              active ? 'border-acid shadow-glow-acid' : 'border-ink-500/40 hover:border-ink-300',
              isLg ? 'rounded-hud' : 'rounded-chip',
            )}
            style={{ background: meta.bg }}
          >
            <div className={cn('flex flex-col', isLg ? 'p-5' : 'p-3')}>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-pixel uppercase tracking-[0.24em]',
                    isLg ? 'text-[10px]' : 'text-[8px]',
                  )}
                  style={{ color: meta.swatch[0] }}
                >
                  {meta.name}
                </span>
                {active && (
                  <span
                    className={cn(
                      'font-pixel uppercase tracking-[0.18em]',
                      isLg ? 'text-[10px]' : 'text-[8px]',
                    )}
                    style={{ color: meta.swatch[0] }}
                  >
                    ✓ ACTIVE
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'mt-3 font-display font-extrabold tracking-tightest leading-[0.95]',
                  isLg ? 'text-[28px]' : 'text-[16px]',
                )}
                style={{ color: meta.fg }}
              >
                {meta.name}
              </div>
              {isLg && (
                <div
                  className="mt-1 text-[12px]"
                  style={{ color: meta.fg, opacity: 0.7 }}
                >
                  {meta.tagline}
                </div>
              )}
              <div className={cn('flex gap-1.5', isLg ? 'mt-5' : 'mt-3')}>
                {meta.swatch.map((c, i) => (
                  <span
                    key={i}
                    className={cn(
                      'block',
                      isLg ? 'h-6 w-6' : 'h-3 w-3',
                    )}
                    style={{
                      background: c,
                      boxShadow: `0 0 12px ${c}66`,
                      borderRadius:
                        t === 'duo' ? '50%' : t === 'synthwave' ? '2px' : '0',
                    }}
                  />
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
