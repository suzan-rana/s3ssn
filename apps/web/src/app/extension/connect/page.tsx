import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { VEYRA_TOKEN_COOKIE } from '@/lib/api';
import { ConnectRedirect } from './connect-redirect';

const ALLOWED_REDIRECT_SCHEMES = ['vscode:', 'vscode-insiders:', 'cursor:', 'windsurf:'];

function sanitizeRedirect(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (!ALLOWED_REDIRECT_SCHEMES.includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function ExtensionConnect({
  searchParams,
}: {
  searchParams: { state?: string; redirect?: string };
}) {
  const state = searchParams.state?.trim();
  const redirectTarget = sanitizeRedirect(searchParams.redirect);

  if (!state || !redirectTarget) {
    return (
      <main className="min-h-screen bg-ink text-bone flex items-center justify-center p-10">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-display text-4xl tracking-tightest">Invalid sign-in link</h1>
          <p className="text-ink-300 text-sm">
            This page should be opened from the Veyra VS Code extension. Try running{' '}
            <span className="font-mono">Veyra: Sign in</span> again.
          </p>
        </div>
      </main>
    );
  }

  const token = cookies().get(VEYRA_TOKEN_COOKIE)?.value;
  if (!token) {
    const next = `/extension/connect?state=${encodeURIComponent(state)}&redirect=${encodeURIComponent(redirectTarget)}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const callbackUrl = `${redirectTarget}?state=${encodeURIComponent(state)}&token=${encodeURIComponent(token!)}`;

  return <ConnectRedirect callbackUrl={callbackUrl} />;
}
