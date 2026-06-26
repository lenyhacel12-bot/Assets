import { buildImportTemplate } from "@/lib/import/products-csv";

/** Download the product-import CSV template. */
export function GET() {
  return new Response(buildImportTemplate(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="product-import-template.csv"',
    },
  });
}
