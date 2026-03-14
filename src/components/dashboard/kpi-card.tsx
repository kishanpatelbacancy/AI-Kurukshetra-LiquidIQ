import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KpiCardProps = {
  changeLabel: string;
  changeTone?: "negative" | "neutral" | "positive";
  description: string;
  icon: LucideIcon;
  title: string;
  value: string;
};

export function KpiCard({
  changeLabel,
  changeTone = "neutral",
  description,
  icon: Icon,
  title,
  value,
}: KpiCardProps) {
  return (
    <Card className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-100">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-4 pt-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <CardTitle className="mt-3 text-2xl font-bold text-slate-100">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            changeTone === "positive" && "text-green-400",
            changeTone === "negative" && "text-red-400",
            changeTone === "neutral" && "text-slate-400",
          )}
        >
          {changeTone === "positive" ? (
            <ArrowUpRight className="size-3.5" />
          ) : changeTone === "negative" ? (
            <ArrowDownRight className="size-3.5" />
          ) : null}
          <span>{changeLabel}</span>
        </div>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}
