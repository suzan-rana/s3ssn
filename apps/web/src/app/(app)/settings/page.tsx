import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ThemePicker } from '@/components/ThemePicker';
import { apiGet } from '@/lib/api';
import { readTheme } from '@/lib/theme.server';

interface Integration { id: string; provider: string; scope: string | null; createdAt: string }
interface Me { id: string; email: string; name: string | null }
interface WorkspaceLite { id: string }

export default async function Settings() {
  const [me, workspaces, integrations] = await Promise.all([
    apiGet<Me>('/auth/me'),
    apiGet<WorkspaceLite[]>('/workspaces'),
    apiGet<Integration[]>('/integrations'),
  ]);
  const theme = readTheme();
  // Workspace exists for storage purposes but is intentionally never shown.
  const wsId = workspaces?.[0]?.id ?? '';
  const githubConnected = !!integrations?.find((i) => i.provider === 'GITHUB');

  return (
    <>
      <PageHeader
        section="You · Settings"
        title={<>Settings.</>}
        caption="Account, integrations, privacy controls. Everything ties to your account — no workspaces to manage."
      />

      <section className="p-6 lg:p-10 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          Account
        </div>
        <div className="font-display text-[28px] tracking-tightest">
          {me?.name ?? me?.email ?? '—'}
        </div>
        <div className="font-mono text-[12px] text-ink-300 mt-2">{me?.email}</div>
      </section>

      <section className="p-6 lg:p-10 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          Theme
        </div>
        <h2 className="font-display text-[28px] tracking-tightest mb-2">
          Pick the vibe.
        </h2>
        <p className="text-[13px] text-ink-300 mb-6 max-w-[560px]">
          Three flavours. Switch any time — your data, your XP, your level all stay the same.
        </p>
        <ThemePicker current={theme} />
      </section>

      <section className="p-6 lg:p-10 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          VS Code extension
        </div>
        <h2 className="font-display text-[28px] tracking-tightest mb-4">Sign in from the editor.</h2>
        <Link
          href="/settings/token"
          className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] bg-bone text-ink px-4 py-2 hover:bg-acid transition-colors"
        >
          Show my token →
        </Link>
      </section>

      <section id="github" className="p-6 lg:p-10 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          Integrations
        </div>
        <h2 className="font-display text-[28px] tracking-tightest mb-6">GitHub</h2>
        {githubConnected ? (
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] bg-acid text-ink px-3 py-1.5">
              Connected
            </span>
            <a
              href={`/api/github/sync?workspaceId=${wsId}`}
              className="text-[12px] uppercase tracking-[0.18em] text-ink-200 link-grow"
            >
              Sync now →
            </a>
          </div>
        ) : wsId ? (
          <a
            href={`/api/github/connect?workspaceId=${wsId}`}
            className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] bg-bone text-ink px-4 py-2 hover:bg-acid transition-colors"
          >
            Connect GitHub →
          </a>
        ) : (
          <p className="text-ink-300 text-[13px]">
            Your account is still initialising. Refresh in a moment.
          </p>
        )}
      </section>

      <section className="p-6 lg:p-10 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          Privacy
        </div>
        <h2 className="font-display text-[28px] tracking-tightest mb-4">Your data, your call.</h2>
        <ul className="space-y-2 text-[14px] text-ink-200">
          <li>· Pause tracking any time from the VS Code status bar.</li>
          <li>
            · Exclude repos via the{' '}
            <code className="font-mono text-acid">s3ssn.excludedRepos</code> setting.
          </li>
          <li>· Export your raw events as JSON (coming soon).</li>
          <li>· Delete your account and every event in it (coming soon).</li>
        </ul>
      </section>
    </>
  );
}
