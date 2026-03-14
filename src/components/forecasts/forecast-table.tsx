import { LineChart } from "lucide-react";

import type { ForecastListItem } from "@/lib/actions/forecasts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ForecastConfidenceBadge } from "@/components/forecasts/forecast-confidence-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ForecastTable({ forecasts }: { forecasts: ForecastListItem[] }) {
  if (forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 py-16 text-center">
        <LineChart className="mb-4 size-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-300">No forecast entries found</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add your first forecast entry to start projecting near-term liquidity.
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
              <TableHead className="h-12 px-4 text-slate-400">Date</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Entity</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Category</TableHead>
              <TableHead className="h-12 px-4 text-right text-slate-400">Net</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecasts.map((forecast) => (
              <TableRow
                key={forecast.id}
                className="h-12 border-slate-700 hover:bg-slate-700/50"
              >
                <TableCell className="px-4 text-slate-200">
                  <div>
                    <p className="font-medium">{formatDate(forecast.forecast_date)}</p>
                    <p className="text-xs text-slate-500">
                      {forecast.is_actual ? "Actual" : "Forecast"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-slate-300">
                  {forecast.entity_name ?? "Unassigned"}
                </TableCell>
                <TableCell className="px-4 capitalize text-slate-300">
                  {forecast.category ?? "Uncategorized"}
                </TableCell>
                <TableCell className="px-4 text-right font-medium text-slate-100">
                  {formatCurrency(Number(forecast.net_position), forecast.currency)}
                </TableCell>
                <TableCell className="px-4">
                  <ForecastConfidenceBadge confidence={forecast.confidence} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {forecasts.map((forecast) => (
          <div
            key={forecast.id}
            className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-100">
                  {formatDate(forecast.forecast_date)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {forecast.entity_name ?? "Unassigned entity"}
                </p>
              </div>
              <ForecastConfidenceBadge confidence={forecast.confidence} />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-100">
              {formatCurrency(Number(forecast.net_position), forecast.currency)}
            </p>
            <p className="mt-2 text-sm capitalize text-slate-400">
              {forecast.category ?? "Uncategorized"} •{" "}
              {forecast.is_actual ? "Actual" : "Forecast"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
