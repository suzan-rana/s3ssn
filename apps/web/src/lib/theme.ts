/**
 * Theme constants — safe to import from client components.
 * Server-only `readTheme()` lives in `theme.server.ts`.
 */

export const THEME_COOKIE = 'veyra_theme';

export const THEMES = ['arcade', 'duo', 'synthwave'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_META: Record<
  Theme,
  { name: string; tagline: string; swatch: [string, string, string]; bg: string; fg: string }
> = {
  arcade: {
    name: 'Arcade',
    tagline: 'Dark · acid neon · pixel HUD',
    swatch: ['#c4ff3d', '#ff2e88', '#3df0ff'],
    bg: '#070708',
    fg: '#f5f3ee',
  },
  duo: {
    name: 'Sprout',
    tagline: 'Cream · friendly · grass green',
    swatch: ['#2e8b00', '#ff9600', '#1cb0f6'],
    bg: '#faf6ee',
    fg: '#2f3138',
  },
  synthwave: {
    name: 'Synthwave',
    tagline: 'Deep purple · hot magenta · neon gold',
    swatch: ['#ff2e88', '#3df0ff', '#ffc63c'],
    bg: '#0d0620',
    fg: '#fff0e6',
  },
};

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
