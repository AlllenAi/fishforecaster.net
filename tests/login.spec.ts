import { test, expect } from "@playwright/test";

test("login page has remember me and quick links", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByLabel("Remember me")).toBeVisible();
  await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /i have a 2fa code/i })).toBeVisible();
});

test("2FA requiring accounts open code field", async ({ page }) => {
  await page.goto("/login");

  await page.fill("#email", "2fa@example.com");
  await page.fill("#password", "Failsafe123");
  await page.click("button:has-text(\"Sign In\")");

  await expect(page.getByLabel("2FA Code")).toBeVisible();
});

test("forgot password route completes and returns to login", async ({ page }) => {
  await page.goto("/login/forgot-password");

  await page.fill("#email", "test@example.com");
  await page.click("button:has-text(\"Send reset link\")");

  // Navigation back to login indicates success flow completed.
  await expect(page).toHaveURL("**/login");
});
