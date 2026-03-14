import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="auth-grid-pattern absolute inset-0 opacity-[0.08]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%)]" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300">
            <span className="text-xl leading-none">LQ</span>
            <span>LiquidIQ</span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            Treasury Command Center
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Control cash, payments, and risk from a single enterprise treasury
            workspace.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
