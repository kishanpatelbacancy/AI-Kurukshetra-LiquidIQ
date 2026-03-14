import { describe, expect, it } from "vitest";

import { bankAccountSchema } from "@/lib/validations/bank-account";

describe("bankAccountSchema", () => {
  it("accepts valid input and normalizes optional values", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "1234567890",
      accountName: "Operating Account",
      bankName: "Global Bank",
      bankCode: "",
      currency: "usd",
      accountType: "current",
      status: "active",
      currentBalance: "1200000.55",
      availableBalance: "1100000.1",
      entityName: "",
      country: "us",
      iban: "",
      swiftBic: "abcdu123",
      notes: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe("USD");
    expect(result.data?.bankCode).toBeUndefined();
    expect(result.data?.entityName).toBeUndefined();
    expect(result.data?.country).toBe("US");
    expect(result.data?.swiftBic).toBe("ABCDU123");
  });

  it("rejects an unsupported account type", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "1234567890",
      accountName: "Operating Account",
      bankName: "Global Bank",
      currency: "USD",
      accountType: "crypto",
      status: "active",
      currentBalance: 100,
      availableBalance: 100,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.accountType).toBeDefined();
  });
});
