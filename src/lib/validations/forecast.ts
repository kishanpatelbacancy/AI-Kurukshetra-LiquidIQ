import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));

export const forecastCategories = [
  "operating",
  "investing",
  "financing",
  "fx",
  "other",
] as const;

export const forecastConfidenceLevels = ["high", "medium", "low"] as const;

export const forecastSchema = z.object({
  forecastDate: z.string().min(1, "Forecast date is required."),
  entityName: optionalText(100),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter ISO code.")
    .transform((value) => value.toUpperCase()),
  inflowAmount: z.coerce.number().min(0, "Inflow cannot be negative."),
  outflowAmount: z.coerce.number().min(0, "Outflow cannot be negative."),
  category: z.enum(forecastCategories, {
    error: "Select a valid forecast category.",
  }),
  description: optionalText(240),
  confidence: z.enum(forecastConfidenceLevels, {
    error: "Select a valid confidence level.",
  }),
  isActual: z.boolean().default(false),
});

export type ForecastFormValues = z.input<typeof forecastSchema>;
export type ForecastInput = z.output<typeof forecastSchema>;
