import { requireLocale } from './locale.js';

export { getCalendarMonth, moveCalendarDate, isDateInRange, formatCalendarDate } from './calendar.js';
export type { CalendarSystem, CalendarDay, CalendarMonth, CalendarMonthOptions, CalendarDateFormatOptions } from './calendar.js';
export { normalizeDigits, clampRange, sortRows } from './controls.js';
export { SaudiUmalquraCalendar, getCalendarDateParts, convertCalendarDate, isCalendarDateSupported, UMALQURA_MIN_DATE, UMALQURA_MAX_DATE } from './saudi-calendar.js';
export type { CalendarDateParts } from './saudi-calendar.js';

export * from './layout.js';
export { createAccordionMotion } from './accordion-motion.js';
export type { AccordionMotion } from './accordion-motion.js';
export type Direction = 'ltr' | 'rtl';
export type Orientation = 'horizontal' | 'vertical';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Fold search text only; never apply to user-visible labels or stored values. */
export function normalizeSearch(value: string): string {
  return value.normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu, '')
    .replace(/[\u0622\u0623\u0625\u0671]/gu, '\u0627')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/gu, ' ');
}

export function filterOptions<T extends Option>(options: readonly T[], query: string): T[] {
  const normalized = normalizeSearch(query);
  return options.filter(option => normalizeSearch(option.label).includes(normalized));
}

export function getNextEnabledIndex(
  current: number,
  key: string,
  items: readonly { disabled?: boolean }[],
  direction: Direction = 'ltr',
  orientation: Orientation = 'horizontal',
): number {
  const count = items.length;
  if (!count || items.every(item => item.disabled)) return -1;
  let delta: number;
  let start: number;
  if (key === 'Home') { delta = 1; start = -1; }
  else if (key === 'End') { delta = -1; start = count; }
  else {
    if (orientation === 'vertical') {
      if (key !== 'ArrowDown' && key !== 'ArrowUp') return current;
      delta = key === 'ArrowDown' ? 1 : -1;
    } else {
      if (key !== 'ArrowRight' && key !== 'ArrowLeft') return current;
      delta = (key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1);
    }
    start = !Number.isInteger(current) || current < 0 || current >= count ? (delta === 1 ? -1 : count) : current;
  }
  for (let offset = 1; offset <= count; offset++) {
    const candidate = ((start + delta * offset) % count + count) % count;
    if (!items[candidate]?.disabled) return candidate;
  }
  return -1;
}

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** BCP 47 tag, or a priority list of tags, handed to Intl. There is no default. */
  locale: string | string[];
}

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  /** BCP 47 tag, or a priority list of tags, handed to Intl. There is no default. */
  locale: string | string[];
}

/** Formats with the caller's locale and Latin digits. Throws a TypeError without a locale. */
export function formatNumber(value: number | bigint, options: NumberFormatOptions): string {
  const { locale, ...format } = options ?? {};
  requireLocale('formatNumber', locale);
  return new Intl.NumberFormat(locale, { ...format, numberingSystem: 'latn' }).format(value);
}

/** Formats an instant with the caller's locale and Latin digits. Throws a TypeError without a locale.
 * The Gregorian calendar and the Asia/Riyadh time zone are defaults of the helper, not locale choices. */
export function formatDate(value: Date | number | string, options: DateFormatOptions): string {
  const { locale, calendar = 'gregory', timeZone = 'Asia/Riyadh', ...format } = options ?? {};
  requireLocale('formatDate', locale);
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { calendar, timeZone, ...format, numberingSystem: 'latn' }).format(date);
}

/** State for a local, single-select, manually committed editable combobox. */
export interface ComboboxState {
  readonly value: string;
  readonly query: string;
  readonly open: boolean;
  /** Index in getComboboxOptions(state, options), never the unfiltered source array. */
  readonly activeIndex: number;
}

export type ComboboxEvent =
  | { type: 'input'; query: string }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'navigate'; key: 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' }
  | { type: 'select'; value: string }
  | { type: 'reset'; value?: string };

export function createComboboxState(options: readonly Option[], value = ''): ComboboxState {
  const selected = options.find(option => option.value === value && !option.disabled);
  return { value: selected?.value ?? '', query: selected?.label ?? '', open: false, activeIndex: -1 };
}

