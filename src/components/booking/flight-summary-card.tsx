import { Plane } from "lucide-react";
import { Flight } from "@/types";
import { formatDate, formatDuration, formatTime } from "@/lib/utils";

export function FlightSummaryCard({ flight }: { flight: Flight }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: flight.airline.logoColor ?? "#0B3D91" }}
        >
          <Plane className="h-4.5 w-4.5 -rotate-45" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{flight.airline.operatorName}</p>
          <p className="font-mono-data text-xs text-slate-400">{flight.flightNumber}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-display tabular text-lg font-bold text-slate-900">
            {formatTime(flight.departureTime)}
          </p>
          <p className="text-xs font-semibold text-slate-500">{flight.departureAirport.iataCode}</p>
        </div>
        <div className="flex flex-1 flex-col items-center px-3">
          <span className="text-[11px] text-slate-400">{formatDuration(flight.departureTime, flight.arrivalTime)}</span>
          <div className="my-1 h-px w-full bg-slate-200" />
          <span className="text-[11px] text-slate-400">Direct</span>
        </div>
        <div className="text-right">
          <p className="font-display tabular text-lg font-bold text-slate-900">
            {formatTime(flight.arrivalTime)}
          </p>
          <p className="text-xs font-semibold text-slate-500">{flight.destinationAirport.iataCode}</p>
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        {formatDate(flight.departureTime)} · {flight.aircraft.model}
      </p>
    </div>
  );
}