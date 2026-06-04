import { ReactNode } from 'react';

export function PageHeader({
  section,
  title,
  caption,
  right,
}: {
  section: string;
  title: ReactNode;
  caption?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="border-b hairline px-6 lg:px-10 py-10 flex items-end justify-between gap-6 relative">
      <div>
        <span className="hud-chip mb-3">{section}</span>
        <h1 className="font-display font-extrabold text-[44px] lg:text-[64px] leading-[0.95] tracking-tightest mt-3">
          {title}
        </h1>
        {caption && <p className="mt-4 text-[14px] text-ink-200 max-w-[640px]">{caption}</p>}
      </div>
      {right}
    </div>
  );
}
