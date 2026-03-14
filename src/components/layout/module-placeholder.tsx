import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePlaceholderProps = {
  description: string;
  highlights: Array<{
    description: string;
    title: string;
  }>;
  kicker: string;
  title: string;
};

export function ModulePlaceholder({
  description,
  highlights,
  kicker,
  title,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/10 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-green-400">
          {kicker}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          {description}
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {highlights.map((highlight) => (
          <Card
            key={highlight.title}
            className="rounded-2xl border-slate-800 bg-slate-900/70 text-slate-100"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-lg font-semibold">
                <span>{highlight.title}</span>
                <ArrowRight className="size-4 text-green-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-400">
                {highlight.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
