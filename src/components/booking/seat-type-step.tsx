"use client";

import { Armchair, Check } from "lucide-react";
import { CabinTier, Flight } from "@/types";
import { CABIN_LABELS, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CABIN_PERKS: Record<CabinTier, string[]> = {
  ECONOMY: ["1 checked bag · 23kg", "Standard seat pitch", "Changeable for a $35 fee"],
  PREMIUM_ECONOMY: ["2 checked bags · 23kg", "Extra legroom seating", "Free seat selection"],
  BUSINESS: ["2 checked bags · 32kg", "Lie-flat seat", "Fully refundable, lounge access"],
  FIRST: ["3 checked bags · 32kg", "Private suite", "Fully refundable, chauffeur transfer"],
};

interface SeatTypeStepProps {
  flight: Flight;
  selected: CabinTier | null;
  onSelect: (cabin: CabinTier) => void;
}

export function SeatTypeStep({ flight, selected, onSelect }: SeatTypeStepProps) {
  const order: CabinTier[] = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];
  const available = flight.fareRules.filter((r) => order.includes(r.cabin));

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900">Choose your cabin</h2>
      <p className="mt-1 text-sm text-slate-500">
        Prices shown are per passenger and already include taxes and fees.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {order
          .filter((cabin) => available.some((r) => r.cabin === cabin))
          .map((cabin) => {
            const rule = available.find((r) => r.cabin === cabin)!;
            const active = selected === cabin;
            return (
              <button
                key={cabin}
                type="button"
                onClick={() => onSelect(cabin)}
                className={cn(
                  "relative rounded-2xl border-2 p-5 text-left transition-all",
                  active
                    ? "border-sky-500 bg-sky-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                {active && (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviation-900/5 text-aviation-900">
                  <Armchair className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                  {CABIN_LABELS[cabin]}
                </h3>
                <p className="mt-1 font-display tabular text-2xl font-bold text-aviation-900">
                  {formatCurrency(rule.basePrice)}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {CABIN_PERKS[cabin].map((perk) => (
                    <li key={perk} className="flex items-start gap-1.5 text-xs text-slate-500">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
      </div>
    </div>
  );
}