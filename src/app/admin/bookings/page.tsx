"use client";

import { useMemo, useState } from "react";
import { Booking } from "@/types";
import { MOCK_BOOKINGS } from "@/lib/mock/bookings";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Badge, bookingStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, CABIN_LABELS, formatCurrency, formatDate } from "@/lib/utils";

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_BOOKINGS.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.bookedBy.toLowerCase().includes(q) ||
        b.flight.flightNumber.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter]);

  const columns: Column<Booking>[] = [
    {
      header: "Booking",
      render: (b) => (
        <div>
          <p className="font-mono-data text-sm font-bold text-aviation-900">{b.bookingCode}</p>
          <p className="text-xs text-slate-400">{b.bookedBy}</p>
        </div>
      ),
    },
    {
      header: "Flight",
      render: (b) => (
        <span className="font-mono-data text-sm text-slate-700">
          {b.flight.flightNumber} · {b.flight.departureAirport.iataCode}→{b.flight.destinationAirport.iataCode}
        </span>
      ),
    },
    { header: "Cabin", render: (b) => CABIN_LABELS[b.seatType] },
    { header: "Pax", align: "center", render: (b) => b.passengers.length },
    { header: "Booked", render: (b) => formatDate(b.createdAt) },
    {
      header: "Total",
      align: "right",
      render: (b) => <span className="font-mono-data font-semibold text-slate-800">{formatCurrency(b.totalPrice)}</span>,
    },
    { header: "Payment", render: (b) => <Badge tone={paymentStatusTone(b.paymentStatus)}>{b.paymentStatus}</Badge> },
    { header: "Status", render: (b) => <Badge tone={bookingStatusTone(b.status)}>{BOOKING_STATUS_LABELS[b.status]}</Badge> },
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

      <DataTable columns={columns} rows={filtered} rowKey={(b) => b.id} emptyMessage="No bookings match your search." />
    </div>
  );
}