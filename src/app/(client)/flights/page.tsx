"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlaneTakeoff, SlidersHorizontal, ArrowUpDown, X, Plane } from "lucide-react";
import { Flight } from "@/types";
import { api } from "@/lib/api/client";
import { FlightCard } from "@/components/client/flight-card";
import { FlightFilterSidebar, FlightFilters } from "@/components/client/flight-filter-sidebar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FlightSearchBar } from "@/components/client/flight-search-bar";

type SortKey = "price-asc" | "price-desc" | "departure-asc" | "duration-asc";

/**
 * Helper to safely parse fareRules from backend (may be JSON string or array).
 */
function parseFareRules(fareRules: unknown): Array<{ cabin: string; basePrice: number }> {
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
      <div className="h-8 w-64 skeleton-pulse rounded-lg" />
      <div className="mt-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 skeleton-pulse rounded-2xl" />
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
    stops: [],
    departureTime: [],
  });

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });
    api.flights
      .search({ from, to, startDate, endDate })
      .then((results) => {
        console.log("Fetched flights:", results);
        if (!active) return;
        setFlights(results);
        const prices = results.flatMap((f) =>
          parseFareRules(f.fareRules).map((r) => r.basePrice)
        );
        const ceiling = prices.length > 0 ? Math.max(...prices) : 2000;
        setFilters((f) => ({ ...f, maxPrice: Math.ceil(ceiling / 10) * 10 }));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [from, to, startDate, endDate]);

  const priceCeiling = useMemo(() => {
    if (flights.length === 0) return 2000;
    const prices = flights.flatMap((f) =>
      parseFareRules(f.fareRules).map((r) => r.basePrice)
    );
    if (!prices.length) return 2000;
    return Math.ceil(Math.max(...prices) / 10) * 10;
  }, [flights]);

  const filtered = useMemo(() => {
    let result = flights.filter((f) => {
      const rules = parseFareRules(f.fareRules);
      const cheapest = rules.length ? Math.min(...rules.map((r) => r.basePrice)) : 0;
      if (cheapest > filters.maxPrice) return false;
      const airlineCode = f.airline?.code ?? "";
      if (filters.airlines.length && !filters.airlines.includes(airlineCode)) return false;
      if (filters.cabins.length && !rules.some((r) => filters.cabins.includes(r.cabin)))
        return false;

      // Departure time filter
      if (filters.departureTime.length) {
        const hour = new Date(f.departureTime).getHours();
        const slot =
          hour >= 6 && hour < 12
            ? "morning"
            : hour >= 12 && hour < 18
            ? "afternoon"
            : hour >= 18
            ? "evening"
            : "night";
        if (!filters.departureTime.includes(slot)) return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      const aRules = parseFareRules(a.fareRules);
      const bRules = parseFareRules(b.fareRules);
      const aCheap = aRules.length ? Math.min(...aRules.map((r) => r.basePrice)) : 0;
      const bCheap = bRules.length ? Math.min(...bRules.map((r) => r.basePrice)) : 0;
      switch (sort) {
        case "price-asc":
          return aCheap - bCheap;
        case "price-desc":
          return bCheap - aCheap;
        case "departure-asc":
          return a.departureTime.localeCompare(b.departureTime);
        case "duration-asc": {
          const aDur = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
          const bDur = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
          return aDur - bDur;
        }
      }
    });

    return result;
  }, [flights, filters, sort]);

  // Derive city names from returned flight data
  const fromCity = flights[0]?.departureAirport?.city ?? from;
  const toCity = flights[0]?.destinationAirport?.city ?? to;

  return (
    <div>
      {/* Search bar at top */}
      <section className="booking-hero-bar py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FlightSearchBar />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviation-900/5 text-aviation-900">
                <Plane className="h-5 w-5 -rotate-45" />
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                  {from && to ? `${fromCity} → ${toCity}` : "All available flights"}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {loading
                    ? "Searching live availability…"
                    : `${filtered.length} flight${filtered.length === 1 ? "" : "s"} found`}
                  {startDate && endDate && ` · ${startDate} to ${endDate}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:border-aviation-900 hover:text-aviation-900 transition-colors lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 appearance-none rounded-xl border-2 border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold text-slate-700 transition-colors focus:border-aviation-900 focus:ring-2 focus:ring-aviation-900/10"
              >
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="departure-asc">Departure time</option>
                <option value="duration-asc">Shortest duration</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <FlightFilterSidebar
                filters={filters}
                onChange={setFilters}
                priceCeiling={priceCeiling}
              />
            </div>
          </aside>

          <div className="min-w-0">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 skeleton-pulse rounded-2xl" />
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
                  <FlightCard key={flight.id ?? flight.flightNumber} flight={flight} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-aviation-900">
                  Refine results
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <FlightFilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  priceCeiling={priceCeiling}
                />
              </div>
              <Button
                variant="cta"
                fullWidth
                className="mt-5"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {filtered.length} flights
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}