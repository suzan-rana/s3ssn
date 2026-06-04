import { PageHeader } from '@/components/PageHeader';
import { DateRangeNav } from '@/components/today/DateRangeNav';
import { SessionsTable } from '@/components/today/SessionsTable';
import { apiGet } from '@/lib/api';
import { formatDuration } from '@/lib/format';
import type { Session } from '@/components/today/SessionSheet';

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function Sessions({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const today = toISODate(new Date());
  const from = sp.from ?? toISODate(new Date(Date.now() - 6 * 24 * 3600 * 1000));
  const to = sp.to ?? today;

  // API expects ISO timestamps; expand to full days
  const fromIso = new Date(from + 'T00:00:00').toISOString();
  const toIso = new Date(to + 'T23:59:59.999').toISOString();
  const sessions =
    (await apiGet<Session[]>(`/sessions?from=${fromIso}&to=${toIso}`)) ?? [];

  const totalActiveSeconds = sessions.reduce((s, x) => s + x.activeSeconds, 0);
  const totalCommits = sessions.reduce((s, x) => s + x.commits.length, 0);
  const uniqueRepos = new Set(sessions.map((s) => s.repository?.id).filter(Boolean)).size;

  return (
    <>
      <PageHeader
        section="Work · Sessions"
        title={<>Sessions.</>}
        caption="Focused coding sessions, sessionized from your VS Code activity."
        right={
          <div className="hidden md:flex flex-col items-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
              Time logged · in range
            </div>
            <div className="font-display text-[44px] tracking-tightest tnum text-acid leading-none mt-1">
              {formatDuration(totalActiveSeconds)}
            </div>
          </div>
        }
      />

      {sessions.length === 0 ? (
        <>
          <div className="px-6 py-4 border-t hairline">
            <DateRangeNav from={from} to={to} />
          </div>
          <div className="p-10 lg:p-16 hatch border-t hairline">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
              Nothing yet
            </div>
            <p className="font-display text-[22px] tracking-tightest text-ink-200 max-w-[640px]">
              No sessions in this range. Try widening the date window or wait for the extension to
              emit events.
            </p>
          </div>
        </>
      ) : (
        <SessionsTable
          sessions={sessions}
          leftControls={<DateRangeNav from={from} to={to} />}
          rightControls={
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-5 font-mono text-[11px] text-ink-300 tnum">
                <span>
                  <span className="text-bone font-semibold">{sessions.length}</span>{' '}
                  {sessions.length === 1 ? 'session' : 'sessions'}
                </span>
                <span>
                  <span className="text-bone font-semibold">{totalCommits}</span> commits
                </span>
                <span>
                  <span className="text-bone font-semibold">{uniqueRepos}</span>{' '}
                  {uniqueRepos === 1 ? 'repo' : 'repos'}
                </span>
              </div>
              <a
                href={`/print/work-log?from=${from}&to=${to}`}
                target="_blank"
                rel="noopener"
                className="font-mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 border hairline hover:bg-ink-500/15 inline-flex items-center gap-2"
              >
                <span>⎙</span> Export PDF
              </a>
            </div>
          }
        />
      )}
    </>
  );
}
