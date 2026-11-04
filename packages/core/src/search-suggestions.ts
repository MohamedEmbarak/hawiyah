export interface SearchSuggestionSegment { text: string; match: boolean }
export interface SearchSuggestionMatch { value: string; segments: SearchSuggestionSegment[] }

const arabicMark = /[\u064B-\u065F\u0670\u06D6-\u06ED]/u;
const alef = /[\u0622\u0623\u0625\u0671]/gu;

/** Keep UTF-16 offsets into the original value while folding only search text. */
function mappedSearchText(value: string) {
  let text = '', position = 0;
  const ranges: Array<{start: number; end: number}> = [];
  for (const character of value) {
    const start = position;
    position += character.length;
    if (arabicMark.test(character)) {
      // A trailing Arabic vowel belongs to its preceding displayed letter.
      const previous = ranges[ranges.length - 1];
      if (previous) for (let i = ranges.length - 1; i >= 0 && ranges[i]!.start === previous.start; i--) ranges[i]!.end = position;
      continue;
    }
    const folded = character.toLowerCase().replace(alef, '\u0627');
    text += folded;
    for (let i = 0; i < folded.length; i++) ranges.push({start, end: position});
  }
  return {text, ranges};
}

/** Local contains matching; returned segments are text, never HTML or markup. */
export function getSearchSuggestions(query: string, suggestions: readonly string[], limit = 8): SearchSuggestionMatch[] {
  const cap = Number.isNaN(limit) ? 8 : Math.max(0, Math.min(100, Math.floor(limit)));
  const normalized = mappedSearchText(query.trim()).text;
  if (!normalized || !cap) return [];
  const seen = new Set<string>(), matches: SearchSuggestionMatch[] = [];
  for (const value of suggestions) {
    if (typeof value !== 'string' || !value || seen.has(value)) continue;
    seen.add(value);
    const candidate = mappedSearchText(value);
    const index = candidate.text.indexOf(normalized);
    if (index < 0) continue;
    const start = candidate.ranges[index]!.start;
    const end = candidate.ranges[index + normalized.length - 1]!.end;
    const segments: SearchSuggestionSegment[] = [];
    if (start) segments.push({text: value.slice(0, start), match: false});
    segments.push({text: value.slice(start, end), match: true});
    if (end < value.length) segments.push({text: value.slice(end), match: false});
    matches.push({value, segments});
    if (matches.length >= cap) break;
  }
  return matches;
}

/** Route Escape from a search input to its native modal's cancelable close request. */
export function requestSearchDialogClose(input: HTMLInputElement): boolean {
  const dialog = input.closest<HTMLDialogElement>('dialog[open]');
  if (!dialog || dialog.getAttribute('closedby')?.toLowerCase() === 'none') return false;
  try { if (!dialog.matches(':modal')) return false; } catch { return false; }
  if (typeof dialog.requestClose === 'function') {
    // Omitting a return value preserves the existing dialog returnValue.
    dialog.requestClose();
    return true;
  }
  const EventType = dialog.ownerDocument.defaultView?.Event;
  if (!EventType) return false;
  const allowed = dialog.dispatchEvent(new EventType('cancel', {cancelable: true}));
  if (allowed && dialog.open) dialog.close();
  return true;
}
