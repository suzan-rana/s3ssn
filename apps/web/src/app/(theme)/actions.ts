'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isTheme, THEME_COOKIE } from '@/lib/theme';

export async function setThemeAction(theme: string): Promise<void> {
  if (!isTheme(theme)) return;
  cookies().set(THEME_COOKIE, theme, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}
