import { PageHeader } from '@/components/PageHeader';
import { DateNav } from '@/components/today/DateNav';
import { SessionList } from '@/components/today/SessionList';
import { apiGet } from '@/lib/api';
import { formatDuration } from '@/lib/format';

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
  summaryEditedAt: string | null;
}

interface TodayReport {
  date: string;
  totalActiveSeconds: number;
  sessions: Session[];
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function humanDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 24 * 3600 * 1000));
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export default async function Today({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date ?? toISODate(new Date());
  const report = await apiGet<TodayReport>(`/reports/today?date=${date}`);
  const sessions = report?.sessions ?? [];
  const totalSeconds = report?.totalActiveSeconds ?? 0;

  return (
    <>
      <PageHeader
        section="Today · Work log"
        title={<>{humanDate(date)}.</>}
        caption="Every focused session, mapped to repo, branch, language, and time. Click a row to see the timeline."
        right={
          <div className="hidden md:flex flex-col items-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
              Logged
            </div>
            <div className="font-display text-[44px] tracking-tightest tnum text-acid">
              {formatDuration(totalSeconds)}
            </div>
          </div>
        }
      />

      {sessions.length === 0 ? (
        <>
          <div className="px-6 py-4 border-t hairline flex items-center justify-between flex-wrap gap-3">
            <DateNav current={date} />
            <a
              href={`/print/work-log?from=${date}&to=${date}`}
              target="_blank"
              rel="noopener"
              className="font-mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 border hairline hover:bg-ink-500/15 inline-flex items-center gap-2"
            >
              <span>⎙</span> Export PDF
            </a>
          </div>
          <div className="p-10 lg:p-16 hatch border-t hairline">
            <p className="font-display text-[22px] tracking-tightest text-ink-200 max-w-[640px]">
              No focused sessions for {humanDate(date).toLowerCase()}. Pick another day or wait for
              the extension to emit events.
            </p>
          </div>
        </>
      ) : (
        <SessionList
          sessions={sessions}
          leftControls={<DateNav current={date} />}
          rightControls={
            <a
              href={`/print/work-log?from=${date}&to=${date}`}
              target="_blank"
              rel="noopener"
              className="font-mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 border hairline hover:bg-ink-500/15 inline-flex items-center gap-2"
            >
              <span>⎙</span> Export PDF
            </a>
          }
        />
      )}
    </>
  );
}
