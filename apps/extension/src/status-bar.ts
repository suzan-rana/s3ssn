import * as vscode from 'vscode';

export type TrackerState = 'tracking' | 'idle' | 'paused' | 'offline';

export class StatusBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = 'veyra.status';
    this.set('offline');
    this.item.show();
  }

  set(state: TrackerState, detail?: string): void {
    const label =
      state === 'tracking'
        ? '$(record) Veyra'
        : state === 'idle'
          ? '$(circle-large-outline) Veyra'
          : state === 'paused'
            ? '$(debug-pause) Veyra'
            : '$(circle-slash) Veyra';
    this.item.text = detail ? `${label} · ${detail}` : label;
    this.item.tooltip = `Veyra · ${state}${detail ? ` · ${detail}` : ''}`;
  }

  dispose(): void {
    this.item.dispose();
  }
}
