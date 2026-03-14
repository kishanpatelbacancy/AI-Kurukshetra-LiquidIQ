import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | LiquidIQ",
  description: "Create a LiquidIQ account for treasury operations.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
