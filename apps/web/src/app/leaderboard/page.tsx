import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { SegBar } from '@/components/hud/SegBar';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Row {
  rank: number;
  userId: string;
  name: string;
  totalSeconds: number;
  sessions: number;
  level: number;
  rank_label: string;
}
interface Leaderboard {
  window: 'today' | 'week' | 'all';
  updatedAt: string;
  rows: Row[];
}

const WINDOWS: Array<{ id: 'today' | 'week' | 'all'; label: string }> = [
  { id: 'today', label: 'TODAY' },
  { id: 'week', label: 'THIS WEEK' },
  { id: 'all', label: 'ALL TIME' },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { window?: string };
}) {
  const window = (WINDOWS.find((w) => w.id === searchParams.window)?.id ?? 'week') as
    | 'today'
    | 'week'
    | 'all';
  const data = await apiGet<Leaderboard>(`/leaderboard?window=${window}`);
  const rows = data?.rows ?? [];
  const topRow = rows[0];
  const maxSeconds = topRow?.totalSeconds ?? 1;
  const [first, second, third] = rows;
  const rest = rows.slice(3);

  return (
    <main className="min-h-screen bg-ink text-bone scanlines">
      <TopBar updatedAt={data?.updatedAt} totalPlayers={rows.length} />
      <Hero window={window} totalPlayers={rows.length} topRow={topRow} />
      <WindowTabs current={window} />
      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Podium first={first} second={second} third={third} />
          <Table rows={rest} maxSeconds={maxSeconds} startRank={4} />
        </>
      )}
      <Footer />
    </main>
  );
}

