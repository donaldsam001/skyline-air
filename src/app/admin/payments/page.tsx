"use client";

import { useMemo, useState } from "react";
import { MOCK_BOOKINGS } from "@/lib/mock/bookings";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Badge, paymentStatusTone } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CreditCard, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { Payment } from "@/types";
import { formatCurrency, formatDateLong } from "@/lib/utils";

interface PaymentRow extends Payment {
  bookingCode: string;
  customerEmail: string;
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");

  const allPayments: PaymentRow[] = useMemo(
    () =>
      MOCK_BOOKINGS.flatMap((b) =>
        b.payments.map((p) => ({ ...p, bookingCode: b.bookingCode, customerEmail: b.bookedBy }))
      ),
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allPayments.filter(
      (p) =>
        p.transactionRef.toLowerCase().includes(q) ||
        p.bookingCode.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q)
    );
  }, [allPayments, search]);

  const totals = useMemo(() => {
    const paid = allPayments.filter((p) => p.status === "PAID");
    const pending = allPayments.filter((p) => p.status === "PENDING");
    const refunded = allPayments.filter((p) => p.status === "REFUNDED");
    return {
      collected: paid.reduce((s, p) => s + p.amount, 0),
      pendingCount: pending.length,
      refundedAmount: refunded.reduce((s, p) => s + p.amount, 0),
    };
  }, [allPayments]);

  const columns: Column<PaymentRow>[] = [
    {
      header: "Transaction",
      render: (p) => (
        <div>
          <p className="font-mono-data text-sm font-bold text-slate-800">{p.transactionRef}</p>
          <p className="text-xs text-slate-400">{p.bookingCode}</p>
        </div>
      ),
    },
    { header: "Customer", render: (p) => <span className="text-sm text-slate-600">{p.customerEmail}</span> },
    {
      header: "Method",
      render: (p) => (
        <span className="text-sm text-slate-600">
          {p.paymentMethod === "CREDIT_CARD" ? "Credit card" : "Digital wallet"}
        </span>
      ),
    },
    {
      header: "Amount",
      align: "right",
      render: (p) => <span className="font-mono-data font-semibold text-slate-800">{formatCurrency(p.amount)}</span>,
    },
    { header: "Status", render: (p) => <Badge tone={paymentStatusTone(p.status)}>{p.status}</Badge> },
    {
      header: "Paid at",
      render: (p) => <span className="text-xs text-slate-500">{p.paidAt ? formatDateLong(p.paidAt) : "—"}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total collected" value={formatCurrency(totals.collected)} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Pending payments" value={totals.pendingCount.toString()} icon={Clock3} accent="amber" />
        <StatCard label="Refunded" value={formatCurrency(totals.refundedAmount)} icon={RotateCcw} accent="sky" />
      </div>

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by transaction ref, booking, or customer…"
        extra={<CreditCard className="hidden h-5 w-5 text-slate-300 sm:block" />}
      />

      <DataTable columns={columns} rows={filtered} rowKey={(p) => p.id} emptyMessage="No transactions match your search." />
    </div>
  );
}