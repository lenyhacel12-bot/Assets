# DECISIONS.md — Architectural Decision Records (ADRs)

Each ADR captures a decision, its context, and consequences. New decisions are
appended; superseded ones are marked, not deleted.

Status legend: **Accepted** · **Proposed** · **Open** (decision deferred) ·
**Superseded**.

---

## ADR-0001 — Disposition of the existing "Pastel Finance Tracker"

**Status:** Accepted (Stage 0)

**Context.** The repository at Stage 0 contains an unrelated single-page
"Pastel Finance Tracker" (`index.html`, `style.css`, `app.js`, `README.md`) — a
vanilla HTML/CSS/JS personal-finance app using `localStorage` and CDN libraries
(Chart.js, SheetJS). It shares **no** code, data model, or purpose with the 3F
Enterprises system.

**Decision.** Do **not** delete it in Stage 0 (the rules forbid deleting working
files without explanation, and no replacement exists yet). When Stage 1
scaffolds the Next.js app, the existing files will be **moved into `legacy/`**
(or removed if the owner confirms it is disposable), so they do not collide with
the new app's `index`/build. The 3F README will replace the current README at
that point.

**Consequences.** Stage 0 leaves the existing files in place and untouched.
Stage 1 must explicitly address them (move to `legacy/`) and record the action.

**Update (Stage 1):** Done. `index.html`, `style.css`, `app.js` and the old
`README.md` were moved under `legacy/` via `git mv`, and a new root `README.md`
documents the 3F Enterprises app. The `legacy/` folder is excluded from the
Next.js build, ESLint, Prettier and test surfaces.

---

## ADR-0002 — Framework & platform

**Status:** Accepted

**Decision.** Next.js (App Router) + TypeScript strict + Tailwind + shadcn/ui,
on Supabase (Postgres/Auth/Storage), deployed to Vercel, as a PWA. Use current
stable, mutually compatible versions; no unrelated dependency upgrades without a
recorded reason.

**Consequences.** Server-first rendering with RLS-backed data access; aligns
auth/session with Supabase middleware.

---

## ADR-0003 — Money and quantities use database decimals, never JS floats

**Status:** Accepted

**Decision.** All money/quantity columns are Postgres `numeric` with documented
scale (`DATABASE_PLAN.md`). Final financial/stock calculations are performed in
SQL / Postgres functions or a decimal-safe representation — never raw JS
floating point.

**Consequences.** Posting logic gravitates to the database; the app passes
values as strings/decimals to avoid float coercion.

---

## ADR-0004 — Stock balances are derived from immutable movements

**Status:** Accepted

**Decision.** The authoritative stock record is the append-only
`inventory_movements` ledger. A `inventory_balances` cache is maintained **only**
by the movement-posting function. No code path edits balances directly.

**Consequences.** Corrections are new movements (adjustments). A roll-cut, a
return, a transfer — all are movements. Enables full traceability and audit.

---

## ADR-0005 — Idempotent postings via a unique posting key

**Status:** Accepted

**Decision.** Every inventory movement and journal entry carries a **unique
posting key** (composite of source doc type/id/line and, when offline, a device
reference) with a unique constraint. Re-sends and retries are no-ops.

**Consequences.** Prevents double stock deduction and duplicate journals; makes
offline sync (Stage 15) safe by construction.

---

## ADR-0006 — Inventory deducts once, at invoice posting

**Status:** Accepted

**Decision.** Stock is deducted exactly once when a sales invoice is posted.
Warehouse **release scans verify and update fulfillment status only** — they
never deduct again.

**Consequences.** Stage 4 scanning and Stage 6 sales must coordinate: the scan
flow is fulfillment, not stock movement, for sales releases.

---

## ADR-0007 — Posted accounting entries are immutable; corrections via reversal

**Status:** Accepted

**Decision.** Double-entry journals, once posted, cannot be edited. Corrections
are reversal or adjustment entries. Every entry balances (debits = credits).

