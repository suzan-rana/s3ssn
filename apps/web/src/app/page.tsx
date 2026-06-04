import Link from 'next/link';
import { cn } from '@/lib/cn';
import { SegBar } from '@/components/hud/SegBar';
import { Particles } from '@/components/motion/Particles';
import { CountUp } from '@/components/motion/CountUp';
import { GlitchText } from '@/components/motion/GlitchText';
import { HoverSpotlight } from '@/components/motion/HoverSpotlight';
import { TiltCard } from '@/components/motion/TiltCard';
import { PressButton } from '@/components/motion/PressButton';

const TICKER = [
  '13h 40m FOCUSED TODAY',
  'SHIPPED · 7 COMMITS',
  '×3 SESSION COMBO',
  'STREAK · 12 DAYS',
  'LV 04 · ARCHITECT',
  '+820 XP THIS WEEK',
  'PR #142 · 6h 12m',
  'feat/scheduler',
  '13h 40m FOCUSED TODAY',
  'SHIPPED · 7 COMMITS',
  '×3 SESSION COMBO',
  'STREAK · 12 DAYS',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-bone scanlines">
      <TopBar />
      <Hero />
      <Ticker />
      <WhatYouGet />
      <LeaderboardPreview />
      <HowItWorks />
      <BeforeAfter />
      <PrivacyPromise />
      <SocialProof />
      <BigQuote />
      <BigCTA />
      <Faq />
      <Footer />
    </main>
  );
}

/* ─────────────────────────────────────────── TOP */

