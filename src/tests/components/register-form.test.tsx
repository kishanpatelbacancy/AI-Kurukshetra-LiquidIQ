"use client";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/components/auth/register-form";
import { register } from "@/lib/actions/auth";

const push = vi.fn();
const refresh = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

vi.mock("@/lib/actions/auth", () => ({
  register: vi.fn(),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the registration fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows client-side validation when passwords do not match", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), "Avery Chen");
    await user.type(
      screen.getByLabelText(/work email/i),
      "treasury@liquidiq.com",
    );
    await user.type(screen.getByLabelText(/^password/i), "supersecret");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "differentpass",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });

    expect(register).not.toHaveBeenCalled();
  });

  it("submits valid registration data and redirects on success", async () => {
    const user = userEvent.setup();
    vi.mocked(register).mockResolvedValue({ success: true });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), "Avery Chen");
    await user.type(
      screen.getByLabelText(/work email/i),
      "treasury@liquidiq.com",
    );
    await user.type(screen.getByLabelText(/^password/i), "supersecret");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "supersecret",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        fullName: "Avery Chen",
        email: "treasury@liquidiq.com",
        password: "supersecret",
        confirmPassword: "supersecret",
      });
    });

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith(
      "Account created successfully.",
    );
  });
});
