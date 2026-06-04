'use client';

import { useState, useTransition } from 'react';
import {
  generateSessionSummary,
  saveSessionSummary,
} from '@/app/(app)/today/actions';

interface Props {
  sessionId: string;
  initialSummary: string | null;
  initialSource: string | null;
  initialEditedAt: string | null;
}

const MAX = 1200;

function sourceLabel(src: string | null) {
  if (src === 'user') return 'YOU';
  if (src === 'llm') return 'AI';
  if (src === 'rule') return 'AUTO';
  return '';
}

export function SessionSummary({
  sessionId,
  initialSummary,
  initialSource,
  initialEditedAt,
}: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [source, setSource] = useState(initialSource);
  const [editedAt, setEditedAt] = useState(initialEditedAt);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialSummary ?? '');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onGenerate = () => {
    setError(null);
    start(async () => {
      try {
        const r = await generateSessionSummary(sessionId);
        setSummary(r.summary);
        setSource(r.source);
        setEditedAt(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate');
      }
    });
  };

  const onSave = () => {
    setError(null);
    start(async () => {
      try {
        await saveSessionSummary(sessionId, draft);
        setSummary(draft.trim() || null);
        setSource(draft.trim() ? 'user' : null);
        setEditedAt(draft.trim() ? new Date().toISOString() : null);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save');
      }
    });
  };

  const onEdit = () => {
    setDraft(summary ?? '');
    setEditing(true);
  };

  const empty = !summary?.trim();

  return (
    <section className="px-6 py-5 border-b hairline">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-300">
            Work-log entry
          </div>
          {source && !editing && (
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 border ${
                source === 'user'
                  ? 'border-acid/50 text-acid'
                  : source === 'llm'
                  ? 'border-cyan/50 text-cyan'
                  : 'border-ink-300/40 text-ink-300'
              }`}
            >
              {sourceLabel(source)}
            </span>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-2">
            {!empty && (
              <button
                type="button"
                onClick={onEdit}
                className="font-mono text-[11px] px-2.5 py-1 border hairline hover:bg-ink-500/15"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onGenerate}
              disabled={pending}
              className="font-mono text-[11px] px-2.5 py-1 border border-acid/40 text-acid hover:bg-acid/10 disabled:opacity-50"
            >
              {pending ? 'Generating…' : empty ? 'Generate with AI' : 'Regenerate'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
            rows={4}
            placeholder="Write your own work-log entry…"
            className="w-full font-mono text-[13px] p-3 border hairline bg-bg/40 focus:outline-none focus:border-acid resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="font-mono text-[10px] text-ink-300 tnum">
              {draft.length} / {MAX}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(summary ?? '');
                }}
                className="font-mono text-[11px] px-3 py-1.5 border hairline hover:bg-ink-500/15"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={pending}
                className="font-mono text-[11px] px-3 py-1.5 bg-acid text-ink disabled:opacity-40"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : empty ? (
        <p className="text-[13px] text-ink-300 italic">
          No work-log entry yet. Generate one from commits or write your own.
        </p>
      ) : (
        <>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{summary}</p>
          {editedAt && source === 'user' && (
            <div className="mt-2 font-mono text-[10px] text-ink-300">
              Edited {new Date(editedAt).toLocaleString()}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mt-2 font-mono text-[11px] text-magenta">{error}</div>
      )}
    </section>
  );
}
