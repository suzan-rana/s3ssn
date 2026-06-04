import { PageHeader } from '@/components/PageHeader';
import { apiGet } from '@/lib/api';

interface Pull {
  id: string;
  number: number;
  title: string;
  state: 'OPEN' | 'MERGED' | 'CLOSED';
  author: string | null;
  openedAt: string;
  mergedAt: string | null;
}

const STATE_STYLE: Record<Pull['state'], string> = {
  OPEN: 'bg-acid text-ink',
  MERGED: 'border hairline text-ink-200',
  CLOSED: 'border hairline text-ink-300',
};

export default async function Pulls() {
  const pulls = (await apiGet<Pull[]>('/pulls')) ?? [];

  return (
    <>
      <PageHeader
        section="Work · Pull requests"
        title={<>Pull requests.</>}
        caption="Time spent per PR, derived from commits and matching sessions."
      />
      {pulls.length === 0 ? (
        <div className="p-10 lg:p-16 hatch border-b hairline">
          <p className="font-display text-[22px] tracking-tightest text-ink-200 max-w-[640px]">
            No pull requests indexed yet. Once GitHub is connected, recent PRs show up here.
          </p>
        </div>
      ) : (
        <div className="border-t hairline">
          {pulls.map((p) => (
            <div key={p.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b hairline items-center hover:bg-ink-500/10">
              <div className="col-span-1 font-mono text-[11px] tnum text-acid">#{p.number}</div>
              <div className="col-span-7 text-[14px] truncate">{p.title}</div>
              <div className="col-span-2 font-mono text-[11px] text-ink-300">{p.author ?? '—'}</div>
              <div className="col-span-1 font-mono text-[11px] text-ink-300 tnum">{new Date(p.openedAt).toISOString().slice(0, 10)}</div>
              <div className="col-span-1 text-right">
                <span className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 ${STATE_STYLE[p.state]}`}>
                  {p.state.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
