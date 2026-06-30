import Link from "next/link";
import { ShieldCheck, Clock3, Wallet, ArrowRight } from "lucide-react";
import { FlightSearchBar } from "@/components/client/flight-search-bar";
import { MOCK_AIRLINES } from "@/lib/mock/airports-airlines";

const PERKS = [
  {
    icon: ShieldCheck,
    title: "Fare protection",
    body: "Business and First cabins are fully refundable — cancel from My Bookings any time before departure.",
  },
  {
    icon: Clock3,
    title: "Real-time status",
    body: "Departure boards update the moment a gate, delay, or aircraft swap is confirmed by the carrier.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    body: "Base fares include taxes. What you see on the results page is what you pay at checkout.",
  },
];

const DESTINATIONS = [
  { city: "Tokyo", code: "NRT", price: 412 },
  { city: "Singapore", code: "SIN", price: 198 },
  { city: "Seoul", code: "ICN", price: 356 },
  { city: "Sydney", code: "SYD", price: 588 },
  { city: "London", code: "LHR", price: 742 },
  { city: "Dubai", code: "DXB", price: 469 },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-aviation-950 pb-32 pt-16 sm:pt-24">
        {/* Ambient flight-path graphic */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M -50 480 Q 300 380 600 420 T 1250 280"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="6 10"
            fill="none"
          />
          <path
            d="M -50 180 Q 350 60 650 140 T 1250 480"
            stroke="#0EA5E9"
            strokeWidth="2"
            strokeDasharray="2 8"
            fill="none"
          />
          <circle cx="600" cy="420" r="3" fill="#38BDF8" />
          <circle cx="1250" cy="280" r="3" fill="#38BDF8" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 ring-1 ring-white/10">
              Now flying to 10 hubs across 6 countries
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Fly farther for less,
              <br />
              land exactly on time.
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Compare live fares across Economy through First, lock in your seats, and manage every
              trip from one dashboard.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <FlightSearchBar />
          </div>
        </div>
      </section>

      {/* ── Perks ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flight-strip rounded-2xl border border-slate-200 bg-white p-6 pl-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-aviation-900">
                <perk.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">{perk.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{perk.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular destinations ─────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Fare watch</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                Popular this week from Ho Chi Minh City
              </h2>
            </div>
            <Link
              href="/flights?from=SGN&to=NRT"
              className="hidden items-center gap-1 text-sm font-semibold text-aviation-900 hover:text-sky-600 sm:flex"
            >
              View all routes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.code}
                href={`/flights?from=SGN&to=${d.code}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  <p className="font-display text-lg font-bold text-slate-900">{d.city}</p>
                  <p className="font-mono-data text-xs text-slate-400">SGN → {d.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-display tabular text-xl font-bold text-aviation-900">${d.price}</p>
                  <p className="text-xs text-slate-400">round-trip from</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Airlines strip ───────────────────────────────────── */}
      <section className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            Operated in partnership with
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {MOCK_AIRLINES.map((al) => (
              <div key={al.id} className="flex items-center gap-2 text-slate-500">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: al.logoColor }}
                >
                  {al.iataCarrierCode}
                </span>
                <span className="text-sm font-semibold">{al.operatorName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}