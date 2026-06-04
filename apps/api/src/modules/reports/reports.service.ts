import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async today(userId: string, date?: string) {
    const day = date ? new Date(date) : new Date();
    const from = startOfLocalDay(day);
    const to = new Date(from.getTime() + 24 * 3600 * 1000);

    const sessionsRaw = await this.prisma.codingSession.findMany({
      where: { userId, startedAt: { gte: from, lt: to } },
      include: {
        repository: true,
        branches: { orderBy: { ordinal: 'asc' } },
        commits: { include: { commit: true }, orderBy: { commit: { committedAt: 'asc' } } },
      },
      orderBy: { startedAt: 'asc' },
    });
    const sessions = sessionsRaw.map((s) => ({
      ...s,
      commits: s.commits.map((link) => ({
        id: link.commit.id,
        sha: link.commit.sha,
        message: link.commit.message,
        branchName: link.commit.branchName,
        committedAt: link.commit.committedAt,
      })),
    }));

    const totalActiveSeconds = sessions.reduce((s, x) => s + x.activeSeconds, 0);

    const byRepo = new Map<string, { id: string; name: string; seconds: number }>();
    const byBranch = new Map<string, number>();
    const byLang = new Map<string, number>();

    for (const s of sessions) {
      if (s.repository) {
        const cur = byRepo.get(s.repository.id) ?? {
          id: s.repository.id,
          name: s.repository.name,
          seconds: 0,
        };
        cur.seconds += s.activeSeconds;
        byRepo.set(s.repository.id, cur);
      }
      if (s.branchName) byBranch.set(s.branchName, (byBranch.get(s.branchName) ?? 0) + s.activeSeconds);
      if (s.primaryLanguage)
        byLang.set(s.primaryLanguage, (byLang.get(s.primaryLanguage) ?? 0) + s.activeSeconds);
    }

    const commits = await this.prisma.commit.findMany({
      where: {
        committedAt: { gte: from, lt: to },
        repository: { workspace: { members: { some: { userId } } } },
      },
      orderBy: { committedAt: 'desc' },
      take: 50,
    });

    return {
      date: from.toISOString(),
      totalActiveSeconds,
      sessions,
      repositories: [...byRepo.values()].sort((a, b) => b.seconds - a.seconds),
      branches: [...byBranch.entries()].map(([name, seconds]) => ({ name, seconds })),
      languages: [...byLang.entries()].map(([id, seconds]) => ({ id, seconds })),
      commits: commits.map((c) => ({ sha: c.sha, message: c.message, committedAt: c.committedAt })),
    };
  }

  async weekly(userId: string, weekOf?: string) {
    const ref = weekOf ? new Date(weekOf) : new Date();
    const start = startOfLocalDay(ref);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000);
    const sessions = await this.prisma.codingSession.findMany({
      where: { userId, startedAt: { gte: start, lt: end } },
      include: { repository: true },
    });
    return {
      weekStart: start.toISOString(),
      weekEnd: end.toISOString(),
      totalActiveSeconds: sessions.reduce((s, x) => s + x.activeSeconds, 0),
      sessions,
    };
  }
}
