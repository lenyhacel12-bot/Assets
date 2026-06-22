import type { UnitStatus } from "@/lib/types";
import { UNIT_STATUS_LABELS } from "@/lib/types";

const STYLES: Record<UnitStatus, string> = {
  vacant: "bg-amber-100 text-amber-800",
  occupied: "bg-sage-100 text-sage-600",
  under_repair: "bg-clay-100 text-clay-700",
};

const DOT: Record<UnitStatus, string> = {
  vacant: "bg-vacant",
  occupied: "bg-occupied",
  under_repair: "bg-repair",
};

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  return (
    <span className={`badge ${STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {UNIT_STATUS_LABELS[status]}
    </span>
  );
}
