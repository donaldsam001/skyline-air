"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarRange, Ticket, Users, CreditCard, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge, bookingStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { adminApi } from "@/lib/api/admin-client";
import {
  BOOKING_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";

export default function AdminDashboardPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        // Fetch the correct entities for the dashboard metrics
        const [flightsData, bookingsData, usersData, paymentsData] = await Promise.all([
          adminApi.flights.getAll(),
          adminApi.bookings.getAll(),
          adminApi.users.getAll(),
          adminApi.payments.getAll(),
        ]);

        if (mounted) {
          setFlights(flightsData || []);
          setBookings(bookingsData || []);
          setUsers(usersData || []);
          setPayments(paymentsData || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    // Safely calculate stats based on the fetched data
    const activeBookings = bookings.filter(b => b.status === "CREATED" || b.status === "CONFIRMED").length;
    
    // Assuming payments have a 'status' (e.g., PENDING) and an 'amount'
    const pendingPayments = payments.filter(p => p.paymentStatus === "PENDING").length;
    const totalRevenue = payments
      .filter(p => p.paymentStatus === "COMPLETED" || p.paymentStatus === "SUCCESS")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
      
    const activeUsers = users.filter(u => u.active !== false).length; // Adjust based on your User entity

    return {
      totalFlights: flights.length,
      activeBookings,
      registeredUsers: users.length,
      activeUsers,
      pendingPayments,
      totalRevenue,
    };
  }, [flights, bookings, users, payments]);

  const upcomingFlights = useMemo(() => {
    const now = new Date();
    return flights
      .filter((f) => new Date(f.departureTime) > now)
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
      .slice(0, 5);
  }, [flights]);

  // Sort bookings to show the newest ones first
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.bookingDate || 0).getTime() - new Date(a.bookingDate || 0).getTime())
      .slice(0, 5);
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total flights"
          value={stats.totalFlights.toLocaleString()}
          delta="Scheduled in system"
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
          delta={`${stats.activeUsers} active`}
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
            {recentBookings.length === 0 ? (
               <div className="px-5 py-8 text-center text-sm text-slate-500">No bookings found.</div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id || b.bookingCode} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-mono-data text-sm font-semibold text-slate-800">{b.bookingCode}</p>
                    <p className="text-xs text-slate-400">
                      {b.flight?.flightNumber || "Unknown Flight"} · {b.user?.email || b.user?.username || "Guest"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={paymentStatusTone(b.paymentStatus)}>{b.paymentStatus}</Badge>
                    <Badge tone={bookingStatusTone(b.status)}>{BOOKING_STATUS_LABELS[b.status] || b.status}</Badge>
                  </div>
                </div>
              ))
            )}
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
            {upcomingFlights.length === 0 ? (
               <div className="px-5 py-8 text-center text-sm text-slate-500">No upcoming flights scheduled.</div>
            ) : (
              upcomingFlights.map((f) => (
                <div key={f.id || f.flightNumber} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-mono-data text-sm font-semibold text-slate-800">{f.flightNumber}</p>
                    <p className="text-xs text-slate-400">
                      {f.departureAirport?.iataCode || "N/A"} → {f.destinationAirport?.iataCode || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600">{formatDate(f.departureTime)}</p>
                    <p className="flex items-center justify-end gap-1 text-xs text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      {f.availableSeats ?? "-"} seats left
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}