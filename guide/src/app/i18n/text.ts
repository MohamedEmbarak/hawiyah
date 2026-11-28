/** The two languages of the guide; the first route segment names one of them. */
export type Lang = 'ar' | 'en';

export const LANGS = ['ar', 'en'] as const;

export const DEFAULT_LANG: Lang = 'ar';

/** One dictionary per language. Both must have exactly the keys of T. */
export type Texts<T> = { readonly [L in Lang]: T };

/** The dictionary of one language. */
export function pick<T>(texts: Texts<T>, lang: Lang): T {
  return texts[lang];
}

export function isLang(value: unknown): value is Lang {
  return value === 'ar' || value === 'en';
}

export function dirOf(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Arabic script (U+0600 to U+06FF), used by the parity specs. */
export const ARABIC_SCRIPT = /[؀-ۿ]/;
