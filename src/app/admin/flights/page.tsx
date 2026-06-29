"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Flight, FlightStatus } from "@/types";
import { MOCK_FLIGHTS } from "@/lib/mock/flights";
import { findAirport, findAirline } from "@/lib/mock/airports-airlines";
import { MOCK_AIRCRAFT } from "@/lib/mock/aircraft";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { FlightFormModal } from "@/components/admin/flight-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Badge, flightStatusTone } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

let idCounter = 5000;

export default function FlightSchedulerPage() {
  const [flights, setFlights] = useState<Flight[]>(
    [...MOCK_FLIGHTS].sort((a, b) => a.departureTime.localeCompare(b.departureTime)).slice(0, 60)
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState<Flight | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flights.filter((f) => {
      if (statusFilter !== "ALL" && f.flightStatus !== statusFilter) return false;
      return (
        f.flightNumber.toLowerCase().includes(q) ||
        f.departureAirport.iataCode.toLowerCase().includes(q) ||
        f.destinationAirport.iataCode.toLowerCase().includes(q) ||
        f.airline.operatorName.toLowerCase().includes(q)
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
    // Simulated POST /airplane/admin/{airlineCode}/{aircraftCode}/{departureCode}/{destinationCode}/flight
    await new Promise((r) => setTimeout(r, 600));

    if (!id && flights.some((f) => f.flightNumber === payload.flightNumber)) {
      return { ok: false, code: 2004, message: "Flight number already exists for this airline." };
    }
    if (new Date(payload.arrivalTime) <= new Date(payload.departureTime)) {
      return { ok: false, code: 2003, message: "Arrival time must be after departure time." };
    }

    const airline = findAirline(payload.airlineCode)!;
    const aircraft = MOCK_AIRCRAFT.find((a) => a.id === payload.aircraftId)!;
    const departureAirport = findAirport(payload.departureCode)!;
    const destinationAirport = findAirport(payload.destinationCode)!;

    const fareRules = aircraft.seatConfig.map((seg) => ({
      cabin: seg.cabin,
      basePrice: Math.round(payload.basePrice * seg.basePriceMultiplier),
      refundable: seg.cabin !== "ECONOMY",
      changeFeeUSD: seg.cabin === "ECONOMY" ? 35 : 0,
    }));

    if (id) {
      setFlights((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                flightNumber: payload.flightNumber,
                airline,
                aircraft,
                departureAirport,
                destinationAirport,
                departureTime: payload.departureTime,
                arrivalTime: payload.arrivalTime,
                fareRules,
                flightStatus: payload.flightStatus,
                totalSeats: aircraft.seatCapacity,
              }
            : f
        )
      );
    } else {
      idCounter += 1;
      setFlights((prev) => [
        {
          id: `fl-${idCounter}`,
          flightNumber: payload.flightNumber,
          departureAirport,
          destinationAirport,
          departureTime: payload.departureTime,
          arrivalTime: payload.arrivalTime,
          airline,
          aircraft,
          totalSeats: aircraft.seatCapacity,
          availableSeats: aircraft.seatCapacity,
          fareRules,
          flightStatus: payload.flightStatus,
        },
        ...prev,
      ]);
    }
    return { ok: true };
  }

  async function handleDelete() {
    if (!deleting) return;
    await new Promise((r) => setTimeout(r, 400));
    setFlights((prev) => prev.filter((f) => f.id !== deleting.id));
    setDeleting(null);
  }

  const columns: Column<Flight>[] = [
    {
      header: "Flight",
      render: (f) => (
        <div>
          <p className="font-mono-data text-sm font-bold text-aviation-900">{f.flightNumber}</p>
          <p className="text-xs text-slate-400">{f.airline.operatorName}</p>
        </div>
      ),
    },
    {
      header: "Route",
      render: (f) => (
        <span className="font-mono-data text-sm text-slate-700">
          {f.departureAirport.iataCode} → {f.destinationAirport.iataCode}
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
          {f.availableSeats}/{f.totalSeats}
        </span>
      ),
    },
    {
      header: "From",
      align: "right",
      render: (f) => (
        <span className="font-mono-data text-sm font-semibold text-slate-800">
          {formatCurrency(Math.min(...f.fareRules.map((r) => r.basePrice)))}
        </span>
      ),
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

      <DataTable columns={columns} rows={filtered} rowKey={(f) => f.id} emptyMessage="No flights match your filters." />

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