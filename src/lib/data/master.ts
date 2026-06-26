import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Brand,
  Customer,
  CustomerCategory,
  CustomerProductPrice,
  Product,
  ProductCategory,
  SellingUnit,
  Supplier,
  Unit,
} from "@/lib/types/master";

export const PAGE_SIZE = 20;

export type StatusFilter = "active" | "inactive" | "all";

export interface ListParams {
  q?: string;
  page?: number;
  status?: StatusFilter;
}

export interface ListResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageCount: number;
}

function bounds(page: number): { from: number; to: number; page: number } {
  const p = Math.max(1, page);
  const from = (p - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1, page: p };
}

function sanitize(term: string): string {
  return term.replace(/[%,()]/g, "").trim();
}

function result<T>(
  rows: T[] | null,
  count: number | null,
  page: number,
): ListResult<T> {
  const total = count ?? 0;
  return {
    rows: rows ?? [],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

// --- Reference lists -------------------------------------------------------
export async function listUnits(): Promise<Unit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("units")
    .select("id, code, name")
    .order("name");
  return data ?? [];
}

export async function listProductCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_categories")
    .select("id, name, parent_id, is_active")
    .order("name");
  return data ?? [];
}

export async function listBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name, is_active")
    .order("name");
  return data ?? [];
}

export async function listCustomerCategories(): Promise<CustomerCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customer_categories")
    .select("id, code, name")
    .order("name");
  return data ?? [];
}

// --- Products --------------------------------------------------------------
export async function listProducts(
  params: ListParams,
): Promise<ListResult<Product>> {
  const supabase = await createClient();
  const { from, to, page } = bounds(params.page ?? 1);
  const status = params.status ?? "active";

  let query = supabase.from("products").select("*", { count: "exact" });
  if (status === "active") query = query.eq("is_active", true);
  else if (status === "inactive") query = query.eq("is_active", false);
  if (params.q) {
    const term = sanitize(params.q);
    if (term)
      query = query.or(
        `sku.ilike.%${term}%,name.ilike.%${term}%,barcode.ilike.%${term}%`,
      );
  }
  const { data, count } = await query.order("name").range(from, to);
  return result<Product>(data as Product[] | null, count, page);
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Product) ?? null;
}

/** Lightweight list of active products for pickers (id/sku/name). */
export async function listActiveProductsLite(): Promise<
  Pick<Product, "id" | "name" | "sku">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, sku")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as Pick<Product, "id" | "name" | "sku">[];
}

export async function getProductSellingUnits(
  productId: string,
): Promise<SellingUnit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_selling_units")
    .select("unit_id, conversion_to_base, is_default_sell")
    .eq("product_id", productId);
  return (data ?? []) as SellingUnit[];
}

/** Existing SKUs/barcodes for import duplicate detection. */
export async function getExistingSkusAndBarcodes(): Promise<{
  skus: Set<string>;
  barcodes: Set<string>;
}> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("sku, barcode");
  const skus = new Set<string>();
  const barcodes = new Set<string>();
  for (const row of data ?? []) {
    if (row.sku) skus.add(row.sku);
    if (row.barcode) barcodes.add(row.barcode);
  }
  return { skus, barcodes };
}

// --- Customers -------------------------------------------------------------
export async function listCustomers(
  params: ListParams,
): Promise<ListResult<Customer>> {
  const supabase = await createClient();
  const { from, to, page } = bounds(params.page ?? 1);
  const status = params.status ?? "active";

  let query = supabase.from("customers").select("*", { count: "exact" });
  if (status === "active") query = query.eq("is_active", true);
  else if (status === "inactive") query = query.eq("is_active", false);
  if (params.q) {
    const term = sanitize(params.q);
    if (term)
      query = query.or(
        `name.ilike.%${term}%,company_name.ilike.%${term}%,contact_person.ilike.%${term}%`,
      );
  }
  const { data, count } = await query.order("name").range(from, to);
  return result<Customer>(data as Customer[] | null, count, page);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Customer) ?? null;
}

export async function getCustomerPrices(
  customerId: string,
): Promise<CustomerProductPrice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customer_product_prices")
    .select("id, customer_id, product_id, unit_id, price")
    .eq("customer_id", customerId);
  return (data ?? []) as CustomerProductPrice[];
}

// --- Suppliers -------------------------------------------------------------
export async function listSuppliers(
  params: ListParams,
): Promise<ListResult<Supplier>> {
  const supabase = await createClient();
  const { from, to, page } = bounds(params.page ?? 1);
  const status = params.status ?? "active";

  let query = supabase.from("suppliers").select("*", { count: "exact" });
  if (status === "active") query = query.eq("is_active", true);
  else if (status === "inactive") query = query.eq("is_active", false);
  if (params.q) {
    const term = sanitize(params.q);
    if (term)
      query = query.or(
        `company_name.ilike.%${term}%,contact_person.ilike.%${term}%,email.ilike.%${term}%`,
      );
  }
  const { data, count } = await query.order("company_name").range(from, to);
  return result<Supplier>(data as Supplier[] | null, count, page);
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Supplier) ?? null;
}
