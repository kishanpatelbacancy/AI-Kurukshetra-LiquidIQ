import { cn } from "@/lib/utils";

type AccountStatusBadgeProps = {
  status: "active" | "frozen" | "inactive";
};

const statusStyles: Record<AccountStatusBadgeProps["status"], string> = {
  active: "border-green-500/20 bg-green-500/10 text-green-400",
  frozen: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  inactive: "border-slate-500/20 bg-slate-500/10 text-slate-400",
};

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
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
