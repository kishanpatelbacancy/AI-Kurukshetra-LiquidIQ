import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));

export const bankAccountTypes = [
  "current",
  "savings",
  "money_market",
  "loan",
  "investment",
] as const;

export const bankAccountStatuses = ["active", "inactive", "frozen"] as const;

export const bankAccountSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .min(4, "Account number must be at least 4 characters.")
    .max(34, "Account number must be 34 characters or fewer."),
  accountName: z
    .string()
    .trim()
    .min(2, "Account name must be at least 2 characters.")
    .max(100, "Account name must be 100 characters or fewer."),
  bankName: z
    .string()
    .trim()
    .min(2, "Bank name must be at least 2 characters.")
    .max(100, "Bank name must be 100 characters or fewer."),
  bankCode: optionalText(20),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter ISO code.")
    .transform((value) => value.toUpperCase()),
  accountType: z.enum(bankAccountTypes, {
    error: "Select a valid account type.",
  }),
  status: z.enum(bankAccountStatuses, {
    error: "Select a valid account status.",
  }),
  currentBalance: z.coerce
    .number()
    .finite("Current balance is required."),
  availableBalance: z.coerce
    .number()
    .finite("Available balance is required."),
  entityName: optionalText(100),
  country: optionalText(2).transform((value) => value?.toUpperCase()),
  iban: optionalText(34),
  swiftBic: optionalText(11).transform((value) => value?.toUpperCase()),
  notes: optionalText(500),
});

export type BankAccountFormValues = z.input<typeof bankAccountSchema>;
export type BankAccountInput = z.output<typeof bankAccountSchema>;
