import { expect, test } from "@playwright/test";
import { catalog } from "../../apps/playground/src/data";
import AxeBuilder from "@axe-core/playwright";

test("brand loader switches to its static symbol for reduced motion without a logo font request", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/#components");
  const loader = page.locator(".brand-loader img:visible");
  await expect(loader).toBeVisible();
  await expect
    .poll(() =>
      loader.evaluate((node) => (node as HTMLImageElement).naturalWidth),
    )
    .toBe(128);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      loader.evaluate((node) => (node as HTMLImageElement).currentSrc),
    )
    .toContain("hawiyah-symbol.svg");
  expect(
    requests.filter((url) => /ArefRuqaa.*\.(?:ttf|woff2?)/i.test(url)),
  ).toEqual([]);
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hawiyah-locale", "en");
    localStorage.setItem("hawiyah-mode", "light");
  });
});

test("Live recipes preserve native values while richer controls are enhanced", async ({
  page,
}) => {
  await page.goto("/#components");
  await expect(page.locator(".component-card")).toHaveCount(catalog.length);
  const password = page.locator('[data-hw="password-field"]');
  await password.locator("input").fill("fictional-password");
  await password.locator("button").click();
  await expect(password.locator("input")).toHaveAttribute("type", "text");
  await expect(password.locator("input")).toHaveValue("fictional-password");
  await page.locator("[data-hw-pin-input]").fill("١٢٣۴۵۶");
  await expect(page.locator("[data-hw-pin-input]")).toHaveValue("123456");
  const tags = page.locator('[data-hw="tag-input"]');
  await tags.locator("[data-hw-tag-input]").fill("Accessibility");
  await tags.locator("[data-hw-tag-input]").press("Enter");
  await expect(tags.locator("[data-hw-tags]")).toContainText("Accessibility");
  expect(
    await tags
      .locator("input[type=hidden]")
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLInputElement).value)),
  ).toEqual(["Design", "Accessibility"]);
  const multi = page.locator('[data-hw="multi-select"]');
  await multi.locator("input[type=search]").fill("Education");
  await expect(multi.locator('input[value="0"]')).toBeChecked();
  await multi.getByLabel("Education", { exact: true }).check();
  await multi.locator("input[type=search]").fill("");
  await expect(multi.locator("input:checked")).toHaveCount(2);
});

test("native date picker switches reference calendars without changing the ISO day", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#components");
  const picker = page.locator('[data-hw="date-picker"]');
  const input = picker.locator("[data-hw-date-input]");
  const trigger = picker.locator("[data-hw-date-trigger]");
  await trigger.click();
  const dialog = picker.locator("dialog");
  await expect(dialog).toBeVisible();
  const system = dialog.locator("[data-hw-calendar-system]:checked");
  await expect(system).toHaveValue("islamic-umalqura");
  await expect(dialog.locator('[data-hw-date="2026-10-28"]')).toHaveAttribute(
    "data-selected",
    "",
  );
  await dialog.locator("input[value=gregory]").check();
  await expect(picker.locator("input[type=hidden][name=appointment]")).toHaveValue("2026-10-28");
  await expect(dialog.locator('[data-hw-date="2026-10-28"]')).toHaveText("28");
  await dialog.locator("input[value=islamic-umalqura]").check();
  await expect(picker.locator("input[type=hidden][name=appointment]")).toHaveValue("2026-10-28");
  await expect(dialog.locator('[data-hw-date="2026-10-28"]')).toHaveText("17");
  const scan = await new AxeBuilder({ page })
    .include("[data-hw-date-dialog]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await input.fill("1900-01-01");
  expect(
    await input.evaluate((n) => (n as HTMLInputElement).checkValidity()),
  ).toBe(false);
  await trigger.click();
  await dialog.locator("input[value=gregory]").check();
  await expect(picker.locator("input[type=hidden][name=appointment]")).toHaveValue("1900-01-01");
  expect(
    await input.evaluate((n) => (n as HTMLInputElement).checkValidity()),
  ).toBe(true);
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});

