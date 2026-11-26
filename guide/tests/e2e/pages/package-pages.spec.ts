import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, hydrated, presetMode } from '../support/fixtures';
import { languagePages, type Lang } from '../support/routes';

// The brand page and the foundations page, generated at build time from the installed
// packages (build step 32): what they show is compared with the files of
// guide/node_modules/@hawiyah. Axe in both colour modes at 1280 and 390 px and the
// overflow checks run on them through shell/a11y.spec.ts, which the first test proves.

const modules = join(process.cwd(), 'node_modules', '@hawiyah');
const texts = JSON.parse(readFileSync(join(process.cwd(), 'src', 'app', 'i18n', 'package-pages.json'), 'utf8')) as Record<'brand' | 'foundations', { title: Record<Lang, string>; sections: Record<string, Record<Lang, string>> }>;
const provenance = JSON.parse(readFileSync(join(modules, 'styles', 'dist', 'assets', 'icons', 'provenance.json'), 'utf8')) as { icons: { name: string }[] };
const sha = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');
const installed = (file: string): string => sha(readFileSync(join(modules, 'styles', 'dist', 'assets', file)));
const LANGS: Lang[] = ['ar', 'en'];

test('the brand and foundations pages are among the prerendered pages of the suites over every page', () => {
  const routes = languagePages.map((doc) => doc.route);
  for (const lang of LANGS) expect(routes).toEqual(expect.arrayContaining([`${lang}/brand`, `${lang}/foundations`]));
});

