import { create } from "zustand";
import { CabinTier, DraftPassenger, Flight } from "@/types";

interface BookingDraftState {
  flight: Flight | null;
  seatType: CabinTier | null;
  passengers: DraftPassenger[];
  setFlight: (f: Flight) => void;
  setSeatType: (c: CabinTier) => void;
  addPassenger: () => void;
  updatePassenger: (uid: string, patch: Partial<DraftPassenger>) => void;
  removePassenger: (uid: string) => void;
  reset: () => void;
}

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `pax-${uidCounter}`;
}

export const useBookingDraft = create<BookingDraftState>((set) => ({
  flight: null,
  seatType: null,
  passengers: [],

  setFlight: (f) => set({ flight: f }),
  setSeatType: (c) => set({ seatType: c }),

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

  reset: () => set({ flight: null, seatType: null, passengers: [] }),
}));