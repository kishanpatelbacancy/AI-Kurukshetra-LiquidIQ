"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database";
import {
  paymentDecisionSchema,
  paymentSchema,
  type PaymentDecisionInput,
  type PaymentInput,
} from "@/lib/validations/payment";

type FieldErrors = Record<string, string[] | undefined>;

type ActionError = {
  _global?: string[];
  fieldErrors?: FieldErrors;
};

export type PaymentActionState =
  | {
      error: ActionError;
      success?: never;
    }
  | {
      data: { id: string };
      error?: never;
      success: true;
    };

type QueryResult<T> = { data: T; error?: never } | { data?: never; error: string };

export type PaymentListItem = Pick<
  TableRow<"payments">,
  | "amount"
  | "approval_level"
  | "beneficiary_name"
  | "created_at"
  | "currency"
  | "from_account_id"
  | "id"
  | "payment_ref"
  | "payment_type"
  | "priority"
  | "required_approvals"
  | "status"
  | "value_date"
>;

export type PaymentApprovalItem = Pick<
  TableRow<"approval_workflows">,
  "action" | "actioned_at" | "approver_id" | "comments" | "id"
>;

const idSchema = z.uuid("Invalid payment id.");

function validationError(fieldErrors: FieldErrors): PaymentActionState {
  return {
    error: {
      fieldErrors,
    },
  };
}

function globalError(message: string): PaymentActionState {
  return {
    error: {
      _global: [message],
    },
  };
}

function buildPaymentRef() {
  return `PAY-${Date.now().toString().slice(-8)}`;
}

function normalizePayment(values: PaymentInput): TableInsert<"payments"> {
  return {
    amount: values.amount,
    beneficiary_bank: values.beneficiaryBank ?? null,
    beneficiary_iban: values.beneficiaryIban ?? null,
    beneficiary_name: values.beneficiaryName,
    currency: values.currency,
    from_account_id: values.fromAccountId,
    notes: values.notes ?? null,
    payment_ref: buildPaymentRef(),
    payment_type: values.paymentType,
    priority: values.priority,
    purpose: values.purpose ?? null,
    required_approvals: values.requiredApprovals,
    to_account_id: values.toAccountId ?? null,
    value_date: values.valueDate,
  };
}

export async function getPayments(
  status?: TableRow<"payments">["status"],
): Promise<QueryResult<PaymentListItem[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("payments")
    .select(
      "id, amount, approval_level, beneficiary_name, created_at, currency, from_account_id, payment_ref, payment_type, priority, required_approvals, status, value_date",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

export async function getPaymentById(
  id: string,
): Promise<QueryResult<TableRow<"payments">>> {
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "Invalid payment id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Payment not found." };
  }

  return { data: data as TableRow<"payments"> };
}

export async function getApprovalWorkflow(
  paymentId: string,
): Promise<QueryResult<PaymentApprovalItem[]>> {
  const parsedId = idSchema.safeParse(paymentId);

  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "Invalid payment id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approval_workflows")
    .select("id, action, actioned_at, approver_id, comments")
    .eq("payment_id", parsedId.data)
    .order("actioned_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: data ?? [] };
}

export async function createPayment(
  values: PaymentInput,
): Promise<PaymentActionState> {
  const parsed = paymentSchema.safeParse(values);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return globalError("Unauthorized.");
  }

  const payload: TableInsert<"payments"> = {
    ...normalizePayment(parsed.data),
    created_by: user.id,
    status: "draft",
  };

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return globalError(error.message);
  }

  revalidatePath("/payments");
  revalidatePath("/dashboard");

  return {
    data: { id: data.id },
    success: true,
  };
}

async function insertApprovalWorkflow(
  paymentId: string,
  approverId: string,
  action: TableInsert<"approval_workflows">["action"],
  comments?: string,
) {
  const supabase = await createClient();

  await supabase.from("approval_workflows").insert({
    action,
    approver_id: approverId,
    comments: comments ?? null,
    payment_id: paymentId,
  });
}

async function updatePaymentStatus(
  paymentId: string,
  payload: TableUpdate<"payments">,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .update(payload)
    .eq("id", paymentId)
    .select("id")
    .single();

  if (error) {
    return { error: error.message } as const;
  }

  revalidatePath("/payments");
  revalidatePath(`/payments/${paymentId}`);
  revalidatePath("/dashboard");

  return { data } as const;
}

export async function submitPaymentForApproval(
  paymentId: string,
): Promise<PaymentActionState> {
  const parsedId = idSchema.safeParse(paymentId);

  if (!parsedId.success) {
    return globalError(parsedId.error.issues[0]?.message ?? "Invalid payment id.");
  }

  const result = await updatePaymentStatus(parsedId.data, {
    status: "pending_approval",
  });

  if ("error" in result && result.error) {
    return globalError(result.error);
  }

  const updatedPayment = "data" in result ? result.data : undefined;

  if (!updatedPayment) {
    return globalError("Failed to update payment status.");
  }

  return {
    data: { id: updatedPayment.id },
    success: true,
  };
}

export async function approvePayment(
  paymentId: string,
  values: PaymentDecisionInput,
): Promise<PaymentActionState> {
  const parsedId = idSchema.safeParse(paymentId);

  if (!parsedId.success) {
    return globalError(parsedId.error.issues[0]?.message ?? "Invalid payment id.");
  }

  const parsedDecision = paymentDecisionSchema.safeParse(values);

  if (!parsedDecision.success) {
    return validationError(parsedDecision.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return globalError("Unauthorized.");
  }

  const paymentResult = await getPaymentById(parsedId.data);

  if ("error" in paymentResult && paymentResult.error) {
    return globalError(paymentResult.error);
  }

  const payment = "data" in paymentResult ? paymentResult.data : undefined;

  if (!payment) {
    return globalError("Payment not found.");
  }

  const nextApprovalLevel = Number(payment.approval_level) + 1;
  const isFinalApproval = nextApprovalLevel >= Number(payment.required_approvals);

  const statusUpdate = await updatePaymentStatus(parsedId.data, {
    approval_level: nextApprovalLevel,
    approved_at: isFinalApproval ? new Date().toISOString() : null,
    approved_by: isFinalApproval ? user.id : null,
    status: isFinalApproval ? "approved" : "pending_approval",
  });

  if ("error" in statusUpdate && statusUpdate.error) {
    return globalError(statusUpdate.error);
  }

  await insertApprovalWorkflow(
    parsedId.data,
    user.id,
    "approved",
    parsedDecision.data.comments,
  );

  return {
    data: { id: parsedId.data },
    success: true,
  };
}

export async function rejectPayment(
  paymentId: string,
  values: PaymentDecisionInput,
): Promise<PaymentActionState> {
  const parsedId = idSchema.safeParse(paymentId);

  if (!parsedId.success) {
    return globalError(parsedId.error.issues[0]?.message ?? "Invalid payment id.");
  }

  const parsedDecision = paymentDecisionSchema.safeParse(values);

  if (!parsedDecision.success) {
    return validationError(parsedDecision.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return globalError("Unauthorized.");
  }

  const statusUpdate = await updatePaymentStatus(parsedId.data, {
    status: "rejected",
  });

  if ("error" in statusUpdate && statusUpdate.error) {
    return globalError(statusUpdate.error);
  }

  await insertApprovalWorkflow(
    parsedId.data,
    user.id,
    "rejected",
    parsedDecision.data.comments,
  );

  return {
    data: { id: parsedId.data },
    success: true,
  };
}
