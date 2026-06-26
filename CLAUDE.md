# CLAUDE.md — 3F Enterprises Inventory, Sales & Accounting System

This file is the operating contract for any AI agent (and human contributor)
working in this repository. Read it in full before making changes.

---

## 1. What this project is

A multi-branch **inventory, sales and accounting** web application for
**3F Enterprises**, a Philippine company selling physical goods (frosted
stickers, window tint, decorative film, mirror stickers, cold laminating film,
vinyl, ink, solar equipment, and other user-added products).

Branches: **Manila (MNL), Cebu (CEB), Pampanga (PAM), Antipolo (ANT)**.
Each branch keeps separate inventory, sales and expenses. The owner and
authorized accounting users can see all branches.

Products are sold per **Roll, Meter, Piece, Liter, Box**. Every product
**variant is a completely separate inventory item** with its own SKU, barcode,
cost, price and stock count.

> **Current repository status:** The repo currently contains an unrelated
> "Pastel Finance Tracker" (vanilla HTML/CSS/JS). See
> `docs/DECISIONS.md` (ADR-0001) for its disposition. No 3F Enterprises
> application code has been written yet. **Stage 0 is documentation and
> planning only.**

---

## 2. Planned technology stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| Language | TypeScript, **strict mode** |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Database | Supabase PostgreSQL |
| Auth | Supabase Authentication |
| File storage | Supabase Storage |
| Hosting | Vercel |
| Offline / installable | Progressive Web App (PWA) |
| Scanning | Mobile camera barcode scanning + USB/Bluetooth keyboard-emulating scanners |

Use **current stable, mutually compatible versions**. Do **not** upgrade
unrelated dependencies without a recorded reason in `docs/DECISIONS.md`.

---

## 3. The one-stage-at-a-time rule (critical)

**Claude must work on only ONE requested stage at a time.** Even if a prompt
pastes the descriptions of several stages, implement only the single stage the
user explicitly asks for, then **stop**. Do not begin the next stage until
explicitly told to.

The full sequence is defined in `docs/DEVELOPMENT_STAGES.md` (16 stages).

### Every stage must end with the following report

1. **Files created or changed**
2. **Database migrations created**
3. **Tests run**
4. **Test results**
5. **Known limitations**
6. **Manual testing instructions**
7. **Recommended next stage**

A stage is not "done" until this report is provided.

---

## 4. Non-negotiable engineering rules

### Money & quantities
- Use **`numeric`/`decimal`** database types for all money and quantity
  columns. Never use floating-point columns for financial data.
- **Never** use JavaScript floating-point (`number`) for *final* financial
  calculations. Use integer minor units or a decimal library, and do
  authoritative math in the database / SQL where possible.
- Store monetary values **consistently** (same currency handling, same scale,
  documented in `docs/DATABASE_PLAN.md`).

### Inventory integrity
- **Stock balances must be derived from immutable inventory movements**, never
  from a hand-editable quantity field.
- **Never directly edit calculated stock balances.** Corrections are made by
  posting new movements (adjustments).
- Every inventory/financial posting runs inside a **database transaction**.
- Use a **unique posting key** on movements to guarantee idempotency and
  prevent double stock deduction.

### Accounting integrity
- **Posted accounting entries must not be directly edited.** Corrections use
  **reversal or adjustment** transactions only.
- Double-entry: every posted journal must balance (debits = credits).

### Data model conventions
- **UUID primary keys** everywhere.
- Standard columns where applicable: `created_at`, `updated_at`, `created_by`,
  and **branch ownership** (`branch_id`).
- Use **soft deletion / inactive status** for master records referenced by
  transactions. Never hard-delete a master record used by a transaction.

### Security
- Enforce access with **Supabase Row Level Security (RLS)** at the database
  level. UI restrictions are never sufficient on their own.
- **Never** put the Supabase **service-role key** in browser/client code.
- Validate **all** server inputs (e.g. with a schema validator like Zod).

### Code quality
- **No `any`** in TypeScript. Prefer precise types; use `unknown` + narrowing
  when needed.
- **Keep business logic out of React components.** Put it in reusable services.
- Create reusable services for **inventory, accounting, taxes, and document
  numbering**.

---

## 5. Repository conventions (to be applied from Stage 1 onward)

- Source lives under `src/` once the Next.js app is scaffolded.
- Documentation lives under `docs/`.
- Database migrations live under `supabase/migrations/` (created from Stage 2).
- Reusable domain services live under `src/services/` (or `src/lib/services/`).
- Localization dictionaries (English + Tagalog) live under `src/i18n/` — do
  **not** hard-code user-facing strings throughout components.

---

## 6. Working agreement for AI agents

Before starting any stage:
1. Read this file (`CLAUDE.md`).
2. Read the relevant files in `docs/`.
3. Inspect the current repository and existing migrations.
4. Present a **concise implementation plan** for the requested stage.
5. Implement **only** that stage.
6. Produce the end-of-stage report (Section 3).
7. **Stop.** Do not proceed to the next stage.

When a decision has architectural impact, record it in `docs/DECISIONS.md`
as a new ADR.
</content>
</invoke>
