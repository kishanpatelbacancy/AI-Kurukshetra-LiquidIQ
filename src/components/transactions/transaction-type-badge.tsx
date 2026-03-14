import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/database";

const typeStyles: Record<TransactionType, string> = {
  credit: "border-green-500/20 bg-green-500/10 text-green-400",
  debit: "border-red-500/20 bg-red-500/10 text-red-400",
  fee: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  fx: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  interest: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  transfer: "border-orange-500/20 bg-orange-500/10 text-orange-400",
};

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        typeStyles[type],
      )}
    >
      {type}
    </span>
  );
}
