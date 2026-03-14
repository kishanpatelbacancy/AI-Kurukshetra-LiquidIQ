import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-slate-700" />
          <Skeleton className="h-4 w-96 bg-slate-700" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-28 bg-slate-700" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full bg-slate-700" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
