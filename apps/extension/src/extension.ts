import * as vscode from 'vscode';
import { Tracker } from './tracker';
import { ApiClient } from './api';
import { StatusBar } from './status-bar';
import { Auth } from './auth';
import { CommitWatcher } from './commit-watcher';

let tracker: Tracker | undefined;
let commitWatcher: CommitWatcher | undefined;

export async function activate(context: vscode.ExtensionContext) {
  const auth = new Auth(context);
  const api = new ApiClient(auth);
  const statusBar = new StatusBar();
  tracker = new Tracker(api, statusBar);
  commitWatcher = new CommitWatcher((payload, repo) =>
    tracker!.recordCommit(payload, repo),
  );

  context.subscriptions.push(
    vscode.window.registerUriHandler(auth),
    statusBar,
    tracker,
    commitWatcher,
    vscode.commands.registerCommand('veyra.login', () => auth.login()),
    vscode.commands.registerCommand('veyra.logout', () => auth.logout()),
    vscode.commands.registerCommand('veyra.pause', () => tracker!.pause()),
    vscode.commands.registerCommand('veyra.resume', () => tracker!.resume()),
    vscode.commands.registerCommand('veyra.status', () => tracker!.showStatus()),
    vscode.commands.registerCommand('veyra.openDashboard', () => {
      const cfg = vscode.workspace.getConfiguration('veyra');
      const base = (cfg.get<string>('webBaseUrl') ?? 'http://localhost:3000').replace(/\/$/, '');
      return vscode.env.openExternal(vscode.Uri.parse(`${base}/dashboard`));
    }),
  );

  await tracker.start();
  await commitWatcher.start();
}

export function deactivate() {
  return tracker?.flush();
}
