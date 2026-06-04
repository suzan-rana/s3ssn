import { SegBar } from './SegBar';
import { HoverSpotlight } from '@/components/motion/HoverSpotlight';

export interface Quest {
  id: string;
  title: string;
  reward: string;
  current: number;
  target: number;
  unit: string;
  tone?: 'acid' | 'magenta';
}

export function QuestCard({ quest }: { quest: Quest }) {
  const progress = Math.min(1, quest.current / quest.target);
  const done = progress >= 1;
  return (
    <HoverSpotlight>
      <div className="hud-panel p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`hud-chip ${quest.tone === 'magenta' ? 'magenta' : ''}`}>
            {done ? 'COMPLETE' : 'QUEST'}
          </span>
          <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-ink-300">
            +{quest.reward} XP
          </span>
        </div>
        <div className="font-display font-semibold text-[20px] leading-tight mb-3">
          {quest.title}
        </div>
        <SegBar progress={progress} segments={20} tone={quest.tone ?? 'acid'} />
        <div className="mt-2 font-mono text-[11px] tnum text-ink-300 flex justify-between">
          <span>
            {quest.current.toFixed(0)} / {quest.target} {quest.unit}
          </span>
          <span className={done ? (quest.tone === 'magenta' ? 'glow-magenta' : 'glow-acid') : ''}>
            {(progress * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </HoverSpotlight>
  );
}
