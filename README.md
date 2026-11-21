# TaskMate AI

Private single-owner productivity workspace. **Phase 1 foundation is implemented; this is not the completed 12-module production release.** See [phase report](docs/PHASE_1.md), [architecture](docs/ARCHITECTURE.md), [model plan](docs/MODEL_PLAN.md) and [API plan](docs/API_PLAN.md).

Implemented: Next.js glass dashboard shell, login/logout, owner setup/recovery, short-lived revocable sessions, CSRF/origin protection, password changes, profile/preferences, database-backed dashboard summaries and notification inbox. Dashboard source tables start empty. Upcoming navigation items show the roadmap; they do not pretend to be complete modules.

## Requirements

- Node.js 22.12+ (tested with 22.16) and npm.
- A Neon PostgreSQL database (or local PostgreSQL for development).
- Backend and frontend environment files populated locally. Never paste credentials into chat or commit them.

## Install

From this directory:

```powershell
npm ci
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Edit `backend/.env`: pooled `DATABASE_URL`, direct `DIRECT_URL`, exact `APP_ORIGIN=http://localhost:3000`, and a generated `JWT_SECRET`. Generate the secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Neon strings should include `sslmode=require`. Do not disable certificate validation. Prisma 7 reads the migration URL from `backend/prisma.config.ts`; its runtime uses `@prisma/adapter-pg` with a small pool. The direct URL is used by migration jobs, the pooled URL by the API.

```powershell
npm run db:generate
npm run db:migrate
```

Set `OWNER_EMAIL`, `OWNER_USERNAME`, `OWNER_NAME`, and `OWNER_PASSWORD` in the trusted backend environment temporarily. Passwords must be at least 12 characters and at most 72 UTF-8 bytes. Then:

```powershell
npm run owner:setup
```

Setup refuses to replace an existing owner; the database also disallows a second owner. Remove `OWNER_PASSWORD` afterward. No demo user is seeded.

```powershell
npm run dev
```

Open [localhost:3000](http://localhost:3000). Fastify listens at 127.0.0.1:4000; browser API calls go through the frontend rewrite. Use the same frontend hostname as APP_ORIGIN (localhost and 127.0.0.1 are different origins). Sign in with your owner email/username and password. Sessions expire after 15 minutes by default.

### Windows npm shim troubleshooting

If this machine's `npm` command points to a missing roaming install, use the real npm CLI rather than altering global machine configuration:

```powershell
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' ci
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run dev -w backend
# A second terminal:
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run dev -w frontend
```

## Verification

```powershell
npm run db:generate
npm run typecheck
npm test
npm run build
cd frontend
npx playwright test
```

Backend tests use Fastify inject with a test-only isolated auth repository. Migration tests execute the checked-in SQL in embedded PostgreSQL (PGlite), exercising singleton ownership, foreign keys and exact Decimal sums. These checks do not prove Neon connectivity or production infrastructure. Playwright tests use the installed Microsoft Edge headless browser, a test-only Fastify fixture and a real Next dev server; no test credentials or fake responses are imported into production. The Phase 3 AI proposal end-to-end flow is not implemented yet.

If Edge is unavailable, install Playwright Chromium and set `channel` to `chromium` in the test config. Test artifacts live in ignored `frontend/test-results` and `frontend/playwright-report`.

The authenticated OpenAPI document is available at `/api/v1/openapi.json` after login. Future modules will extend it with complete request/response contracts.

## Owner recovery

On a trusted backend machine, set the existing owner's email, username/name and a new password through environment variables, then:

```powershell
npm run owner:recover
```

Recovery checks the existing owner's email, replaces the hash and revokes every session transactionally. It does not create a new owner. Remove `OWNER_PASSWORD` afterward. There is deliberately no public password-reset or registration API.

## External services

The environment template lists Gemini, Cloudinary and SMTP keys for future phases. **They are not wired or tested in Phase 1.** Their absence does not trigger fake results. Do not set these credentials until implementing the corresponding phase. Provider secrets belong only on the backend; never use `NEXT_PUBLIC_` for secrets.

## Deployment

Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md). This phase has not been deployed to Vercel/Railway/Render/Neon. Account access, database URLs and owner credentials are required for a real deployment. The old Macha Sites URL remains a separate static app; it does not serve TaskMate AI or share its data.

## Next delivery

Phase 2 adds complete task and note workflows, calendar scheduling, durable reminders and dashboard integration, including module tests. Phase 3 brings AI confirmation workflows and productivity tracking. The remaining phases are documented; no module is silently considered finished.
