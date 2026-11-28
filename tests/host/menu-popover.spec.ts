import { expect, test } from '@playwright/test';
import { ADAPTERS, computed, openCase, section } from './support';

// MENU-04: with the default examples, the packaged Vue and Angular triggers of
// Menu and Popover have the same computed background.
for (const adapter of ['vue', 'angular'] as const) {
  test(`MENU-04 ${adapter}: the packaged Menu and Popover triggers have the background of the other framework`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openCase(page, 'MENU-04', { adapters: ['vue', 'angular'] });
    const other = adapter === 'vue' ? 'angular' : 'vue';
    const trigger = (name: 'vue' | 'angular', kind: string) =>
      section(page, name).locator(kind === 'menu' ? '.hw-menu > button.hw-button' : '.hw-popover > button.hw-button');
    const backgrounds: string[] = [];
    for (const kind of ['menu', 'popover']) {
      const own = (await computed(trigger(adapter, kind), ['background-color']))['background-color'];
      const theirs = (await computed(trigger(other, kind), ['background-color']))['background-color'];
      expect(own, kind).toBe(theirs);
      await expect(trigger(adapter, kind)).toHaveAttribute('data-variant', 'secondary');
      backgrounds.push(own!);
    }
    expect(backgrounds[0], 'menu and popover triggers').toBe(backgrounds[1]);
  });
}

// POPOVER-04: the panel padding and the margins of the first and last child of
// the panel are the same in the four adapters.
const properties = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
const margins = ['margin-top', 'margin-bottom'];
for (const adapter of ADAPTERS) {
  test(`POPOVER-04 ${adapter}: panel padding and first and last child margins equal the other adapters`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openCase(page, 'POPOVER-04');
    const measure = async (name: typeof adapter) => {
      const root = section(page, name);
      const panel = root.locator('.hw-popover-panel');
      const trigger = root.locator('.hw-popover button[aria-expanded]').first();
      // Panels are positioned over the next sections: one is open at a time.
      await trigger.click();
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute('role', 'region');
      await expect(panel.locator('> p')).toHaveCount(2);
      const result = {
        panel: await computed(panel, properties),
        first: await computed(panel.locator('> p').first(), margins),
        last: await computed(panel.locator('> p').last(), margins),
      };
      await trigger.click();
      await expect(panel).toBeHidden();
      return result;
    };
    const own = await measure(adapter);
    for (const other of ADAPTERS.filter((name) => name !== adapter)) expect(own, `${adapter} against ${other}`).toEqual(await measure(other));
  });
}
