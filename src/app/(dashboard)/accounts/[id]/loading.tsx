import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-28 bg-slate-700" />
          <Skeleton className="h-9 w-64 bg-slate-700" />
          <Skeleton className="h-4 w-80 bg-slate-700" />
        </div>
        <Skeleton className="h-11 w-32 bg-slate-700" />
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-700 bg-slate-800 p-6"
          >
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="mt-4 h-8 w-32 bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <Skeleton className="h-6 w-40 bg-slate-700" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
