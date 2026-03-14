import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="auth-grid-pattern absolute inset-0 opacity-[0.08]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-800/95 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-3 text-green-300">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm font-medium tracking-wide uppercase">
            Loading workspace
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <Skeleton className="h-8 w-40 bg-slate-700" />
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-3/4 bg-slate-700" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="h-11 w-full bg-slate-700" />
            <Skeleton className="h-4 w-28 bg-slate-700" />
            <Skeleton className="h-11 w-full bg-slate-700" />
            <Skeleton className="h-11 w-full rounded-xl bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
