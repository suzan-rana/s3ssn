import { PageHeader } from '@/components/PageHeader';
import { RepoRow } from '@/components/repositories/RepoRow';
import { apiGet } from '@/lib/api';

interface Repository {
  id: string;
  name: string;
  defaultBranch: string | null;
  provider: string;
  createdAt: string;
  context: string | null;
}

export default async function Repositories() {
  const repos = (await apiGet<Repository[]>('/repositories')) ?? [];
  const withContext = repos.filter((r) => r.context?.trim()).length;

  return (
    <>
      <PageHeader
        section="Work · Repositories"
        title={<>Repositories.</>}
        caption="Every repo S3ssn has seen activity for. Add optional project context to help the AI turn commits into proper work notes."
        right={
          repos.length > 0 ? (
            <div className="hidden md:flex flex-col items-end">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
                Project context
              </div>
              <div className="font-display text-[28px] tracking-tightest tnum text-acid leading-none mt-1">
                {withContext} / {repos.length}
              </div>
            </div>
          ) : null
        }
      />
      {repos.length === 0 ? (
        <div className="p-10 lg:p-16 hatch border-b hairline">
          <p className="font-display text-[22px] tracking-tightest text-ink-200 max-w-[640px]">
            No repositories yet. Connect GitHub or just start coding — the extension upserts the
            repo when it sees you working in it.
          </p>
        </div>
      ) : (
        <div className="border-t hairline">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 border-b hairline">
            <div className="col-span-1">Provider</div>
            <div className="col-span-5">Repository</div>
            <div className="col-span-3">Default branch</div>
            <div className="col-span-2">Project context</div>
            <div className="col-span-1 text-right">Added</div>
          </div>
          {repos.map((r) => (
            <RepoRow key={r.id} repo={r} />
          ))}
        </div>
      )}
    </>
  );
}
