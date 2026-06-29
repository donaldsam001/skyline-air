import { ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  actionLabel?: string;
  onAction?: () => void;
  extra?: ReactNode;
}

export function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  actionLabel,
  onAction,
  extra,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {actionLabel && onAction && (
          <Button size="sm" onClick={onAction}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}