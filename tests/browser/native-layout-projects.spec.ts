import {expect, test, type Locator} from '@playwright/test';
import {frameWidth} from './support/preview-frame';

const layouts = ['container', 'stack', 'inline', 'grid', 'columns', 'sidebar', 'center', 'spacer', 'aspect-ratio', 'section', 'app-shell', 'page-header'] as const;
type LayoutId = typeof layouts[number];

function bounds(node: Element) {
  const {x, y, width, height, right, bottom} = node.getBoundingClientRect();
  return {x, y, width, height, right, bottom};
}
const box = (node: Locator) => node.evaluate(bounds);

async function geometry(id: LayoutId, project: Locator, wide: boolean, rtl: boolean) {
  const component = project.locator(`.hw-${id}`).first();
  const root = await box(component);
  const viewport = await project.evaluate(node => node.ownerDocument.defaultView!.innerWidth);
  expect(root.width, `${id} has space in the preview`).toBeGreaterThan(0);
  expect(await project.evaluate(node => node.ownerDocument.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport + 1);
  switch (id) {
    case 'container': {
      const parent = await box(project);
      const rem = await project.evaluate(node => parseFloat(getComputedStyle(node.ownerDocument.documentElement).fontSize));
      expect(root.width).toBeLessThanOrEqual(36 * rem + 1);
      if (wide) expect(root.width).toBeCloseTo(36 * rem, 0);
      expect(root.x + root.width / 2).toBeCloseTo(parent.x + parent.width / 2, 0);
      await expect(component).toHaveCSS('padding-inline-start', wide ? '16px' : '8px');
      break;
    }
    case 'stack': {
      const panels = component.locator('.layout-panel');
      await expect(panels).toHaveCount(3);
      const first = await box(panels.nth(0)), second = await box(panels.nth(1));
      expect(second.y - first.bottom).toBeCloseTo(wide ? 16 : 8, 0);
      expect(second.x).toBeCloseTo(first.x, 0);
      break;
    }
    case 'inline': {
      await expect(component).toHaveCSS('flex-wrap', 'wrap');
      await expect(component).toHaveCSS('gap', '8px');
      const badges = component.locator('.hw-badge');
      await expect(badges).toHaveCount(3);
      const first = await box(badges.first()), next = await box(badges.nth(1));
      expect(first.y).toBeCloseTo(next.y, 0);
      expect(rtl ? first.x - next.right : next.x - first.right).toBeCloseTo(8, 0);
      break;
    }
    case 'grid':
    case 'columns': {
      const panels = component.locator('.layout-panel');
      await expect(panels).toHaveCount(id === 'grid' ? 3 : 2);
      const count = await component.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(/\s+/).length);
      expect(count).toBe(wide ? (id === 'grid' ? 3 : 2) : 1);
      const first = await box(panels.first()), last = await box(panels.last());
      if (wide) expect(first.y).toBeCloseTo(last.y, 0);
      else expect(last.y).toBeGreaterThanOrEqual(first.bottom);
      break;
    }
    case 'sidebar': {
      const sidebar = await box(component.locator('[data-layout-slot="sidebar"]'));
      const content = await box(component.locator('[data-layout-slot="content"]'));
      if (wide) {
        expect(sidebar.y).toBeCloseTo(content.y, 0);
        expect(sidebar.width).toBeCloseTo(160, 0);
        expect(rtl ? content.x - sidebar.right : sidebar.x - content.right).toBeCloseTo(12, 0);
      } else expect(content.y - sidebar.bottom).toBeCloseTo(12, 0);
      break;
    }
    case 'center': {
      const panel = await box(component.locator('.layout-panel'));
      expect(panel.x + panel.width / 2).toBeCloseTo(root.x + root.width / 2, 0);
      expect(panel.y + panel.height / 2).toBeCloseTo(root.y + root.height / 2, 0);
      break;
    }
    case 'spacer': {
      const row = project.locator('.hw-inline');
      const first = await box(row.locator('strong')), last = await box(row.locator(':scope > span').last());
      const separation = rtl ? first.x - last.right : last.x - first.right;
      expect(root.width).toBeGreaterThan((await box(row)).width / 3);
      expect(separation).toBeGreaterThanOrEqual(root.width);
      await expect(component).toHaveAttribute('aria-hidden', 'true');
      break;
    }
    case 'aspect-ratio': {
      expect(root.width / root.height).toBeCloseTo(16 / 9, 2);
      await expect(component.getByRole('img')).toHaveAccessibleName(/.+/);
      break;
    }
    case 'section': {
      await expect(component).toHaveAccessibleName(rtl ? 'قبل التقديم' : 'Before you apply');
      expect(await component.evaluate(node => node.localName)).toBe('section');
      await expect(component).toHaveCSS('padding-block-start', wide ? '24px' : '12px');
      break;
    }
    case 'app-shell': {
      const main = component.getByRole('main');
      await expect(project.getByRole('main')).toHaveCount(1);
      await expect(component.getByRole('banner')).toHaveCount(1);
      await expect(component.getByRole('contentinfo')).toHaveCount(1);
      await expect(main.getByRole('heading', {level: 1})).toHaveCount(1);
      const aside = await box(component.getByRole('complementary')), content = await box(main);
      if (wide) expect(aside.y).toBeCloseTo(content.y, 0);
      else expect(content.y).toBeGreaterThanOrEqual(aside.bottom - 1);
      await expect(component.locator('[data-layout-slot="sidebar"]')).toBeVisible();
      break;
    }
    case 'page-header': {
      await expect(component.locator(':scope > nav[data-layout-slot="breadcrumb"]')).toHaveAccessibleName(rtl ? 'مسار التنقل' : 'Breadcrumb');
      await expect(component.getByRole('heading', {level: 1})).toHaveCount(1);
      await expect(component.locator('.hw-page-header-actions').getByRole('button')).toBeVisible();
      break;
    }
  }
}

