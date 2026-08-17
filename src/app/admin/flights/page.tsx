"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Flight, FlightStatus } from "@/types";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { FlightFormModal } from "@/components/admin/flight-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Badge, flightStatusTone } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime, parseFareRules } from "@/lib/utils";

export default function FlightSchedulerPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState<Flight | null>(null);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await adminApi.flights.getAll();
      setFlights(data || []);
    } catch (err) {
      console.error("Failed to fetch admin flights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flights.filter((f) => {
      if (statusFilter !== "ALL" && f.flightStatus !== statusFilter) return false;
      const depCode = f.departureAirport?.code || f.departureAirport?.iataCode || "";
      const destCode = f.destinationAirport?.code || f.destinationAirport?.iataCode || "";
      const airlineName = f.airline?.name || f.airline?.operatorName || "";
      return (
        f.flightNumber.toLowerCase().includes(q) ||
        depCode.toLowerCase().includes(q) ||
        destCode.toLowerCase().includes(q) ||
        airlineName.toLowerCase().includes(q)
      );
    });
  }, [flights, search, statusFilter]);

  async function handleSave(
    payload: {
      flightNumber: string;
      airlineCode: string;
      aircraftId: string;
      departureCode: string;
      destinationCode: string;
      departureTime: string;
      arrivalTime: string;
      basePrice: number;
      flightStatus: FlightStatus;
    },
    id?: string
  ) {
    if (new Date(payload.arrivalTime) <= new Date(payload.departureTime)) {
      return { ok: false, code: 2003, message: "Arrival time must be after departure time." };
    }

    try {
      if (id) {
        await adminApi.flights.update(payload.flightNumber, {
          departureTime: payload.departureTime,
          arrivalTime: payload.arrivalTime,
          basePrice: payload.basePrice,
          flightStatus: payload.flightStatus,
        });
      } else {
        await adminApi.flights.create(
          payload.airlineCode,
          payload.aircraftId,
          payload.departureCode,
          payload.destinationCode,
          {
            flightNumber: payload.flightNumber,
            departureTime: payload.departureTime,
            arrivalTime: payload.arrivalTime,
            basePrice: payload.basePrice,
            flightStatus: payload.flightStatus,
          }
        );
      }
      await fetchFlights();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Failed to save flight.";
      return { ok: false, code: 500, message: msg };
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await adminApi.flights.delete(deleting.flightNumber);
      await fetchFlights();
    } catch (err) {
      console.error("Failed to delete flight:", err);
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<Flight>[] = [
    {
      header: "Flight",
      render: (f) => (
        <div>
          <p className="font-mono-data text-sm font-bold text-aviation-900">{f.flightNumber}</p>
          <p className="text-xs text-slate-400">{f.airline?.name || f.airline?.operatorName || "Carrier"}</p>
        </div>
      ),
    },
    {
      header: "Route",
      render: (f) => (
        <span className="font-mono-data text-sm text-slate-700">
          {f.departureAirport?.code || f.departureAirport?.iataCode || "N/A"} →{" "}
          {f.destinationAirport?.code || f.destinationAirport?.iataCode || "N/A"}
        </span>
      ),
    },
    {
      header: "Departure",
      render: (f) => (
        <div>
          <p className="text-sm text-slate-700">{formatDate(f.departureTime)}</p>
          <p className="font-mono-data text-xs text-slate-400">{formatTime(f.departureTime)}</p>
        </div>
      ),
    },
    {
      header: "Seats",
      align: "center",
      render: (f) => (
        <span className="font-mono-data text-sm text-slate-700">
          {f.availableSeats}/{f.totalSeats || 180}
        </span>
      ),
    },
    {
      header: "From",
      align: "right",
      render: (f) => {
        const rules = parseFareRules(f.fareRules, f.basePrice);
        const minPrice = rules.length > 0 ? Math.min(...rules.map((r) => r.basePrice)) : f.basePrice || 0;
        return (
          <span className="font-mono-data text-sm font-semibold text-slate-800">
            {formatCurrency(minPrice)}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (f) => <Badge tone={flightStatusTone(f.flightStatus)}>{f.flightStatus}</Badge>,
    },
    {
      header: "",
      width: "90px",
      align: "right",
      render: (f) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => { setEditing(f); setModalOpen(true); }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-aviation-900"
            aria-label={`Edit ${f.flightNumber}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleting(f)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${f.flightNumber}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by flight number, route, or airline…"
        actionLabel="Deploy flight"
        onAction={() => { setEditing(null); setModalOpen(true); }}
        extra={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All statuses</option>
            {["SCHEDULED", "BOARDING", "DELAYED", "DEPARTED", "CANCELLED", "COMPLETED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />

      <p className="text-xs text-slate-400">Showing {filtered.length} of {flights.length} scheduled flights.</p>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(f) => String(f.id || f.flightNumber)} emptyMessage="No flights match your filters." />
      )}

      <FlightFormModal key={editing?.id ?? "new"} open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
      <ConfirmDeleteModal
        open={!!deleting}
        itemLabel={deleting ? `flight ${deleting.flightNumber}` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}