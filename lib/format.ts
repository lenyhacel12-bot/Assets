// Philippine Peso (₱) currency formatting used throughout the app.
const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPeso(amount: number | null | undefined): string {
  return pesoFormatter.format(amount ?? 0);
}

// Whole-peso variant for compact stat cards (e.g. ₱12,500).
const pesoWhole = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatPesoWhole(amount: number | null | undefined): string {
  return pesoWhole.format(amount ?? 0);
}

// Days remaining until a date (negative = expired N days ago).
export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(date);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
