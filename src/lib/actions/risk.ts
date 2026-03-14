"use server";

import { createClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";

type QueryResult<T> = { data: T; error?: never } | { data?: never; error: string };

export type RiskExposureListItem = Pick<
  TableRow<"risk_exposures">,
  | "base_currency"
  | "counterparty"
  | "currency_pair"
  | "entity_name"
  | "exposure_amount"
  | "exposure_date"
  | "hedge_ratio"
  | "id"
  | "mark_to_market"
  | "maturity_date"
  | "risk_type"
  | "severity"
>;

export type CurrencyRateListItem = Pick<
  TableRow<"currency_rates">,
  "base" | "id" | "rate" | "rate_date" | "source" | "target"
>;

export async function getRiskExposures(): Promise<
  QueryResult<RiskExposureListItem[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("risk_exposures")
    .select(
      "id, base_currency, counterparty, currency_pair, entity_name, exposure_amount, exposure_date, hedge_ratio, mark_to_market, maturity_date, risk_type, severity",
    )
    .order("exposure_date", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

export async function getCurrencyRates(): Promise<
  QueryResult<CurrencyRateListItem[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("currency_rates")
    .select("id, base, rate, rate_date, source, target")
    .order("rate_date", { ascending: false })
    .limit(12);

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}
