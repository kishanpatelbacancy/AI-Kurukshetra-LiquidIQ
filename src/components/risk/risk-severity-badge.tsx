import { cn } from "@/lib/utils";
import type { RiskSeverity } from "@/types/database";

const severityStyles: Record<RiskSeverity, string> = {
  critical: "border-red-500/20 bg-red-500/10 text-red-400",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  low: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
};

export function RiskSeverityBadge({ severity }: { severity: RiskSeverity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        severityStyles[severity],
      )}
    >
      {severity}
    </span>
  );
}
