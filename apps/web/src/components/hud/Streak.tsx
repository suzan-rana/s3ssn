import { CountUp } from '@/components/motion/CountUp';
import { TiltCard } from '@/components/motion/TiltCard';

export function Streak({ days }: { days: number }) {
  const tone = days >= 7 ? 'magenta' : 'acid';
  return (
    <TiltCard>
      <div className={`hud-panel p-5 lg:p-6 ${tone === 'magenta' ? '!border-magenta/40' : ''}`}>
        <div className="flex items-baseline justify-between mb-1">
          <span className={`hud-chip ${tone === 'magenta' ? 'magenta' : ''}`}>STREAK</span>
          <span className="font-pixel text-[9px] text-ink-300 uppercase tracking-[0.18em]">
            {days >= 30 ? 'on fire' : days >= 7 ? 'hot' : days > 0 ? 'warming up' : 'cold'}
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <Flame tone={tone} />
          <div
            className={`font-display font-extrabold text-[88px] leading-[0.85] tracking-tightest tnum ${
              tone === 'magenta' ? 'glow-magenta' : 'glow-acid'
            }`}
          >
            <CountUp value={days} format="lv2" />
          </div>
        </div>
        <div className="mt-3 font-mono text-[10px] tnum text-ink-300 uppercase tracking-[0.18em]">
          Day{days === 1 ? '' : 's'} in a row · keep going
        </div>
      </div>
    </TiltCard>
  );
}

function Flame({ tone }: { tone: 'acid' | 'magenta' }) {
  const color = tone === 'magenta' ? '#ff2e88' : '#c4ff3d';
  return (
    <svg
      width="40"
      height="56"
      viewBox="0 0 32 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 10px ${color}aa)` }}
      className="animate-pulse-soft"
    >
      <path
        d="M16 2 C18 8 24 10 24 18 C24 22 22 25 20 26 C22 22 20 18 18 18 C19 22 16 24 14 22 C12 20 13 16 16 14 C14 18 9 19 8 25 C7 31 11 38 16 40 C21 38 25 33 25 27 C25 18 18 14 16 2 Z"
        fill={color}
        stroke="#070708"
        strokeWidth="0.5"
      />
    </svg>
  );
}
