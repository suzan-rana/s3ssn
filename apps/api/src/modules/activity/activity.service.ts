import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { ActivityBatch, ActivityEventInput, CommitPayload } from '@s3ssn/types';
import { Prisma } from '@s3ssn/db';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sessionizer') private readonly sessionizer: Queue,
    @InjectQueue('attribution') private readonly attribution: Queue,
  ) {}

  async ingest(userId: string, batch: ActivityBatch) {
    const workspace = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: { workspace: true },
    });
    if (!workspace) throw new NotFoundException('No workspace for user');

    // Pre-resolve repositoryId once per remoteUrlHash so a batch with N events
    // from the same repo runs one upsert, not N.
    const repoIdByHash = new Map<string, string>();
    const ensureRepo = async (e: ActivityEventInput): Promise<string | null> => {
      if (!e.repositoryRemoteHash) return null;
      const cached = repoIdByHash.get(e.repositoryRemoteHash);
      if (cached) return cached;
      const repo = await this.prisma.repository.upsert({
        where: {
          workspaceId_remoteUrlHash: {
            workspaceId: workspace.workspaceId,
            remoteUrlHash: e.repositoryRemoteHash,
          },
        },
        update: { name: e.repositoryName ?? undefined },
        create: {
          workspaceId: workspace.workspaceId,
          provider: 'LOCAL',
          remoteUrlHash: e.repositoryRemoteHash,
          name: e.repositoryName ?? 'unknown',
        },
      });
      repoIdByHash.set(e.repositoryRemoteHash, repo.id);
      return repo.id;
    };

    const eventRows: Prisma.ActivityEventCreateManyInput[] = [];
    const touchedRepoIds = new Set<string>();
    let commitsLanded = 0;

    for (const e of batch.events) {
      const repositoryId = await ensureRepo(e);
      eventRows.push({
        userId,
        workspaceId: workspace.workspaceId,
        repositoryId,
        branchName: e.branchName ?? null,
        languageId: e.languageId ?? null,
        eventType: e.eventType,
        timestamp: new Date(e.timestamp),
        durationSeconds: e.durationSeconds ?? 0,
        metadata: (e.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      });

      if (e.eventType === 'COMMIT' && repositoryId) {
        const payload = (e.metadata as { commit?: CommitPayload } | undefined)?.commit;
        if (payload?.sha && payload.message !== undefined) {
          await this.upsertCommit(repositoryId, payload, e.branchName ?? null);
          touchedRepoIds.add(repositoryId);
          commitsLanded++;
        }
      }
    }

    await this.prisma.activityEvent.createMany({ data: eventRows });

    // Debounce sessionizer per user via a stable jobId.
    await this.sessionizer.add(
      'rebuild',
      { userId, hours: 24 },
      {
        jobId: `sessionize:${userId}`,
        delay: 30_000,
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );

    // For each repo that saw a new commit, queue an attribution rescore. Stable
    // jobId per repo coalesces bursts (e.g. a 10-commit rebase) into one job.
    for (const repositoryId of touchedRepoIds) {
      await this.attribution.add(
        'score',
        { repositoryId },
        {
          jobId: `score:${repositoryId}`,
          delay: 45_000,
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      );
    }

    return { accepted: eventRows.length, commitsLanded };
  }

  private async upsertCommit(
    repositoryId: string,
    payload: CommitPayload,
    branchName: string | null,
  ): Promise<void> {
    await this.prisma.commit.upsert({
      where: { repositoryId_sha: { repositoryId, sha: payload.sha } },
      create: {
        repositoryId,
        sha: payload.sha,
        message: payload.message,
        authorName: payload.authorName ?? null,
        authorEmail: payload.authorEmail ?? null,
        committedAt: new Date(payload.committedAt),
        additions: payload.additions ?? 0,
        deletions: payload.deletions ?? 0,
        filesChanged: payload.filesChanged ?? 0,
        branchName,
      },
      update: {
        // Local capture wins for message + branch since GitHub may rewrite
        // history (rebases) and the local view is canonical at commit time.
        message: payload.message,
        branchName,
      },
    });
  }
}
