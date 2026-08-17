"use client";

import { useEffect, useState } from "react";
import { Flight, FlightStatus, Airline, Airport, Aircraft } from "@/types";
import { adminApi } from "@/lib/api/admin";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";

interface FlightFormModalProps {
  open: boolean;
  initial?: Flight | null;
  onClose: () => void;
  onSave: (
    payload: {
      flightNumber: string;
      airlineCode: string;
      aircraftId: string;
      departureCode: string;
      destinationCode: string;
      departureTime: string;
      arrivalTime: string;
      basePrice: number;
      flightStatus: FlightStatus;
    },
    id?: string
  ) => Promise<{ ok: boolean; code?: number; message?: string }>;
}

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlightFormModal({ open, initial, onClose, onSave }: FlightFormModalProps) {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

  const [form, setForm] = useState({
    flightNumber: initial?.flightNumber || "",
    airlineCode: initial?.airline?.code || "",
    aircraftId: initial?.aircraft?.code || initial?.aircraft?.model || "",
    departureCode: initial?.departureAirport?.code || "",
    destinationCode: initial?.destinationAirport?.code || "",
    departureTime: toLocalInputValue(initial?.departureTime),
    arrivalTime: toLocalInputValue(initial?.arrivalTime),
    basePrice: initial?.basePrice || 150,
    flightStatus: (initial?.flightStatus || "SCHEDULED") as FlightStatus,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.airlines.getAll().catch(() => []),
      adminApi.airports.getAll().catch(() => []),
      adminApi.aircrafts.getAll().catch(() => []),
    ]).then(([alRes, apRes, acRes]) => {
      setAirlines(alRes || []);
      setAirports(apRes || []);
      setAircrafts(acRes || []);

      if (!initial) {
        setForm((f) => ({
          ...f,
          airlineCode: f.airlineCode || alRes[0]?.code || "",
          departureCode: f.departureCode || apRes[0]?.code || "",
          destinationCode: f.destinationCode || apRes[1]?.code || apRes[0]?.code || "",
          aircraftId: f.aircraftId || acRes[0]?.code || acRes[0]?.model || "",
        }));
      }
    });
  }, [initial]);

  const sameAirportError = Boolean(form.departureCode && form.destinationCode && form.departureCode === form.destinationCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sameAirportError) return;
    setSaving(true);
    setError(null);
    const result = await onSave(
      {
        ...form,
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: new Date(form.arrivalTime).toISOString(),
      },
      initial?.id !== undefined ? String(initial.id) : undefined
    );
    setSaving(false);
    if (!result.ok) {
      setError({ code: result.code ?? 1001, message: result.message ?? "Could not save flight." });
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit flight route" : "Deploy new flight route"}
      description="Map a new schedule block using existing infrastructure references."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <AlertBanner tone="error" title="Couldn't save" description={error.message} code={error.code} />}
        {sameAirportError && (
          <AlertBanner tone="warning" title="Origin and destination match" description="Choose two different airports for this route." />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="flightNumber">Flight number</Label>
            <Input
              id="flightNumber"
              value={form.flightNumber}
              onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })}
              placeholder="VN305"
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Flight status</Label>
            <Select
              id="status"
              value={form.flightStatus}
              onChange={(e) => setForm({ ...form, flightStatus: e.target.value as FlightStatus })}
            >
              {["SCHEDULED", "BOARDING", "DELAYED", "DEPARTED", "CANCELLED", "COMPLETED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="airline">Airline</Label>
            <Select
              id="airline"
              value={form.airlineCode}
              onChange={(e) => setForm({ ...form, airlineCode: e.target.value })}
            >
              {airlines.map((al) => (
                <option key={al.id || al.code} value={al.code}>{al.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="aircraft">Aircraft Code / Model</Label>
            <Select
              id="aircraft"
              value={form.aircraftId}
              onChange={(e) => setForm({ ...form, aircraftId: e.target.value })}
            >
              {aircrafts.map((ac) => (
                <option key={ac.id || ac.code} value={ac.code || ac.model}>
                  {ac.model} ({ac.code || ac.tailRegistration})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="departureCode">Departure hub</Label>
            <Select
              id="departureCode"
              value={form.departureCode}
              onChange={(e) => setForm({ ...form, departureCode: e.target.value })}
            >
              {airports.map((ap) => (
                <option key={ap.id || ap.code} value={ap.code}>
                  {ap.city || ap.name} ({ap.code})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="destinationCode">Destination</Label>
            <Select
              id="destinationCode"
              value={form.destinationCode}
              onChange={(e) => setForm({ ...form, destinationCode: e.target.value })}
            >
              {airports.map((ap) => (
                <option key={ap.id || ap.code} value={ap.code}>
                  {ap.city || ap.name} ({ap.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="departureTime">Departure time</Label>
            <Input
              id="departureTime"
              type="datetime-local"
              value={form.departureTime}
              onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="arrivalTime">Arrival time</Label>
            <Input
              id="arrivalTime"
              type="datetime-local"
              value={form.arrivalTime}
              onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="basePrice">Base price (USD)</Label>
          <Input
            id="basePrice"
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving} disabled={sameAirportError}>
            {initial ? "Save changes" : "Deploy flight"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}