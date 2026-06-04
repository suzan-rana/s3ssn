'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fromISO(s: string) {
  return new Date(s + 'T00:00:00');
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function addMonths(d: Date, n: number) {
  const c = new Date(d);
  c.setMonth(c.getMonth() + n);
  return c;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

const PRESETS: Array<{ key: string; label: string; date: () => string }> = [
  { key: 'today', label: 'Today', date: () => toISO(new Date()) },
  { key: 'yest', label: 'Yesterday', date: () => toISO(addDays(new Date(), -1)) },
  { key: 'd2', label: '2 days ago', date: () => toISO(addDays(new Date(), -2)) },
  { key: 'd3', label: '3 days ago', date: () => toISO(addDays(new Date(), -3)) },
  { key: 'd7', label: '1 week ago', date: () => toISO(addDays(new Date(), -7)) },
];

function humanDate(iso: string): string {
  const d = fromISO(iso);
  const today = toISO(new Date());
  const yest = toISO(addDays(new Date(), -1));
  if (iso === today) return 'Today';
  if (iso === yest) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function MonthGrid({
  month,
  selected,
  onPick,
  today,
}: {
  month: Date;
  selected: Date;
  onPick: (d: Date) => void;
  today: Date;
}) {
  const first = startOfMonth(month);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-[238px] shrink-0">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-center mb-2">
        {month.toLocaleDateString([], { month: 'long', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7 gap-px font-mono text-[10px] uppercase text-ink-300 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="w-8 h-6 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="w-8 h-8" />;
          const isSelected = sameDay(d, selected);
          const isToday = sameDay(d, today);
          const disabled = d > today;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={[
                'w-8 h-8 flex items-center justify-center text-[12px] tnum font-mono transition',
                disabled && 'opacity-30 cursor-not-allowed',
                !disabled && !isSelected && 'hover:bg-ink-500/15',
                isSelected && 'bg-acid text-ink font-bold',
                isToday && !isSelected && 'ring-1 ring-acid/40 ring-inset',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateNav({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(fromISO(current)));
  const rootRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);

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

  useEffect(() => {
    if (open) setViewMonth(startOfMonth(fromISO(current)));
  }, [open, current]);

  const go = (d: string) => {
    const params = d === todayISO ? '' : `?date=${d}`;
    router.push(`${pathname}${params}`);
    setOpen(false);
  };

  const shift = (days: number) => {
    const d = addDays(fromISO(current), days);
    if (d > today) return;
    go(toISO(d));
  };

  const activePreset = PRESETS.find((p) => p.date() === current);

  return (
    <div ref={rootRef} className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="font-mono text-[12px] px-2 py-1.5 border hairline hover:bg-ink-500/15"
          aria-label="Previous day"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 border hairline font-mono text-[12px] hover:bg-ink-500/10 transition"
        >
          <span className="text-acid">▸</span>
          <span className="tnum">{humanDate(current)}</span>
          <span className={`transition-transform text-ink-300 ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={current >= todayISO}
          className="font-mono text-[12px] px-2 py-1.5 border hairline hover:bg-ink-500/15 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          →
        </button>
      </div>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 flex flex-col sm:flex-row w-[460px] max-w-[calc(100vw-32px)]"
          style={{
            animation: 'datenavpop 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
            background: '#fdf8eb',
            border: '1px solid rgb(60 42 18 / 0.18)',
            boxShadow:
              '0 24px 60px -20px rgb(60 42 18 / 0.35), 0 8px 24px -12px rgb(60 42 18 / 0.2)',
          }}
        >
          <div
            className="p-2 min-w-[160px] flex flex-col gap-px"
            style={{
              background: 'rgb(60 42 18 / 0.05)',
              borderRight: '1px solid rgb(60 42 18 / 0.12)',
            }}
          >
            {PRESETS.map((p) => {
              const active = activePreset?.key === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => go(p.date())}
                  className={`text-left font-mono text-[12px] px-3 py-2 transition ${
                    active ? 'bg-acid text-ink' : 'hover:bg-ink-500/15'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                className="font-mono text-[12px] px-2 py-1 border hairline hover:bg-ink-500/15"
              >
                ←
              </button>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                Pick a day
              </div>
              <button
                type="button"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                disabled={addMonths(viewMonth, 1) > today}
                className="font-mono text-[12px] px-2 py-1 border hairline hover:bg-ink-500/15 disabled:opacity-30"
              >
                →
              </button>
            </div>
            <MonthGrid
              month={viewMonth}
              selected={fromISO(current)}
              onPick={(d) => go(toISO(d))}
              today={today}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes datenavpop {
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
