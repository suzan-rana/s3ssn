import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * RGB-split glitch via CSS pseudo-elements. The text content must be in
 * `data-text` so the ::before / ::after layers can read it via attr().
 * Pass a plain string for best effect; nested JSX won't replicate cleanly.
 */
export function GlitchText({
  text,
  as: Tag = 'span',
  className,
  children,
}: {
  text: string;
  as?: 'span' | 'h1' | 'h2' | 'h3';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag data-text={text} className={cn('glitch', className)}>
      {children ?? text}
    </Tag>
  );
}
