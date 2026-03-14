import type { Metadata } from "next";
import {
  AlertCircle,
  BadgeAlert,
  BarChart3,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { getCurrencyRates, getRiskExposures } from "@/lib/actions/risk";
import { RiskExposuresTable } from "@/components/risk/risk-exposures-table";
import { RiskSeverityBadge } from "@/components/risk/risk-severity-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Risk | LiquidIQ",
  description: "Monitor treasury exposures and alerts in LiquidIQ.",
};

export default async function RiskPage() {
  const [exposuresResult, ratesResult] = await Promise.all([
    getRiskExposures(),
    getCurrencyRates(),
  ]);

  const firstError =
    ("error" in exposuresResult ? exposuresResult.error : undefined) ??
    ("error" in ratesResult ? ratesResult.error : undefined);

  if (firstError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900/80 px-6 py-16 text-center">
        <AlertCircle className="mb-4 size-12 text-red-500/70" />
        <p className="text-lg font-medium text-slate-300">Failed to load data</p>
        <p className="mt-2 max-w-xl text-sm text-slate-500">{firstError}</p>
      </div>
    );
  }

  const exposures = "data" in exposuresResult ? exposuresResult.data ?? [] : [];
  const rates = "data" in ratesResult ? ratesResult.data ?? [] : [];
  const criticalExposures = exposures.filter(
    (exposure) => exposure.severity === "critical",
  );
  const elevatedExposures = exposures.filter((exposure) =>
    ["critical", "high"].includes(exposure.severity),
  );
  const grossExposure = exposures.reduce(
    (sum, exposure) => sum + Number(exposure.exposure_amount),
    0,
  );
  const mtmExposure = exposures.reduce(
    (sum, exposure) => sum + Number(exposure.mark_to_market ?? 0),
    0,
  );
  const averageHedgeRatio =
    exposures.length > 0
      ? exposures.reduce(
          (sum, exposure) => sum + Number(exposure.hedge_ratio),
          0,
        ) / exposures.length
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Gross exposure</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCurrency(grossExposure)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <BadgeAlert className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Elevated exposures</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {elevatedExposures.length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <TrendingUp className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Mark-to-market</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCurrency(mtmExposure)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <BarChart3 className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Average hedge ratio</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatPercent(averageHedgeRatio / 100)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Exposure dashboard
            </CardTitle>
            <p className="text-sm text-slate-400">
              Latest exposures by entity, severity, and hedge ratio.
            </p>
          </CardHeader>
          <CardContent>
            <RiskExposuresTable exposures={exposures.slice(0, 12)} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Alert queue
            </CardTitle>
            <p className="text-sm text-slate-400">
              Critical and high-severity items that need treasury attention.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {elevatedExposures.length > 0 ? (
              elevatedExposures.slice(0, 6).map((exposure) => (
                <div
                  key={exposure.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium capitalize text-slate-100">
                        {exposure.risk_type.replace("_", " ")}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
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
                  <p className="mt-2 text-xs text-slate-500">
                    {exposure.maturity_date
                      ? `Matures ${formatDate(exposure.maturity_date)}`
                      : "No maturity date set"}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No elevated alerts
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  High and critical exposures will be surfaced here automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              All exposures
            </CardTitle>
            <p className="text-sm text-slate-400">
              Full exposure watchlist ordered by most recent reporting date.
            </p>
          </CardHeader>
          <CardContent>
            <RiskExposuresTable exposures={exposures} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              FX rates snapshot
            </CardTitle>
            <p className="text-sm text-slate-400">
              Latest seeded currency rates used for treasury reference.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {rates.length > 0 ? (
              rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {rate.base}/{rate.target}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(rate.rate_date)} • {rate.source}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-100">
                    {Number(rate.rate).toFixed(4)}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No FX rates found
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Currency rates will appear here once seeded or synced.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {criticalExposures.length > 0 ? (
        <section className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <h3 className="text-lg font-semibold text-red-300">
            Critical exposure alert
          </h3>
          <p className="mt-2 text-sm text-red-200/90">
            {criticalExposures.length} critical exposure
            {criticalExposures.length > 1 ? "s are" : " is"} currently open across
            treasury. Review the alert queue and funding plan before settlement
            windows tighten.
          </p>
        </section>
      ) : null}
    </div>
  );
}
