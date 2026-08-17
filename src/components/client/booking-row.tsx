"use client";

import { Ticket, XCircle, Plane } from "lucide-react";
import { Booking } from "@/types";
import { Badge, bookingStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BOOKING_STATUS_LABELS,
  CABIN_LABELS,
  formatCurrency,
  formatDate,
  formatTime,
  seatTypeToCabin,
} from "@/lib/utils";

interface BookingRowProps {
  booking: Booking;
  onViewTicket: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}

export function BookingRow({ booking, onViewTicket, onCancel }: BookingRowProps) {
  const { flight } = booking;
  const canCancel = booking.status === "CREATED" || booking.status === "CONFIRMED" || booking.status === "PENDING";

  const airlineCode = flight?.airline?.code ?? "";
  const depCode = flight?.departureAirport?.code ?? "";
  const destCode = flight?.destinationAirport?.code ?? "";
  const cabinLabel = CABIN_LABELS[seatTypeToCabin(booking.seatType)] ?? booking.seatType;

  return (
    <div className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aviation-900 text-white font-bold text-xs">
            {airlineCode || <Plane className="h-5 w-5 -rotate-45" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono-data text-sm font-bold text-slate-900">{booking.bookingCode}</p>
              <Badge tone={bookingStatusTone(booking.status)}>
                {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {flight?.flightNumber} · {depCode} → {destCode} ·{" "}
              {flight?.departureTime && (
                <>
                  {formatDate(flight.departureTime)}, {formatTime(flight.departureTime)}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-400">
              {cabinLabel} · {booking.passengers?.length ?? 0} pax
            </p>
            <p className="font-display tabular text-lg font-bold text-slate-900">
              {formatCurrency(booking.totalPrice)}
            </p>
          </div>
          <Badge tone={paymentStatusTone(booking.paymentStatus)}>{booking.paymentStatus}</Badge>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewTicket(booking)}>
              <Ticket className="h-4 w-4" />
              e-Ticket
            </Button>
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(booking)}
                className="text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}