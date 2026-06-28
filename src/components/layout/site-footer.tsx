import Link from "next/link";
import { Plane } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 font-display text-base font-bold text-aviation-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-900 text-white">
                <Plane className="h-3.5 w-3.5 -rotate-45" />
              </span>
              Skyline Air
            </div>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Searching, booking, and managing flights — built for travelers who want it simple.
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <div>
              <p className="font-semibold text-slate-800">Company</p>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li><Link href="/" className="hover:text-aviation-900">Book a flight</Link></li>
                <li><Link href="/my-bookings" className="hover:text-aviation-900">My bookings</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800">For operators</p>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li><Link href="/admin" className="hover:text-aviation-900">Admin panel</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">© 2026 Skyline Air. All systems nominal.</p>
      </div>
    </footer>
  );
}