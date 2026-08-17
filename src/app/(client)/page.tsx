"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, Clock3, Wallet, ArrowRight, Globe, Sparkles } from "lucide-react";
import { FlightSearchBar } from "@/components/client/flight-search-bar";
import { Airline } from "@/types";
import { api } from "@/lib/api/client";

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
  { city: "Tokyo", code: "NRT", price: 412, emoji: "🗼" },
  { city: "Singapore", code: "SIN", price: 198, emoji: "🦁" },
  { city: "Seoul", code: "ICN", price: 356, emoji: "🏯" },
  { city: "Sydney", code: "SYD", price: 588, emoji: "🦘" },
  { city: "London", code: "LHR", price: 742, emoji: "🎡" },
  { city: "Dubai", code: "DXB", price: 469, emoji: "🏙️" },
];

export default function HomePage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);

  useEffect(() => {
    api.airlines
      .getAll()
      .then((data) => setAirlines(data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden booking-hero-bar pb-32 pt-16 sm:pt-24">
        {/* Ambient flight-path graphic */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M -50 480 Q 300 380 600 420 T 1250 280"
            stroke="#FFB700"
            strokeWidth="2"
            strokeDasharray="6 10"
            fill="none"
          />
          <path
            d="M -50 180 Q 350 60 650 140 T 1250 480"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="2 8"
            fill="none"
          />
          <circle cx="600" cy="420" r="3" fill="#FFB700" />
          <circle cx="1250" cy="280" r="3" fill="#FFB700" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 ring-1 ring-white/10 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Now flying to 10 hubs across 6 countries
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Fly farther for less,
              <br />
              <span className="text-amber-400">land exactly on time.</span>
            </h1>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Compare live fares across Economy through First, lock in your seats, and manage every
              trip from one dashboard.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <FlightSearchBar />
          </div>
        </div>
      </section>

      {/* ── Perks ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="card-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-aviation-900/5 text-aviation-900">
                <perk.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-slate-900">{perk.title}</h3>
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
              <p className="text-xs font-bold uppercase tracking-wide text-aviation-600">
                <Globe className="mr-1 inline h-3.5 w-3.5" />
                Fare watch
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                Popular destinations this week
              </h2>
            </div>
            <Link
              href="/flights"
              className="hidden items-center gap-1 text-sm font-bold text-aviation-900 hover:text-aviation-600 sm:flex transition-colors"
            >
              View all routes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.code}
                href={`/flights?from=SGN&to=${d.code}`}
                className="group card-hover flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{d.emoji}</span>
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900">{d.city}</p>
                    <p className="font-mono-data text-xs text-slate-400">SGN → {d.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display tabular text-xl font-bold text-aviation-900">
                    ${d.price}
                  </p>
                  <p className="text-xs text-slate-400">round-trip from</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Airlines strip ───────────────────────────────────── */}
      {airlines.length > 0 && (
        <section className="border-t border-slate-100 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
              Operated in partnership with
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {airlines.map((al) => (
                <div key={al.id ?? al.code} className="flex items-center gap-2 text-slate-500">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-900 text-xs font-bold text-white">
                    {al.code}
                  </span>
                  <span className="text-sm font-semibold">{al.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}