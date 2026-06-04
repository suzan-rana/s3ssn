import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Silkscreen } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { readTheme } from '@/lib/theme.server';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['wdth', 'opsz'],
});
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const pixel = Silkscreen({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'Veyra — automatic work intelligence for software',
  description:
    'Veyra turns real coding activity into automatic work logs, project reports, and client-ready summaries. No screenshots. No keystrokes. No surveillance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = readTheme();
  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${display.variable} ${GeistSans.variable} ${mono.variable} ${pixel.variable}`}
    >
      <body className="font-sans antialiased grain">{children}</body>
    </html>
  );
}
