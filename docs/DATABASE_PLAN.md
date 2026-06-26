# DATABASE_PLAN.md — 3F Enterprises

> **Stage 0 = planning only. No migrations are created in this stage.**
> This document describes the _intended_ entities, their key fields, and the
> rules that govern them. Migrations begin in Stage 2 and grow per stage.

---

## Global conventions

- **Primary keys:** `uuid` (default `gen_random_uuid()`).
- **Audit columns (where applicable):** `created_at timestamptz`,
  `updated_at timestamptz` (trigger-maintained), `created_by uuid` (→ user),
  `updated_by uuid`.
- **Branch ownership:** `branch_id uuid` on all branch-scoped rows.
- **Soft delete / status:** master records use `is_active boolean` (or a status
  enum). **Never hard-delete** a master record referenced by a transaction.
- **Money & quantity:** `numeric(18,4)` for quantities and unit costs/prices;
  `numeric(18,2)` for document/currency totals. Documented scale, **no floats.**
- **Idempotency:** posting tables carry a `posting_key text UNIQUE` (or a unique
  composite) to prevent double posting.
- **RLS:** every branch-scoped table has Row Level Security policies (Stage 2+).

### Numeric conventions

- Quantities (incl. meters) and unit prices: `numeric(18,4)`.
- Line and document totals, balances: `numeric(18,2)`.
- Conversion rates: `numeric(18,6)`.
- All arithmetic that produces a _posted_ financial/stock value is performed in
  SQL / Postgres functions, never in JS floating point.

---

## Module A — Identity, branches & permissions _(Stage 2)_

- **branches** — `id, name, code (MNL/CEB/PAM/ANT, unique), address, contact_*,
is_active`, document-numbering settings.
- **profiles** — extends Supabase `auth.users`: `id (=auth uid), full_name,
preferred_language (en|tl), is_active, last_login_at`.
- **roles** — `id, name, description` (Owner, GM, Branch Manager, Sales,
  Cashier, Warehouse, Purchasing, Accounting, Auditor).
- **permissions** — `id, code (unique), description` (e.g. `branches.view_all`,
  `branches.view_assigned`, `products.manage`, `sales.create`,
  `invoices.post`, `payments.receive`, `inventory.release`,
  `inventory.receive`, `inventory.adjust`, `transfers.manage`,
  `discounts.approve`, `damage.approve`, `transfers.approve`,
  `refunds.approve`, `transactions.cancel`, `expenses.manage`,
  `accounting.view`, `accounting.manage`, `audit.view`, `users.manage`,
  `settings.manage`, …).
- **role_permissions** — `role_id, permission_id` (join).
- **user_roles** — `user_id, role_id` (a user may hold one or more roles).
- **user_branches** — `user_id, branch_id` (assigned branches; owners/accounting
  are granted all-branch visibility via permission, not by enumerating rows).

## Module B — Master records _(Stage 3)_

- **product_categories** — `id, name, parent_id?, is_active`.
- **brands** — `id, name, is_active`.
- **units** — `id, code (roll/meter/piece/liter/box…), name`.
- **products** — one row **per variant/SKU**. Fields incl. `sku (unique),
barcode (unique), name, category_id, brand_id, color, width, thickness,
design, shade, model, wattage, capacity, description, image_path,
base_unit_id, purchase_unit_id, standard_roll_length numeric, cost numeric,
regular_price numeric, distributor_price numeric, vat_classification,
preferred_supplier_id, is_active`.
- **product_selling_units** — `product_id, unit_id, conversion_to_base numeric`
  (a product may have several selling units).
- **product_price_tiers** — `product_id, min_qty numeric, unit_id, price numeric`.
- **product_branch_settings** — `product_id, branch_id, min_stock_level numeric`.
- **customers** — `id, name, company_name, contact_person, contact_number,
email, billing_address, tin, category_id, branch_id (owner branch),
credit_terms, credit_limit numeric, tax_classification, withholding_settings,
notes, is_active`.
- **customer_categories** — configurable (Walk-in, Reseller, Printing business,
  Contractor, Dealer, Corporate, Aluminum/glass supplier, Business owner,
  Distributor, Other).
- **customer_delivery_addresses** — `customer_id, label, address` (many).
- **customer_product_prices** — `customer_id, product_id, unit_id, price` —
  negotiated per-customer pricing.
- **suppliers** — `id, type (local|overseas), company_*, contact_person,
addresses, tin, payment_terms, currency_reference, notes, is_active`.
- **supplier_products** — `supplier_id, product_id` (products supplied).

## Module C — Inventory engine _(Stage 4)_

> **Balances are derived from immutable movements. Never edit balances.**

- **inventory_movements** _(immutable, append-only)_ — `id, branch_id,
product_id, movement_type, direction (in|out), quantity numeric,
base_unit_id, transaction_unit_id, conversion_rate numeric, unit_cost numeric,
source_doc_type, source_doc_id, posting_key (unique), reason, device_ref,
created_by, created_at`. Movement types: opening balance, purchase receipt,
  sales invoice deduction, sales return, supplier return, transfer out,
  transfer in, damage, damage recovery, adjustment increase/decrease, physical
  count adjustment, cancellation return, pre-order receipt, other controlled.
- **inventory_balances** _(maintained ONLY by the posting function)_ —
  `branch_id, product_id, available numeric, reserved numeric, damaged numeric,
in_transit numeric, sealed_rolls numeric, total_value numeric`. A cache of the
  movement ledger, never hand-edited.
- **open_rolls** — `id, branch_id, product_id, source_receipt_id?,
standard_length numeric, remaining_meters numeric, is_open boolean,
created_at`. Cutting a sealed roll creates/updates an open-roll record; the
  opened roll is no longer counted as sealed.
