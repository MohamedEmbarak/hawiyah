import { describe, expect, it } from 'vitest';
import { ARABIC_SCRIPT } from '../../i18n/text';
import { catalogueTexts } from './i18n';
import { feature } from './feature';

describe('catalogue texts', () => {
  it('have the same keys and no empty value', () => {
    expect(Object.keys(catalogueTexts.ar).sort()).toEqual(Object.keys(catalogueTexts.en).sort());
    for (const lang of ['ar', 'en'] as const) {
      for (const [key, text] of Object.entries(catalogueTexts[lang])) expect(text.trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it('write every Arabic value in Arabic script', () => {
    for (const [key, text] of Object.entries(catalogueTexts.ar)) expect(ARABIC_SCRIPT.test(text), key).toBe(true);
    expect(ARABIC_SCRIPT.test(feature.nav?.label.ar ?? '')).toBe(true);
  });

  it('registers the components route, its server route and the header entry', async () => {
    expect(feature.routes.map((route) => route.path)).toEqual(['components']);
    const server = feature.serverRoutes(['ar', 'en']);
    expect(server.map((route) => route.path)).toEqual(['components']);
    const route = server[0] as { getPrerenderParams?: () => Promise<Record<string, string>[]> };
    expect(await route.getPrerenderParams?.()).toEqual([{ lang: 'ar' }, { lang: 'en' }]);
    expect(feature.nav).toEqual({ path: 'components/', label: { en: 'Components', ar: 'المكوّنات' }, header: true, footer: true });
  });
});
