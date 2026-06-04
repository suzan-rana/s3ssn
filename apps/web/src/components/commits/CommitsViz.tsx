'use client';

import { useMemo, useState } from 'react';

export interface Commit {
  id: string;
  sha: string;
  message: string;
  authorName: string | null;
  committedAt: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  branchName: string | null;
  repository: { id: string; name: string } | null;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function firstLine(s: string) {
  return s.split('\n', 1)[0] ?? '';
}
function repoColor(name: string | null | undefined): string {
  if (!name) return 'hsl(0, 0%, 50%)';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 65%, 48%)`;
}
function relTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const WEEKS = 14;
const DAYS = WEEKS * 7;

export function CommitsViz({ commits }: { commits: Commit[] }) {
  const [hover, setHover] = useState<{ date: string; count: number; commits: Commit[] } | null>(null);
  const [repoFilter, setRepoFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const today = startOfDay(new Date());
  const start = addDays(today, -(DAYS - 1));

  // Build a date-keyed map of commits within range
  const byDay = useMemo(() => {
    const map = new Map<string, Commit[]>();
    for (let i = 0; i < DAYS; i++) {
      map.set(toISO(addDays(start, i)), []);
    }
    for (const c of commits) {
      const k = toISO(new Date(c.committedAt));
      if (map.has(k)) map.get(k)!.push(c);
    }
    return map;
  }, [commits]);

  // Stats
  const inRange = useMemo(() => commits.filter((c) => {
    const t = new Date(c.committedAt).getTime();
    return t >= start.getTime();
  }), [commits, start]);

  const activeDays = [...byDay.values()].filter((v) => v.length > 0).length;
  let longestStreak = 0;
  let cur = 0;
  for (const [, arr] of byDay) {
    if (arr.length > 0) {
      cur++;
      if (cur > longestStreak) longestStreak = cur;
    } else cur = 0;
  }
  let busiest: { date: string; count: number } | null = null;
  for (const [d, arr] of byDay) {
    if (!busiest || arr.length > busiest.count) busiest = { date: d, count: arr.length };
  }

  // Per-repo totals for the legend
  const byRepo = new Map<string, { name: string; count: number }>();
  for (const c of inRange) {
    if (!c.repository) continue;
    const cur = byRepo.get(c.repository.id) ?? { name: c.repository.name, count: 0 };
    cur.count++;
    byRepo.set(c.repository.id, cur);
  }
  const repos = [...byRepo.entries()].sort((a, b) => b[1].count - a[1].count);

  const maxPerDay = Math.max(1, ...[...byDay.values()].map((v) => v.length));

  // Per-day-of-week × hour heatmap for "rhythm"
  const rhythm = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const c of inRange) {
      const d = new Date(c.committedAt);
      grid[d.getDay()]![d.getHours()]!++;
    }
    return grid;
  }, [inRange]);
  const maxRhythm = Math.max(1, ...rhythm.flat());

  // Filtered commit stream
  const q = query.trim().toLowerCase();
  const stream = useMemo(() => {
    return commits.filter((c) => {
      if (repoFilter && c.repository?.id !== repoFilter) return false;
      if (!q) return true;
      if (c.message.toLowerCase().includes(q)) return true;
      if (c.sha.toLowerCase().includes(q)) return true;
      if (c.repository?.name.toLowerCase().includes(q)) return true;
      if (c.branchName?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [commits, repoFilter, q]);

  // Build calendar weeks (columns)
  const weeks: { date: Date; commits: Commit[] }[][] = [];
  let cursor = start;
  // Align to Sunday so column = week
  const startDow = start.getDay();
  if (startDow !== 0) cursor = addDays(start, -startDow);
  for (let w = 0; w < WEEKS + 1; w++) {
    const col: { date: Date; commits: Commit[] }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(cursor, w * 7 + d);
      const k = toISO(date);
      col.push({ date, commits: byDay.get(k) ?? [] });
    }
    weeks.push(col);
  }

  const intensity = (n: number): string => {
    if (n === 0) return 'rgb(var(--muted-2) / 0.15)';
    const t = Math.min(1, n / maxPerDay);
    const alpha = 0.25 + t * 0.7;
    return `rgb(var(--accent-1) / ${alpha.toFixed(2)})`;
  };

  return (
    <div>
      {/* Top stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-500/20 border-y hairline">
        {[
          { label: 'Commits · 90d', value: String(inRange.length) },
          { label: 'Active days', value: `${activeDays} / ${DAYS}` },
          { label: 'Longest streak', value: `${longestStreak}d` },
          {
            label: 'Busiest day',
            value: busiest && busiest.count > 0 ? `${busiest.count}` : '—',
            sub: busiest && busiest.count > 0 ? busiest.date : undefined,
          },
        ].map((s, i) => (
          <div key={s.label} className="bg-bg p-5 stat-pop" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
              {s.label}
            </div>
            <div className="font-display text-[34px] tracking-tightest tnum mt-1 leading-none">
              {s.value}
            </div>
            {s.sub && (
              <div className="font-mono text-[10px] text-ink-300 mt-1 tnum">{s.sub}</div>
            )}
          </div>
        ))}
      </section>

      {/* Contribution heatmap */}
      <section className="px-6 py-6 border-b hairline">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
            Contribution heatmap · last {WEEKS} weeks
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-ink-300">
            <span>less</span>
            {[0.15, 0.4, 0.6, 0.8, 0.95].map((a, i) => (
              <span
                key={i}
                className="w-3 h-3 inline-block"
                style={{ background: `rgb(var(--accent-1) / ${a})` }}
              />
            ))}
            <span>more</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-[3px] min-w-fit relative">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[3px] pr-2 font-mono text-[9px] text-ink-300 tnum justify-around">
              <span>Sun</span>
              <span className="opacity-0">·</span>
              <span>Tue</span>
              <span className="opacity-0">·</span>
              <span>Thu</span>
              <span className="opacity-0">·</span>
              <span>Sat</span>
            </div>
            {weeks.map((col, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {col.map((cell, di) => {
                  const inWindow = cell.date >= start && cell.date <= today;
                  return (
                    <button
                      key={di}
                      type="button"
                      disabled={!inWindow}
                      onMouseEnter={() =>
                        setHover({
                          date: toISO(cell.date),
                          count: cell.commits.length,
                          commits: cell.commits,
                        })
                      }
                      onMouseLeave={() => setHover(null)}
                      className="w-[14px] h-[14px] block transition-transform hover:scale-125"
                      style={{
                        background: inWindow ? intensity(cell.commits.length) : 'transparent',
                        animation: inWindow ? `cellFade 600ms ease both` : undefined,
                        animationDelay: `${(wi * 7 + di) * 4}ms`,
                      }}
                      aria-label={`${toISO(cell.date)}: ${cell.commits.length} commits`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hover detail */}
        <div className="mt-4 min-h-[42px] font-mono text-[12px]">
          {hover ? (
            <div>
              <span className="text-ink-300">
                {new Date(hover.date + 'T00:00:00').toLocaleDateString([], {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
                {' · '}
              </span>
              <span className="text-acid font-semibold tnum">
                {hover.count} {hover.count === 1 ? 'commit' : 'commits'}
              </span>
              {hover.commits.length > 0 && (
                <div className="mt-1 text-[11px] text-ink-200 truncate">
                  {hover.commits
                    .slice(0, 3)
                    .map((c) => firstLine(c.message))
                    .join(' · ')}
                  {hover.commits.length > 3 ? ` +${hover.commits.length - 3} more` : ''}
                </div>
              )}
            </div>
          ) : (
            <span className="text-ink-300/60 italic">Hover a cell to inspect</span>
          )}
        </div>
      </section>

      {/* Rhythm: hour × weekday */}
      <section className="px-6 py-6 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          Rhythm · when you commit
        </div>
        <div className="flex gap-3 items-start">
          <div className="flex flex-col gap-[3px] font-mono text-[9px] text-ink-300 pt-4 tnum">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="h-[14px] flex items-center">
                {d}
              </span>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="grid grid-rows-7 gap-[3px]" style={{ gridAutoFlow: 'column' }}>
              {rhythm.flatMap((row, dow) =>
                row.map((v, h) => (
                  <div
                    key={`${dow}-${h}`}
                    className="w-[14px] h-[14px]"
                    style={{
                      background: v === 0 ? 'rgb(var(--muted-2) / 0.12)' : `rgb(var(--accent-3) / ${(0.25 + (v / maxRhythm) * 0.7).toFixed(2)})`,
                    }}
                    title={`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]} ${h.toString().padStart(2, '0')}:00 · ${v} commits`}
                  />
                )),
              )}
            </div>
            <div className="flex justify-between font-mono text-[9px] text-ink-300 mt-1 tnum">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          </div>
        </div>
      </section>

      {/* Repo legend / filter */}
      {repos.length > 0 && (
        <section className="px-6 py-4 border-b hairline">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mr-2">
              By repo
            </span>
            <button
              type="button"
              onClick={() => setRepoFilter(null)}
              className={`font-mono text-[11px] px-2.5 py-1 border hairline transition ${
                !repoFilter ? 'bg-acid text-ink border-acid' : 'hover:bg-ink-500/15'
              }`}
            >
              All
            </button>
            {repos.map(([id, r]) => {
              const active = repoFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRepoFilter(active ? null : id)}
                  className={`font-mono text-[11px] px-2.5 py-1 border transition flex items-center gap-2 ${
                    active ? 'border-acid bg-acid/10' : 'hairline hover:bg-ink-500/15'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: repoColor(r.name) }}
                  />
                  {r.name}
                  <span className="text-ink-300 tnum">{r.count}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Commit stream */}
      <section className="px-6 py-4 border-b hairline">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
            Stream
          </div>
          <div className="relative flex-1 max-w-[460px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-300">
              ⌕
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages, branches, sha, repo…"
              className="w-full font-mono text-[12px] pl-8 pr-3 py-2 border hairline bg-transparent focus:outline-none focus:border-acid"
            />
          </div>
          <span className="font-mono text-[11px] text-ink-300 tnum">
            {stream.length} of {commits.length}
          </span>
        </div>
      </section>

      <ol className="px-6 pb-10">
        {stream.map((c, i) => {
          const color = repoColor(c.repository?.name);
          const size = Math.min(64, 6 + Math.sqrt(c.additions + c.deletions));
          return (
            <li
              key={c.id}
              className="grid gap-4 items-center py-3 border-b hairline last:border-0 stream-in"
              style={{
                gridTemplateColumns: '92px 14px 84px 1fr auto',
                animationDelay: `${Math.min(i, 40) * 18}ms`,
              }}
            >
              <span className="font-mono text-[10px] text-ink-300 tnum">{relTime(c.committedAt)}</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 10px ${color}88` }}
                title={c.repository?.name ?? ''}
              />
              <span className="font-mono text-[11px] text-acid tnum">{c.sha.slice(0, 7)}</span>
              <div className="min-w-0">
                <div className="truncate text-[13px]">{firstLine(c.message)}</div>
                <div className="flex gap-3 text-[10px] text-ink-300 font-mono mt-0.5">
                  <span style={{ color }}>{c.repository?.name ?? 'unknown'}</span>
                  {c.branchName && <span>· {c.branchName}</span>}
                  <span>· {c.filesChanged}f</span>
                  <span className="text-acid">+{c.additions}</span>
                  <span className="text-magenta">-{c.deletions}</span>
                </div>
              </div>
              <span
                className="inline-block h-1.5 rounded-full"
                style={{
                  width: `${size}px`,
                  background: `linear-gradient(90deg, ${color}, ${color}66)`,
                }}
                title={`${c.additions + c.deletions} lines touched`}
              />
            </li>
          );
        })}
        {stream.length === 0 && (
          <li className="py-12 text-center font-mono text-[12px] text-ink-300">
            No commits match the current filter.
          </li>
        )}
      </ol>

      <style jsx>{`
        @keyframes cellFade {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes streamIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes statPop {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.stream-in) {
          animation: streamIn 460ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        :global(.stat-pop) {
          animation: statPop 460ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}
