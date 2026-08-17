"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightLeft, MapPin, CalendarDays, Search, Users, ChevronDown, Plane } from "lucide-react";
import { Airport } from "@/types";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function dateAfter(date: string) {
  const nextDate = new Date(`${date}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return nextDate.toISOString().slice(0, 10);
}

type TripType = "one-way" | "round-trip";

function FlightSearchBarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTripType: TripType =
    searchParams.get("tripType") === "one-way" || !searchParams.get("endDate")
      ? "one-way"
      : "round-trip";
  const [tripType, setTripType] = useState<TripType>(initialTripType);
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? todayISO(1));
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? todayISO(7));
  const [passengers, setPassengers] = useState(Number(searchParams.get("passengers")) || 1);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(true);

  useEffect(() => {
    api.airports
      .getAll()
      .then((data) => {
        if (data.length > 0) {
          setAirports(data);
          if (!from && data[0]?.code) setFrom(data[0].code || data[0].iataCode || "");
          if (!to && data[1]?.code) setTo(data[1].code || data[1].iataCode || "");
        }
        setLoadingAirports(false);
      })
      .catch(() => {
        setLoadingAirports(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function chooseTripType(type: TripType) {
    setTripType(type);
    if (type === "round-trip" && endDate < startDate) {
      setEndDate(dateAfter(startDate));
    }
  }

  function updateStartDate(value: string) {
    setStartDate(value);
    if (endDate < value) setEndDate(dateAfter(value));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ from, to, startDate, tripType });
    if (tripType === "round-trip") params.set("endDate", endDate);
    if (passengers > 1) params.set("passengers", String(passengers));
    router.push(`/flights?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      {/* Trip Type Tabs */}
      <div className="flex items-center gap-1 mb-3">
        {(["round-trip", "one-way"] as TripType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => chooseTripType(t)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              tripType === t
                ? "bg-white text-aviation-900 shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            {t === "round-trip" ? "Round trip" : "One way"}
          </button>
        ))}
      </div>

      {/* Search Bar Card */}
      <div className="rounded-2xl border border-white/20 bg-white p-4 shadow-2xl shadow-black/20 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto_auto] md:items-end md:gap-2">
          {/* From */}
          <div className="relative">
            <label
              htmlFor="from-airport"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-aviation-900"
            >
              From
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aviation-900" />
              <select
                id="from-airport"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
                className="h-12 w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 pl-9 pr-8 text-sm font-semibold text-slate-900 transition-colors focus:border-aviation-900 focus:bg-white focus:ring-2 focus:ring-aviation-900/10"
              >
                {loadingAirports && <option value="">Loading…</option>}
                {airports.map((a) => {
                  const code = a.code || a.iataCode || "";
                  return (
                    <option key={code} value={code}>
                      {a.city ?? a.name} ({code})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="hidden h-12 w-12 items-center justify-center self-end rounded-full border-2 border-aviation-900/20 bg-white text-aviation-900 transition-all hover:rotate-180 hover:border-aviation-900 hover:bg-aviation-900 hover:text-white md:flex"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* To */}
          <div className="relative">
            <label
              htmlFor="to-airport"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-aviation-900"
            >
              To
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aviation-600" />
              <select
                id="to-airport"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="h-12 w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 pl-9 pr-8 text-sm font-semibold text-slate-900 transition-colors focus:border-aviation-900 focus:bg-white focus:ring-2 focus:ring-aviation-900/10"
              >
                {loadingAirports && <option value="">Loading…</option>}
                {airports.map((a) => {
                  const code = a.code || a.iataCode || "";
                  return (
                    <option key={code} value={code}>
                      {a.city ?? a.name} ({code})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Date range */}
          <div>
            <label
              htmlFor="start-date"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-aviation-900"
            >
              {tripType === "round-trip" ? "Dates" : "Departure"}
            </label>
            <div className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-2.5 transition-colors focus-within:border-aviation-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-aviation-900/10">
              <CalendarDays className="h-4 w-4 shrink-0 text-aviation-900" />
              <input
                id="start-date"
                type="date"
                value={startDate}
                min={todayISO()}
                onChange={(e) => updateStartDate(e.target.value)}
                required
                className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
              />
              {tripType === "round-trip" && (
                <>
                  <span className="text-slate-300">–</span>
                  <input
                    aria-label="Return date"
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="h-12 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  />
                </>
              )}
            </div>
          </div>

          {/* Passengers */}
          <div className="hidden md:block">
            <label
              htmlFor="passengers-count"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-aviation-900"
            >
              Passengers
            </label>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aviation-900" />
              <select
                id="passengers-count"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="h-12 w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 pl-9 pr-8 text-sm font-semibold text-slate-900 transition-colors focus:border-aviation-900 focus:bg-white focus:ring-2 focus:ring-aviation-900/10 min-w-[110px]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Adult" : "Adults"}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Search Button */}
          <Button type="submit" variant="cta" size="lg" className="w-full md:w-auto self-end">
            <Search className="h-4.5 w-4.5" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}

export function FlightSearchBar() {
  return (
    <Suspense fallback={<div className="h-28 rounded-2xl bg-white/20 animate-pulse" />}>
      <FlightSearchBarForm />
    </Suspense>
  );
}
