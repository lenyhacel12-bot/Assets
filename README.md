# Rental Manager

Internal web app for managing rental properties — bedspaces, apartments,
commercial spaces, room rentals, and short-term rentals across multiple
locations. Tracks units, tenants, payments, expenses, and repairs, with a
profit dashboard and reports. Mobile-first, ₱ (PHP) throughout.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (warm terracotta / sage palette)
- **Supabase** — Postgres + Auth (email/password) + Storage (tenant docs, receipts)
- Data access via **`@supabase/supabase-js`** + **`@supabase/ssr`** (no ORM)
- Deploy target: **Vercel**

## Project layout

```
app/                 Next.js App Router pages & layouts
lib/
  supabase/client.ts Browser Supabase client
  supabase/server.ts Server Supabase client (cookies-based session)
  format.ts          ₱ currency + date helpers
  types.ts           TypeScript types mirroring the DB schema
supabase/
  migrations/        SQL schema (run in Supabase SQL editor or CLI)
legacy/              Previous "Pastel Finance Tracker" app (archived)
```

## Getting started

1. **Create a Supabase project** at https://supabase.com.
2. Run the schema: open `supabase/migrations/0001_init.sql` in the Supabase
   **SQL Editor** and execute it (or use the Supabase CLI: `supabase db push`).
   This creates all tables, enums, RLS policies, helper views, and the two
   private Storage buckets (`tenant-documents`, `receipts`).
3. Create the admin user: Supabase dashboard → **Authentication → Users → Add user**
   (email + password). MVP uses a single admin login.
4. Copy env vars: `cp .env.example .env.local` and fill in your project URL +
   anon key from **Project Settings → API**.
5. Install & run:
   ```bash
   npm install
   npm run dev
   ```
   App runs at http://localhost:3000.

## Data model (summary)

| Table              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `locations`        | The 11 sites (name, address, notes)                            |
| `units`            | Rentable units; `rental_type`, `monthly_rate`, `status`        |
| `tenants`          | Occupants; contract dates, status, FK to unit                  |
| `tenant_documents` | Pointers to files in Storage (ID, requirements, contract)      |
| `payments`         | Rent payments; auto-flags overdue, denormalized `unit_id`      |
| `expenses`         | Costs tagged to a location (and optionally a unit)             |
| `repairs`          | Per-unit repair requests; optional link to an expense          |

Helper views: `vacancy_summary` (vacant vs occupied per location/type) and
`monthly_pnl` (collection vs expenses vs profit per location/month).

## Build status

- [x] Project scaffold + database schema
- [ ] Properties/Units CRUD + Vacancy view
- [ ] Tenants CRUD + document upload
- [ ] Payments + overdue/reminder logic
- [ ] Expenses + Repairs
- [ ] Reports / profit dashboard
- [ ] Responsive polish, empty/error states
