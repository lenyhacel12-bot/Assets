import { createClient } from "@/lib/supabase/server";
import { RENTAL_TYPE_LABELS, type RentalType } from "@/lib/types";

type VacancyRow = {
  location_id: string;
  location_name: string;
  rental_type: RentalType;
  total_units: number;
  vacant_units: number;
  occupied_units: number;
  under_repair_units: number;
};

function OccupancyBar({
  vacant,
  occupied,
  repair,
}: {
  vacant: number;
  occupied: number;
  repair: number;
}) {
  const total = Math.max(vacant + occupied + repair, 1);
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-sand-100">
      <div className="bg-occupied" style={{ width: pct(occupied) }} />
      <div className="bg-vacant" style={{ width: pct(vacant) }} />
      <div className="bg-repair" style={{ width: pct(repair) }} />
    </div>
  );
}

export default async function VacancyPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("vacancy_summary")
    .select("*")
    .order("location_name");
  const rows = (data ?? []) as VacancyRow[];

  // Group by location.
  const byLocation = new Map<string, { name: string; rows: VacancyRow[] }>();
  for (const r of rows) {
    if (!byLocation.has(r.location_id))
      byLocation.set(r.location_id, { name: r.location_name, rows: [] });
    byLocation.get(r.location_id)!.rows.push(r);
  }

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total_units,
      vacant: acc.vacant + r.vacant_units,
      occupied: acc.occupied + r.occupied_units,
      repair: acc.repair + r.under_repair_units,
    }),
    { total: 0, vacant: 0, occupied: 0, repair: 0 },
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-charcoal">Vacancy</h1>
      <p className="mb-4 text-sm text-charcoal-soft">
        Vacant vs occupied across every location and unit type.
      </p>

      {/* Overall */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total units" value={totals.total} accent="text-charcoal" />
        <Stat label="Vacant" value={totals.vacant} accent="text-vacant" />
        <Stat label="Occupied" value={totals.occupied} accent="text-occupied" />
        <Stat label="Under repair" value={totals.repair} accent="text-repair" />
      </div>

      {byLocation.size === 0 ? (
        <div className="card text-center text-charcoal-soft">
          No units yet — add units to see the vacancy breakdown.
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byLocation.values()).map((loc) => {
            const lTotals = loc.rows.reduce(
              (a, r) => ({
                vacant: a.vacant + r.vacant_units,
                occupied: a.occupied + r.occupied_units,
                repair: a.repair + r.under_repair_units,
              }),
              { vacant: 0, occupied: 0, repair: 0 },
            );
            return (
              <div key={loc.name} className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-charcoal">{loc.name}</h2>
                  <span className="text-sm text-charcoal-soft">
                    {lTotals.occupied} occupied · {lTotals.vacant} vacant
                    {lTotals.repair > 0 && ` · ${lTotals.repair} repair`}
                  </span>
                </div>
                <OccupancyBar {...lTotals} />
                <div className="mt-4 space-y-2">
                  {loc.rows.map((r) => (
                    <div
                      key={r.rental_type}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-charcoal">{RENTAL_TYPE_LABELS[r.rental_type]}</span>
                      <span className="text-charcoal-soft">
                        <span className="font-medium text-occupied">{r.occupied_units}</span> occ ·{" "}
                        <span className="font-medium text-vacant">{r.vacant_units}</span> vac
                        {r.under_repair_units > 0 && (
                          <>
                            {" · "}
                            <span className="font-medium text-repair">{r.under_repair_units}</span> rep
                          </>
                        )}{" "}
                        / {r.total_units}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-charcoal-soft">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
