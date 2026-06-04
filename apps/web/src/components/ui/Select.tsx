'use client';

import { useEffect, useRef, useState } from 'react';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  prefix,
  ariaLabel,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  prefix?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 font-mono text-[12px] px-3 py-2 border hairline hover:bg-ink-500/10 transition focus:outline-none focus:border-acid"
      >
        {prefix && (
          <span className="text-ink-300 uppercase tracking-[0.18em] text-[10px]">{prefix}</span>
        )}
        <span className="text-bone">{current?.label ?? value}</span>
        <span className={`text-ink-300 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-full whitespace-nowrap py-1 flex flex-col"
          style={{
            animation: 'selectpop 160ms cubic-bezier(0.16, 1, 0.3, 1) both',
            background: '#fdf8eb',
            border: '1px solid rgb(60 42 18 / 0.18)',
            boxShadow:
              '0 16px 40px -16px rgb(60 42 18 / 0.35), 0 4px 12px -6px rgb(60 42 18 / 0.18)',
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left font-mono text-[12px] px-3 py-1.5 flex items-center gap-2 transition ${
                    active ? 'bg-acid/15 text-acid' : 'hover:bg-ink-500/15'
                  }`}
                >
                  <span className={`w-3 ${active ? 'text-acid' : 'opacity-0'}`}>✓</span>
                  <span>{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <style jsx>{`
        @keyframes selectpop {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
