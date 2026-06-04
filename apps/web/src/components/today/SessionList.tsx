'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { SessionSheet, type Session } from './SessionSheet';
import { Select } from '@/components/ui/Select';

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function durationStr(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function branchColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 65%, 45%)`;
}

type SortKey =
  | 'time-desc'
  | 'time-asc'
  | 'duration-desc'
  | 'duration-asc'
  | 'commits-desc'
  | 'repo-asc';

const SORT_LABEL: Record<SortKey, string> = {
  'time-desc': 'Newest first',
  'time-asc': 'Oldest first',
  'duration-desc': 'Longest first',
  'duration-asc': 'Shortest first',
  'commits-desc': 'Most commits',
  'repo-asc': 'Repository (A→Z)',
};

const SORT_KEYS: SortKey[] = [
  'time-desc',
  'time-asc',
  'duration-desc',
  'duration-asc',
  'commits-desc',
  'repo-asc',
];

export function SessionList({
  sessions,
  leftControls,
  rightControls,
}: {
  sessions: Session[];
  leftControls?: ReactNode;
  rightControls?: ReactNode;
}) {
  const [selected, setSelected] = useState<Session | null>(null);
  const [sort, setSort] = useState<SortKey>('time-asc');

  const sorted = useMemo(() => {
    const copy = [...sessions];
    switch (sort) {
      case 'time-asc':
        copy.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
        break;
      case 'time-desc':
        copy.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        break;
      case 'duration-desc':
        copy.sort((a, b) => b.activeSeconds - a.activeSeconds);
        break;
      case 'duration-asc':
        copy.sort((a, b) => a.activeSeconds - b.activeSeconds);
        break;
      case 'commits-desc':
        copy.sort((a, b) => b.commits.length - a.commits.length);
        break;
      case 'repo-asc':
        copy.sort((a, b) =>
          (a.repository?.name ?? '').localeCompare(b.repository?.name ?? ''),
        );
        break;
    }
    return copy;
  }, [sessions, sort]);

  return (
    <>
      <div className="px-6 py-4 border-t hairline flex items-center justify-between flex-wrap gap-3">
        <div className="shrink-0">{leftControls}</div>
        <div className="shrink-0 flex items-center gap-3">
          <Select<SortKey>
            ariaLabel="Sort sessions"
            prefix="Sort"
            value={sort}
            onChange={setSort}
            options={SORT_KEYS.map((k) => ({ value: k, label: SORT_LABEL[k] }))}
          />
          {rightControls}
        </div>
      </div>

      <ol>
        {sorted.map((s) => {
          const branches = s.branches.length
            ? s.branches
            : [{ id: s.id, branchName: s.branchName ?? '—', startedAt: s.startedAt, endedAt: s.endedAt, ordinal: 0 }];
          return (
            <li key={s.id} className="border-b hairline">
              <button
                type="button"
                onClick={() => setSelected(s)}
                className="w-full grid grid-cols-12 gap-4 px-6 py-5 items-center text-left hover:bg-ink-500/10 transition group"
              >
                <div className="col-span-2 font-mono text-[12px] tnum text-ink-300">
                  {clock(s.startedAt)} → {clock(s.endedAt)}
                </div>
                <div className="col-span-3 font-display text-[20px] tracking-tightest">
                  {s.repository?.name ?? 'unknown'}
                </div>
                <div className="col-span-3 flex flex-wrap items-center gap-1 text-[13px]">
                  {branches.map((b, i, arr) => (
                    <span key={b.id} className="flex items-center gap-1">
                      <span style={{ color: branchColor(b.branchName) }} className="font-mono">
                        {b.branchName}
                      </span>
                      {i < arr.length - 1 && <span className="text-ink-300">→</span>}
                    </span>
                  ))}
                </div>
                <div className="col-span-1 font-mono text-[12px] text-ink-300 tnum">
                  {s.commits.length} {s.commits.length === 1 ? 'commit' : 'commits'}
                </div>
                <div className="col-span-2 text-[12px] text-ink-300">
                  {s.primaryLanguage ?? '—'}
                </div>
                <div className="col-span-1 text-right tnum text-[13px] flex items-center justify-end gap-2">
                  {durationStr(s.activeSeconds)}
                  <span className="text-ink-300 group-hover:translate-x-0.5 transition-transform">
                    ›
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <SessionSheet session={selected} onClose={() => setSelected(null)} />
    </>
  );
}
