"use client";

import { useState } from "react";
import { Airline } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";

interface AirlineFormModalProps {
  open: boolean;
  initial?: Airline | null;
  onClose: () => void;
  onSave: (airline: Omit<Airline, "id">, id?: string) => Promise<{ ok: boolean; code?: number; message?: string }>;
}

const EMPTY = { code: "", name: "", contactEmail: "", contactPhone: "" };

export function AirlineFormModal({ open, initial, onClose, onSave }: AirlineFormModalProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          code: initial.code || initial.iataCarrierCode || "",
          name: initial.name || initial.operatorName || "",
          contactEmail: initial.contactEmail || "",
          contactPhone: initial.contactPhone || "",
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(form, initial?.id !== undefined ? String(initial.id) : undefined);
    setSaving(false);
    if (!result.ok) {
      setError({ code: result.code ?? 1001, message: result.message ?? "Could not save airline." });
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit airline" : "Add airline"}
      description="Carrier codes are referenced by the flight scheduler and aircraft registry."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AlertBanner tone="error" title="Couldn't save" description={error.message} code={error.code} />}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Carrier code</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().slice(0, 3) })}
              placeholder="VN"
              maxLength={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Operator name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Skyline Air"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initial ? "Save changes" : "Add airline"}</Button>
        </div>
      </form>
    </Modal>
  );
}