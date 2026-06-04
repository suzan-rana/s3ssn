'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SessionSummary } from './SessionSummary';

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
export interface Session {
  id: string;
  startedAt: string;
  endedAt: string;
  activeSeconds: number;
  branchName: string | null;
  primaryLanguage: string | null;
  repository: { id: string; name: string } | null;
  branches: BranchSegment[];
  commits: SessionCommit[];
  summary: string | null;
  summarySource: string | null; // 'llm' | 'rule' | 'user' | null
  summaryEditedAt: string | null;
}

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

export function SessionSheet({
  session,
  onClose,
}: {
  session: Session | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [session, onClose]);

  if (!session || !mounted) return null;

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

  // SVG geometry
  const W = 720;
  const H = 200;
  const PADX = 24;
  const PADY = 40;
  const innerW = W - PADX * 2;
  const innerH = H - PADY * 2;
  const xFor = (t: number) => PADX + ((t - start) / span) * innerW;

  // Lay branches on separate y lanes for a true graph feel
  const laneOf = new Map<string, number>();
  branches.forEach((b) => {
    if (!laneOf.has(b.branchName)) laneOf.set(b.branchName, laneOf.size);
  });
  const lanes = laneOf.size;
  const yFor = (branch: string) =>
    PADY + ((laneOf.get(branch) ?? 0) + 0.5) * (innerH / Math.max(1, lanes));

  // Build the timeline path: horizontal segments + vertical "jumps" on branch switches
  let path = '';
  branches.forEach((b, i) => {
    const sx = xFor(new Date(b.startedAt).getTime());
    const ex = xFor(new Date(b.endedAt).getTime());
    const y = yFor(b.branchName);
    if (i === 0) path += `M ${sx} ${y} `;
    else {
      const prev = branches[i - 1]!;
      const py = yFor(prev.branchName);
      path += `L ${sx} ${py} L ${sx} ${y} `;
    }
    path += `L ${ex} ${y} `;
  });

  // Summary numbers
  const uniqueBranches = laneOf.size;
  const commitsByBranch = new Map<string, number>();
  session.commits.forEach((c) => {
    if (!c.branchName) return;
    commitsByBranch.set(c.branchName, (commitsByBranch.get(c.branchName) ?? 0) + 1);
  });

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] sheet-fade"
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 bottom-0 z-[70] w-full sm:w-[640px] lg:w-[760px] bg-bg shadow-2xl overflow-y-auto sheet-slide border-l hairline"
      >
        <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur px-6 py-5 border-b hairline flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
              Session · {clock(session.startedAt)} → {clock(session.endedAt)}
            </div>
            <h2 className="font-display text-[28px] tracking-tightest mt-1">
              {session.repository?.name ?? 'unknown'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[12px] px-3 py-1.5 border hairline hover:bg-ink-500/15"
            aria-label="Close"
          >
            ✕ ESC
          </button>
        </header>

        {/* Summary grid */}
        <section className="grid grid-cols-4 gap-px bg-ink-500/20 border-b hairline">
          {[
            { label: 'Active', value: durationStr(session.activeSeconds) },
            { label: 'Branches', value: String(uniqueBranches) },
            { label: 'Commits', value: String(session.commits.length) },
            { label: 'Language', value: session.primaryLanguage ?? '—' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="bg-bg p-5 sheet-pop"
              style={{ animationDelay: `${120 + i * 60}ms` }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
                {s.label}
              </div>
              <div className="font-display text-[26px] tracking-tightest tnum mt-1">
                {s.value}
              </div>
            </div>
          ))}
        </section>

        {/* AI / user work-log summary */}
        <SessionSummary
          sessionId={session.id}
          initialSummary={session.summary}
          initialSource={session.summarySource}
          initialEditedAt={session.summaryEditedAt}
        />

        {/* Animated timeline graph */}
        <section className="px-6 py-6 border-b hairline">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
            Timeline graph
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            style={{ background: 'rgb(var(--bg-2) / 0.5)' }}
          >
            {/* Lane guides */}
            {[...laneOf.entries()].map(([name, lane]) => {
              const y = PADY + (lane + 0.5) * (innerH / Math.max(1, lanes));
              return (
                <g key={name}>
                  <line
                    x1={PADX}
                    x2={W - PADX}
                    y1={y}
                    y2={y}
                    stroke={branchColor(name)}
                    strokeOpacity={0.15}
                    strokeDasharray="2 4"
                  />
                  <text
                    x={PADX}
                    y={y - 8}
                    fontFamily="var(--font-mono), monospace"
                    fontSize="10"
                    fill={branchColor(name)}
                  >
                    {name}
                  </text>
                </g>
              );
            })}

            {/* Branch segments */}
            {branches.map((b, i) => {
              const sx = xFor(new Date(b.startedAt).getTime());
              const ex = xFor(new Date(b.endedAt).getTime());
              const y = yFor(b.branchName);
              return (
                <line
                  key={b.id}
                  x1={sx}
                  x2={ex}
                  y1={y}
                  y2={y}
                  stroke={branchColor(b.branchName)}
                  strokeWidth={6}
                  strokeLinecap="round"
                  className="seg-draw"
                  style={{ animationDelay: `${200 + i * 180}ms` }}
                />
              );
            })}

            {/* Branch switch jumps */}
            {branches.slice(1).map((b, i) => {
              const prev = branches[i]!;
              const x = xFor(new Date(b.startedAt).getTime());
              const y1 = yFor(prev.branchName);
              const y2 = yFor(b.branchName);
              return (
                <line
                  key={`jump-${b.id}`}
                  x1={x}
                  x2={x}
                  y1={y1}
                  y2={y2}
                  stroke="rgb(var(--fg) / 0.35)"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  className="jump-fade"
                  style={{ animationDelay: `${200 + i * 180 + 90}ms` }}
                />
              );
            })}

            {/* Commit dots */}
            {session.commits.map((c, i) => {
              const t = new Date(c.committedAt).getTime();
              const cx = xFor(t);
              const cy = yFor(c.branchName ?? branches[0]!.branchName);
              return (
                <g
                  key={c.id}
                  className="commit-pop"
                  style={{ animationDelay: `${500 + i * 90}ms`, transformOrigin: `${cx}px ${cy}px` }}
                >
                  <circle cx={cx} cy={cy} r={6} fill="rgb(var(--bg))" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="rgb(var(--bg))"
                    stroke={branchColor(c.branchName ?? '')}
                    strokeWidth={2}
                  />
                  <title>
                    {c.sha.slice(0, 7)} · {c.message}
                  </title>
                </g>
              );
            })}

            {/* X-axis ticks (start/middle/end) */}
            {[0, 0.5, 1].map((p) => {
              const t = start + p * span;
              return (
                <text
                  key={p}
                  x={PADX + p * innerW}
                  y={H - 10}
                  fontFamily="var(--font-mono), monospace"
                  fontSize="10"
                  fill="rgb(var(--muted))"
                  textAnchor={p === 0 ? 'start' : p === 1 ? 'end' : 'middle'}
                >
                  {clock(new Date(t).toISOString())}
                </text>
              );
            })}
          </svg>
        </section>

        {/* Commit list */}
        <section className="px-6 py-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
            Commits ({session.commits.length})
          </div>
          {session.commits.length === 0 ? (
            <p className="text-ink-300 text-[13px] italic">No commits landed during this session.</p>
          ) : (
            <ul className="space-y-2">
              {session.commits.map((c, i) => (
                <li
                  key={c.id}
                  className="flex items-baseline gap-3 text-[13px] sheet-pop"
                  style={{ animationDelay: `${600 + i * 70}ms` }}
                >
                  <span className="font-mono text-[11px] text-ink-300 tnum w-14 shrink-0">
                    {clock(c.committedAt)}
                  </span>
                  <span className="font-mono text-[11px] text-ink-300 w-16 shrink-0">
                    {c.sha.slice(0, 7)}
                  </span>
                  {c.branchName && (
                    <span
                      className="font-mono text-[11px] shrink-0"
                      style={{ color: branchColor(c.branchName) }}
                    >
                      {c.branchName}
                    </span>
                  )}
                  <span className="truncate">{c.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>

      <style jsx>{`
        .sheet-fade {
          animation: sheet-fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .sheet-slide {
          animation: sheet-slide-in 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .sheet-pop {
          animation: sheet-pop 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
          opacity: 0;
        }
        :global(.seg-draw) {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: seg-draw 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        :global(.jump-fade) {
          opacity: 0;
          animation: sheet-fade-in 320ms ease-out both;
        }
        :global(.commit-pop) {
          opacity: 0;
          transform: scale(0.2);
          animation: commit-pop 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes sheet-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sheet-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes sheet-pop {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes seg-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes commit-pop {
          0% { opacity: 0; transform: scale(0.2); }
          60% { opacity: 1; transform: scale(1.25); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>,
    document.body,
  );
}
