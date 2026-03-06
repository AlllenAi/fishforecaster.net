"use client";

import { cn } from "@/lib/utils";

type WaterFilter = "ALL" | "SALT" | "FRESH";

const options: { value: WaterFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SALT", label: "Saltwater" },
  { value: "FRESH", label: "Freshwater" },
];

export function WaterTypeToggle({
  value,
  onChange,
}: {
  value: WaterFilter;
  onChange: (v: WaterFilter) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
