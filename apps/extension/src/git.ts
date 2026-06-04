import * as vscode from 'vscode';
import { createHash } from 'crypto';

/**
 * Minimal shape of the VS Code git extension API surface we actually use.
 * Full type defs live in `vscode.git` but are not published as a package; mirroring
 * just enough keeps us off DT typings without losing safety at call sites.
 */
export interface GitCommit {
  hash: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  authorDate?: Date;
  commitDate?: Date;
  parents: string[];
}

export interface GitRepository {
  rootUri: vscode.Uri;
  state: {
    HEAD?: { name?: string; commit?: string };
    remotes: Array<{ name: string; fetchUrl?: string; pushUrl?: string }>;
    onDidChange: vscode.Event<void>;
  };
  log(options: { maxEntries?: number }): Promise<GitCommit[]>;
}

interface GitExtensionApi {
  repositories: GitRepository[];
  onDidOpenRepository: vscode.Event<GitRepository>;
}

let cached: GitExtensionApi | undefined;

export async function getGitApi(): Promise<GitExtensionApi | undefined> {
  if (cached) return cached;
  const ext = vscode.extensions.getExtension<{
    getAPI: (v: number) => GitExtensionApi;
  }>('vscode.git');
  if (!ext) return undefined;
  if (!ext.isActive) await ext.activate();
  cached = ext.exports.getAPI(1);
  return cached;
}

export interface RepoContext {
  branch: string | undefined;
  remoteUrlHash: string | undefined;
  name: string | undefined;
}

export function hashRemote(remote: string | undefined): string | undefined {
  if (!remote) return undefined;
  return createHash('sha256').update(remote).digest('hex').slice(0, 32);
}

export function repoName(repo: GitRepository): string {
  return repo.rootUri.path.split('/').filter(Boolean).slice(-2).join('/');
}

export function repoRemote(repo: GitRepository): string | undefined {
  return repo.state.remotes.find((r) => r.fetchUrl)?.fetchUrl ?? repo.state.remotes[0]?.pushUrl;
}

export async function detectRepoContext(file: vscode.Uri | undefined): Promise<RepoContext> {
  const git = await getGitApi();
  if (!git || git.repositories.length === 0)
    return { branch: undefined, remoteUrlHash: undefined, name: undefined };

  const repo =
    git.repositories.find((r) => file && file.fsPath.startsWith(r.rootUri.fsPath)) ??
    git.repositories[0];
  if (!repo) return { branch: undefined, remoteUrlHash: undefined, name: undefined };

  return {
    branch: repo.state.HEAD?.name,
    remoteUrlHash: hashRemote(repoRemote(repo)),
    name: repoName(repo),
  };
}
