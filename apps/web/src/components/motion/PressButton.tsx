'use client';

import { ReactNode, MouseEvent, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Anchor wrapped to behave like a button — emits a click ripple at the cursor
 * position. Use for "press start" / primary CTAs that should feel mechanical.
 *
 * Defaults to navigating via the standard <a> click, so server-side links
 * work without JS. Ripple is purely decorative.
 */
export function PressButton({
  href,
  children,
  className,
  pulse = false,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onPress = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const node = document.createElement('span');
      node.className = 'ripple';
      node.style.width = node.style.height = `${size}px`;
      node.style.left = `${e.clientX - rect.left - size / 2}px`;
      node.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(node);
      setTimeout(() => node.remove(), 600);
    }
    onClick?.();
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onPress}
      className={cn('relative overflow-hidden inline-flex items-center', pulse && 'press-pulse', className)}
    >
      {children}
    </a>
  );
}
