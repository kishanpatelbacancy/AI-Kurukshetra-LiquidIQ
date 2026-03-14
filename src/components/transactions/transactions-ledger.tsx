"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Filter, Loader2, Search, X } from "lucide-react";
import { startTransition, useState } from "react";

import type { TransactionListItem } from "@/lib/actions/transactions";
import type { TransactionFilters } from "@/lib/validations/transaction";
import { cn, formatCompactCurrency } from "@/lib/utils";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { buttonVariants, Button } from "@/components/ui/button";

type TransactionsLedgerProps = {
  accounts: Array<{ account_name: string; bank_name: string; id: string }>;
  filters: TransactionFilters;
  transactions: TransactionListItem[];
};

function buildQueryString(filters: {
  accountId?: string;
  q?: string;
  status?: string;
  type?: string;
}) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.accountId) {
    params.set("accountId", filters.accountId);
  }

  return params.toString();
}

export function TransactionsLedger({
  accounts,
  filters,
  transactions,
}: TransactionsLedgerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [search, setSearch] = useState(filters.q ?? "");

  const accountLookup = new Map(
    accounts.map((account) => [
      account.id,
      { accountName: account.account_name, bankName: account.bank_name },
    ]),
  );

  const pendingCount = transactions.filter(
    (transaction) => transaction.status === "pending",
  ).length;
  const reconciledCount = transactions.filter(
    (transaction) => transaction.status === "reconciled",
  ).length;
  const totalValue = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0,
  );

  function updateFilters(nextFilters: {
    accountId?: string;
    q?: string;
    status?: string;
    type?: string;
  }) {
    setIsPending(true);

    startTransition(() => {
      const query = buildQueryString(nextFilters);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-green-400">
            Transactions
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">
            Unified treasury ledger
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Search by reference, counterparty, or description, then narrow the
            ledger by account, transaction type, and posting status.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Results
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {transactions.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Pending
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Gross value
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {formatCompactCurrency(totalValue)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <form
          className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto]"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);
            updateFilters({
              accountId: String(formData.get("accountId") ?? "") || undefined,
              q: String(formData.get("q") ?? "").trim() || undefined,
              status: String(formData.get("status") ?? "") || undefined,
              type: String(formData.get("type") ?? "") || undefined,
            });
          }}
        >
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Search
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <input
                name="q"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ref, counterparty, or description"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Status
            </span>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              onChange={(event) =>
                updateFilters({
                  accountId: filters.accountId,
                  q: search.trim() || undefined,
                  status: event.target.value || undefined,
                  type: filters.type,
                })
              }
              className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="reconciled">Reconciled</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Type
            </span>
            <select
              name="type"
              defaultValue={filters.type ?? ""}
              onChange={(event) =>
                updateFilters({
                  accountId: filters.accountId,
                  q: search.trim() || undefined,
                  status: filters.status,
                  type: event.target.value || undefined,
                })
              }
              className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
            >
              <option value="">All types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="transfer">Transfer</option>
              <option value="fee">Fee</option>
              <option value="interest">Interest</option>
              <option value="fx">FX</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Account
            </span>
            <select
              name="accountId"
              defaultValue={filters.accountId ?? ""}
              onChange={(event) =>
                updateFilters({
                  accountId: event.target.value || undefined,
                  q: search.trim() || undefined,
                  status: filters.status,
                  type: filters.type,
                })
              }
              className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
            >
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="h-11 bg-green-600 text-white hover:bg-green-500"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Filter className="mr-2 size-4" />
                  Apply
                </>
              )}
            </Button>
            <Link
              href="/transactions"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-11 bg-slate-700 text-slate-100 hover:bg-slate-600",
              )}
            >
              <X className="mr-2 size-4" />
              Reset
            </Link>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
            {reconciledCount} reconciled
          </span>
          {filters.status ? (
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Status: {filters.status}
            </span>
          ) : null}
          {filters.type ? (
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Type: {filters.type}
            </span>
          ) : null}
          {filters.accountId ? (
            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">
              Account filtered
            </span>
          ) : null}
        </div>
      </section>

      <section className="relative rounded-xl border border-slate-700 bg-slate-800 p-6">
        {isPending ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-900/50">
            <Loader2 className="size-6 animate-spin text-green-500" />
          </div>
        ) : null}
        <TransactionsTable
          accountLookup={accountLookup}
          transactions={transactions}
        />
      </section>
    </div>
  );
}
