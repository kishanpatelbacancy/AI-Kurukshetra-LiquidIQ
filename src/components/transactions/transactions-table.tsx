import { SearchX } from "lucide-react";

import type { TransactionListItem } from "@/lib/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionStatusBadge } from "@/components/transactions/transaction-status-badge";
import { TransactionTypeBadge } from "@/components/transactions/transaction-type-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TransactionsTableProps = {
  accountLookup: Map<string, { accountName: string; bankName: string }>;
  transactions: TransactionListItem[];
};

export function TransactionsTable({
  accountLookup,
  transactions,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 py-16 text-center">
        <SearchX className="mb-4 size-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-300">No transactions found</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Adjust your search or filters to widen the result set.
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
              <TableHead className="h-12 px-4 text-slate-400">Reference</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Account</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Type</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Status</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Value date</TableHead>
              <TableHead className="h-12 px-4 text-right text-slate-400">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const account = accountLookup.get(transaction.bank_account_id);

              return (
                <TableRow
                  key={transaction.id}
                  className="h-12 border-slate-700 hover:bg-slate-700/50"
                >
                  <TableCell className="px-4 text-slate-200">
                    <div>
                      <p className="font-medium">{transaction.transaction_ref}</p>
                      <p className="text-xs text-slate-500">
                        {transaction.counterparty ??
                          transaction.description ??
                          "No counterparty"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-slate-300">
                    <div>
                      <p>{account?.accountName ?? "Unknown account"}</p>
                      <p className="text-xs text-slate-500">
                        {account?.bankName ?? "Bank unavailable"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <TransactionTypeBadge type={transaction.transaction_type} />
                  </TableCell>
                  <TableCell className="px-4">
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="px-4 text-slate-300">
                    {formatDate(transaction.value_date)}
                  </TableCell>
                  <TableCell className="px-4 text-right font-medium text-slate-100">
                    {formatCurrency(Number(transaction.amount), transaction.currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => {
          const account = accountLookup.get(transaction.bank_account_id);

          return (
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
                    {account?.accountName ?? "Unknown account"}
                  </p>
                </div>
                <p className="text-right text-sm font-medium text-slate-100">
                  {formatCurrency(Number(transaction.amount), transaction.currency)}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <TransactionTypeBadge type={transaction.transaction_type} />
                <TransactionStatusBadge status={transaction.status} />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                {transaction.counterparty ?? transaction.description ?? "No details"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Value date {formatDate(transaction.value_date)}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
