import { Plane, Calendar, MapPin } from "lucide-react";
import { Flight } from "@/types";
import { formatDate, formatDuration, formatTime } from "@/lib/utils";

export function FlightSummaryCard({ flight }: { flight: Flight }) {
  const airlineName = flight.airline?.name ?? "Unknown airline";
  const depCode = flight.departureAirport?.code ?? "";
  const destCode = flight.destinationAirport?.code ?? "";

  return (
    <div className="rounded-2xl border border-aviation-900/10 bg-aviation-900/[0.02] p-5">
      {/* Airline header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviation-900 text-white font-bold text-xs">
          {flight.airline?.code ?? <Plane className="h-4.5 w-4.5 -rotate-45" />}
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">{airlineName}</p>
          <p className="font-mono-data text-xs text-slate-400">{flight.flightNumber}</p>
        </div>
      </div>

      {/* Route & Times */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-display tabular text-lg font-bold text-slate-900">
            {formatTime(flight.departureTime)}
          </p>
          <p className="text-xs font-bold text-aviation-900">{depCode}</p>
          {flight.departureAirport?.city && (
            <p className="text-[10px] text-slate-400">{flight.departureAirport.city}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center px-3">
          <span className="text-[11px] font-semibold text-slate-400">
            {formatDuration(flight.departureTime, flight.arrivalTime)}
          </span>
          <div className="relative my-1 h-px w-full bg-slate-200">
            <Plane className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-aviation-900 -rotate-45" />
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Direct
          </span>
        </div>
        <div className="text-right">
          <p className="font-display tabular text-lg font-bold text-slate-900">
            {formatTime(flight.arrivalTime)}
          </p>
          <p className="text-xs font-bold text-aviation-900">{destCode}</p>
          {flight.destinationAirport?.city && (
            <p className="text-[10px] text-slate-400">{flight.destinationAirport.city}</p>
          )}
        </div>
      </div>

      {/* Footer details */}
      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(flight.departureTime)}
        </span>
        {flight.aircraft?.model && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {flight.aircraft.model}
          </span>
        )}
      </div>
    </div>
  );
}