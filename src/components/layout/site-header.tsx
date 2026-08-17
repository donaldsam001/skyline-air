"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plane, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { UserMenuPopover } from "@/components/client/user-menu-popover";

const NAV_LINKS = [
  { href: "/", label: "Book a flight" },
  { href: "/flights", label: "Flight status" },
  { href: "/my-bookings", label: "My bookings" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, isAdmin, logout, fetchProfile } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Determine if we're on a dark hero page (home or flights)
  const isDarkPage = pathname === "/" || pathname?.startsWith("/flights");

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-colors ${
        isDarkPage
          ? "border-white/10 bg-aviation-950/95"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`flex items-center gap-2 font-display text-lg font-bold ${
            isDarkPage ? "text-white" : "text-aviation-900"
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-aviation-900 text-white">
            <Plane className="h-4.5 w-4.5 -rotate-45" />
          </span>
          Skyline Air
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? isDarkPage
                    ? "bg-white/15 text-white"
                    : "bg-aviation-900/5 text-aviation-900"
                  : isDarkPage
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin panel
                  </Button>
                </Link>
              )}

              {/* Booking.com Style Popover */}
              <UserMenuPopover user={user} isAdmin={isAdmin} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={isDarkPage ? "text-white/80 hover:text-white hover:bg-white/10" : ""}
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="cta" size="sm">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className={`rounded-lg p-2 md:hidden ${
            isDarkPage ? "text-white/70 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
          }`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className={`border-t px-4 py-3 md:hidden ${
            isDarkPage ? "border-white/10 bg-aviation-950" : "border-slate-200 bg-white"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  isDarkPage
                    ? "text-white/80 hover:bg-white/10"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-aviation-900 hover:bg-sky-100"
              >
                Admin panel
              </Link>
            )}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    router.push("/");
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="cta" size="sm" fullWidth>
                      Create account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}