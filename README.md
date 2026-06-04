# S3ssn

Automatic work intelligence for software development. Turn real coding activity into work logs, project reports, and client-ready summaries.

## Monorepo layout

```
apps/
  web/         Next.js dashboard
  api/         NestJS backend
  extension/   VS Code extension
packages/
  db/          Prisma schema + client
  types/       Shared TS types
```

## Quick start

```bash
pnpm install
pnpm db:generate
pnpm dev
```

See [S3SSN.md](./S3SSN.md) for the full product spec.
