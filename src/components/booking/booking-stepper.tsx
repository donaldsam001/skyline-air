import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, label: "Seat & Fare", icon: "✈" },
  { step: 2, label: "Passengers", icon: "👤" },
  { step: 3, label: "Review & Pay", icon: "💳" },
];

export function BookingStepper({ current }: { current: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const done = s.step < current;
          const active = s.step === current;
          return (
            <li key={s.step} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                    done && "bg-aviation-900 text-white shadow-md shadow-aviation-900/20",
                    active &&
                      "bg-amber-500 text-aviation-950 ring-4 ring-amber-500/20 shadow-md shadow-amber-500/20",
                    !done && !active && "bg-slate-100 text-slate-400"
                  )}
                >
                  {done ? <Check className="h-4.5 w-4.5" /> : s.step}
                </span>
                <div className="hidden sm:block">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      active ? "text-aviation-900" : done ? "text-slate-700" : "text-slate-400"
                    )}
                  >
                    {s.label}
                  </span>
                  {active && (
                    <p className="text-[10px] font-medium text-amber-600">Current step</p>
                  )}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "stepper-connector mx-3 h-0.5 flex-1 rounded-full transition-colors",
                    done ? "bg-aviation-900" : "bg-slate-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}