import type { Metadata } from "next";
import { AlertCircle, CalendarRange, CircleDollarSign, TrendingUp } from "lucide-react";

import { CashPositionChart } from "@/components/dashboard/cash-position-chart";
import { ForecastEntryForm } from "@/components/forecasts/forecast-entry-form";
import { ForecastTable } from "@/components/forecasts/forecast-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createForecast, getForecastEntries } from "@/lib/actions/forecasts";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Forecasts | LiquidIQ",
  description: "Review projected cash inflows and outflows in LiquidIQ.",
};

export default async function ForecastsPage() {
  const result = await getForecastEntries();

  if ("error" in result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900/80 px-6 py-16 text-center">
        <AlertCircle className="mb-4 size-12 text-red-500/70" />
        <p className="text-lg font-medium text-slate-300">Failed to load data</p>
        <p className="mt-2 max-w-xl text-sm text-slate-500">{result.error}</p>
      </div>
    );
  }

  const forecasts = result.data;
  const chartData = forecasts.slice(0, 14).map((forecast) => ({
    dateLabel: formatDate(forecast.forecast_date, "MMM d"),
    inflow: Number(forecast.inflow_amount),
    net: Number(forecast.net_position),
    outflow: Number(forecast.outflow_amount),
  }));
  const forecastNet = forecasts.reduce(
    (sum, forecast) => sum + Number(forecast.net_position),
    0,
  );
  const forecastInflow = forecasts.reduce(
    (sum, forecast) => sum + Number(forecast.inflow_amount),
    0,
  );
  const forecastOutflow = forecasts.reduce(
    (sum, forecast) => sum + Number(forecast.outflow_amount),
    0,
  );
  const actualCount = forecasts.filter((forecast) => forecast.is_actual).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <TrendingUp className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Projected net position</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(forecastNet)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <CircleDollarSign className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Projected inflows</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(forecastInflow)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <CircleDollarSign className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Projected outflows</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(forecastOutflow)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <CalendarRange className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Actual entries</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {actualCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {forecasts.length - actualCount} projected entries
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold text-slate-100">
            Cash flow forecast
          </CardTitle>
          <p className="text-sm text-slate-400">
            Visualize near-term inflows, outflows, and net cash position.
          </p>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <CashPositionChart data={chartData} />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
              <p className="text-lg font-medium text-slate-300">
                No forecast data found
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Add forecast lines to start visualizing expected cash movement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.95fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Forecast entries
            </CardTitle>
            <p className="text-sm text-slate-400">
              Track actual and projected movements across treasury categories.
            </p>
          </CardHeader>
          <CardContent>
            <ForecastTable forecasts={forecasts} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Add forecast entry
            </CardTitle>
            <p className="text-sm text-slate-400">
              Capture expected inflows or outflows with confidence and category.
            </p>
          </CardHeader>
          <CardContent>
            <ForecastEntryForm onSubmitAction={createForecast} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
