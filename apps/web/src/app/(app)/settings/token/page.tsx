import { cookies } from 'next/headers';
import { PageHeader } from '@/components/PageHeader';
import { VEYRA_TOKEN_COOKIE } from '@/lib/api';
import { CopyButton } from './copy-button';

export default function TokenPage() {
  const token = cookies().get(VEYRA_TOKEN_COOKIE)?.value ?? '';

  return (
    <>
      <PageHeader
        section="You · Settings"
        title={<>Extension token.</>}
        caption="Paste this into VS Code: Cmd+Shift+P → Veyra: Sign in. Treat it like a password — it grants full access to your workspace until it expires."
      />
      <section className="p-6 lg:p-10 border-b hairline">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          Personal access token · expires in ~7 days
        </div>
        <div className="bg-ink-500/30 hatch border hairline p-5 font-mono text-[12px] leading-[1.5] break-all select-all">
          {token || '— no active session —'}
        </div>
        {token && (
          <div className="mt-4">
            <CopyButton text={token} />
          </div>
        )}
      </section>
      <section className="p-6 lg:p-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300 mb-3">
          How to use it
        </div>
        <ol className="space-y-3 max-w-[640px]">
          {[
            'Open VS Code (or the Extension Development Host if running from source).',
            'Run command: Veyra: Sign in.',
            'Paste the token. The status bar shows ● Veyra · tracking.',
          ].map((step, i) => (
            <li key={step} className="flex gap-4 border-b hairline pb-3">
              <span className="font-mono text-[12px] tnum text-acid">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[14px] text-ink-200">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
