"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, Plane } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard overview",
  "/admin/flights": "Flight scheduler",
  "/admin/bookings": "Bookings",
  "/admin/payments": "Payments",
  "/admin/airports": "Airport infrastructure",
  "/admin/airlines": "Airline infrastructure",
  "/admin/aircraft": "Fleet & aircraft configuration",
  "/admin/users": "User directory",
};

const MOBILE_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/flights", label: "Flight scheduler" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/airports", label: "Airports" },
  { href: "/admin/airlines", label: "Airlines" },
  { href: "/admin/aircraft", label: "Fleet & aircraft" },
  { href: "/admin/users", label: "User directory" },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold text-slate-900">
            {TITLES[pathname] ?? "Admin"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-aviation-900 text-xs font-bold text-white">
              {user?.firstName?.[0] ?? "A"}
            </span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
              {user ? `${user.firstName} ${user.lastName}` : "Admin"}
            </span>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-aviation-950 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-base font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Plane className="h-4 w-4 -rotate-45 text-sky-400" />
                </span>
                Skyline Control
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 space-y-0.5">
              {MOBILE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    pathname === link.href
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                ← Back to site
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}