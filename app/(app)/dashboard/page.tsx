import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type VacancyRow = {
  total_units: number;
  vacant_units: number;
  occupied_units: number;
  under_repair_units: number;
};

export default async function DashboardPage() {
  const supabase = createClient();
  const [{ data: vac }, { count: locationCount }] = await Promise.all([
    supabase.from("vacancy_summary").select("*"),
    supabase.from("locations").select("*", { count: "exact", head: true }),
  ]);

  const rows = (vac ?? []) as VacancyRow[];
  const totals = rows.reduce(
    (a, r) => ({
      total: a.total + r.total_units,
      vacant: a.vacant + r.vacant_units,
      occupied: a.occupied + r.occupied_units,
      repair: a.repair + r.under_repair_units,
    }),
    { total: 0, vacant: 0, occupied: 0, repair: 0 },
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-charcoal">Dashboard</h1>
      <p className="mb-4 text-sm text-charcoal-soft">
        Collection, expenses, and profit metrics arrive with the Payments and
        Reports modules. Here&apos;s your portfolio at a glance.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card label="Locations" value={locationCount ?? 0} />
        <Card label="Total units" value={totals.total} />
        <Card label="Occupied" value={totals.occupied} accent="text-occupied" />
        <Card label="Vacant" value={totals.vacant} accent="text-vacant" />
        <Card label="Under repair" value={totals.repair} accent="text-repair" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/units" className="btn-secondary">Manage units →</Link>
        <Link href="/vacancy" className="btn-secondary">Vacancy view →</Link>
        <Link href="/locations" className="btn-secondary">Locations →</Link>
      </div>
    </div>
  );
}

function Card({ label, value, accent = "text-charcoal" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-charcoal-soft">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
