"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { SeatType, Flight, PaymentMethod } from "@/types";
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
import { cabinToSeatType, formatCurrency } from "@/lib/utils";

export default function BookingWizardPage() {
  const params = useParams<{ flightId: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const draft = useBookingDraft();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const flightId = decodeURIComponent(params.flightId);
    api.flights
      .get(flightId)
      .then((f) => {
        setFlight(f);
        draft.setFlight(f);
        setLoading(false);
        if (draft.passengers.length === 0) draft.addPassenger();
      })
      .catch(() => setLoading(false));
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

    if (!flight || !draft.seatType || !user?.email) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const backendSeatType = cabinToSeatType(draft.seatType) as SeatType;
      const booking = await api.users.createBooking(flight.flightNumber, {
        user: { email: user.email },
        seatType: backendSeatType,
        passengers: draft.passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          passengerType: p.passengerType,
          dateOfBirth: p.dateOfBirth,
          passportNumber: p.passportNumber,
          nationality: p.nationality,
        })),
        notes: "",
      });

      // Trigger payment callback if transaction ref exists
      if (booking.payments?.[0]?.transactionRef) {
        await api.users.handlePaymentCallback(booking.payments[0].transactionRef, {
          paymentMethod: paymentMethod,
          status: "PAID",
        });
      }

      draft.reset();
      router.push(`/my-bookings?confirmed=${booking.bookingCode}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as Error).message
          : "An unexpected error occurred. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-aviation-900" />
        <p className="text-sm font-medium text-slate-500">Loading flight details…</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertBanner
          tone="error"
          title="Flight not found"
          code={2001}
          description="This flight may have been removed or the link is invalid."
        />
        <Button className="mt-6" onClick={() => router.push("/")}>
          Back to search
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <BookingStepper current={step} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="order-2 lg:order-1">
          {submitError && (
            <div className="mb-5">
              <AlertBanner
                tone="error"
                title="We couldn't complete your booking"
                description={submitError}
                onDismiss={() => setSubmitError(null)}
              />
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

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button variant="ghost" onClick={goBack} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button variant="primary" onClick={goNext} disabled={step === 1 && !draft.seatType}>
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="cta" onClick={handlePayment} loading={submitting} size="lg">
                {submitting ? (
                  "Processing payment…"
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Confirm & Pay{" "}
                    {draft.seatType &&
                      `${formatCurrency(computeTotal(flight, draft.seatType, draft.passengers))}`}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-24 space-y-4">
            <FlightSummaryCard flight={flight} />
            {draft.seatType && draft.passengers.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Estimated total
                </p>
                <p className="mt-1 font-display tabular text-3xl font-bold text-aviation-900">
                  {formatCurrency(computeTotal(flight, draft.seatType, draft.passengers))}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {draft.passengers.length} passenger{draft.passengers.length > 1 ? "s" : ""} ·{" "}
                  {draft.seatType}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}