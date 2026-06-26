# SECURITY_PLAN.md — 3F Enterprises

## 1. Principles

- **Defense in depth.** The database is the final authority. UI hiding is a
  convenience, never a control.
- **Least privilege.** Permission-based authorization; users get only what they
  need.
- **Secrets never reach the browser.** The Supabase **service-role key** is
  server-only.
- **Validate everything at the trust boundary.** All server inputs are schema-
  validated (Zod) before use.

## 2. Authentication

- Supabase Authentication for login, logout, forgot/reset password, and user
  invitation.
- Session handling via Supabase middleware (refresh + route protection).
- **Deactivated users** (`profiles.is_active = false`) are blocked from the
  application — enforced both in middleware and via RLS predicates.
- Record `last_login_at` on sign-in.

## 3. Authorization model (permission-based)

- Roles are bundles of **permissions**; code checks **permissions**, not role
  names. Adding/adjusting a role never requires touching authorization logic.
- Permission codes are listed in `DATABASE_PLAN.md` Module A.
- Authorization is enforced in **two places**:
  1. **Server** (Server Actions / Route Handlers): verify the user holds the
     required permission before performing an action.
  2. **Database (RLS):** policies ensure a user can only read/write rows they
     are entitled to, regardless of the client used.

## 4. Branch-level visibility (RLS)

- Branch-scoped tables carry `branch_id`.
- A user may read/write a branch row only if:
  - they have `branches.view_all` (Owner, authorized Accounting), **or**
  - the row's `branch_id` is in their `user_branches`, **and** they hold the
    matching operational permission.
- **Auditors** receive read-only policies (SELECT) over authorized data and no
  write policies.
- Helper SQL functions (e.g. `current_user_branch_ids()`,
  `current_user_has_permission(code)`) back the policies so they stay readable
  and consistent.

### Example policy intent (illustrative, finalized in Stage 2)

```
-- SELECT on inventory_movements
USING (
  current_user_has_permission('branches.view_all')
  OR branch_id = ANY (current_user_branch_ids())
)
```

## 5. Service boundaries & keys

- **Browser client:** anon key only; every request is RLS-scoped.
- **Server client:** built from the request's user session; respects RLS.
- **Service-role client:** used only in trusted server paths (user invitation,
  controlled admin/migration tasks). Key stored in a **server-only** env var,
  never exposed via `NEXT_PUBLIC_*`, never bundled to the client.

## 6. Input validation & output handling

- Validate all inputs (forms, route handlers, server actions) with Zod schemas
  in `src/lib/validation`.
- No `any` types — precise types reduce injection/Logic errors.
- Escape/parameterize all SQL (use Supabase client / parameterized RPC; never
  string-concatenate SQL).
- File uploads (product images, attachments) go to Supabase Storage with
  bucket-level policies and content-type/size checks.

## 7. Financial & inventory safety as a security concern

- Postings run in DB transactions with a **unique posting key** to prevent
  duplicate stock deduction or duplicate journal entries (also a fraud/error
  control).
- Posted accounting entries and inventory movements are **immutable**;
  corrections are new reversing/adjusting records — preserving an attack- and
  error-resistant trail.

## 8. Auditability

- An immutable `audit_logs` table records actor, action, entity, and
  before/after snapshots for sensitive operations (Stage 13), readable only by
  users with `audit.view`.
- Price overrides, approvals, adjustments, cancellations, and refunds are all
  audited.

## 9. Environment & configuration

- `.env.example` documents required variables without secrets.
- Environment variables are **validated at startup**; missing/invalid values
  fail fast with a clear message (Stage 1).
- Public vs. server variables are clearly separated (`NEXT_PUBLIC_` prefix only
  for values safe to expose).

## 10. Transport & deployment

- HTTPS enforced (Vercel).
- Supabase RLS enabled on **every** application table before that table is used
  in a feature.
- Principle: a feature is not "done" until its tables have RLS policies and
  tests proving cross-branch access is rejected **at the database level**.

## 11. Open security decisions

- Exact mapping of "authorized accounting users see all branches" — via the
  `branches.view_all` permission granted to the Accounting role vs. a per-user
  flag. (Tracked in `DECISIONS.md`.)
- MFA for Owner/Accounting accounts (candidate for a later hardening stage).
- Rate limiting / brute-force protection strategy for auth endpoints.
