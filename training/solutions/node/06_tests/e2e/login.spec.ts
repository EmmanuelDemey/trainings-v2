// OPTIONAL — Playwright end-to-end test.
//
// Playwright is intentionally NOT listed in package.json, and `/login` is not a
// route of this workshop's tiny API: this file is the shape of the answer, not
// a test you can run against `src/server.ts`. To run it against an app that
// does have a login page:
//   npm install -D @playwright/test
//   npx playwright install
//   npx playwright test
//
// This file is skipped by `node --test` (it lives outside src/ and does not
// match the default test glob), so it never breaks `npm test`. It is also
// excluded from `tsconfig.json`, so `npm run typecheck` does not ask for
// @playwright/test either.

import { test, expect } from "@playwright/test";

test("a user can log in from the /login page", async ({ page }) => {
  await page.goto("/login");

  // Role- and label-based queries, never CSS selectors: they survive a restyle,
  // and a query that fails because the label is gone is a query that just found
  // a real accessibility bug.
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Log in" }).click();

  // Both assertions auto-retry until the timeout, which is what makes them
  // immune to the redirect being one tick late. `expect(await ...)` would not.
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Welcome, Ada")).toBeVisible();
});
