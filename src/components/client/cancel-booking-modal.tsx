"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Booking } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface CancelBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (bookingId: string) => Promise<void>;
}

export function CancelBookingModal({ booking, onClose, onConfirm }: CancelBookingModalProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!booking) return;
    setSubmitting(true);
    await onConfirm(booking.id);
    setSubmitting(false);
  }

  if (!booking) return null;

  const refundable = booking.seatType !== "ECONOMY";

  return (
    <Modal open={!!booking} onClose={onClose} title="Cancel this booking?" size="sm">
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          Booking <span className="font-mono-data font-semibold">{booking.bookingCode}</span> will be
          cancelled immediately and cannot be undone.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Paid amount</span>
          <span className="tabular font-semibold">{formatCurrency(booking.totalPrice)}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-slate-600">
          <span>Refund</span>
          <span className="tabular font-semibold text-emerald-600">
            {refundable ? formatCurrency(booking.totalPrice) : formatCurrency(booking.totalPrice - 35) + " (after $35 fee)"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>
          Keep booking
        </Button>
        <Button variant="danger" fullWidth loading={submitting} onClick={handleConfirm}>
          Confirm cancellation
        </Button>
      </div>
    </Modal>
  );
}