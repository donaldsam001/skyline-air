"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Aircraft, CabinTier, SeatConfigSegment } from "@/types";
import { MOCK_AIRLINES } from "@/lib/mock/airports-airlines";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { CABIN_LABELS } from "@/lib/utils";

interface AircraftFormModalProps {
  open: boolean;
  initial?: Aircraft | null;
  onClose: () => void;
  onSave: (aircraft: Omit<Aircraft, "id">, id?: string) => Promise<{ ok: boolean; code?: number; message?: string }>;
}

const EMPTY_SEGMENT: SeatConfigSegment = { cabin: "ECONOMY", seats: 0, basePriceMultiplier: 1 };
const EMPTY = {
  model: "",
  tailRegistration: "",
  airlineCode: MOCK_AIRLINES[0]?.iataCarrierCode ?? "",
  seatConfig: [EMPTY_SEGMENT] as SeatConfigSegment[],
};

export function AircraftFormModal({ open, initial, onClose, onSave }: AircraftFormModalProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          model: initial.model,
          tailRegistration: initial.tailRegistration,
          airlineCode: initial.airlineCode,
          seatConfig: initial.seatConfig,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  const totalSeats = form.seatConfig.reduce((sum, s) => sum + (s.seats || 0), 0);

  function updateSegment(idx: number, patch: Partial<SeatConfigSegment>) {
    setForm((f) => ({
      ...f,
      seatConfig: f.seatConfig.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  }

  function addSegment() {
    setForm((f) => ({ ...f, seatConfig: [...f.seatConfig, { ...EMPTY_SEGMENT }] }));
  }

  function removeSegment(idx: number) {
    setForm((f) => ({ ...f, seatConfig: f.seatConfig.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave({ ...form, seatCapacity: totalSeats }, initial?.id);
    setSaving(false);
    if (!result.ok) {
      setError({ code: result.code ?? 1001, message: result.message ?? "Could not save aircraft." });
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit aircraft" : "Add aircraft"}
      description="Define the cabin breakdown — total seat capacity is calculated automatically."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AlertBanner tone="error" title="Couldn't save" description={error.message} code={error.code} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Airbus A350-900"
              required
            />
          </div>
          <div>
            <Label htmlFor="tail">Tail registration</Label>
            <Input
              id="tail"
              value={form.tailRegistration}
              onChange={(e) => setForm({ ...form, tailRegistration: e.target.value.toUpperCase() })}
              placeholder="VN-A899"
              required
            />
          </div>
          <div>
            <Label htmlFor="airline">Operating airline</Label>
            <Select
              id="airline"
              value={form.airlineCode}
              onChange={(e) => setForm({ ...form, airlineCode: e.target.value })}
            >
              {MOCK_AIRLINES.map((al) => (
                <option key={al.id} value={al.iataCarrierCode}>{al.operatorName}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="mb-0">Seat configuration by cabin</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSegment}>
              <Plus className="h-3.5 w-3.5" />
              Add segment
            </Button>
          </div>

          <div className="mt-3 space-y-2.5">
            {form.seatConfig.map((seg, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_100px_110px_auto] items-end gap-2.5 rounded-xl border border-slate-200 p-3">
                <div>
                  <Label className="text-xs">Cabin</Label>
                  <Select
                    value={seg.cabin}
                    onChange={(e) => updateSegment(idx, { cabin: e.target.value as CabinTier })}
                  >
                    {(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] as CabinTier[]).map((c) => (
                      <option key={c} value={c}>{CABIN_LABELS[c]}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Seats</Label>
                  <Input
                    type="number"
                    min={0}
                    value={seg.seats}
                    onChange={(e) => updateSegment(idx, { seats: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Price ×</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={1}
                    value={seg.basePriceMultiplier}
                    onChange={(e) => updateSegment(idx, { basePriceMultiplier: parseFloat(e.target.value) || 1 })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSegment(idx)}
                  disabled={form.seatConfig.length === 1}
                  className="mb-0.5 rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  aria-label="Remove segment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="mt-2.5 text-sm text-slate-500">
            Total seat capacity: <span className="font-mono-data font-semibold text-slate-800">{totalSeats}</span>
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initial ? "Save changes" : "Add aircraft"}</Button>
        </div>
      </form>
    </Modal>
  );
}