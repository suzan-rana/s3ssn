import { apiGet } from '@/lib/api';
import { PrintTrigger } from './print-trigger';

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
  summary: string | null;
  summarySource: string | null;
}
interface Me {
  email: string;
  name: string | null;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function clock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function dateStr(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function dateShort(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function durationStr(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Work log',
};

export default async function PrintWorkLog({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; auto?: string }>;
}) {
  const sp = await searchParams;
  const today = toISO(new Date());
  const from = sp.from ?? today;
  const to = sp.to ?? from;
  const autoPrint = sp.auto !== '0';

  const fromIso = new Date(from + 'T00:00:00').toISOString();
  const toIso = new Date(to + 'T23:59:59.999').toISOString();
  const [sessions, me] = await Promise.all([
    apiGet<Session[]>(`/sessions?from=${fromIso}&to=${toIso}`).then((r) => r ?? []),
    apiGet<Me>('/auth/me'),
  ]);

  // Sort oldest → newest for reading
  const ordered = [...sessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  const totalSeconds = ordered.reduce((s, x) => s + x.activeSeconds, 0);
  const totalCommits = ordered.reduce((s, x) => s + x.commits.length, 0);
  const uniqueRepos = new Set(ordered.map((s) => s.repository?.name).filter(Boolean));
  const uniqueBranches = new Set<string>();
  ordered.forEach((s) => s.branches.forEach((b) => uniqueBranches.add(b.branchName)));

  // Group sessions by day for readability when range > 1 day
  const byDay = new Map<string, Session[]>();
  for (const s of ordered) {
    const d = toISO(new Date(s.startedAt));
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(s);
  }

  const heading = from === to ? dateStr(from + 'T00:00:00') : `${dateShort(from + 'T00:00:00')} – ${dateShort(to + 'T00:00:00')}`;

  return (
    <div className="print-root">
      <style>{`
        html, body { background: #ffffff !important; }
        body::before, body::after { display: none !important; }
        .grain::before { display: none !important; }
        .print-root {
          color: #111;
          font-family: ui-sans-serif, system-ui, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          min-height: 100vh;
          background: #fff;
        }
        .doc {
            max-width: 760px;
            margin: 0 auto;
            padding: 32px 28px;
            font-size: 12px;
            line-height: 1.5;
          }
          .doc h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -0.02em; }
          .doc h2 { font-size: 14px; margin: 28px 0 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #444; font-weight: 600; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
          .doc .muted { color: #666; }
          .doc .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1px solid #ccc; margin-top: 18px; }
          .summary-bar .cell { padding: 12px; border-right: 1px solid #ddd; }
          .summary-bar .cell:last-child { border-right: 0; }
          .summary-bar .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.18em; color: #777; }
          .summary-bar .value { font-size: 22px; font-weight: 700; margin-top: 2px; letter-spacing: -0.02em; }
          .session { border: 1px solid #ddd; padding: 14px 16px; margin: 10px 0; page-break-inside: avoid; }
          .session header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
          .session h3 { font-size: 14px; margin: 0; font-weight: 600; }
          .session .time { font-family: ui-monospace, monospace; color: #444; font-size: 11px; }
          .branches { margin-top: 6px; font-family: ui-monospace, monospace; font-size: 11px; color: #444; }
          .branches .arrow { color: #aaa; margin: 0 4px; }
          .work-log { margin-top: 10px; padding: 10px 12px; background: #f7f5ef; border-left: 3px solid #999; font-size: 12.5px; line-height: 1.55; }
          .work-log .tag { font-size: 9px; text-transform: uppercase; letter-spacing: 0.18em; color: #666; margin-bottom: 4px; }
          .commits { margin-top: 10px; }
          .commits .commit { display: grid; grid-template-columns: 50px 70px 1fr; gap: 8px; font-size: 11px; padding: 2px 0; }
          .commits .sha { font-family: ui-monospace, monospace; color: #666; }
          .commits .time { color: #666; font-family: ui-monospace, monospace; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #888; display: flex; justify-content: space-between; }
          .day-heading { margin-top: 24px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #555; font-weight: 600; padding-bottom: 4px; border-bottom: 1px dashed #ddd; }
        @page { margin: 0; size: A4; }
        @media print {
          .doc { max-width: none; padding: 14mm 14mm 18mm; }
          .session { break-inside: avoid; }
        }
      `}</style>

      <div className="doc">
          <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div className="mono muted" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                S3ssn · Work log
              </div>
              <h1>{heading}</h1>
              <div className="muted" style={{ marginTop: 4 }}>
                {me?.name ?? me?.email ?? 'Engineer'} {me?.email && me?.name ? `· ${me.email}` : ''}
              </div>
            </div>
            <PrintTrigger auto={autoPrint} />
          </header>

          <div className="summary-bar">
            <div className="cell">
              <div className="label">Active time</div>
              <div className="value">{durationStr(totalSeconds)}</div>
            </div>
            <div className="cell">
              <div className="label">Sessions</div>
              <div className="value">{ordered.length}</div>
            </div>
            <div className="cell">
              <div className="label">Commits</div>
              <div className="value">{totalCommits}</div>
            </div>
            <div className="cell">
              <div className="label">Repos</div>
              <div className="value">{uniqueRepos.size}</div>
            </div>
          </div>

          <h2>Sessions</h2>

          {ordered.length === 0 ? (
            <p className="muted">No focused sessions in this range.</p>
          ) : (
            [...byDay.entries()].map(([day, daySessions]) => (
              <div key={day}>
                {from !== to && <div className="day-heading">{dateStr(day + 'T00:00:00')}</div>}
                {daySessions.map((s) => {
                  const branches = s.branches.length
                    ? s.branches
                    : s.branchName
                    ? [{ branchName: s.branchName }]
                    : [];
                  return (
                    <div key={s.id} className="session">
                      <header>
                        <div>
                          <h3>{s.repository?.name ?? 'unknown'}</h3>
                          <div className="branches">
                            {branches.map((b, i) => (
                              <span key={i}>
                                {i > 0 && <span className="arrow">→</span>}
                                {b.branchName}
                              </span>
                            ))}
                            {s.primaryLanguage && (
                              <span className="muted"> · {s.primaryLanguage}</span>
                            )}
                          </div>
                        </div>
                        <div className="time">
                          {clock(s.startedAt)} → {clock(s.endedAt)} · {durationStr(s.activeSeconds)}
                        </div>
                      </header>

                      {s.summary && (
                        <div className="work-log">
                          <div className="tag">
                            Work-log entry{' '}
                            {s.summarySource === 'user'
                              ? '· author note'
                              : s.summarySource === 'llm'
                              ? '· AI-generated'
                              : '· auto-generated'}
                          </div>
                          <div>{s.summary}</div>
                        </div>
                      )}

                      {s.commits.length > 0 && (
                        <div className="commits">
                          {s.commits.map((c) => (
                            <div key={c.id} className="commit">
                              <span className="time">{clock(c.committedAt)}</span>
                              <span className="sha">{c.sha.slice(0, 7)}</span>
                              <span>{c.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}

          <div className="footer">
            <div>Generated {new Date().toLocaleString()} · s3ssn</div>
            <div className="mono">
              {from} → {to}
          </div>
        </div>
      </div>
    </div>
  );
}
