"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type {
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/types/database";
import {
  bankAccountSchema,
  type BankAccountInput,
} from "@/lib/validations/bank-account";

type FieldErrors = Record<string, string[] | undefined>;

type ActionError = {
  _global?: string[];
  fieldErrors?: FieldErrors;
};

export type BankAccountActionState =
  | {
      error: ActionError;
      success?: never;
    }
  | {
      data: { id: string };
      error?: never;
      success: true;
    };

type QueryResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

const idSchema = z.uuid("Invalid account id.");

function validationError(fieldErrors: FieldErrors): BankAccountActionState {
  return {
    error: {
      fieldErrors,
    },
  };
}

function globalError(message: string): BankAccountActionState {
  return {
    error: {
      _global: [message],
    },
  };
}

function normalizeBankAccount(values: BankAccountInput) {
  return {
    account_name: values.accountName,
    account_number: values.accountNumber,
    account_type: values.accountType,
    available_balance: values.availableBalance,
    bank_code: values.bankCode ?? null,
    bank_name: values.bankName,
    country: values.country ?? null,
    currency: values.currency,
    current_balance: values.currentBalance,
    entity_name: values.entityName ?? null,
    iban: values.iban ?? null,
    notes: values.notes ?? null,
    status: values.status,
    swift_bic: values.swiftBic ?? null,
  };
}

export async function getBankAccounts(): Promise<
  QueryResult<
    Array<
      Pick<
        TableRow<"bank_accounts">,
        | "account_name"
        | "account_number"
        | "account_type"
        | "available_balance"
        | "bank_name"
        | "country"
        | "currency"
        | "current_balance"
        | "entity_name"
        | "id"
        | "last_synced_at"
        | "status"
      >
    >
  >
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, account_name, account_number, account_type, available_balance, bank_name, country, currency, current_balance, entity_name, last_synced_at, status",
    )
    .order("available_balance", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

export async function getBankAccountById(id: string): Promise<
  QueryResult<TableRow<"bank_accounts">>
> {
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "Invalid account id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Bank account not found." };
  }

  return { data: data as TableRow<"bank_accounts"> };
}

export async function getTransactionsByBankAccount(id: string): Promise<
  QueryResult<
    Array<
      Pick<
        TableRow<"transactions">,
        | "amount"
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
      >
    >
  >
> {
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "Invalid account id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, amount, booking_date, counterparty, currency, description, reconciled, status, transaction_ref, transaction_type, value_date",
    )
    .eq("bank_account_id", parsedId.data)
    .order("value_date", { ascending: false })
    .limit(12);

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

export async function createBankAccount(
  values: BankAccountInput,
): Promise<BankAccountActionState> {
  const parsed = bankAccountSchema.safeParse(values);

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

  const payload: TableInsert<"bank_accounts"> = {
    ...normalizeBankAccount(parsed.data),
    created_by: user.id,
    last_synced_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return globalError(error.message);
  }

  revalidatePath("/accounts");
  revalidatePath("/dashboard");

  return {
    data: { id: data.id },
    success: true,
  };
}

export async function updateBankAccount(
  id: string,
  values: BankAccountInput,
): Promise<BankAccountActionState> {
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return globalError(parsedId.error.issues[0]?.message ?? "Invalid account id.");
  }

  const parsed = bankAccountSchema.safeParse(values);

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

  const payload: TableUpdate<"bank_accounts"> = {
    ...normalizeBankAccount(parsed.data),
    last_synced_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("bank_accounts")
    .update(payload)
    .eq("id", parsedId.data)
    .select("id")
    .single();

  if (error) {
    return globalError(error.message);
  }

  revalidatePath("/accounts");
  revalidatePath(`/accounts/${parsedId.data}`);
  revalidatePath(`/accounts/${parsedId.data}/edit`);
  revalidatePath("/dashboard");

  return {
    data: { id: data.id },
    success: true,
  };
}
