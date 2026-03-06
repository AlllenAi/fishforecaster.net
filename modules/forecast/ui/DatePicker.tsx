"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export function DatePicker({
  value,
  onChange,
}: {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}) {
  const date = new Date(value + "T00:00:00");

  const goDay = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    onChange(formatDate(d));
  };

  const isToday = value === formatDate(new Date());

  const displayDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-muted p-1">
      <button
        onClick={() => goDay(-1)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-1.5 px-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {isToday ? "Today" : displayDate}
        </span>
      </div>
      <button
        onClick={() => goDay(1)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
