"use client";

import { Loader2, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
  compact?: boolean;
};

function LogoutSubmitButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size={compact ? "sm" : "default"}
      disabled={pending}
      className={cn(
        "justify-start rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        compact ? "h-9 w-full px-3" : "h-10 w-full px-3",
      )}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 size-4" />
          Sign out
        </>
      )}
    </Button>
  );
}

export function LogoutButton({ className, compact }: LogoutButtonProps) {
  return (
    <form action={logout} className={className}>
      <LogoutSubmitButton compact={compact} />
    </form>
  );
}
