import { describe, expect, it } from "vitest";

import {
  paymentDecisionSchema,
  paymentSchema,
} from "@/lib/validations/payment";

describe("paymentSchema", () => {
  it("accepts valid payment input", () => {
    const result = paymentSchema.safeParse({
      fromAccountId: "550e8400-e29b-41d4-a716-446655440000",
      toAccountId: "",
      beneficiaryName: "Northwind Vendors",
      beneficiaryIban: "",
      beneficiaryBank: "Settlement Bank",
      amount: "50000.25",
      currency: "gbp",
      paymentType: "wire",
      valueDate: "2026-03-18",
      purpose: "Supplier payment",
      priority: "high",
      requiredApprovals: "2",
      notes: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe("GBP");
    expect(result.data?.toAccountId).toBeUndefined();
    expect(result.data?.notes).toBeUndefined();
  });

  it("rejects invalid approval counts", () => {
    const result = paymentSchema.safeParse({
      fromAccountId: "550e8400-e29b-41d4-a716-446655440000",
      beneficiaryName: "Northwind Vendors",
      amount: 50000,
      currency: "USD",
      paymentType: "wire",
      valueDate: "2026-03-18",
      priority: "high",
      requiredApprovals: 6,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.requiredApprovals).toBeDefined();
  });
});

describe("paymentDecisionSchema", () => {
  it("allows blank comments", () => {
    const result = paymentDecisionSchema.safeParse({ comments: "" });

    expect(result.success).toBe(true);
    expect(result.data?.comments).toBeUndefined();
  });
});
