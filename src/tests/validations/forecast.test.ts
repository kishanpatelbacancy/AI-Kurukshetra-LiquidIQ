import { describe, expect, it } from "vitest";

import { forecastSchema } from "@/lib/validations/forecast";

describe("forecastSchema", () => {
  it("accepts valid forecast data", () => {
    const result = forecastSchema.safeParse({
      forecastDate: "2026-03-20",
      entityName: "",
      currency: "eur",
      inflowAmount: "250000",
      outflowAmount: "175000",
      category: "operating",
      description: "Quarter-end collections",
      confidence: "high",
      isActual: false,
    });

    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe("EUR");
    expect(result.data?.entityName).toBeUndefined();
  });

  it("rejects negative inflows", () => {
    const result = forecastSchema.safeParse({
      forecastDate: "2026-03-20",
      currency: "USD",
      inflowAmount: -1,
      outflowAmount: 100,
      category: "operating",
      confidence: "medium",
      isActual: false,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.inflowAmount).toBeDefined();
  });
});
