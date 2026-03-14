"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

import { dashboardNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/layout/logout-button";

type DashboardSidebarProps = {
  onNavigate?: () => void;
  profile: {
    avatarUrl: string | null;
    email: string;
    fullName: string;
    role: string;
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardSidebar({
  onNavigate,
  profile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-green-500/10 text-sm font-semibold text-green-400 ring-1 ring-green-500/20">
            LQ
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              LiquidIQ
            </p>
            <p className="text-xs text-slate-500">Treasury Command Center</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                type="button"
              />
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 text-green-400">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Global Treasury
                </p>
                <p className="text-xs text-slate-500">Enterprise workspace</p>
              </div>
            </div>
            <ChevronDown className="size-4 text-slate-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={8}
            className="w-72 min-w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-100 shadow-xl shadow-black/30"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 text-slate-500">
                Treasury entities
              </DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg px-2 py-2 text-slate-100 focus:bg-slate-800 focus:text-slate-100">
                <CheckCircle2 className="size-4 text-green-400" />
                Global Treasury
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-2 py-2 text-slate-300 focus:bg-slate-800 focus:text-slate-100">
                <Building2 className="size-4 text-slate-400" />
                LiquidIQ Europe
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-2 py-2 text-slate-300 focus:bg-slate-800 focus:text-slate-100">
                <Building2 className="size-4 text-slate-400" />
                LiquidIQ Asia
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-5" aria-label="Primary">
        {dashboardNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isNavigating = pendingHref === item.href && !isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setPendingHref(item.href);
                onNavigate?.();
              }}
              className={cn(
                "mx-2 flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition",
                isActive
                  ? "border-green-500 bg-slate-800 text-green-400"
                  : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100",
              )}
            >
              {isNavigating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <item.icon className="size-4" />
              )}
              <span className={cn(isActive ? "font-medium" : "font-normal")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="ring-1 ring-slate-700">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              ) : null}
              <AvatarFallback className="bg-slate-800 text-slate-200">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {profile.fullName}
              </p>
              <p className="truncate text-xs text-slate-500">{profile.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-400">
            <span>Role</span>
            <span className="font-medium text-slate-200">{profile.role}</span>
          </div>
          <LogoutButton className="mt-3" />
        </div>
      </div>
    </div>
  );
}
