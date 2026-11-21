# REST API plan

Base: `/api/v1`. Successful JSON: `{data: ...}`. Errors: `{error: {code, message, fields?, requestId?}}`. Empty successful mutations return 204. Every private route checks owner/session independently. Send the exact configured `Origin` and `X-CSRF-Token` for mutations; login requires Origin only. Browser clients use the Next same-origin rewrite.

## Implemented in Phase 1

| Method    | Endpoint                    | Behavior                                                   |
| --------- | --------------------------- | ---------------------------------------------------------- |
| GET       | `/healthz` (outside prefix) | Public process liveness, no private information            |
| POST      | `/auth/login`               | Email/username + password, rate limit, JWT cookie          |
| GET       | `/auth/me`                  | Safe owner profile, settings, session CSRF token           |
| POST      | `/auth/logout`              | Revoke current session, clear cookie                       |
| POST      | `/auth/password`            | Verify current password, replace hash, revoke all sessions |
| GET/PATCH | `/settings`                 | Read/update validated owner preferences                    |
| PATCH     | `/profile`                  | Update display name                                        |
| GET       | `/dashboard`                | Owner-scoped, timezone-aware counts and recent records     |
| GET       | `/notifications`            | Latest 50 owner notifications                              |
| PATCH     | `/notifications/:id`        | `{read: boolean}`; owner scoped                            |
| GET       | `/openapi.json`             | Authenticated generated OpenAPI document                   |

No signup, public reset, or user administration endpoints.

## Planned endpoints (not registered yet)

| Phase | Endpoint families                                                                                 | Operations                                                                 |
| ----- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 2     | `/tasks`, `/tasks/:id/subtasks`, `/tasks/bulk`, `/categories`, `/tags`                            | Validated CRUD, pagination/filter/sort, completion history, recurrence     |
| 2     | `/notes`, `/note-folders`, `/notes/:id/attachments`                                               | CRUD, revision-based autosave, archive/pin, search, structured editor JSON |
| 2     | `/calendar/events`, `/reminders`, `/reminders/:id/snooze`, `/reminders/:id/dismiss`               | Timezone-aware events/recurrence and durable reminders                     |
| 2+    | `/search?q=&cursor=&limit=`                                                                       | Bounded owner-only tasks/notes/projects/bookmarks/files retrieval          |
| 3     | `/ai/conversations`, `/ai/conversations/:id/messages`                                             | Private history and bounded retrieval chat                                 |
| 3     | `/ai/proposals`, `/ai/proposals/:id/confirm`, `/ai/briefing`, `/ai/review`                        | Zod-validated draft plans, explicit single-use approval, summaries         |
| 3     | `/focus-sessions`, `/habits`, `/habits/:id/logs`, `/goals`, `/goals/:id/milestones`, `/analytics` | Sessions, habits, goals and date-bounded aggregation                       |
| 4     | `/expenses`, `/expense-categories`, `/budgets`, `/expenses/export.csv`                            | Decimal transactions, budgets, summaries and CSV                           |
| 4     | `/bookmarks`, `/bookmark-folders`                                                                 | Safe URL CRUD/favorites/search                                             |
| 4     | `/learning-paths`, `/learning-topics`, `/learning-resources`, `/certifications`                   | Learning progress and resources                                            |
| 4     | `/journal`                                                                                        | Private entries/mood/calendar/search                                       |
| 4     | `/projects`, `/projects/:id/milestones`, `/projects/:id/tasks`                                    | Projects, timeline, Kanban and archive                                     |
| 5     | `/files`, `/file-folders`, `/files/:id/access`                                                    | Authenticated uploads, metadata, signed access, reconciled deletion        |
| 6     | `/backup/export`                                                                                  | Manual owner-only JSON export excluding hashes/tokens/provider secrets     |

Collection design: bounded `limit` (default 25, max 100), stable cursor based on indexed `(createdAt,id)`, allowlisted sort and filter fields, and `nextCursor`. Transactions require decimal strings, not JSON floats. Mutations use a client operation id where retries could create duplicates. Future API additions must also appear in OpenAPI and the authentication boundary tests.
