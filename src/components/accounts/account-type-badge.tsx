import { cn } from "@/lib/utils";

type AccountType =
  | "current"
  | "investment"
  | "loan"
  | "money_market"
  | "savings";

const typeStyles: Record<AccountType, string> = {
  current: "border-green-500/20 bg-green-500/10 text-green-400",
  investment: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  loan: "border-red-500/20 bg-red-500/10 text-red-400",
  money_market: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  savings: "border-slate-500/20 bg-slate-500/10 text-slate-300",
};

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        typeStyles[type],
      )}
    >
      {type.replace("_", " ")}
    </span>
  );
}
