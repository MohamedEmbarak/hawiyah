// Run after building the workspace packages: node tests/browser/framework-calendars.mjs
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { formatCalendarDate } from '../../packages/core/dist/index.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const examples = [{ name: 'react', port: 4174 }, { name: 'angular', port: 4175 }, { name: 'vue', port: 4176 }].filter(example => !process.argv[2] || process.argv[2] === example.name);
if (!examples.length) throw new Error('Optional framework must be react, angular or vue.');
const servers = [];
let browser;
const responds = async url => { try { return (await fetch(url)).ok; } catch { return false; } };
try {
  for (const example of examples) {
    example.url = `http://127.0.0.1:${example.port}`;
    if (await responds(example.url)) continue;
    const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--strictPort', '--port', String(example.port), '--config', `examples/${example.name}/vite.config.ts`], { cwd: root, stdio: 'pipe' });
    servers.push(server);
    let logs = ''; server.stdout.on('data', chunk => { logs += chunk; }); server.stderr.on('data', chunk => { logs += chunk; });
    await expect.poll(async () => { if (server.exitCode !== null) throw new Error(logs); return responds(example.url); }, { timeout: 30000 }).toBe(true);
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.HAWIYAH_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  for (const example of examples) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(example.url);
    if (example.name === 'react') { await page.getByRole('button', { name: 'English', exact: true }).click(); await page.getByRole('button', { name: 'Change page direction', exact: true }).click(); }
    if (example.name === 'vue') { await page.locator('.settings select').nth(0).selectOption('en'); await page.locator('.settings select').nth(1).selectOption('ltr'); }
    const showcase = page.getByTestId('calendar-showcase');
    await expect(showcase.getByRole('heading', { name: 'Your appointment, in either calendar' })).toBeVisible();
    const grid = showcase.locator('.hw-grid');
    await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(/\s+/u).length)).toBe(2);
    const date = showcase.locator('input[type=text]');
    const open = showcase.getByRole('button', { name: 'Open calendar', exact: true });
    const dialog = page.getByRole('dialog', { name: 'Choose appointment date', exact: true });
    const system = (value) => dialog.locator(`input[value="${value}"]`);
    const canonicalInput = showcase.locator('.hw-date-picker > input[type=hidden]');
    const canonical = (value, calendar, locale = 'en-SA') => formatCalendarDate(value, { calendar, locale, dateStyle: 'full' });
    const labelParts = label => (label?.match(/[\p{L}\p{N}]+/gu) ?? []).sort();
    const checkDayLabel = async (button, value) => expect.poll(async () => labelParts(await button.getAttribute('aria-label'))).toEqual(labelParts(canonical(value, 'islamic-umalqura')));
    await expect(canonicalInput).toHaveValue('2024-03-11');
    await expect(showcase.getByTestId('date-hijri')).toHaveText(canonical('2024-03-11', 'islamic-umalqura'));
    await expect(showcase.getByTestId('date-gregorian')).toHaveText(canonical('2024-03-11', 'gregory'));
    await open.click(); await expect(dialog).toBeVisible(); expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);
    await system('islamic-umalqura').check(); await expect(canonicalInput).toHaveValue('2024-03-11');
    let selected = dialog.getByRole('gridcell', { selected: true }).locator('button');
    await checkDayLabel(selected, '2024-03-11');
    await dialog.getByRole('button', { name: 'Next month', exact: true }).click();
    await page.keyboard.press('Escape'); await open.click();
    selected = dialog.getByRole('gridcell', { selected: true }).locator('button');
    await checkDayLabel(selected, '2024-03-11');
    await selected.focus(); await selected.press('ArrowRight'); await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible(); await expect(canonicalInput).toHaveValue('2024-03-12');
    await expect(showcase.getByTestId('date-hijri')).toHaveText(canonical('2024-03-12', 'islamic-umalqura'));
    await open.click(); await system('gregory').check(); await page.keyboard.press('Escape');
    await date.fill('1900-01-01'); await expect.poll(() => date.evaluate(element => element.checkValidity())).toBe(true);
    await open.click(); await system('islamic-umalqura').check(); await expect(canonicalInput).toHaveValue('1900-01-01');
    await expect.poll(() => date.evaluate(element => element.checkValidity())).toBe(false);
    await expect(dialog.locator('bdi[dir=ltr]')).toHaveCount(2);
    await page.keyboard.press('Escape'); await showcase.getByRole('button', { name: 'Check date', exact: true }).click();
    await expect(showcase.getByTestId('date-check')).toBeEmpty();
    await open.click(); await system('gregory').check(); await page.keyboard.press('Escape');
    await expect.poll(() => date.evaluate(element => element.checkValidity())).toBe(true);
    await showcase.getByRole('button', { name: 'Check date', exact: true }).click();
    await expect(showcase.getByTestId('date-check')).toHaveText('The date is valid for the selected calendar.');
    await date.fill('2024-03-11');
    if (example.name === 'react') { await page.getByRole('switch', { name: 'Dark mode', exact: true }).check(); await page.getByRole('button', { name: 'Change page direction', exact: true }).click(); }
    if (example.name === 'vue') { await page.locator('.settings select').nth(3).selectOption('dark'); await page.locator('.settings select').nth(1).selectOption('rtl'); }
    if (example.name === 'angular') { await page.locator('select#mode').selectOption('dark'); await page.getByRole('button', { name: 'العربية', exact: true }).click(); }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(/\s+/u).length)).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const picker = showcase.locator('.hw-date-picker');
      const output = picker.locator('.hw-date-picker-value');
      const inputGroup = picker.locator('.hw-date-picker-control');
      const fieldBounds = await inputGroup.boundingBox(); const triggerBounds = await picker.locator('.hw-date-picker-trigger').boundingBox();
      expect(triggerBounds.x).toBeGreaterThanOrEqual(fieldBounds.x);
      expect(triggerBounds.x + triggerBounds.width).toBeLessThanOrEqual(fieldBounds.x + fieldBounds.width + 1);
      await picker.locator('button[aria-haspopup="dialog"]').click();
      const popup = page.getByRole('dialog');
      await expect(popup.locator('.hw-dialog-header h2')).toBeVisible();
      await popup.evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
      const bounds = await popup.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      expect(await popup.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      expect(await popup.locator('.hw-calendar-day').first().evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      await page.keyboard.press('Escape');
      await expect(picker.locator('button[aria-haspopup="dialog"]')).toBeFocused();
    }
    const violations = (await new AxeBuilder({ page }).include('[data-testid="calendar-showcase"]').withTags(['wcag2a', 'wcag2aa']).analyze()).violations;
    expect(violations).toEqual([]); expect(errors).toEqual([]);
    console.log(`${example.name}: calendar switching, canonical labels, keyboard selection, reopening, invalid-range submission, mobile RTL/dark layout and scoped axe passed`);
    await context.close();
  }
} finally {
  await browser?.close();
  for (const server of servers) server.kill('SIGTERM');
}