const projects = [
  ['react', 'javascript', 'en'], ['react', 'typescript', 'ar'],
  ['vue', 'javascript', 'ar'], ['vue', 'typescript', 'en'], ['angular', 'typescript', 'ar'],
] as const;

for (const [framework, language, locale] of projects) {
  test(`twelve ${framework} ${language} layout projects render and reflow in ${locale}`, async ({page}) => {
    test.setTimeout(600000);
    await page.addInitScript(locale => {
      if (window === window.top) localStorage.setItem('hawiyah-locale', locale);
    }, locale);
    for (const id of layouts) await test.step(id, async () => {
      await page.goto(`/#component/${id}`);
      await page.locator('[data-guide-tab="playground"]').click();
      await page.locator('[data-project-framework]').selectOption(framework);
      if (framework !== 'angular') await page.locator('[data-project-language]').selectOption(language);
      await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 45000});
      const frame = page.frameLocator('.hw-ide-frame');
      const project = frame.locator(`[data-layout-project="${id}"]`);
      await expect(project).toHaveCount(1);
      await expect(page.locator('[data-ide-editor="html"] .cm-content')).toContainText(`@hawiyah/${framework}`);
      await frameWidth(page, project, 390);
      await geometry(id, project, false, locale === 'ar');
      if (id === 'grid') {
        await frameWidth(page, project, 700);
        expect(await project.locator('.hw-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(/\s+/).length)).toBe(2);
      }
      await frameWidth(page, project, 1100);
      await geometry(id, project, true, locale === 'ar');
      if (id === 'page-header') {
        const action = project.getByRole('button'), details = project.locator('[data-layout-details]');
        await expect(details).toBeHidden();
        await action.press('Enter');
        await expect(action).toHaveAttribute('aria-expanded', 'true');
        await expect(details).toBeVisible();
        await action.press('Space');
        await expect(action).toHaveAttribute('aria-expanded', 'false');
        await expect(details).toBeHidden();
      }
      if (id === 'app-shell') {
        const main = project.getByRole('main'), skip = project.locator('.hw-skip-link');
        await expect(main).toHaveAttribute('id', 'service-workspace');
        await expect(main).toHaveAttribute('tabindex', '-1');
        await expect(skip).toHaveAttribute('href', '#service-workspace');
        await skip.focus(); await skip.press('Enter');
        await expect(main).toBeFocused();
        expect(await project.evaluate(node => node.ownerDocument.defaultView!.location.hash)).toBe('');
      }
      await expect(page).toHaveURL(new RegExp(`#component/${id}$`));
      await expect(page.locator('.hw-ide-console')).not.toContainText(/Failed to resolve component|\[error\]/);
    });
  });
}

test('Angular AppShell omits empty regions from desktop layout and keyboard navigation', async ({page}) => {
  test.setTimeout(90000);
  await page.goto('/#component/app-shell');
  await page.locator('[data-guide-tab="playground"]').click();
  await page.locator('[data-project-framework]').selectOption('angular');
  await expect(page.locator('.hw-ide-status')).toHaveAttribute('data-state', 'ready', {timeout: 45000});
  await page.locator('[data-ide-file="html"]').click();
  const code = page.locator('[data-ide-editor="html"] .cm-content');
  await code.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(`import {Component} from '@angular/core';
import {HwAppShellComponent} from '@hawiyah/angular';
@Component({selector:'app-root',standalone:true,imports:[HwAppShellComponent],template:'<div class="demo" data-bare-shell><hw-app-shell skipLabel="انتقل إلى المحتوى"><h1>طلبات الخدمة</h1></hw-app-shell></div>'})
export class AppComponent {}`);
  await page.locator('[data-ide-run]').click();
  const project = page.frameLocator('.hw-ide-frame').locator('[data-bare-shell]');
  await expect(project).toBeVisible({timeout: 45000});
  await frameWidth(page, project, 1100);
  const shell = project.locator('.hw-app-shell');
  expect(await shell.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(/\s+/).length)).toBe(1);
  await expect(shell.getByRole('banner')).toHaveCount(0);
  await expect(shell.getByRole('complementary')).toHaveCount(0);
  await expect(shell.getByRole('contentinfo')).toHaveCount(0);
  const main = shell.getByRole('main');
  await expect(main).toHaveAttribute('id', 'main-content');
  const skip = shell.getByRole('link', {name: 'انتقل إلى المحتوى'});
  await skip.focus(); await skip.press('Enter');
  await expect(main).toBeFocused();
});
