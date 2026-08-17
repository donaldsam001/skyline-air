"use client";

import { CreditCard, Wallet, Building2, Banknote, ShieldCheck, Plane } from "lucide-react";
import { CabinTier, DraftPassenger, Flight, PaymentMethod } from "@/types";
import { CABIN_LABELS, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Helper to safely parse fareRules.
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

interface SummaryStepProps {
  flight: Flight;
  seatType: CabinTier;
  passengers: DraftPassenger[];
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
}

const PAYMENT_OPTIONS: Array<{
  method: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}> = [
  { method: "CREDIT_CARD", label: "Credit card", description: "Visa, Mastercard, Amex", icon: CreditCard },
  { method: "BANK_TRANSFER", label: "Bank transfer", description: "Direct bank payment", icon: Building2 },
  { method: "E_WALLET", label: "E-Wallet", description: "MoMo, ZaloPay, GrabPay", icon: Wallet },
  { method: "CASH", label: "Cash", description: "Pay at counter", icon: Banknote },
];

export function SummaryStep({
  flight,
  seatType,
  passengers,
  paymentMethod,
  onPaymentMethodChange,
}: SummaryStepProps) {
  const fareRules = parseFareRules(flight.fareRules);
  const fare = fareRules.find((r) => r.cabin === seatType);
  const basePrice = fare?.basePrice ?? 0;

  const adultCount = passengers.filter((p) => p.passengerType !== "INFANT").length;
  const infantCount = passengers.filter((p) => p.passengerType === "INFANT").length;

  const subtotal = basePrice * adultCount;
  const taxesAndFees = Math.round(subtotal * 0.08);
  const infantFee = infantCount * 25;
  const total = subtotal + taxesAndFees + infantFee;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-slate-900">Review & pay</h2>
      <p className="mt-1 text-sm text-slate-500">Confirm your details, then proceed to payment.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Passenger recap */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-900/5 text-aviation-900">
                <Plane className="h-4 w-4 -rotate-45" />
              </span>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Passengers · {CABIN_LABELS[seatType]}
              </h3>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {passengers.map((p, idx) => (
                <div key={p.uid} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">
                      {idx + 1}. {p.firstName} {p.lastName}
                    </span>
                    {p.passportNumber && (
                      <span className="ml-2 font-mono-data text-xs text-slate-400">
                        {p.passportNumber}
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {p.passengerType}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold text-slate-900">Payment method</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.method}
                  type="button"
                  onClick={() => onPaymentMethodChange(opt.method)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    paymentMethod === opt.method
                      ? "border-aviation-900 bg-aviation-900/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <opt.icon
                    className={cn(
                      "h-5 w-5",
                      paymentMethod === opt.method ? "text-aviation-900" : "text-slate-400"
                    )}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="h-fit rounded-2xl border border-aviation-900/10 bg-aviation-900/[0.02] p-5">
          <h3 className="font-display text-sm font-bold text-aviation-900">Price breakdown</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>
                {CABIN_LABELS[seatType]} × {adultCount}
              </span>
              <span className="tabular font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {infantCount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Infant fee × {infantCount}</span>
                <span className="tabular font-semibold">{formatCurrency(infantFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxes & fees</span>
              <span className="tabular font-semibold">{formatCurrency(taxesAndFees)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-aviation-900/10 pt-3">
            <span className="font-display text-sm font-bold text-aviation-900">Total due</span>
            <span className="font-display tabular text-2xl font-bold text-aviation-900">
              {formatCurrency(total)}
            </span>
          </div>
          <p className="mt-4 flex items-start gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Your payment is encrypted and processed securely at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

export function computeTotal(flight: Flight, seatType: CabinTier, passengers: DraftPassenger[]) {
  const fareRules = parseFareRules(flight.fareRules);
  const fare = fareRules.find((r) => r.cabin === seatType);
  const basePrice = fare?.basePrice ?? 0;
  const adultCount = passengers.filter((p) => p.passengerType !== "INFANT").length;
  const infantCount = passengers.filter((p) => p.passengerType === "INFANT").length;
  const subtotal = basePrice * adultCount;
  const taxesAndFees = Math.round(subtotal * 0.08);
  const infantFee = infantCount * 25;
  return subtotal + taxesAndFees + infantFee;
}