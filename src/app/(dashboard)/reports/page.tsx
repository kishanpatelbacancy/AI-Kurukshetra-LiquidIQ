import type { Metadata } from "next";
import {
  AlertCircle,
  BadgeCheck,
  CircleDollarSign,
  FileBarChart2,
  ShieldCheck,
} from "lucide-react";

import { getBankAccounts } from "@/lib/actions/bank-accounts";
import { getForecastEntries } from "@/lib/actions/forecasts";
import { getPayments } from "@/lib/actions/payments";
import { getRiskExposures } from "@/lib/actions/risk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reports | LiquidIQ",
  description: "Generate treasury and compliance reporting in LiquidIQ.",
};

export default async function ReportsPage() {
  const [accountsResult, forecastsResult, paymentsResult, exposuresResult] =
    await Promise.all([
      getBankAccounts(),
      getForecastEntries(),
      getPayments(),
      getRiskExposures(),
    ]);

  const firstError =
    ("error" in accountsResult ? accountsResult.error : undefined) ??
    ("error" in forecastsResult ? forecastsResult.error : undefined) ??
    ("error" in paymentsResult ? paymentsResult.error : undefined) ??
    ("error" in exposuresResult ? exposuresResult.error : undefined);

  if (firstError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900/80 px-6 py-16 text-center">
        <AlertCircle className="mb-4 size-12 text-red-500/70" />
        <p className="text-lg font-medium text-slate-300">Failed to load data</p>
        <p className="mt-2 max-w-xl text-sm text-slate-500">{firstError}</p>
      </div>
    );
  }

  const accounts = "data" in accountsResult ? accountsResult.data ?? [] : [];
  const forecasts = "data" in forecastsResult ? forecastsResult.data ?? [] : [];
  const payments = "data" in paymentsResult ? paymentsResult.data ?? [] : [];
  const exposures = "data" in exposuresResult ? exposuresResult.data ?? [] : [];

  const totalCash = accounts.reduce(
    (sum, account) => sum + Number(account.current_balance),
    0,
  );
  const totalAvailable = accounts.reduce(
    (sum, account) => sum + Number(account.available_balance),
    0,
  );
  const forecastNet = forecasts.reduce(
    (sum, forecast) => sum + Number(forecast.net_position),
    0,
  );
  const pendingApprovals = payments.filter(
    (payment) => payment.status === "pending_approval",
  );
  const elevatedExposures = exposures.filter((exposure) =>
    ["critical", "high"].includes(exposure.severity),
  );
  const upcomingPayments = payments
    .filter((payment) => payment.value_date)
    .sort((left, right) =>
      String(left.value_date).localeCompare(String(right.value_date)),
    )
    .slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <CircleDollarSign className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Cash position</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(totalCash)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Available {formatCompactCurrency(totalAvailable)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <FileBarChart2 className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Forecast net</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(forecastNet)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Based on {forecasts.length} forecast entries
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <BadgeCheck className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Pending approvals</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {pendingApprovals.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {payments.length} total payments tracked
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <ShieldCheck className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Elevated exposures</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {elevatedExposures.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              High and critical risk items
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Executive summary
            </CardTitle>
            <p className="text-sm text-slate-400">
              Board-ready treasury overview from the current working dataset.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Liquidity posture
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Treasury is holding {formatCurrency(totalAvailable)} in available
                liquidity across {accounts.length} accounts. The booked cash delta
                versus current balance is{" "}
                {formatCurrency(totalAvailable - totalCash)}.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Forecast outlook
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The current forecast horizon indicates a net cash movement of{" "}
                {formatCurrency(forecastNet)} over {forecasts.length} entries,
                mixing actual and projected operating, financing, and FX items.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Controls and risk
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                There are {pendingApprovals.length} payments awaiting approval and{" "}
                {elevatedExposures.length} elevated risk exposures requiring treasury
                review.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Upcoming payments
            </CardTitle>
            <p className="text-sm text-slate-400">
              Nearest dated payment obligations.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {payment.beneficiary_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.payment_ref}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">
                      {formatCurrency(Number(payment.amount), payment.currency)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Value date {payment.value_date ? formatDate(payment.value_date) : "n/a"}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No dated payments found
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Payment obligations will appear here as requests are created.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Cash concentration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.slice(0, 4).map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
              >
                <p className="text-sm font-medium text-slate-100">
                  {account.account_name}
                </p>
                <p className="mt-1 text-xs text-slate-500">{account.bank_name}</p>
                <p className="mt-3 text-lg font-semibold text-slate-100">
                  {formatCurrency(
                    Number(account.available_balance),
                    account.currency,
                  )}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Forecast highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {forecasts.slice(0, 4).map((forecast) => (
              <div
                key={forecast.id}
                className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
              >
                <p className="text-sm font-medium text-slate-100">
                  {forecast.entity_name ?? "Unassigned entity"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(forecast.forecast_date)} •{" "}
                  {forecast.category ?? "uncategorized"}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-100">
                  {formatCurrency(
                    Number(forecast.net_position),
                    forecast.currency,
                  )}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Risk highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exposures.slice(0, 4).map((exposure) => (
              <div
                key={exposure.id}
                className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
              >
                <p className="text-sm font-medium capitalize text-slate-100">
                  {exposure.risk_type.replace("_", " ")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {exposure.entity_name ?? "Unassigned entity"}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-100">
                  {formatCurrency(
                    Number(exposure.exposure_amount),
                    exposure.base_currency,
                  )}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
