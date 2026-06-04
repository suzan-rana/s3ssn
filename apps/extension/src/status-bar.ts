import * as vscode from 'vscode';

export type TrackerState = 'tracking' | 'idle' | 'paused' | 'offline';

export class StatusBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = 's3ssn.status';
    this.set('offline');
    this.item.show();
  }

  set(state: TrackerState, detail?: string): void {
    const label =
      state === 'tracking'
        ? '$(record) S3ssn'
        : state === 'idle'
          ? '$(circle-large-outline) S3ssn'
          : state === 'paused'
            ? '$(debug-pause) S3ssn'
            : '$(circle-slash) S3ssn';
    this.item.text = detail ? `${label} · ${detail}` : label;
    this.item.tooltip = `S3ssn · ${state}${detail ? ` · ${detail}` : ''}`;
  }

  dispose(): void {
    this.item.dispose();
  }
}
