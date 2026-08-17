"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Badge, paymentStatusTone } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CreditCard, CheckCircle2, Clock3, RotateCcw, Loader2 } from "lucide-react";
import { Payment } from "@/types";
import { formatCurrency, formatDateLong } from "@/lib/utils";

interface PaymentRow extends Payment {
  bookingCode?: string;
  customerEmail?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    adminApi.payments
      .getAll()
      .then((data) => {
        if (mounted) {
          setPayments(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load admin payments:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
        (p.bookingCode && p.bookingCode.toLowerCase().includes(q)) ||
        (p.customerEmail && p.customerEmail.toLowerCase().includes(q))
    );
  }, [payments, search]);

  const totals = useMemo(() => {
    const paid = payments.filter((p) => p.status === "PAID");
    const pending = payments.filter((p) => p.status === "PENDING");
    const refunded = payments.filter((p) => p.status === "REFUNDED");
    return {
      collected: paid.reduce((s, p) => s + (p.amount || 0), 0),
      pendingCount: pending.length,
      refundedAmount: refunded.reduce((s, p) => s + (p.amount || 0), 0),
    };
  }, [payments]);

  const columns: Column<PaymentRow>[] = [
    {
      header: "Transaction",
      render: (p) => (
        <div>
          <p className="font-mono-data text-sm font-bold text-slate-800">{p.transactionRef || "N/A"}</p>
          <p className="text-xs text-slate-400">{p.bookingCode || "Booking"}</p>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (p) => <span className="text-sm text-slate-600">{p.customerEmail || "Customer"}</span>,
    },
    {
      header: "Method",
      render: (p) => (
        <span className="text-sm text-slate-600">
          {p.paymentMethod === "CREDIT_CARD" ? "Credit card" : p.paymentMethod || "Digital Wallet"}
        </span>
      ),
    },
    {
      header: "Amount",
      align: "right",
      render: (p) => (
        <span className="font-mono-data font-semibold text-slate-800">
          {formatCurrency(p.amount || 0)}
        </span>
      ),
    },
    { header: "Status", render: (p) => <Badge tone={paymentStatusTone(p.status)}>{p.status}</Badge> },
    {
      header: "Paid at",
      render: (p) => (
        <span className="text-xs text-slate-500">
          {p.paidAt ? formatDateLong(p.paidAt) : "—"}
        </span>
      ),
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

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => String(p.id || p.transactionRef)}
          emptyMessage="No transactions match your search."
        />
      )}
    </div>
  );
}