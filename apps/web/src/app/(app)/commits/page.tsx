import { PageHeader } from '@/components/PageHeader';
import { CommitsViz, type Commit } from '@/components/commits/CommitsViz';
import { apiGet } from '@/lib/api';

export default async function Commits() {
  const commits = (await apiGet<Commit[]>('/commits')) ?? [];

  return (
    <>
      <PageHeader
        section="Work · Commits"
        title={<>Commits.</>}
        caption="Every commit, mapped across time. Heatmap, rhythm, and a live stream — color-coded by repository."
      />
      {commits.length === 0 ? (
        <div className="p-10 lg:p-16 hatch border-b hairline">
          <p className="font-display text-[22px] tracking-tightest text-ink-200 max-w-[640px]">
            No commits indexed yet. Connect GitHub from settings to import recent history.
          </p>
        </div>
      ) : (
        <CommitsViz commits={commits} />
      )}
    </>
  );
}
