# DEVELOPMENT_STAGES.md — 3F Enterprises Implementation Sequence

This document defines the staged build plan. **Stage 0 is planning only.**
Stages 1–16 are the implementation sequence.

---

## Governing rules

1. **One stage at a time.** Claude must implement only the single stage the
   user explicitly requests, then stop. Pasting multiple stage descriptions
   does **not** authorize building more than one.
2. **Every stage ends with a standard report** (see below).
3. Do not start the next stage until explicitly instructed.

### Mandatory end-of-stage report

Every stage must conclude by listing:

1. **Files created or changed**
2. **Database migrations created**
3. **Tests run**
4. **Test results**
5. **Known limitations**
6. **Manual testing instructions**
7. **Recommended next stage**

---

## The 16-stage sequence

> Stage 9 is the double-entry accounting engine. Earlier financial stages
> (5–8) must therefore expose **stable posting hooks / transaction interfaces**
> rather than inventing throwaway accounting that Stage 9 would have to undo.

### Stage 0 — Project rules and master plan _(this stage)_

Inspect the repo, establish development rules, create `CLAUDE.md` and all
`/docs`, define the database entities (no migrations yet), identify risks.
**No business features built.**

### Stage 1 — Application foundation

Next.js App Router + TypeScript strict + Tailwind + shadcn/ui + ESLint +
formatting + env-var validation + Supabase browser/server/middleware clients +
unit and E2E test frameworks + PWA manifest foundation + error boundaries +
loading/toast systems + responsive app shell (sidebar, top bar, branch /
language / user / notification placeholders, mobile nav, breadcrumbs) +
navigation placeholders for every planned module + i18n dictionary structure
(English + Tagalog). Protected route groups with placeholder pages.
**No business modules implemented.**

### Stage 2 — Authentication, branches and role permissions

Supabase auth flows (login, logout, forgot/reset password, invite, profile,
preferred language, last-login). Seed branches (MNL, CEB, PAM, ANT). Roles
(Owner, General Manager, Branch Manager, Sales Staff, Cashier, Warehouse
Staff, Purchasing Staff, Accounting Staff, Auditor). **Permission-based**
authorization (not role-name checks). Branch-level visibility enforced with
**RLS**. Migrations for branches, profiles, roles, permissions, role
permissions, user roles, user branches.

### Stage 3 — Products, customers and suppliers (master records)

Products (every variant a separate SKU/inventory item), multi-unit support
with conversions, standard roll length, pricing tiers, customer-specific
prices, VAT classification, preferred supplier. CSV/Excel batch import with
validation preview and duplicate detection. Customers (categories, credit
terms, tax/withholding, customer price table). Suppliers (local/overseas).
Searchable/sortable/paginated tables. Soft-delete for referenced records.
**No inventory movements or accounting.**

### Stage 4 — Inventory engine and barcode scanning

Immutable inventory movements as the source of truth. Per-branch/product
states: sealed rolls, open/cut rolls, remaining meters, available, reserved,
damaged, in-transit, negative, total value. Open-roll logic (50 m roll → cut
5 m → 45 m remaining, roll no longer "sealed"). Movement types and required
fields incl. **unique posting key** for idempotency. Negative inventory
allowed and shown clearly. Scanning modes (receive, release, count, damaged,
transfer) for camera + USB/Bluetooth + manual entry. Physical count sessions
with freeze/snapshot, variance reason, approval. **A warehouse release scan
must never re-deduct stock that an invoice already deducted.**

### Stage 5 — Purchasing and accounts payable

Purchase Request → PO → Partial/Full Receipt → Supplier Bill → Payment →
Closed. Receiving reports posting inventory exactly once (idempotent). Barcode
receiving with over-receipt confirmation. Supplier bills/payables with VAT
purchases, input VAT, withholding fields. Supplier returns reducing inventory
exactly once. AP screens (balances, open/overdue bills, aging, payment
history, statements). **Stable posting hooks; no fake accounting.**

### Stage 6 — Sales, invoicing and accounts receivable

Quotation → Sales Order → Invoice → (Delivery) → Receipt of payment. Pricing
resolution (standard, tier, customer-specific, manual override) with a
**price-override audit record** (standard price, actual price, discount
difference, user, time, reason). Inventory deducted **exactly once** on invoice
posting (release scans only verify/fulfill). AR with terms, credit limits,
aging, statements. VAT output, withholding. **Posting hooks for Stage 9.**

### Stage 7 — Stock transfers and deliveries

Branch-to-branch transfers (transfer out / in-transit / transfer in) using the
inventory engine, with approval. Delivery management (delivery receipts,
fulfillment status, driver/vehicle, partial deliveries) linked to sales orders.

### Stage 8 — Pre-orders and customer fulfillment

Customer pre-orders / reservations, deposits, allocation against incoming
purchases, pre-order receipt movements, conversion to sales orders, reservation
of stock without double deduction.

### Stage 9 — Double-entry accounting engine

Chart of accounts, journals and journal lines, immutable posted entries,
reversal/adjustment mechanism, posting rules that turn inventory, sales,
purchasing, payments and expenses into balanced journal entries. Periods and
period close. **All prior posting hooks are wired here.**

### Stage 10 — Cash, banks and treasury

Payment accounts (Cash on hand, Petty cash, BDO, BPI, GCash, Maya, RCBC QR,
cheques received, other banks). Receipts and disbursements, fund transfers,
bank reconciliation, cheque lifecycle. Integrated with accounting (Stage 9).

### Stage 11 — Taxes and BIR compliance

Reusable tax service: VAT (sales/purchases, output/input), withholding tax
(expanded/final), VAT-exempt/zero-rated handling, tax reports (relief-style
sales/purchase books), official-receipt/invoice numbering compliance.

### Stage 12 — Expenses and petty cash

Operating expense capture per branch, categories, approvals, attachments,
recurring expenses, petty-cash replenishment, posting to accounting.

### Stage 13 — Approvals workflow and audit trail

Centralized approval engine (discounts, damaged inventory, transfers, refunds,
adjustments, cancellations) driven by permissions. Comprehensive, immutable
**audit trail** of who did what, when, and before/after values.

### Stage 14 — Reports, dashboards and document generation

Owner and branch dashboards, inventory/sales/purchasing/AR/AP/accounting
reports, low/negative stock and reorder reports, below-cost/below-minimum
flags, PDF generation for invoices, POs, receiving reports, debit memos,
statements.

### Stage 15 — PWA, offline sync and scanner hardening

Service worker, installability, offline draft capture for scanning/receiving,
**conflict-free synchronization** keyed on unique posting keys to prevent
double deduction, scanner ergonomics, audio/visual scan feedback, performance.

### Stage 16 — QuickBooks 5-year migration and go-live

Import and reconcile **five years** of historical QuickBooks data (chart of
accounts mapping, opening balances, historical AR/AP, inventory opening
balances), validation reports, dry-run vs. commit, cutover plan, final
hardening and go-live checklist.

---

## Dependency notes

- Stages 5–8 must **not** invent accounting; they expose posting hooks that
  Stage 9 consumes.
- Inventory deduction must happen **once** (invoice posting); release scans in
  Stage 4/6/7 verify and update fulfillment only.
- Offline sync (Stage 15) relies on the unique posting key established in
  Stage 4.
- The QuickBooks migration (Stage 16) depends on the accounting engine (Stage
  9), taxes (Stage 11), and treasury (Stage 10) being in place.
