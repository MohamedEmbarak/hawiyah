import { normalizeSearch } from './search.js';

export interface TypeaheadOptions {
  /** Milliseconds after the last key before the typed text is forgotten. Default 500. */
  timeout?: number;
}
export interface Typeahead {
  /** Adds `key` to the typed text and returns the index of the entry to focus, or -1.
   * `labels` are the visible texts in visual order; `current` is the focused index or -1. */
  next(key: string, labels: readonly string[], current: number, isDisabled?: (index: number) => boolean): number;
  /** Forgets the typed text and stops the timer. Call when the list closes or is destroyed. */
  reset(): void;
}

/** Whether a key event types one character: a single code point, not a space, without Ctrl, Meta or Alt.
 * Callers return first while `event.isComposing`. */
export function isTypeaheadKey(event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }): boolean {
  return [...event.key].length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;
}

/** Type-ahead for a list with roving focus. Holds no DOM reference and starts its timer only in `next`,
 * so an instance may be created during server rendering. */
export function createTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const timeout = options.timeout ?? 500;
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } };
  return {
    next(key, labels, current, isDisabled) {
      const typed = normalizeSearch(key);
      if (!typed) return -1;
      buffer += typed;
      stop();
      timer = setTimeout(() => { buffer = ''; timer = undefined; }, timeout);
      const characters = [...buffer];
      // A repeated letter cycles through the entries that start with it.
      const search = characters.every(character => character === characters[0]) ? characters[0]! : buffer;
      const count = labels.length;
      const start = Number.isInteger(current) && current >= 0 && current < count ? current : -1;
      for (let offset = 1; offset <= count; offset++) {
        const index = (start + offset) % count;
        if (!isDisabled?.(index) && normalizeSearch(labels[index] ?? '').startsWith(search)) return index;
      }
      return -1;
    },
    reset() { buffer = ''; stop(); },
  };
}
