import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createPayment } from "@/lib/actions/payments";
import { getBankAccounts } from "@/lib/actions/bank-accounts";
import { PaymentForm } from "@/components/payments/payment-form";

export const metadata: Metadata = {
  title: "Initiate Payment | LiquidIQ",
  description: "Create a treasury payment in LiquidIQ.",
};

export default async function AddPaymentPage() {
  const accountsResult = await getBankAccounts();

  if ("error" in accountsResult) {
    redirect("/payments");
  }

  const accounts = accountsResult.data.map((account) => ({
    account_name: account.account_name,
    currency: account.currency,
    id: account.id,
  }));

  return <PaymentForm accounts={accounts} onSubmitAction={createPayment} />;
}
