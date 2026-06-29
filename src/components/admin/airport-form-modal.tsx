"use client";

import { useState } from "react";
import { Airport } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";

interface AirportFormModalProps {
  open: boolean;
  initial?: Airport | null;
  onClose: () => void;
  onSave: (airport: Omit<Airport, "id">, id?: string) => Promise<{ ok: boolean; code?: number; message?: string }>;
}

const EMPTY = { iataCode: "", name: "", city: "", country: "", latitude: 0, longitude: 0 };

export function AirportFormModal({ open, initial, onClose, onSave }: AirportFormModalProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          iataCode: initial.iataCode,
          name: initial.name,
          city: initial.city,
          country: initial.country,
          latitude: initial.latitude,
          longitude: initial.longitude,
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
      setError({ code: result.code ?? 1001, message: result.message ?? "Could not save airport." });
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit airport" : "Add airport"}
      description="IATA airports power route lookups across search, scheduling, and ticketing."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AlertBanner tone="error" title="Couldn't save" description={error.message} code={error.code} />}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="iataCode">IATA code</Label>
            <Input
              id="iataCode"
              value={form.iataCode}
              onChange={(e) => setForm({ ...form, iataCode: e.target.value.toUpperCase().slice(0, 3) })}
              placeholder="SGN"
              maxLength={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Airport name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tan Son Nhat International"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initial ? "Save changes" : "Add airport"}</Button>
        </div>
      </form>
    </Modal>
  );
}