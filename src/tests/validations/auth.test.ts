import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "treasury@liquidiq.com",
      password: "supersecret",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "supersecret",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toBeDefined();
  });

  it("rejects a short password", () => {
    const result = loginSchema.safeParse({
      email: "treasury@liquidiq.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      fullName: "Avery Chen",
      email: "treasury@liquidiq.com",
      password: "supersecret",
      confirmPassword: "supersecret",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Avery Chen",
      email: "treasury@liquidiq.com",
      password: "supersecret",
      confirmPassword: "differentpass",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      "Passwords do not match.",
    );
  });
});
