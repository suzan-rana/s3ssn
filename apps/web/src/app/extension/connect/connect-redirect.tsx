'use client';

import { useEffect, useState } from 'react';

export function ConnectRedirect({ callbackUrl }: { callbackUrl: string }) {
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = callbackUrl;
      setLaunched(true);
    }, 150);
    return () => clearTimeout(t);
  }, [callbackUrl]);

  return (
    <main className="min-h-screen bg-ink text-bone flex items-center justify-center p-10">
      <div className="max-w-md text-center space-y-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
          Connecting VS Code
        </div>
        <h1 className="font-display text-5xl tracking-tightest leading-none">
          One moment<span className="text-acid">.</span>
        </h1>
        <p className="text-ink-300 text-sm">
          {launched
            ? 'Returning you to the editor. If nothing happens, your browser may have blocked the redirect.'
            : 'Linking your account to the Veyra extension…'}
        </p>
        <a
          href={callbackUrl}
          className="inline-block bg-acid text-ink px-6 py-3 text-[12px] uppercase tracking-[0.18em] hover:bg-bone transition-colors"
        >
          Open in editor →
        </a>
        <p className="text-ink-400 text-xs">
          You can close this tab once the editor opens.
        </p>
      </div>
    </main>
  );
}
