# Deployment runbook (not yet executed)

## Neon

1. Provision a private PostgreSQL database. Obtain pooled runtime and direct migration URLs with TLS enabled.
2. Store `DATABASE_URL` and `DIRECT_URL` in the backend host's secrets, never source control. Run `npm run db:generate` and `npm run db:migrate` in an authorized release job.
3. Run `owner:setup` once from a trusted host using environment variables. Remove the temporary password environment variable afterward. Keep database recovery access separate from daily app access.
4. Enable Neon backups/PITR according to the chosen plan before storing irreplaceable personal data. Manual application export is Phase 6.

## Railway or Render backend

- Deploy the repository with Node 22.12+ and root installation so npm workspaces resolve correctly.
- Install/build: `npm ci && npm run build -w backend`.
- Start: `npm run start -w backend`.
- Environment: `NODE_ENV=production`, `HOST=0.0.0.0`, platform PORT, exact HTTPS `APP_ORIGIN`, pooled database URL and a strong JWT_SECRET. The migration release step additionally needs DIRECT_URL.
- Health path `/healthz` is liveness, not an authorization bypass. Startup connects to PostgreSQL and fails on an unreachable DB. Monitor database/API errors separately.
- Do not blindly set `trustProxy=true`. Set TRUST_PROXY only to the deployment's verified proxy ranges/addresses; otherwise forwarded IPs can bypass rate limiting. On a proxy with no trustworthy original IP, keep the stricter shared-IP limit for this single-owner app.
- Start with one API replica. Before scaling out, provide a shared rate-limit store. The account failure lock and sessions already persist in PostgreSQL.
- Graceful SIGTERM closes Fastify and the Prisma pool. Enable restart-on-failure and collect sanitized application logs.

## Vercel frontend

- Import the same repository, framework Next.js, root directory `frontend`; enable access to workspace packages outside the root if needed. Alternatively install at monorepo root then build the frontend workspace.
- Set server-only `API_INTERNAL_URL=https://your-backend-host`. Do not use a NEXT_PUBLIC variable.
- Use a stable frontend domain; configure that exact origin in Fastify APP_ORIGIN. All browser requests must go through `/api/v1` on that domain so the host-only session cookie works. Do not have browsers call the backend directly across unrelated sites.
- Redeploy after changing the rewrite target (Next rewrites are build configuration).
- Use HTTPS. Verify the `__Host-taskmate` cookie is Secure, HttpOnly, Path=/, SameSite=Strict and has no Domain.
- Production Next CSP currently allows inline bootstrap scripts; Phase 6 should introduce nonce/hashes before the final security signoff.

## Post-deploy acceptance

1. Unauthenticated `/dashboard` redirects to login; private API and OpenAPI requests return 401.
2. Invalid origins/CSRF tokens return 403. Generic credential failures do not reveal account existence.
3. Login works through the Vercel rewrite. Update profile and timezone, reload, and verify persistence.
4. Copy a session cookie in a controlled test, log out, and verify it can no longer access the API. Repeat after password change/recovery.
5. Confirm logs contain no passwords, cookies, request bodies, provider keys or private content.
6. Check mobile keyboard/navigation and light/dark theme contrast. Run Phase 1 browser tests against a staging origin.

## Later service configuration

- **Gemini (Phase 3):** backend API key and explicit model configuration; bounded retrieval, rate limits, structured validation, consent and confirmation before mutations. Provider access is not tested yet.
- **Cloudinary (Phase 5):** cloud name/API key/API secret on backend only; authenticated/private assets and signed delivery, document-format checks, reconciliation. Do not expose sensitive uploads as public assets.
- **SMTP (Phase 2):** host/port/user/password/from; verify sender and TLS. Never claim delivery without provider acceptance.
- **Scheduler (Phase 2):** independent worker or managed scheduler using the durable database reminder/outbox model. Browser timers are not a reminder delivery mechanism. Provide crash recovery and duplicate-delivery monitoring.

No cloud service provisioning or publishing was performed for this phase.
