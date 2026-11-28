// The evidence panel of a component page. Step 20
// writes it into the page model from the component's entry in components.json
// (built and verified adapters, each evidence entry, the notes) and from what is
// open: every entry of "Known defects in <pin>" in CHANGELOG.md that names the
// component, and every entry of scripts/equivalence/known-differences.json for
// it (shown under the Known defects entry it cites), the
// entry of scripts/equivalence/keyboard-exceptions.json that leaves its keyboard
// outcomes unchecked, and the kinds of evidence that some built adapters have and
// others do not. Pages do
// not restate evidence or keep a list of open items by hand. The two
// headings of the panel come from src/app/i18n/evidence-headings.json, so step 20
// can add them to the headings of the page (the content navigation lists them).

import { existsSync, readFileSync } from 'node:fs';

export const EVIDENCE_HEADINGS = JSON.parse(readFileSync(new URL('../../src/app/i18n/evidence-headings.json', import.meta.url), 'utf8'));
/** Ids of the two headings of the panel, the same in both languages. */
export const EVIDENCE_IDS = { evidence: 'evidence-recorded', open: 'evidence-open' };
const KNOWN_DIFFERENCES_FILE = new URL('../equivalence/known-differences.json', import.meta.url);
const KEYBOARD_EXCEPTIONS_FILE = new URL('../equivalence/keyboard-exceptions.json', import.meta.url);

/**
 * Whether an entry { component, reason, reference, approvedBy } of
 * keyboard-exceptions.json leaves the keyboard outcomes of the component unchecked
 * (an entry with a key excuses one key only and adds no open item).
 */
export function keyboardUnchecked(id, exceptions) {
  return Array.isArray(exceptions) && exceptions.some((item) => item && item.component === id && item.key === undefined);
}

