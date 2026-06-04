import type { Config } from 'tailwindcss';

/**
 * Color tokens reference RGB-channel CSS variables so themes can recolor
 * the whole UI by overriding the variables on `<html data-theme="...">`.
 * Each variable is `R G B` (space-separated, no commas) consumed via
 * `rgb(var(--x) / <alpha-value>)` which supports Tailwind's `bg-acid/20` etc.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          50: 'rgb(var(--fg) / <alpha-value>)',
          100: 'rgb(var(--fg) / <alpha-value>)',
          200: 'rgb(var(--text-soft) / <alpha-value>)',
          300: 'rgb(var(--muted) / <alpha-value>)',
          400: 'rgb(var(--muted-2) / <alpha-value>)',
          500: 'rgb(var(--muted-3) / <alpha-value>)',
          800: 'rgb(var(--bg-2) / <alpha-value>)',
          900: 'rgb(var(--bg) / <alpha-value>)',
        },
        acid: {
          DEFAULT: 'rgb(var(--accent-1) / <alpha-value>)',
          dim: 'rgb(var(--accent-1-dim) / <alpha-value>)',
        },
        magenta: {
          DEFAULT: 'rgb(var(--accent-2) / <alpha-value>)',
          dim: 'rgb(var(--accent-2-dim) / <alpha-value>)',
        },
        cyan: {
          DEFAULT: 'rgb(var(--accent-3) / <alpha-value>)',
          dim: 'rgb(var(--accent-3-dim) / <alpha-value>)',
        },
        bone: 'rgb(var(--fg) / <alpha-value>)',
        paper: 'rgb(var(--bg-2) / <alpha-value>)',
      },
      borderRadius: {
        hud: 'var(--radius, 0px)',
        chip: 'var(--radius-chip, 0px)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        pixel: ['var(--font-pixel)', 'var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        'glow-acid':
          '0 0 24px rgb(var(--accent-1) / 0.55), 0 0 4px rgb(var(--accent-1) / 0.9)',
        'glow-magenta':
          '0 0 24px rgb(var(--accent-2) / 0.55), 0 0 4px rgb(var(--accent-2) / 0.9)',
        'glow-cyan':
          '0 0 24px rgb(var(--accent-3) / 0.55), 0 0 4px rgb(var(--accent-3) / 0.9)',
        'inset-hud':
          'inset 0 0 0 1px rgb(var(--accent-1) / 0.35), inset 0 0 40px rgb(var(--accent-1) / 0.06)',
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        grain: 'grain 8s steps(10) infinite',
        scan: 'scan 6s linear infinite',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        flicker: 'flicker 3.5s infinite',
        'hud-in': 'hud-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bar-fill': 'bar-fill 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        tick: 'tick 0.4s steps(8) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        grain: {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-5%,-10%)' },
          '20%': { transform: 'translate(-15%,5%)' },
          '30%': { transform: 'translate(7%,-25%)' },
          '40%': { transform: 'translate(-5%,25%)' },
          '50%': { transform: 'translate(-15%,10%)' },
          '60%': { transform: 'translate(15%,0%)' },
          '70%': { transform: 'translate(0%,15%)' },
          '80%': { transform: 'translate(3%,35%)' },
          '90%': { transform: 'translate(-10%,10%)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        flicker: {
          '0%,18%,22%,25%,53%,57%,100%': { opacity: '1' },
          '20%,24%,55%': { opacity: '0.6' },
        },
        'hud-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        'bar-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(var(--fill, 1))' },
        },
        tick: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-1px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
