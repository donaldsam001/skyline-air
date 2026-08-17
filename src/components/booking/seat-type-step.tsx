"use client";

import { Armchair, Check, Crown, Star, Sparkles } from "lucide-react";
import { CabinTier, Flight } from "@/types";
import { CABIN_LABELS, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CABIN_PERKS: Record<CabinTier, string[]> = {
  ECONOMY: ["1 checked bag · 23kg", "Standard seat pitch", "Changeable for a $35 fee"],
  PREMIUM_ECONOMY: ["2 checked bags · 23kg", "Extra legroom seating", "Free seat selection"],
  BUSINESS: ["2 checked bags · 32kg", "Lie-flat seat", "Fully refundable, lounge access"],
  FIRST: ["3 checked bags · 32kg", "Private suite", "Fully refundable, chauffeur transfer"],
};

const CABIN_ICONS: Record<CabinTier, typeof Armchair> = {
  ECONOMY: Armchair,
  PREMIUM_ECONOMY: Star,
  BUSINESS: Sparkles,
  FIRST: Crown,
};

const CABIN_COLORS: Record<CabinTier, { border: string; bg: string; accent: string }> = {
  ECONOMY: { border: "border-slate-300", bg: "bg-slate-50", accent: "text-slate-600" },
  PREMIUM_ECONOMY: { border: "border-sky-300", bg: "bg-sky-50/30", accent: "text-sky-700" },
  BUSINESS: { border: "border-aviation-600", bg: "bg-aviation-900/5", accent: "text-aviation-900" },
  FIRST: { border: "border-amber-400", bg: "bg-amber-50/50", accent: "text-amber-700" },
};

/**
 * Helper to safely parse fareRules.
 */
function parseFareRules(fareRules: unknown): Array<{ cabin: CabinTier; basePrice: number; refundable?: boolean; changeFeeUSD?: number }> {
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

interface SeatTypeStepProps {
  flight: Flight;
  selected: CabinTier | null;
  onSelect: (cabin: CabinTier) => void;
}

export function SeatTypeStep({ flight, selected, onSelect }: SeatTypeStepProps) {
  const order: CabinTier[] = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];
  const available = parseFareRules(flight.fareRules).filter((r) => order.includes(r.cabin));

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
            const Icon = CABIN_ICONS[cabin];
            const colors = CABIN_COLORS[cabin];
            return (
              <button
                key={cabin}
                type="button"
                onClick={() => onSelect(cabin)}
                className={cn(
                  "relative rounded-2xl border-2 p-5 text-left transition-all duration-200",
                  active
                    ? `${colors.border} ${colors.bg} shadow-md`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                )}
              >
                {active && (
                  <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-aviation-900 text-white shadow-sm">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    active ? `${colors.bg} ${colors.accent}` : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                  {CABIN_LABELS[cabin]}
                </h3>
                <p className="mt-1 font-display tabular text-2xl font-bold text-aviation-900">
                  {formatCurrency(rule.basePrice)}
                </p>
                {rule.refundable && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Fully refundable
                  </span>
                )}
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