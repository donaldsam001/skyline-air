"use client";

import Link from "next/link";
import { Plane, Armchair } from "lucide-react";
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

export function FlightCard({ flight }: { flight: Flight }) {
  const fareRules = flight.fareRules ?? [];
  const cheapestFare = fareRules.length
    ? [...fareRules].sort((a, b) => a.basePrice - b.basePrice)[0]
    : null;

  const availableSeats = flight.availableSeats ?? 0;
  const totalSeats = flight.totalSeats ?? 1;
  const lowSeats = availableSeats > 0 && availableSeats < totalSeats * 0.15;

  // Normalizer adds iataCarrierCode/operatorName as aliases; fall back to raw fields
  const airline = flight.airline as typeof flight.airline & {
    iataCarrierCode?: string;
    operatorName?: string;
  };
  const airlineName   = airline?.operatorName ?? airline?.name ?? "Unknown airline";
  const airlineColor  = airline?.logoColor ?? "#0B3D91";

  // Normalizer adds iataCode alias; fall back to code
  const depCode  = (flight.departureAirport as typeof flight.departureAirport & { iataCode?: string }).iataCode ?? flight.departureAirport.code;
  const destCode = (flight.destinationAirport as typeof flight.destinationAirport & { iataCode?: string }).iataCode ?? flight.destinationAirport.code;

  // Use flightNumber as the URL param — backend lookup uses flightNumber
  const bookingHref = `/booking/${encodeURIComponent(flight.flightNumber)}`;

  return (
    <div className="flight-strip overflow-hidden rounded-2xl border border-slate-200 bg-white pl-1 shadow-sm shadow-slate-900/[0.03] transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Airline + route */}
        <div className="flex flex-1 items-center gap-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: airlineColor }}
          >
            <Plane className="h-5 w-5 -rotate-45" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{airlineName}</p>
            <p className="font-mono-data text-xs text-slate-400">
              {flight.flightNumber}
              {flight.aircraft ? ` · ${flight.aircraft.model}` : ""}
            </p>
          </div>
        </div>

        {/* Times */}
        <div className="flex flex-1 items-center justify-between gap-3 sm:justify-center sm:gap-6">
          <div className="text-center">
            <p className="font-display tabular text-xl font-bold text-slate-900">
              {formatTime(flight.departureTime)}
            </p>
            <p className="text-xs font-semibold text-slate-500">{depCode}</p>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <span className="text-[11px] font-medium">
              {formatDuration(flight.departureTime, flight.arrivalTime)}
            </span>
            <div className="h-px w-12 bg-slate-300 sm:w-20" />
          </div>
          <div className="text-center">
            <p className="font-display tabular text-xl font-bold text-slate-900">
              {formatTime(flight.arrivalTime)}
            </p>
            <p className="text-xs font-semibold text-slate-500">{destCode}</p>
          </div>
        </div>

        {/* Status + date */}
        <div className="flex flex-1 flex-col items-start gap-1.5 sm:items-center">
          <Badge tone={flightStatusTone(flight.flightStatus)}>
            {FLIGHT_STATUS_LABELS[flight.flightStatus] ?? flight.flightStatus}
          </Badge>
          <p className="text-xs text-slate-500">{formatDate(flight.departureTime)}</p>
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
                  from · {CABIN_LABELS[cheapestFare.cabin] ?? cheapestFare.cabin}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">Price unavailable</p>
            )}
          </div>
          <Link href={bookingHref} className="w-full sm:w-auto">
            <Button size="sm" disabled={availableSeats === 0} fullWidth>
              {availableSeats === 0 ? "Sold out" : "Select"}
            </Button>
          </Link>
        </div>
      </div>

      {lowSeats && (
        <div className="flex items-center gap-1.5 border-t border-amber-100 bg-amber-50 px-5 py-2 text-xs font-semibold text-amber-700">
          <Armchair className="h-3.5 w-3.5" />
          Only {availableSeats} seats left at this price
        </div>
      )}
    </div>
  );
}