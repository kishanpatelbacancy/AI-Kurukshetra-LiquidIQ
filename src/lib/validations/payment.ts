import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));

const optionalUuid = z
  .string()
  .uuid("Select a valid account.")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const paymentTypes = [
  "wire",
  "ach",
  "sepa",
  "swift",
  "internal",
  "check",
] as const;

export const paymentPriorities = ["low", "normal", "high", "urgent"] as const;

export const paymentSchema = z.object({
  fromAccountId: z.string().uuid("Select a source account."),
  toAccountId: optionalUuid,
  beneficiaryName: z
    .string()
    .trim()
    .min(2, "Beneficiary name must be at least 2 characters.")
    .max(120, "Beneficiary name must be 120 characters or fewer."),
  beneficiaryIban: optionalText(34),
  beneficiaryBank: optionalText(120),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter ISO code.")
    .transform((value) => value.toUpperCase()),
  paymentType: z.enum(paymentTypes, {
    error: "Select a valid payment type.",
  }),
  valueDate: z.string().min(1, "Value date is required."),
  purpose: optionalText(200),
  priority: z.enum(paymentPriorities, {
    error: "Select a valid priority.",
  }),
  requiredApprovals: z.coerce
    .number()
    .int("Approvals must be a whole number.")
    .min(1, "At least one approval is required.")
    .max(5, "Maximum approval count is 5."),
  notes: optionalText(500),
});

export const paymentDecisionSchema = z.object({
  comments: optionalText(300),
});

export type PaymentFormValues = z.input<typeof paymentSchema>;
export type PaymentInput = z.output<typeof paymentSchema>;
export type PaymentDecisionInput = z.output<typeof paymentDecisionSchema>;
