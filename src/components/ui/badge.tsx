import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "aviation";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
  info: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  aviation: "bg-aviation-900/5 text-aviation-900 ring-1 ring-aviation-900/15",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const BOOKING_TONE: Record<string, BadgeTone> = {
  CREATED: "info",
  CONFIRMED: "success",
  CANCELLED: "danger",
  COMPLETED: "neutral",
};

const PAYMENT_TONE: Record<string, BadgeTone> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

const FLIGHT_TONE: Record<string, BadgeTone> = {
  SCHEDULED: "info",
  BOARDING: "aviation",
  DEPARTED: "neutral",
  DELAYED: "warning",
  CANCELLED: "danger",
  COMPLETED: "neutral",
};

export function bookingStatusTone(status: string): BadgeTone {
  return BOOKING_TONE[status] ?? "neutral";
}
export function paymentStatusTone(status: string): BadgeTone {
  return PAYMENT_TONE[status] ?? "neutral";
}
export function flightStatusTone(status: string): BadgeTone {
  return FLIGHT_TONE[status] ?? "neutral";
}