for (const lang of LANGS) {
  test(`${lang}/brand/: the wordmark files of @hawiyah/styles on their surfaces, byte for byte`, async ({ page, request }) => {
    await page.goto(`${lang}/brand/`);
    await hydrated(page);
    await expect(page.locator('h1')).toHaveText(texts.brand.title[lang]);
    await expect(page.locator('main article > h2')).toHaveText(['wordmark', 'loader', 'usage'].map((id) => texts.brand.sections[id]![lang]));
    const surfaces = page.locator('.surface');
    await expect(surfaces).toHaveCount(2);
    await expect(surfaces.nth(0)).toHaveAttribute('data-hw-mode', 'light');
    await expect(surfaces.nth(1)).toHaveAttribute('data-hw-mode', 'dark');
    const images = page.locator('.surface img');
    const sources = await images.evaluateAll((list) => list.map((image) => (image as HTMLImageElement).getAttribute('src') ?? ''));
    expect(sources).toEqual(['brand/hawiyah-wordmark.svg', 'brand/hawiyah-wordmark-mono.svg', 'brand/hawiyah-wordmark-reverse.svg', 'brand/hawiyah-wordmark-white.svg']);
    for (const [index, src] of sources.entries()) {
      await expect.poll(() => images.nth(index).evaluate((image) => (image as HTMLImageElement).naturalWidth), src).toBeGreaterThan(0);
      expect(sha(await (await request.get(src)).body()), src).toBe(installed(src.slice('brand/'.length)));
    }
    await expect(page.locator('figcaption code')).toHaveText(sources.map((src) => src.slice('brand/'.length)));
  });

  test(`${lang}/brand/: the loader of @hawiyah/styles follows the colour mode and reduced motion`, async ({ page, request }) => {
    for (const [mode, shown, hidden] of [['light', 'light', 'dark'], ['dark', 'dark', 'light']] as const) {
      await presetMode(page, mode);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(`${lang}/brand/`);
      await hydrated(page);
      const loader = page.locator('.hw-brand-loader');
      await expect(loader.locator(`.hw-brand-loader-${shown} .hw-brand-loader-motion`)).toBeVisible();
      await expect(loader.locator(`.hw-brand-loader-${hidden} img`).first()).toBeHidden();
      await expect(loader.locator(`.hw-brand-loader-${shown} .hw-brand-loader-static`)).toBeHidden();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(loader.locator(`.hw-brand-loader-${shown} .hw-brand-loader-static`)).toBeVisible();
      await expect(loader.locator(`.hw-brand-loader-${shown} .hw-brand-loader-motion`)).toBeHidden();
    }
    for (const file of ['hawiyah-loader.gif', 'hawiyah-loader-white.gif']) expect(sha(await (await request.get(`brand/${file}`)).body()), file).toBe(installed(file));
  });

  test(`${lang}/brand/: the usage notes are the README section of the installed @hawiyah/styles, marked as English`, async ({ page }) => {
    const readme = readFileSync(join(modules, 'styles', 'README.md'), 'utf8');
    const version = (JSON.parse(readFileSync(join(modules, 'styles', 'package.json'), 'utf8')) as { version: string }).version;
    await page.goto(`${lang}/brand/`);
    await hydrated(page);
    const notes = page.locator('.notes');
    await expect(notes).toHaveAttribute('lang', 'en');
    await expect(notes).toHaveAttribute('dir', 'ltr');
    await expect(notes.locator('p').first()).toHaveText('The package also exports the Arabic-only outlined logo and transparent loaders:');
    expect(readme).toContain('The package also exports the Arabic-only outlined logo and transparent loaders:');
    await expect(notes.locator('pre code').first()).toContainText("import wordmark from '@hawiyah/styles/assets/hawiyah-wordmark.svg';");
    await expect(page.locator('#usage + p')).toContainText(version);
  });

  test(`${lang}/foundations/: the tokens of @hawiyah/tokens in the light and the dark mode and the icons of @hawiyah/styles`, async ({ page }) => {
    const tokens = (await import(join(modules, 'tokens', 'dist', 'index.js'))) as {
      themes: { dga: Record<'light' | 'dark', { color: Record<string, string> }> };
      tokens: Record<string, Record<string, string | number>>;
      tokenNames: Record<string, Record<string, string>>;
    };
    await page.goto(`${lang}/foundations/`);
    await hydrated(page);
    await expect(page.locator('h1')).toHaveText(texts.foundations.title[lang]);
    await expect(page.locator('main article > h2')).toHaveText(['colour', 'spacing', 'type', 'radius', 'motion', 'icons'].map((id) => texts.foundations.sections[id]![lang]));
    const tables = page.locator('main table');
    await expect(tables).toHaveCount(5);
    const colour = tables.nth(0).locator('tbody tr');
    const keys = Object.keys(tokens.themes.dga.light.color);
    await expect(colour).toHaveCount(keys.length);
    for (const index of [0, Math.floor(keys.length / 2), keys.length - 1]) {
      const key = keys[index]!;
      await expect(colour.nth(index).locator('td')).toHaveText([tokens.tokenNames['color']![key]!, tokens.themes.dga.light.color[key]!, tokens.themes.dga.dark.color[key]!]);
    }
    const groups = [['space'], ['font', 'text', 'weight', 'leading'], ['radius'], ['duration', 'ease']];
    for (const [index, list] of groups.entries()) {
      const rows = list.flatMap((group) => Object.entries(tokens.tokens[group]!).map(([key, value]) => [tokens.tokenNames[group]![key]!, String(value)]));
      const body = tables.nth(index + 1).locator('tbody tr');
      await expect(body).toHaveCount(rows.length);
      await expect(body.first().locator('td')).toHaveText(rows[0]!);
      await expect(body.last().locator('td')).toHaveText(rows[rows.length - 1]!);
    }
    const icons = page.locator('.icons .hw-icon');
    await expect(icons).toHaveCount(provenance.icons.length);
    await expect(page.locator('.icons code')).toHaveText(provenance.icons.map((icon) => icon.name).sort());
    const masks = await icons.evaluateAll((list) => list.map((icon) => getComputedStyle(icon).maskImage || getComputedStyle(icon).getPropertyValue('-webkit-mask-image')));
    expect(masks.filter((mask) => !mask || mask === 'none')).toEqual([]);
  });
}

for (const lang of LANGS) {
  test(`keyboard path through the footer to the foundations and the brand page (${lang})`, async ({ page }) => {
    await page.goto(`${lang}/components/`);
    await hydrated(page);
    for (const [name, route] of [[lang === 'ar' ? 'الأسس' : 'Foundations', 'foundations'], [lang === 'ar' ? 'العلامة' : 'Brand', 'brand']] as const) {
      const link = page.locator('hw-portal-footer').getByRole('link', { name, exact: true });
      await link.focus();
      await expect(link).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/${lang}/${route}/?$`));
      await expect(page.locator('h1')).toBeFocused();
    }
  });
}
