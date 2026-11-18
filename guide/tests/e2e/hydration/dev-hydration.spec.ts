import { test, expect, hydrated } from '../support/fixtures';
import { languagePages } from '../support/routes';

const targets = [...languagePages.map((p) => p.href), 'en/no-such-page/'];

for (const href of targets) {
  test(`development build hydrates ${href} without skipped components`, async ({ page, guard }) => {
    if (href.includes('no-such-page')) guard.allowDocument404(/\/no-such-page\/$/);
    await page.goto(href);
    await hydrated(page);
    await expect
      .poll(() => guard.all.map((m) => m.text()).find((text) => text.includes('Angular hydrated')) ?? '')
      .toMatch(/Angular hydrated \d+ component\(s\) and \d+ node\(s\), 0 component\(s\) were skipped/);
    expect(guard.all.filter((m) => m.text().includes('Hawiyah:')).map((m) => m.text())).toEqual([]);
  });
}
