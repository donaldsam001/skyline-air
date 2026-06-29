"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Mail, Phone } from "lucide-react";
import { Airline } from "@/types";
import { MOCK_AIRLINES } from "@/lib/mock/airports-airlines";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AirlineFormModal } from "@/components/admin/airline-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";

let idCounter = 100;

export default function AirlinesAdminPage() {
  const [airlines, setAirlines] = useState<Airline[]>(MOCK_AIRLINES);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Airline | null>(null);
  const [deleting, setDeleting] = useState<Airline | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return airlines.filter(
      (a) => a.iataCarrierCode.toLowerCase().includes(q) || a.operatorName.toLowerCase().includes(q)
    );
  }, [airlines, search]);

  async function handleSave(data: Omit<Airline, "id">, id?: string) {
    // Simulated POST /airplane/admin/airline
    await new Promise((r) => setTimeout(r, 500));
    if (!id && airlines.some((a) => a.iataCarrierCode === data.iataCarrierCode)) {
      return { ok: false, code: 5002, message: "Airline with this carrier code already exists." };
    }
    if (id) {
      setAirlines((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    } else {
      idCounter += 1;
      setAirlines((prev) => [...prev, { ...data, id: `al-${idCounter}` }]);
    }
    return { ok: true };
  }

  async function handleDelete() {
    if (!deleting) return;
    await new Promise((r) => setTimeout(r, 400));
    setAirlines((prev) => prev.filter((a) => a.id !== deleting.id));
    setDeleting(null);
  }

  const columns: Column<Airline>[] = [
    {
      header: "Carrier",
      width: "200px",
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: a.logoColor }}
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

      <DataTable columns={columns} rows={filtered} rowKey={(a) => a.id} emptyMessage="No airlines match your search." />

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