/** Serialize rows to RFC-4180 CSV. Pure (testable). */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(
  columns: string[],
  rows: Record<string, unknown>[],
): string {
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c])).join(","))
    .join("\n");
  return body ? `${header}\n${body}\n` : `${header}\n`;
}
