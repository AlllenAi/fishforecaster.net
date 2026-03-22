"use client";

import { useState } from "react";
import { Zap, Clock, Gauge } from "lucide-react";
import { useNotificationPreferences } from "../hooks/useNotificationPreferences";

function Toggle({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function NotificationPreferences() {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    useNotificationPreferences();

  const [threshold, setThreshold] = useState<number | null>(null);

  // Derive effective threshold: local state if user is dragging, otherwise from server
  const effectiveThreshold = threshold ?? preferences?.highScoreThreshold ?? 80;

  if (isLoading) {
    return (
      <div className="rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Fishing Alerts</h3>
        </div>
        <div className="mt-4 animate-pulse space-y-3">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-6 w-48 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="rounded-xl border p-6">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Fishing Alerts</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Get notified when your favorite zones have great conditions. Add
        favorites from the zone detail pages.
      </p>

      <div className="mt-5 space-y-5">
        {/* High Score Alert */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-medium">High Score Alerts</p>
              <p className="text-xs text-muted-foreground">
                Email when a favorite zone&apos;s bite score exceeds your
                threshold
              </p>
            </div>
          </div>
          <Toggle
            checked={preferences.notifyHighScore}
            disabled={isUpdating}
            onToggle={() =>
              updatePreferences({
                ...preferences,
                notifyHighScore: !preferences.notifyHighScore,
              })
            }
          />
        </div>

        {/* Threshold Slider */}
        {preferences.notifyHighScore && (
          <div className="ml-7 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Score Threshold
              </label>
              <span className="text-sm font-bold">{effectiveThreshold}</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={effectiveThreshold}
              disabled={isUpdating}
              onChange={(e) => setThreshold(Number(e.target.value))}
              onMouseUp={() => {
                if (effectiveThreshold !== preferences.highScoreThreshold) {
                  updatePreferences({
                    ...preferences,
                    highScoreThreshold: effectiveThreshold,
                  });
                  setThreshold(null);
                }
              }}
              onTouchEnd={() => {
                if (effectiveThreshold !== preferences.highScoreThreshold) {
                  updatePreferences({
                    ...preferences,
                    highScoreThreshold: effectiveThreshold,
                  });
                  setThreshold(null);
                }
              }}
              className="mt-2 w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>50 (Good+)</span>
              <span>80 (Excellent)</span>
              <span>100</span>
            </div>
          </div>
        )}

        {/* Bite Window Alert */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Bite Window Alerts</p>
              <p className="text-xs text-muted-foreground">
                Email when strong bite windows are detected in your favorite
                zones
              </p>
            </div>
          </div>
          <Toggle
            checked={preferences.notifyBiteWindow}
            disabled={isUpdating}
            onToggle={() =>
              updatePreferences({
                ...preferences,
                notifyBiteWindow: !preferences.notifyBiteWindow,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
