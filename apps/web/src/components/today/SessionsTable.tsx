'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { SessionSheet, type Session } from './SessionSheet';
import { Select } from '@/components/ui/Select';

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
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

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-acid/30 text-current px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
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

export function SessionsTable({
  sessions,
  leftControls,
  rightControls,
}: {
  sessions: Session[];
  leftControls?: ReactNode;
  rightControls?: ReactNode;
}) {
  const [selected, setSelected] = useState<Session | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('time-desc');

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const base = !q
      ? sessions
      : sessions.filter((s) => {
          if (s.repository?.name.toLowerCase().includes(q)) return true;
          if (s.primaryLanguage?.toLowerCase().includes(q)) return true;
          if (s.branchName?.toLowerCase().includes(q)) return true;
          if (s.branches.some((b) => b.branchName.toLowerCase().includes(q))) return true;
          if (
            s.commits.some(
              (c) => c.message.toLowerCase().includes(q) || c.sha.toLowerCase().includes(q),
            )
          )
            return true;
          return false;
        });
    const copy = [...base];
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
        copy.sort((a, b) => (a.repository?.name ?? '').localeCompare(b.repository?.name ?? ''));
        break;
    }
    return copy;
  }, [sessions, q, sort]);

  return (
    <div className="border-t hairline">
      <div className="px-6 py-4 border-b hairline flex items-center gap-4 flex-wrap">
        <div className="shrink-0">{leftControls}</div>
        <div className="relative flex-1 min-w-[280px] max-w-[520px] mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-300">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by repo, branch, commit message, or sha…"
            className="w-full font-mono text-[12px] pl-8 pr-8 py-2 border hairline bg-transparent focus:outline-none focus:border-acid"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-300 hover:text-bone px-1"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-4">
          {q && (
            <div className="font-mono text-[11px] text-ink-300 tnum">
              <span className="text-bone font-semibold">{filtered.length}</span> of {sessions.length}
            </div>
          )}
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

      <div className="grid grid-cols-12 gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 border-b hairline">
        <div className="col-span-2">Started</div>
        <div className="col-span-2">Repository</div>
        <div className="col-span-3">Branch history</div>
        <div className="col-span-3">Commits</div>
        <div className="col-span-1">Language</div>
        <div className="col-span-1 text-right">Duration</div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center font-mono text-[12px] text-ink-300">
          No sessions match <span className="text-bone">"{query}"</span> in this range.
        </div>
      ) : null}

      {filtered.map((s) => {
        const branches = s.branches.length
          ? s.branches
          : [{ id: s.id, branchName: s.branchName ?? '—', startedAt: s.startedAt, endedAt: s.endedAt, ordinal: 0 }];
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s)}
            className="w-full grid grid-cols-12 gap-4 px-6 py-4 border-b hairline items-start hover:bg-ink-500/10 transition text-left"
          >
            <div className="col-span-2 font-mono text-[12px] tnum text-ink-300 pt-1">
              <div>
                {clock(s.startedAt)} <span className="opacity-60">→</span> {clock(s.endedAt)}
              </div>
              <div className="text-[10px] opacity-70">{dayLabel(s.startedAt)}</div>
            </div>
            <div className="col-span-2 font-mono text-[13px] pt-1">
              {s.repository?.name ? highlight(s.repository.name, q) : 'unknown'}
            </div>
            <div className="col-span-3 flex flex-wrap items-center gap-1 text-[12px]">
              {branches.map((b, i, arr) => (
                <span key={b.id} className="flex items-center gap-1">
                  <span className="font-mono" style={{ color: branchColor(b.branchName) }}>
                    {highlight(b.branchName, q)}
                  </span>
                  {i < arr.length - 1 && <span className="text-ink-300">→</span>}
                </span>
              ))}
            </div>
            <div className="col-span-3 flex flex-col gap-1 text-[12px]">
              {s.commits.length === 0 ? (
                <span className="text-ink-300/60 italic">no commits</span>
              ) : (
                s.commits.map((c) => (
                  <div key={c.id} className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-ink-300 tnum">
                      {highlight(c.sha.slice(0, 7), q)}
                    </span>
                    <span className="truncate">{highlight(c.message, q)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="col-span-1 text-[12px] text-ink-300 pt-1">
              {s.primaryLanguage ?? '—'}
            </div>
            <div className="col-span-1 text-right tnum text-[13px] pt-1">
              {durationStr(s.activeSeconds)}
            </div>
          </button>
        );
      })}

      <SessionSheet session={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
