import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountForm } from "@/components/accounts/account-form";
import {
  getBankAccountById,
  updateBankAccount,
} from "@/lib/actions/bank-accounts";

export const metadata: Metadata = {
  title: "Edit Account | LiquidIQ",
  description: "Edit treasury bank account details in LiquidIQ.",
};

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBankAccountById(id);

  if ("error" in result) {
    notFound();
  }

  const account = result.data;

  return (
    <AccountForm
      mode="edit"
      initialValues={{
        accountName: account.account_name,
        accountNumber: account.account_number,
        accountType: account.account_type,
        availableBalance: Number(account.available_balance),
        bankCode: account.bank_code ?? "",
        bankName: account.bank_name,
        country: account.country ?? "",
        currency: account.currency,
        currentBalance: Number(account.current_balance),
        entityName: account.entity_name ?? "",
        iban: account.iban ?? "",
        notes: account.notes ?? "",
        status: account.status,
        swiftBic: account.swift_bic ?? "",
      }}
      onSubmitAction={async (values) => {
        "use server";
        return updateBankAccount(id, values);
      }}
    />
  );
}
