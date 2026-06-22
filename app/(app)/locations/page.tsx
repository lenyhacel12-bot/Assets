import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { Location } from "@/lib/types";
import { LocationsView } from "./LocationsView";

export default async function LocationsPage() {
  const supabase = createClient();
  const session = await getSessionProfile();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("name");

  return (
    <LocationsView
      locations={(locations ?? []) as Location[]}
      isAdmin={session?.isAdmin ?? false}
    />
  );
}
