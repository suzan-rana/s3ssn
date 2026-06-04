import * as vscode from 'vscode';
import type { ActivityBatch } from '@veyra/types';
import { Auth } from './auth';

export class ApiClient {
  constructor(private readonly auth: Auth) {}

  private baseUrl(): string {
    return (
      vscode.workspace.getConfiguration('veyra').get<string>('apiBaseUrl') ??
      'http://localhost:4000/v1'
    );
  }

  async postBatch(batch: ActivityBatch): Promise<void> {
    const token = await this.auth.token();
    if (!token) return;
    try {
      const res = await fetch(`${this.baseUrl()}/activity/batch`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.warn('[veyra] batch rejected', res.status, await res.text());
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[veyra] batch error', err);
    }
  }
}
