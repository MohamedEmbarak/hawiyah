import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { CanMatchFn, ResolveFn, UrlSegment } from '@angular/router';
import { DEFAULT_LANG, Lang, dirOf, isLang } from '../i18n/text';

export const LANG_STORAGE_KEY = 'hawiyah-guide-lang';

/**
 * The language of the current route. apply() sets html lang and dir through
 * DOCUMENT, so prerendered documents carry them; package components inherit both
 * from html and receive no lang or dir input.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  readonly lang = signal<Lang>(DEFAULT_LANG);
  readonly dir = computed(() => dirOf(this.lang()));

  apply(lang: Lang): void {
    this.lang.set(lang);
    const html = this.document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', dirOf(lang));
  }

  /** Stores the reader's language; called in the browser only (after render). */
  remember(lang: Lang): void {
    try {
      this.document.defaultView?.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage may be unavailable; the route still names the language.
    }
  }
}

/** Matches the ':lang' route only for 'ar' and 'en'. */
export const langSegment: CanMatchFn = (_route, segments: UrlSegment[]) => isLang(segments[0]?.path);

/** Runs during the server render and on every language change in the browser. */
export const localeResolver: ResolveFn<Lang> = (route) => {
  const value = route.paramMap.get('lang');
  const lang = isLang(value) ? value : DEFAULT_LANG;
  inject(LocaleService).apply(lang);
  return lang;
};
