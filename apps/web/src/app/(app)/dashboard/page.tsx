import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Stat } from '@/components/Stat';
import { LevelTile } from '@/components/hud/LevelTile';
import { Streak } from '@/components/hud/Streak';
import { Combo } from '@/components/hud/Combo';
import { QuestCard, type Quest } from '@/components/hud/QuestCard';
import { AchievementGrid, type Achievement } from '@/components/hud/AchievementGrid';
import { HudPanel } from '@/components/hud/HudPanel';
import { formatDuration, formatClock } from '@/lib/format';
import { apiGet } from '@/lib/api';
import { comboFromSessions } from '@/lib/level';
import { BootSplash } from '@/components/motion/BootSplash';
import { XpToast } from '@/components/motion/XpToast';
import { CountUp } from '@/components/motion/CountUp';
import { HoverSpotlight } from '@/components/motion/HoverSpotlight';

interface Session {
  id: string;
  startedAt: string;
  endedAt: string;
  activeSeconds: number;
  branchName: string | null;
  primaryLanguage: string | null;
  repository: { id: string; name: string } | null;
}

interface TodayReport {
  date: string;
  totalActiveSeconds: number;
  sessions: Session[];
  repositories: Array<{ id: string; name: string; seconds: number }>;
  branches: Array<{ name: string; seconds: number }>;
  languages: Array<{ id: string; seconds: number }>;
  commits: Array<{ sha: string; message: string; committedAt: string }>;
}

interface Standup { summary: string; source: 'rule' | 'llm' }

