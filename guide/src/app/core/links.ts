import { Lang, isLang } from '../i18n/text';

/** Normalises a page path relative to '<lang>/': no leading slash, a trailing '/' unless empty. */
export function pagePath(path: string): string {
  const trimmed = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `${trimmed}/` : '';
}

/** Base-relative href of a page: page('en', 'components') is 'en/components/'. */
export function page(lang: Lang, path = ''): string {
  return `${lang}/${pagePath(path)}`;
}

/** Splits a router URL ('/en/components?x#y') into its language and the page path after it. */
export function parseUrl(url: string): { lang: Lang | null; path: string } {
  const pathname = url.split(/[?#]/)[0] ?? '';
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (!isLang(first)) return { lang: null, path: pagePath(segments.join('/')) };
  return { lang: first, path: pagePath(segments.slice(1).join('/')) };
}

/** The same page in the other language: '/en/components' gives 'ar/components/'. */
export function otherLanguage(url: string): string {
  const { lang, path } = parseUrl(url);
  return page(lang === 'en' ? 'ar' : 'en', lang ? path : '');
}

/** An external address; only absolute https URLs are accepted. */
export function external(url: string): string {
  if (!/^https:\/\/[^\s/]+/.test(url)) throw new Error(`Not an absolute https URL: ${url}`);
  return url;
}

export const PROJECT_LINKS = {
  repository: external('https://github.com/MohamedEmbarak/hawiyah'),
  packages: external('https://www.npmjs.com/org/hawiyah'),
  changelog: external('https://github.com/MohamedEmbarak/hawiyah/blob/main/CHANGELOG.md'),
  licence: external('https://github.com/MohamedEmbarak/hawiyah/blob/main/LICENSE'),
} as const;

/** Base-relative href of the notices file written by build step 70. */
export const NOTICES_HREF = 'NOTICE.txt';
