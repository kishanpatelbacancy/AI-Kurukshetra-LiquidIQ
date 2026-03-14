import { describe, expect, it } from "vitest";

import { formatDate } from "@/lib/utils";

describe("formatDate", () => {
  it("formats a date using the default pattern", () => {
    expect(formatDate("2026-01-15")).toBe("Jan 15, 2026");
  });
});
