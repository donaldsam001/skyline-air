import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, label: "Seat type" },
  { step: 2, label: "Passenger details" },
  { step: 3, label: "Review & pay" },
];

export function BookingStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => {
        const done = s.step < current;
        const active = s.step === current;
        return (
          <li key={s.step} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  done && "bg-aviation-900 text-white",
                  active && "bg-sky-500 text-white ring-4 ring-sky-100",
                  !done && !active && "bg-slate-100 text-slate-400"
                )}
              >
                {done ? <Check className="h-4.5 w-4.5" /> : s.step}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-semibold sm:inline",
                  active || done ? "text-slate-900" : "text-slate-400"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-3 h-0.5 flex-1 rounded-full", done ? "bg-aviation-900" : "bg-slate-200")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}