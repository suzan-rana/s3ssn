# Getting started

Caveman version. Read [S3SSN.md](../S3SSN.md) for the long form.

## 0. Prereqs

- Node 20+
- pnpm 9
- Docker (for Postgres + Redis)

## 1. Install

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

## 2. Infra up

```bash
docker compose up -d
```

## 3. Database

```bash
pnpm db:generate
pnpm db:push           # first time
# pnpm db:migrate dev  # if creating a real migration
```

## 4. Run

```bash
pnpm dev               # runs web (:3000) + api (:4000) + extension watch
```

Visit `http://localhost:3000`.

## 5. Extension

```bash
cd apps/extension
# open in VS Code, press F5 to launch Extension Development Host
```

Sign in via the `S3ssn: Sign in` command — paste a JWT obtained from the API's `POST /v1/auth/login`.

## 6. Smoke test the API

```bash
curl http://localhost:4000/v1/health
```

## Acceptance criteria (S3SSN.md §17)

The MVP is complete when each of the 15 acceptance checks passes. The scaffold covers items
1–8 structurally; 9–14 require the sessionizer + attribution + reports wiring (skeletons present
under `apps/api/src/modules`). Item 15 (never collect code / screenshots / keystrokes) is
enforced at the extension boundary in `apps/extension/src/tracker.ts` — the extension reads only
context metadata.
