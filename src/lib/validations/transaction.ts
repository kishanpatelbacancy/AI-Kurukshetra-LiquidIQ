import { z } from "zod";

import type { TransactionStatus, TransactionType } from "@/types/database";

const transactionStatuses = [
  "pending",
  "completed",
  "failed",
  "cancelled",
  "reconciled",
] as const satisfies readonly TransactionStatus[];

const transactionTypes = [
  "credit",
  "debit",
  "transfer",
  "fee",
  "interest",
  "fx",
] as const satisfies readonly TransactionType[];

const emptyStringToUndefined = (value: unknown) =>
  value === "" || value == null ? undefined : value;

export const transactionFilterSchema = z.object({
  accountId: z.preprocess(emptyStringToUndefined, z.uuid().optional()),
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(100, "Search must be 100 characters or fewer.").optional(),
  ),
  status: z.preprocess(
    emptyStringToUndefined,
    z.enum(transactionStatuses).optional(),
  ),
  type: z.preprocess(
    emptyStringToUndefined,
    z.enum(transactionTypes).optional(),
  ),
});

export type TransactionFilters = z.infer<typeof transactionFilterSchema>;

export function parseTransactionFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TransactionFilters {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return transactionFilterSchema.parse(normalized);
}
