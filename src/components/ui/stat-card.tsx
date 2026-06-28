import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: "aviation" | "sky" | "amber" | "emerald";
}

const accentClasses = {
  aviation: "bg-aviation-900/5 text-aviation-900",
  sky: "bg-sky-100 text-sky-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

export function StatCard({ label, value, delta, deltaTone = "neutral", icon: Icon, accent = "aviation" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accentClasses[accent])}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-slate-900 tabular">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-1.5 text-xs font-semibold",
            deltaTone === "up" && "text-emerald-600",
            deltaTone === "down" && "text-red-600",
            deltaTone === "neutral" && "text-slate-400"
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
