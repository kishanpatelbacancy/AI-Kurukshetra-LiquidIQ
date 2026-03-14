"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Landmark } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { AccountStatusBadge } from "@/components/accounts/account-status-badge";
import { AccountTypeBadge } from "@/components/accounts/account-type-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AccountListItem = {
  account_name: string;
  account_number: string;
  account_type: "current" | "investment" | "loan" | "money_market" | "savings";
  available_balance: number;
  bank_name: string;
  country: string | null;
  currency: string;
  current_balance: number;
  entity_name: string | null;
  id: string;
  last_synced_at: string | null;
  status: "active" | "frozen" | "inactive";
};

export function AccountsTable({ accounts }: { accounts: AccountListItem[] }) {
  const router = useRouter();

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 py-16 text-center">
        <Landmark className="mb-4 size-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-300">No bank accounts found</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add your first account to start tracking balances and liquidity by entity.
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
              <TableHead className="h-12 px-4 text-slate-400">Account</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Bank</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Type</TableHead>
              <TableHead className="h-12 px-4 text-slate-400">Status</TableHead>
              <TableHead className="h-12 px-4 text-right text-slate-400">
                Available
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow
                key={account.id}
                className="h-12 cursor-pointer border-slate-700 hover:bg-slate-700/50"
                onClick={() => router.push(`/accounts/${account.id}`)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/accounts/${account.id}`);
                  }
                }}
              >
                <TableCell className="px-4 text-slate-200">
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-xs text-slate-500">
                      {account.account_number}
                      {account.entity_name ? ` • ${account.entity_name}` : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-slate-300">
                  <div>
                    <p>{account.bank_name}</p>
                    <p className="text-xs text-slate-500">
                      {account.country ?? "Country n/a"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <AccountTypeBadge type={account.account_type} />
                </TableCell>
                <TableCell className="px-4">
                  <AccountStatusBadge status={account.status} />
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
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => router.push(`/accounts/${account.id}`)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-left transition hover:border-slate-600 hover:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-100">{account.account_name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {account.bank_name} • {account.account_number}
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 text-slate-500" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <AccountTypeBadge type={account.account_type} />
              <AccountStatusBadge status={account.status} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Available
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {formatCurrency(
                    Number(account.available_balance),
                    account.currency,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Last sync
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {account.last_synced_at
                    ? formatDate(account.last_synced_at, "MMM d, h:mm a")
                    : "Pending sync"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
