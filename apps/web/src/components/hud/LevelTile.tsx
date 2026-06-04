import { levelFromSeconds } from '@/lib/level';
import { SegBar } from './SegBar';
import { formatDuration } from '@/lib/format';
import { CountUp } from '@/components/motion/CountUp';
import { TiltCard } from '@/components/motion/TiltCard';
import { GlitchText } from '@/components/motion/GlitchText';

export function LevelTile({ totalSeconds }: { totalSeconds: number }) {
  const { level, rank, currentXp, nextThresholdXp, progress } = levelFromSeconds(totalSeconds);
  const lvStr = String(level).padStart(2, '0');
  return (
    <TiltCard>
      <div className="hud-panel scan-sweep p-5 lg:p-6">
        <div className="flex items-baseline justify-between mb-1">
          <span className="hud-chip">PLAYER · LV</span>
          <span className="font-pixel text-[9px] text-ink-300 uppercase tracking-[0.18em]">
            {rank}
          </span>
        </div>
        <GlitchText
          text={lvStr}
          className="font-display font-extrabold text-[88px] leading-[0.85] tracking-tightest glow-acid tnum block mt-2"
        />
        <div className="mt-3 mb-2 font-mono text-[10px] tnum text-ink-300 flex items-center justify-between">
          <span>
            <CountUp value={currentXp} format="duration" /> XP
          </span>
          <span>{formatDuration(nextThresholdXp)} to LV{level + 1}</span>
        </div>
        <SegBar progress={progress} segments={20} />
      </div>
    </TiltCard>
  );
}
