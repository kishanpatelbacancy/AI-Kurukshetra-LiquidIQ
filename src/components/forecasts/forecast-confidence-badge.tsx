import { cn } from "@/lib/utils";

type Confidence = "high" | "low" | "medium";

const confidenceStyles: Record<Confidence, string> = {
  high: "border-green-500/20 bg-green-500/10 text-green-400",
  medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  low: "border-red-500/20 bg-red-500/10 text-red-400",
};

export function ForecastConfidenceBadge({
  confidence,
}: {
  confidence: Confidence;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        confidenceStyles[confidence],
      )}
    >
      {confidence}
    </span>
  );
}
