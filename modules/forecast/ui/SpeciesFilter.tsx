"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import type { ForecastResult } from "../types/scoring.types";

export function SpeciesFilter({
  forecasts,
  value,
  onChange,
}: {
  forecasts: ForecastResult[];
  value: string[];
  onChange: (species: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Derive unique species list from forecasts
  const allSpecies = Array.from(
    new Set(forecasts.flatMap((f) => f.speciesScores.map((s) => s.species)))
  ).sort();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(species: string) {
    if (value.includes(species)) {
      onChange(value.filter((s) => s !== species));
    } else {
      onChange([...value, species]);
    }
  }

  if (allSpecies.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border bg-muted px-3 py-1.5 text-sm font-medium transition-colors",
          value.length > 0
            ? "border-primary/50 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {value.length > 0 ? (
          <>
            <span>Species ({value.length})</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="rounded-full p-0.5 hover:bg-background"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <span>Species</span>
        )}
        <ChevronsUpDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-card p-1 shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {allSpecies.map((species) => {
              const selected = value.includes(species);
              return (
                <button
                  key={species}
                  onClick={() => toggle(species)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    selected
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {species}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
