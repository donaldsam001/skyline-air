"use client";

import { useEffect, useState } from "react";
import { CABIN_LABELS } from "@/lib/utils";
import { Airline } from "@/types";
import { api } from "@/lib/api/client";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export interface FlightFilters {
  cabins: string[];
  airlines: string[];
  maxPrice: number;
  stops: string[];
  departureTime: string[];
}

interface FilterSidebarProps {
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  priceCeiling: number;
}

const CABINS = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

const DEPARTURE_SLOTS = [
  { key: "morning", label: "Morning", desc: "6:00 – 12:00" },
  { key: "afternoon", label: "Afternoon", desc: "12:00 – 18:00" },
  { key: "evening", label: "Evening", desc: "18:00 – 24:00" },
  { key: "night", label: "Night", desc: "0:00 – 6:00" },
];

export function FlightFilterSidebar({ filters, onChange, priceCeiling }: FilterSidebarProps) {
  const [airlines, setAirlines] = useState<Airline[]>([]);

  useEffect(() => {
    api.airlines
      .getAll()
      .then((data) => setAirlines(data))
      .catch(() => {});
  }, []);

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  const activeCount = filters.cabins.length + filters.airlines.length + filters.departureTime.length + 
    (filters.maxPrice < priceCeiling ? 1 : 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-aviation-900" />
          <h3 className="font-display text-sm font-bold text-aviation-900">Filters</h3>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-aviation-900 px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
      </div>

      {/* Cabin Class */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Cabin class</h4>
        <div className="mt-2.5 space-y-2">
          {CABINS.map((cabin) => (
            <label key={cabin} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.cabins.includes(cabin)}
                onChange={() => onChange({ ...filters, cabins: toggle(filters.cabins, cabin) })}
                className="h-4 w-4 rounded border-slate-300 text-aviation-900 focus:ring-aviation-900/20 cursor-pointer"
              />
              <span className="group-hover:text-aviation-900 transition-colors">{CABIN_LABELS[cabin]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Airline */}
      <div className="border-t border-slate-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Airline</h4>
        <div className="mt-2.5 space-y-2">
          {airlines.length === 0 ? (
            <p className="text-xs text-slate-400">Loading airlines…</p>
          ) : (
            airlines.map((al) => (
              <label key={al.id ?? al.code} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(al.code)}
                  onChange={() =>
                    onChange({ ...filters, airlines: toggle(filters.airlines, al.code) })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-aviation-900 focus:ring-aviation-900/20 cursor-pointer"
                />
                <span className="group-hover:text-aviation-900 transition-colors">{al.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Departure Time */}
      <div className="border-t border-slate-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Departure time</h4>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {DEPARTURE_SLOTS.map((slot) => (
            <button
              key={slot.key}
              type="button"
              onClick={() => onChange({ ...filters, departureTime: toggle(filters.departureTime, slot.key) })}
              className={`rounded-lg border-2 px-3 py-2 text-left transition-all ${
                filters.departureTime.includes(slot.key)
                  ? "border-aviation-900 bg-aviation-900/5 text-aviation-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-semibold">{slot.label}</p>
              <p className="text-[10px] text-slate-400">{slot.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Max price</h4>
          <span className="font-mono-data text-sm font-bold text-aviation-900">
            ${filters.maxPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="mt-3 w-full cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>$0</span>
          <span>${priceCeiling.toLocaleString()}</span>
        </div>
      </div>

      {/* Clear All */}
      <button
        onClick={() => onChange({ cabins: [], airlines: [], maxPrice: priceCeiling, stops: [], departureTime: [] })}
        className="flex items-center gap-1.5 text-sm font-semibold text-aviation-600 hover:text-aviation-900 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Clear all filters
      </button>
    </div>
  );
}