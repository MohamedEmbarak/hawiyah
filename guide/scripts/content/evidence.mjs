// The evidence panel of a component page (5a.11, leadAmendments A13). Step 20
// writes it into the page model from the component's entry in components.json
// (built and verified adapters, each evidence entry, the notes) and from what is
// open: every entry of "Known defects in <pin>" in CHANGELOG.md that names the
// component, and every entry of scripts/equivalence/known-differences.json for
// it. Pages do not restate evidence or keep a list of open items by hand. The two
// headings of the panel come from src/app/i18n/evidence-headings.json, so step 20
// can add them to the headings of the page (the content navigation lists them).

import { existsSync, readFileSync } from 'node:fs';

export const EVIDENCE_HEADINGS = JSON.parse(readFileSync(new URL('../../src/app/i18n/evidence-headings.json', import.meta.url), 'utf8'));
/** Ids of the two headings of the panel, the same in both languages. */
export const EVIDENCE_IDS = { evidence: 'evidence-recorded', open: 'evidence-open' };
const KNOWN_DIFFERENCES_FILE = new URL('../equivalence/known-differences.json', import.meta.url);

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
    };
  }
  return changelogCache;
}

/** The pinned version of the installed packages (guide/package.json). */
export function pinnedVersion() {
  return JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).dependencies['@hawiyah/styles'];
}

/**
 * The evidence data of a page: { name, built, verified, entries, notes, open,
 * version }. `repoDir` holds CHANGELOG.md; tests pass `changelog` and
 * `differences` instead.
 */
export function evidenceOf({ id, entry, repoDir, version = pinnedVersion(), changelog, differences }) {
  const read = changelog === undefined || differences === undefined ? sources(repoDir) : null;
  const defects = knownDefects(changelog ?? read.changelog, version).filter((text) => namesComponent(text, entry.name));
  const listed = (differences ?? read.differences).filter((item) => item.component === id);
  return {
    name: entry.name,
    built: [...(entry.built ?? [])],
    verified: [...(entry.verified ?? [])],
    entries: (entry.evidence ?? []).map((item) => ({
      adapter: item.adapter, kind: item.kind, tests: [...(item.tests ?? [])], scope: item.scope,
      command: item.command, result: item.result, date: item.date, source: item.source,
    })),
    notes: [...(entry.notes ?? [])],
    version,
    open: [
      ...defects.map((text) => ({ kind: 'defect', text: entryInlines(text) })),
      ...listed.map((item) => ({ kind: 'difference', id: item.id, aspect: item.aspect, text: entryInlines(item.description) })),
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
