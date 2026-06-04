import * as vscode from 'vscode';
import type { CommitPayload } from '@veyra/types';
import {
  getGitApi,
  hashRemote,
  repoName,
  repoRemote,
  type GitRepository,
} from './git';

type CommitEmit = (
  payload: CommitPayload,
  repo: { remoteUrlHash?: string; name?: string; branch?: string },
) => Promise<void>;

/**
 * Watches every open VS Code git repository for new HEAD commits. When the HEAD
 * sha changes, we resolve the new commit via the git API and hand it to the
 * tracker as a COMMIT event. The tracker is responsible for batching + sending.
 *
 * No polling. No git CLI. We piggy-back on VS Code's own watcher, which fires on
 * commit, amend, rebase, cherry-pick — anything that moves HEAD.
 */
export class CommitWatcher implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly lastSha = new Map<string, string>();

  constructor(private readonly emit: CommitEmit) {}

  async start(): Promise<void> {
    const git = await getGitApi();
    if (!git) return;

    for (const repo of git.repositories) this.attach(repo);
    this.disposables.push(git.onDidOpenRepository((r) => this.attach(r)));
  }

  dispose(): void {
    for (const d of this.disposables) d.dispose();
  }

  private attach(repo: GitRepository): void {
    // Seed so the very first state event doesn't fire a "new commit" event
    // for whatever HEAD already was when VS Code started.
    const initial = repo.state.HEAD?.commit;
    if (initial) this.lastSha.set(repo.rootUri.fsPath, initial);

    this.disposables.push(
      repo.state.onDidChange(() => {
        void this.onChange(repo);
      }),
    );
  }

  private async onChange(repo: GitRepository): Promise<void> {
    const head = repo.state.HEAD?.commit;
    if (!head) return;
    const key = repo.rootUri.fsPath;
    if (this.lastSha.get(key) === head) return;
    this.lastSha.set(key, head);

    try {
      const [commit] = await repo.log({ maxEntries: 1 });
      if (!commit || commit.hash !== head) return;
      const payload: CommitPayload = {
        sha: commit.hash,
        message: commit.message ?? '',
        authorName: commit.authorName,
        authorEmail: commit.authorEmail,
        committedAt: (commit.commitDate ?? commit.authorDate ?? new Date()).toISOString(),
        parents: commit.parents,
      };
      await this.emit(payload, {
        remoteUrlHash: hashRemote(repoRemote(repo)),
        name: repoName(repo),
        branch: repo.state.HEAD?.name,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[veyra] commit watcher: failed to read log', err);
    }
  }
}
