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

  return (
    <Modal open={!!user} onClose={onClose} title={`${user.firstName} ${user.lastName}`} description={user.email} size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Username</p>
            <p className="mt-0.5 font-medium text-slate-800">{user.username}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
            <p className="mt-0.5 font-medium text-slate-800">{user.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Account status</p>
            <Badge tone={user.isActive ? "success" : "danger"} className="mt-1">
              {user.isActive ? "Active" : "Disabled"}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Member since</p>
            <p className="mt-0.5 font-medium text-slate-800">{formatDateLong(user.createdAt)}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Roles & permissions</p>
          <div className="mt-2 space-y-2">
            {user.roles.map((role) => (
              <div key={role.name} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="aviation">{role.name}</Badge>
                  <p className="text-xs text-slate-500">{role.description}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono-data text-[11px] text-slate-600">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}