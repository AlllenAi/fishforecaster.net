import { test, expect } from "@playwright/test";

test.describe("Account & Billing page", () => {
  test("redirects to login if not authenticated", async ({ page }) => {
    await page.goto("/dashboard/account");

    await expect(page).toHaveURL(/\/login/);
  });

  test("login page is shown after redirect", async ({ page }) => {
    await page.goto("/dashboard/account");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
