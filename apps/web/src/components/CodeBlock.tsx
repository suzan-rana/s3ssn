import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Minimal hand-rolled syntax accent. Not a real tokenizer — just colours strings,
 * comments, and a few keywords so a code-shaped block on the landing page reads
 * like code instead of pasted text. Keeps zero runtime deps.
 */
export function CodeBlock({
  language = 'ts',
  filename,
  children,
  className,
}: {
  language?: string;
  filename?: string;
  children: string;
  className?: string;
}) {
  const lines = children.replace(/\n+$/, '').split('\n');
  return (
    <div className={cn('hud-panel scanlines overflow-hidden', className)}>
      <header className="flex items-center justify-between px-4 py-2 border-b hairline bg-ink-800/80">
        <span className="font-mono text-[11px] text-ink-300 truncate">
          {filename ?? `inline.${language}`}
        </span>
        <span className="font-pixel text-[9px] uppercase tracking-[0.18em] text-acid">
          {language.toUpperCase()}
        </span>
      </header>
      <pre className="overflow-x-auto text-[12.5px] leading-[1.6] font-mono py-4">
        {lines.map((line, i) => (
          <div key={i} className="grid grid-cols-[3rem_1fr] gap-3 px-4 hover:bg-acid/5">
            <span className="text-ink-500 text-right tnum select-none">{i + 1}</span>
            <code dangerouslySetInnerHTML={{ __html: tint(line) }} />
          </div>
        ))}
      </pre>
    </div>
  );
}

function tint(line: string): string {
  // Order matters: comments first, then strings, then keywords/types/numbers.
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let out = escape(line);
  // Comments
  out = out.replace(/(\/\/.*$)/g, '<span style="color:#54514a">$1</span>');
  // Strings
  out = out.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, '<span style="color:#c4ff3d">$1</span>');
  // Keywords
  out = out.replace(
    /\b(const|let|var|function|return|import|from|export|async|await|interface|type|enum|class|extends|implements|new|if|else|for|of|in|true|false|null|undefined)\b/g,
    '<span style="color:#ff2e88">$1</span>',
  );
  // Built-in TS types
  out = out.replace(
    /\b(string|number|boolean|Date|Promise|Record|Array|void)\b/g,
    '<span style="color:#3df0ff">$1</span>',
  );
  // Numbers
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#f5f3ee">$1</span>');
  return out;
}
