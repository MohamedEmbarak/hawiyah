import {expect, test} from '@playwright/test';

const projects = [
  ['vanilla','javascript','ar'], ['vanilla','typescript','en'],
  ['react','javascript','en'], ['react','typescript','ar'],
  ['vue','javascript','ar'], ['vue','typescript','en'], ['angular','typescript','ar'],
] as const;
const ids = ['tooltip', 'popover', 'menu', 'drawer', 'collapsible', 'tree-view'] as const;

for (const [framework, language, locale] of projects) {
  test(`six disclosure projects support keyboard interaction in ${framework} ${language} ${locale}`, async ({page}) => {
    test.setTimeout(360000);
    await page.addInitScript(lang => { if (window === window.top) localStorage.setItem('nasaq-locale', lang); }, locale);
    for (const id of ids) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.nq-ide-status')).toHaveAttribute('data-state','ready',{timeout:45000});
      const project = page.frameLocator('.nq-ide-frame').locator(`[data-disclosure-project="${id}"]`);
      await expect(project).toBeVisible();
      const button = project.locator('button').first();
      if (id === 'tooltip') {
        const trigger = project.locator('[aria-describedby]').first();
        await expect(project.locator('[role="tooltip"]')).toHaveCount(6);
        const tip = project.locator('[role="tooltip"]').first();
        await trigger.focus();
        await expect(tip).toBeVisible();
        expect((await trigger.getAttribute('aria-describedby'))?.split(/\s+/)).toContain(await tip.getAttribute('id'));
        await trigger.press('Escape');
        await expect(tip).toBeHidden();
        await expect(trigger).toBeFocused();
        const outside = project.locator('[data-test-tooltip-outside]');
        await project.evaluate(root => {
          const button = root.ownerDocument.createElement('button');
          button.textContent = 'Outside';
          button.setAttribute('data-test-tooltip-outside', '');
          root.append(button);
        });
        await outside.focus();
        await trigger.hover();
        await expect(tip).toBeVisible();
        await outside.press('Escape');
        await expect(tip).toBeHidden();
        await expect(outside).toBeFocused();
      } else if (id === 'popover') {
        await button.press('Enter');
        const panel = project.getByRole('region', {name: locale === 'ar' ? 'متطلبات الخدمة' : 'Service requirements'});
        await expect(panel).toBeVisible();
        const checkbox = panel.getByRole('checkbox');
        await checkbox.press('Space');
        await expect(checkbox).toBeChecked();
        await checkbox.press('Escape');
        await expect(panel).toBeHidden();
        await expect(button).toBeFocused();
      } else if (id === 'menu') {
        await button.press('ArrowDown');
        const items = project.getByRole('menuitem');
        await expect(items).toHaveCount(3);
        await expect(items.nth(0)).toBeFocused();
        await items.nth(0).press('ArrowDown');
        await expect(items.nth(2)).toBeFocused();
        await items.nth(2).press('Enter');
        await expect(project.locator('[data-project-selection]')).toHaveText('duplicate');
        await expect(project.getByRole('menu')).toHaveCount(0);
        await expect(button).toBeFocused();
      } else if (id === 'drawer') {
        await button.press('Enter');
        const drawer = project.locator('dialog');
        await expect(drawer).toBeVisible();
        expect(await drawer.evaluate(node => node.matches(':modal'))).toBe(true);
        await expect(drawer).toHaveAccessibleName(locale === 'ar' ? 'مرشحات الطلبات' : 'Request filters');
        await drawer.getByRole('checkbox').press('Space');
        await expect(drawer.getByRole('checkbox')).toBeChecked();
        await drawer.getByRole('checkbox').press('Escape');
        await expect(drawer).toBeHidden();
        await expect(button).toBeFocused();
      } else if (id === 'collapsible') {
        const summary = project.locator('summary');
        const content = project.locator('li').first();
        await summary.press('Space');
        await expect(content).toBeVisible();
        await summary.press('Enter');
        await expect(content).toBeHidden();
        await expect(summary).toBeFocused();
      } else {
        const items = project.getByRole('treeitem');
        const parent = items.first();
        const expand = locale === 'ar' ? 'ArrowLeft' : 'ArrowRight';
        const collapse = locale === 'ar' ? 'ArrowRight' : 'ArrowLeft';
        await expect(items).toHaveCount(2);
        await parent.press(expand);
        await expect(parent).toHaveAttribute('aria-expanded','true');
        await expect(items).toHaveCount(4);
        await parent.press(expand);
        const license = items.nth(1);
        await expect(license).toBeFocused();
        await license.press('Enter');
        await expect(project.locator('[data-project-selection]')).toHaveText('license');
        await expect(license).toHaveAttribute('aria-selected','true');
        await license.press(collapse);
        await expect(parent).toBeFocused();
        await parent.press(collapse);
        await expect(items).toHaveCount(2);
      }
      await expect(page).toHaveURL(new RegExp(`#component/${id}$`));
      await expect(page.locator('.nq-ide-console')).not.toContainText(/Failed to resolve component|\[error\]/);
    });
  });
}
