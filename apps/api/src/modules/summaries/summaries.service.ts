import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface SummaryInput {
  scope: 'standup' | 'client' | 'engineering';
  totalSeconds: number;
  repositories: string[];
  branches: string[];
  commits: Array<{ sha: string; message: string }>;
  prs: Array<{ number: number; title: string }>;
}

/**
 * Two-tier summarizer:
 * - If ANTHROPIC_API_KEY is set, call Claude with a structured prompt.
 * - Otherwise, build a deterministic, copy-paste-ready summary from the inputs.
 *
 * The deterministic path is what ships in MVP. The model path is opt-in.
 */
@Injectable()
export class SummariesService {
  constructor(private readonly prisma: PrismaService) {}

  async forSession(
    userId: string,
    sessionId: string,
  ): Promise<{ summary: string; source: 'rule' | 'llm' }> {
    const session = await this.prisma.codingSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        repository: true,
        branches: { orderBy: { ordinal: 'asc' } },
        commits: { include: { commit: true }, orderBy: { commit: { committedAt: 'asc' } } },
      },
    });
    if (!session) {
      return { summary: 'Session not found.', source: 'rule' };
    }

    const input: SummaryInput = {
      scope: 'engineering',
      totalSeconds: session.activeSeconds,
      repositories: session.repository ? [session.repository.name] : [],
      branches: session.branches.length
        ? session.branches.map((b) => b.branchName)
        : session.branchName
        ? [session.branchName]
        : [],
      commits: session.commits.map((link) => ({
        sha: link.commit.sha.slice(0, 7),
        message: firstLine(link.commit.message),
      })),
      prs: [],
    };

    if (process.env.ANTHROPIC_API_KEY) {
      const llm = await this.callClaude(input, session.repository?.context ?? null).catch(() => null);
      if (llm) return { summary: llm, source: 'llm' };
    }
    return { summary: this.ruleBased(input), source: 'rule' };
  }

  async standup(userId: string, date?: string): Promise<{ summary: string; source: 'rule' | 'llm' }> {
    const day = date ? new Date(date) : new Date();
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 3600 * 1000);

    const sessions = await this.prisma.codingSession.findMany({
      where: { userId, startedAt: { gte: start, lt: end } },
      include: { repository: true },
    });
    const totalSeconds = sessions.reduce((s, x) => s + x.activeSeconds, 0);

    const repos = unique(sessions.map((s) => s.repository?.name).filter(Boolean) as string[]);
    const branches = unique(sessions.map((s) => s.branchName).filter(Boolean) as string[]);

    const commits = await this.prisma.commit.findMany({
      where: {
        committedAt: { gte: start, lt: end },
        repository: { workspace: { members: { some: { userId } } } },
      },
      take: 20,
      orderBy: { committedAt: 'asc' },
    });

    const input: SummaryInput = {
      scope: 'standup',
      totalSeconds,
      repositories: repos,
      branches,
      commits: commits.map((c) => ({ sha: c.sha.slice(0, 7), message: firstLine(c.message) })),
      prs: [],
    };

    if (process.env.ANTHROPIC_API_KEY) {
      const llm = await this.callClaude(input).catch(() => null);
      if (llm) return { summary: llm, source: 'llm' };
    }
    return { summary: this.ruleBased(input), source: 'rule' };
  }

  private ruleBased(i: SummaryInput): string {
    if (i.totalSeconds === 0 && i.commits.length === 0) {
      return 'No focused coding time captured for this window.';
    }
    const time = formatDuration(i.totalSeconds);
    const repoPart = i.repositories.length
      ? ` across ${enumerate(i.repositories.slice(0, 3))}`
      : '';
    const branchPart = i.branches.length
      ? ` on ${enumerate(i.branches.slice(0, 3))}`
      : '';
    const commitPart = i.commits.length
      ? ` Landed ${i.commits.length} commit${i.commits.length === 1 ? '' : 's'}: ${i.commits
          .slice(0, 3)
          .map((c) => `${c.sha} ${c.message}`)
          .join(' · ')}.`
      : '';
    return `Logged ${time} of focused engineering${repoPart}${branchPart}.${commitPart}`.trim();
  }

  private async callClaude(
    input: SummaryInput,
    repoContext?: string | null,
  ): Promise<string | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;
    const systemPrompt = [
      'You write short, factual work-log entries for a developer. One paragraph, 2-4 sentences.',
      'No filler, no platitudes. Use numbers exactly as given. Never invent commits or PRs.',
      'When repo context is provided, use it to phrase the work in terms a non-engineer stakeholder can follow.',
      repoContext ? `Repo context: ${repoContext.slice(0, 1200)}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(input),
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    return json.content?.find((c) => c.type === 'text')?.text ?? null;
  }
}

function firstLine(s: string): string {
  return s.split('\n', 1)[0] ?? '';
}
function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
function enumerate(xs: string[]): string {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
