# TESTING_STRATEGY.md — 3F Enterprises

## 1. Goals

Prove the things that must never be wrong: **money math, inventory balances,
posting idempotency, branch isolation, and authorization.** Everything else is
secondary to those.

## 2. Test layers

| Layer           | Scope                                                                                                               | Tooling (planned)                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Unit**        | Pure domain logic: unit conversion, pricing resolution, tax computation, double-entry balancing, roll-cutting math. | Vitest (or Jest)                      |
| **Integration** | Services against a real Postgres/Supabase test DB: movement posting, idempotency, transactions, RLS predicates.     | Vitest + local Supabase / test schema |
| **End-to-end**  | Critical user flows through the UI.                                                                                 | Playwright                            |
| **Build**       | `next build` (production) must succeed every stage.                                                                 | Next.js CLI                           |

Frameworks are installed in **Stage 1**; meaningful suites grow per stage.

## 3. Non-negotiable test cases by theme

### Money

- Decimal math never loses precision in posted values.
- VAT (output/input, exempt, zero-rated) and withholding compute correctly.
- Journal entries always balance (debits = credits).

### Inventory

- A sealed 50 m roll cut by 5 m yields a 45 m open roll; sealed count drops.
- Inventory may go **negative** and is shown, not hidden.
- A duplicate **posting key** does **not** create a second movement.
- Concurrent postings do not corrupt balances.
- A warehouse **release scan does not re-deduct** stock already deducted by an
  invoice.

### Authorization / multi-branch

- Owner sees all branches; a branch user sees only assigned branch(es).
- Cross-branch access is **rejected at the database level** (RLS), not just UI.
- Auditor cannot modify records.
- Deactivated users cannot access the app.
- Role without `users.manage` cannot manage users.

### Idempotency / sync

- Offline drafts re-synced twice post **once** (same posting key).

## 4. Per-stage testing expectations

Each stage's end-of-stage report must include **Tests run** and **Test
results**. At minimum every stage verifies:

- Production build succeeds (`next build`).
- The stage's own critical invariants (see the stage description).
- No regression in previously covered invariants.

Representative required tests per stage are listed in
`DEVELOPMENT_STAGES.md` and the original stage briefs.

## 5. Test data & environments

- A seed script provides branches (MNL/CEB/PAM/ANT) and representative test
  users per role (from Stage 2).
- Integration tests run against an ephemeral/local Supabase or a dedicated test
  schema, never production.
- Deterministic fixtures for products with multiple units and roll lengths.

## 6. Conventions

- Tests live under `tests/` (unit/integration/e2e subfolders) or colocated
  `*.test.ts` for pure units — decided in Stage 1 and recorded in `DECISIONS.md`.
- Domain logic is written to be **pure and injectable** so it is unit-testable
  without a database.
- Prefer testing **invariants** (balances reconcile, journals balance) over
  testing implementation details.

## 7. CI (planned)

- Lint + typecheck + unit/integration tests + `next build` on every push once
  CI is set up (a later foundation task). Until then, tests are run locally and
  results reported in each stage's report.

## 8. Definition of done (testing view)

A stage is done only when:

1. Its required tests exist and pass (or limitations are clearly documented).
2. The production build succeeds.
3. The end-of-stage report records exactly what was run and the results —
   including anything skipped and why.
