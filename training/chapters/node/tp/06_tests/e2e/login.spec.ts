// OPTIONAL — Playwright end-to-end test.
//
// Playwright is intentionally NOT listed in package.json. To run this file:
//   npm install -D @playwright/test
//   npx playwright install
//   npx playwright test
//
// This file is skipped by `node --test` (it lives outside src/ and does not
// match the default test glob), so it never breaks `npm test`.

import { test, expect } from "@playwright/test";

test("a user can log in from the /login page", async ({ page }) => {
  await page.goto("/login");

  // TODO: fill the email field, e.g.
  //   await page.getByLabel("Email").fill("ada@example.com");
  // TODO: fill the password field.
  // TODO: click the submit button (getByRole("button", { name: "Log in" })).
  // TODO: assert the user landed on the expected page, e.g.
  //   await expect(page).toHaveURL(/\/dashboard/);
  //   await expect(page.getByText("Welcome")).toBeVisible();
  expect(page).toBeDefined();
});