**Consequences.** Audit-friendly; period integrity preserved. The accounting
engine (Stage 9) enforces this; earlier stages only expose posting hooks.

---

## ADR-0008 — Permission-based authorization enforced by RLS

**Status:** Accepted

**Decision.** Authorize by **permission codes**, not role names. Enforce in the
server layer _and_ in Postgres RLS. Branch visibility is computed from
`user_branches` plus `branches.view_all` for Owner/Accounting; Auditors are
read-only.

**Consequences.** Roles become permission bundles; new roles need no code
changes. UI hiding is convenience only.

---

## ADR-0009 — UUID primary keys and standard audit columns

**Status:** Accepted

**Decision.** UUID PKs everywhere; `created_at/updated_at/created_by` and
`branch_id` where applicable; soft delete / `is_active` for referenced masters.

**Consequences.** Safe distributed key generation; no hard deletes of referenced
masters.

---

## ADR-0010 — Reusable domain services; business logic out of components

**Status:** Accepted

**Decision.** Inventory, accounting, tax, document-numbering and pricing logic
live in reusable services (`src/services/`) backed by pure domain functions
(`src/domain/`). React components call services; they hold no business logic.

**Consequences.** Logic is unit-testable without a DB; UI stays thin.

---

## ADR-0011 — Bilingual (English + Tagalog) via a translation dictionary

**Status:** Accepted

**Decision.** A dictionary structure under `src/i18n/` (en, tl). Components
reference keys; no hard-coded user-facing strings scattered across components.

**Consequences.** Adds an i18n indirection from Stage 1; all new UI text must go
through the dictionary.

---

## ADR-0012 — Stage 1 foundation: pinned stack & coarse route protection

**Status:** Accepted (Stage 1)

**Context.** Stage 1 scaffolds the application. We must pick concrete, mutually
compatible versions and a route-protection approach that works before real auth
exists (Stage 2).

**Decision.**

- **Versions:** Next.js 15.5.x (App Router), React 19, TypeScript 5.7 (strict +
  `noUncheckedIndexedAccess`), Tailwind CSS 3.4, shadcn/ui primitives (built in
  `src/components/ui`), Vitest 2 + Testing Library, Playwright 1.49. Next was
  pinned to a CVE-patched 15.5.x release (not the initial 15.1.x) per the
  security rule.
- **shadcn/ui** components are vendored directly into the repo (not pulled via
  the CLI at build time) so the build is hermetic.
- **Route protection** is implemented in middleware via a pure, unit-tested
  decision function (`src/lib/auth/route-access.ts`): unauthenticated users are
  redirected from the protected `(app)` group to `/login`. Fine-grained,
  permission-based authorization and RLS arrive in Stage 2.
- **Env validation** (`src/lib/env.ts`, Zod) is **lazy** (inside getters) so a
  production build without secrets still succeeds, while runtime code paths that
  need Supabase fail fast with a clear message.

**Consequences.** A reliable, type-safe, testable base. The legacy prototype was
moved to `legacy/` and excluded from lint/build/test surfaces.

---

## ADR-0013 — Temporary `DEV_PREVIEW` flag for Stage 1 shell preview

**Status:** Superseded by ADR-0014 (removed in Stage 2)

**Context.** Until Stage 2 implemented Supabase auth there was no way to obtain a
session, so the secure default (redirect protected routes to `/login`) made the
app shell impossible to preview.

**Decision.** A **server-only**, non-production env flag `DEV_PREVIEW=1` caused
middleware to treat the request as authenticated.

**Consequences.** **Removed in Stage 2** now that real Supabase sessions exist.
Middleware no longer reads `DEV_PREVIEW`.

---

## ADR-0014 — Stage 2 authentication, RBAC and RLS

**Status:** Accepted (Stage 2)

**Context.** Stage 2 introduces real accounts, branches, roles and
database-level access control.

**Decision.**

