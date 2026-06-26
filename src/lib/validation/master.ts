import { z } from "zod";

const vat = z.enum(["vatable", "vat_exempt", "zero_rated", "no_vat"]);

/** Coerce a possibly-empty string field to null. */
const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null));

const optionalUuid = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .transform((v) => (v ? v : null));

const money = z.coerce.number().min(0, "Must be ≥ 0");
const positiveQty = z.coerce.number().positive("Must be greater than 0");

export const sellingUnitSchema = z.object({
  unit_id: z.string().uuid(),
  conversion_to_base: positiveQty,
  is_default_sell: z.boolean().default(false),
});

export const productSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(64),
  name: z.string().trim().min(1, "Name is required").max(200),
  barcode: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => (v ? v : null)),
  category_id: optionalUuid,
  brand_id: optionalUuid,
  color: optionalText,
  width: optionalText,
  thickness: optionalText,
  design: optionalText,
  shade: optionalText,
  model: optionalText,
  wattage: optionalText,
  capacity: optionalText,
  description: optionalText,
  base_unit_id: z.string().uuid("Base unit is required"),
  purchase_unit_id: optionalUuid,
  standard_roll_length: z
    .union([z.coerce.number().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v))),
  cost: money,
  regular_price: money,
  distributor_price: z
    .union([z.coerce.number().min(0), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : Number(v))),
  vat_classification: vat.default("vatable"),
  preferred_supplier_id: optionalUuid,
  is_active: z.coerce.boolean().default(true),
  selling_units: z.array(sellingUnitSchema).default([]),
});

export const customerSchema = z.object({
  branch_id: z.string().uuid("Branch is required"),
  name: z.string().trim().min(1, "Name is required").max(200),
  company_name: optionalText,
  contact_person: optionalText,
  contact_number: optionalText,
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  billing_address: optionalText,
  tin: optionalText,
  category_id: optionalUuid,
  credit_terms: z
    .enum(["cash", "net_15", "net_30", "net_45", "net_60", "custom"])
    .default("cash"),
  credit_term_days: z.coerce.number().int().min(0).default(0),
  credit_limit: money.default(0),
  tax_classification: vat.default("vatable"),
  is_withholding_agent: z.coerce.boolean().default(false),
  notes: optionalText,
  is_active: z.coerce.boolean().default(true),
});

export const supplierSchema = z.object({
  supplier_type: z.enum(["local", "overseas"]).default("local"),
  company_name: z.string().trim().min(1, "Company name is required").max(200),
  contact_person: optionalText,
  contact_number: optionalText,
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  address: optionalText,
  tin: optionalText,
  payment_terms: optionalText,
  currency_reference: optionalText,
  notes: optionalText,
  is_active: z.coerce.boolean().default(true),
});

export const customerPriceSchema = z.object({
  product_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  price: money,
});

export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
