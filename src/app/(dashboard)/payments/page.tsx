import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import { getBankAccounts } from "@/lib/actions/bank-accounts";
import { getPayments } from "@/lib/actions/payments";
import { PaymentsList } from "@/components/payments/payments-list";
import type { PaymentStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Payments | LiquidIQ",
  description: "Initiate and approve payments in LiquidIQ.",
};

const paymentStatuses = [
  "draft",
  "pending_approval",
  "approved",
  "processing",
  "completed",
  "rejected",
  "failed",
  "cancelled",
] as const satisfies readonly PaymentStatus[];

function isPaymentStatus(value: string): value is PaymentStatus {
  return paymentStatuses.includes(value as PaymentStatus);
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = rawStatus && isPaymentStatus(rawStatus) ? rawStatus : undefined;

  const [paymentsResult, accountsResult] = await Promise.all([
    getPayments(status),
    getBankAccounts(),
  ]);

  const firstError =
    ("error" in paymentsResult ? paymentsResult.error : undefined) ??
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

  const payments = "data" in paymentsResult ? paymentsResult.data ?? [] : [];
  const accounts = "data" in accountsResult ? accountsResult.data ?? [] : [];
  const accountLookup = new Map(
    accounts.map((account) => [account.id, account.account_name]),
  );

  return (
    <PaymentsList
      accountLookup={accountLookup}
      activeStatus={status ?? "all"}
      payments={payments}
    />
  );
}
