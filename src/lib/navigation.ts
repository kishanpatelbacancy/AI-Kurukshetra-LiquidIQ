import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  FileBarChart2,
  Landmark,
  LayoutDashboard,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

export type DashboardNavItem = {
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    description: "Treasury overview and KPI monitoring",
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    description: "Bank account visibility and balances",
    href: "/accounts",
    icon: Landmark,
    label: "Bank Accounts",
  },
  {
    description: "Searchable transaction ledger",
    href: "/transactions",
    icon: ArrowLeftRight,
    label: "Transactions",
  },
  {
    description: "Cash flow forecasting and planning",
    href: "/forecasts",
    icon: BarChart3,
    label: "Forecasts",
  },
  {
    description: "Payment initiation and approvals",
    href: "/payments",
    icon: WalletCards,
    label: "Payments",
  },
  {
    description: "Exposure tracking and controls",
    href: "/risk",
    icon: ShieldAlert,
    label: "Risk",
  },
  {
    description: "Executive reporting and exports",
    href: "/reports",
    icon: FileBarChart2,
    label: "Reports",
  },
];

const navLookup = new Map(
  dashboardNavItems.map((item) => [item.href.replace("/", ""), item]),
);

export function getRouteContext(pathname: string) {
  const [segment = "dashboard"] = pathname.split("/").filter(Boolean);
  const item = navLookup.get(segment) ?? dashboardNavItems[0];

  return {
    description: item.description,
    section: "Treasury Operations",
    title: item.label,
  };
}
