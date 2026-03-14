import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | LiquidIQ",
  description: "Sign in to access the LiquidIQ treasury command center.",
};

export default function LoginPage() {
  return <LoginForm />;
}