- **Migrations** live in `supabase/migrations/` (timestamp-prefixed): core
  schema, `app.*` SECURITY DEFINER helper functions, RLS policies + grants, and
  an idempotent RBAC seed (4 branches, 9 roles, 23 permissions, the
  role→permission matrix).
- **Authorization is permission-based.** RLS policies call
  `app.has_permission(code)` / `app.can_view_branch(id)`; the app mirrors the
  catalogue in `src/lib/auth/permissions.ts` and checks permission codes, never
  role names.
- **Branch visibility** = `branches.view_all` (Owner / Accounting / Auditor) OR
  membership in `user_branches` with `branches.view_assigned`.
- **Deactivation is enforced in the database**: helper functions resolve a
  deactivated profile to zero permissions / zero visible branches.
- **Self-service safety**: the profiles update policy `WITH CHECK (is_active =
true)` stops a user changing their own active flag; only `users.manage` can.
- **Service-role key** is used only in `src/lib/supabase/admin.ts` (guarded by
  `import "server-only"`) for invitation; every admin action first verifies
  `users.manage`.
- **Testing**: RLS is verified against real Postgres via `scripts/db-test.sh`
  (auth stubs + the `authenticated` role) — 11 assertions over the matrix.

**Consequences.** UI gating is convenience only; the database is authoritative.
Later stages attach `branch_id` + RLS to every new table following this pattern.

---

## Open decisions (to resolve in the stage that needs them)

- **OPEN-A — "Authorized accounting users see all branches" mechanism.**
  Grant `branches.view_all` to the Accounting role vs. a per-user flag.
  _Resolve in Stage 2._
- **OPEN-B — Decimal handling in TypeScript.** Pass numerics as strings and
  compute in SQL only, vs. adopt a decimal library for any client-side preview
  math. _Resolve in Stage 1/Stage 6._
- **OPEN-C — Balance storage.** Pure on-the-fly aggregation of movements vs. a
  function-maintained `inventory_balances` cache (current lean: cache). _Confirm
  in Stage 4._
- **OPEN-D — Document numbering format** per branch/doc type (prefixes, padding,
  yearly reset). _Resolve when numbering service is built (Stage 5/6)._
- **OPEN-E — Offline sync conflict policy** beyond idempotency (e.g. last-writer
  vs. queued replay). _Resolve in Stage 15._
- **OPEN-F — QuickBooks data shape & access** for the 5-year migration
  (export format, COA mapping, opening-balance cutover date). _Resolve in
  Stage 16; needs owner input early._

---

## Identified difficult areas (risk register summary)

These are the areas most likely to cause correctness bugs; each has a guiding
decision above and will get focused tests.

1. **Multiple product units & conversions** — base/purchase/selling units with
   `conversion_to_base`; every variant a separate SKU. (ADR-0003, Stage 3/4)
2. **Open vs. sealed rolls** — cutting a sealed roll creates an open-roll record
   with remaining meters; opened rolls no longer counted as sealed; traceable to
   the receiving batch. (ADR-0004, Stage 4)
3. **Negative inventory** — allowed, surfaced everywhere, never hidden.
   (ADR-0004, Stage 4)
4. **Offline synchronization** — drafts captured offline, synced safely via the
   unique posting key. (ADR-0005, Stage 15)
5. **Prevention of double stock deduction** — idempotent postings; deduction
   once at invoice; release scans are fulfillment-only. (ADR-0005/0006)
6. **Double-entry accounting** — immutable balanced entries; reversals only;
   earlier stages expose hooks. (ADR-0007, Stage 9)
7. **Five-year QuickBooks migration** — COA mapping, opening balances, historical
   AR/AP and inventory; dry-run vs. commit; needs early owner input. (OPEN-F,
   Stage 16)
8. **Multi-branch permissions** — permission-based, RLS-enforced, branch-scoped
   visibility with all-branch override for Owner/Accounting and read-only
   Auditor. (ADR-0008, Stage 2)
