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

const PRESETS: Array<{ key: string; label: string; range: () => [string, string] }> = [
  { key: 'today', label: 'Today', range: () => [toISO(new Date()), toISO(new Date())] },
  { key: 'yest', label: 'Yesterday', range: () => [toISO(addDays(new Date(), -1)), toISO(addDays(new Date(), -1))] },
  { key: '7', label: 'Last 7 days', range: () => [toISO(addDays(new Date(), -6)), toISO(new Date())] },
  { key: '14', label: 'Last 14 days', range: () => [toISO(addDays(new Date(), -13)), toISO(new Date())] },
  { key: '30', label: 'Last 30 days', range: () => [toISO(addDays(new Date(), -29)), toISO(new Date())] },
  { key: 'mtd', label: 'Month to date', range: () => [toISO(startOfMonth(new Date())), toISO(new Date())] },
];

function humanRange(from: string, to: string): string {
  const a = fromISO(from);
  const b = fromISO(to);
  const today = toISO(new Date());
  const yest = toISO(addDays(new Date(), -1));
  if (from === today && to === today) return 'Today';
  if (from === yest && to === yest) return 'Yesterday';
  if (from === to)
    return a.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const sameYear = a.getFullYear() === b.getFullYear();
  const fmtA = a.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const fmtB = b.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmtA} – ${fmtB}`;
}

function MonthGrid({
  month,
  from,
  to,
  hover,
  setHover,
  onPick,
  today,
}: {
  month: Date;
  from: Date | null;
  to: Date | null;
  hover: Date | null;
  setHover: (d: Date | null) => void;
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

  const inRange = (d: Date) => {
    if (!from) return false;
    const end = to ?? hover ?? from;
    const lo = from < end ? from : end;
    const hi = from < end ? end : from;
    return d >= lo && d <= hi;
  };

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
          const isStart = from && sameDay(d, from);
          const isEnd = to && sameDay(d, to);
          const isInRange = inRange(d);
          const isToday = sameDay(d, today);
          const disabled = d > today;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onPick(d)}
              className={[
                'w-8 h-8 flex items-center justify-center text-[12px] tnum font-mono transition',
                disabled && 'opacity-30 cursor-not-allowed',
                !disabled && 'hover:bg-ink-500/15',
                isInRange && !isStart && !isEnd && 'bg-acid/15',
                (isStart || isEnd) && 'bg-acid text-ink font-bold',
                isToday && !isStart && !isEnd && 'ring-1 ring-acid/40 ring-inset',
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

export function DateRangeNav({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingFrom, setPendingFrom] = useState<Date | null>(fromISO(from));
  const [pendingTo, setPendingTo] = useState<Date | null>(fromISO(to));
  const [hover, setHover] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(fromISO(to)));
  const rootRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Reset pending when reopening
  useEffect(() => {
    if (open) {
      setPendingFrom(fromISO(from));
      setPendingTo(fromISO(to));
      setViewMonth(startOfMonth(fromISO(to)));
    }
  }, [open, from, to]);

  const apply = (nf: string, nt: string) => {
    router.push(`${pathname}?from=${nf}&to=${nt}`);
    setOpen(false);
  };

  const pick = (d: Date) => {
    if (!pendingFrom || (pendingFrom && pendingTo)) {
      setPendingFrom(d);
      setPendingTo(null);
      return;
    }
    if (d < pendingFrom) {
      setPendingTo(pendingFrom);
      setPendingFrom(d);
    } else {
      setPendingTo(d);
    }
  };

  const activePreset = PRESETS.find((p) => {
    const [pf, pt] = p.range();
    return pf === from && pt === to;
  });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 border hairline font-mono text-[12px] hover:bg-ink-500/10 transition"
      >
        <span className="text-acid">▸</span>
        <span className="tnum">{humanRange(from, to)}</span>
        <span className={`transition-transform text-ink-300 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 flex flex-col sm:flex-row w-[720px] max-w-[calc(100vw-32px)]"
          style={{
            animation: 'rangepop 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
            background: '#fdf8eb',
            border: '1px solid rgb(60 42 18 / 0.18)',
            boxShadow: '0 24px 60px -20px rgb(60 42 18 / 0.35), 0 8px 24px -12px rgb(60 42 18 / 0.2)',
          }}
        >
          {/* Preset rail */}
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
                  onClick={() => {
                    const [pf, pt] = p.range();
                    apply(pf, pt);
                  }}
                  className={`text-left font-mono text-[12px] px-3 py-2 transition ${
                    active ? 'bg-acid text-ink' : 'hover:bg-ink-500/15'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Calendars */}
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
                Pick a range
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
            <div className="flex gap-6">
              <MonthGrid
                month={addMonths(viewMonth, -1)}
                from={pendingFrom}
                to={pendingTo}
                hover={hover}
                setHover={setHover}
                onPick={pick}
                today={today}
              />
              <MonthGrid
                month={viewMonth}
                from={pendingFrom}
                to={pendingTo}
                hover={hover}
                setHover={setHover}
                onPick={pick}
                today={today}
              />
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t hairline">
              <div className="font-mono text-[11px] text-ink-300 tnum">
                {pendingFrom ? toISO(pendingFrom) : '—'}{' '}
                <span className="opacity-60">→</span>{' '}
                {pendingTo ? toISO(pendingTo) : '—'}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-mono text-[11px] px-3 py-1.5 border hairline hover:bg-ink-500/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!pendingFrom || !pendingTo}
                  onClick={() => pendingFrom && pendingTo && apply(toISO(pendingFrom), toISO(pendingTo))}
                  className="font-mono text-[11px] px-3 py-1.5 bg-acid text-ink disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes rangepop {
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
