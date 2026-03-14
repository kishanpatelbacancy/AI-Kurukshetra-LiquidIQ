"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { PaymentActionState } from "@/lib/actions/payments";
import {
  paymentPriorities,
  paymentSchema,
  paymentTypes,
  type PaymentFormValues,
  type PaymentInput,
} from "@/lib/validations/payment";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const defaultValues: PaymentFormValues = {
  amount: 0,
  beneficiaryBank: "",
  beneficiaryIban: "",
  beneficiaryName: "",
  currency: "USD",
  fromAccountId: "",
  notes: "",
  paymentType: "wire",
  priority: "normal",
  purpose: "",
  requiredApprovals: 1,
  toAccountId: "",
  valueDate: "",
};

type PaymentFormProps = {
  accounts: Array<{
    account_name: string;
    currency: string;
    id: string;
  }>;
  onSubmitAction: (values: PaymentInput) => Promise<PaymentActionState>;
};

export function PaymentForm({ accounts, onSubmitAction }: PaymentFormProps) {
  const router = useRouter();
  const [serverState, setServerState] = useState<PaymentActionState | null>(null);
  const form = useForm<PaymentFormValues, unknown, PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
    mode: "onBlur",
  });

  const fieldError = (field: keyof PaymentFormValues) =>
    form.formState.errors[field]?.message ??
    serverState?.error?.fieldErrors?.[field]?.[0];

  async function handleSubmit(values: PaymentInput) {
    setServerState(null);

    const result = await onSubmitAction(values);

    if (result.error) {
      setServerState(result);

      if (result.error._global?.[0]) {
        toast.error(result.error._global[0]);
      }

      return;
    }

    toast.success("Payment created successfully.");
    router.push(`/payments/${result.data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href="/payments"
        className={cn(
          buttonVariants({ variant: "ghost", size: "default" }),
          "justify-start rounded-lg px-0 text-slate-400 hover:bg-transparent hover:text-slate-100",
        )}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to payments
      </Link>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-green-400">
            Initiate Payment
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-100">
            Create a treasury payment request
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Capture the account, beneficiary, routing context, and approval level
            required to move this payment through treasury controls.
          </p>
        </div>

        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromAccountId" className="text-slate-300">
                Source account *
              </Label>
              <select
                id="fromAccountId"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                {...form.register("fromAccountId")}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} ({account.currency})
                  </option>
                ))}
              </select>
              <FormError message={fieldError("fromAccountId")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toAccountId" className="text-slate-300">
                Destination account
              </Label>
              <select
                id="toAccountId"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                {...form.register("toAccountId")}
              >
                <option value="">External beneficiary</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} ({account.currency})
                  </option>
                ))}
              </select>
              <FormError message={fieldError("toAccountId")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaryName" className="text-slate-300">
                Beneficiary name *
              </Label>
              <Input
                id="beneficiaryName"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="Oracle Corporation"
                {...form.register("beneficiaryName")}
              />
              <FormError message={fieldError("beneficiaryName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaryBank" className="text-slate-300">
                Beneficiary bank
              </Label>
              <Input
                id="beneficiaryBank"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="Citibank NA"
                {...form.register("beneficiaryBank")}
              />
              <FormError message={fieldError("beneficiaryBank")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaryIban" className="text-slate-300">
                Beneficiary IBAN
              </Label>
              <Input
                id="beneficiaryIban"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="DE89370400440532013000"
                {...form.register("beneficiaryIban")}
              />
              <FormError message={fieldError("beneficiaryIban")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-300">
                Currency *
              </Label>
              <Input
                id="currency"
                maxLength={3}
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 uppercase placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="USD"
                {...form.register("currency")}
              />
              <FormError message={fieldError("currency")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                {...form.register("amount", { valueAsNumber: true })}
              />
              <FormError message={fieldError("amount")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentType" className="text-slate-300">
                Payment type *
              </Label>
              <select
                id="paymentType"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                {...form.register("paymentType")}
              >
                {paymentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              <FormError message={fieldError("paymentType")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueDate" className="text-slate-300">
                Value date *
              </Label>
              <Input
                id="valueDate"
                type="date"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                {...form.register("valueDate")}
              />
              <FormError message={fieldError("valueDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-300">
                Priority *
              </Label>
              <select
                id="priority"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                {...form.register("priority")}
              >
                {paymentPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <FormError message={fieldError("priority")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredApprovals" className="text-slate-300">
                Required approvals *
              </Label>
              <Input
                id="requiredApprovals"
                type="number"
                min={1}
                max={5}
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                {...form.register("requiredApprovals", { valueAsNumber: true })}
              />
              <FormError message={fieldError("requiredApprovals")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="purpose" className="text-slate-300">
                Purpose
              </Label>
              <Input
                id="purpose"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="Software license renewal"
                {...form.register("purpose")}
              />
              <FormError message={fieldError("purpose")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="min-h-24 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
              placeholder="Approval context, contract references, or settlement instructions"
              {...form.register("notes")}
            />
            <FormError message={fieldError("notes")} />
          </div>

          {serverState?.error?._global?.[0] ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverState.error._global[0]}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-700 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/payments"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-11 justify-center bg-slate-700 text-slate-100 hover:bg-slate-600",
              )}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="h-11 bg-green-600 text-white hover:bg-green-500"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating payment...
                </>
              ) : (
                "Initiate Payment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
