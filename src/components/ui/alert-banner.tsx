import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "error" | "success" | "info" | "warning";

const config: Record<AlertTone, { icon: typeof Info; classes: string }> = {
  error: { icon: XCircle, classes: "bg-red-50 border-red-200 text-red-800" },
  success: { icon: CheckCircle2, classes: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  info: { icon: Info, classes: "bg-sky-50 border-sky-200 text-sky-800" },
  warning: { icon: AlertTriangle, classes: "bg-amber-50 border-amber-200 text-amber-800" },
};

interface AlertBannerProps {
  tone?: AlertTone;
  title: string;
  description?: string;
  code?: number;
  onDismiss?: () => void;
}

export function AlertBanner({ tone = "error", title, description, code, onDismiss }: AlertBannerProps) {
  const { icon: Icon, classes } = config[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3.5", classes)}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-sm opacity-90">{description}</p>}
        {code !== undefined && (
          <p className="mt-1 font-mono-data text-xs opacity-60">Error code {code}</p>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-sm font-semibold opacity-60 hover:opacity-100">
          Dismiss
        </button>
      )}
    </div>
  );
}