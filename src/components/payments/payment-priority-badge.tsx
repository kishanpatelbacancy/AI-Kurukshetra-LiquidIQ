import { cn } from "@/lib/utils";
import type { PaymentPriority } from "@/types/database";

const priorityStyles: Record<PaymentPriority, string> = {
  high: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  low: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  normal: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  urgent: "border-red-500/20 bg-red-500/10 text-red-400",
};

export function PaymentPriorityBadge({
  priority,
}: {
  priority: PaymentPriority;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}
