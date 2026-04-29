import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage has link to register", async ({ page }) => {
    await page.goto("/");
    const signUpLink = page.getByRole("link", { name: /sign up free/i });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/register");
  });

  test("login page loads at /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
  });

  test("register page loads at /register", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /the fish forecaster/i })
    ).toBeVisible();
    await expect(page.getByText("Create your account")).toBeVisible();
  });
});
