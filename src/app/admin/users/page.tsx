"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { User } from "@/types";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/data-table";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { UserDetailModal } from "@/components/admin/user-detail-modal";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [viewing, setViewing] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.users
      .getAll()
      .then((data) => {
        if (mounted) {
          setUsers(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && !u.roles?.some((r) => r.name === roleFilter)) return false;
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
      return (
        (u.email && u.email.toLowerCase().includes(q)) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  async function toggleActive(user: User) {
    if (!user.email) return;
    try {
      await adminApi.users.disable(user.email);
      setUsers((prev) =>
        prev.map((u) => (u.email === user.email ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      console.error("Failed to disable/toggle user status:", err);
    }
  }

  const columns: Column<User>[] = [
    {
      header: "User",
      render: (u) => {
        const firstInitial = u.firstName ? u.firstName[0] : "";
        const lastInitial = u.lastName ? u.lastName[0] : "U";
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aviation-900/10 text-xs font-bold text-aviation-900">
              {firstInitial}{lastInitial}
            </span>
            <div>
              <p className="font-medium text-slate-800">
                {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Unnamed User"}
              </p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      render: (u) => (
        <div className="flex gap-1">
          {u.roles && u.roles.length > 0 ? (
            u.roles.map((r) => (
              <Badge key={r.name} tone={r.name === "ADMIN" ? "aviation" : "neutral"}>
                {r.name}
              </Badge>
            ))
          ) : (
            <Badge tone="neutral">CUSTOMER</Badge>
          )}
        </div>
      ),
    },
    {
      header: "Joined",
      render: (u) => (
        <span className="text-sm text-slate-500">
          {u.registeredAt ? formatDate(u.registeredAt) : "N/A"}
        </span>
      ),
    },
    {
      header: "Active",
      align: "center",
      render: (u) => (
        <Switch
          checked={Boolean(u.isActive)}
          onChange={() => toggleActive(u)}
          label={`Toggle account for ${u.email}`}
        />
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
        searchPlaceholder="Search by name or email…"
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

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(u) => String(u.id || u.email)}
          emptyMessage="No accounts match your search."
        />
      )}

      <UserDetailModal user={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}