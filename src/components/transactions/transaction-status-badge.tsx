import { cn } from "@/lib/utils";
import type { TransactionStatus } from "@/types/database";

const statusStyles: Record<TransactionStatus, string> = {
  cancelled: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  completed: "border-green-500/20 bg-green-500/10 text-green-400",
  failed: "border-red-500/20 bg-red-500/10 text-red-400",
  pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  reconciled: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
