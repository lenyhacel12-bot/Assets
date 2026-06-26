# 3F Enterprises — Inventory, Sales & Accounting

A multi-branch inventory, sales and accounting web application for **3F
Enterprises** (Manila, Cebu, Pampanga, Antipolo).

> **Project status:** Foundation (Stage 1). The application shell, tooling and
> infrastructure are in place; business modules are placeholders built in later
> stages. See [`docs/DEVELOPMENT_STAGES.md`](docs/DEVELOPMENT_STAGES.md) for the
> full 16-stage plan and [`CLAUDE.md`](CLAUDE.md) for the engineering rules.
>
> The previous "Pastel Finance Tracker" prototype has been moved to
> [`legacy/`](legacy/) (see `docs/DECISIONS.md` ADR-0001).

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui ·
Supabase (Postgres / Auth / Storage) · Vitest · Playwright · PWA.

## Prerequisites

- Node.js 20+ (developed on Node 22)
- npm 10+
- A Supabase project (for auth/data — wired from Stage 2)

## Environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.example .env.local
```

| Variable                        | Scope           | Purpose                                            |
| ------------------------------- | --------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | public          | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public          | Supabase anon key (RLS-scoped)                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | **server-only** | Privileged admin tasks (never sent to the browser) |

Variables are validated lazily by [`src/lib/env.ts`](src/lib/env.ts); code paths
that need Supabase throw a clear, actionable error if configuration is missing.

### Supabase setup (summary)

1. Create a project at <https://supabase.com>.
2. From **Project Settings → API**, copy the **Project URL** and **anon public**
   key into `.env.local`.
3. Keep the **service_role** key server-side only (do not prefix it with
   `NEXT_PUBLIC_`). It is unused until later stages.
4. Database migrations and seed data arrive from **Stage 2**
   (`supabase/migrations/`).

## Local development

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:3000
```

Without Supabase configured (or without a session), protected routes redirect to
`/login`. To **preview the app shell** before Stage 2 wires real auth, set the
server-only dev flag (non-production only):

```bash
DEV_PREVIEW=1 npm run dev
```

## Commands

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the development server              |
| `npm run build`        | Production build                          |
| `npm run start`        | Start the production server (after build) |
| `npm run lint`         | ESLint                                    |
| `npm run typecheck`    | TypeScript type-check (no emit)           |
| `npm run format`       | Prettier write                            |
| `npm run format:check` | Prettier check                            |
| `npm test`             | Unit tests (Vitest)                       |
| `npm run test:watch`   | Unit tests in watch mode                  |
| `npm run test:e2e`     | End-to-end tests (Playwright)             |

### Notes on tests

- **Unit tests** live in `tests/unit/` (jsdom). They cover env validation,
  route-protection logic, the navigation map, i18n parity, and shell rendering.
- **E2E tests** live in `tests/e2e/` and boot the production server with
  placeholder public env vars. In sandboxes where Playwright's bundled browser
  is unavailable, point it at a local Chromium:
  `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e`. Locally, run
  `npx playwright install` once instead.

## Project structure

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full layout. In brief:

```
src/app/            App Router routes — (auth) public group, (app) protected shell
src/components/     UI primitives (ui/) and the application shell (shell/)
src/config/         Navigation map
src/i18n/           English + Tagalog dictionaries and provider
src/lib/            env validation, utils, Supabase clients, auth helpers
tests/              unit/ (Vitest) and e2e/ (Playwright)
docs/               Planning and decision records
legacy/             Archived Pastel Finance Tracker prototype
```

## Internationalization

UI text is keyed through `src/i18n` (English + Tagalog). Do **not** hard-code
user-facing strings in components — add keys to `src/i18n/en.ts` and
`src/i18n/tl.ts` (key parity is enforced by a unit test).
