"use client";

import { Plus, Trash2, UserRound } from "lucide-react";
import { DraftPassenger, PassengerType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const NATIONALITIES = [
  "Vietnam", "Singapore", "Thailand", "Japan", "South Korea",
  "Australia", "United Kingdom", "United Arab Emirates", "United States", "Other",
];

interface PassengerDetailsStepProps {
  passengers: DraftPassenger[];
  errors: Record<string, Record<string, string>>;
  onAdd: () => void;
  onRemove: (uid: string) => void;
  onUpdate: (uid: string, patch: Partial<DraftPassenger>) => void;
}

export function PassengerDetailsStep({
  passengers,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: PassengerDetailsStepProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Passenger details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter every traveler exactly as they appear on their passport.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add passenger
        </Button>
      </div>

      <div className="mt-6 space-y-5">
        {passengers.map((p, idx) => {
          const fieldErrors = errors[p.uid] ?? {};
          return (
            <div key={p.uid} className="flight-strip rounded-2xl border border-slate-200 bg-white p-5 pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aviation-900/5 text-aviation-900">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">Passenger {idx + 1}</h3>
                </div>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(p.uid)}
                    className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`fn-${p.uid}`}>First name</Label>
                  <Input
                    id={`fn-${p.uid}`}
                    value={p.firstName}
                    onChange={(e) => onUpdate(p.uid, { firstName: e.target.value })}
                    placeholder="As shown on passport"
                    error={fieldErrors.firstName}
                  />
                </div>
                <div>
                  <Label htmlFor={`ln-${p.uid}`}>Last name</Label>
                  <Input
                    id={`ln-${p.uid}`}
                    value={p.lastName}
                    onChange={(e) => onUpdate(p.uid, { lastName: e.target.value })}
                    placeholder="As shown on passport"
                    error={fieldErrors.lastName}
                  />
                </div>

                <div>
                  <Label htmlFor={`type-${p.uid}`}>Passenger type</Label>
                  <Select
                    id={`type-${p.uid}`}
                    value={p.passengerType}
                    onChange={(e) => onUpdate(p.uid, { passengerType: e.target.value as PassengerType })}
                  >
                    <option value="ADULT">Adult (12+ years)</option>
                    <option value="CHILD">Child (2–11 years)</option>
                    <option value="INFANT">Infant (under 2 years)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`dob-${p.uid}`}>Date of birth</Label>
                  <Input
                    id={`dob-${p.uid}`}
                    type="date"
                    value={p.dateOfBirth}
                    onChange={(e) => onUpdate(p.uid, { dateOfBirth: e.target.value })}
                    error={fieldErrors.dateOfBirth}
                  />
                </div>

                <div>
                  <Label htmlFor={`passport-${p.uid}`}>Passport number</Label>
                  <Input
                    id={`passport-${p.uid}`}
                    value={p.passportNumber}
                    onChange={(e) => onUpdate(p.uid, { passportNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. C1234567"
                    error={fieldErrors.passportNumber}
                  />
                </div>
                <div>
                  <Label htmlFor={`nat-${p.uid}`}>Nationality</Label>
                  <Select
                    id={`nat-${p.uid}`}
                    value={p.nationality}
                    onChange={(e) => onUpdate(p.uid, { nationality: e.target.value })}
                    error={fieldErrors.nationality}
                  >
                    <option value="">Select nationality</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}