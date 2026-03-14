"use client";

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose } from "lucide-react";
import { useState } from "react";

import { getRouteContext } from "@/lib/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { LogoutButton } from "@/components/layout/logout-button";

type DashboardHeaderProps = {
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

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const route = getRouteContext(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu className="size-5 text-slate-100" />
            </SheetTrigger>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="w-[260px] border-r border-slate-800 bg-slate-950 p-0 text-slate-100"
            >
              <DashboardSidebar
                profile={profile}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex size-10 items-center justify-center rounded-xl bg-slate-900 text-slate-500">
            <PanelLeftClose className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {route.section}
            </p>
            <h1 className="truncate text-xl font-semibold text-slate-100">
              {route.title}
            </h1>
            <p className="hidden text-sm text-slate-400 sm:block">
              {route.description}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-left transition hover:border-slate-600 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                aria-label="Open user menu"
              />
            }
          >
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-slate-200">
                {profile.fullName}
              </p>
              <p className="truncate text-xs text-slate-500">{profile.role}</p>
            </div>
            <Avatar className="ring-1 ring-slate-700">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              ) : null}
              <AvatarFallback className="bg-slate-800 text-slate-200">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-72 min-w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-100 shadow-xl shadow-black/30"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-100">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-slate-500">{profile.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-800" />
            <div className="rounded-lg px-2 py-2">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Active role
              </p>
              <p className="mt-1 text-sm font-medium text-slate-200">
                {profile.role}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-slate-800" />
            <div className="px-1 pt-1">
              <LogoutButton compact />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
