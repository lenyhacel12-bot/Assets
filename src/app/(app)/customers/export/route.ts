import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { toCsv } from "@/lib/import/csv-export";

/** Export customers visible to the current user (RLS-filtered) as CSV. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select(
      "name, company_name, contact_person, contact_number, email, tin, credit_terms, credit_limit, tax_classification, is_active",
    )
    .order("name");

  const csv = toCsv(
    [
      "name",
      "company_name",
      "contact_person",
      "contact_number",
      "email",
      "tin",
      "credit_terms",
      "credit_limit",
      "tax_classification",
      "is_active",
    ],
    data ?? [],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers.csv"',
    },
  });
}
