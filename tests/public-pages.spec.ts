import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", { name: /pricing/i })
    ).toBeVisible();
  });

  test("terms page loads with terms content", async ({ page }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: /terms of service/i })
    ).toBeVisible();
    await expect(page.getByText("Acceptance of Terms")).toBeVisible();
  });

  test("privacy page loads with privacy content", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: /privacy policy/i })
    ).toBeVisible();
    await expect(page.getByText("What Data We Collect")).toBeVisible();
  });

  test("homepage has call-to-action", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /get your free forecast/i })
    ).toBeVisible();
  });
});
