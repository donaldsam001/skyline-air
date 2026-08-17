"use client";

import { User } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatDateLong } from "@/lib/utils";

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null;

  const joinDate = user.registeredAt || user.createdAt || "";

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : user.email}
      description={user.email}
      size="md"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Username / Email</p>
            <p className="mt-0.5 font-medium text-slate-800">{user.username || user.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
            <p className="mt-0.5 font-medium text-slate-800">{user.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Account status</p>
            <Badge tone={user.isActive !== false ? "success" : "danger"} className="mt-1">
              {user.isActive !== false ? "Active" : "Disabled"}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Member since</p>
            <p className="mt-0.5 font-medium text-slate-800">
              {joinDate ? formatDateLong(joinDate) : "N/A"}
            </p>
          </div>
        </div>

        {user.roles && user.roles.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Roles & permissions</p>
            <div className="mt-2 space-y-2">
              {user.roles.map((role) => (
                <div key={role.name} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="aviation">{role.name}</Badge>
                    {role.description && <p className="text-xs text-slate-500">{role.description}</p>}
                  </div>
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {role.permissions.map((perm) => (
                        <span
                          key={typeof perm === "string" ? perm : perm.name}
                          className="rounded-md bg-slate-100 px-2 py-0.5 font-mono-data text-[11px] text-slate-600"
                        >
                          {typeof perm === "string" ? perm : perm.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}