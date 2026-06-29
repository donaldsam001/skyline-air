"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { User } from "@/types";
import { MOCK_USERS } from "@/lib/mock/users";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { UserDetailModal } from "@/components/admin/user-detail-modal";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [viewing, setViewing] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && !u.roles.some((r) => r.name === roleFilter)) return false;
      return (
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  async function toggleActive(user: User) {
    // Simulated PUT /airplane/admin/disable/{email}
    await new Promise((r) => setTimeout(r, 400));
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
  }

  const columns: Column<User>[] = [
    {
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aviation-900/10 text-xs font-bold text-aviation-900">
            {u.firstName[0]}{u.lastName[0]}
          </span>
          <div>
            <p className="font-medium text-slate-800">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Username", render: (u) => <span className="font-mono-data text-sm text-slate-600">{u.username}</span> },
    {
      header: "Role",
      render: (u) => (
        <div className="flex gap-1">
          {u.roles.map((r) => (
            <Badge key={r.name} tone={r.name === "ADMIN" ? "aviation" : "neutral"}>{r.name}</Badge>
          ))}
        </div>
      ),
    },
    { header: "Joined", render: (u) => <span className="text-sm text-slate-500">{formatDate(u.createdAt)}</span> },
    {
      header: "Active",
      align: "center",
      render: (u) => (
        <Switch checked={u.isActive} onChange={() => toggleActive(u)} label={`Toggle account for ${u.email}`} />
      ),
    },
    {
      header: "",
      width: "60px",
      align: "right",
      render: (u) => (
        <button
          onClick={() => setViewing(u)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-aviation-900"
          aria-label={`View ${u.email}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or username…"
        extra={
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CUSTOMER">Customer</option>
          </select>
        }
      />

      <p className="text-xs text-slate-400">
        {filtered.length} accounts · {filtered.filter((u) => u.isActive).length} active
      </p>

      <DataTable columns={columns} rows={filtered} rowKey={(u) => u.id} emptyMessage="No accounts match your search." />

      <UserDetailModal user={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}