"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ForecastActionState } from "@/lib/actions/forecasts";
import {
  forecastCategories,
  forecastConfidenceLevels,
  forecastSchema,
  type ForecastFormValues,
  type ForecastInput,
} from "@/lib/validations/forecast";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const defaultValues: ForecastFormValues = {
  category: "operating",
  confidence: "medium",
  currency: "USD",
  description: "",
  entityName: "",
  forecastDate: "",
  inflowAmount: 0,
  isActual: false,
  outflowAmount: 0,
};

export function ForecastEntryForm({
  onSubmitAction,
}: {
  onSubmitAction: (values: ForecastInput) => Promise<ForecastActionState>;
}) {
  const router = useRouter();
  const [serverState, setServerState] = useState<ForecastActionState | null>(null);
  const form = useForm<ForecastFormValues, unknown, ForecastInput>({
    resolver: zodResolver(forecastSchema),
    defaultValues,
    mode: "onBlur",
  });

  const fieldError = (field: keyof ForecastFormValues) =>
    form.formState.errors[field]?.message ??
    serverState?.error?.fieldErrors?.[field]?.[0];

  async function handleSubmit(values: ForecastInput) {
    setServerState(null);

    const result = await onSubmitAction(values);

    if (result.error) {
      setServerState(result);

      if (result.error._global?.[0]) {
        toast.error(result.error._global[0]);
      }

      return;
    }

    toast.success("Forecast saved successfully.");
    form.reset(defaultValues);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="forecastDate" className="text-slate-300">
            Forecast date *
          </Label>
          <Input
            id="forecastDate"
            type="date"
            className="h-11 border-slate-600 bg-slate-900 text-slate-100 focus-visible:border-green-500 focus-visible:ring-green-500/30"
            aria-invalid={Boolean(fieldError("forecastDate"))}
            {...form.register("forecastDate")}
          />
          <FormError message={fieldError("forecastDate")} />
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
          <Label htmlFor="currency" className="text-slate-300">
            Currency *
          </Label>
          <Input
            id="currency"
            maxLength={3}
            className="h-11 border-slate-600 bg-slate-900 text-slate-100 uppercase placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
            placeholder="USD"
            aria-invalid={Boolean(fieldError("currency"))}
            {...form.register("currency")}
          />
          <FormError message={fieldError("currency")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-slate-300">
            Category *
          </Label>
          <select
            id="category"
            className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
            {...form.register("category")}
          >
            {forecastCategories.map((category) => (
              <option key={category} value={category}>
                {category.replace("_", " ")}
              </option>
            ))}
          </select>
          <FormError message={fieldError("category")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inflowAmount" className="text-slate-300">
            Inflow amount *
          </Label>
          <Input
            id="inflowAmount"
            type="number"
            step="0.01"
            className="h-11 border-slate-600 bg-slate-900 text-slate-100 focus-visible:border-green-500 focus-visible:ring-green-500/30"
            aria-invalid={Boolean(fieldError("inflowAmount"))}
            {...form.register("inflowAmount", { valueAsNumber: true })}
          />
          <FormError message={fieldError("inflowAmount")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="outflowAmount" className="text-slate-300">
            Outflow amount *
          </Label>
          <Input
            id="outflowAmount"
            type="number"
            step="0.01"
            className="h-11 border-slate-600 bg-slate-900 text-slate-100 focus-visible:border-green-500 focus-visible:ring-green-500/30"
            aria-invalid={Boolean(fieldError("outflowAmount"))}
            {...form.register("outflowAmount", { valueAsNumber: true })}
          />
          <FormError message={fieldError("outflowAmount")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confidence" className="text-slate-300">
            Confidence *
          </Label>
          <select
            id="confidence"
            className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
            {...form.register("confidence")}
          >
            {forecastConfidenceLevels.map((confidence) => (
              <option key={confidence} value={confidence}>
                {confidence}
              </option>
            ))}
          </select>
          <FormError message={fieldError("confidence")} />
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-600 bg-slate-900 text-green-500 focus:ring-green-500/30"
            {...form.register("isActual")}
          />
          <span className="text-sm text-slate-300">Mark as actual</span>
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">
          Description
        </Label>
        <Textarea
          id="description"
          className="min-h-24 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
          placeholder="Projected customer receipts, payroll run, debt service, or funding event"
          aria-invalid={Boolean(fieldError("description"))}
          {...form.register("description")}
        />
        <FormError message={fieldError("description")} />
      </div>

      {serverState?.error?._global?.[0] ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverState.error._global[0]}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={form.formState.isSubmitting}
        className="h-11 bg-green-600 text-white hover:bg-green-500"
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Saving forecast...
          </>
        ) : (
          "Add Forecast"
        )}
      </Button>
    </form>
  );
}
