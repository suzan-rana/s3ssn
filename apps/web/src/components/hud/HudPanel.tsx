import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function HudPanel({
  label,
  right,
  children,
  className,
  glow = false,
}: {
  label: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <section
      className={cn(
        'hud-panel scanlines animate-hud-in',
        glow && 'scan-sweep',
        className,
      )}
    >
      <header className="flex items-center justify-between px-4 py-2 border-b hairline">
        <span className="hud-chip">
          <span className="w-1.5 h-1.5 bg-acid inline-block animate-pulse-soft" />
          {label}
        </span>
        {right}
      </header>
      <div className="p-4 lg:p-6">{children}</div>
    </section>
  );
}
