# Architecture

```
┌──────────────────────┐      batch events       ┌──────────────────────┐
│  VS Code extension   │  ───────────────────▶   │   NestJS API (/v1)    │
│  apps/extension      │   POST /activity/batch  │   apps/api            │
└──────────────────────┘                          │                       │
            ▲                                     │   ┌──────────────┐   │
            │ JWT (paste flow)                    │   │  Prisma      │   │
            │                                     │   │  packages/db │   │
            │                                     │   └──────┬───────┘   │
            ▼                                     │          │           │
┌──────────────────────┐      JSON over HTTPS    │   ┌──────▼───────┐   │
│  Next.js dashboard   │ ◀───────────────────────┤   │  Postgres    │   │
│  apps/web            │     /v1/reports/today   │   └──────────────┘   │
└──────────────────────┘                          │   ┌──────────────┐   │
                                                  │   │  Redis +     │   │
                                                  │   │  BullMQ      │   │
                                                  │   └──────────────┘   │
                                                  └──────────────────────┘
                                                            ▲
                                                            │ webhooks
                                                            │
                                                      ┌─────┴──────┐
                                                      │  GitHub    │
                                                      └────────────┘
```

## Data flow

1. **Capture** — the VS Code extension emits typed events (`HEARTBEAT`, `EDIT`, `FOCUS`,
   `BLUR`, `IDLE`, `BRANCH_SWITCH`, `FILE_OPEN`, `FILE_SAVE`, `PAUSE`, `RESUME`). It buffers in
   memory and flushes every `flushIntervalSeconds`.
2. **Ingest** — `POST /v1/activity/batch` upserts repositories on the fly (keyed by
   `remoteUrlHash`) and bulk-inserts `ActivityEvent` rows.
3. **Sessionize** — `POST /v1/sessions/rebuild` (or a background BullMQ job) groups events
   into `CodingSession` rows. Branch switches or idle gaps > 5 min cut a session.
4. **Sync Git** — GitHub OAuth pulls repos, commits, PRs. Webhooks keep them fresh.
5. **Attribute** — `CommitSessionLink` rows are written with a 0–1 confidence score derived
   from repo + branch + author + recency + language match (VEYRA.md §11). Auto-link at ≥ 0.60.
6. **Report** — `/v1/reports/today` and `/v1/reports/weekly` aggregate sessions, commits, and
   PRs into the shapes the dashboard renders.

## Privacy boundary

The extension only reads:

- `editor.document.uri` (used to find the matching git repo root)
- `editor.document.languageId`
- git API: branch name + remote URL → hashed
- focus/idle signals from `vscode.window.onDidChangeWindowState`

It **never** reads:

- file contents
- selection text
- terminal output
- clipboard
- environment variables

`detectRepoContext` returns only `{ branch, remoteUrlHash, name }`. Anywhere that emits an
event passes through `enqueue`, which respects the `veyra.excludedRepos` allowlist.
