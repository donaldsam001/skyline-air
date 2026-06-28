"use client";

import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto thin-scrollbar border-b border-slate-200">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors",
              active ? "text-aviation-900" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold tabular",
                  active ? "bg-sky-100 text-aviation-900" : "bg-slate-100 text-slate-500"
                )}
              >
                {tab.count}
              </span>
            )}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-aviation-900" />
            )}
          </button>
        );
      })}
    </div>
  );
}