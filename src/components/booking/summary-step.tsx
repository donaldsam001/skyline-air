"use client";

import { CreditCard, Wallet, ShieldCheck } from "lucide-react";
import { CabinTier, DraftPassenger, Flight, PaymentMethod } from "@/types";
import { CABIN_LABELS, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SummaryStepProps {
  flight: Flight;
  seatType: CabinTier;
  passengers: DraftPassenger[];
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
}

export function SummaryStep({
  flight,
  seatType,
  passengers,
  paymentMethod,
  onPaymentMethodChange,
}: SummaryStepProps) {
  const fare = flight.fareRules.find((r) => r.cabin === seatType)!;
  const adultCount = passengers.filter((p) => p.passengerType !== "INFANT").length;
  const infantCount = passengers.filter((p) => p.passengerType === "INFANT").length;

  const subtotal = fare.basePrice * adultCount;
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
            <h3 className="font-display text-sm font-bold text-slate-900">Passengers · {CABIN_LABELS[seatType]}</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {passengers.map((p, idx) => (
                <div key={p.uid} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-slate-700">
                    {idx + 1}. {p.firstName} {p.lastName}
                  </span>
                  <span className="text-slate-400">{p.passengerType}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold text-slate-900">Payment method</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onPaymentMethodChange("CREDIT_CARD")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                  paymentMethod === "CREDIT_CARD"
                    ? "border-sky-500 bg-sky-50/50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <CreditCard className="h-5 w-5 text-aviation-900" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Credit card</p>
                  <p className="text-xs text-slate-400">Visa, Mastercard, Amex</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onPaymentMethodChange("DIGITAL_WALLET")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                  paymentMethod === "DIGITAL_WALLET"
                    ? "border-sky-500 bg-sky-50/50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Wallet className="h-5 w-5 text-aviation-900" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Digital wallet</p>
                  <p className="text-xs text-slate-400">Apple Pay, Google Pay</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-bold text-slate-900">Price breakdown</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{CABIN_LABELS[seatType]} × {adultCount}</span>
              <span className="tabular">{formatCurrency(subtotal)}</span>
            </div>
            {infantCount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Infant fee × {infantCount}</span>
                <span className="tabular">{formatCurrency(infantFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxes & fees</span>
              <span className="tabular">{formatCurrency(taxesAndFees)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
            <span className="font-display text-sm font-bold text-slate-900">Total due</span>
            <span className="font-display tabular text-xl font-bold text-aviation-900">
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
  const fare = flight.fareRules.find((r) => r.cabin === seatType)!;
  const adultCount = passengers.filter((p) => p.passengerType !== "INFANT").length;
  const infantCount = passengers.filter((p) => p.passengerType === "INFANT").length;
  const subtotal = fare.basePrice * adultCount;
  const taxesAndFees = Math.round(subtotal * 0.08);
  const infantFee = infantCount * 25;
  return subtotal + taxesAndFees + infantFee;
}