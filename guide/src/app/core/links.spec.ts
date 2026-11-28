import { describe, expect, it } from 'vitest';
import { external, otherLanguage, page, pagePath, parseUrl } from './links';

describe('links', () => {
  it('builds base-relative page hrefs ending in a slash', () => {
    expect(page('en')).toBe('en/');
    expect(page('ar', 'components')).toBe('ar/components/');
    expect(page('en', '/components/button/')).toBe('en/components/button/');
    expect(pagePath('')).toBe('');
  });

  it('parses router URLs', () => {
    expect(parseUrl('/en/components?x=1#main')).toEqual({ lang: 'en', path: 'components/' });
    expect(parseUrl('/ar')).toEqual({ lang: 'ar', path: '' });
    expect(parseUrl('/404')).toEqual({ lang: null, path: '404/' });
  });

  it('swaps the language of the current page', () => {
    expect(otherLanguage('/en/components')).toBe('ar/components/');
    expect(otherLanguage('/ar/components/button/reference/')).toBe('en/components/button/reference/');
    expect(otherLanguage('/ar')).toBe('en/');
    expect(otherLanguage('/en/components#usage')).toBe('ar/components/');
    expect(otherLanguage('/')).toBe('en/');
  });

  it('accepts only absolute https addresses as external', () => {
    expect(external('https://github.com/MohamedEmbarak/hawiyah')).toBe('https://github.com/MohamedEmbarak/hawiyah');
    expect(() => external('http://example.org')).toThrow();
    expect(() => external('en/components/')).toThrow();
  });
});
