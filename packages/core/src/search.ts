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
