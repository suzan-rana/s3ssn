import 'server-only';
import { cookies } from 'next/headers';
import { isTheme, THEME_COOKIE, type Theme } from './theme';

export function readTheme(): Theme {
  const v = cookies().get(THEME_COOKIE)?.value;
  return isTheme(v) ? v : 'arcade';
}
