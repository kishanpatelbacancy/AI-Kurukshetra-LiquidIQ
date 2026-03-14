"use server";

import { createClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";
import type { TransactionFilters } from "@/lib/validations/transaction";

type QueryResult<T> = { data: T; error?: never } | { data?: never; error: string };

export type TransactionListItem = Pick<
  TableRow<"transactions">,
  | "amount"
  | "bank_account_id"
  | "booking_date"
  | "counterparty"
  | "currency"
  | "description"
  | "id"
  | "reconciled"
  | "status"
  | "transaction_ref"
  | "transaction_type"
  | "value_date"
>;

export async function getTransactions(
  filters: TransactionFilters,
): Promise<QueryResult<TransactionListItem[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select(
      "id, amount, bank_account_id, booking_date, counterparty, currency, description, reconciled, status, transaction_ref, transaction_type, value_date",
    )
    .order("value_date", { ascending: false })
    .limit(100);

  if (filters.accountId) {
    query = query.eq("bank_account_id", filters.accountId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.type) {
    query = query.eq("transaction_type", filters.type);
  }

  if (filters.q) {
    const search = `%${filters.q}%`;
    query = query.or(
      `transaction_ref.ilike.${search},description.ilike.${search},counterparty.ilike.${search}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}
