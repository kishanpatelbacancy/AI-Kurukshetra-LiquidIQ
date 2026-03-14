import type { Metadata } from "next";
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  Landmark,
  ShieldAlert,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import { CashPositionChart } from "@/components/dashboard/cash-position-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Dashboard | LiquidIQ",
  description: "LiquidIQ treasury dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [accountsResult, forecastsResult, paymentsResult, exposuresResult] =
    await Promise.all([
      supabase
        .from("bank_accounts")
        .select(
          "id, account_name, bank_name, currency, status, current_balance, available_balance, last_synced_at",
        )
        .order("available_balance", { ascending: false }),
      supabase
        .from("cash_flow_forecasts")
        .select("id, forecast_date, inflow_amount, outflow_amount, net_position")
        .order("forecast_date", { ascending: true })
        .limit(7),
      supabase
        .from("payments")
        .select(
          "id, payment_ref, beneficiary_name, amount, currency, status, priority, value_date",
        )
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("risk_exposures")
        .select(
          "id, risk_type, severity, exposure_amount, base_currency, entity_name, maturity_date",
        )
        .order("exposure_date", { ascending: false })
        .limit(5),
    ]);

  const firstError =
    accountsResult.error ??
    forecastsResult.error ??
    paymentsResult.error ??
    exposuresResult.error;

  if (firstError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900/80 px-6 py-16 text-center">
        <AlertCircle className="mb-4 size-12 text-red-500/70" />
        <p className="text-lg font-medium text-slate-300">Failed to load data</p>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          {firstError.message}
        </p>
      </div>
    );
  }

  const accounts = accountsResult.data ?? [];
  const forecasts = forecastsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const exposures = exposuresResult.data ?? [];

  const totalCash = accounts.reduce(
    (sum, account) => sum + Number(account.current_balance),
    0,
  );
  const totalAvailable = accounts.reduce(
    (sum, account) => sum + Number(account.available_balance),
    0,
  );
  const activeAccounts = accounts.filter((account) => account.status === "active");
  const pendingPayments = payments.filter((payment) =>
    ["approved", "pending_approval", "processing"].includes(payment.status),
  );
  const pendingPaymentValue = pendingPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );
  const criticalExposureValue = exposures
    .filter((exposure) =>
      ["critical", "high"].includes(exposure.severity),
    )
    .reduce((sum, exposure) => sum + Number(exposure.exposure_amount), 0);
  const forecastNet = forecasts.reduce(
    (sum, entry) => sum + Number(entry.net_position),
    0,
  );
  const chartData = forecasts.map((entry) => ({
    dateLabel: formatDate(entry.forecast_date, "MMM d"),
    inflow: Number(entry.inflow_amount),
    net: Number(entry.net_position),
    outflow: Number(entry.outflow_amount),
  }));
  const latestSync = accounts
    .map((account) => account.last_synced_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/10 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-green-400">
          Treasury Command Center
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
          Live cash visibility across treasury operations
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          This view combines connected account balances, short-term forecast data,
          payment queue pressure, and open risk exposure so treasury can spot cash
          movement before it becomes a funding issue.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
            {activeAccounts.length} active accounts
          </span>
          <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
            {payments.length} recent payments tracked
          </span>
          <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
            {latestSync ? `Latest sync ${formatDate(latestSync, "MMM d, h:mm a")}` : "Sync pending"}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          title="Total cash position"
          value={formatCompactCurrency(totalCash)}
          icon={Wallet}
          changeTone={totalCash >= 0 ? "positive" : "negative"}
          changeLabel={`${accounts.length} connected accounts`}
          description="Current balances across operating, reserve, and credit accounts."
        />
        <KpiCard
          title="Available liquidity"
          value={formatCompactCurrency(totalAvailable)}
          icon={Landmark}
          changeTone="positive"
          changeLabel={`${formatCurrency(totalAvailable - totalCash)} vs booked balance`}
          description="Immediately usable cash after restrictions and pending holds."
        />
        <KpiCard
          title="Pending payments"
          value={formatCompactCurrency(pendingPaymentValue)}
          icon={ArrowUpDown}
          changeTone={pendingPayments.length > 0 ? "negative" : "neutral"}
          changeLabel={`${pendingPayments.length} items awaiting release`}
          description="Approved, processing, and pending-approval outflows in the queue."
        />
        <KpiCard
          title="High-risk exposure"
          value={formatCompactCurrency(criticalExposureValue)}
          icon={ShieldAlert}
          changeTone={criticalExposureValue > 0 ? "negative" : "neutral"}
          changeLabel={`${exposures.filter((item) => item.severity !== "low").length} elevated positions`}
          description="Critical and high-severity exposures requiring treasury attention."
        />
        <KpiCard
          title="7-day forecast net"
          value={formatCompactCurrency(forecastNet)}
          icon={Building2}
          changeTone={forecastNet >= 0 ? "positive" : "negative"}
          changeLabel={`${forecasts.length} forecast points loaded`}
          description="Projected net cash movement from the near-term forecast horizon."
        />
        <KpiCard
          title="Risk watchlist"
          value={String(exposures.length)}
          icon={TriangleAlert}
          changeTone={exposures.some((item) => item.severity === "critical") ? "negative" : "neutral"}
          changeLabel={
            exposures.some((item) => item.severity === "critical")
              ? "Critical exposure detected"
              : "No critical exposures"
          }
          description="Open exposure lines currently surfaced on the treasury watchlist."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Cash flow forecast
            </CardTitle>
            <p className="text-sm text-slate-400">
              Inflows, outflows, and net position over the next 7 forecast entries.
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
                  Add cash flow forecast records to visualize upcoming inflows and
                  outflows here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Risk watchlist
            </CardTitle>
            <p className="text-sm text-slate-400">
              Latest exposures sorted by reporting recency.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {exposures.length > 0 ? (
              exposures.map((exposure) => (
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
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        exposure.severity === "critical"
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : exposure.severity === "high"
                            ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                            : exposure.severity === "medium"
                              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {exposure.severity}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-100">
                    {formatCurrency(
                      Number(exposure.exposure_amount),
                      exposure.base_currency,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {exposure.maturity_date
                      ? `Matures ${formatDate(exposure.maturity_date)}`
                      : "No maturity date set"}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No risk exposures found
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Add risk exposure records to populate the watchlist and severity
                  monitoring.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Top liquidity accounts
            </CardTitle>
            <p className="text-sm text-slate-400">
              Accounts ordered by available balance.
            </p>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                      <TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="h-12 px-4 text-slate-400">Account</TableHead>
                        <TableHead className="h-12 px-4 text-slate-400">Bank</TableHead>
                        <TableHead className="h-12 px-4 text-slate-400">Status</TableHead>
                        <TableHead className="h-12 px-4 text-right text-slate-400">
                          Available
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.slice(0, 5).map((account) => (
                        <TableRow
                          key={account.id}
                          className="h-12 border-slate-700 hover:bg-slate-700/50"
                        >
                          <TableCell className="px-4 text-slate-200">
                            <div>
                              <p className="font-medium">{account.account_name}</p>
                              <p className="text-xs text-slate-500">
                                {account.currency}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-slate-300">
                            {account.bank_name}
                          </TableCell>
                          <TableCell className="px-4">
                            <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-green-400">
                              {account.status}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 text-right font-medium text-slate-100">
                            {formatCurrency(
                              Number(account.available_balance),
                              account.currency,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3 md:hidden">
                  {accounts.slice(0, 5).map((account) => (
                    <div
                      key={account.id}
                      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-100">
                            {account.account_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {account.bank_name}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-green-400">
                          {account.status}
                        </span>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-slate-100">
                        {formatCurrency(
                          Number(account.available_balance),
                          account.currency,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No bank accounts found
                </p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Add bank accounts in Supabase to populate the liquidity overview.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-100">
              Payment queue
            </CardTitle>
            <p className="text-sm text-slate-400">
              Most recent outbound payment activity.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.length > 0 ? (
              payments.map((payment) => (
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
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        payment.status === "approved" || payment.status === "completed"
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : payment.status === "failed" || payment.status === "rejected"
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : payment.status === "processing"
                              ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                              : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {payment.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-100">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        Priority {payment.priority}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {payment.value_date
                        ? `Value ${formatDate(payment.value_date)}`
                        : "No value date"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No payments found
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Payment activity will appear here once payment records are added.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
