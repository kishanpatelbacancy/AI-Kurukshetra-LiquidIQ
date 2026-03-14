import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPageLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-700 bg-slate-800 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24 bg-slate-700" />
                <Skeleton className="h-8 w-32 bg-slate-700" />
              </div>
              <Skeleton className="size-10 rounded-lg bg-slate-700" />
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-28 bg-slate-700" />
              <Skeleton className="h-4 w-full bg-slate-700" />
              <Skeleton className="h-4 w-2/3 bg-slate-700" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <Skeleton className="h-6 w-40 bg-slate-700" />
        <Skeleton className="mt-3 h-4 w-72 bg-slate-700" />
        <Skeleton className="mt-6 h-64 w-full rounded-xl bg-slate-700" />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <Skeleton className="h-6 w-40 bg-slate-700" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
