"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { CreditCard, Loader2, Plus } from "lucide-react";

import type { PaymentListItem } from "@/lib/actions/payments";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PaymentPriorityBadge } from "@/components/payments/payment-priority-badge";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PaymentsListProps = {
  accountLookup: Map<string, string>;
  activeStatus: string;
  payments: PaymentListItem[];
};

const tabs = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending_approval" },
  { label: "Approved", value: "approved" },
  { label: "Processing", value: "processing" },
] as const;

export function PaymentsList({
  accountLookup,
  activeStatus,
  payments,
}: PaymentsListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  function setStatusTab(nextStatus: string) {
    setPendingTab(nextStatus);

    startTransition(() => {
      router.replace(
        nextStatus === "all" ? pathname : `${pathname}?status=${nextStatus}`,
        { scroll: false },
      );
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-green-400">
            Payments
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">
            Approval-driven payment operations
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Track drafts, approval queue pressure, and released payments from a
            single treasury payment register.
          </p>
        </div>

        <Link
          href="/payments/add"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 bg-green-600 text-white hover:bg-green-500",
          )}
        >
          <Plus className="mr-2 size-4" />
          Initiate Payment
        </Link>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-2">
        <div className="grid gap-2 md:grid-cols-5">
          {tabs.map((tab) => {
            const isActive = activeStatus === tab.value;
            const isPending = pendingTab === tab.value && !isActive;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusTab(tab.value)}
                className={cn(
                  "flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-green-400"
                    : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-100",
                )}
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative rounded-xl border border-slate-700 bg-slate-800 p-6">
        {pendingTab ? (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-slate-900/40" />
        ) : null}
        {payments.length > 0 ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="h-12 px-4 text-slate-400">Reference</TableHead>
                    <TableHead className="h-12 px-4 text-slate-400">Beneficiary</TableHead>
                    <TableHead className="h-12 px-4 text-slate-400">Account</TableHead>
                    <TableHead className="h-12 px-4 text-slate-400">Status</TableHead>
                    <TableHead className="h-12 px-4 text-slate-400">Priority</TableHead>
                    <TableHead className="h-12 px-4 text-right text-slate-400">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="h-12 border-slate-700 hover:bg-slate-700/50"
                    >
                      <TableCell className="px-4 text-slate-200">
                        <Link href={`/payments/${payment.id}`} className="block">
                          <p className="font-medium">{payment.payment_ref}</p>
                          <p className="text-xs text-slate-500">
                            {payment.value_date
                              ? formatDate(payment.value_date)
                              : "No value date"}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 text-slate-300">
                        {payment.beneficiary_name}
                      </TableCell>
                      <TableCell className="px-4 text-slate-300">
                        {payment.from_account_id
                          ? accountLookup.get(payment.from_account_id) ?? "Unknown account"
                          : "No source account"}
                      </TableCell>
                      <TableCell className="px-4">
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="px-4">
                        <PaymentPriorityBadge priority={payment.priority} />
                      </TableCell>
                      <TableCell className="px-4 text-right font-medium text-slate-100">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {payments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/payments/${payment.id}`}
                  className="block rounded-xl border border-slate-700 bg-slate-900/70 p-4 transition hover:border-slate-600 hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-100">
                        {payment.beneficiary_name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {payment.payment_ref}
                      </p>
                    </div>
                    <p className="text-right text-sm font-medium text-slate-100">
                      {formatCurrency(Number(payment.amount), payment.currency)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <PaymentStatusBadge status={payment.status} />
                    <PaymentPriorityBadge priority={payment.priority} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 py-16 text-center">
            <CreditCard className="mb-4 size-12 text-slate-600" />
            <p className="text-lg font-medium text-slate-300">No payments found</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Create a payment request or switch tabs to review a different queue.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