- **physical_count_sessions** — `id, branch_id, status, frozen_at, created_by`.
- **physical_count_lines** — `session_id, product_id, expected_qty numeric,
counted_qty numeric, variance numeric, reason, approved_by?`.

## Module D — Purchasing & payables _(Stage 5)_

- **purchase_requests** _(optional flow)_ — header + lines.
- **purchase_orders** — `id, branch_id, supplier_id, po_number (per-branch),
order_date, expected_date, currency_reference, status, approval_status,
receiving_status, billing_status, payment_status, notes`.
- **purchase_order_lines** — `po_id, product_id, unit_id, quantity numeric,
unit_cost numeric, tax_treatment, line_total numeric`.
- **receiving_reports** — `id, po_id, branch_id, received_by, received_at,
notes`, attachments.
- **receiving_report_lines** — `rr_id, product_id, qty_expected, qty_received,
qty_damaged, qty_rejected, batch_lot, expiry_date?`. Posting creates inventory
  movements **exactly once** (idempotent via posting_key).
- **supplier_bills** — `id, supplier_id, po_id?, bill_date, due_date,
tax_classification, vat_purchases numeric, input_vat numeric,
withholding_tax numeric, amount numeric, outstanding_balance numeric,
payment_account_ref, status`, attachments.
- **supplier_payments** — `id, bill_id, amount numeric, payment_account_ref,
paid_at` (partial/full).
- **supplier_returns** / **debit_memos** — return reason, quantity, status;
  posting reduces inventory **exactly once**; payable adjustment hook.

## Module E — Sales & receivables _(Stage 6)_

- **quotations**, **sales_orders** — header + lines, status lifecycle.
- **invoices** — `id, branch_id, customer_id, invoice_number (per-branch),
invoice_date, due_date, terms, output_vat numeric, withholding numeric,
total numeric, outstanding_balance numeric, status`. **Inventory deducts once
  on posting.**
- **invoice_lines** — `invoice_id, product_id, unit_id, quantity, unit_price,
line_total`.
- **price_override_audit** — `invoice_line_id, standard_price, actual_price,
discount_difference, user_id, created_at, reason?`.
- **customer_payments / receipts** — `id, customer_id, invoice_id?, amount,
payment_account_ref, received_at`.

## Module F — Transfers & deliveries _(Stage 7)_

- **stock_transfers** — `id, from_branch_id, to_branch_id, status, approval,
created_by`; lines reference products/quantities; movements: transfer out →
  in-transit → transfer in.
- **deliveries / delivery_receipts** — linked to sales orders, fulfillment
  status, driver/vehicle, partial deliveries.

## Module G — Pre-orders _(Stage 8)_

- **pre_orders** — customer, deposit, status; **pre_order_lines** with
  allocation against incoming purchases; reservation without double deduction.

## Module H — Accounting engine _(Stage 9)_

- **accounts** (chart of accounts) — `id, code, name, type
(asset/liability/equity/income/expense), parent_id?, is_active`.
- **accounting_periods** — `id, name, start_date, end_date, status (open/closed)`.
- **journal_entries** _(immutable once posted)_ — `id, branch_id, entry_date,
period_id, source_doc_type, source_doc_id, posting_key (unique), memo,
status (draft/posted/reversed), reversed_by?`.
- **journal_lines** — `entry_id, account_id, debit numeric, credit numeric,
branch_id`. Constraint: sum(debit) = sum(credit) per entry.
- Corrections via **reversal** (mirror entry) or **adjustment**; never edit
  posted lines.

## Module I — Cash, banks & treasury _(Stage 10)_

- **payment_accounts** — `id, name, type (cash/petty/bank/e-wallet/cheque),
branch_id?, account_no?, is_active` (Cash on hand, Petty cash, BDO, BPI,
  GCash, Maya, RCBC QR, cheques received, other banks).
- **cash_transactions / fund_transfers / bank_reconciliations / cheques**.

## Module J — Taxes _(Stage 11)_

- **tax_codes** — VAT (12% standard, exempt, zero-rated), withholding rates.
- Tax computations are produced by the **tax service** and stored on the
  relevant document lines/headers; tax reports read from posted documents.

## Module K — Expenses _(Stage 12)_

- **expenses** — `id, branch_id, category_id, amount numeric, tax fields,
payment_account_ref, status, approved_by?`, attachments.
- **expense_categories**, **petty_cash_replenishments**.

## Module L — Approvals & audit _(Stage 13)_

- **approval_requests** — `id, type (discount/damage/transfer/refund/adjustment/
cancellation), entity_ref, requested_by, status, decided_by?, decided_at,
reason`.
- **audit_logs** _(immutable)_ — `id, actor_id, action, entity_type, entity_id,
before jsonb, after jsonb, branch_id?, created_at`.

## Module M — Document numbering _(cross-cutting)_

- **document_sequences** — `branch_id, doc_type, prefix, next_number` with
  atomic allocation (per-branch, per-type), used by the numbering service to
  avoid gaps/races.

## Module N — QuickBooks migration _(Stage 16)_

- Staging tables for imported QuickBooks data (chart of accounts mapping,
  opening balances, historical AR/AP, inventory opening balances), plus
  validation/reconciliation views. Dry-run vs. commit supported.

---

## Difficult areas to design carefully (cross-references)

See `DECISIONS.md` and the "Risks" section there. Highlights: multiple product
units, open vs. sealed rolls, negative inventory, offline sync, prevention of
double stock deduction, double-entry accounting, the five-year QuickBooks
migration, and multi-branch permissions.
