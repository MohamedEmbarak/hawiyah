import { test, expect } from '../support/fixtures';
import { FRAMEWORKS, MANAGERS, TEXT, choose, ready } from './support';

// The install chooser (landing.sections install): every pair rewrites the commands
// and the steps, the lead command follows it, the copy button copies the command,
// and the stacked listings keep the height of each step.

for (const lang of ['ar', 'en'] as const) {
  const t = TEXT[lang];

  test.describe(`install chooser ${lang}`, () => {
    test('all twelve pairs rewrite the commands, the style import and the first component', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const section = page.locator('#install');
      const steps = section.locator('ol.steps > li');
      await expect(steps).toHaveCount(4);
      const lead = page.locator('guide-landing-lead');
      const frameworkGroup = section.getByRole('group', { name: t.framework });
      const managerGroup = section.getByRole('group', { name: t.manager });
      for (const manager of MANAGERS) {
        await choose(managerGroup, manager.id);
        for (const framework of FRAMEWORKS) {
          await choose(frameworkGroup, framework.label);
          const command = `${manager.verb} @hawiyah/styles@0.3.0 ${framework.adapter}@0.3.0`;
          await expect(steps.nth(0).locator('.cell:not(.command-leave) pre')).toHaveText(command);
          await expect(lead.locator('.cell:not(.command-leave) pre')).toHaveText(command);
          // The outgoing listing is removed at once when motion is reduced.
          await expect(lead.locator('.cell pre')).toHaveCount(1);
          for (const step of [1, 2]) {
            const active = steps.nth(step).locator('.cell:not([aria-hidden])');
            await expect(active).toHaveCount(1);
            await expect(steps.nth(step).locator('.cell[aria-hidden="true"][inert]')).toHaveCount(3);
          }
          await expect(steps.nth(1).locator('.cell:not([aria-hidden]) .hw-code-block-title')).toHaveText(framework.styleFile);
          await expect(steps.nth(2).locator('.cell:not([aria-hidden]) .hw-code-block-title')).toHaveText(framework.primary);
          await expect(steps.nth(1).locator('.cell:not([aria-hidden]) p')).toHaveCount(framework.id === 'vanilla' ? 2 : 1);
        }
      }
    });

    test('the listings of steps 2 and 3 keep their height when the framework changes', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const section = page.locator('#install');
      const stacks = section.locator('.stack');
      const heights = async () => Promise.all([0, 1].map(async (i) => (await stacks.nth(i).boundingBox())?.height ?? 0));
      const before = await heights();
      for (const framework of FRAMEWORKS) {
        await choose(section.getByRole('group', { name: t.framework }), framework.label);
        expect(await heights()).toEqual(before);
      }
    });

    test('step 3 shows the native Angular result and step 4 links onward', async ({ page }) => {
      await page.goto(`${lang}/`);
      await ready(page);
      const steps = page.locator('#install ol.steps > li');
      const card = steps.nth(2).locator('hw-card');
      await expect(card.getByRole('heading', { name: t.result })).toBeVisible();
      await expect(card.locator('guide-native-result').getByRole('button', { name: t.resultButton })).toBeVisible();
      await expect(card.locator('code')).toHaveText('@hawiyah/angular 0.3.0');
      await expect(steps.nth(3).getByRole('link', { name: t.toComponents })).toHaveAttribute('href', `${lang}/components/`);
      // The editor link exists only when the editor feature is built (stage 4c).
      await expect(steps.nth(3).getByRole('link')).toHaveCount(1);
    });

    test('the copy button copies the chosen command', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(`${lang}/`);
      await ready(page);
      await choose(page.locator('#install').getByRole('group', { name: t.framework }), 'React');
      await choose(page.locator('#install').getByRole('group', { name: t.manager }), 'pnpm');
      const lead = page.locator('guide-landing-lead');
      await expect(lead.locator('.cell:not(.command-leave) pre')).toHaveText('pnpm add @hawiyah/styles@0.3.0 @hawiyah/react@0.3.0');
      await expect(lead.locator('.cell pre')).toHaveCount(1);
      await lead.getByRole('button', { name: t.copy }).click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('pnpm add @hawiyah/styles@0.3.0 @hawiyah/react@0.3.0');
    });
  });
}
