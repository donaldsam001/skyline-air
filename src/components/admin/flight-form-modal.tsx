"use client";

import { useMemo, useState } from "react";
import { Flight, FlightStatus } from "@/types";
import { MOCK_AIRPORTS, MOCK_AIRLINES } from "@/lib/mock/airports-airlines";
import { MOCK_AIRCRAFT } from "@/lib/mock/aircraft";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/ui/alert-banner";

interface FlightFormModalProps {
  open: boolean;
  initial?: Flight | null;
  onClose: () => void;
  onSave: (payload: {
    flightNumber: string;
    airlineCode: string;
    aircraftId: string;
    departureCode: string;
    destinationCode: string;
    departureTime: string;
    arrivalTime: string;
    basePrice: number;
    flightStatus: FlightStatus;
  }, id?: string) => Promise<{ ok: boolean; code?: number; message?: string }>;
}

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildInitialForm(initial?: Flight | null) {
  return initial
    ? {
        flightNumber: initial.flightNumber,
        airlineCode: initial.airline.iataCarrierCode,
        aircraftId: initial.aircraft.id,
        departureCode: initial.departureAirport.iataCode,
        destinationCode: initial.destinationAirport.iataCode,
        departureTime: toLocalInputValue(initial.departureTime),
        arrivalTime: toLocalInputValue(initial.arrivalTime),
        basePrice: initial.fareRules.find((r) => r.cabin === "ECONOMY")?.basePrice ?? 150,
        flightStatus: initial.flightStatus,
      }
    : {
        flightNumber: "",
        airlineCode: MOCK_AIRLINES[0]?.iataCarrierCode ?? "",
        aircraftId: MOCK_AIRCRAFT[0]?.id ?? "",
        departureCode: MOCK_AIRPORTS[0]?.iataCode ?? "",
        destinationCode: MOCK_AIRPORTS[1]?.iataCode ?? "",
        departureTime: "",
        arrivalTime: "",
        basePrice: 150,
        flightStatus: "SCHEDULED" as FlightStatus,
      };
}

export function FlightFormModal({ open, initial, onClose, onSave }: FlightFormModalProps) {
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  const aircraftForAirline = useMemo(
    () => MOCK_AIRCRAFT.filter((a) => a.airlineCode === form.airlineCode),
    [form.airlineCode]
  );

  const sameAirportError = form.departureCode === form.destinationCode;

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
      initial?.id
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
              onChange={(e) => {
                const aircraftMatch = MOCK_AIRCRAFT.find((a) => a.airlineCode === e.target.value);
                setForm({ ...form, airlineCode: e.target.value, aircraftId: aircraftMatch?.id ?? form.aircraftId });
              }}
            >
              {MOCK_AIRLINES.map((al) => (
                <option key={al.id} value={al.iataCarrierCode}>{al.operatorName}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="aircraft">Aircraft</Label>
            <Select id="aircraft" value={form.aircraftId} onChange={(e) => setForm({ ...form, aircraftId: e.target.value })}>
              {aircraftForAirline.map((ac) => (
                <option key={ac.id} value={ac.id}>{ac.model} ({ac.tailRegistration})</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="departureCode">Departure hub</Label>
            <Select id="departureCode" value={form.departureCode} onChange={(e) => setForm({ ...form, departureCode: e.target.value })}>
              {MOCK_AIRPORTS.map((ap) => (
                <option key={ap.id} value={ap.iataCode}>{ap.city} ({ap.iataCode})</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="destinationCode">Destination</Label>
            <Select id="destinationCode" value={form.destinationCode} onChange={(e) => setForm({ ...form, destinationCode: e.target.value })}>
              {MOCK_AIRPORTS.map((ap) => (
                <option key={ap.id} value={ap.iataCode}>{ap.city} ({ap.iataCode})</option>
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
          <Label htmlFor="basePrice">Base economy price (USD)</Label>
          <Input
            id="basePrice"
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: parseInt(e.target.value) || 0 })}
            required
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Premium Economy, Business, and First fares are derived from the aircraft&apos;s cabin price multipliers.
          </p>
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