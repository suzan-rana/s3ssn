import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { Octokit } from '@octokit/rest';
import { PrismaService } from '../../prisma/prisma.service';

interface StateRecord {
  userId: string;
  workspaceId: string;
  exp: number;
}

@Injectable()
export class GithubService {
  constructor(private readonly prisma: PrismaService) {}

  buildAuthorizeUrl(userId: string, workspaceId: string): string {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new NotFoundException('GitHub OAuth not configured');
    const state = this.signState({ userId, workspaceId, exp: Date.now() + 10 * 60_000 });
    const redirectUri = `${process.env.API_BASE_URL ?? 'http://localhost:4000'}/v1/integrations/github/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user repo',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async completeOauth(code: string, state: string): Promise<void> {
    const decoded = this.verifyState(state);
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new NotFoundException('GitHub OAuth not configured');

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const json = (await tokenRes.json()) as { access_token?: string; scope?: string };
    if (!json.access_token) throw new UnauthorizedException('GitHub token exchange failed');

    await this.prisma.integration.upsert({
      where: {
        userId_workspaceId_provider: {
          userId: decoded.userId,
          workspaceId: decoded.workspaceId,
          provider: 'GITHUB',
        },
      },
      create: {
        userId: decoded.userId,
        workspaceId: decoded.workspaceId,
        provider: 'GITHUB',
        accessToken: json.access_token,
        scope: json.scope,
      },
      update: { accessToken: json.access_token, scope: json.scope },
    });
  }

  async syncAll(userId: string, workspaceId: string): Promise<{ repos: number; commits: number; pulls: number }> {
    const integration = await this.prisma.integration.findUnique({
      where: { userId_workspaceId_provider: { userId, workspaceId, provider: 'GITHUB' } },
    });
    if (!integration) throw new NotFoundException('GitHub not connected');
    const octo = new Octokit({ auth: integration.accessToken });

    const repos = await octo.paginate(octo.repos.listForAuthenticatedUser, { per_page: 100, sort: 'pushed' });
    let commitCount = 0;
    let pullCount = 0;

    for (const r of repos.slice(0, 25)) {
      const remoteUrlHash = createHash('sha256').update(r.clone_url ?? r.html_url).digest('hex').slice(0, 32);
      const repoRow = await this.prisma.repository.upsert({
        where: { workspaceId_remoteUrlHash: { workspaceId, remoteUrlHash } },
        create: {
          workspaceId,
          provider: 'GITHUB',
          providerRepoId: String(r.id),
          name: r.full_name,
          remoteUrlHash,
          defaultBranch: r.default_branch ?? null,
        },
        update: {
          providerRepoId: String(r.id),
          name: r.full_name,
          defaultBranch: r.default_branch ?? null,
        },
      });

      const [owner, name] = r.full_name.split('/');
      if (!owner || !name) continue;

      const commits = await octo.repos.listCommits({ owner, repo: name, per_page: 50 }).catch(() => ({ data: [] as any[] }));
      for (const c of commits.data) {
        await this.prisma.commit.upsert({
          where: { repositoryId_sha: { repositoryId: repoRow.id, sha: c.sha } },
          create: {
            repositoryId: repoRow.id,
            sha: c.sha,
            message: c.commit.message,
            authorName: c.commit.author?.name ?? null,
            authorEmail: c.commit.author?.email ?? null,
            committedAt: new Date(c.commit.author?.date ?? c.commit.committer?.date ?? Date.now()),
          },
          update: {},
        });
        commitCount++;
      }

      const pulls = await octo.pulls.list({ owner, repo: name, state: 'all', per_page: 50 }).catch(() => ({ data: [] as any[] }));
      for (const p of pulls.data) {
        await this.prisma.pullRequest.upsert({
          where: { repositoryId_number: { repositoryId: repoRow.id, number: p.number } },
          create: {
            repositoryId: repoRow.id,
            number: p.number,
            title: p.title,
            state: p.merged_at ? 'MERGED' : p.state === 'closed' ? 'CLOSED' : 'OPEN',
            author: p.user?.login ?? null,
            openedAt: new Date(p.created_at),
            mergedAt: p.merged_at ? new Date(p.merged_at) : null,
            closedAt: p.closed_at ? new Date(p.closed_at) : null,
          },
          update: {
            title: p.title,
            state: p.merged_at ? 'MERGED' : p.state === 'closed' ? 'CLOSED' : 'OPEN',
            mergedAt: p.merged_at ? new Date(p.merged_at) : null,
            closedAt: p.closed_at ? new Date(p.closed_at) : null,
          },
        });
        pullCount++;
      }
    }

    return { repos: repos.length, commits: commitCount, pulls: pullCount };
  }

  verifyWebhook(rawBody: string, signature: string | undefined): boolean {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) return true;
    if (!signature) return false;
    const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private signState(payload: StateRecord): string {
    const json = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = createHmac('sha256', this.stateSecret()).update(json).digest('base64url');
    return `${json}.${sig}`;
  }

  private verifyState(state: string): StateRecord {
    const [json, sig] = state.split('.');
    if (!json || !sig) throw new UnauthorizedException('bad state');
    const expected = createHmac('sha256', this.stateSecret()).update(json).digest('base64url');
    if (sig !== expected) throw new UnauthorizedException('bad state');
    const decoded = JSON.parse(Buffer.from(json, 'base64url').toString()) as StateRecord;
    if (decoded.exp < Date.now()) throw new UnauthorizedException('state expired');
    return decoded;
  }

  private stateSecret(): string {
    return process.env.JWT_SECRET ?? 'change-me-in-production';
  }
}
