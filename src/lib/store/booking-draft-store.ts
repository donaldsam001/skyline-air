import { create } from "zustand";
import { CabinTier, DraftPassenger, Flight, PaymentMethod, SeatType } from "@/types";
import { api } from "@/lib/api/client";
import { cabinToSeatType } from "@/lib/utils";

interface BookingDraftState {
  flight: Flight | null;
  seatType: CabinTier | null;
  passengers: DraftPassenger[];
  paymentMethod: PaymentMethod;
  submitting: boolean;
  submitError: string | null;

  setFlight: (f: Flight) => void;
  setSeatType: (c: CabinTier) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  addPassenger: () => void;
  updatePassenger: (uid: string, patch: Partial<DraftPassenger>) => void;
  removePassenger: (uid: string) => void;
  reset: () => void;

  /** Submit booking to real backend */
  submitBooking: (userEmail: string) => Promise<{ bookingCode: string } | null>;
}

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `pax-${uidCounter}`;
}

export const useBookingDraft = create<BookingDraftState>((set, get) => ({
  flight: null,
  seatType: null,
  passengers: [],
  paymentMethod: "CREDIT_CARD",
  submitting: false,
  submitError: null,

  setFlight: (f) => set({ flight: f }),
  setSeatType: (c) => set({ seatType: c }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),

  addPassenger: () =>
    set((s) => ({
      passengers: [
        ...s.passengers,
        {
          uid: nextUid(),
          firstName: "",
          lastName: "",
          passengerType: "ADULT",
          dateOfBirth: "",
          passportNumber: "",
          nationality: "",
        },
      ],
    })),

  updatePassenger: (uid, patch) =>
    set((s) => ({
      passengers: s.passengers.map((p) => (p.uid === uid ? { ...p, ...patch } : p)),
    })),

  removePassenger: (uid) =>
    set((s) => ({ passengers: s.passengers.filter((p) => p.uid !== uid) })),

  reset: () =>
    set({
      flight: null,
      seatType: null,
      passengers: [],
      paymentMethod: "CREDIT_CARD",
      submitting: false,
      submitError: null,
    }),

  submitBooking: async (userEmail: string) => {
    const state = get();
    if (!state.flight || !state.seatType) return null;

    set({ submitting: true, submitError: null });
    try {
      const backendSeatType = cabinToSeatType(state.seatType) as SeatType;
      const booking = await api.users.createBooking(state.flight.flightNumber, {
        user: { email: userEmail },
        seatType: backendSeatType,
        passengers: state.passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          passengerType: p.passengerType,
          dateOfBirth: p.dateOfBirth,
          passportNumber: p.passportNumber,
          nationality: p.nationality,
        })),
        notes: "",
      });

      // Optionally trigger payment callback
      if (booking.payments?.[0]?.transactionRef) {
        await api.users.handlePaymentCallback(booking.payments[0].transactionRef, {
          paymentMethod: state.paymentMethod,
          status: "PAID",
        });
      }

      set({ submitting: false });
      return { bookingCode: booking.bookingCode };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as Error).message
          : "An unexpected error occurred. Please try again.";
      set({ submitting: false, submitError: message });
      return null;
    }
  },
}));