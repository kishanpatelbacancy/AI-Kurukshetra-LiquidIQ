import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Building2, Landmark, Plus } from "lucide-react";

import { AccountsTable } from "@/components/accounts/accounts-table";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { getBankAccounts } from "@/lib/actions/bank-accounts";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bank Accounts | LiquidIQ",
  description: "View connected bank accounts and balances in LiquidIQ.",
};

export default async function AccountsPage() {
  const result = await getBankAccounts();

  if ("error" in result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900/80 px-6 py-16 text-center">
        <AlertCircle className="mb-4 size-12 text-red-500/70" />
        <p className="text-lg font-medium text-slate-300">Failed to load data</p>
        <p className="mt-2 max-w-xl text-sm text-slate-500">{result.error}</p>
      </div>
    );
  }

  const accounts = result.data;
  const totalCurrent = accounts.reduce(
    (sum, account) => sum + Number(account.current_balance),
    0,
  );
  const totalAvailable = accounts.reduce(
    (sum, account) => sum + Number(account.available_balance),
    0,
  );
  const activeAccounts = accounts.filter((account) => account.status === "active");
  const countries = new Set(accounts.map((account) => account.country).filter(Boolean));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-green-400">
            Bank Accounts
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">
            Connected banking footprint
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Track operating cash, reserve liquidity, and account status across
            entities. Every row opens the full account detail with recent activity.
          </p>
        </div>

        <Link
          href="/accounts/add"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 bg-green-600 text-white hover:bg-green-500",
          )}
        >
          <Plus className="mr-2 size-4" />
          Add Account
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <Landmark className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Total current balance</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(totalCurrent)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <Building2 className="size-5" />
            </div>
            <p className="mt-4 text-sm text-slate-400">Available liquidity</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {formatCompactCurrency(totalAvailable)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Active accounts</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {activeAccounts.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {accounts.length - activeAccounts.length} non-active accounts
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Country coverage</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">
              {countries.size}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Delta {formatCurrency(totalAvailable - totalCurrent)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <AccountsTable accounts={accounts} />
      </section>
    </div>
  );
}