test("menus, trees, carousels, sortable data and dismissible feedback work in the catalog", async ({
  page,
}) => {
  await page.goto("/#components");
  const menu = page.locator('[data-hw="menu"]');
  await menu.locator("[data-hw-trigger]").click();
  await expect(menu.locator("[role=menu]")).toBeVisible();
  await page.keyboard.press("End");
  await expect(menu.getByRole("menuitem", { name: "Archive" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu.locator("[data-hw-trigger]")).toBeFocused();
  const tree = page.locator('[data-hw="tree-view"]');
  const business = tree.locator('[data-hw-value="business"]');
  await business.focus();
  await page.keyboard.press("ArrowDown");
  await expect(tree.locator('[data-hw-value="doc-0"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(tree.locator('[data-hw-value="doc-0"]')).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const carousel = page.locator('[data-hw="carousel"]');
  await expect(carousel.locator("[data-hw-slide]:visible")).toHaveCount(1);
  await carousel.locator("[data-hw-next]").click();
  await expect(carousel.locator("[data-hw-slide]:not([hidden])")).toContainText(
    "Everything in one place.",
  );
  await expect(carousel.locator("[data-hw-slide]:visible")).toHaveCount(1);
  const table = page.locator('[data-hw="data-table"]');
  await table.getByRole("button", { name: "Days", exact: true }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Certificate");
  await table.getByRole("button", { name: "Days", exact: true }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Permit");
  const feedback = page.locator('[data-hw="feedback"]');
  await feedback.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(
    feedback.getByRole("button", { name: "Yes", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator('[data-hw="cookie-consent"] [data-hw-consent="rejected"]')
    .click();
  await expect(page.locator('[data-hw="cookie-consent"]')).toBeHidden();
  const toasts = page.locator('[data-hw="toast-region"] [data-hw-toast]');
  await expect(toasts).toHaveCount(5);
  const dismissible = toasts.filter({has: page.locator('[data-hw-dismiss]')});
  await expect(dismissible).toHaveCount(4);
  for (const toast of await dismissible.all()) {
    await toast.locator('[data-hw-dismiss]').click();
    await expect(toast).toBeHidden();
  }
});

test("layout studio edits real responsive CSS and survives Arabic switching", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#layouts");
  await page.locator("#layout-columns").fill("4");
  const columns = () =>
    page
      .locator("#layout-canvas > .hw-grid")
      .evaluate(
        (n) => getComputedStyle(n).gridTemplateColumns.split(" ").length,
      );
  await expect.poll(columns).toBe(4);
  await page.locator("#layout-gap").fill("8");
  await expect(page.locator("#layout-code")).toContainText("--hw-space-8");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(columns).toBe(1);
  await page.getByRole("button", { name: "ع — Switch to Arabic" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#layout-columns")).toHaveValue("4");
  await page.locator("#layout-pattern").selectOption("sidebar");
  await expect(
    page.locator("#layout-canvas > .hw-sidebar > aside"),
  ).toContainText("الفلاتر");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test("input laboratory covers input types with custom date handling and keeps validation and reset local", async ({
  page,
}) => {
  await page.goto("/#inputs");
  const form = page.locator("#native-input-lab");
  const types = await form
    .locator("input")
    .evaluateAll((nodes) =>
      [...new Set(nodes.map((n) => n.getAttribute("type") || "text"))].sort(),
    );
  expect(types).toEqual([
    "button",
    "checkbox",
    "color",
    "email",
    "file",
    "hidden",
    "image",
    "number",
    "password",
    "radio",
    "range",
    "reset",
    "search",
    "submit",
    "tel",
    "text",
    "time",
    "url",
  ]);
  await form.locator("input[name=email]").fill("bad-email");
  await form.locator("input[type=submit]").click();
  await expect(form.locator("#native-input-output")).toHaveText("{}");
  await form.locator("input[name=email]").fill("fictional@example.test");
  await form.locator("input[name=password]").fill("fictional-secret");
  await form.locator("input[type=submit]").click();
  await expect(form.locator("#native-input-output")).toContainText(
    "fictional@example.test",
  );
  await expect(form.locator("#native-input-output")).not.toContainText(
    "fictional-secret",
  );
  await form.locator("input[type=reset]").click();
  await expect(form.locator("input[name=email]")).toHaveValue("");
  await expect(form.locator("#native-input-output")).toHaveText("{}");
});

for (const route of ["layouts", "inputs"])
  for (const locale of ["en", "ar"]) {
    test(`${route} ${locale} has no automated WCAG AA findings or mobile overflow`, async ({
      page,
    }) => {
      await page.goto(`/#${route}`);
      if (locale === "ar") {
        await page
          .getByRole("button", { name: "ع — Switch to Arabic" })
          .click();
        await page.getByRole("button", { name: "تبديل المظهر" }).click();
      }
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
    });
  }
