# S3ssn — Automatic Work Intelligence

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

1. Create an account at <https://s3ssn.app/signup>.
2. Install this extension.
3. Run **S3ssn: Sign in** from the command palette and paste the token from your dashboard.
4. Code as usual. Open <https://s3ssn.app/dashboard> to see your HUD fill in.

## Commands

| Command | What it does |
| --- | --- |
| `S3ssn: Sign in` | Paste your dashboard token to authenticate. |
| `S3ssn: Sign out` | Forget the token on this machine. |
| `S3ssn: Pause tracking` | Stop emitting events until you resume. |
| `S3ssn: Resume tracking` | Resume after a pause. |
| `S3ssn: Show status` | Display current state + buffered event count. |
| `S3ssn: Open dashboard` | Open the web dashboard. |

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `s3ssn.apiBaseUrl` | `http://localhost:4000/v1` | API endpoint. Point at your self-hosted instance or `https://api.s3ssn.app/v1`. |
| `s3ssn.idleThresholdSeconds` | `120` | Seconds with no activity before a session is considered idle. |
| `s3ssn.heartbeatIntervalSeconds` | `30` | How often to record a heartbeat while active. |
| `s3ssn.flushIntervalSeconds` | `60` | How often to flush batched events to the backend. |
| `s3ssn.excludedRepos` | `[]` | Repo remote hashes to never track. |

## License

MIT
