"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkDbHealth } from "../serverActions/health.action";

type HealthResult = Awaited<ReturnType<typeof checkDbHealth>>;

function StatusBadge({ status }: { status: "pass" | "fail" }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
        status === "pass"
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export function DbHealthCheck() {
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
      const report = await checkDbHealth();
      setResult(report);
    } catch {
      setResult({
        connected: false,
        create: null,
        read: null,
        delete: null,
        error: "Failed to run health check",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6 text-left space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">DB Health Check</h2>
        <Button onClick={runCheck} disabled={loading} size="sm">
          {loading ? "Checking..." : "Run Check"}
        </Button>
      </div>

      {result && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Connection:</span>
            <StatusBadge status={result.connected ? "pass" : "fail"} />
          </div>

          {(["create", "read", "delete"] as const).map((op) => {
            const check = result[op];
            if (!check) return null;
            return (
              <div key={op} className="flex items-center gap-2">
                <span className="text-muted-foreground uppercase w-16">
                  {op}:
                </span>
                <StatusBadge status={check.status} />
                <span className="text-xs text-muted-foreground">
                  {check.durationMs}ms
                </span>
              </div>
            );
          })}

          {result.error && (
            <p className="text-xs text-red-400 mt-2">
              Error: {result.error}
            </p>
          )}
        </div>
      )}

      {!result && !loading && (
        <p className="text-sm text-muted-foreground">
          Click &quot;Run Check&quot; to test Create, Read, and Delete
          operations against MongoDB.
        </p>
      )}
    </div>
  );
}
