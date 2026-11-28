// Hawiyah chooses no locale. Every helper that calls Intl takes the BCP 47 tag from the
// caller and refuses to run without one, so nothing falls back to a built-in locale or
// to the locale of the host. This module is internal: adapters test for a missing
// locale with requireText(component, 'locale', locale) before they call a helper.

/** One BCP 47 tag, or a priority list of tags, as Intl accepts them. */
export type LocaleArgument = string | string[];

const usable = (tag: unknown): boolean => typeof tag === 'string' && tag.trim().length > 0;

/** Throws a developer diagnostic when the caller passed no locale. It never substitutes one. */
export function requireLocale(helper: string, locale: unknown): asserts locale is LocaleArgument {
  if (Array.isArray(locale) ? !locale.length || !locale.every(usable) : !usable(locale)) throw new TypeError(`Hawiyah: ${helper} requires a locale from the application. There is no default locale.`);
}
