import * as vscode from 'vscode';
import type { ActivityBatch } from '@s3ssn/types';
import { Auth } from './auth';

export class ApiClient {
  constructor(private readonly auth: Auth) {}

  private baseUrl(): string {
    return (
      vscode.workspace.getConfiguration('s3ssn').get<string>('apiBaseUrl') ??
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
        console.warn('[s3ssn] batch rejected', res.status, await res.text());
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[s3ssn] batch error', err);
    }
  }
}
