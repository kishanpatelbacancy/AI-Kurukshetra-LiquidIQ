import { Skeleton } from "@/components/ui/skeleton";

export default function AddPaymentLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Skeleton className="h-8 w-32 bg-slate-700" />
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-8">
        <Skeleton className="h-8 w-64 bg-slate-700" />
        <Skeleton className="mt-3 h-4 w-96 bg-slate-700" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full bg-slate-700" />
          ))}
        </div>
        <Skeleton className="mt-6 h-24 w-full bg-slate-700" />
        <div className="mt-6 flex justify-end gap-3">
          <Skeleton className="h-11 w-28 bg-slate-700" />
          <Skeleton className="h-11 w-40 bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
