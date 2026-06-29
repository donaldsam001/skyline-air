"use client";

import { useMemo } from "react";
import { CalendarRange, Ticket, Users, CreditCard, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge, bookingStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { MOCK_FLIGHTS } from "@/lib/mock/flights";
import { MOCK_BOOKINGS } from "@/lib/mock/bookings";
import { MOCK_USERS } from "@/lib/mock/users";
import {
  BOOKING_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";

export default function AdminDashboardPage() {
  const stats = useMemo(() => {
    const activeBookings = MOCK_BOOKINGS.filter((b) => b.status === "CREATED" || b.status === "CONFIRMED").length;
    const totalRevenue = MOCK_BOOKINGS.filter((b) => b.paymentStatus === "PAID").reduce((sum, b) => sum + b.totalPrice, 0);
    const pendingPayments = MOCK_BOOKINGS.filter((b) => b.paymentStatus === "PENDING").length;
    return {
      totalFlights: MOCK_FLIGHTS.length,
      activeBookings,
      registeredUsers: MOCK_USERS.length,
      totalRevenue,
      pendingPayments,
    };
  }, []);

  const upcomingFlights = useMemo(
    () =>
      [...MOCK_FLIGHTS]
        .filter((f) => new Date(f.departureTime) > new Date())
        .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
        .slice(0, 5),
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total flights"
          value={stats.totalFlights.toLocaleString()}
          delta="Across 14-day schedule"
          icon={CalendarRange}
          accent="aviation"
        />
        <StatCard
          label="Active bookings"
          value={stats.activeBookings.toLocaleString()}
          delta="Created + confirmed"
          icon={Ticket}
          accent="sky"
        />
        <StatCard
          label="Registered users"
          value={stats.registeredUsers.toLocaleString()}
          delta={`${MOCK_USERS.filter((u) => u.isActive).length} active`}
          icon={Users}
          accent="emerald"
        />
        <StatCard
          label="Payments pending"
          value={stats.pendingPayments.toLocaleString()}
          delta={`${formatCurrency(stats.totalRevenue)} collected`}
          deltaTone="up"
          icon={CreditCard}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-sm font-bold text-slate-900">Recent bookings</h2>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-xs font-semibold text-aviation-900 hover:text-sky-600">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_BOOKINGS.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-mono-data text-sm font-semibold text-slate-800">{b.bookingCode}</p>
                  <p className="text-xs text-slate-400">
                    {b.flight.flightNumber} · {b.bookedBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={paymentStatusTone(b.paymentStatus)}>{b.paymentStatus}</Badge>
                  <Badge tone={bookingStatusTone(b.status)}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming departures */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-sm font-bold text-slate-900">Upcoming departures</h2>
            <Link href="/admin/flights" className="flex items-center gap-1 text-xs font-semibold text-aviation-900 hover:text-sky-600">
              Scheduler <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingFlights.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-mono-data text-sm font-semibold text-slate-800">{f.flightNumber}</p>
                  <p className="text-xs text-slate-400">
                    {f.departureAirport.iataCode} → {f.destinationAirport.iataCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-600">{formatDate(f.departureTime)}</p>
                  <p className="flex items-center justify-end gap-1 text-xs text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {f.availableSeats} seats left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}