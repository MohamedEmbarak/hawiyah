import { test, expect, axe, presetMode } from '../support/fixtures';
import { TEXT, choose, ready, type Lang } from './support';

// The landing (landing.sections): the five sections in order, the two statements,
// the two containers and their controls, the packages and the compliance statement,
// and axe in both languages and both colour modes.

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];
  const other: Lang = lang === 'ar' ? 'en' : 'ar';

  test.describe(`landing ${lang}`, () => {
    test('prerendered document: language, title, one h1 and the five sections in order', async ({ request }) => {
      const response = await request.get(`${lang}/`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toMatch(new RegExp(`<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`));
      expect(html).toContain(`<title>${t.title}</title>`);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('rel="canonical"');
      expect(html).not.toContain('http-equiv="refresh"');
      expect(html).toContain('npm install @hawiyah/styles@0.3.0 @hawiyah/angular@0.3.0');
    });

    test('lead: the statement in both languages, the command and the notes', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const h1 = page.locator('main h1');
      await expect(h1).toHaveText(t.statement);
      await expect(h1).toHaveAttribute('tabindex', '-1');
      const otherSay = page.locator('.say', { hasText: t.otherStatement });
      await expect(otherSay).toHaveAttribute('lang', other);
      await expect(otherSay).toHaveAttribute('dir', other === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('.spine')).toHaveAttribute('aria-hidden', 'true');
      const headings = page.locator('main section > h2, main .band-head > h2');
      await expect(headings).toHaveText([...t.headings]);
      const lead = page.locator('guide-landing-lead');
      await expect(lead.locator('.cell:not(.command-leave) pre')).toHaveText('npm install @hawiyah/styles@0.3.0 @hawiyah/angular@0.3.0');
      await expect(lead.locator('.cell .hw-code-block-title')).toHaveText(t.terminal);
      await expect(lead.locator('.notes')).toContainText('0.3.0');
      await expect(lead.locator('.notes code')).toHaveText('@hawiyah/angular 0.3.0');
      const link = lead.getByRole('link', { name: t.installLink });
      await expect(link).toHaveAttribute('href', `${lang}/#install`);
      await link.click();
      await expect(page.locator('#install')).toBeInViewport();
      await expect(page.locator('#install-title')).toBeFocused();
    });

    test('containers: the page language first, own attributes, own texts', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const panes = page.locator('guide-landing-pane');
      await expect(panes).toHaveCount(2);
      const first = panes.nth(0);
      const second = panes.nth(1);
      await expect(first.locator('figcaption h3')).toHaveText(lang === 'ar' ? t.containerA : t.containerB);
      await expect(first.locator('.stage')).toHaveAttribute('lang', lang);
      await expect(second.locator('.stage')).toHaveAttribute('lang', other);
      for (const pane of [first, second]) {
        const stage = pane.locator('.stage');
        await expect(stage).toHaveAttribute('data-hw-theme', 'dga');
        await expect(stage).toHaveAttribute('data-hw-mode', 'light');
        await expect(stage).toHaveAttribute('data-hw-density', 'comfortable');
        await expect(stage).toHaveAttribute('data-rev', '0');
      }
      // Pane text follows the pane language, never the page language.
      const arabic = page.locator('guide-landing-pane .stage[lang="ar"]');
      const english = page.locator('guide-landing-pane .stage[lang="en"]');
      await expect(arabic.getByRole('tab', { name: 'البيانات' })).toHaveAttribute('aria-selected', 'true');
      await expect(english.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
      await expect(arabic.getByLabel('الاسم الكامل')).toHaveValue('سارة أحمد');
      await expect(english.getByLabel('Full name')).toHaveValue('Sara Ahmed');
      await expect(english.locator('.hw-hint').first()).toContainText('Umm al-Qura: ');
      await expect(arabic.locator('.hw-hint').first()).toContainText('بالتقويم الميلادي: ');
    });

    test('controls change one container and announce it; reset returns both', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const target = page.getByRole('group', { name: t.target });
      await choose(target, t.containerA);
      const stageA = page.locator('guide-landing-pane .stage').nth(lang === 'ar' ? 0 : 1);
      await choose(page.getByRole('group', { name: t.language }), 'English');
      await expect(stageA).toHaveAttribute('lang', 'en');
      await expect(stageA).toHaveAttribute('dir', 'rtl');
      await expect(stageA).toHaveAttribute('data-rev', '1');
      await expect(stageA.getByLabel('Full name')).toHaveValue('Sara Ahmed');
      const status = page.locator('guide-landing-duo .controls > [role="status"]');
      await expect(status).toHaveText(
        lang === 'en' ? 'Container A: English, Right to left, Light, Comfortable' : 'الحاوية أ: English، من اليمين إلى اليسار، فاتح، مريحة',
      );
      await choose(page.getByRole('group', { name: t.mode }), lang === 'en' ? 'Dark' : 'داكن');
      await expect(stageA).toHaveAttribute('data-hw-mode', 'dark');
      await choose(page.getByRole('group', { name: t.density }), lang === 'en' ? 'Compact' : 'مضغوطة');
      await expect(stageA).toHaveAttribute('data-hw-density', 'compact');
      await choose(page.getByRole('group', { name: t.direction }), lang === 'en' ? 'Left to right' : 'من اليسار إلى اليمين');
      await expect(stageA).toHaveAttribute('dir', 'ltr');
      // The other container did not change.
      const stageB = page.locator('guide-landing-pane .stage').nth(lang === 'ar' ? 1 : 0);
      await expect(stageB).toHaveAttribute('data-rev', '0');
      await expect(stageB).toHaveAttribute('data-hw-mode', 'light');
      await page.getByRole('button', { name: t.reset }).click();
      await expect(status).toHaveText(t.resetDone);
      await expect(stageA).toHaveAttribute('lang', 'ar');
      await expect(stageA).toHaveAttribute('dir', 'rtl');
      await expect(stageA).toHaveAttribute('data-hw-mode', 'light');
      await expect(stageA).toHaveAttribute('data-hw-density', 'comfortable');
      await expect(stageA.getByLabel('الاسم الكامل')).toHaveValue('سارة أحمد');
    });

    test('continue selects the summary tab and moves focus to it; edit returns', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const english = page.locator('guide-landing-pane .stage[lang="en"]');
      await english.getByRole('button', { name: 'Continue' }).click();
      const summary = english.getByRole('tab', { name: 'Summary' });
      await expect(summary).toHaveAttribute('aria-selected', 'true');
      await expect(summary).toBeFocused();
      const panel = english.getByRole('tabpanel', { name: 'Summary' });
      await expect(panel.locator('dd').first()).toHaveText('Sara Ahmed');
      await expect(panel.locator('dd').nth(1)).toContainText('2026');
      await english.getByRole('button', { name: 'Edit' }).click();
      const details = english.getByRole('tab', { name: 'Details' });
      await expect(details).toHaveAttribute('aria-selected', 'true');
      await expect(details).toBeFocused();
    });

    test('the page colour mode is the starting mode of both containers', async ({ page }) => {
      await presetMode(page, 'dark');
      await page.goto(`${lang}/`);
      await ready(page);
      await expect(page.locator('guide-landing-pane .stage[data-hw-mode="dark"]')).toHaveCount(2);
    });

    test('packages and compliance', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const packages = page.locator('guide-landing-packages');
      await expect(packages.locator('.band-head p').first()).toHaveText(t.intro);
      const terms = packages.locator('dt');
      await expect(terms).toHaveCount(7);
      const names = (await terms.allTextContents()).map((text) => text.replace(/[⁦⁩]/g, '').trim());
      expect(names).toEqual(['@hawiyah/tokens', '@hawiyah/styles', '@hawiyah/core', '@hawiyah/vanilla', '@hawiyah/react', '@hawiyah/vue', '@hawiyah/angular']);
      const npm = packages.getByRole('link', { name: new RegExp(t.npm) });
      await expect(npm).toHaveAttribute('href', 'https://www.npmjs.com/org/hawiyah');
      await expect(npm).toHaveAttribute('target', '_blank');
      const compliance = page.locator('guide-landing-compliance');
      await expect(compliance.locator('p').first()).toHaveText(t.statementCompliance);
      const hrefs = await compliance.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(hrefs).toEqual([
        'https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/alignment.md',
        'https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/coverage.md',
        'https://github.com/MohamedEmbarak/hawiyah/blob/main/docs/validation.md',
        'https://design.dga.gov.sa/',
      ]);
      const body = (await page.locator('main').innerText()).toLowerCase();
      expect(body).not.toMatch(/certified|accredited|endorsed by/);
    });

    for (const mode of ['light', 'dark'] as const) {
      test(`axe: no WCAG 2.2 AA violation (${mode})`, async ({ page }) => {
        await presetMode(page, mode);
        await page.goto(`${lang}/`);
        await ready(page);
        expect(await axe(page)).toEqual([]);
      });
    }
  });
}
