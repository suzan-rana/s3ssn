import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Naive sessionizer:
 * - Sort events per user by timestamp.
 * - Start a new session when (repo,branch) changes, or gap > IDLE_GAP_S.
 * - activeSeconds = sum of event.durationSeconds (heartbeats encode active time).
 *
 * Good enough for the scaffold; tighten with a background BullMQ job later.
 */
const IDLE_GAP_S = 5 * 60;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, from?: string, to?: string) {
    const sessions = await this.prisma.codingSession.findMany({
      where: {
        userId,
        startedAt: { gte: from ? new Date(from) : undefined },
        endedAt: { lte: to ? new Date(to) : undefined },
      },
      orderBy: { startedAt: 'desc' },
      take: 200,
      include: {
        repository: true,
        branches: { orderBy: { ordinal: 'asc' } },
        commits: {
          include: { commit: true },
          orderBy: { commit: { committedAt: 'asc' } },
        },
      },
    });
    return sessions.map((s) => ({
      ...s,
      commits: s.commits.map((link) => ({
        id: link.commit.id,
        sha: link.commit.sha,
        message: link.commit.message,
        branchName: link.commit.branchName,
        committedAt: link.commit.committedAt,
      })),
    }));
  }

  async rebuild(userId: string, hours: number) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    const events = await this.prisma.activityEvent.findMany({
      where: { userId, timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    });

    type Bucket = {
      startedAt: Date;
      endedAt: Date;
      activeSeconds: number;
      idleSeconds: number;
      repositoryId: string | null;
      branchName: string | null;
      languages: Map<string, number>;
    };

    const buckets: Bucket[] = [];
    let current: Bucket | null = null;

    for (const e of events) {
      const ts = e.timestamp;
      const keyChanged =
        current &&
        (current.repositoryId !== (e.repositoryId ?? null) ||
          current.branchName !== (e.branchName ?? null));
      const gap = current ? (ts.getTime() - current.endedAt.getTime()) / 1000 : Infinity;

      if (!current || keyChanged || gap > IDLE_GAP_S) {
        current = {
          startedAt: ts,
          endedAt: ts,
          activeSeconds: 0,
          idleSeconds: 0,
          repositoryId: e.repositoryId ?? null,
          branchName: e.branchName ?? null,
          languages: new Map(),
        };
        buckets.push(current);
      }
      current.endedAt = ts;
      current.activeSeconds += e.durationSeconds ?? 0;
      if (e.languageId) {
        current.languages.set(e.languageId, (current.languages.get(e.languageId) ?? 0) + (e.durationSeconds ?? 0));
      }
    }

    await this.prisma.codingSession.deleteMany({
      where: { userId, startedAt: { gte: since } },
    });

    if (buckets.length === 0) return { created: 0 };

    await this.prisma.codingSession.createMany({
      data: buckets.map((b) => ({
        userId,
        repositoryId: b.repositoryId,
        branchName: b.branchName,
        startedAt: b.startedAt,
        endedAt: b.endedAt,
        activeSeconds: b.activeSeconds,
        idleSeconds: b.idleSeconds,
        primaryLanguage: [...b.languages.entries()].sort((a, c) => c[1] - a[1])[0]?.[0] ?? null,
      })),
    });

    return { created: buckets.length };
  }
}
