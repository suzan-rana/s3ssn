import { CountUp } from '@/components/motion/CountUp';

export function Combo({ count }: { count: number }) {
  if (count <= 1) return null;
  return (
    <div className="hud-panel p-4 flex items-center justify-between scan-sweep">
      <span className="hud-chip magenta">COMBO</span>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-extrabold text-[40px] leading-none glow-magenta tnum">
          ×<CountUp value={count} format="int" />
        </span>
        <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-ink-300">
          back-to-back
        </span>
      </div>
    </div>
  );
}
