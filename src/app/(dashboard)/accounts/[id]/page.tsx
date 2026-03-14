import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowUpDown,
  PencilLine,
  RefreshCw,
  Wallet,
} from "lucide-react";

import {
  getBankAccountById,
  getTransactionsByBankAccount,
} from "@/lib/actions/bank-accounts";
import { AccountStatusBadge } from "@/components/accounts/account-status-badge";
import { AccountTypeBadge } from "@/components/accounts/account-type-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account Detail | LiquidIQ",
  description: "View treasury account detail in LiquidIQ.",
};

function metricCard(
  icon: typeof Wallet,
  label: string,
  value: string,
  helper: string,
) {
  const Icon = icon;

  return (
    <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
      <CardHeader className="space-y-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-sm font-medium text-slate-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [accountResult, transactionsResult] = await Promise.all([
    getBankAccountById(id),
    getTransactionsByBankAccount(id),
  ]);

  if ("error" in accountResult) {
    notFound();
  }

  const account = accountResult.data;
  const transactions = "error" in transactionsResult ? [] : transactionsResult.data;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/accounts"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "mb-4 justify-start rounded-lg px-0 text-slate-400 hover:bg-transparent hover:text-slate-100",
            )}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to accounts
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <AccountTypeBadge type={account.account_type} />
            <AccountStatusBadge status={account.status} />
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-100">
            {account.account_name}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {account.bank_name} • {account.account_number}
            {account.entity_name ? ` • ${account.entity_name}` : ""}
          </p>
        </div>

        <Link
          href={`/accounts/${account.id}/edit`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 bg-green-600 text-white hover:bg-green-500",
          )}
        >
          <PencilLine className="mr-2 size-4" />
          Edit Account
        </Link>
      </div>

      <section className="grid gap-4 xl:grid-cols-4">
        {metricCard(
          Wallet,
          "Available balance",
          formatCurrency(Number(account.available_balance), account.currency),
          "Immediately deployable liquidity.",
        )}
        {metricCard(
          ArrowUpDown,
          "Current balance",
          formatCurrency(Number(account.current_balance), account.currency),
          "Booked ledger balance for the account.",
        )}
        {metricCard(
          RefreshCw,
          "Last synced",
          account.last_synced_at
            ? formatDate(account.last_synced_at, "MMM d, h:mm a")
            : "Pending sync",
          "Most recent balance refresh timestamp.",
        )}
        {metricCard(
          Activity,
          "Recent activity",
          String(transactions.length),
          "Transactions shown in the recent ledger below.",
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Account profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Currency
              </p>
              <p className="mt-2 text-sm text-slate-200">{account.currency}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Country
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {account.country ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Bank code
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {account.bank_code ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                SWIFT / BIC
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {account.swift_bic ?? "Not set"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                IBAN
              </p>
              <p className="mt-2 break-all text-sm text-slate-200">
                {account.iban ?? "Not set"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {account.notes ?? "No notes recorded."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Liquidity snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Balance delta
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">
                {formatCurrency(
                  Number(account.available_balance) -
                    Number(account.current_balance),
                  account.currency,
                )}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Difference between booked balance and available funds.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {formatDate(account.created_at)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Last updated
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {formatDate(account.updated_at, "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Recent transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                      <TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="h-12 px-4 text-slate-400">
                          Reference
                        </TableHead>
                        <TableHead className="h-12 px-4 text-slate-400">
                          Type
                        </TableHead>
                        <TableHead className="h-12 px-4 text-slate-400">
                          Counterparty
                        </TableHead>
                        <TableHead className="h-12 px-4 text-slate-400">
                          Value date
                        </TableHead>
                        <TableHead className="h-12 px-4 text-right text-slate-400">
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className="border-slate-700 hover:bg-slate-700/50"
                        >
                          <TableCell className="px-4 text-slate-200">
                            <div>
                              <p className="font-medium">
                                {transaction.transaction_ref}
                              </p>
                              <p className="text-xs text-slate-500">
                                {transaction.description ?? "No description"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 capitalize text-slate-300">
                            {transaction.transaction_type}
                          </TableCell>
                          <TableCell className="px-4 text-slate-300">
                            {transaction.counterparty ?? "Counterparty n/a"}
                          </TableCell>
                          <TableCell className="px-4 text-slate-300">
                            {formatDate(transaction.value_date)}
                          </TableCell>
                          <TableCell className="px-4 text-right font-medium text-slate-100">
                            {formatCurrency(
                              Number(transaction.amount),
                              transaction.currency,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3 md:hidden">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-100">
                            {transaction.transaction_ref}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {transaction.counterparty ?? "Counterparty n/a"}
                          </p>
                        </div>
                        <p className="text-right text-sm font-medium text-slate-100">
                          {formatCurrency(
                            Number(transaction.amount),
                            transaction.currency,
                          )}
                        </p>
                      </div>
                      <p className="mt-3 text-sm capitalize text-slate-400">
                        {transaction.transaction_type} •{" "}
                        {formatDate(transaction.value_date)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No transactions found
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Transactions linked to this account will appear here as they are
                  imported or created.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
