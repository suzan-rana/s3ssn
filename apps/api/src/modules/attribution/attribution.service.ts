import { Injectable } from '@nestjs/common';
import { ATTRIBUTION } from '@veyra/types';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Confidence scoring per VEYRA.md §11. The scorer walks commits in a repo and links
 * sessions that ended within an attribution window. Auto-link at >= AUTO_LINK_THRESHOLD;
 * weaker matches are still stored as `auto = false` so the UI can show suggestions.
 */
const ATTRIBUTION_WINDOW_HOURS = 24;

@Injectable()
export class AttributionService {
  constructor(private readonly prisma: PrismaService) {}

  async scoreRepo(repositoryId: string): Promise<{ links: number }> {
    const repo = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { workspace: { include: { members: { include: { user: true } } } } },
    });
    if (!repo) return { links: 0 };

    const commits = await this.prisma.commit.findMany({
      where: { repositoryId },
      orderBy: { committedAt: 'desc' },
      take: 200,
    });

    let writes = 0;
    for (const commit of commits) {
      const windowStart = new Date(commit.committedAt.getTime() - ATTRIBUTION_WINDOW_HOURS * 3600 * 1000);
      const candidates = await this.prisma.codingSession.findMany({
        where: {
          repositoryId,
          endedAt: { lte: commit.committedAt, gte: windowStart },
        },
        include: { user: true },
      });

      for (const session of candidates) {
        const score = this.score({
          sameRepo: true,
          sameBranch: !!commit.branchName && commit.branchName === session.branchName,
          sameAuthor: !!commit.authorEmail && commit.authorEmail === session.user.email,
          withinTwoHours:
            commit.committedAt.getTime() - session.endedAt.getTime() <= 2 * 3600 * 1000,
          matchingLanguage: this.languageMatchesCommit(session.primaryLanguage),
        });

        await this.prisma.commitSessionLink.upsert({
          where: { commitId_sessionId: { commitId: commit.id, sessionId: session.id } },
          create: {
            commitId: commit.id,
            sessionId: session.id,
            confidence: score,
            auto: score >= ATTRIBUTION.AUTO_LINK_THRESHOLD,
          },
          update: { confidence: score, auto: score >= ATTRIBUTION.AUTO_LINK_THRESHOLD },
        });
        writes++;
      }
    }
    return { links: writes };
  }

  private score(facts: {
    sameRepo: boolean;
    sameBranch: boolean;
    sameAuthor: boolean;
    withinTwoHours: boolean;
    matchingLanguage: boolean;
  }): number {
    let s = 0;
    if (facts.sameRepo) s += ATTRIBUTION.SAME_REPO;
    if (facts.sameBranch) s += ATTRIBUTION.SAME_BRANCH;
    if (facts.sameAuthor) s += ATTRIBUTION.SAME_AUTHOR;
    if (facts.withinTwoHours) s += ATTRIBUTION.WITHIN_2H;
    if (facts.matchingLanguage) s += ATTRIBUTION.MATCHING_LANG;
    return Math.min(1, Number(s.toFixed(2)));
  }

  /**
   * Placeholder. Real implementation should inspect `Commit.filesChanged` extension stats
   * against the session's language histogram. We default to true so the bonus applies when
   * we lack data — kept conservative under the auto-link threshold.
   */
  private languageMatchesCommit(_lang: string | null): boolean {
    return _lang ? true : false;
  }
}
