import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-800/95 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="space-y-3 px-8 pt-8">
        <Skeleton className="h-9 w-40 bg-slate-700" />
        <Skeleton className="h-4 w-full bg-slate-700" />
        <Skeleton className="h-4 w-4/5 bg-slate-700" />
      </div>

      <div className="space-y-5 px-8 py-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="h-11 w-full bg-slate-700" />
          </div>
        ))}

        <Skeleton className="h-11 w-full rounded-xl bg-slate-700" />
        <Skeleton className="mx-auto h-4 w-40 bg-slate-700" />
      </div>
    </div>
  );
}
