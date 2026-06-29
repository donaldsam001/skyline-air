"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Aircraft } from "@/types";
import { MOCK_AIRCRAFT } from "@/lib/mock/aircraft";
import { findAirline } from "@/lib/mock/airports-airlines";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AircraftFormModal } from "@/components/admin/aircraft-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { CABIN_LABELS } from "@/lib/utils";

let idCounter = 100;

export default function AircraftAdminPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>(MOCK_AIRCRAFT);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aircraft | null>(null);
  const [deleting, setDeleting] = useState<Aircraft | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return aircraft.filter(
      (a) => a.model.toLowerCase().includes(q) || a.tailRegistration.toLowerCase().includes(q)
    );
  }, [aircraft, search]);

  async function handleSave(data: Omit<Aircraft, "id">, id?: string) {
    // Simulated POST /airplane/admin/aircraft/{airlineCode}
    await new Promise((r) => setTimeout(r, 500));
    if (!id && aircraft.some((a) => a.tailRegistration === data.tailRegistration)) {
      return { ok: false, code: 5003, message: "Aircraft tail registration already exists." };
    }
    if (id) {
      setAircraft((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    } else {
      idCounter += 1;
      setAircraft((prev) => [...prev, { ...data, id: `ac-${idCounter}` }]);
    }
    return { ok: true };
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