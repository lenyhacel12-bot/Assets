import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { toCsv } from "@/lib/import/csv-export";

/** Export suppliers visible to the current user (RLS-filtered) as CSV. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select(
      "company_name, supplier_type, contact_person, contact_number, email, address, tin, payment_terms, currency_reference, is_active",
    )
    .order("company_name");

  const csv = toCsv(
    [
      "company_name",
      "supplier_type",
      "contact_person",
      "contact_number",
      "email",
      "address",
      "tin",
      "payment_terms",
      "currency_reference",
      "is_active",
    ],
    data ?? [],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="suppliers.csv"',
    },
  });
}
