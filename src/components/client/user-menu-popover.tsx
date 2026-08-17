"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Ticket,
  HelpCircle,
  LogOut,
  ChevronDown,
  Globe,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { User } from "@/types";

interface UserMenuPopoverProps {
  user: User | null;
  isAdmin?: boolean;
  onLogout: () => void;
}

export function UserMenuPopover({ user, isAdmin, onLogout }: UserMenuPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fullName = user?.firstName || user?.lastName 
    ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() 
    : "My Account";

  const initials = user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : "U";

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-aviation-900/10 text-aviation-900 font-bold text-xs">
          {initials}
        </span>
        <span className="text-sm font-semibold max-w-[120px] truncate">
          {fullName}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Details Header */}
          <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {fullName}
              </p>
              {user?.email && (
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              )}
            </div>
          </div>

          {/* Quick Nav Options */}
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-aviation-900 font-medium hover:bg-sky-50 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-600" />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              href="/my-bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Ticket className="h-4 w-4 text-sky-600" />
              <span>Bookings & Trips</span>
            </Link>

            <Link
              href="/my-profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-slate-500" />
              <span>Manage Account</span>
            </Link>

            <Link
              href="/my-profile?tab=security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Shield className="h-4 w-4 text-slate-500" />
              <span>Security</span>
            </Link>

            <Link
              href="/flights"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Globe className="h-4 w-4 text-slate-500" />
              <span>Search Flights</span>
            </Link>

          </div>

          <div className="my-1 border-t border-slate-100" />

          {/* Help & Settings */}
          <div className="py-1">
            <Link
              href="/my-profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>Customer Support</span>
            </Link>
          </div>

          <div className="my-1 border-t border-slate-100" />

          {/* Sign Out Button */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}