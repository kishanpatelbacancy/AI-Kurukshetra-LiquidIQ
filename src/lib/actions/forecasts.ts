"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { TableInsert, TableRow } from "@/types/database";
import {
  forecastSchema,
  type ForecastInput,
} from "@/lib/validations/forecast";

type FieldErrors = Record<string, string[] | undefined>;

type ActionError = {
  _global?: string[];
  fieldErrors?: FieldErrors;
};

export type ForecastActionState =
  | {
      error: ActionError;
      success?: never;
    }
  | {
      data: { id: string };
      error?: never;
      success: true;
    };

type QueryResult<T> = { data: T; error?: never } | { data?: never; error: string };

export type ForecastListItem = Pick<
  TableRow<"cash_flow_forecasts">,
  | "category"
  | "confidence"
  | "currency"
  | "description"
  | "entity_name"
  | "forecast_date"
  | "id"
  | "inflow_amount"
  | "is_actual"
  | "net_position"
  | "outflow_amount"
>;

function validationError(fieldErrors: FieldErrors): ForecastActionState {
  return {
    error: {
      fieldErrors,
    },
  };
}

function globalError(message: string): ForecastActionState {
  return {
    error: {
      _global: [message],
    },
  };
}

function normalizeForecast(values: ForecastInput): TableInsert<"cash_flow_forecasts"> {
  return {
    category: values.category,
    confidence: values.confidence,
    currency: values.currency,
    description: values.description ?? null,
    entity_name: values.entityName ?? null,
    forecast_date: values.forecastDate,
    inflow_amount: values.inflowAmount,
    is_actual: values.isActual,
    outflow_amount: values.outflowAmount,
  };
}

export async function getForecastEntries(): Promise<QueryResult<ForecastListItem[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_flow_forecasts")
    .select(
      "id, category, confidence, currency, description, entity_name, forecast_date, inflow_amount, is_actual, net_position, outflow_amount",
    )
    .order("forecast_date", { ascending: true })
    .limit(30);

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

export async function createForecast(
  values: ForecastInput,
): Promise<ForecastActionState> {
  const parsed = forecastSchema.safeParse(values);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return globalError("Unauthorized.");
  }

  const payload: TableInsert<"cash_flow_forecasts"> = {
    ...normalizeForecast(parsed.data),
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("cash_flow_forecasts")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return globalError(error.message);
  }

  revalidatePath("/forecasts");
  revalidatePath("/dashboard");

  return {
    data: { id: data.id },
    success: true,
  };
}
