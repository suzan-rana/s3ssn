import * as vscode from 'vscode';
import { randomBytes } from 'crypto';

const KEY = 'veyra.accessToken';
const CALLBACK_PATH = '/auth-callback';
const STATE_TIMEOUT_MS = 5 * 60 * 1000;

interface PendingLogin {
  state: string;
  resolve: (token: string) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

export class Auth implements vscode.UriHandler {
  private pending: PendingLogin | undefined;

  constructor(private readonly ctx: vscode.ExtensionContext) {}

  async token(): Promise<string | undefined> {
    return this.ctx.secrets.get(KEY);
  }

  async setToken(token: string): Promise<void> {
    await this.ctx.secrets.store(KEY, token);
  }

  async login(): Promise<void> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: 'Sign in via browser', detail: 'Opens the Veyra dashboard and links back', id: 'browser' },
        { label: 'Paste access token', detail: 'For CI or headless setups', id: 'paste' },
      ],
      { placeHolder: 'How do you want to sign in?', ignoreFocusOut: true },
    );
    if (!choice) return;

    if (choice.id === 'paste') {
      await this.loginByPaste();
      return;
    }
    await this.loginByBrowser();
  }

  private async loginByPaste(): Promise<void> {
    const token = await vscode.window.showInputBox({
      prompt: 'Paste your Veyra access token',
      ignoreFocusOut: true,
      password: true,
    });
    if (!token) return;
    await this.setToken(token.trim());
    vscode.window.showInformationMessage('Veyra: signed in.');
  }

  private async loginByBrowser(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('veyra');
    const webBaseUrl = (cfg.get<string>('webBaseUrl') ?? 'http://localhost:3000').replace(/\/$/, '');

    const publisher = this.ctx.extension.packageJSON.publisher as string;
    const name = this.ctx.extension.packageJSON.name as string;
    const callbackUri = `vscode://${publisher}.${name}${CALLBACK_PATH}`;

    const state = randomBytes(24).toString('hex');
    const connectUrl = `${webBaseUrl}/extension/connect?state=${encodeURIComponent(state)}&redirect=${encodeURIComponent(callbackUri)}`;

    const tokenPromise = this.awaitCallback(state);

    const opened = await vscode.env.openExternal(vscode.Uri.parse(connectUrl));
    if (!opened) {
      this.cancelPending(new Error('Failed to open browser'));
      vscode.window.showErrorMessage('Veyra: could not open browser. Try "Paste access token" instead.');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Veyra: waiting for browser sign-in…',
        cancellable: true,
      },
      async (_progress, cancelToken) => {
        cancelToken.onCancellationRequested(() => this.cancelPending(new Error('Cancelled')));
        try {
          const token = await tokenPromise;
          await this.setToken(token);
          vscode.window.showInformationMessage('Veyra: signed in.');
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg !== 'Cancelled') {
            vscode.window.showErrorMessage(`Veyra: sign-in failed — ${msg}`);
          }
        }
      },
    );
  }

  private awaitCallback(state: string): Promise<string> {
    this.cancelPending(new Error('Superseded by new sign-in'));
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending?.state === state) {
          this.pending = undefined;
          reject(new Error('Timed out waiting for browser sign-in'));
        }
      }, STATE_TIMEOUT_MS);
      this.pending = { state, resolve, reject, timer };
    });
  }

  private cancelPending(err: Error): void {
    if (!this.pending) return;
    clearTimeout(this.pending.timer);
    this.pending.reject(err);
    this.pending = undefined;
  }

  handleUri(uri: vscode.Uri): void {
    if (uri.path !== CALLBACK_PATH) return;
    const params = new URLSearchParams(uri.query);
    const token = params.get('token');
    const state = params.get('state');
    const error = params.get('error');

    if (!this.pending) {
      vscode.window.showWarningMessage('Veyra: received auth callback but no sign-in is in progress.');
      return;
    }
    if (error) {
      this.cancelPending(new Error(error));
      return;
    }
    if (!token || !state) {
      this.cancelPending(new Error('Missing token or state in callback'));
      return;
    }
    if (state !== this.pending.state) {
      this.cancelPending(new Error('State mismatch — possible CSRF, sign-in aborted'));
      return;
    }
    const { resolve, timer } = this.pending;
    clearTimeout(timer);
    this.pending = undefined;
    resolve(token);
  }

  async logout(): Promise<void> {
    await this.ctx.secrets.delete(KEY);
    vscode.window.showInformationMessage('Veyra: signed out.');
  }
}
