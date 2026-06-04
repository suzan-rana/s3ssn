import { cookies } from 'next/headers';

export const S3SSN_TOKEN_COOKIE = 's3ssn_token';

export function apiBase(): string {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1';
}

function authHeader(): Record<string, string> {
  const token = cookies().get(S3SSN_TOKEN_COOKIE)?.value;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: { ...authHeader(), ...(init?.headers ?? {}) },
      cache: 'no-store',
    });
    if (res.status === 401) return null;
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[s3ssn] GET ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // API down or unreachable — render the empty state instead of crashing the page.
    // eslint-disable-next-line no-console
    console.warn(`[s3ssn] GET ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function apiPatch<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${path} → ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export function isAuthed(): boolean {
  return !!cookies().get(S3SSN_TOKEN_COOKIE)?.value;
}
