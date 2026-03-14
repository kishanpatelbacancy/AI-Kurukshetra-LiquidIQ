import type { Metadata } from "next";

import { AccountForm } from "@/components/accounts/account-form";
import { createBankAccount } from "@/lib/actions/bank-accounts";

export const metadata: Metadata = {
  title: "Add Account | LiquidIQ",
  description: "Add a treasury bank account in LiquidIQ.",
};

export default function AddAccountPage() {
  return <AccountForm mode="create" onSubmitAction={createBankAccount} />;
}
