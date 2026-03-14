import { Skeleton } from "@/components/ui/skeleton";

export default function ForecastsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-700 bg-slate-800 p-6"
          >
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="mt-4 h-8 w-28 bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <Skeleton className="h-6 w-40 bg-slate-700" />
        <Skeleton className="mt-3 h-4 w-72 bg-slate-700" />
        <Skeleton className="mt-6 h-72 w-full rounded-xl bg-slate-700" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Skeleton className="h-6 w-48 bg-slate-700" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full bg-slate-700" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Skeleton className="h-6 w-40 bg-slate-700" />
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full bg-slate-700" />
            ))}
            <Skeleton className="h-24 w-full bg-slate-700" />
            <Skeleton className="h-11 w-36 bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