/** A committed label is display text, not a search query, until the user edits. */
export function getComboboxOptions<T extends Option>(state: ComboboxState, options: readonly T[]): T[] {
  return state.value ? [...options] : filterOptions(options, state.query);
}

/** Shared transitions; adapters own event bindings, rendering, and form integration. */
export function transitionCombobox(
  state: ComboboxState,
  event: ComboboxEvent,
  options: readonly Option[],
): ComboboxState {
  switch (event.type) {
    case 'input': return { value: '', query: event.query, open: true, activeIndex: -1 };
    case 'close': return { ...state, open: false, activeIndex: -1 };
    case 'open': return { ...state, open: true, activeIndex: -1 };
    case 'reset': return createComboboxState(options, event.value);
    case 'select': {
      const selected = options.find(option => option.value === event.value && !option.disabled);
      return selected ? { value: selected.value, query: selected.label, open: false, activeIndex: -1 } : state;
    }
    case 'navigate': return {
      ...state,
      open: true,
      activeIndex: getNextEnabledIndex(state.activeIndex, event.key, getComboboxOptions(state, options), 'ltr', 'vertical'),
    };
  }
}

export interface CleanupScope {
  readonly destroyed: boolean;
  add(cleanup: () => void): () => void;
  listen(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions): () => void;
  destroy(): void;
}

/** A per-instance cleanup bag. No browser access occurs until listen is called. */
export function createCleanup(): CleanupScope {
  let destroyed = false;
  const cleanups = new Set<() => void>();
  const add = (cleanup: () => void): (() => void) => {
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      cleanups.delete(once);
      cleanup();
    };
    if (destroyed) once(); else cleanups.add(once);
    return once;
  };
  return {
    get destroyed() { return destroyed; },
    add,
    listen(target, type, listener, options) {
      if (destroyed) return () => {};
      target.addEventListener(type, listener, options);
      return add(() => target.removeEventListener(type, listener, options));
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      let firstError: unknown;
      let failed = false;
      for (const cleanup of [...cleanups].reverse()) {
        try { cleanup(); } catch (error) { if (!failed) firstError = error; failed = true; }
      }
      if (failed) throw firstError;
    },
  };
}

export function getDirection(element: Element): Direction {
  const computed = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (computed === 'rtl' || computed === 'ltr') return computed;
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
}

export function isDisabled(element: Element): boolean {
  return element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true' || element.hasAttribute('disabled');
}

export function restoreFocus(element: HTMLElement | null | undefined): boolean {
  if (!element?.isConnected || isDisabled(element) || element.closest('[hidden], [inert]')) return false;
  element.focus({ preventScroll: true });
  return element.ownerDocument.activeElement === element;
}
export { observeFieldValue } from './field-value.js';
export { observeReadonlyChoice } from './readonly-choice.js';
export type { FieldValueElement, FieldValueObserver } from './field-value.js';

export * from './site-verification.js';
export { normalizeRatingMax, normalizeRatingValue } from './rating.js';
export { getPaginationItems, normalizePaginationTotal, normalizePaginationPage } from './pagination.js';
export type { PaginationItem } from './pagination.js';
export { observeTabOverflow, getTabOverflowIndices } from './tab-overflow.js';
export type { TabOverflowObserver, TabOverflowOptions } from './tab-overflow.js';
export { observeContentNavigation } from './content-navigation.js';
export type { ContentNavigationItem, ContentNavigationOptions, ContentNavigationObserver } from './content-navigation.js';
export { getSearchSuggestions, requestSearchDialogClose } from './search-suggestions.js';
export type { SearchSuggestionMatch, SearchSuggestionSegment } from './search-suggestions.js';
export { prepareToastDismissFocus } from './toast-focus.js';
export { hasText, requireText, resetTextWarnings, formatTextTemplate } from './text.js';
export { getFragmentHref, getFragmentId, bindFragmentLink } from './fragment-link.js';
export type { FragmentLink, FragmentLinkOptions } from './fragment-link.js';

export { fileUploadProgress } from './file-upload-state.js';
export type { FileUploadItem, FileUploadLabels } from './file-upload-state.js';
