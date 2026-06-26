# ✨ Pastel Finance Tracker 💎

A cute, girly **Personal Finance Tracker** — single-page web app, no build tools, no backend.
All amounts are in **Philippine Peso (₱)** and all data is saved in your browser's `localStorage`.

## ▶️ How to run

**Option A — just open it:**
Double-click `index.html` (or drag it into your browser). That's it.

**Option B — local server (recommended for full reliability):**
```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```
> A server avoids some browsers' restrictions on local file access and lets the
> Chart.js / SheetJS CDN scripts load cleanly. An internet connection is needed
> the first time so those two CDN libraries can load.

## 📑 Tabs / Features

- **📊 Dashboard** — net worth, total assets, monthly income, net savings, asset bar chart,
  assets-vs-liabilities donut, goal progress, and an alert banner for loans/installments due or ending.
- **💎 Assets & Liabilities** — full CRUD; auto-computed net worth.
- **💸 Income & Expenses** — per-month picker, quick-add shortcut buttons (add/delete your own),
  donut charts by source and category.
- **🧮 Budget** — monthly budget per expense category with progress bars + over-budget warnings.
- **📈 History** — net-worth snapshots line chart + income-vs-expenses trend.
- **🏠 Rentals** — net per property, folded into monthly income.
- **🏦 Mutual Funds** — gain/loss per fund, folded into total assets.
- **💳 Loans** — detailed fields + summary cards (limit, remaining, loan amount, monthly hulog).
- **🔔 Who's Paying** — credit-card installment tracker with end-month, term status, and bill
  projections for this month + next 2 months, broken down by card and category.
- **🎯 Goals** — progress bars toward target amounts.

## 💾 Data

- **Auto-saves** to `localStorage` on every change (little "Saved" toast bottom-right).
- **Export JSON** / **Export Excel** (`.xlsx`, one sheet per category) / **Import** a saved JSON.
- **Reset** restores the sample seed data (with confirmation).

## 🧱 Files
- `index.html` — markup & CDN links
- `style.css` — pastel theme
- `app.js` — state, CRUD, charts, export/import

Libraries via CDN: [Chart.js](https://www.chartjs.org/) and [SheetJS/xlsx](https://sheetjs.com/).
