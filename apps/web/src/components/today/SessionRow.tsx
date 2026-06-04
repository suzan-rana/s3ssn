'use client';

import { useState } from 'react';

interface BranchSegment {
  id: string;
  branchName: string;
  startedAt: string;
  endedAt: string;
  ordinal: number;
}

interface SessionCommit {
  id: string;
  sha: string;
  message: string;
  branchName: string | null;
  committedAt: string;
}

interface Session {
  id: string;
  startedAt: string;
  endedAt: string;
  activeSeconds: number;
  branchName: string | null;
  primaryLanguage: string | null;
  repository: { id: string; name: string } | null;
  branches: BranchSegment[];
  commits: SessionCommit[];
}

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function durationStr(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

// Deterministic color per branch name
function branchColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

export function SessionRow({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);

  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.endedAt).getTime();
  const span = Math.max(1, end - start);

  const branches = session.branches.length
    ? session.branches
    : [
        {
          id: session.id,
          branchName: session.branchName ?? '—',
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          ordinal: 0,
        },
      ];

  return (
    <li className="border-b hairline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full grid grid-cols-12 gap-4 px-6 py-5 items-center text-left hover:bg-ink-500/10 transition"
      >
        <div className="col-span-2 font-mono text-[12px] tnum text-ink-300">
          {clock(session.startedAt)} → {clock(session.endedAt)}
        </div>
        <div className="col-span-3 font-display text-[20px] tracking-tightest">
          {session.repository?.name ?? 'unknown'}
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
          {session.commits.length} {session.commits.length === 1 ? 'commit' : 'commits'}
        </div>
        <div className="col-span-2 text-[12px] text-ink-300">
          {session.primaryLanguage ?? '—'}
        </div>
        <div className="col-span-1 text-right tnum text-[13px] flex items-center justify-end gap-2">
          {durationStr(session.activeSeconds)}
          <span className={`transition-transform text-ink-300 ${open ? 'rotate-90' : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 bg-ink-500/5">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
            Session timeline
          </div>

          {/* Gantt bar — branch segments */}
          <div className="relative h-8 w-full border hairline bg-ink-500/5">
            {branches.map((b) => {
              const segStart = new Date(b.startedAt).getTime();
              const segEnd = new Date(b.endedAt).getTime();
              const left = ((segStart - start) / span) * 100;
              const width = ((segEnd - segStart) / span) * 100;
              return (
                <div
                  key={b.id}
                  className="absolute top-0 bottom-0 flex items-center justify-start px-2 overflow-hidden"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: branchColor(b.branchName) + '33',
                    borderLeft: `2px solid ${branchColor(b.branchName)}`,
                  }}
                  title={`${b.branchName} · ${clock(b.startedAt)} → ${clock(b.endedAt)}`}
                >
                  <span
                    className="font-mono text-[10px] whitespace-nowrap"
                    style={{ color: branchColor(b.branchName) }}
                  >
                    {b.branchName}
                  </span>
                </div>
              );
            })}

            {/* Commit dots */}
            {session.commits.map((c) => {
              const t = new Date(c.committedAt).getTime();
              const left = ((t - start) / span) * 100;
              return (
                <div
                  key={c.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                  style={{ left: `${left}%` }}
                  title={`${c.sha.slice(0, 7)} · ${c.message}`}
                >
                  <div className="w-3 h-3 rounded-full bg-ink ring-2 ring-acid" />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between font-mono text-[10px] text-ink-300 tnum mt-1">
            <span>{clock(session.startedAt)}</span>
            <span>{clock(session.endedAt)}</span>
          </div>

          {/* Commit list */}
          {session.commits.length > 0 && (
            <div className="mt-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-2">
                Commits ({session.commits.length})
              </div>
              <ul className="space-y-1.5">
                {session.commits.map((c) => (
                  <li key={c.id} className="flex items-baseline gap-3 text-[13px]">
                    <span className="font-mono text-[11px] text-ink-300 tnum">
                      {clock(c.committedAt)}
                    </span>
                    <span className="font-mono text-[11px] text-ink-300">
                      {c.sha.slice(0, 7)}
                    </span>
                    {c.branchName && (
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: branchColor(c.branchName) }}
                      >
                        {c.branchName}
                      </span>
                    )}
                    <span>{c.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
