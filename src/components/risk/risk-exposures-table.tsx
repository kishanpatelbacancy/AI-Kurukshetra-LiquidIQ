import { ShieldAlert } from "lucide-react";

import type { RiskExposureListItem } from "@/lib/actions/risk";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { RiskSeverityBadge } from "@/components/risk/risk-severity-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RiskExposuresTable({
  exposures,
}: {
  exposures: RiskExposureListItem[];
}) {
  if (exposures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 py-16 text-center">
        <ShieldAlert className="mb-4 size-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-300">No risk exposures found</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add risk exposure records to populate the watchlist and severity summary.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="h-12 px-4 text-slate-400">Exposure</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Entity</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Severity</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Hedge</TableHead>
              <TableHead className="h-12 px-4 text-right text-slate-400">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exposures.map((exposure) => (
              <TableRow
                key={exposure.id}
                className="h-12 border-slate-700 hover:bg-slate-700/50"
              >
                <TableCell className="px-4 text-slate-200">
                  <div>
                    <p className="font-medium capitalize">
                      {exposure.risk_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {exposure.currency_pair ?? "No currency pair"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-slate-300">
                  <div>
                    <p>{exposure.entity_name ?? "Unassigned"}</p>
                    <p className="text-xs text-slate-500">
                      {exposure.counterparty ?? "No counterparty"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <RiskSeverityBadge severity={exposure.severity} />
                </TableCell>
                <TableCell className="px-4 text-slate-300">
                  {formatPercent(Number(exposure.hedge_ratio) / 100)}
                </TableCell>
                <TableCell className="px-4 text-right font-medium text-slate-100">
                  {formatCurrency(
                    Number(exposure.exposure_amount),
                    exposure.base_currency,
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {exposures.map((exposure) => (
          <div
            key={exposure.id}
            className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium capitalize text-slate-100">
                  {exposure.risk_type.replace("_", " ")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {exposure.entity_name ?? "Unassigned entity"}
                </p>
              </div>
              <RiskSeverityBadge severity={exposure.severity} />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-100">
              {formatCurrency(
                Number(exposure.exposure_amount),
                exposure.base_currency,
              )}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Hedge {formatPercent(Number(exposure.hedge_ratio) / 100)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {exposure.maturity_date
                ? `Matures ${formatDate(exposure.maturity_date)}`
                : "No maturity date set"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
