# ARCHITECTURE.md — 3F Enterprises

## 1. Overview

A server-rendered + client-interactive **Next.js (App Router)** application in
**TypeScript strict mode**, backed by **Supabase** (PostgreSQL + Auth +
Storage), deployed on **Vercel**, installable as a **PWA**.

The guiding principle: **the database is the source of truth and the last line
of defense.** Authorization (RLS), money math, inventory balances, and posting
idempotency are enforced in PostgreSQL, not merely in the UI.

```
┌────────────────────────────────────────────────────────────────┐
│ Client (browser / installed PWA)                                │
│  - React Server/Client Components (Next.js App Router)          │
│  - shadcn/ui + Tailwind                                          │
│  - Supabase browser client (anon key, RLS-scoped)              │
│  - Barcode scanning (camera + keyboard-wedge), offline drafts   │
└───────────────▲───────────────────────────┬────────────────────┘
                │                            │
        RSC / Route Handlers          Realtime/Storage
                │                            │
┌───────────────┴────────────────────────────▼───────────────────┐
│ Next.js server (Vercel)                                         │
│  - Server Components, Route Handlers, Server Actions            │
│  - Supabase server client (per-request, user session)          │
│  - Domain services (inventory, accounting, tax, numbering)     │
│  - Input validation (Zod) at every trust boundary              │
└───────────────────────────────▲────────────────────────────────┘
                                 │ SQL (RLS enforced)
┌────────────────────────────────┴───────────────────────────────┐
│ Supabase PostgreSQL                                            │
│  - Tables with RLS policies, numeric money/qty types           │
│  - Postgres functions for atomic postings (movements/journals) │
│  - Triggers for audit + updated_at                             │
│  - Auth schema, Storage buckets                                │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Layering

1. **Presentation** — React components (server + client). No business logic;
   they call services / server actions and render results.
2. **Application services** (`src/services/`) — orchestration: validate input,
   call domain logic / DB functions inside transactions, shape results.
3. **Domain logic** — pure, testable functions for unit conversion, pricing
   resolution, tax computation, double-entry posting rules.
4. **Data / persistence** — Supabase clients + Postgres functions. Atomic,
   multi-row postings (inventory movements, journal entries) are implemented as
   **Postgres functions** invoked transactionally so idempotency and balance
   checks live next to the data.

> **Business logic stays out of components.** Reusable services are mandatory
> for **inventory, accounting, taxes and document numbering**.

## 3. Supabase clients (three contexts)

- **Browser client** — anon/public key, used in client components; every query
  is constrained by RLS.
- **Server client** — created per request from the user's session
  (cookies/headers); used in Server Components, Route Handlers, Server Actions.
- **Middleware** — refreshes the Supabase session and guards protected route
  groups.

The **service-role key is never shipped to the browser.** It is used only in
trusted server-side admin paths (e.g. user invitation, migrations) and read
from server-only environment variables.

## 4. Routing model

- **Route groups** separate public/auth routes from protected app routes, e.g.
  `(auth)` for login/reset and `(app)` for the authenticated shell.
- The protected group renders the application shell (sidebar, top bar,
  breadcrumbs) and hosts module routes.
- Middleware redirects unauthenticated users away from `(app)`.
- Fine-grained, permission-based authorization is enforced both server-side and
  by RLS (full role permissions land in Stage 2).

## 5. Critical services

| Service                        | Responsibility                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inventory service**          | Post immutable movements inside transactions; compute balances; enforce unique posting keys; open-roll logic; never edit balances directly. |
| **Accounting service**         | Build balanced double-entry journals from source documents; post immutably; reversals/adjustments only.                                     |
| **Tax service**                | VAT (input/output, exempt/zero-rated) and withholding computations, in decimal.                                                             |
| **Document numbering service** | Per-branch, per-document-type sequence allocation (PO, invoice, OR, etc.) without gaps/races.                                               |
| **Pricing service**            | Resolve price (standard → tier → customer-specific → manual override) and record override audit.                                            |

## 6. Money & numeric strategy

- DB columns for money/quantity are **`numeric`** with a documented scale.
- The application treats money as **decimal**, not float. Final calculations are
  performed in SQL / Postgres functions, or via a decimal-safe representation —
  never via raw JS floating point.
- See `DATABASE_PLAN.md` §"Numeric conventions".

## 7. Concurrency & idempotency

- Inventory and accounting postings run in **DB transactions**.
- Each posting carries a **unique posting key** (e.g. `source_doc_type +
source_doc_id + line + device_ref`) with a unique constraint, so retries and
  offline re-sync cannot double-post.
- Balance reads are computed from movements (optionally materialized in a
  balances table maintained only by the movement-posting function).

## 8. Offline / PWA

- Service worker for installability and asset caching (foundation in Stage 1,
  hardened in Stage 15).
- Scanning/receiving can capture **drafts offline**; on reconnect they sync
  using the unique posting key so re-sends are safe.

## 9. Internationalization

- A translation dictionary structure (English + Tagalog) under `src/i18n/`.
- Components reference keys, never literal user-facing strings.

## 10. Observability & testing

- Unit tests for domain logic (conversion, pricing, tax, posting rules).
- Integration tests for services against a test database.
- E2E tests for critical flows.
- See `TESTING_STRATEGY.md`.

## 11. Proposed folder structure

```
/
├─ CLAUDE.md
├─ docs/
│  ├─ PRODUCT_REQUIREMENTS.md
│  ├─ ARCHITECTURE.md
│  ├─ DATABASE_PLAN.md
│  ├─ SECURITY_PLAN.md
│  ├─ DEVELOPMENT_STAGES.md
│  ├─ DECISIONS.md
│  └─ TESTING_STRATEGY.md
├─ legacy/                      # existing Pastel Finance Tracker (see ADR-0001)
├─ public/                      # PWA manifest, icons, static assets
├─ supabase/
│  └─ migrations/               # SQL migrations (from Stage 2)
├─ src/
│  ├─ app/
│  │  ├─ (auth)/                # login, reset, etc.
│  │  ├─ (app)/                 # protected shell + module routes
│  │  └─ api/                   # route handlers
│  ├─ components/               # shared UI (shadcn/ui wrappers, shell)
│  ├─ services/                 # inventory, accounting, tax, numbering, pricing
│  ├─ domain/                   # pure domain logic (no I/O)
│  ├─ lib/
│  │  ├─ supabase/              # browser/server/middleware clients
│  │  └─ validation/            # Zod schemas
│  ├─ i18n/                     # en + tl dictionaries
│  └─ types/                    # shared TypeScript types
├─ tests/                       # unit / integration / e2e
├─ .env.example
└─ package.json
```

> The folder structure is a **plan**. Stage 1 scaffolds it; nothing here is
> created in Stage 0.
