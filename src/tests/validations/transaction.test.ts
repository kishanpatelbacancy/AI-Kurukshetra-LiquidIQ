import { describe, expect, it } from "vitest";

import {
  parseTransactionFilters,
  transactionFilterSchema,
} from "@/lib/validations/transaction";

describe("transactionFilterSchema", () => {
  it("accepts valid filters", () => {
    const result = transactionFilterSchema.safeParse({
      accountId: "550e8400-e29b-41d4-a716-446655440000",
      q: "vendor",
      status: "pending",
      type: "credit",
    });

    expect(result.success).toBe(true);
  });

  it("converts empty strings to undefined", () => {
    const result = transactionFilterSchema.safeParse({
      accountId: "",
      q: "",
      status: "",
      type: "",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      accountId: undefined,
      q: undefined,
      status: undefined,
      type: undefined,
    });
  });

  it("rejects invalid status values", () => {
    const result = transactionFilterSchema.safeParse({
      status: "posted",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.status).toBeDefined();
  });
});

describe("parseTransactionFilters", () => {
  it("normalizes array-based search params", () => {
    const result = parseTransactionFilters({
      q: ["vendor invoice"],
      status: ["completed"],
      type: ["debit"],
    });

    expect(result).toEqual({
      accountId: undefined,
      q: "vendor invoice",
      status: "completed",
      type: "debit",
    });
  });
});
