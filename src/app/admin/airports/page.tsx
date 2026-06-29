"use client";

import { useMemo, useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { Airport } from "@/types";
import { MOCK_AIRPORTS } from "@/lib/mock/airports-airlines";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AirportFormModal } from "@/components/admin/airport-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { Button } from "@/components/ui/button";

let idCounter = 100;

export default function AirportsAdminPage() {
  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [deleting, setDeleting] = useState<Airport | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return airports.filter(
      (a) =>
        a.iataCode.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    );
  }, [airports, search]);

  async function handleSave(data: Omit<Airport, "id">, id?: string) {
    // Simulated POST /airplane/admin/airport
    await new Promise((r) => setTimeout(r, 500));
    if (!id && airports.some((a) => a.iataCode === data.iataCode)) {
      return { ok: false, code: 5001, message: "Airport with this IATA code already exists." };
    }
    if (id) {
      setAirports((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    } else {
      idCounter += 1;
      setAirports((prev) => [...prev, { ...data, id: `ap-${idCounter}` }]);
    }
    return { ok: true };
  }

  async function handleDelete() {
    if (!deleting) return;
    await new Promise((r) => setTimeout(r, 400));
    setAirports((prev) => prev.filter((a) => a.id !== deleting.id));
    setDeleting(null);
  }

  const columns: Column<Airport>[] = [
    {
      header: "IATA",
      width: "90px",
      render: (a) => <span className="font-mono-data text-sm font-bold text-aviation-900">{a.iataCode}</span>,
    },
    { header: "Airport", render: (a) => <span className="font-medium text-slate-800">{a.name}</span> },
    { header: "City", render: (a) => a.city },
    { header: "Country", render: (a) => a.country },
    {
      header: "Coordinates",
      render: (a) => (
        <span className="font-mono-data text-xs text-slate-500">
          {a.latitude.toFixed(3)}, {a.longitude.toFixed(3)}
        </span>
      ),
    },
    {
      header: "",
      width: "90px",
      align: "right",
      render: (a) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => { setEditing(a); setModalOpen(true); }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-aviation-900"
            aria-label={`Edit ${a.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleting(a)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${a.name}`}
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
        searchPlaceholder="Search by code, name, or city…"
        actionLabel="Add airport"
        onAction={() => { setEditing(null); setModalOpen(true); }}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        emptyMessage="No airports match your search."
      />

      <AirportFormModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      <ConfirmDeleteModal
        open={!!deleting}
        itemLabel={deleting ? `${deleting.name} (${deleting.iataCode})` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}