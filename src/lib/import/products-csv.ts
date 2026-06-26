/**
 * Pure CSV parsing + product-import validation. No I/O — the server action
 * supplies the DB context (existing SKUs/barcodes, valid unit codes) and
 * persists the result. This keeps the rules unit-testable.
 */

/** Columns of the downloadable product-import template (order preserved). */
export const PRODUCT_IMPORT_COLUMNS = [
  "sku",
  "name",
  "base_unit",
  "barcode",
  "category",
  "brand",
  "cost",
  "regular_price",
  "distributor_price",
  "vat_classification",
  "standard_roll_length",
  "color",
  "width",
  "thickness",
] as const;

export type ImportColumn = (typeof PRODUCT_IMPORT_COLUMNS)[number];

const REQUIRED_COLUMNS: ImportColumn[] = ["sku", "name", "base_unit"];
const VAT_VALUES = ["vatable", "vat_exempt", "zero_rated", "no_vat"];

export interface ParsedProductRow {
  sku: string;
  name: string;
  base_unit: string;
  barcode: string | null;
  category: string | null;
  brand: string | null;
  cost: number;
  regular_price: number;
  distributor_price: number | null;
  vat_classification: string;
  standard_roll_length: number | null;
  color: string | null;
  width: string | null;
  thickness: string | null;
}

export interface AnalyzedRow {
  /** 1-based data row number (excludes the header). */
  rowNumber: number;
  raw: Record<string, string>;
  data: ParsedProductRow | null;
  errors: string[];
}

export interface ImportAnalysis {
  missingColumns: string[];
  rows: AnalyzedRow[];
  validCount: number;
  errorCount: number;
}

export interface ImportContext {
  unitCodes: string[];
  existingSkus: Set<string>;
  existingBarcodes: Set<string>;
}

/**
 * Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes (""),
 * embedded commas/newlines, and CRLF. Returns an array of rows of cells.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  // Strip a leading BOM if present.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      pushField();
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      pushField();
      pushRow();
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // Flush trailing field/row (unless the input ended with a newline).
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }
  return rows;
}

function toNumberOrError(
  value: string,
  field: string,
  errors: string[],
  { required }: { required: boolean },
): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    if (required) {
      errors.push(`${field} is required`);
      return null;
    }
    return null;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) {
    errors.push(`${field} must be a number ≥ 0`);
    return null;
  }
  return n;
}

/** Validate parsed CSV text into rows, collecting per-row errors. */
export function analyzeProductImport(
  csvText: string,
  ctx: ImportContext,
): ImportAnalysis {
  const grid = parseCsv(csvText).filter(
    (r) => r.length > 1 || (r[0] ?? "").trim() !== "",
  );

  if (grid.length === 0) {
    return {
      missingColumns: [...REQUIRED_COLUMNS],
      rows: [],
      validCount: 0,
      errorCount: 0,
    };
  }

  const header = grid[0]!.map((h) => h.trim().toLowerCase());
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missingColumns.length > 0) {
    return { missingColumns, rows: [], validCount: 0, errorCount: 0 };
  }

  const colIndex = (name: ImportColumn) => header.indexOf(name);
  const unitSet = new Set(ctx.unitCodes.map((c) => c.toLowerCase()));

  // Track duplicates WITHIN the file.
  const seenSkus = new Map<string, number>();
  const seenBarcodes = new Map<string, number>();

  const rows: AnalyzedRow[] = [];
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r]!;
    const get = (name: ImportColumn) => (cells[colIndex(name)] ?? "").trim();
    const raw: Record<string, string> = {};
    for (const c of PRODUCT_IMPORT_COLUMNS) raw[c] = get(c);

    const errors: string[] = [];
    const sku = get("sku");
    const name = get("name");
    const baseUnit = get("base_unit").toLowerCase();
    const barcode = get("barcode");

    if (!sku) errors.push("sku is required");
    if (!name) errors.push("name is required");
    if (!baseUnit) errors.push("base_unit is required");
    else if (!unitSet.has(baseUnit))
      errors.push(`base_unit "${baseUnit}" is not a known unit`);

    if (sku) {
      if (seenSkus.has(sku))
        errors.push(`duplicate sku in file (row ${seenSkus.get(sku)})`);
      else seenSkus.set(sku, r);
      if (ctx.existingSkus.has(sku)) errors.push("sku already exists");
    }
    if (barcode) {
      if (seenBarcodes.has(barcode))
        errors.push(
          `duplicate barcode in file (row ${seenBarcodes.get(barcode)})`,
        );
      else seenBarcodes.set(barcode, r);
      if (ctx.existingBarcodes.has(barcode))
        errors.push("barcode already exists");
    }

    const cost =
      toNumberOrError(get("cost"), "cost", errors, { required: false }) ?? 0;
    const regular =
      toNumberOrError(get("regular_price"), "regular_price", errors, {
        required: false,
      }) ?? 0;
    const distributor = toNumberOrError(
      get("distributor_price"),
      "distributor_price",
      errors,
      { required: false },
    );
    const rollLen = toNumberOrError(
      get("standard_roll_length"),
      "standard_roll_length",
      errors,
      { required: false },
    );

    const vatRaw = get("vat_classification").toLowerCase();
    const vat = vatRaw || "vatable";
    if (vatRaw && !VAT_VALUES.includes(vatRaw))
      errors.push(`vat_classification "${vatRaw}" is invalid`);

    const data: ParsedProductRow | null =
      errors.length === 0
        ? {
            sku,
            name,
            base_unit: baseUnit,
            barcode: barcode || null,
            category: get("category") || null,
            brand: get("brand") || null,
            cost,
            regular_price: regular,
            distributor_price: distributor,
            vat_classification: vat,
            standard_roll_length: rollLen,
            color: get("color") || null,
            width: get("width") || null,
            thickness: get("thickness") || null,
          }
        : null;

    rows.push({ rowNumber: r, raw, data, errors });
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  return {
    missingColumns: [],
    rows,
    validCount,
    errorCount: rows.length - validCount,
  };
}

/** Build the CSV template text (header + one example row). */
export function buildImportTemplate(): string {
  const example: Record<ImportColumn, string> = {
    sku: "FR-4-50",
    name: "Frosted Reeded 4 ft x 50 m",
    base_unit: "meter",
    barcode: "4806000000011",
    category: "Frosted",
    brand: "Acme",
    cost: "30",
    regular_price: "45",
    distributor_price: "40",
    vat_classification: "vatable",
    standard_roll_length: "50",
    color: "Clear",
    width: "4ft",
    thickness: "",
  };
  const header = PRODUCT_IMPORT_COLUMNS.join(",");
  const row = PRODUCT_IMPORT_COLUMNS.map((c) => example[c]).join(",");
  return `${header}\n${row}\n`;
}
