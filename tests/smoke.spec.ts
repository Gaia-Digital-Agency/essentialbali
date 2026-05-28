import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/ubud", "/ubud/news", "/bali/dine-drink", "/search"];

for (const route of ROUTES) {
  test(`${route} returns 200 and renders without crash`, async ({ page }) => {
    const response = await page.goto(`https://www.essentialbali.com${route}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("footer.footer")).toBeVisible({ timeout: 10000 });
  });
}
