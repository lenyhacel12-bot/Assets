import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
}

/** Read-only key/value display used by the entity "view" pages. */
export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="grid gap-4 rounded-lg border bg-card p-6 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-sm">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
