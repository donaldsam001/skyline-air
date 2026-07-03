import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(startIso: string, endIso: string): string {
  const mins = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

/**
 * Labels for both CabinTier ("FIRST") and SeatType ("FIRST_CLASS").
 * Backend uses SeatType; components may receive either.
 */
export const CABIN_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First Class",
  FIRST_CLASS: "First Class",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const FLIGHT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  BOARDING: "Boarding",
  DEPARTED: "Departed",
  IN_FLIGHT: "In Flight",
  DELAYED: "Delayed",
  ARRIVED: "Arrived",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export function genBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SKY";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Converts backend SeatType ("FIRST_CLASS") → CabinTier ("FIRST").
 * Used when booking data comes from the server and is passed to components
 * that work with the FareRule cabin tier.
 */
export function seatTypeToCabin(seatType: string): string {
  if (seatType === "FIRST_CLASS") return "FIRST";
  return seatType;
}

/**
 * Converts CabinTier ("FIRST") → SeatType ("FIRST_CLASS") for booking requests.
 */
export function cabinToSeatType(cabin: string): string {
  if (cabin === "FIRST") return "FIRST_CLASS";
  return cabin;
}