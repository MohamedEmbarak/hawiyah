// The exception and override lists that are the lead's (leadAmendments A4 of
// milestone 5): exclusions.json and defaults.json of step 30, TARGET_OVERRIDES
// and VUE_SLOT_PATTERNS of targets.mjs, scripts/content/arabic-exceptions.json
// (HWC-PAR8) and scripts/page-guards/latin-allowlist.json (HWP-LATIN). Every
// entry carries approvedBy and a reason; one page has at most
// MAX_ENTRIES_PER_PAGE entries over all lists together (an exclusions entry
// counts each attribute it names, an override counts once, and an allow-list
// entry without pages counts for every page). Writers propose entries in their
// result files; scripts/api-tables/test/lists.test.mjs runs this check.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TARGET_OVERRIDES, VUE_SLOT_PATTERNS } from './targets.mjs';

export const MAX_ENTRIES_PER_PAGE = 5;

const filled = (value) => typeof value === 'string' && value.trim() !== '';

/** Page id of a docs path ('docs/components/tabs.ar.md' -> 'tabs'), or null. */
function pageOf(path) {
  const match = /(?:^|\/)([a-z0-9-]+)(?:\.ar)?\.md$/.exec(String(path));
  if (match) return match[1];
  const route = /components\/([a-z0-9-]+)/.exec(String(path));
  return route ? route[1] : null;
}

/**
 * Checks the lists and counts their entries per page.
 * @param {{ exclusions: any, defaults: any, targetOverrides: any, slotPatterns: any, arabic: any[], latin: any[] }} lists
 * @returns {{ problems: string[], perPage: Map<string, { count: number, entries: string[] }> }}
 */
export function checkLeadLists(lists) {
  const problems = [];
  const perPage = new Map();
  const count = (id, label) => {
    if (!perPage.has(id)) perPage.set(id, { count: 0, entries: [] });
    const entry = perPage.get(id);
    entry.count += 1;
    entry.entries.push(label);
  };
  const needs = (where, entry) => {
    if (!filled(entry?.approvedBy)) problems.push(`${where} has no approvedBy`);
    if (!filled(entry?.reason)) problems.push(`${where} has no reason`);
  };

  for (const [id, frameworks] of Object.entries(lists.exclusions?.components ?? {})) {
    for (const [framework, entry] of Object.entries(frameworks)) {
      const where = `scripts/api-tables/exclusions.json ${id}.${framework}`;
      needs(where, entry);
      for (const key of ['nativeAttributes', 'notListed']) {
        for (const [name, reason] of Object.entries(entry?.[key] ?? {})) {
          if (!filled(reason)) problems.push(`${where}.${key}.${name} has no reason`);
          count(id, `exclusions.json ${framework}.${key}.${name}`);
        }
      }
    }
  }
  (lists.defaults?.entries ?? []).forEach((entry, index) => {
    const where = `scripts/api-tables/defaults.json entry ${index + 1} (${entry?.id}.${entry?.name})`;
    needs(where, entry);
    count(entry?.id ?? '(no id)', `defaults.json ${entry?.framework}.${entry?.name}`);
  });
  for (const [id, entry] of Object.entries(lists.targetOverrides ?? {})) {
    needs(`scripts/api-tables/targets.mjs TARGET_OVERRIDES.${id}`, entry);
    count(id, 'TARGET_OVERRIDES');
  }
  for (const [id, entries] of Object.entries(lists.slotPatterns ?? {})) {
    entries.forEach((entry, index) => {
      needs(`scripts/api-tables/targets.mjs VUE_SLOT_PATTERNS.${id}[${index}]`, entry);
      if (!filled(entry?.name) || !filled(entry?.expression)) problems.push(`scripts/api-tables/targets.mjs VUE_SLOT_PATTERNS.${id}[${index}] needs a name and an expression`);
      count(id, `VUE_SLOT_PATTERNS ${entry?.name}`);
    });
  }
  (lists.arabic ?? []).forEach((entry, index) => {
    needs(`scripts/content/arabic-exceptions.json entry ${index + 1}`, entry);
    count(pageOf(entry?.file) ?? '(no page)', `arabic-exceptions.json "${entry?.text}"`);
  });
  (lists.latin ?? []).forEach((entry, index) => {
    needs(`scripts/page-guards/latin-allowlist.json entry ${index + 1}`, entry);
    const pages = Array.isArray(entry?.pages) && entry.pages.length ? entry.pages.map(pageOf).filter(Boolean) : ['(every page)'];
    for (const page of new Set(pages)) count(page, `latin-allowlist.json "${entry?.text}"`);
  });
  const global = perPage.get('(every page)')?.count ?? 0;
  for (const [id, entry] of perPage) {
    const total = id === '(every page)' ? entry.count : entry.count + global;
    if (total > MAX_ENTRIES_PER_PAGE) {
      problems.push(`page ${id} has ${total} entries in the lead's exception and override lists (${entry.entries.join('; ')}); at most ${MAX_ENTRIES_PER_PAGE} are allowed`);
    }
  }
  return { problems, perPage };
}

/** Reads the six lists of the guide. */
export function readLeadLists(guideDir) {
  const json = (...path) => JSON.parse(readFileSync(join(guideDir, ...path), 'utf8'));
  return {
    exclusions: json('scripts', 'api-tables', 'exclusions.json'),
    defaults: json('scripts', 'api-tables', 'defaults.json'),
    targetOverrides: TARGET_OVERRIDES,
    slotPatterns: VUE_SLOT_PATTERNS,
    arabic: json('scripts', 'content', 'arabic-exceptions.json'),
    latin: json('scripts', 'page-guards', 'latin-allowlist.json'),
  };
}
