import { describe, it, expect } from "vitest";
import {
  parseCsv,
  analyzeProductImport,
  buildImportTemplate,
  PRODUCT_IMPORT_COLUMNS,
  type ImportContext,
} from "@/lib/import/products-csv";

const ctx = (over: Partial<ImportContext> = {}): ImportContext => ({
  unitCodes: ["roll", "meter", "piece", "liter", "box"],
  existingSkus: new Set<string>(),
  existingBarcodes: new Set<string>(),
  ...over,
});

describe("parseCsv", () => {
  it("parses quoted fields with embedded commas and newlines", () => {
    const grid = parseCsv('a,b\n"x,1","line\n2"\n');
    expect(grid).toEqual([
      ["a", "b"],
      ["x,1", "line\n2"],
    ]);
  });

  it("handles escaped quotes and CRLF", () => {
    const grid = parseCsv('h\r\n"she said ""hi"""\r\n');
    expect(grid).toEqual([["h"], ['she said "hi"']]);
  });
});

describe("analyzeProductImport", () => {
  const header = PRODUCT_IMPORT_COLUMNS.join(",");

  it("accepts a valid row", () => {
    const csv = `${header}\nSKU1,Widget,meter,,,,10,20,,vatable,,,,`;
    const res = analyzeProductImport(csv, ctx());
    expect(res.missingColumns).toEqual([]);
    expect(res.validCount).toBe(1);
    expect(res.errorCount).toBe(0);
    expect(res.rows[0]!.data?.sku).toBe("SKU1");
  });

  it("reports missing required columns", () => {
    const res = analyzeProductImport("sku,name\nX,Y", ctx());
    expect(res.missingColumns).toContain("base_unit");
  });

  it("flags required-field, unit and numeric errors", () => {
    const csv = `${header}\n,NoSku,parsec,,,,abc,20,,vatable,,,,`;
    const res = analyzeProductImport(csv, ctx());
    const errs = res.rows[0]!.errors.join(" | ");
    expect(errs).toMatch(/sku is required/);
    expect(errs).toMatch(/not a known unit/);
    expect(errs).toMatch(/cost must be a number/);
    expect(res.validCount).toBe(0);
  });

  it("detects duplicate SKUs within the file", () => {
    const csv = `${header}\nDUP,A,meter,,,,,,,,,,,\nDUP,B,meter,,,,,,,,,,,`;
    const res = analyzeProductImport(csv, ctx());
    expect(res.rows[1]!.errors.join(" ")).toMatch(/duplicate sku in file/);
    expect(res.validCount).toBe(1);
  });

  it("detects SKUs and barcodes that already exist", () => {
    const csv = `${header}\nEX1,A,meter,BC1,,,,,,,,,,`;
    const res = analyzeProductImport(
      csv,
      ctx({
        existingSkus: new Set(["EX1"]),
        existingBarcodes: new Set(["BC1"]),
      }),
    );
    const errs = res.rows[0]!.errors.join(" | ");
    expect(errs).toMatch(/sku already exists/);
    expect(errs).toMatch(/barcode already exists/);
  });

  it("rejects an invalid vat_classification", () => {
    const csv = `${header}\nSKU9,A,meter,,,,,,,bogus,,,,`;
    const res = analyzeProductImport(csv, ctx());
    expect(res.rows[0]!.errors.join(" ")).toMatch(/vat_classification/);
  });

  it("template round-trips to a valid row", () => {
    const res = analyzeProductImport(buildImportTemplate(), ctx());
    expect(res.validCount).toBe(1);
    expect(res.errorCount).toBe(0);
  });
});
