"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import { Airline } from "@/types";
import { adminApi } from "@/lib/api/admin-client";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AirlineFormModal } from "@/components/admin/airline-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";

export default function AirlinesAdminPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Airline | null>(null);
  const [deleting, setDeleting] = useState<Airline | null>(null);

  // Fetch airlines from the backend on component mount
  useEffect(() => {
    let mounted = true;
    adminApi.airlines.getAll()
      .then((data) => {
        if (mounted) {
          setAirlines(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load airlines:", error);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return airlines.filter(
      (a) => a.iataCarrierCode.toLowerCase().includes(q) || a.operatorName.toLowerCase().includes(q)
    );
  }, [airlines, search]);

  async function handleSave(data: Omit<Airline, "id">, id?: string) {
    try {
      if (id) {
        // Update existing airline
        const updated = await adminApi.airlines.update(id, data);
        setAirlines((prev) => prev.map((a) => (a.id === id ? updated : a)));
      } else {
        // Create new airline
        const created = await adminApi.airlines.create(data);
        setAirlines((prev) => [...prev, created]);
      }
      return { ok: true };
    } catch (error: any) {
      console.error("Failed to save airline:", error);
      // Map your Spring Boot AppExceptions/ErrorCodes to frontend codes here if needed
      return { ok: false, code: 500, message: error.message || "Failed to save airline." };
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await adminApi.airlines.delete(deleting.id);
      setAirlines((prev) => prev.filter((a) => a.id !== deleting.id));
      setDeleting(null);
    } catch (error) {
      console.error("Failed to delete airline:", error);
      // Optional: Add a toast notification here to tell the user the delete failed
      setDeleting(null); 
    }
  }

  const columns: Column<Airline>[] = [
    {
      header: "Carrier",
      width: "200px",
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: a.logoColor || "#94a3b8" }} // Fallback color
          >
            {a.iataCarrierCode}
          </span>
          <span className="font-medium text-slate-800">{a.operatorName}</span>
        </div>
      ),
    },
    {
      header: "Email",
      render: (a) => (
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Mail className="h-3.5 w-3.5" /> {a.email}
        </span>
      ),
    },
    {
      header: "Phone",
      render: (a) => (
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Phone className="h-3.5 w-3.5" /> {a.phone}
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
            aria-label={`Edit ${a.operatorName}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleting(a)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${a.operatorName}`}
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
        searchPlaceholder="Search by name or carrier code…"
        actionLabel="Add airline"
        onAction={() => { setEditing(null); setModalOpen(true); }}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(a) => a.id} emptyMessage="No airlines match your search." />
      )}

      <AirlineFormModal key={editing?.id ?? "new"} open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
      
      <ConfirmDeleteModal
        open={!!deleting}
        itemLabel={deleting ? deleting.operatorName : ""}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}