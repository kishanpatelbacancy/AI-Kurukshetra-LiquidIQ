import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "LiquidIQ",
  description: "Enterprise treasury and cash flow command center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NextTopLoader color="#22c55e" height={3} showSpinner={false} />
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            classNames: {
              description: "text-slate-300",
              toast: "border border-slate-700 bg-slate-900 text-slate-100",
              title: "text-slate-100",
            },
          }}
        />
      </body>
    </html>
  );
}
