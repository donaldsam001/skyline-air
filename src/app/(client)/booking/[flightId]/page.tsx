"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { CabinTier, Flight, PaymentMethod } from "@/types";
import { api } from "@/lib/api/client";
import { useBookingDraft } from "@/lib/store/booking-draft-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { FlightSummaryCard } from "@/components/booking/flight-summary-card";
import { SeatTypeStep } from "@/components/booking/seat-type-step";
import { PassengerDetailsStep } from "@/components/booking/passenger-details-step";
import { SummaryStep, computeTotal } from "@/components/booking/summary-step";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { genBookingCode } from "@/lib/utils";

export default function BookingWizardPage() {
  const params = useParams<{ flightId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const draft = useBookingDraft();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    api.flights.get(params.flightId).then((f) => {
      setFlight(f);
      draft.setFlight(f);
      setLoading(false);
      if (draft.passengers.length === 0) draft.addPassenger();
    }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.flightId]);

  function validatePassengers(): boolean {
    const newErrors: Record<string, Record<string, string>> = {};
    let valid = true;
    for (const p of draft.passengers) {
      const fieldErrors: Record<string, string> = {};
      if (!p.firstName.trim()) fieldErrors.firstName = "First name is required.";
      if (!p.lastName.trim()) fieldErrors.lastName = "Last name is required.";
      if (!p.dateOfBirth) fieldErrors.dateOfBirth = "Date of birth is required.";
      if (!p.passportNumber.trim() || p.passportNumber.length < 6) {
        fieldErrors.passportNumber = "Enter a valid passport number (6+ characters).";
      }
      if (!p.nationality) fieldErrors.nationality = "Select a nationality.";
      if (Object.keys(fieldErrors).length > 0) {
        valid = false;
        newErrors[p.uid] = fieldErrors;
      }
    }
    setErrors(newErrors);
    return valid;
  }

  function goNext() {
    if (step === 1 && !draft.seatType) return;
    if (step === 2 && !validatePassengers()) return;
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handlePayment() {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(`/booking/${params.flightId}`));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    // Simulated POST /airplane/users/{flightNumber}/booking
    await new Promise((r) => setTimeout(r, 1200));
    const bookingCode = genBookingCode();
    setSubmitting(false);
    draft.reset();
    router.push(`/my-bookings?confirmed=${bookingCode}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-aviation-900" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertBanner tone="error" title="Flight not found" code={2001} description="This flight may have been removed or the link is invalid." />
        <Button className="mt-6" onClick={() => router.push("/")}>Back to search</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <BookingStepper current={step} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="order-2 lg:order-1">
          {submitError && (
            <div className="mb-5">
              <AlertBanner tone="error" title="We couldn't complete your booking" description={submitError} onDismiss={() => setSubmitError(null)} />
            </div>
          )}

          {step === 1 && (
            <SeatTypeStep
              flight={flight}
              selected={draft.seatType}
              onSelect={(cabin) => draft.setSeatType(cabin)}
            />
          )}
          {step === 2 && (
            <PassengerDetailsStep
              passengers={draft.passengers}
              errors={errors}
              onAdd={draft.addPassenger}
              onRemove={draft.removePassenger}
              onUpdate={draft.updatePassenger}
            />
          )}
          {step === 3 && draft.seatType && (
            <SummaryStep
              flight={flight}
              seatType={draft.seatType}
              passengers={draft.passengers}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button variant="ghost" onClick={goBack} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={goNext} disabled={step === 1 && !draft.seatType}>
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handlePayment} loading={submitting} size="lg">
                {submitting ? "Processing payment…" : "Proceed to payment"}
              </Button>
            )}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="sticky top-24 space-y-4">
            <FlightSummaryCard flight={flight} />
            {draft.seatType && draft.passengers.length > 0 && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Estimated total</p>
                <p className="mt-1 font-display tabular text-2xl font-bold text-aviation-900">
                  ${computeTotal(flight, draft.seatType, draft.passengers)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{draft.passengers.length} passenger(s)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}