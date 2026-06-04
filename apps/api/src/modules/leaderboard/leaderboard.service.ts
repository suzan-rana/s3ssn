import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Window = 'today' | 'week' | 'all';

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  totalSeconds: number;
  sessions: number;
  level: number;
  rank_label: string;
}

const RANKS = [
  'BOOTSTRAP',
  'COMMITTER',
  'REFACTORER',
  'ARCHITECT',
  'SHIPWRIGHT',
  'KEEPER',
  'LOREMASTER',
  'GRANDMASTER',
  'MYTHIC',
  'LEGEND',
];

function levelFromSeconds(xp: number): { level: number; label: string } {
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 7200)) + 1);
  return { level, label: RANKS[Math.min(level - 1, RANKS.length - 1)] ?? 'LEGEND' };
}

function startOf(window: Window): Date | null {
  if (window === 'all') return null;
  const now = new Date();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (window === 'today') return d;
  d.setDate(d.getDate() - d.getDay());
  return d;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async list(window: Window): Promise<{ window: Window; updatedAt: string; rows: LeaderboardRow[] }> {
    const since = startOf(window);

    const grouped = await this.prisma.codingSession.groupBy({
      by: ['userId'],
      where: since ? { startedAt: { gte: since } } : undefined,
      _sum: { activeSeconds: true },
      _count: { _all: true },
      orderBy: { _sum: { activeSeconds: 'desc' } },
      take: 100,
    });

    const userIds = grouped.map((g) => g.userId);
    if (userIds.length === 0) {
      return { window, updatedAt: new Date().toISOString(), rows: [] };
    }
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    const rows: LeaderboardRow[] = grouped.map((g, i) => {
      const u = byId.get(g.userId);
      const total = g._sum.activeSeconds ?? 0;
      const { level, label } = levelFromSeconds(total);
      return {
        rank: i + 1,
        userId: g.userId,
        name: u?.name ?? u?.email.split('@')[0] ?? 'anon',
        totalSeconds: total,
        sessions: g._count._all,
        level,
        rank_label: label,
      };
    });

    return { window, updatedAt: new Date().toISOString(), rows };
  }
}
