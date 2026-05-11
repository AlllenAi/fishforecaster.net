import { test, expect } from "@playwright/test";

test.describe("Catch Reports / Photos pages", () => {
  test("catch reports feed redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/catches");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login form is shown after catches redirect", async ({ page }) => {
    await page.goto("/dashboard/catches");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("new catch report page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/catches/new");
    await expect(page).toHaveURL(/\/login/);
  });

  test("my catches page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/catches/mine");
    await expect(page).toHaveURL(/\/login/);
  });
});
