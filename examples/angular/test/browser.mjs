import { existsSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const origin = process.env.NASAQ_ANGULAR_URL || 'http://127.0.0.1:4175';
const server = process.env.NASAQ_ANGULAR_URL ? null : spawn(`${root}node_modules/.bin/vite`, ['--config', 'examples/angular/vite.config.ts', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], {cwd: root, stdio: 'pipe'});
let browser;
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(origin)).ok) break; } catch {}
    if (attempt === 99) throw new Error('Angular example did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({executablePath: process.env.NASAQ_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await expect(page.getByRole('heading', {name: 'Make room for community.'})).toBeVisible();
  await expect(page.locator('.example-shell')).toHaveAttribute('data-nq-theme', 'dga');
  if (process.env.NASAQ_ANGULAR_SCREENSHOT) await page.screenshot({path: process.env.NASAQ_ANGULAR_SCREENSHOT, fullPage: true});
  await page.getByLabel('Event name', {exact:true}).fill('Neighborhood gathering');
  const city = page.getByRole('combobox', {name:'City', exact:true});
  await city.fill('الرِّياض'); await city.press('ArrowDown'); await city.press('Enter');
  await expect(city).toHaveValue('الرياض · Riyadh');
  await page.locator('#theme').selectOption('nasaq');
  await expect(page.locator('.example-shell')).toHaveAttribute('data-nq-theme', 'nasaq');
  await expect(city).toHaveValue('الرياض · Riyadh');
  await page.locator('#theme').selectOption('dga');
  await page.getByLabel('Event type', {exact:true}).selectOption('outdoor');
  await expect(page.getByText('For outdoor events, include your safety plan and accessible entry route.')).toBeVisible();
  await page.getByLabel('I have checked these details and they are accurate.', {exact:true}).check();
  const review = page.getByRole('button', {name:'Review application',exact:true});
  await review.click();
  const dialog = page.getByRole('dialog', {name:'Review your application'});
  await expect(dialog).toBeVisible();
  if (!await dialog.evaluate(element => element.matches(':modal'))) throw new Error('Dialog did not use native showModal');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(review).toBeFocused();
  await review.click(); await page.getByRole('button', {name:'Confirm demo request',exact:true}).click();
  await expect(page.getByText('Your demo request is ready')).toBeVisible();
  await page.getByRole('tab', {name:'My requests',exact:true}).click();
  await expect(page.getByRole('cell', {name:'Neighborhood gathering',exact:true})).toBeVisible();
  await page.getByRole('button', {name:'العربية',exact:true}).click();
  await expect(page.locator('.example-shell')).toHaveAttribute('dir','rtl');
  await page.locator('#theme').selectOption('dga'); await page.locator('#mode').selectOption('dark');
  await expect(page.locator('.example-shell')).toHaveAttribute('data-nq-mode','dark');
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('tab', {name: 'طلب جديد', exact:true}).click();
  await expect(page.locator('.nq-stepper-mobile')).toBeVisible();
  await expect(page.locator('.nq-stepper-responsive .nq-stepper')).not.toBeVisible();
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Example overflows at mobile width');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Angular browser proof passed: native form, Arabic combobox, conditional flow, native modal/Escape/focus, request state, RTL/theme/mobile.');
} finally {
  await browser?.close(); server?.kill('SIGTERM');
}
