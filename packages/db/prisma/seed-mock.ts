/**
 * Seed mock activity for the existing primary user + workspace.
 * Idempotent-ish: clears prior generated data for the workspace then refills.
 *
 * Run from repo root: pnpm --filter @s3ssn/db exec dotenv -e ../../.env -- tsx prisma/seed-mock.ts
 */
import { PrismaClient, Provider, PrState, EventType } from '@prisma/client';

const prisma = new PrismaClient();

const REPOS = [
  { name: 's3ssn/web', lang: 'TypeScript', default: 'main' },
  { name: 's3ssn/api', lang: 'TypeScript', default: 'main' },
  { name: 's3ssn/extension', lang: 'TypeScript', default: 'main' },
  { name: 'personal/dotfiles', lang: 'Shell', default: 'master' },
];

const LANGS = ['TypeScript', 'TSX', 'Rust', 'Python', 'Shell'];

const BRANCHES = ['main', 'feat/hud-polish', 'fix/streak-rollover', 'chore/seed', 'feat/quests-v2'];

const COMMIT_MESSAGES = [
  'fix: streak rollover at midnight UTC',
  'feat: quest XP redemption flow',
  'chore: bump prisma to 5.22',
  'refactor: extract HudPanel boundary',
  'feat: add cyan accent variant to SegBar',
  'fix: idle threshold off-by-one',
  'feat: leaderboard pagination',
  'docs: S3SSN.md §12 schema notes',
  'fix: theme picker focus ring on Safari',
  'feat: PR-to-session linking heuristic',
  'perf: batch heartbeat upserts',
  'test: session aggregation edge cases',
  'fix: timezone in standup drafter',
  'feat: combo multiplier preview',
  'chore: regenerate prisma client',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function fakeSha() {
  return Array.from({ length: 40 }, () => '0123456789abcdef'[randInt(0, 15)]).join('');
}

async function main() {
  const user = await prisma.user.findFirstOrThrow({ orderBy: { createdAt: 'asc' } });
  const workspace = await prisma.workspace.findFirstOrThrow({ where: { ownerId: user.id } });
  console.log(`Seeding for user=${user.email} workspace=${workspace.name}`);

  // Wipe previous mock data scoped to this workspace
  await prisma.commitSessionLink.deleteMany({});
  await prisma.pullRequestCommit.deleteMany({});
  await prisma.pullRequest.deleteMany({ where: { repository: { workspaceId: workspace.id } } });
  await prisma.commit.deleteMany({ where: { repository: { workspaceId: workspace.id } } });
  await prisma.sessionBranchSegment.deleteMany({ where: { session: { userId: user.id } } });
  await prisma.codingSession.deleteMany({ where: { userId: user.id } });
  await prisma.activityEvent.deleteMany({ where: { userId: user.id } });
  await prisma.repository.deleteMany({ where: { workspaceId: workspace.id } });

  // Repositories
  const repos = [];
  for (const r of REPOS) {
    const repo = await prisma.repository.create({
      data: {
        workspaceId: workspace.id,
        provider: Provider.GITHUB,
        providerRepoId: String(randInt(100000, 999999)),
        name: r.name,
        remoteUrlHash: `hash_${r.name.replace('/', '_')}`,
        defaultBranch: r.default,
      },
    });
    repos.push({ ...repo, lang: r.lang });
  }

  // Sessions + activity for last 14 days
  const now = new Date();
  let totalSessions = 0;
  let totalCommits = 0;
  let totalEvents = 0;
  const allCommits: { id: string; sessionId: string | null; repoId: string }[] = [];

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const dayStart = new Date(now);
    dayStart.setUTCDate(dayStart.getUTCDate() - dayOffset);
    dayStart.setUTCHours(9, 0, 0, 0);

    // Today gets fewer sessions to feel "in progress"
    const isToday = dayOffset === 0;
    const sessionsToday = isToday ? randInt(1, 2) : randInt(2, 5);

    let cursor = new Date(dayStart);

    for (let s = 0; s < sessionsToday; s++) {
      const repo = rand(repos);
      const sessionStart = new Date(cursor);
      const activeSec = randInt(15 * 60, 90 * 60); // 15–90 min
      const idleSec = randInt(60, 15 * 60);
      const sessionEnd = new Date(sessionStart.getTime() + (activeSec + idleSec) * 1000);

      // 1–3 branch segments per session (branch switching history)
      const segmentCount = randInt(1, 3);
      const segmentBranches: string[] = [];
      const used = new Set<string>();
      while (segmentBranches.length < segmentCount) {
        const b = rand(BRANCHES);
        if (!used.has(b)) {
          used.add(b);
          segmentBranches.push(b);
        }
      }
      const primaryBranch = segmentBranches[0]!;

      const session = await prisma.codingSession.create({
        data: {
          userId: user.id,
          repositoryId: repo.id,
          branchName: primaryBranch, // backward-compat: first branch
          startedAt: sessionStart,
          endedAt: sessionEnd,
          activeSeconds: activeSec,
          idleSeconds: idleSec,
          primaryLanguage: repo.lang ?? rand(LANGS),
        },
      });
      totalSessions++;

      // Split the wall-clock window into segments
      const totalMs = sessionEnd.getTime() - sessionStart.getTime();
      const sliceMs = Math.floor(totalMs / segmentCount);
      const segments: { branch: string; start: Date; end: Date }[] = [];
      for (let i = 0; i < segmentCount; i++) {
        const segStart = new Date(sessionStart.getTime() + i * sliceMs);
        const segEnd =
          i === segmentCount - 1
            ? sessionEnd
            : new Date(sessionStart.getTime() + (i + 1) * sliceMs);
        segments.push({ branch: segmentBranches[i]!, start: segStart, end: segEnd });

        await prisma.sessionBranchSegment.create({
          data: {
            sessionId: session.id,
            branchName: segmentBranches[i]!,
            startedAt: segStart,
            endedAt: segEnd,
            ordinal: i,
          },
        });
      }

      // Heartbeats / edits scattered over session, attributed to the active segment
      const eventCount = Math.max(4, Math.floor(activeSec / 120));
      const events = [];
      for (let i = 0; i < eventCount; i++) {
        const t = new Date(
          sessionStart.getTime() +
            Math.floor(((i + 1) * activeSec * 1000) / eventCount),
        );
        const seg = segments.find((s) => t >= s.start && t <= s.end) ?? segments[0]!;
        events.push({
          userId: user.id,
          workspaceId: workspace.id,
          repositoryId: repo.id,
          branchName: seg.branch,
          languageId: repo.lang ?? rand(LANGS),
          eventType: i === 0 ? EventType.FOCUS : i === eventCount - 1 ? EventType.BLUR : EventType.HEARTBEAT,
          timestamp: t,
          durationSeconds: 120,
        });
      }
      // Emit BRANCH_SWITCH events at each transition
      for (let i = 1; i < segments.length; i++) {
        events.push({
          userId: user.id,
          workspaceId: workspace.id,
          repositoryId: repo.id,
          branchName: segments[i]!.branch,
          languageId: repo.lang ?? rand(LANGS),
          eventType: EventType.BRANCH_SWITCH,
          timestamp: segments[i]!.start,
          durationSeconds: 0,
        });
      }
      await prisma.activityEvent.createMany({ data: events });
      totalEvents += events.length;

      // 0–3 commits per session, attributed to the segment that was active
      const commitCount = randInt(0, 3);
      for (let c = 0; c < commitCount; c++) {
        const committedAt = new Date(
          sessionStart.getTime() + randInt(60, activeSec) * 1000,
        );
        const seg = segments.find((s) => committedAt >= s.start && committedAt <= s.end) ?? segments[0]!;
        const commit = await prisma.commit.create({
          data: {
            repositoryId: repo.id,
            sha: fakeSha(),
            message: rand(COMMIT_MESSAGES),
            authorName: user.name ?? 'Suzan Rana',
            authorEmail: user.email,
            committedAt,
            additions: randInt(2, 240),
            deletions: randInt(0, 80),
            filesChanged: randInt(1, 12),
            branchName: seg.branch,
          },
        });
        await prisma.commitSessionLink.create({
          data: {
            commitId: commit.id,
            sessionId: session.id,
            confidence: 0.7 + Math.random() * 0.3,
            auto: true,
          },
        });
        allCommits.push({ id: commit.id, sessionId: session.id, repoId: repo.id });
        totalCommits++;
      }

      // gap between sessions
      cursor = new Date(sessionEnd.getTime() + randInt(20, 90) * 60 * 1000);
    }
  }

  // Pull requests — group some commits per feature branch
  const byRepoBranch = new Map<string, string[]>();
  for (const c of allCommits) {
    const commit = await prisma.commit.findUnique({ where: { id: c.id } });
    if (!commit?.branchName || commit.branchName === 'main' || commit.branchName === 'master') continue;
    const key = `${c.repoId}::${commit.branchName}`;
    if (!byRepoBranch.has(key)) byRepoBranch.set(key, []);
    byRepoBranch.get(key)!.push(c.id);
  }

  let prNum = 100;
  let totalPRs = 0;
  for (const [key, commitIds] of byRepoBranch.entries()) {
    if (commitIds.length < 1) continue;
    const [repoId, branch] = key.split('::');
    const state = rand([PrState.OPEN, PrState.MERGED, PrState.MERGED, PrState.CLOSED]);
    const openedAt = new Date(now.getTime() - randInt(1, 13) * 24 * 60 * 60 * 1000);
    const mergedAt = state === PrState.MERGED ? new Date(openedAt.getTime() + randInt(1, 48) * 60 * 60 * 1000) : null;
    const closedAt = state === PrState.CLOSED ? new Date(openedAt.getTime() + randInt(1, 24) * 60 * 60 * 1000) : null;

    const pr = await prisma.pullRequest.create({
      data: {
        repositoryId: repoId!,
        number: prNum++,
        title: `${branch}: ${rand(COMMIT_MESSAGES).replace(/^[a-z]+: /, '')}`,
        state,
        author: user.name ?? user.email,
        openedAt,
        mergedAt,
        closedAt,
      },
    });
    for (const cid of commitIds) {
      await prisma.pullRequestCommit.create({ data: { pullId: pr.id, commitId: cid } });
    }
    totalPRs++;
  }

  console.log(
    `Done. repos=${repos.length} sessions=${totalSessions} commits=${totalCommits} prs=${totalPRs} events=${totalEvents}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
