'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  section: string;
  glyph: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const grouped = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {});

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="flex-1 py-4 px-2 space-y-5 overflow-y-auto">
      {Object.entries(grouped).map(([section, sectionItems]) => (
        <div key={section}>
          <div className="px-3 mb-2 font-pixel text-[9px] uppercase tracking-[0.24em] text-ink-300">
            {section}
          </div>
          <ul>
            {sectionItems.map((it) => {
              const active = isActive(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'relative flex items-center gap-2 px-3 py-1.5 text-[13px] transition-colors',
                      active
                        ? 'text-acid bg-acid/10 font-semibold'
                        : 'text-ink-200 hover:text-acid hover:bg-acid/5',
                    ].join(' ')}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1 bottom-1 w-[2px] bg-acid"
                        style={{ boxShadow: '0 0 8px rgb(var(--accent-1) / 0.7)' }}
                      />
                    )}
                    <span
                      className={`text-[10px] w-3 ${active ? 'text-acid' : 'text-acid/60'}`}
                    >
                      {it.glyph}
                    </span>
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
