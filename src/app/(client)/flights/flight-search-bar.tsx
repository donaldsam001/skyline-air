"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, MapPin, CalendarDays, Search } from "lucide-react";
import { MOCK_AIRPORTS } from "@/lib/mock/airports-airlines";
import { Button } from "@/components/ui/button";

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function FlightSearchBar() {
  const router = useRouter();
  const [from, setFrom] = useState("SGN");
  const [to, setTo] = useState("HAN");
  const [startDate, setStartDate] = useState(todayISO(1));
  const [endDate, setEndDate] = useState(todayISO(7));

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ from, to, startDate, endDate });
    router.push(`/flights?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-aviation-950/10 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-end md:gap-2">
        {/* From */}
        <div className="relative">
          <label htmlFor="from-airport" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            From
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aviation-900" />
            <select
              id="from-airport"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              {MOCK_AIRPORTS.map((a) => (
                <option key={a.id} value={a.iataCode}>
                  {a.city} ({a.iataCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          className="hidden h-11 w-11 items-center justify-center self-end rounded-full border border-slate-200 bg-white text-aviation-900 transition-transform hover:rotate-180 hover:bg-sky-100 md:flex"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        {/* To */}
        <div className="relative">
          <label htmlFor="to-airport" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            To
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <select
              id="to-airport"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              {MOCK_AIRPORTS.map((a) => (
                <option key={a.id} value={a.iataCode}>
                  {a.city} ({a.iataCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range */}
        <div>
          <label htmlFor="start-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Departure dates
          </label>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20">
            <CalendarDays className="h-4 w-4 shrink-0 text-aviation-900" />
            <input
              id="start-date"
              type="date"
              value={startDate}
              min={todayISO()}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
            />
            <span className="text-slate-300">–</span>
            <input
              aria-label="End date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">
          <Search className="h-4.5 w-4.5" />
          Search flights
        </Button>
      </div>
    </form>
  );
}