function TopBar() {
  return (
    <div className="border-b hairline bg-ink-800/80 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-7 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-acid">●</span>
          <span>UNIVERSAL · 2,847 ENGINEERS PLAYING</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/leaderboard" className="hover:text-acid">
            ◆ LEADERBOARD
          </Link>
          <Link href="/signup" className="hover:text-acid">
            ▶ PRESS START
          </Link>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-extrabold text-[22px] tracking-tightest leading-none flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-acid inline-block shadow-glow-acid crt-flicker" />
          S3SSN
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-200">
          <Link className="link-grow" href="#what">What you get</Link>
          <Link className="link-grow" href="#how">How it works</Link>
          <Link className="link-grow" href="/leaderboard">Leaderboard</Link>
          <Link className="link-grow" href="#privacy">Privacy</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline-block font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-200 hover:text-bone link-grow"
          >
            Resume save
          </Link>
          <Link
            href="/signup"
            className="font-pixel text-[10px] uppercase tracking-[0.24em] bg-acid text-ink px-4 py-2 hover:bg-bone transition-colors shadow-glow-acid"
          >
            ▶ Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────── HERO */

function Hero() {
  return (
    <>
      <Nav />
      <section className="relative border-b hairline overflow-hidden">
        <Particles count={36} tone="mixed" />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-16 lg:pt-24 pb-20 lg:pb-28 grid grid-cols-12 gap-8 relative">
          <div className="col-span-12 lg:col-span-7 animate-fade-up">
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="hud-chip">
                <span className="w-1.5 h-1.5 bg-acid inline-block animate-pulse-soft" />
                NOW PLAYING
              </span>
              <span className="hud-chip magenta">PRIVATE · YOURS</span>
            </div>
            <h1 className="font-display font-extrabold text-[clamp(52px,9vw,140px)] leading-[0.88] tracking-tightest">
              Make coding
              <br />
              feel like a{' '}
              <GlitchText
                text="game"
                className="glow-acid"
              />
              <span className="text-bone">.</span>
              <br />
              <span className="text-ink-200">Without the</span>{' '}
              <span className="italic glow-magenta">grind</span>
              <span className="text-bone">.</span>
            </h1>
            <p className="mt-10 max-w-[600px] text-[18px] leading-[1.6] text-ink-200">
              S3ssn turns your real coding hours into XP, levels, and streaks. See exactly what you
              shipped today. Compete with engineers everywhere on the universal leaderboard. Your
              daily standup writes itself.
            </p>
            <p className="mt-4 max-w-[600px] text-[14px] text-ink-300">
              No timers. No screenshots. No surveillance. Just the focused minutes you actually
              earned.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <PressButton
                href="/signup"
                pulse
                className="group gap-3 bg-acid text-ink px-6 py-4 font-pixel text-[11px] uppercase tracking-[0.24em] hover:bg-bone transition-colors shadow-glow-acid"
              >
                ▶ Press start
                <span className="font-mono transition-transform group-hover:translate-x-1 ml-2">→</span>
              </PressButton>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-3 hud-panel px-5 py-3 font-pixel text-[11px] uppercase tracking-[0.24em] text-ink-200 hover:text-magenta transition-colors"
              >
                ◆ See the leaderboard
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
              <span className="flex items-center gap-2">
                <span className="text-acid">★</span> Works in VS Code
              </span>
              <span className="flex items-center gap-2">
                <span className="text-acid">★</span> Private by default
              </span>
              <span className="hidden sm:flex items-center gap-2">
                <span className="text-acid">★</span> Your data stays yours
              </span>
            </div>
          </div>
          <aside className="col-span-12 lg:col-span-5 animate-fade-up space-y-3">
            <TiltCard>
              <PlayerPreview />
            </TiltCard>
            <HoverSpotlight>
              <DailyQuestPreview />
            </HoverSpotlight>
          </aside>
        </div>
      </section>
    </>
  );
}

function PlayerPreview() {
  return (
    <div className="hud-panel scan-sweep p-5 lg:p-6">
      <div className="flex items-baseline justify-between mb-1">
        <span className="hud-chip">YOUR PLAYER CARD</span>
        <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-ink-300">
          ARCHITECT
        </span>
      </div>
      <div className="font-display font-extrabold text-[96px] leading-[0.82] tracking-tightest glow-acid tnum mt-2">
        LV 04
      </div>
      <div className="mt-3 mb-2 font-mono text-[11px] tnum text-ink-300 flex items-center justify-between">
        <span>13h 40m XP</span>
        <span>4h 20m to LV 05</span>
      </div>
      <SegBar progress={0.62} segments={22} />
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Mini label="STREAK" value="12" tone="magenta" />
        <Mini label="COMBO" value="×3" tone="cyan" />
        <Mini label="RANK" value="#142" tone="acid" />
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone: 'acid' | 'magenta' | 'cyan' }) {
  const glow = tone === 'magenta' ? 'glow-magenta' : tone === 'cyan' ? 'glow-cyan' : 'glow-acid';
  return (
    <div className="hud-panel p-2 lg:p-3">
      <div className={cn('font-display font-extrabold text-[22px] lg:text-[26px] leading-none tnum', glow)}>
        {value}
      </div>
      <div className="mt-2 font-pixel text-[8px] uppercase tracking-[0.18em] text-ink-300">
        {label}
      </div>
    </div>
  );
}

function DailyQuestPreview() {
  return (
    <div className="hud-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="hud-chip magenta">DAILY QUEST · +300 XP</span>
        <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-acid">85%</span>
      </div>
      <div className="font-display font-semibold text-[19px] leading-tight">
        Log 2 hours of focused work
      </div>
      <div className="mt-3">
        <SegBar progress={0.85} tone="magenta" segments={22} />
      </div>
      <div className="mt-2 font-mono text-[11px] tnum text-ink-300">1h 42m / 2h</div>
    </div>
  );
}

/* ─────────────────────────────────────────── TICKER */

function Ticker() {
  return (
    <div className="border-b hairline overflow-hidden bg-ink-800">
      <div className="flex whitespace-nowrap animate-marquee py-3">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span
            key={i}
            className={cn(
              'font-pixel text-[11px] uppercase tracking-[0.24em] px-6 flex items-center gap-3',
              i % 2 === 0 ? 'text-acid' : 'text-magenta',
            )}
          >
            <span className="opacity-40">◆</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── WHAT YOU GET */

function WhatYouGet() {
  const cards: Array<{
    chip: string;
    title: string;
    copy: string;
    bigStat: string;
    statLabel: string;
    tone: 'acid' | 'magenta' | 'cyan';
  }> = [
    {
      chip: 'CARD 01',
      title: 'Finally know where your day went.',
      copy: 'Open S3ssn in the morning and see exactly what you shipped yesterday — every commit, every PR, every focused minute, mapped to the repo and branch it belongs to.',
      bigStat: '13h 40m',
      statLabel: 'focused yesterday',
      tone: 'acid',
    },
    {
      chip: 'CARD 02',
      title: 'Level up by doing your job.',
      copy: 'Every focused minute is XP. Hit milestones, unlock ranks, build streaks. Coding stops feeling invisible and starts feeling earned.',
      bigStat: 'LV 04',
      statLabel: 'ARCHITECT · 62% to LV 05',
      tone: 'magenta',
    },
    {
      chip: 'CARD 03',
      title: 'Compete with engineers everywhere.',
      copy: 'The universal leaderboard ranks every player by real focused engineering time. No bots, no inflation — sessionized from actual editor activity.',
      bigStat: '#142',
      statLabel: 'your rank this week',
      tone: 'cyan',
    },
    {
      chip: 'CARD 04',
      title: 'Your standup writes itself.',
      copy: 'One paragraph, ready to copy into Slack. "Worked on the invoice reminder scheduler. Landed 4 commits across two branches." Numbers come from your sessions, not your memory.',
      bigStat: '1-click',
      statLabel: 'copy to clipboard',
      tone: 'acid',
    },
  ];

  return (
    <section id="what" className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
        <div className="mb-12 max-w-[760px]">
          <span className="hud-chip mb-4">WHAT YOU GET</span>
          <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[1.0] tracking-tightest mt-4">
            Four things you&apos;ll actually use.
          </h2>
          <p className="mt-6 text-[16px] text-ink-200 leading-[1.6]">
            Not feature lists. Not roadmaps. The four moments S3ssn changes about your week.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <HoverSpotlight key={c.chip}>
              <article
                className="hud-panel p-7 lg:p-8 hover:-translate-y-0.5 transition-transform stagger-in"
                style={{ ['--i' as string]: i } as React.CSSProperties}
              >
              <span
                className={cn(
                  'hud-chip mb-5',
                  c.tone === 'magenta' && 'magenta',
                  c.tone === 'cyan' && 'cyan',
                )}
              >
                {c.chip}
              </span>
              <h3 className="font-display font-extrabold text-[28px] lg:text-[34px] leading-[1.05] tracking-tightest mt-4">
                {c.title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-ink-200">{c.copy}</p>
              <div className="mt-8 pt-6 border-t hairline flex items-baseline gap-4">
                <span
                  className={cn(
                    'font-display font-extrabold text-[44px] lg:text-[52px] leading-none tracking-tightest tnum',
                    c.tone === 'magenta' && 'glow-magenta',
                    c.tone === 'cyan' && 'glow-cyan',
                    c.tone === 'acid' && 'glow-acid',
                  )}
                >
                  {c.bigStat}
                </span>
                <span className="font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
                  {c.statLabel}
                </span>
              </div>
            </article>
            </HoverSpotlight>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── LEADERBOARD PREVIEW */

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'mira.kondo', xp: '38h 12m', level: 7, label: 'GRANDMASTER' },
  { rank: 2, name: 'devon.aoki', xp: '34h 04m', level: 6, label: 'KEEPER' },
  { rank: 3, name: 'sasha.lin', xp: '29h 47m', level: 6, label: 'KEEPER' },
  { rank: 4, name: 'you', xp: '13h 40m', level: 4, label: 'ARCHITECT' },
];

function LeaderboardPreview() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <span className="hud-chip magenta mb-4">UNIVERSAL LEADERBOARD</span>
          <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest mt-4">
            Real engineers.
            <br />
            <span className="glow-magenta">Real hours.</span>
            <br />
            <span className="text-ink-200">No bots.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] text-ink-200 max-w-[460px]">
            Every player on the leaderboard earned their spot through{' '}
            <span className="text-acid">sessionized active time</span> — minutes the extension
            actually saw an editor in focus. You can&apos;t farm it. You can&apos;t fake it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-3 bg-magenta text-ink px-5 py-3 font-pixel text-[11px] uppercase tracking-[0.24em] hover:bg-bone transition-colors shadow-glow-magenta"
            >
              ◆ View full leaderboard
            </Link>
            <Link
              href="/signup"
              className="font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300 hover:text-bone link-grow"
            >
              ▶ Join the board
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t hairline grid grid-cols-3 gap-4">
            <Stat n="2,847" l="ENGINEERS" />
            <Stat n="184k" l="HOURS LOGGED" />
            <Stat n="92k" l="COMMITS LINKED" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <div className="hud-panel scan-sweep overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2 border-b hairline bg-ink-800/80">
              <span className="hud-chip">THIS WEEK · TOP 4</span>
              <span className="font-pixel text-[9px] uppercase tracking-[0.24em] text-acid">
                LIVE
              </span>
            </header>
            <div>
              {LEADERBOARD_PREVIEW.map((r, idx) => {
                const isYou = r.name === 'you';
                const medal =
                  r.rank === 1 ? '◆' : r.rank === 2 ? '◇' : r.rank === 3 ? '◈' : '·';
                const medalColor =
                  r.rank === 1 ? 'text-acid' : r.rank === 2 ? 'text-cyan' : r.rank === 3 ? 'text-magenta' : 'text-ink-300';
                return (
                  <div
                    key={r.name}
                    className={cn(
                      'grid grid-cols-12 gap-4 px-4 py-4 items-center transition-colors',
                      idx < LEADERBOARD_PREVIEW.length - 1 && 'border-b hairline',
                      isYou && 'bg-acid/8',
                    )}
                  >
                    <div className="col-span-1 font-mono text-[14px] tnum text-ink-300">
                      {String(r.rank).padStart(2, '0')}
                    </div>
                    <div className={cn('col-span-1 font-display text-[28px] leading-none', medalColor)}>
                      {medal}
                    </div>
                    <div
                      className={cn(
                        'col-span-5 font-display font-medium text-[18px] truncate',
                        isYou && 'text-acid',
                      )}
                    >
                      {r.name}
                      {isYou && (
                        <span className="ml-2 font-pixel text-[9px] uppercase tracking-[0.24em] text-acid">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-baseline gap-2">
                      <span className="font-display font-extrabold text-[20px] glow-acid tnum">
                        {String(r.level).padStart(2, '0')}
                      </span>
                      <span className="font-pixel text-[8px] uppercase tracking-[0.18em] text-ink-300">
                        {r.label}
                      </span>
                    </div>
                    <div className="col-span-3 text-right font-mono text-[13px] tnum text-acid">
                      {r.xp}
                    </div>
                  </div>
                );
              })}
            </div>
            <footer className="px-4 py-3 border-t hairline flex items-center justify-between bg-ink-800/80">
              <span className="font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
                + 2,843 more on the board
              </span>
              <Link
                href="/leaderboard"
                className="font-pixel text-[9px] uppercase tracking-[0.24em] text-acid hover:text-bone"
              >
                FULL BOARD →
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display font-extrabold text-[28px] lg:text-[34px] leading-none tracking-tightest glow-acid tnum">
        {n}
      </div>
      <div className="mt-2 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
        {l}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── HOW IT WORKS */

function HowItWorks() {
  const steps: Array<{ n: string; title: string; copy: string }> = [
    {
      n: '01',
      title: 'Install the extension.',
      copy: 'Install the S3ssn extension from the VS Code marketplace and sign in with the token from your dashboard. That is the whole setup.',
    },
    {
      n: '02',
      title: 'Code like you already do.',
      copy: 'S3ssn runs quietly in the background. It sees your active branch, your language, your focus. It does not see your code, screen, or keystrokes.',
    },
    {
      n: '03',
      title: 'Open the HUD tomorrow.',
      copy: 'Your level, your streak, your standup, your spot on the leaderboard. All waiting. Already written. Ready to copy.',
    },
  ];

  return (
    <section id="how" className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
        <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="hud-chip mb-3">HOW IT WORKS</span>
            <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest mt-4">
              Three moves.
              <br />
              <span className="glow-acid">That is it.</span>
            </h2>
          </div>
          <span className="font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
            No timers. No timesheets.
          </span>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <li key={s.n} className="hud-panel p-7 lg:p-8 hover:-translate-y-0.5 transition-transform">
              <div className="font-display font-extrabold text-[80px] lg:text-[100px] leading-[0.82] tracking-tightest glow-acid tnum">
                {s.n}
              </div>
              <h3 className="mt-4 font-display font-bold text-[24px] tracking-tightest">
                {s.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-ink-200">{s.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── BEFORE / AFTER */

function BeforeAfter() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <span className="hud-chip mb-4">THE TRANSFORM</span>
          <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest mt-4">
            From a vague feeling
            <br />
            to a <span className="glow-acid">real number</span>.
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] text-ink-200">
            The end of every sprint, every freelance week, every standup — one sentence that
            actually means something.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="hud-panel p-7 lg:p-8 hatch">
            <span className="hud-chip muted mb-4">BEFORE</span>
            <blockquote className="font-display italic text-[26px] lg:text-[30px] leading-[1.25] text-ink-200 mt-4">
              “I think this took
              <br />
              around two days.”
            </blockquote>
          </div>
          <div className="hud-panel scan-sweep p-7 lg:p-8">
            <span className="hud-chip mb-4">AFTER</span>
            <blockquote className="font-display text-[22px] lg:text-[24px] leading-[1.35] text-bone mt-4">
              <span className="tnum glow-acid">13h 40m</span> focused engineering across{' '}
              <span className="tnum glow-magenta">7 commits</span>,{' '}
              <span className="tnum">2 PRs</span>, and{' '}
              <span className="tnum">3 sessions</span>.
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── PRIVACY */

function PrivacyPromise() {
  const sees = ['Repository name', 'Branch you\'re on', 'Language you\'re writing', 'Whether you\'re focused', 'How long you stayed'];
  const noSees = ['Your source code', 'Your keystrokes', 'Your screen', 'Your terminal', 'Your clipboard', 'Your browser', 'Your env vars'];

  return (
    <section id="privacy" className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <span className="hud-chip cyan mb-4">PRIVACY · PVE ONLY</span>
          <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest mt-4">
            We track <span className="glow-cyan">context</span>.
            <br />
            <span className="text-ink-200">Not the code.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] text-ink-200">
            S3ssn knows you spent 42 minutes on the <code className="text-acid font-mono">feat/scheduler</code>{' '}
            branch writing TypeScript. It does not, and will never, know what you wrote.
          </p>
          <p className="mt-4 text-[14px] text-ink-300">
            Pause it any time from your status bar. Exclude any repo. Delete your data with one
            click. We&apos;d rather lose you than your trust.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="hud-panel p-6">
            <span className="hud-chip cyan mb-4">WHAT WE SEE</span>
            <ul className="mt-4 space-y-3">
              {sees.map((x) => (
                <li key={x} className="flex items-start gap-3 text-[14px] text-bone">
                  <span className="text-cyan font-pixel text-[14px] leading-none mt-0.5">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="hud-panel p-6">
            <span className="hud-chip magenta mb-4">WHAT WE DON&apos;T</span>
            <ul className="mt-4 space-y-3">
              {noSees.map((x) => (
                <li key={x} className="flex items-start gap-3 text-[14px] text-bone">
                  <span className="text-magenta font-pixel text-[14px] leading-none mt-0.5">×</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── SOCIAL PROOF NUMBERS */

function SocialProof() {
  const numbers: Array<{
    value: number;
    fmt: 'comma' | 'k';
    l: string;
    tone: 'acid' | 'magenta' | 'cyan';
  }> = [
    { value: 2847, fmt: 'comma', l: 'engineers playing', tone: 'acid' },
    { value: 184, fmt: 'k', l: 'focused hours logged', tone: 'magenta' },
    { value: 92, fmt: 'k', l: 'commits attributed', tone: 'cyan' },
    { value: 12400, fmt: 'comma', l: 'standups auto-written', tone: 'acid' },
  ];

  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-500/30">
          {numbers.map((x, i) => (
            <HoverSpotlight key={x.l}>
              <div
                className="bg-ink px-6 py-10 lg:px-8 lg:py-14 scanlines stagger-in"
                style={{ ['--i' as string]: i } as React.CSSProperties}
              >
                <div
                  className={cn(
                    'font-display font-extrabold text-[44px] lg:text-[64px] leading-none tracking-tightest tnum',
                    x.tone === 'magenta' && 'glow-magenta',
                    x.tone === 'cyan' && 'glow-cyan',
                    x.tone === 'acid' && 'glow-acid',
                  )}
                >
                  <CountUp value={x.value} durationMs={1600} format={x.fmt} />
                </div>
                <div className="mt-4 font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
                  {x.l}
                </div>
              </div>
            </HoverSpotlight>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── BIG QUOTE */

function BigQuote() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10 py-28 text-center">
        <span className="hud-chip mb-6 inline-flex">PLAYERS · ALSO SAY</span>
        <blockquote className="font-display font-medium text-[28px] lg:text-[44px] leading-[1.25] tracking-tightest mt-6">
          “I opened S3ssn on Friday and saw I&apos;d spent{' '}
          <span className="glow-acid tnum">26 hours</span> in a single repo that week. I had{' '}
          <span className="italic">no idea</span>. That single number changed how I billed,
          how I rested, and how I argue for raises.”
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="w-10 h-10 hud-panel" />
          <div className="text-left">
            <div className="font-display font-semibold text-[16px]">Mira Kondo</div>
            <div className="font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
              Staff engineer · indie agency · LV 07
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── BIG CTA */

function BigCTA() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-28 grid grid-cols-12 gap-8 items-center">
        <div className="col-span-12 lg:col-span-7">
          <span className="hud-chip mb-4">READY · PLAYER ONE</span>
          <h2 className="font-display font-extrabold text-[56px] lg:text-[96px] leading-[0.9] tracking-tightest mt-4">
            Start <span className="glow-acid">earning</span> the
            <br />
            hours you already
            <br />
            <span className="italic glow-magenta">worked</span>
            <span className="text-bone">.</span>
          </h2>
          <p className="mt-6 max-w-[480px] text-[15px] leading-[1.6] text-ink-200">
            Create an account, install the extension, get back to coding. S3ssn does the rest in
            the background.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PressButton
              href="/signup"
              pulse
              className="gap-3 bg-acid text-ink px-7 py-5 font-pixel text-[12px] uppercase tracking-[0.24em] hover:bg-bone shadow-glow-acid"
            >
              ▶ Press start
            </PressButton>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 font-pixel text-[11px] uppercase tracking-[0.24em] text-ink-300 hover:text-bone link-grow"
            >
              ◆ See who&apos;s on top
            </Link>
          </div>
        </div>
        <aside className="col-span-12 lg:col-span-5">
          <div className="hud-panel scan-sweep p-6">
            <span className="hud-chip mb-4">GET STARTED</span>
            <div className="mt-4 space-y-3">
              <Link
                href="/signup"
                className="block bg-acid text-ink px-5 py-4 font-pixel text-[11px] uppercase tracking-[0.24em] text-center hover:bg-bone shadow-glow-acid transition-colors"
              >
                ▶ Create an account
              </Link>
              <div className="font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300 text-center">
                ─ then install ─
              </div>
              <Link
                href="https://marketplace.visualstudio.com"
                className="block hud-panel px-5 py-4 font-pixel text-[11px] uppercase tracking-[0.24em] text-center hover:text-acid"
              >
                ◆ VS Code marketplace
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── FAQ */

function Faq() {
  const FAQS = [
    {
      q: 'How do I get started?',
      a: 'Create an account, install the S3ssn extension from the VS Code marketplace, sign in with the token from your dashboard. After that you just keep coding — the HUD fills itself in.',
    },
    {
      q: 'Does it slow down my editor?',
      a: 'No. The extension is tiny (about 1.4 KB gzipped), runs on event listeners VS Code already fires, and batches events to the server once a minute. You will not feel it.',
    },
    {
      q: 'Can my boss see my S3ssn?',
      a: 'Only if you invite them. S3ssn is a personal account by default. Workspaces are opt-in, and even inside a workspace your stats are visible only to people you add.',
    },
    {
      q: 'What does S3ssn actually see?',
      a: 'Your active repo and branch, the language you\'re writing, whether you\'re focused, and how long. That is the whole list. No code, no keystrokes, no screen, no clipboard.',
    },
    {
      q: 'Can I turn off the game stuff?',
      a: 'Yes. XP, levels, streaks, quests, leaderboard — every gamified surface is opt-out from settings. The work log, sessions, and standup writer work the same with the chrome off.',
    },
    {
      q: 'What if I want my data gone?',
      a: 'One button. Delete account, every session, every event, every link to a commit — wiped. We do not keep a copy.',
    },
  ];

  return (
    <section id="faq" className="border-b hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <span className="hud-chip mb-4">FAQ</span>
          <h2 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest mt-4">
            Short answers.
          </h2>
          <p className="mt-6 text-[14px] text-ink-300">
            Don&apos;t see yours? Email{' '}
            <a className="text-acid link-grow" href="mailto:hi@s3ssn.app">
              hi@s3ssn.app
            </a>
            .
          </p>
        </div>
        <div className="col-span-12 lg:col-span-8 border-t hairline">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group border-b hairline py-6 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-[22px] tracking-tightest pr-8">
                  {f.q}
                </span>
                <span className="font-pixel text-[16px] text-acid group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-4 text-[15px] leading-[1.6] text-ink-200 max-w-[680px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── FOOTER */

function Footer() {
  return (
    <footer className="bg-ink relative">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-6">
          <div className="font-display font-extrabold text-[72px] lg:text-[128px] leading-[0.85] tracking-tightest">
            <span className="glow-acid crt-flicker">S3SSN</span>
          </div>
          <p className="mt-4 text-ink-300 font-pixel text-[10px] uppercase tracking-[0.24em]">
            Make coding feel like a game · private by default
          </p>
        </div>
        <div className="col-span-6 lg:col-span-3 text-[13px]">
          <div className="hud-chip mb-4">PLAY</div>
          <ul className="space-y-2 text-ink-200">
            <li><Link href="/signup" className="link-grow">Press start</Link></li>
            <li><Link href="/dashboard" className="link-grow">Your HUD</Link></li>
            <li><Link href="/leaderboard" className="link-grow">Leaderboard</Link></li>
          </ul>
        </div>
        <div className="col-span-6 lg:col-span-3 text-[13px]">
          <div className="hud-chip mb-4">LEARN</div>
          <ul className="space-y-2 text-ink-200">
            <li><Link href="#what" className="link-grow">What you get</Link></li>
            <li><Link href="#how" className="link-grow">How it works</Link></li>
            <li><Link href="#privacy" className="link-grow">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6 flex items-center justify-between font-pixel text-[10px] uppercase tracking-[0.24em] text-ink-300">
          <span>© S3SSN LABS · MMXXVI</span>
          <span>NO TIMERS · NO SURVEILLANCE · NO BS</span>
        </div>
      </div>
    </footer>
  );
}
