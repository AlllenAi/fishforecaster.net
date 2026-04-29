import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("page loads with all 3 plan cards visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();
    await expect(page.getByText("Freshwater")).toBeVisible();
    await expect(page.getByText("Saltwater")).toBeVisible();
    await expect(page.getByText("All Access")).toBeVisible();
  });

  test("each card shows correct price", async ({ page }) => {
    const prices = page.locator("text=$7");
    await expect(prices).toHaveCount(2);

    const allAccessPrice = page.locator("text=$12");
    await expect(allAccessPrice).toHaveCount(1);
  });

  test("Best Value badge is on All Access plan", async ({ page }) => {
    await expect(page.getByText("Best Value")).toBeVisible();
  });

  test("Get Started buttons are visible", async ({ page }) => {
    const buttons = page.getByRole("button", { name: /get started/i });
    await expect(buttons).toHaveCount(3);
  });
});
