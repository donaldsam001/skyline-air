"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Airport } from "@/types";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AirportFormModal } from "@/components/admin/airport-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";

export default function AirportsAdminPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [deleting, setDeleting] = useState<Airport | null>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.airports
      .getAll()
      .then((data) => {
        if (mounted) {
          setAirports(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load airports:", error);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return airports.filter(
      (a) =>
        (a.code && a.code.toLowerCase().includes(q)) ||
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.city && a.city.toLowerCase().includes(q)) ||
        (a.country && a.country.toLowerCase().includes(q))
    );
  }, [airports, search]);

  async function handleSave(data: Omit<Airport, "id">, id?: string) {
    try {
      if (id) {
        const updated = await adminApi.airports.update(id, data);
        setAirports((prev) => prev.map((a) => (String(a.id) === id || a.code === id ? updated : a)));
      } else {
        const created = await adminApi.airports.create(data);
        setAirports((prev) => [...prev, created]);
      }
      return { ok: true };
    } catch (error: unknown) {
      console.error("Failed to save airport:", error);
      const msg =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to save airport.";
      return { ok: false, code: 500, message: msg };
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      const code = deleting.code || deleting.iataCode || "";
      if (code) {
        await adminApi.airports.delete(code);
        setAirports((prev) => prev.filter((a) => (a.code || a.iataCode) !== code));
      }
      setDeleting(null);
    } catch (error) {
      console.error("Failed to delete airport:", error);
      setDeleting(null);
    }
  }

  const columns: Column<Airport>[] = [
    {
      header: "Code",
      width: "90px",
      render: (a) => (
        <span className="font-mono-data text-sm font-bold text-aviation-900">{a.code}</span>
      ),
    },
    {
      header: "Airport",
      render: (a) => <span className="font-medium text-slate-800">{a.name}</span>,
    },
    { header: "City", render: (a) => a.city || "N/A" },
    { header: "Country", render: (a) => a.country || "N/A" },
    {
      header: "Coordinates",
      render: (a) => (
        <span className="font-mono-data text-xs text-slate-500">
          {a.latitude != null && a.longitude != null
            ? `${a.latitude.toFixed(3)}, ${a.longitude.toFixed(3)}`
            : "N/A"}
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
            onClick={() => {
              setEditing(a);
              setModalOpen(true);
            }}
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
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(a) => String(a.id ?? a.code)}
          emptyMessage="No airports match your search."
        />
      )}

      <AirportFormModal
        key={editing?.id ?? editing?.code ?? "new"}
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      <ConfirmDeleteModal
        open={!!deleting}
        itemLabel={deleting ? `${deleting.name} (${deleting.code})` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}