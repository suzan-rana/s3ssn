import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { GithubService } from './github.service';

/**
 * GitHub webhook receiver. Verifies HMAC, then upserts commits or pulls based on event type.
 * Heavy work (re-running attribution, refreshing aggregates) belongs in a BullMQ queue —
 * this handler stays fast and idempotent.
 */
@Controller('integrations/github')
export class GithubWebhookController {
  constructor(
    private readonly gh: GithubService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(202)
  async webhook(
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Headers('x-github-event') event: string | undefined,
    @Req() req: Request,
    @Body() payload: any,
  ) {
    const raw = (req as Request & { rawBody?: Buffer }).rawBody?.toString('utf8') ?? JSON.stringify(payload);
    if (!this.gh.verifyWebhook(raw, signature)) {
      return { ok: false, reason: 'invalid_signature' };
    }

    if (event === 'push') {
      await this.handlePush(payload);
    } else if (event === 'pull_request') {
      await this.handlePullRequest(payload);
    }
    return { ok: true, event };
  }

  private async handlePush(p: any): Promise<void> {
    const repoId = p?.repository?.id;
    if (!repoId) return;
    const repo = await this.prisma.repository.findFirst({
      where: { providerRepoId: String(repoId), provider: 'GITHUB' },
    });
    if (!repo) return;
    for (const c of p.commits ?? []) {
      await this.prisma.commit.upsert({
        where: { repositoryId_sha: { repositoryId: repo.id, sha: c.id } },
        create: {
          repositoryId: repo.id,
          sha: c.id,
          message: c.message,
          authorName: c.author?.name ?? null,
          authorEmail: c.author?.email ?? null,
          committedAt: new Date(c.timestamp ?? Date.now()),
          branchName: typeof p.ref === 'string' ? p.ref.replace('refs/heads/', '') : null,
        },
        update: {},
      });
    }
  }

  private async handlePullRequest(p: any): Promise<void> {
    const repoId = p?.repository?.id;
    const pr = p?.pull_request;
    if (!repoId || !pr) return;
    const repo = await this.prisma.repository.findFirst({
      where: { providerRepoId: String(repoId), provider: 'GITHUB' },
    });
    if (!repo) return;
    await this.prisma.pullRequest.upsert({
      where: { repositoryId_number: { repositoryId: repo.id, number: pr.number } },
      create: {
        repositoryId: repo.id,
        number: pr.number,
        title: pr.title,
        state: pr.merged_at ? 'MERGED' : pr.state === 'closed' ? 'CLOSED' : 'OPEN',
        author: pr.user?.login ?? null,
        openedAt: new Date(pr.created_at),
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      },
      update: {
        title: pr.title,
        state: pr.merged_at ? 'MERGED' : pr.state === 'closed' ? 'CLOSED' : 'OPEN',
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      },
    });
  }
}
