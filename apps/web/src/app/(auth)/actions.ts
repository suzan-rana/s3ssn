'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiBase, VEYRA_TOKEN_COOKIE } from '@/lib/api';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; name: string | null };
}

async function exchange(path: string, payload: Record<string, unknown>): Promise<AuthResponse> {
  const url = `${apiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch (err) {
    // Network-level failure — almost always the API isn't running. Surface a
    // useful message instead of dumping `fetch failed` into the user's face.
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot reach the Veyra API at ${apiBase()}. Is the API server running? (${msg})`,
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || 'Authentication failed');
  }
  return (await res.json()) as AuthResponse;
}

function persistToken(token: string) {
  cookies().set(VEYRA_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

function safeNext(raw: string): string {
  // Only allow same-origin relative paths to avoid open redirects.
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const next = safeNext(String(formData.get('next') ?? '/dashboard'));
  const { accessToken } = await exchange('/auth/login', { email, password });
  persistToken(accessToken);
  redirect(next);
}

export async function signupAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '');
  const next = safeNext(String(formData.get('next') ?? '/dashboard'));
  const { accessToken } = await exchange('/auth/signup', {
    email,
    password,
    name: name || undefined,
  });
  persistToken(accessToken);
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  cookies().delete(VEYRA_TOKEN_COOKIE);
  redirect('/login');
}
