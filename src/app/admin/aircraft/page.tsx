"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Aircraft } from "@/types";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AircraftFormModal } from "@/components/admin/aircraft-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { adminApi } from "@/lib/api/admin";

export default function AircraftAdminPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aircraft | null>(null);
  const [deleting, setDeleting] = useState<Aircraft | null>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.aircrafts
      .getAll()
      .then((data) => {
        if (mounted) {
          setAircraft(data || []);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load aircraft:", error);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return aircraft.filter(
      (a) =>
        (a.model && a.model.toLowerCase().includes(q)) ||
        (a.registrationNumber && a.registrationNumber.toLowerCase().includes(q)) ||
        (a.tailRegistration && a.tailRegistration.toLowerCase().includes(q))
    );
  }, [aircraft, search]);

  async function handleSave(data: Omit<Aircraft, "id">, id?: string) {
    try {
      if (id) {
        const updated = await adminApi.aircrafts.update(id, data);
        setAircraft((prev) => prev.map((a) => (String(a.id) === id || a.code === id ? updated : a)));
      } else {
        const airlineCode = data.airlineCode || data.airline?.code || "VN";
        const created = await adminApi.aircrafts.create(airlineCode, data);
        setAircraft((prev) => [...prev, created]);
      }
      return { ok: true };
    } catch (error: unknown) {
      console.error("Failed to save aircraft:", error);
      const msg =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to save aircraft.";
      return { ok: false, code: 500, message: msg };
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      const code = deleting.code || String(deleting.id || "");
      if (code) {
        await adminApi.aircrafts.delete(code);
        setAircraft((prev) => prev.filter((a) => String(a.id || a.code) !== code));
      }
      setDeleting(null);
    } catch (error) {
      console.error("Failed to delete aircraft:", error);
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by model or tail registration…"
        actionLabel="Add aircraft"
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-aviation-900" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center text-sm text-slate-400">
              No aircraft match your search.
            </div>
          ) : (
            filtered.map((a) => {
              const regNumber = a.registrationNumber || a.tailRegistration || "N/A";
              return (
                <div
                  key={a.id || a.code || regNumber}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aviation-900 text-xs font-bold text-white">
                      {a.airline?.code || a.airlineCode || "AC"}
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-slate-900">{a.model}</p>
                      <p className="font-mono-data text-xs text-slate-400">
                        {regNumber} · {a.totalSeats || a.seatCapacity || 180} seats
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(a);
                        setModalOpen(true);
                      }}
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <AircraftFormModal key={editing?.id ?? "new"} open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
      <ConfirmDeleteModal
        open={!!deleting}
        itemLabel={deleting ? `${deleting.model} (${deleting.registrationNumber || deleting.tailRegistration || ""})` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}