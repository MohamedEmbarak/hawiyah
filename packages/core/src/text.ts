// Hawiyah ships no user-visible or accessible-name strings. Every such string is
// supplied by the application; these helpers report a missing one during development.
declare const process: { env: { NODE_ENV?: string } } | undefined;

type Console = { warn(message: string): void };
const reported = new Set<string>();

/** Development unless a bundler replaced `process.env.NODE_ENV` with 'production'.
 * `globalThis.__HAWIYAH_DEV__` (boolean) overrides the check for pages without a bundler. */
function development(): boolean {
  const flag = (globalThis as { __HAWIYAH_DEV__?: unknown }).__HAWIYAH_DEV__;
  if (typeof flag === 'boolean') return flag;
  try { return typeof process === 'undefined' || process.env.NODE_ENV !== 'production'; } catch { return true; }
}

/** True for text that can be rendered: a string with a non-space character, a finite
 * number, a function (templated text), or any other non-empty rendered value. */
export function hasText(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === true) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.some(hasText);
  return true;
}

/** Returns whether `value` is usable text. When it is not, warns once per
 * component and input in development and stays silent in production builds.
 * It never substitutes a string: the caller renders nothing in its place. */
export function requireText(component: string, name: string, value: unknown, when?: string): boolean {
  if (hasText(value)) return true;
  if (!development()) return false;
  const key = `${component}\u0000${name}`;
  if (reported.has(key)) return false;
  reported.add(key);
  const output = (globalThis as { console?: Console }).console;
  output?.warn(`Hawiyah: ${component} requires "${name}"${when ? ` when ${when}` : ''}. Hawiyah ships no built-in strings, so the application supplies this text; nothing is rendered in its place.`);
  return false;
}

/** Forgets which warnings were already reported. Intended for tests. */
export function resetTextWarnings(): void {
  reported.clear();
}

/** Fills `{name}` placeholders in an application-supplied template, for adapters that
 * read templated text from markup (`data-hw-page-label="Page {page}"`). Unknown
 * placeholders are kept as written; no words are added. */
export function formatTextTemplate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (token, name: string) => Object.hasOwn(values, name) ? String(values[name]) : token);
}
