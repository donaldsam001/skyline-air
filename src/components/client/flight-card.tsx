"use client";

import Link from "next/link";
import { Plane, Armchair, Clock, ArrowRight, Shield } from "lucide-react";
import { Flight } from "@/types";
import { Badge, flightStatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CABIN_LABELS,
  FLIGHT_STATUS_LABELS,
  formatCurrency,
  formatDate,
  formatDuration,
  formatTime,
} from "@/lib/utils";

/**
 * Helper to safely parse fareRules which may be a JSON string or already an array.
 */
function parseFareRules(fareRules: unknown): Array<{ cabin: string; basePrice: number; refundable?: boolean }> {
  if (!fareRules) return [];
  if (Array.isArray(fareRules)) return fareRules;
  if (typeof fareRules === "string") {
    try {
      const parsed = JSON.parse(fareRules);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function FlightCard({ flight }: { flight: Flight }) {
  const fareRules = parseFareRules(flight.fareRules);
  const cheapestFare = fareRules.length
    ? [...fareRules].sort((a, b) => a.basePrice - b.basePrice)[0]
    : null;

  const availableSeats = flight.availableSeats ?? 0;
  const totalSeats = flight.totalSeats ?? 1;
  const lowSeats = availableSeats > 0 && availableSeats < totalSeats * 0.15;

  const airlineName = flight.airline?.name ?? "Unknown airline";
  const airlineCode = flight.airline?.code ?? "";

  const depCode = flight.departureAirport?.code ?? "";
  const destCode = flight.destinationAirport?.code ?? "";

  // Use flightNumber as the URL param — backend lookup uses flightNumber
  const bookingHref = `/booking/${encodeURIComponent(flight.flightNumber)}`;

  return (
    <div className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Airline + route */}
        <div className="flex flex-1 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-aviation-900 text-white font-bold text-xs">
            {airlineCode || <Plane className="h-5 w-5 -rotate-45" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">{airlineName}</p>
            <p className="font-mono-data text-xs text-slate-400">
              {flight.flightNumber}
              {flight.aircraft ? ` · ${flight.aircraft.model}` : ""}
            </p>
          </div>
        </div>

        {/* Times */}
        <div className="flex flex-1 items-center justify-between gap-3 sm:justify-center sm:gap-4">
          <div className="text-center">
            <p className="font-display tabular text-2xl font-bold text-slate-900">
              {formatTime(flight.departureTime)}
            </p>
            <p className="text-xs font-bold text-aviation-900">{depCode}</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-2">
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              <span className="text-[11px] font-semibold">
                {formatDuration(flight.departureTime, flight.arrivalTime)}
              </span>
            </div>
            <div className="relative w-16 sm:w-24">
              <div className="h-px w-full bg-slate-300" />
              <ArrowRight className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Direct
            </span>
          </div>
          <div className="text-center">
            <p className="font-display tabular text-2xl font-bold text-slate-900">
              {formatTime(flight.arrivalTime)}
            </p>
            <p className="text-xs font-bold text-aviation-900">{destCode}</p>
          </div>
        </div>

        {/* Status + date */}
        <div className="flex flex-1 flex-col items-start gap-1.5 sm:items-center">
          <Badge tone={flightStatusTone(flight.flightStatus)}>
            {FLIGHT_STATUS_LABELS[flight.flightStatus] ?? flight.flightStatus}
          </Badge>
          <p className="text-xs text-slate-500">{formatDate(flight.departureTime)}</p>
          {cheapestFare?.refundable && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <Shield className="h-3 w-3" />
              Refundable
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-1 flex-col items-start gap-2 sm:items-end">
          <div className="text-left sm:text-right">
            {cheapestFare ? (
              <>
                <p className="font-display tabular text-2xl font-bold text-aviation-900">
                  {formatCurrency(cheapestFare.basePrice)}
                </p>
                <p className="text-xs text-slate-400">
                  per person · {CABIN_LABELS[cheapestFare.cabin] ?? cheapestFare.cabin}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">Price unavailable</p>
            )}
          </div>
          <Link href={bookingHref} className="w-full sm:w-auto">
            <Button
              variant="cta"
              size="sm"
              disabled={availableSeats === 0}
              fullWidth
            >
              {availableSeats === 0 ? "Sold out" : "Select"}
            </Button>
          </Link>
        </div>
      </div>

      {lowSeats && (
        <div className="flex items-center gap-1.5 border-t border-amber-100 bg-amber-50 px-5 py-2 text-xs font-bold text-amber-700">
          <Armchair className="h-3.5 w-3.5" />
          Only {availableSeats} seats left at this price — book now!
        </div>
      )}
    </div>
  );
}