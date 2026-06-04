import Link from 'next/link';
import { ReactNode } from 'react';
import { logoutAction } from '../(auth)/actions';
import { apiGet } from '@/lib/api';
import { SegBar } from '@/components/hud/SegBar';
import { SidebarNav, type NavItem } from '@/components/nav/SidebarNav';
import { levelFromSeconds } from '@/lib/level';
import { formatDuration } from '@/lib/format';

const NAV: NavItem[] = [
  { section: 'OVERVIEW', href: '/dashboard', label: 'HUD', glyph: '◆' },
  { section: 'OVERVIEW', href: '/today', label: 'Work log', glyph: '▸' },
  { section: 'OVERVIEW', href: '/sessions', label: 'Sessions', glyph: '▸' },
  { section: 'WORK', href: '/repositories', label: 'Repositories', glyph: '▸' },
  { section: 'WORK', href: '/commits', label: 'Commits', glyph: '▸' },
  { section: 'YOU', href: '/settings', label: 'Settings', glyph: '✦' },
];

interface WeeklyMini { totalActiveSeconds: number }

export default async function AppLayout({ children }: { children: ReactNode }) {
  const weekly = await apiGet<WeeklyMini>('/reports/weekly').catch(() => null);
  const xp = weekly?.totalActiveSeconds ?? 0;
  const { level, rank, progress, currentXp, nextThresholdXp } = levelFromSeconds(xp);

  return (
    <div className="min-h-screen bg-ink text-bone grid grid-cols-12">
      <aside className="col-span-12 lg:col-span-3 xl:col-span-2 lg:sticky lg:top-0 lg:self-start lg:h-screen lg:overflow-y-auto border-b lg:border-b-0 lg:border-r hairline flex flex-col scanlines z-10">
        <div className="px-5 py-4 border-b hairline flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-[18px] tracking-tightest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-acid shadow-glow-acid crt-flicker" />
            VEYRA
          </Link>
          <span className="font-pixel text-[8px] uppercase tracking-[0.24em] text-ink-300">v0.1</span>
        </div>

        <div className="px-5 py-5 border-b hairline">
          <div className="flex items-baseline justify-between mb-1">
            <span className="hud-chip">LV</span>
            <span className="font-pixel text-[8px] text-ink-300 uppercase tracking-[0.18em]">
              {rank}
            </span>
          </div>
          <div className="font-display font-extrabold text-[44px] leading-[0.85] tracking-tightest glow-acid tnum mt-1">
            {String(level).padStart(2, '0')}
          </div>
          <div className="mt-3">
            <SegBar progress={progress} segments={16} />
          </div>
          <div className="mt-2 font-mono text-[9px] tnum text-ink-300 flex justify-between">
            <span>{formatDuration(currentXp)}</span>
            <span>/ {formatDuration(nextThresholdXp)}</span>
          </div>
        </div>

        <SidebarNav items={NAV} />
        <form action={logoutAction} className="border-t hairline px-5 py-3 flex items-center justify-between">
          <div className="font-pixel text-[9px] uppercase tracking-[0.24em] text-acid flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-acid inline-block animate-pulse-soft" />
            TRACKING · LIVE
          </div>
          <button
            type="submit"
            className="font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300 hover:text-magenta"
          >
            QUIT
          </button>
        </form>
      </aside>
      <main className="col-span-12 lg:col-span-9 xl:col-span-10 relative">{children}</main>
    </div>
  );
}
