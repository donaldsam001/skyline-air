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

const EMPTY = { iataCarrierCode: "", operatorName: "", email: "", phone: "", logoColor: "#0B3D91" };

export function AirlineFormModal({ open, initial, onClose, onSave }: AirlineFormModalProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          iataCarrierCode: initial.iataCarrierCode,
          operatorName: initial.operatorName,
          email: initial.email,
          phone: initial.phone,
          logoColor: initial.logoColor ?? "#0B3D91",
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(form, initial?.id);
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
              value={form.iataCarrierCode}
              onChange={(e) => setForm({ ...form, iataCarrierCode: e.target.value.toUpperCase().slice(0, 2) })}
              placeholder="VN"
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="color">Brand color</Label>
            <div className="flex items-center gap-2">
              <input
                id="color"
                type="color"
                value={form.logoColor}
                onChange={(e) => setForm({ ...form, logoColor: e.target.value })}
                className="h-11 w-14 cursor-pointer rounded-xl border border-slate-300"
              />
              <span className="font-mono-data text-sm text-slate-500">{form.logoColor}</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="operatorName">Operator name</Label>
          <Input
            id="operatorName"
            value={form.operatorName}
            onChange={(e) => setForm({ ...form, operatorName: e.target.value })}
            placeholder="Skyline Vietnam Airlines"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Contact email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">Contact phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
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