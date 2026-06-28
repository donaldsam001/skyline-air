"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlaneTakeoff,
  Building2,
  Plane,
  CalendarRange,
  Users,
  Ticket,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/flights", label: "Flight scheduler", icon: CalendarRange },
      { href: "/admin/bookings", label: "Bookings", icon: Ticket },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { href: "/admin/airports", label: "Airports", icon: Building2 },
      { href: "/admin/airlines", label: "Airlines", icon: PlaneTakeoff },
      { href: "/admin/aircraft", label: "Fleet & aircraft", icon: Plane },
    ],
  },
  {
    title: "Accounts",
    items: [{ href: "/admin/users", label: "User directory", icon: Users }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-aviation-950 lg:flex">
      <div className="flex h-16 items-center gap-2 px-5 font-display text-base font-bold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Plane className="h-4 w-4 -rotate-45 text-sky-400" />
        </span>
        Skyline Control
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 thin-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}