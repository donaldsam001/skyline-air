"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Aircraft } from "@/types";
import { findAirline } from "@/lib/mock/airports-airlines";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AircraftFormModal } from "@/components/admin/aircraft-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { CABIN_LABELS } from "@/lib/utils";
import { api } from "@/lib/api/client";

export default function AircraftAdminPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aircraft | null>(null);
  const [deleting, setDeleting] = useState<Aircraft | null>(null);

  // Simulate fetching aircraft from the backend on component mount
  useEffect(() => {
    let mounted = true;
    api.aircraft.getAll()
      .then((data) => {
        if (mounted) {
          setAircraft(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load aircraft:", error);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return aircraft.filter(
      (a) => a.model.toLowerCase().includes(q) || a.tailRegistration.toLowerCase().includes(q)
    );
  }, [aircraft, search]);

  async function handleSave(data: Omit<Aircraft, "id">, id?: string) {
    try {
      if (id) {
        // Update existing aircraft
        const updated = await api.aircraft.update(id, data);
        setAircraft((prev) => prev.map((a) => (a.id === id ? updated : a)));
      } else {
        // Create new aircraft
        const created = await api.aircraft.create(data);
        setAircraft((prev) => [...prev, created]);
      }
      return { ok: true };
    } catch (error: any) {
      console.error("Failed to save aircraft:", error);
      // Map your Spring Boot AppExceptions/ErrorCodes to frontend codes here if needed
      return { ok: false, code: 500, message: error.message || "Failed to save aircraft." };
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    await new Promise((r) => setTimeout(r, 400));
    setAircraft((prev) => prev.filter((a) => a.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by model or tail registration…"
        actionLabel="Add aircraft"
        onAction={() => { setEditing(null); setModalOpen(true); }}
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center text-sm text-slate-400">
            No aircraft match your search.
          </div>
        ) : (
          filtered.map((a) => {
            const airline = findAirline(a.airlineCode);
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-4 p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : a.id)}
                    className="flex flex-1 items-center gap-4 text-left"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: airline?.logoColor ?? "#0B3D91" }}
                    >
                      {a.airlineCode}
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-slate-900">{a.model}</p>
                      <p className="font-mono-data text-xs text-slate-400">
                        {a.tailRegistration} · {a.seatCapacity} seats
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditing(a); setModalOpen(true); }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-aviation-900"
                      aria-label={`Edit ${a.model}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(a)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${a.model}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : a.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                      aria-label="Toggle seat configuration"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Seat configuration
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {a.seatConfig.map((seg) => (
                        <span
                          key={seg.cabin}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                        >
                          {CABIN_LABELS[seg.cabin]}
                          <span className="font-mono-data font-bold text-aviation-900">{seg.seats}</span>
                          <span className="text-slate-400">· ×{seg.basePriceMultiplier}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AircraftFormModal key={editing?.id ?? "new"} open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
      <ConfirmDeleteModal
        open={!!deleting}
        itemLabel={deleting ? `${deleting.model} (${deleting.tailRegistration})` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}