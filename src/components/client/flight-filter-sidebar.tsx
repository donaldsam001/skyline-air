"use client";

import { CABIN_LABELS } from "@/lib/utils";
import { MOCK_AIRLINES } from "@/lib/mock/airports-airlines";

export interface FlightFilters {
  cabins: string[];
  airlines: string[];
  maxPrice: number;
}

interface FilterSidebarProps {
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  priceCeiling: number;
}

const CABINS = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

export function FlightFilterSidebar({ filters, onChange, priceCeiling }: FilterSidebarProps) {
  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Cabin class</h3>
        <div className="mt-2.5 space-y-2">
          {CABINS.map((cabin) => (
            <label key={cabin} className="flex items-center gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.cabins.includes(cabin)}
                onChange={() => onChange({ ...filters, cabins: toggle(filters.cabins, cabin) })}
                className="h-4 w-4 rounded border-slate-300 text-aviation-900 focus:ring-sky-500"
              />
              {CABIN_LABELS[cabin]}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-sm font-semibold text-slate-800">Airline</h3>
        <div className="mt-2.5 space-y-2">
          {MOCK_AIRLINES.map((al) => (
            <label key={al.id} className="flex items-center gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.airlines.includes(al.iataCarrierCode)}
                onChange={() =>
                  onChange({ ...filters, airlines: toggle(filters.airlines, al.iataCarrierCode) })
                }
                className="h-4 w-4 rounded border-slate-300 text-aviation-900 focus:ring-sky-500"
              />
              {al.operatorName}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Max price</h3>
          <span className="font-mono-data text-sm font-semibold text-aviation-900">
            ${filters.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
        />
      </div>

      <button
        onClick={() => onChange({ cabins: [], airlines: [], maxPrice: priceCeiling })}
        className="text-sm font-semibold text-sky-600 hover:text-sky-700"
      >
        Clear all filters
      </button>
    </div>
  );
}