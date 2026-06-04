'use client';

import { useState, useTransition } from 'react';
import { updateRepoContext } from '@/app/(app)/repositories/actions';

interface Repo {
  id: string;
  name: string;
  provider: string;
  defaultBranch: string | null;
  createdAt: string;
  context: string | null;
}

const MAX = 1200;

export function RepoRow({ repo }: { repo: Repo }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(repo.context ?? '');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const hasContext = !!repo.context?.trim();
  const dirty = (repo.context ?? '') !== draft;

  const save = () => {
    start(async () => {
      await updateRepoContext(repo.id, draft);
      setSavedAt(Date.now());
    });
  };

  return (
    <div className="border-b hairline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-ink-500/10 transition text-left"
      >
        <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
          {repo.provider.toLowerCase()}
        </div>
        <div className="col-span-5 flex items-center gap-3">
          <span className="font-display text-[20px] tracking-tightest">{repo.name}</span>
          {hasContext && (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-acid border border-acid/40 px-1.5 py-0.5"
              title="Project context set"
            >
              ✓ context
            </span>
          )}
        </div>
        <div className="col-span-3 text-[12px] text-acid font-mono">
          {repo.defaultBranch ?? '—'}
        </div>
        <div className="col-span-2 text-[12px] text-ink-300 truncate">
          {hasContext ? (
            <span>{repo.context}</span>
          ) : (
            <span className="italic opacity-60">no project context</span>
          )}
        </div>
        <div className="col-span-1 text-right flex items-center justify-end gap-2 font-mono text-[10px] text-ink-300 tnum">
          <span>{new Date(repo.createdAt).toISOString().slice(0, 10)}</span>
          <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 bg-ink-500/5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
              Project context · optional
            </div>
            <div className="font-mono text-[10px] text-ink-300 tnum">
              {draft.length} / {MAX}
            </div>
          </div>
          <p className="text-[12px] text-ink-300 mb-3 max-w-[640px]">
            Describe what this repo does, the audience, and any context that helps the AI write
            better work notes from your commit messages — e.g. "S3ssn web frontend (Next.js). Audience: developer
            users. Focus areas: HUD, quests, theming."
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
            placeholder="What is this repo? Who is it for? Anything the AI should know when summarising your week's commits."
            rows={5}
            className="w-full font-mono text-[13px] p-3 border hairline bg-bg/50 focus:outline-none focus:border-acid resize-y"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="font-mono text-[10px] text-ink-300">
              {pending
                ? 'Saving…'
                : savedAt
                ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : dirty
                ? 'Unsaved changes'
                : 'Up to date'}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(repo.context ?? '');
                  setOpen(false);
                }}
                className="font-mono text-[11px] px-3 py-1.5 border hairline hover:bg-ink-500/15"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || pending}
                className="font-mono text-[11px] px-3 py-1.5 bg-acid text-ink disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pending ? 'Saving…' : 'Save context'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
