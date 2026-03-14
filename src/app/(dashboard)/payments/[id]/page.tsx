import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSignature,
  Landmark,
} from "lucide-react";

import {
  getApprovalWorkflow,
  getPaymentById,
} from "@/lib/actions/payments";
import { getBankAccounts } from "@/lib/actions/bank-accounts";
import { PaymentApprovalActions } from "@/components/payments/payment-approval-actions";
import { PaymentPriorityBadge } from "@/components/payments/payment-priority-badge";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Detail | LiquidIQ",
  description: "Review and action a treasury payment in LiquidIQ.",
};

function metricCard(
  icon: typeof Landmark,
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

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [paymentResult, approvalsResult, accountsResult] = await Promise.all([
    getPaymentById(id),
    getApprovalWorkflow(id),
    getBankAccounts(),
  ]);

  if ("error" in paymentResult) {
    notFound();
  }

  const payment = paymentResult.data;
  const approvals =
    "data" in approvalsResult ? approvalsResult.data ?? [] : [];
  const accounts = "data" in accountsResult ? accountsResult.data ?? [] : [];
  const accountLookup = new Map(
    accounts.map((account) => [
      account.id,
      account.account_name,
    ]),
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/payments"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "mb-4 justify-start rounded-lg px-0 text-slate-400 hover:bg-transparent hover:text-slate-100",
            )}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to payments
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            <PaymentPriorityBadge priority={payment.priority} />
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-100">
            {payment.payment_ref}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {payment.beneficiary_name} •{" "}
            {formatCurrency(Number(payment.amount), payment.currency)}
          </p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-4">
        {metricCard(
          Landmark,
          "Source account",
          payment.from_account_id
            ? accountLookup.get(payment.from_account_id) ?? "Unknown account"
            : "Not set",
          "Funding account used for this payment request.",
        )}
        {metricCard(
          FileSignature,
          "Approval level",
          `${payment.approval_level}/${payment.required_approvals}`,
          "Completed approvals versus approvals required.",
        )}
        {metricCard(
          Clock3,
          "Value date",
          payment.value_date ? formatDate(payment.value_date) : "Not set",
          "Requested settlement date.",
        )}
        {metricCard(
          CheckCircle2,
          "Current status",
          payment.status.replace("_", " "),
          "Workflow state for this payment request.",
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Payment details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Payment type
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {payment.payment_type.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Beneficiary bank
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {payment.beneficiary_bank ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Beneficiary IBAN
              </p>
              <p className="mt-2 break-all text-sm text-slate-200">
                {payment.beneficiary_iban ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {formatDate(payment.created_at, "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Purpose
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {payment.purpose ?? "No purpose recorded."}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {payment.notes ?? "No notes recorded."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Workflow actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentApprovalActions paymentId={payment.id} status={payment.status} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-xl border border-slate-700 bg-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">
              Approval history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvals.length > 0 ? (
              approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium capitalize text-slate-100">
                        {approval.action}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(approval.actioned_at, "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Approver {approval.approver_id.slice(0, 8)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {approval.comments ?? "No comments added."}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-center">
                <p className="text-lg font-medium text-slate-300">
                  No approval activity yet
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Submit this payment for approval to start the workflow history.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
