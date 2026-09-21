import { test, expect } from "@playwright/test";
import en from "../src/i18n/locales/en/translation.json" with { type: "json" };
import hi from "../src/i18n/locales/hi/translation.json" with { type: "json" };
import bn from "../src/i18n/locales/bn/translation.json" with { type: "json" };
import or from "../src/i18n/locales/or/translation.json" with { type: "json" };
const packs = { en, hi, bn, or };
const user = {
  id: "a".repeat(24),
  name: "Test operator",
  email: "test@example.com",
  role: "admin",
  language: "en",
  aiLanguageMode: "selected",
  organization: {
    _id: "b".repeat(24),
    name: "PaddySync test organization",
    defaultLanguage: "en",
    secondaryLanguage: "",
    enabledProviders: ["manual"],
    defaultProvider: "manual",
    paymentMode: "test",
    aiEnabled: false,
  },
};
const summary = {
  asOf: "2026-09-20T12:00:00.000Z",
  farmers: 0,
  stockGrams: 0,
  documents: [],
  payments: [],
  financialAccess: true,
};
async function mock(page, authenticated = true) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data = { items: [], total: 0 };
    let status = 200;
    if (path === "/api/auth/me") {
      data = authenticated ? user : { code: "UNAUTHENTICATED" };
      status = authenticated ? 200 : 401;
    } else if (path === "/api/auth/preferences") {
      data = {
        ...user,
        preferredLanguage: route.request().postDataJSON().preferredLanguage,
      };
    } else if (path === "/api/v2/summary") data = summary;
    else if (path === "/api/v2/settings") data = user.organization;
    else if (path === "/api/v2/paddypal") {
      status = 503;
      data = { code: "AI_NOT_CONFIGURED" };
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
}
for (const [locale, pack] of Object.entries(packs))
  for (const width of [390, 1440])
    test(`${locale} ${width}px navigation, translated form and layout`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: 960 });
      await mock(page);
      await page.goto("/");
      await page.getByRole("combobox").selectOption(locale);
      await expect(
        page.getByRole("heading", { name: pack.dashboard.title }),
      ).toBeVisible({ timeout: 10000 });
      await page.goto("/parties");
      await page.getByRole("combobox").selectOption(locale);
      await expect(page.getByRole("button", { name: pack.common.add })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: pack.common.add }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByLabel(pack.fields.name, { exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      expect(errors).toEqual([]);
      await page.screenshot({
        path: `test-results/${locale}-${width}.png`,
        fullPage: true,
      });
    });
test("login language selector works before authentication", async ({
  page,
}) => {
  await mock(page, false);
  await page.goto("/");
  await page.getByRole("combobox").selectOption("or");
  await expect(
    page.getByRole("heading", { name: or.login.title }),
  ).toBeVisible();
  await expect(page.getByLabel(or.login.email)).toBeVisible();
});
test("PaddyPal shows localized unavailable state and no fabricated answers", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/paddypal");
  await page.getByRole("combobox").selectOption("bn");
  await expect(page.getByRole("button", { name: bn.ai.stock })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: bn.ai.stock }).click();
  await expect(page.getByRole("alert")).toHaveText(bn.errors.AI_NOT_CONFIGURED, { timeout: 10000 });
  await expect(page.locator(".message.assistant")).toHaveCount(0);
});
test("report print contains selected script", async ({ page }) => {
  await mock(page);
  await page.goto("/reports");
  await page.locator(".print-controls select").selectOption("or");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".printable")).toContainText(or.reports.summary);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "test-results/odia-report.pdf",
    format: "A4",
    printBackground: true,
  });
});