export default async function Dashboard() {
  const [report, standup] = await Promise.all([
    apiGet<TodayReport>('/reports/today'),
    apiGet<Standup>('/summaries/standup'),
  ]);

  const totalSeconds = report?.totalActiveSeconds ?? 0;
  const sessions = report?.sessions ?? [];
  const repos = report?.repositories ?? [];
  const commits = report?.commits ?? [];
  const combo = comboFromSessions([...sessions].reverse());
  // Naive streak placeholder until we wire daily aggregates
  const streakDays = totalSeconds > 0 ? 1 : 0;

  const quests: Quest[] = [
    {
      id: 'daily-focus',
      title: 'Log 2 hours of focused work today',
      reward: '300',
      current: Math.min(totalSeconds / 3600, 2),
      target: 2,
      unit: 'h',
    },
    {
      id: 'daily-commit',
      title: 'Land 3 commits',
      reward: '200',
      current: commits.length,
      target: 3,
      unit: 'commits',
      tone: 'magenta',
    },
    {
      id: 'daily-repo',
      title: 'Touch 2 repositories',
      reward: '150',
      current: repos.length,
      target: 2,
      unit: 'repos',
    },
  ];

  const achievements: Achievement[] = [
    { id: 'firstevent', glyph: '◆', name: 'First event', hint: 'Capture one activity event', unlocked: totalSeconds > 0 },
    { id: 'firstsession', glyph: '✦', name: 'First session', hint: '15 min focused', unlocked: sessions.some((s) => s.activeSeconds >= 15 * 60) },
    { id: 'firstcommit', glyph: '✶', name: 'First commit', hint: 'One commit landed', unlocked: commits.length >= 1 },
    { id: 'combo3', glyph: '⌬', name: 'Combo ×3', hint: '3 back-to-back sessions', unlocked: combo >= 3 },
    { id: 'twohour', glyph: '◉', name: 'Deep work', hint: '2 hours focused in a day', unlocked: totalSeconds >= 2 * 3600 },
    { id: 'polyglot', glyph: '✺', name: 'Polyglot', hint: '3+ languages in a day', unlocked: (report?.languages?.length ?? 0) >= 3 },
  ];

  return (
    <>
      <BootSplash line="// initializing veyra · loading save" />
      {totalSeconds > 0 && (
        <XpToast amount={Math.round(totalSeconds)} label="welcome back · today's XP" />
      )}
      <PageHeader
        section="MISSION · TODAY"
        title={
          <>
            Day <span className="glow-acid">{new Date().toISOString().slice(8, 10)}</span> · run in progress.
          </>
        }
        caption="Live HUD of your engineering activity. XP earned per focused minute. Quests refresh daily."
        right={
          <div className="hidden md:flex items-center gap-3">
            <span className="hud-chip"><span className="w-1.5 h-1.5 bg-acid animate-pulse-soft" />ONLINE</span>
            <span className="hud-chip muted">{repos.length} REPOS</span>
          </div>
        }
      />

      <section className="grid grid-cols-12 gap-4 p-4 lg:p-6 border-b hairline">
        <div className="col-span-12 md:col-span-4">
          <LevelTile totalSeconds={totalSeconds} />
        </div>
        <div className="col-span-12 md:col-span-4">
          <Streak days={streakDays} />
        </div>
        <div className="col-span-12 md:col-span-4 space-y-3">
          <Combo count={combo} />
          <HoverSpotlight>
            <div className="hud-panel p-5">
              <span className="hud-chip cyan mb-3">FOCUSED TODAY</span>
              <div className="mt-3 font-display font-extrabold text-[64px] leading-[0.85] tracking-tightest tnum glow-cyan">
                <CountUp value={totalSeconds} format="duration" />
              </div>
              <div className="mt-3 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
                {sessions.length} sessions · {repos.length} repos ·{' '}
                {report?.languages?.length ?? 0} languages
              </div>
            </div>
          </HoverSpotlight>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4 p-4 lg:p-6 border-b hairline">
        {quests.map((q, i) => (
          <div
            key={q.id}
            className="col-span-12 md:col-span-4 stagger-in"
            style={{ ['--i' as string]: i + 1 } as React.CSSProperties}
          >
            <QuestCard quest={q} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 border-b hairline">
        <Stat label="FOCUSED" value={formatDuration(totalSeconds)} tone="acid" caption="Today" />
        <Stat label="COMMITS" value={commits.length} tone="magenta" caption={`${repos.length} repos`} />
        <Stat label="SESSIONS" value={sessions.length} caption={`${report?.branches?.length ?? 0} branches`} />
        <Stat label="LANGS" value={report?.languages?.length ?? 0} tone="cyan" caption={report?.languages?.[0]?.id ?? '—'} />
      </section>

      <section className="grid grid-cols-12 gap-4 p-4 lg:p-6 border-b hairline">
        <div className="col-span-12 lg:col-span-8">
          <HudPanel
            label="STANDUP · DRAFTED"
            glow
            right={
              <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-acid">
                {standup?.source === 'llm' ? 'AI-WRITTEN' : 'RULE-BASED'}
              </span>
            }
          >
            <blockquote className="font-display font-medium text-[26px] lg:text-[30px] leading-[1.3] tracking-tightest">
              {standup?.summary ?? 'Sign in and capture a few sessions, then your standup will land here.'}
            </blockquote>
          </HudPanel>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <HudPanel label="REPOS · TODAY">
            {repos.length === 0 ? (
              <div className="text-[13px] text-ink-300 hatch p-3">No activity captured yet.</div>
            ) : (
              <ul className="divide-y hairline">
                {repos.slice(0, 6).map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between">
                    <span className="font-mono text-[13px] truncate pr-3">{r.name}</span>
                    <span className="tnum text-[13px] text-acid">{formatDuration(r.seconds)}</span>
                  </li>
                ))}
              </ul>
            )}
          </HudPanel>
        </div>
      </section>

      <section className="p-4 lg:p-6 border-b hairline">
        <HudPanel label="ACHIEVEMENTS">
          <AchievementGrid items={achievements} />
        </HudPanel>
      </section>

      <section className="p-4 lg:p-6">
        <HudPanel
          label="RECENT RUNS"
          right={
            <Link
              href="/sessions"
              className="font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-200 hover:text-bone link-grow"
            >
              ALL SESSIONS →
            </Link>
          }
        >
          {sessions.length === 0 ? (
            <div className="hatch border hairline p-6 text-center">
              <div className="hud-chip mb-3">EMPTY</div>
              <p className="font-display text-[20px] tracking-tightest text-ink-200">
                Install the extension. Start coding. Sessions appear here.
              </p>
            </div>
          ) : (
            <div>
              {sessions.slice(0, 8).map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-4 py-3 border-b hairline items-center hover:bg-acid/5 transition-colors"
                >
                  <div className="col-span-2 font-mono text-[12px] tnum text-ink-300">
                    {formatClock(s.startedAt)}
                  </div>
                  <div className="col-span-4 font-mono text-[13px]">
                    {s.repository?.name ?? 'unknown'}
                  </div>
                  <div className="col-span-3 text-[13px] text-acid">{s.branchName ?? '—'}</div>
                  <div className="col-span-2 text-[12px] text-ink-300">{s.primaryLanguage ?? '—'}</div>
                  <div className="col-span-1 text-right tnum text-[13px] glow-magenta">
                    +{Math.round(s.activeSeconds)} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </HudPanel>
      </section>
    </>
  );
}
