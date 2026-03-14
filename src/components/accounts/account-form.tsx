"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { BankAccountActionState } from "@/lib/actions/bank-accounts";
import {
  bankAccountSchema,
  bankAccountStatuses,
  bankAccountTypes,
  type BankAccountFormValues,
  type BankAccountInput,
} from "@/lib/validations/bank-account";
import { buttonVariants, Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AccountFormProps = {
  initialValues?: BankAccountFormValues;
  mode: "create" | "edit";
  onSubmitAction: (values: BankAccountInput) => Promise<BankAccountActionState>;
};

const defaultValues: BankAccountFormValues = {
  accountName: "",
  accountNumber: "",
  accountType: "current",
  availableBalance: 0,
  bankCode: "",
  bankName: "",
  country: "",
  currency: "USD",
  currentBalance: 0,
  entityName: "",
  iban: "",
  notes: "",
  status: "active",
  swiftBic: "",
};

export function AccountForm({
  initialValues,
  mode,
  onSubmitAction,
}: AccountFormProps) {
  const router = useRouter();
  const [serverState, setServerState] = useState<BankAccountActionState | null>(
    null,
  );
  const form = useForm<BankAccountFormValues, unknown, BankAccountInput>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: initialValues ?? defaultValues,
    mode: "onBlur",
  });

  const fieldError = (field: keyof BankAccountFormValues) =>
    form.formState.errors[field]?.message ??
    serverState?.error?.fieldErrors?.[field]?.[0];

  async function handleSubmit(values: BankAccountInput) {
    setServerState(null);

    const result = await onSubmitAction(values);

    if (result.error) {
      setServerState(result);

      if (result.error._global?.[0]) {
        toast.error(result.error._global[0]);
      }

      return;
    }

    const targetId = result.data.id;
    toast.success(
      mode === "create"
        ? "Bank account created successfully."
        : "Bank account updated successfully.",
    );
    router.push(`/accounts/${targetId}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={mode === "create" ? "/accounts" : ".."}
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "justify-start rounded-lg px-0 text-slate-400 hover:bg-transparent hover:text-slate-100",
          )}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-green-400">
            {mode === "create" ? "Add Account" : "Edit Account"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-100">
            {mode === "create"
              ? "Connect a treasury account"
              : "Update account details"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Capture banking metadata, liquidity balances, and entity ownership so
            treasury has a current view of cash by account.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-slate-300">
                Account name *
              </Label>
              <Input
                id="accountName"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="Main Operating Account"
                aria-invalid={Boolean(fieldError("accountName"))}
                {...form.register("accountName")}
              />
              <FormError message={fieldError("accountName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="text-slate-300">
                Account number *
              </Label>
              <Input
                id="accountNumber"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="US-001-4521"
                aria-invalid={Boolean(fieldError("accountNumber"))}
                {...form.register("accountNumber")}
              />
              <FormError message={fieldError("accountNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-slate-300">
                Bank name *
              </Label>
              <Input
                id="bankName"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="JPMorgan Chase"
                aria-invalid={Boolean(fieldError("bankName"))}
                {...form.register("bankName")}
              />
              <FormError message={fieldError("bankName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankCode" className="text-slate-300">
                Bank code
              </Label>
              <Input
                id="bankCode"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="021000021"
                aria-invalid={Boolean(fieldError("bankCode"))}
                {...form.register("bankCode")}
              />
              <FormError message={fieldError("bankCode")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-300">
                Currency *
              </Label>
              <Input
                id="currency"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 uppercase placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                maxLength={3}
                placeholder="USD"
                aria-invalid={Boolean(fieldError("currency"))}
                {...form.register("currency")}
              />
              <FormError message={fieldError("currency")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-slate-300">
                Country
              </Label>
              <Input
                id="country"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 uppercase placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                maxLength={2}
                placeholder="US"
                aria-invalid={Boolean(fieldError("country"))}
                {...form.register("country")}
              />
              <FormError message={fieldError("country")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType" className="text-slate-300">
                Account type *
              </Label>
              <select
                id="accountType"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                aria-invalid={Boolean(fieldError("accountType"))}
                {...form.register("accountType")}
              >
                {bankAccountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
              <FormError message={fieldError("accountType")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-300">
                Status *
              </Label>
              <select
                id="status"
                className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                aria-invalid={Boolean(fieldError("status"))}
                {...form.register("status")}
              >
                {bankAccountStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <FormError message={fieldError("status")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentBalance" className="text-slate-300">
                Current balance *
              </Label>
              <Input
                id="currentBalance"
                type="number"
                step="0.01"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-invalid={Boolean(fieldError("currentBalance"))}
                {...form.register("currentBalance", { valueAsNumber: true })}
              />
              <FormError message={fieldError("currentBalance")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableBalance" className="text-slate-300">
                Available balance *
              </Label>
              <Input
                id="availableBalance"
                type="number"
                step="0.01"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-invalid={Boolean(fieldError("availableBalance"))}
                {...form.register("availableBalance", { valueAsNumber: true })}
              />
              <FormError message={fieldError("availableBalance")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityName" className="text-slate-300">
                Entity name
              </Label>
              <Input
                id="entityName"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="LiquidIQ Corp"
                aria-invalid={Boolean(fieldError("entityName"))}
                {...form.register("entityName")}
              />
              <FormError message={fieldError("entityName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban" className="text-slate-300">
                IBAN
              </Label>
              <Input
                id="iban"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="DE89370400440532013000"
                aria-invalid={Boolean(fieldError("iban"))}
                {...form.register("iban")}
              />
              <FormError message={fieldError("iban")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftBic" className="text-slate-300">
                SWIFT / BIC
              </Label>
              <Input
                id="swiftBic"
                className="h-11 border-slate-600 bg-slate-900 text-slate-100 uppercase placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                placeholder="CHASUS33"
                aria-invalid={Boolean(fieldError("swiftBic"))}
                {...form.register("swiftBic")}
              />
              <FormError message={fieldError("swiftBic")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="min-h-28 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
              placeholder="Operational notes, restrictions, or treasury context"
              aria-invalid={Boolean(fieldError("notes"))}
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
              href={mode === "create" ? "/accounts" : ".."}
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
                  {mode === "create" ? "Saving account..." : "Saving changes..."}
                </>
              ) : mode === "create" ? (
                "Add Account"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
