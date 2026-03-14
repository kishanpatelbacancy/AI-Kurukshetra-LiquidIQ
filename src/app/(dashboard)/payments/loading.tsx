import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-slate-700" />
          <Skeleton className="h-4 w-96 bg-slate-700" />
        </div>
        <Skeleton className="h-11 w-40 bg-slate-700" />
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-2">
        <Skeleton className="h-10 w-full bg-slate-700" />
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