function TopBar({ updatedAt, totalPlayers }: { updatedAt?: string; totalPlayers: number }) {
  return (
    <div className="border-b hairline bg-ink-800/80 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-7 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-acid hover:text-bone">
            ◂ S3SSN
          </Link>
          <span className="hidden md:inline">/ LEADERBOARD</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-acid">●</span>
          <span className="tnum">{totalPlayers} PLAYERS</span>
          {updatedAt && (
            <span className="hidden md:inline">
              · UPDATED {new Date(updatedAt).toISOString().slice(11, 16)}Z
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Hero({
  window,
  totalPlayers,
  topRow,
}: {
  window: 'today' | 'week' | 'all';
  totalPlayers: number;
  topRow?: Row;
}) {
  return (
    <section className="border-b hairline relative">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 lg:pt-20 pb-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="hud-chip">
              <span className="w-1.5 h-1.5 bg-acid animate-pulse-soft" />
              UNIVERSAL · ALL WORKSPACES
            </span>
            <span className="hud-chip magenta">REAL XP · NO BOTS</span>
            <span className="hud-chip muted">
              {WINDOWS.find((w) => w.id === window)?.label}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-[clamp(48px,8vw,128px)] leading-[0.88] tracking-tightest">
            Who shipped <span className="glow-acid">the most</span>
            <br />
            <span className="text-ink-200">focused time</span>{' '}
            <span className="italic glow-magenta">this week</span>
            <span className="text-bone">?</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[15px] leading-[1.6] text-ink-200">
            S3ssn&apos;s universal leaderboard ranks every player by{' '}
            <span className="text-acid">real focused engineering time</span> — sessionized from
            actual editor activity, not self-reported.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-4 flex flex-col justify-end">
          <div className="hud-panel scan-sweep p-5">
            <span className="hud-chip mb-3">CURRENT CHAMPION</span>
            <div className="font-display font-extrabold text-[28px] tracking-tightest mt-3 truncate">
              {topRow?.name ?? '—'}
            </div>
            <div className="mt-1 font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
              LV {topRow ? String(topRow.level).padStart(2, '0') : '—'} ·{' '}
              {topRow?.rank_label ?? '—'}
            </div>
            <div className="mt-4 font-display font-extrabold text-[40px] leading-none tnum glow-acid">
              {topRow ? formatDuration(topRow.totalSeconds) : '0m'}
            </div>
            <div className="mt-2 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
              focused engineering · {topRow?.sessions ?? 0} sessions
            </div>
            <div className="mt-4 pt-4 border-t hairline font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300 flex justify-between">
              <span>TOTAL PLAYERS</span>
              <span className="text-acid tnum">{String(totalPlayers).padStart(3, '0')}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function WindowTabs({ current }: { current: string }) {
  return (
    <div className="border-b hairline bg-ink-800/60">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-3 flex items-center gap-2">
        {WINDOWS.map((w) => (
          <Link
            key={w.id}
            href={w.id === 'week' ? '/leaderboard' : `/leaderboard?window=${w.id}`}
            className={cn(
              'px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.24em] border hairline transition-colors',
              current === w.id
                ? 'bg-acid text-ink border-acid shadow-glow-acid'
                : 'text-ink-200 hover:text-acid hover:border-acid/50',
            )}
          >
            {w.label}
          </Link>
        ))}
        <div className="ml-auto font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
          Updated every batch · cache 60s
        </div>
      </div>
    </div>
  );
}

function Podium({
  first,
  second,
  third,
}: {
  first?: Row;
  second?: Row;
  third?: Row;
}) {
  if (!first) return null;
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <PodiumCard row={second} place={2} tone="cyan" height="h-[260px]" />
        <PodiumCard row={first} place={1} tone="acid" height="h-[320px]" highlight />
        <PodiumCard row={third} place={3} tone="magenta" height="h-[220px]" />
      </div>
    </section>
  );
}

function PodiumCard({
  row,
  place,
  tone,
  height,
  highlight = false,
}: {
  row?: Row;
  place: 1 | 2 | 3;
  tone: 'acid' | 'magenta' | 'cyan';
  height: string;
  highlight?: boolean;
}) {
  if (!row) {
    return (
      <div className={cn('hud-panel p-5 flex flex-col justify-end hatch', height)}>
        <span className="hud-chip muted mb-3">RANK {String(place).padStart(2, '0')}</span>
        <div className="font-display text-[22px] tracking-tightest text-ink-300">— vacant —</div>
      </div>
    );
  }

  const glow =
    tone === 'magenta' ? 'glow-magenta' : tone === 'cyan' ? 'glow-cyan' : 'glow-acid';

  return (
    <div
      className={cn(
        'hud-panel p-5 flex flex-col justify-end relative',
        highlight && 'scan-sweep shadow-glow-acid',
        height,
      )}
    >
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className={cn('hud-chip', tone === 'magenta' && 'magenta', tone === 'cyan' && 'cyan')}>
          RANK {String(place).padStart(2, '0')}
        </span>
        <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-ink-300">
          {row.rank_label}
        </span>
      </div>
      <Medal place={place} />
      <div className="font-display font-extrabold text-[24px] lg:text-[28px] tracking-tightest truncate">
        {row.name}
      </div>
      <div className="mt-1 font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
        LV {String(row.level).padStart(2, '0')}
      </div>
      <div className={cn('mt-3 font-display font-extrabold leading-none tnum', glow, place === 1 ? 'text-[56px] lg:text-[72px]' : 'text-[40px] lg:text-[52px]')}>
        {formatDuration(row.totalSeconds)}
      </div>
      <div className="mt-2 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
        {row.sessions} sessions
      </div>
    </div>
  );
}

function Medal({ place }: { place: 1 | 2 | 3 }) {
  const color = place === 1 ? '#c4ff3d' : place === 2 ? '#3df0ff' : '#ff2e88';
  const label = place === 1 ? '◆' : place === 2 ? '◇' : '◈';
  return (
    <div
      className="font-display text-[56px] leading-none mb-3"
      style={{ color, filter: `drop-shadow(0 0 14px ${color}aa)` }}
    >
      {label}
    </div>
  );
}

function Table({
  rows,
  maxSeconds,
  startRank,
}: {
  rows: Row[];
  maxSeconds: number;
  startRank: number;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
        <div className="hud-chip mb-6">RANK {String(startRank).padStart(2, '0')} → {String(startRank + rows.length - 1).padStart(2, '0')}</div>
        <div className="hud-panel overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b hairline font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
            <div className="col-span-1">#</div>
            <div className="col-span-4">PLAYER</div>
            <div className="col-span-2">LV</div>
            <div className="col-span-3">PROGRESS</div>
            <div className="col-span-1 text-right">SESS</div>
            <div className="col-span-1 text-right">XP</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.userId}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b hairline items-center hover:bg-acid/5 transition-colors"
            >
              <div className="col-span-1 font-mono text-[12px] tnum text-ink-300">
                {String(r.rank).padStart(2, '0')}
              </div>
              <div className="col-span-4 font-display font-medium text-[15px] truncate">
                {r.name}
              </div>
              <div className="col-span-2 flex items-baseline gap-2">
                <span className="font-display font-extrabold text-[18px] glow-acid tnum">
                  {String(r.level).padStart(2, '0')}
                </span>
                <span className="font-pixel text-[8px] uppercase tracking-[0.18em] text-ink-300">
                  {r.rank_label}
                </span>
              </div>
              <div className="col-span-3">
                <SegBar progress={r.totalSeconds / maxSeconds} segments={16} />
              </div>
              <div className="col-span-1 text-right font-mono text-[12px] tnum text-ink-300">
                {r.sessions}
              </div>
              <div className="col-span-1 text-right font-mono text-[12px] tnum text-acid">
                {formatDuration(r.totalSeconds)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 text-center">
        <div className="hud-chip inline-flex mb-6">BOARD EMPTY · BE FIRST</div>
        <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest">
          No one has played yet.
          <br />
          <span className="glow-acid">Press start.</span>
        </h2>
        <p className="mt-6 max-w-[520px] mx-auto text-[15px] text-ink-200">
          Sign up, install the extension, code for 15 minutes. Your name lands at the top of this
          page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-acid text-ink px-6 py-4 font-pixel text-[11px] uppercase tracking-[0.24em] hover:bg-bone shadow-glow-acid"
          >
            ▶ Press start
          </Link>
          <Link
            href="/"
            className="font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300 hover:text-bone link-grow"
          >
            ◂ Back home
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex items-center justify-between font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
        <span>© S3SSN LABS · MMXXVI</span>
        <span>FAIR PLAY · NO INFLATION · NO BOTS</span>
      </div>
    </footer>
  );
}
