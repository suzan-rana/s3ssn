import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import type { ActivityEventInput, CommitPayload, EventType } from '@veyra/types';
import { ApiClient } from './api';
import { StatusBar } from './status-bar';
import { detectRepoContext } from './git';

/**
 * Tracker fires:
 *  - heartbeat while editing (debounced)
 *  - focus/blur on window focus changes
 *  - idle when no editor activity for `idleThresholdSeconds`
 *  - branch_switch when git HEAD changes
 *
 * Buffers events in memory and flushes every `flushIntervalSeconds`.
 * The extension *never* reads document content — only metadata.
 */
export class Tracker implements vscode.Disposable {
  private readonly clientId = randomUUID();
  private readonly buffer: ActivityEventInput[] = [];
  private disposables: vscode.Disposable[] = [];
  private lastActiveAt = 0;
  private lastBranch: string | undefined;
  private paused = false;
  private heartbeatTimer: NodeJS.Timeout | undefined;
  private flushTimer: NodeJS.Timeout | undefined;
  private idleEmitted = false;

  constructor(
    private readonly api: ApiClient,
    private readonly statusBar: StatusBar,
  ) {}

  async start(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('veyra');
    const heartbeatMs = (cfg.get<number>('heartbeatIntervalSeconds') ?? 30) * 1000;
    const flushMs = (cfg.get<number>('flushIntervalSeconds') ?? 60) * 1000;

    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(() => this.onActivity('EDIT')),
      vscode.workspace.onDidSaveTextDocument(() => this.onActivity('FILE_SAVE')),
      vscode.window.onDidChangeActiveTextEditor(() => this.onActivity('FILE_OPEN')),
      vscode.window.onDidChangeWindowState((s) =>
        this.onActivity(s.focused ? 'FOCUS' : 'BLUR'),
      ),
    );

    this.heartbeatTimer = setInterval(() => this.tick(), heartbeatMs);
    this.flushTimer = setInterval(() => this.flush(), flushMs);

    this.statusBar.set('tracking');
  }

  dispose(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.flushTimer) clearInterval(this.flushTimer);
    for (const d of this.disposables) d.dispose();
  }

  pause(): void {
    this.paused = true;
    this.statusBar.set('paused');
    this.enqueue('PAUSE');
    void this.flush();
  }

  resume(): void {
    this.paused = false;
    this.statusBar.set('tracking');
    this.enqueue('RESUME');
  }

  async recordCommit(
    payload: CommitPayload,
    repo: { remoteUrlHash?: string; name?: string; branch?: string },
  ): Promise<void> {
    if (this.paused) return;
    const excluded =
      repo.remoteUrlHash &&
      (vscode.workspace.getConfiguration('veyra').get<string[]>('excludedRepos') ?? []).includes(
        repo.remoteUrlHash,
      );
    if (excluded) return;
    this.buffer.push({
      timestamp: payload.committedAt,
      eventType: 'COMMIT',
      branchName: repo.branch,
      repositoryRemoteHash: repo.remoteUrlHash,
      repositoryName: repo.name,
      metadata: { commit: payload },
    });
    void this.flush();
  }

  showStatus(): void {
    vscode.window.showInformationMessage(
      `Veyra · ${this.paused ? 'paused' : 'tracking'} · ${this.buffer.length} events buffered`,
    );
  }

  private async tick(): Promise<void> {
    if (this.paused) return;
    const idleThreshold =
      (vscode.workspace.getConfiguration('veyra').get<number>('idleThresholdSeconds') ?? 120) * 1000;
    const since = Date.now() - this.lastActiveAt;
    if (since > idleThreshold) {
      if (!this.idleEmitted) {
        this.enqueue('IDLE');
        this.statusBar.set('idle');
        this.idleEmitted = true;
      }
      return;
    }
    this.enqueue('HEARTBEAT', this.heartbeatSeconds());
    this.statusBar.set('tracking');
  }

  private heartbeatSeconds(): number {
    return vscode.workspace.getConfiguration('veyra').get<number>('heartbeatIntervalSeconds') ?? 30;
  }

  private async onActivity(eventType: EventType): Promise<void> {
    if (this.paused) return;
    this.lastActiveAt = Date.now();
    this.idleEmitted = false;
    if (eventType === 'FOCUS' || eventType === 'BLUR' || eventType === 'FILE_SAVE' || eventType === 'FILE_OPEN') {
      this.enqueue(eventType);
    }
    await this.maybeEmitBranchSwitch();
  }

  private async maybeEmitBranchSwitch(): Promise<void> {
    const ctx = await detectRepoContext(vscode.window.activeTextEditor?.document.uri);
    if (ctx.branch && ctx.branch !== this.lastBranch) {
      this.lastBranch = ctx.branch;
      this.enqueue('BRANCH_SWITCH');
    }
  }

  private async enqueue(eventType: EventType, durationSeconds = 0): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const ctx = await detectRepoContext(editor?.document.uri);
    const excluded =
      ctx.remoteUrlHash &&
      (vscode.workspace.getConfiguration('veyra').get<string[]>('excludedRepos') ?? []).includes(
        ctx.remoteUrlHash,
      );
    if (excluded) return;
    this.buffer.push({
      timestamp: new Date().toISOString(),
      eventType,
      durationSeconds,
      branchName: ctx.branch,
      repositoryRemoteHash: ctx.remoteUrlHash,
      repositoryName: ctx.name,
      languageId: editor?.document.languageId,
    });
    if (this.buffer.length >= 200) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = { clientId: this.clientId, events: this.buffer.splice(0, this.buffer.length) };
    await this.api.postBatch(batch);
  }
}
