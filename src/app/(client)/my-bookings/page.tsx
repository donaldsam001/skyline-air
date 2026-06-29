"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle2, Ticket } from "lucide-react";
import { Booking } from "@/types";
import { useAuthStore } from "@/lib/store/auth-store";
import { api } from "@/lib/api/client";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingRow } from "@/components/client/booking-row";
import { ETicketModal } from "@/components/client/eticket-modal";
import { CancelBookingModal } from "@/components/client/cancel-booking-modal";
import { Button } from "@/components/ui/button";

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "CREATED", label: "Created" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function MyBookingsInner() {
  const { isAuthenticated, user, hydrateDemoCustomer } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmedCode = searchParams.get("confirmed");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [ticketBooking, setTicketBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isAuthenticated) hydrateDemoCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });
    api.users.getMyBookings(user.email).then((res) => {
      if (!active) return;
      setBookings(res);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(
    () => (tab === "ALL" ? bookings : bookings.filter((b) => b.status === tab)),
    [bookings, tab]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: bookings.length };
    for (const b of bookings) map[b.status] = (map[b.status] ?? 0) + 1;
    return map;
  }, [bookings]);

  async function handleCancelConfirm(bookingId: string) {
    await new Promise((r) => setTimeout(r, 700));
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED", paymentStatus: "REFUNDED" } : b))
    );
    setCancelBooking(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">My bookings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage upcoming trips, view e-tickets, and request cancellations.</p>

      {confirmedCode && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">
            Booking confirmed — your reference is {confirmedCode}. A confirmation email is on its way.
          </p>
          <button
            onClick={() => router.replace("/my-bookings")}
            className="ml-auto text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-6">
        <Tabs
          tabs={STATUS_TABS.map((t) => ({ ...t, count: counts[t.value] ?? 0 }))}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No bookings here yet"
            description="Once you book a flight, it'll show up here with its status and e-ticket."
            action={
              <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                Search flights
              </Button>
            }
          />
        ) : (
          filtered.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              onViewTicket={setTicketBooking}
              onCancel={setCancelBooking}
            />
          ))
        )}
      </div>

      <ETicketModal booking={ticketBooking} onClose={() => setTicketBooking(null)} />
      <CancelBookingModal
        booking={cancelBooking}
        onClose={() => setCancelBooking(null)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense>
      <MyBookingsInner />
    </Suspense>
  );
}