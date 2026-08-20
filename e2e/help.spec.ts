import { test, expect } from "@playwright/test";

// The in-app help center (help-navigator widget mounted in the app Shell).
// Playwright locators pierce the widget's shadow root automatically.
// Requires seed data: `npm run setup` (Northwind Inc. demo company).

test.describe("help center", () => {
  test("launcher opens contextual help; context follows the route", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open help" }).click();
    const panel = page.getByRole("dialog", { name: "SockTu Help" });
    await expect(panel.getByText("Suggested for this page")).toBeVisible();
    await expect(panel.getByText("The readiness dashboard in two minutes")).toBeVisible();
    await expect(panel.getByText("Browse by topic")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel.getByText("Browse by topic")).not.toBeVisible();

    // Sidebar link's accessible name includes its icon glyph, so match loosely.
    await page.getByRole("link", { name: /Evidence/ }).click();
    await page.waitForURL(/\/evidence/);
    await page.keyboard.press("F1");
    await expect(panel.getByText("The evidence vault")).toBeVisible();
    await expect(panel.getByText("Freshness tracking: nothing goes stale silently")).toBeVisible();
  });

  test("search, article rendering, feedback, and back navigation", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("F1");
    const panel = page.getByRole("dialog", { name: "SockTu Help" });

    await panel.getByPlaceholder("Search help articles…").fill("freshness");
    await expect(panel.locator("mark").first()).toBeVisible();
    await panel
      .locator("button.hn-item", { hasText: "Freshness tracking: nothing goes stale silently" })
      .click();
    await expect(
      panel.getByRole("heading", { name: "Freshness tracking: nothing goes stale silently" }),
    ).toBeVisible();
    await expect(panel.getByText("The 14-day window")).toBeVisible();

    await panel.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(panel.getByText("Thanks for the feedback!")).toBeVisible();

    await panel.getByRole("button", { name: "Back" }).click();
    await expect(panel.locator("mark").first()).toBeVisible(); // back on search results
  });

  test("category browsing drills into remediation help", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("F1");
    const panel = page.getByRole("dialog", { name: "SockTu Help" });

    await panel.locator("button.hn-item", { hasText: "Tasks & remediation" }).click();
    await expect(
      panel.getByText('The ranked task queue and the guided "Clear this control" flow.'),
    ).toBeVisible();
    await panel
      .locator("button.hn-item", { hasText: "Guided remediation: clearing a control" })
      .click();
    await expect(panel.getByText("finishable checklist")).toBeVisible();
    await expect(panel.locator(".hn-article").getByText("Remediation steps")).toBeVisible();

    await panel.getByRole("button", { name: "Back" }).click();
    await panel.getByRole("button", { name: "Back" }).click();
    await expect(panel.getByText("Browse by topic")).toBeVisible();
  });
});
