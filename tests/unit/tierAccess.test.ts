import { describe, it, expect } from "vitest";
import { checkTierAccess } from "@/modules/subscription/types/subscription.schema";

describe("checkTierAccess", () => {
  // ─── FREE tier ────────────────────────────────────────────
  it("FREE tier cannot access FRESH zones", () => {
    expect(checkTierAccess("FREE", "FRESH")).toBe(false);
  });

  it("FREE tier cannot access SALT zones", () => {
    expect(checkTierAccess("FREE", "SALT")).toBe(false);
  });

  // ─── FRESHWATER tier ──────────────────────────────────────
  it("FRESHWATER tier can access FRESH zones", () => {
    expect(checkTierAccess("FRESHWATER", "FRESH")).toBe(true);
  });

  it("FRESHWATER tier cannot access SALT zones", () => {
    expect(checkTierAccess("FRESHWATER", "SALT")).toBe(false);
  });

  // ─── SALTWATER tier ───────────────────────────────────────
  it("SALTWATER tier can access SALT zones", () => {
    expect(checkTierAccess("SALTWATER", "SALT")).toBe(true);
  });

  it("SALTWATER tier cannot access FRESH zones", () => {
    expect(checkTierAccess("SALTWATER", "FRESH")).toBe(false);
  });

  // ─── ALL_ACCESS tier ──────────────────────────────────────
  it("ALL_ACCESS tier can access FRESH zones", () => {
    expect(checkTierAccess("ALL_ACCESS", "FRESH")).toBe(true);
  });

  it("ALL_ACCESS tier can access SALT zones", () => {
    expect(checkTierAccess("ALL_ACCESS", "SALT")).toBe(true);
  });
});