/** The text of a CHANGELOG entry as inlines: text and inline code (the entries use no other markup). */
export function entryInlines(text) {
  return text.split(/(`[^`]+`)/).filter(Boolean).map((part) => (part.startsWith('`') && part.endsWith('`') && part.length > 2
    ? { type: 'inlineCode', value: part.slice(1, -1) }
    : { type: 'text', value: part }));
}

/**
 * The entries of "#### Known defects in <version>" under "## <version>" of a
 * CHANGELOG text: one string per list item, its lines joined.
 */
export function knownDefects(changelog, version) {
  const lines = String(changelog ?? '').split('\n');
  const start = lines.findIndex((line) => line === `## ${version}` || line.startsWith(`## ${version} `));
  if (start === -1) return [];
  const heading = lines.findIndex((line, index) => index > start && /^#{3,6} Known defects in /.test(line) && line.endsWith(` ${version}`));
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  if (heading === -1 || (end !== -1 && heading > end)) return [];
  const items = [];
  for (const line of lines.slice(heading + 1)) {
    if (/^#{1,6} /.test(line)) break;
    if (/^- /.test(line)) items.push(line.slice(2).trim());
    else if (/^\s+\S/.test(line) && items.length > 0) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}

/** Whether a CHANGELOG entry names the component: its components.json name, or that name as one word (ContentNavigation), as a whole word. */
export function namesComponent(text, name) {
  const pascal = name.split(/\s+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  const forms = [...new Set([name, pascal])].map((form) => form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<![A-Za-z0-9])(?:${forms.join('|')})(?![A-Za-z0-9])`).test(text);
}

let changelogCache = null;
/** The repository CHANGELOG.md and known-differences.json, read once. */
function sources(repoDir) {
  if (!changelogCache || changelogCache.repoDir !== repoDir) {
    const file = `${repoDir}/CHANGELOG.md`;
    changelogCache = {
      repoDir,
      changelog: existsSync(file) ? readFileSync(file, 'utf8') : '',
      differences: JSON.parse(readFileSync(KNOWN_DIFFERENCES_FILE, 'utf8')),
      keyboard: JSON.parse(readFileSync(KEYBOARD_EXCEPTIONS_FILE, 'utf8')),
    };
  }
  return changelogCache;
}

/** The pinned version of the installed packages (guide/package.json). */
export function pinnedVersion() {
  return JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).dependencies['@hawiyah/styles'];
}

/** The quoted text of a known difference's source ('CHANGELOG.md, <version>, <section>: <text>'), or null. */
export function citedText(source) {
  const match = /^CHANGELOG\.md, [^,]+, [^:]+: (.+)$/s.exec(String(source ?? ''));
  return match ? match[1].trim() : null;
}

/**
 * The kinds of evidence that some built adapters of a component have and others do
 * not: [{ kind, adapters }] with the built adapters, in
 * the order of `built`, that hold no entry of that kind, in the order the kinds
 * first occur. Only adapters that components.json records as built are counted.
 */
export function evidenceGaps(built, entries) {
  const kinds = [...new Set(entries.map((item) => item.kind))];
  return kinds.flatMap((kind) => {
    const have = new Set(entries.filter((item) => item.kind === kind).map((item) => item.adapter));
    const missing = built.filter((adapter) => !have.has(adapter));
    return missing.length > 0 ? [{ kind, adapters: missing }] : [];
  });
}

/**
 * The evidence data of a page: { name, built, verified, entries, gaps, notes, open,
 * version }. A documented difference whose source cites a Known defects entry of
 * the page is shown under that entry (its `differences`), not as an item of its
 * own. When an entry of keyboard-exceptions.json leaves
 * the keyboard outcomes of the component unchecked, the last open item is
 * { kind: 'keyboard' }: the panel states, in the page's language, that the keyboard
 * behaviour of the table is documented from the packages and not yet verified by the
 * checks of the guide. `repoDir` holds CHANGELOG.md; tests pass `changelog`,
 * `differences` and `keyboard` (the list of keyboard-exceptions.json) instead.
 */
export function evidenceOf({ id, entry, repoDir, version = pinnedVersion(), changelog, differences, keyboard }) {
  const read = changelog === undefined || differences === undefined ? sources(repoDir) : null;
  const exceptions = keyboard ?? (read ? read.keyboard : JSON.parse(readFileSync(KEYBOARD_EXCEPTIONS_FILE, 'utf8')));
  const defects = knownDefects(changelog ?? read.changelog, version).filter((text) => namesComponent(text, entry.name));
  const listed = (differences ?? read.differences).filter((item) => item.component === id);
  const difference = (item) => ({ kind: 'difference', id: item.id, aspect: item.aspect, text: entryInlines(item.description) });
  const citing = (text) => listed.filter((item) => citedText(item.source) !== null && text.includes(citedText(item.source)));
  const nested = new Set(defects.flatMap((text) => citing(text).map((item) => item.id)));
  const built = [...(entry.built ?? [])];
  const entries = (entry.evidence ?? []).map((item) => ({
    adapter: item.adapter, kind: item.kind, tests: [...(item.tests ?? [])], scope: item.scope,
    command: item.command, result: item.result, date: item.date, source: item.source,
  }));
  return {
    name: entry.name,
    built,
    verified: [...(entry.verified ?? [])],
    entries,
    gaps: evidenceGaps(built, entries),
    notes: [...(entry.notes ?? [])],
    version,
    open: [
      ...defects.map((text) => ({ kind: 'defect', text: entryInlines(text), differences: citing(text).map(difference) })),
      ...listed.filter((item) => !nested.has(item.id)).map(difference),
      ...(keyboardUnchecked(id, exceptions) ? [{ kind: 'keyboard' }] : []),
    ],
  };
}

/** The headings the panel adds after the last heading of the page (level 3, in the section Platforms Code reference). */
export function evidenceHeadings(lang) {
  return [
    { id: EVIDENCE_IDS.evidence, level: 3, text: EVIDENCE_HEADINGS[lang].evidence },
    { id: EVIDENCE_IDS.open, level: 3, text: EVIDENCE_HEADINGS[lang].open },
  ];
}
