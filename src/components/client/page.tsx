"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlaneTakeoff, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { Flight } from "@/types";
import { api } from "@/lib/api/client";
import { FlightCard } from "@/components/client/flight-card";
import { FlightFilterSidebar, FlightFilters } from "@/components/client/flight-filter-sidebar";
import { EmptyState } from "@/components/ui/empty-state";
import { findAirport } from "@/lib/mock/airports-airlines";
import { Button } from "@/components/ui/button";

type SortKey = "price-asc" | "price-desc" | "departure-asc" | "duration-asc";

export default function FlightsPage() {
  return (
    <Suspense fallback={<FlightsPageSkeleton />}>
      <FlightsPageInner />
    </Suspense>
  );
}

function FlightsPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-100" />
      <div className="mt-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function FlightsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FlightFilters>({
    cabins: [],
    airlines: [],
    maxPrice: 2000,
  });

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });
    api.flights.search({ from, to, startDate, endDate }).then((results) => {
      if (!active) return;
      setFlights(results);
      const ceiling = Math.max(
        ...results.map((f) => Math.min(...f.fareRules.map((r) => r.basePrice))),
        200
      );
      setFilters((f) => ({ ...f, maxPrice: Math.ceil(ceiling / 10) * 10 }));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [from, to, startDate, endDate]);

  const priceCeiling = useMemo(() => {
    if (flights.length === 0) return 2000;
    return Math.ceil(
      Math.max(...flights.map((f) => Math.min(...f.fareRules.map((r) => r.basePrice)))) / 10
    ) * 10;
  }, [flights]);

  const filtered = useMemo(() => {
    let result = flights.filter((f) => {
      const cheapest = Math.min(...f.fareRules.map((r) => r.basePrice));
      if (cheapest > filters.maxPrice) return false;
      if (filters.airlines.length && !filters.airlines.includes(f.airline.iataCarrierCode)) return false;
      if (filters.cabins.length && !f.fareRules.some((r) => filters.cabins.includes(r.cabin))) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      const aCheap = Math.min(...a.fareRules.map((r) => r.basePrice));
      const bCheap = Math.min(...b.fareRules.map((r) => r.basePrice));
      switch (sort) {
        case "price-asc": return aCheap - bCheap;
        case "price-desc": return bCheap - aCheap;
        case "departure-asc": return a.departureTime.localeCompare(b.departureTime);
        case "duration-asc": {
          const aDur = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
          const bDur = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
          return aDur - bDur;
        }
      }
    });

    return result;
  }, [flights, filters, sort]);

  const fromAirport = findAirport(from);
  const toAirport = findAirport(to);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {fromAirport && toAirport
              ? `${fromAirport.city} → ${toAirport.city}`
              : "All available flights"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Searching live availability…" : `${filtered.length} flight${filtered.length === 1 ? "" : "s"} found`}
            {startDate && endDate && ` · ${startDate} to ${endDate}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="departure-asc">Departure time</option>
              <option value="duration-asc">Shortest duration</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-sm font-bold text-slate-900">Refine results</h2>
            <div className="mt-4">
              <FlightFilterSidebar filters={filters} onChange={setFilters} priceCeiling={priceCeiling} />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={PlaneTakeoff}
              title="No flights match your search"
              description="Try widening your date range, clearing filters, or picking a different route."
              action={
                <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                  Start a new search
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">Refine results</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <FlightFilterSidebar filters={filters} onChange={setFilters} priceCeiling={priceCeiling} />
            </div>
            <Button fullWidth className="mt-5" onClick={() => setMobileFiltersOpen(false)}>
              Show {filtered.length} flights
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}