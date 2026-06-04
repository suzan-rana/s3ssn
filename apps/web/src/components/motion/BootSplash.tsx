'use client';

import { useEffect, useState } from 'react';

/**
 * Boot splash. Shows once per browser session — the second visit doesn't replay
 * (handled via sessionStorage). `line` is typewriter-rendered via pure CSS.
 *
 * Total runtime: ~2.2 s. After that the splash fades + unmounts itself.
 */
export function BootSplash({ line = '// initializing veyra · loading save' }: { line?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const KEY = 'veyra:boot';
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, '1');
    setMounted(true);
    const t = setTimeout(() => setMounted(false), 2400);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;
  return (
    <div className="boot-splash">
      <div className="boot-line">{line}</div>
    </div>
  );
}
