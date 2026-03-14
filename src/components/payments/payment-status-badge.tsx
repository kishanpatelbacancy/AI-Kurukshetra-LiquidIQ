import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/database";

const statusStyles: Record<PaymentStatus, string> = {
  approved: "border-green-500/20 bg-green-500/10 text-green-400",
  cancelled: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  completed: "border-green-500/20 bg-green-500/10 text-green-400",
  draft: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  failed: "border-red-500/20 bg-red-500/10 text-red-400",
  pending_approval: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  processing: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  rejected: "border-red-500/20 bg-red-500/10 text-red-400",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
