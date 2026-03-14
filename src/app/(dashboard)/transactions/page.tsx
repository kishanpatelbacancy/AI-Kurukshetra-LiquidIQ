import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import { getBankAccounts } from "@/lib/actions/bank-accounts";
import { getTransactions } from "@/lib/actions/transactions";
import { parseTransactionFilters } from "@/lib/validations/transaction";
import { TransactionsLedger } from "@/components/transactions/transactions-ledger";

export const metadata: Metadata = {
  title: "Transactions | LiquidIQ",
  description: "Search and filter treasury transactions in LiquidIQ.",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseTransactionFilters(await searchParams);
  const [transactionsResult, accountsResult] = await Promise.all([
    getTransactions(filters),
    getBankAccounts(),
  ]);

  const firstError =
    ("error" in transactionsResult ? transactionsResult.error : undefined) ??
    ("error" in accountsResult ? accountsResult.error : undefined);

  if (firstError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900/80 px-6 py-16 text-center">
        <AlertCircle className="mb-4 size-12 text-red-500/70" />
        <p className="text-lg font-medium text-slate-300">Failed to load data</p>
        <p className="mt-2 max-w-xl text-sm text-slate-500">{firstError}</p>
      </div>
    );
  }

  const accounts =
    ("data" in accountsResult ? accountsResult.data ?? [] : []).map((account) => ({
          account_name: account.account_name,
          bank_name: account.bank_name,
          id: account.id,
        }));

  const transactions =
    "data" in transactionsResult ? transactionsResult.data ?? [] : [];

  return (
    <TransactionsLedger
      accounts={accounts}
      filters={filters}
      transactions={transactions}
    />
  );
}
