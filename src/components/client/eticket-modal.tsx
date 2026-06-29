"use client";

import { Plane, QrCode } from "lucide-react";
import { Booking } from "@/types";
import { Modal } from "@/components/ui/modal";
import { CABIN_LABELS, formatDate, formatTime } from "@/lib/utils";

interface ETicketModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export function ETicketModal({ booking, onClose }: ETicketModalProps) {
  if (!booking) return null;
  const { flight } = booking;

  return (
    <Modal open={!!booking} onClose={onClose} title="e-Ticket" description={booking.bookingCode} size="md">
      <div className="space-y-4">
        {booking.tickets.length === 0 ? (
          <p className="text-sm text-slate-500">
            Tickets will be issued here once payment is confirmed for this booking.
          </p>
        ) : (
          booking.tickets.map((ticket) => (
            <div key={ticket.id} className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between bg-aviation-950 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 -rotate-45 text-sky-400" />
                  <span className="font-display text-sm font-bold">{flight.airline.operatorName}</span>
                </div>
                <span className="font-mono-data text-xs text-slate-300">{ticket.ticketNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Passenger</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{ticket.passengerName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Flight</p>
                  <p className="mt-0.5 font-mono-data text-sm font-bold text-slate-800">{flight.flightNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Seat</p>
                  <p className="mt-0.5 font-mono-data text-sm font-bold text-slate-800">{ticket.seatNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Cabin</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{CABIN_LABELS[ticket.cabin]}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs text-slate-500">
                    {flight.departureAirport.iataCode} → {flight.destinationAirport.iataCode}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    {formatDate(flight.departureTime)} · {formatTime(flight.departureTime)}
                  </p>
                </div>
                <QrCode className="h-12 w-12 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}