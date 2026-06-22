import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { Location } from "@/lib/types";
import { UnitsView, type UnitWithLocation } from "./UnitsView";

export default async function UnitsPage() {
  const supabase = createClient();
  const session = await getSessionProfile();

  const [{ data: units }, { data: locations }] = await Promise.all([
    supabase
      .from("units")
      .select("*, location:locations(name)")
      .order("name"),
    supabase.from("locations").select("*").order("name"),
  ]);

  return (
    <UnitsView
      units={(units ?? []) as UnitWithLocation[]}
      locations={(locations ?? []) as Location[]}
      isAdmin={session?.isAdmin ?? false}
    />
  );
}
