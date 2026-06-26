import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { toCsv } from "@/lib/import/csv-export";

/** Export the product catalogue (RLS-filtered) as CSV. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "sku, name, barcode, cost, regular_price, distributor_price, vat_classification, standard_roll_length, is_active",
    )
    .order("name");

  const csv = toCsv(
    [
      "sku",
      "name",
      "barcode",
      "cost",
      "regular_price",
      "distributor_price",
      "vat_classification",
      "standard_roll_length",
      "is_active",
    ],
    data ?? [],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="products.csv"',
    },
  });
}
