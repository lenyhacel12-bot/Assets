# PRODUCT_REQUIREMENTS.md — 3F Enterprises

## 1. Purpose & vision

A single, reliable, multi-branch system that runs 3F Enterprises' **inventory,
sales and accounting** end to end. It must be trustworthy enough to replace
spreadsheets and a legacy QuickBooks setup, simple enough for trainees, and
accurate enough for the owner and accountants to rely on for financials.

## 2. Business context

- **Company:** 3F Enterprises (Philippines).
- **Goods:** frosted stickers, window tint, decorative film, mirror stickers,
  cold laminating film, vinyl, ink, solar equipment, plus user-added products.
- **Branches:** Manila (MNL), Cebu (CEB), Pampanga (PAM), Antipolo (ANT). Each
  branch has **separate** inventory, sales and expenses.
- **Currency:** Philippine Peso (₱). VAT and withholding tax apply.

## 3. Users & roles

Owner, General Manager, Branch Manager, Sales Staff, Cashier, Warehouse Staff,
Purchasing Staff, Accounting Staff, Auditor. Authorization is
**permission-based**, not role-name based (see `SECURITY_PLAN.md`).

Visibility:

- Normal branch employees see **only their assigned branch(es)**.
- Owner sees **all** branches.
- Authorized accounting users see **all** branches.
- Auditors get **read-only** access to authorized data.

## 4. Core domain concepts

### 4.1 Products and variants

- A product can sell per **Roll, Meter, Piece, Liter, Box**.
- **Every variant is a separate inventory item** with its own SKU, barcode,
  cost, price and stock. Example: "Frosted Reeded 4 ft × 50 m" and "Frosted
  Reeded 5 ft × 50 m" are two distinct SKUs, never merged.
- A product may have multiple **selling units** with **unit conversions**, plus
  a base inventory unit and a purchase unit.
- Roll-and-meter products carry a **standard roll length** (e.g. 30/45/50 m).

### 4.2 Pricing

- Regular selling price, distributor reference price, quantity price tiers,
  customer-specific negotiated prices, and a **manually entered transaction
  price**.
- Sales staff may enter **any** selling price. The system does not block
  below-cost or below-minimum prices, but it **records an audit trail**:
  standard price, actual price, discount difference, user, time, and reason
  when entered — so management reports can flag them later.
- Discounts are based on **actual peso value / final price**, not only percent.

### 4.3 Inventory

- Stock is the result of **immutable inventory movements**, never a hand-edited
  number.
- Track sealed rolls, open/cut rolls (with remaining meters), available,
  reserved, damaged, in-transit, and **negative** quantities, plus total value.
- **Negative inventory is allowed** and must be shown clearly (never hidden).
- Inventory deducts **once**, at invoice posting. Warehouse release scans
  verify and update fulfillment — they do **not** deduct again.

### 4.4 Accounting

- **Double-entry**, with immutable posted entries. Corrections via reversal /
  adjustment only.
- Eventually replaces / absorbs **five years** of QuickBooks history.

## 5. Functional modules (navigation map)

Dashboard, Products, Inventory, Scanning, Stock Transfers, Customers, Sales,
Pre-orders, Deliveries, Suppliers, Purchasing, Expenses, Receivables, Payables,
Cash and Banks, Accounting, Reports, Approvals, Users, Audit Trail, Settings.

Each maps to one or more development stages (see `DEVELOPMENT_STAGES.md`).

## 6. Key workflows (high level)

- **Purchasing:** Purchase Request → PO → Receipt (partial/full) → Supplier
  Bill → Payment → Closed.
- **Sales:** Quotation → Sales Order → Invoice → Delivery → Payment receipt.
- **Transfers:** Transfer out → In-transit → Transfer in (with approval).
- **Pre-orders:** Reserve/deposit → allocate against incoming stock → convert
  to sale.
- **Inventory corrections:** posted as new movements (adjustments), never edits.
- **Accounting corrections:** reversal/adjustment entries, never edits.

## 7. Non-functional requirements

- **Accuracy first** for money and stock (decimal types, transactions,
  idempotency).
- **Responsive** on desktop, tablet, and phone; accessible labels and keyboard
  navigation.
- **Bilingual** UI: English and Tagalog via a translation dictionary (no
  hard-coded strings scattered in components).
- **PWA / installable**, with offline draft capture for scanning and receiving.
- **Barcode** support: phone camera, USB/Bluetooth keyboard-emulating scanners,
  and manual entry, with audio/visual confirmation and unknown-barcode warnings.
- **Security:** Supabase RLS at the database level; service-role key never in
  the browser; all server inputs validated.
- **Auditable:** who did what, when, with before/after where relevant.

## 8. Explicit non-goals (for now)

- Detailed landed-cost allocation for imports (fields/currency reference only).
- Payroll / HR.
- Manufacturing / BOM beyond roll cutting.
- Multi-currency accounting (currency reference captured, but books in ₱).

## 9. Constraints & assumptions

- Hosted on Vercel with Supabase as the backend.
- Internet-first, with offline tolerance for warehouse scanning.
- Trainee-friendly UI is a hard requirement, not a nice-to-have.
