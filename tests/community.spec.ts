import { test, expect } from "@playwright/test";

test.describe("Community pages", () => {
  test("community feed redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/community");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login form is shown after community redirect", async ({ page }) => {
    await page.goto("/dashboard/community");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("new post page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/community/new");
    await expect(page).toHaveURL(/\/login/);
  });

  test("events page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/community/events");
    await expect(page).toHaveURL(/\/login/);
  });

  test("new event page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/community/events/new");
    await expect(page).toHaveURL(/\/login/);
  });

  test("my posts page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/community/mine");
    await expect(page).toHaveURL(/\/login/);
  });
});
