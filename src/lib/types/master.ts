/** Stage 3 master-record types (products, customers, suppliers). */

export interface Unit {
  id: string;
  code: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  parent_id: string | null;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  is_active: boolean;
}

export type VatClassification =
  | "vatable"
  | "vat_exempt"
  | "zero_rated"
  | "no_vat";

export interface SellingUnit {
  unit_id: string;
  conversion_to_base: number;
  is_default_sell: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  category_id: string | null;
  brand_id: string | null;
  color: string | null;
  width: string | null;
  thickness: string | null;
  design: string | null;
  shade: string | null;
  model: string | null;
  wattage: string | null;
  capacity: string | null;
  description: string | null;
  image_path: string | null;
  base_unit_id: string;
  purchase_unit_id: string | null;
  standard_roll_length: number | null;
  cost: number;
  regular_price: number;
  distributor_price: number | null;
  vat_classification: VatClassification;
  preferred_supplier_id: string | null;
  is_active: boolean;
}

export type CreditTerms =
  | "cash"
  | "net_15"
  | "net_30"
  | "net_45"
  | "net_60"
  | "custom";

export interface CustomerCategory {
  id: string;
  code: string;
  name: string;
}

export interface Customer {
  id: string;
  branch_id: string;
  name: string;
  company_name: string | null;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  billing_address: string | null;
  tin: string | null;
  category_id: string | null;
  credit_terms: CreditTerms;
  credit_term_days: number;
  credit_limit: number;
  tax_classification: VatClassification;
  is_withholding_agent: boolean;
  notes: string | null;
  is_active: boolean;
}

export interface CustomerProductPrice {
  id: string;
  customer_id: string;
  product_id: string;
  unit_id: string;
  price: number;
}

export type SupplierType = "local" | "overseas";

export interface Supplier {
  id: string;
  supplier_type: SupplierType;
  company_name: string;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  tin: string | null;
  payment_terms: string | null;
  currency_reference: string | null;
  notes: string | null;
  is_active: boolean;
}
