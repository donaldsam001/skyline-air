"use client";

import { useEffect, useMemo, useState } from "react";
import { Booking } from "@/types";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Badge, bookingStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, CABIN_LABELS, formatCurrency, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let mounted = true;
    adminApi.bookings
      .getAll()
      .then((data) => {
        if (mounted) {
          setBookings(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load admin bookings:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      const userStr = b.user ? `${b.user.firstName || ""} ${b.user.lastName || ""} ${b.user.email || ""}` : "";
      const flightCode = b.flight?.flightNumber || "";
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        userStr.toLowerCase().includes(q) ||
        flightCode.toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const columns: Column<Booking>[] = [
    {
      header: "Booking",
      render: (b) => (
        <div>
          <p className="font-mono-data text-sm font-bold text-aviation-900">{b.bookingCode}</p>
          <p className="text-xs text-slate-400">
            {b.user?.firstName && b.user?.lastName
              ? `${b.user.firstName} ${b.user.lastName}`
              : b.user?.email || "Guest"}
          </p>
        </div>
      ),
    },
    {
      header: "Flight",
      render: (b) => (
        <span className="font-mono-data text-sm text-slate-700">
          {b.flight?.flightNumber || "N/A"} · {b.flight?.departureAirport?.code || "N/A"}→
          {b.flight?.destinationAirport?.code || "N/A"}
        </span>
      ),
    },
    { header: "Cabin", render: (b) => CABIN_LABELS[b.seatType] || b.seatType },
    { header: "Pax", align: "center", render: (b) => b.passengers?.length || 0 },
    { header: "Booked", render: (b) => (b.createdAt ? formatDate(b.createdAt) : "N/A") },
    {
      header: "Total",
      align: "right",
      render: (b) => (
        <span className="font-mono-data font-semibold text-slate-800">
          {formatCurrency(b.totalPrice)}
        </span>
      ),
    },
    {
      header: "Payment",
      render: (b) => (
        <Badge tone={paymentStatusTone(b.paymentStatus)}>{b.paymentStatus}</Badge>
      ),
    },
    {
      header: "Status",
      render: (b) => (
        <Badge tone={bookingStatusTone(b.status)}>
          {BOOKING_STATUS_LABELS[b.status] || b.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by booking code, flight, or customer…"
        extra={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All statuses</option>
            <option value="CREATED">Created</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        }
      />

      <p className="text-xs text-slate-400">{filtered.length} bookings found</p>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(b) => String(b.id || b.bookingCode)}
          emptyMessage="No bookings match your search."
        />
      )}
    </div>
  );
}