# Veyra — Automatic Work Intelligence

Turn your real coding activity into XP, levels, streaks, and an automatic work log.
Never reads your code, keystrokes, or screen.

## What it does

- Captures focused coding **context** — repo, branch, language, focus — while you work.
- Detects local commits the moment they land and sends the message + sha to your dashboard.
- Pause/resume from the status bar at any time.

## What it never does

- ❌ No source code
- ❌ No keystrokes
- ❌ No screenshots
- ❌ No terminal output
- ❌ No clipboard
- ❌ No browser history
- ❌ No environment variables

The extension boundary is the privacy contract. Read [`tracker.ts`](src/tracker.ts).

## Setup

1. Create an account at <https://veyra.app/signup>.
2. Install this extension.
3. Run **Veyra: Sign in** from the command palette and paste the token from your dashboard.
4. Code as usual. Open <https://veyra.app/dashboard> to see your HUD fill in.

## Commands

| Command | What it does |
| --- | --- |
| `Veyra: Sign in` | Paste your dashboard token to authenticate. |
| `Veyra: Sign out` | Forget the token on this machine. |
| `Veyra: Pause tracking` | Stop emitting events until you resume. |
| `Veyra: Resume tracking` | Resume after a pause. |
| `Veyra: Show status` | Display current state + buffered event count. |
| `Veyra: Open dashboard` | Open the web dashboard. |

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `veyra.apiBaseUrl` | `http://localhost:4000/v1` | API endpoint. Point at your self-hosted instance or `https://api.veyra.app/v1`. |
| `veyra.idleThresholdSeconds` | `120` | Seconds with no activity before a session is considered idle. |
| `veyra.heartbeatIntervalSeconds` | `30` | How often to record a heartbeat while active. |
| `veyra.flushIntervalSeconds` | `60` | How often to flush batched events to the backend. |
| `veyra.excludedRepos` | `[]` | Repo remote hashes to never track. |

## License

MIT
