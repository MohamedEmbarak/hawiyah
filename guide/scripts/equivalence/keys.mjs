// The keyboard rule of step 80 (5a.8, leadAmendments A1 and A2; HWE-KEYS).
//
// Scope: every component whose page targets a controller factory of the
// installed @hawiyah/vanilla (targets.mjs). For each page and language in scope, the
// keys of its keyboard table (the manifest of step 20) equal the union of the keys
// that the steps of the checks its groups name declare; a key that cannot be pressed
// in a sandboxed frame is an entry { component, key, reason, approvedBy } of
// keyboard-exceptions.json. An entry { component, reason, reference, approvedBy }
// leaves a component out of that binding (its outcomes are not checked): its page
// keeps its keyboard table, its groups name no check, and step 80 prints one line for
// it (uncheckedLine). Every step has an expect function
// (the chained oracle of G6 of the 5a fix round); a step that declares keys has a
// one-line outcome and the reference it is taken from; the harness requires each
// step to press exactly the keys it declares, counted from the trusted keydown
// events of the frame.

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { KEY_NAMES } from '../content/config.mjs';
import { targetsFor } from '../api-tables/targets.mjs';

export const KEYBOARD_EXCEPTIONS_FILE = new URL('./keyboard-exceptions.json', import.meta.url);

/** The page file of a component in a language, as the failure lines name it. */
const pageFile = (id, lang) => `docs/components/${id}${lang === 'ar' ? '.ar' : ''}.md`;

/** A key id or chord ('Shift+Tab') is made of ids of KEY_NAMES. */
export const isKey = (key) => typeof key === 'string' && key.split('+').every((part) => Object.hasOwn(KEY_NAMES, part));

/** The written name of a key or chord in a language ('Right Arrow', 'Shift + Tab'). */
export const keyName = (key, lang = 'en') => key.split('+').map((part) => KEY_NAMES[part]?.[lang] ?? part).join(' + ');

/** The two forms of an entry of keyboard-exceptions.json, by their sorted fields. */
const KEY_ENTRY = ['approvedBy', 'component', 'key', 'reason'];
const COMPONENT_ENTRY = ['approvedBy', 'component', 'reason', 'reference'];

/**
 * The errors of the form of keyboard-exceptions.json (the lead's list, A4). An entry
 * is one of two forms, with non-empty string values:
 *   { component, key, reason, approvedBy }        accepts one documented key without
 *                                                 a step (a key a sandboxed frame cannot press);
 *   { component, reason, reference, approvedBy }  leaves the component out of the rule
 *                                                 that binds its keyboard table to checks:
 *                                                 its table is written from the package
 *                                                 READMEs (reference: '@hawiyah/<name>
 *                                                 README.md: "<sentence>"' or a CHANGELOG.md
 *                                                 entry), read by the reviewer, and its
 *                                                 outcomes are not checked.
 */
export function keyboardExceptionErrors(list) {
  const at = 'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1:';
  if (!Array.isArray(list)) return [`${at} the file must hold an array`];
  const errors = [];
  list.forEach((entry, index) => {
    const fields = Object.keys(entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {}).sort();
    const form = [KEY_ENTRY, COMPONENT_ENTRY].find((item) => item.join() === fields.join());
    if (!form || fields.some((field) => typeof entry[field] !== 'string' || entry[field].trim() === '')) {
      errors.push(`${at} entry ${index + 1} must be { component, key, reason, approvedBy } (a key without a step) or { component, reason, reference, approvedBy } (a component whose keyboard outcomes are not checked), with non-empty values`);
      return;
    }
    if (form === KEY_ENTRY && !isKey(entry.key)) errors.push(`${at} entry ${index + 1}: ${entry.key} is not a key of KEY_NAMES`);
  });
  return errors;
}

/** Reads keyboard-exceptions.json and throws with the errors of its form (keyboardExceptionErrors). */
export function readKeyboardExceptions(file = KEYBOARD_EXCEPTIONS_FILE) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  const errors = keyboardExceptionErrors(list);
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return list;
}

/** The line step 80 prints for each page whose keyboard outcomes a keyboard-exceptions.json entry leaves unchecked. */
export const uncheckedLine = (id) => `keyboard outcomes not checked: ${id}`;

/**
 * Ids of components.json whose page targets a controller factory that the
 * installed @hawiyah/vanilla exports, with the names: Map id -> ['createTabs'].
 * The package is imported from <guideDir>/node_modules (it evaluates no browser
 * global), else from the guide of this script.
 */
export async function keyboardScope({ guideDir, componentsFile }) {
  const own = join(guideDir, 'node_modules', '@hawiyah', 'vanilla', 'package.json');
  const require = createRequire(existsSync(own) ? own : new URL('../../package.json', import.meta.url));
  const manifest = require.resolve('@hawiyah/vanilla/package.json');
  const entry = JSON.parse(readFileSync(manifest, 'utf8')).exports?.['.']?.import ?? './dist/index.js';
  const vanilla = await import(pathToFileURL(join(dirname(manifest), entry)).href);
  const factories = new Set(Object.keys(vanilla).filter((name) => /^create[A-Z]/.test(name) && typeof vanilla[name] === 'function'));
  const catalogue = JSON.parse(readFileSync(componentsFile, 'utf8'));
  const scope = new Map();
  for (const entry of catalogue.components ?? []) {
    const names = targetsFor(entry.id).vanilla.filter((name) => factories.has(name));
    if (names.length > 0) scope.set(entry.id, names);
  }
  return scope;
}

/**
 * HWE-KEYS lines for a check that is not of the form of README.md (G6 of the 5a fix
 * round): a check without read and assert, or without its negative control
 * ({ fixture, wrong }); a step without expect (every step returns the state the
 * oracle expects after it, so that the next step is chained to it); a step that
 * declares keys without an outcome or a reference, or with a key outside KEY_NAMES.
 */
export function stepErrors(check) {
  const errors = [];
  const file = `HWE-KEYS scripts/equivalence/checks/${check.name}.mjs:1`;
  if (typeof check.read !== 'function' || typeof check.assert !== 'function') errors.push(`${file}: the check has no read(mount) and assert(observed, expected) of its frames`);
  if (typeof check.negative?.fixture !== 'string' || check.negative.fixture.trim() === '' || typeof check.negative?.wrong !== 'function') {
    errors.push(`${file}: the check has no negative control { fixture, wrong }: the markup that scripts/equivalence/test/negative.test.mjs renders with @hawiyah/vanilla, and a deliberately wrong oracle under which every keyed step must fail`);
  }
  for (const step of check.steps) {
    const at = `${file}: step ${step.name}`;
    if (typeof step.expect !== 'function') errors.push(`${at} has no expect: every step returns the state the oracle expects after it, from the state it expected before`);
    if (step.keys === undefined) continue;
    if (!Array.isArray(step.keys) || step.keys.length === 0) {
      errors.push(`${at} declares keys that are not a non-empty list`);
      continue;
    }
    for (const key of step.keys) if (!isKey(key)) errors.push(`${at} declares the key ${key}, which is not a key id of KEY_NAMES in scripts/content/config.mjs`);
    if (typeof step.outcome !== 'string' || step.outcome.trim() === '') errors.push(`${at} declares keys without a one-line outcome`);
    if (typeof step.reference !== 'string' || step.reference.trim() === '') errors.push(`${at} declares keys without the reference of its outcome (the WAI-ARIA Authoring Practices pattern, CONTRACT.md or CHANGELOG.md)`);
  }
  return errors;
}

/**
 * The keyboard rule over the pages of a run. Returns { errors, report, unchecked },
 * where report lists per page and language each table row with the steps that press
 * its keys (the check report prints them beside the row) and unchecked the ids of the
 * pages whose keyboard outcomes an entry { component, reason, reference, approvedBy }
 * leaves unchecked. Such a page keeps its keyboard table (the form of HWC-KEYS; a
 * missing table fails here), and its groups name no check: an entry for a page whose
 * groups name checks fails, and so does an entry that matches no page (knownPages:
 * the ids of every page that exists, the pages of the run by default; an entry of a
 * page outside the run is not judged otherwise). referenceError(reference) returns
 * the problem of the entry's reference, or null.
 * @param {{ pages: any[], checks: Map<string, any>, scope: Map<string, string[]>, exceptions: any[], knownPages?: Iterable<string>, referenceError?: (reference: string) => string | null }} input
 *   pages: manifest pages; checks: every check their groups name, loaded.
 */
export function keyboardRule({ pages, checks, scope, exceptions, knownPages = null, referenceError = () => null }) {
  const errors = [];
  const report = [];
  const unchecked = [];
  const usedExceptions = new Set();
  for (const page of pages) {
    const left = exceptions.find((entry) => entry.component === page.id && entry.key === undefined);
    const controller = scope.has(page.id);
    const bound = controller && !left;
    const names = [...new Set((page.liveGroups ?? []).flatMap((group) => (group.check ? group.check.split(',') : [])))];
    const steps = names.flatMap((name) => (checks.get(name)?.steps ?? []).filter((step) => Array.isArray(step.keys)).map((step) => ({ check: name, step })));
    const pressed = new Map();
    for (const item of steps) for (const key of item.step.keys) pressed.set(key, [...(pressed.get(key) ?? []), item]);
    if (controller && left) unchecked.push(page.id);
    for (const lang of page.langs ?? []) {
      const table = page.keyboard?.[lang] ?? null;
      const file = pageFile(page.id, lang);
      const line = table?.line ?? 1;
      if (controller && !table) {
        errors.push(`HWE-KEYS ${file}:1: ${page.id} has a controller (${scope.get(page.id).join(', ')}), so the Accessibility section has the keyboard table "${lang === 'ar' ? 'جدول: ' : 'Table: '}..." ${left ? 'written from the READMEs of the installed packages (scripts/equivalence/keyboard-exceptions.json leaves its outcomes unchecked, not the table)' : 'whose keys the checks of its groups press'}`);
        continue;
      }
      if (!bound) {
        if (table) report.push({ page: page.id, lang, bound: false, reason: left && controller ? `keyboard outcomes not checked, keyboard-exceptions.json: ${left.reason}` : 'no controller of @hawiyah/vanilla', caption: table.caption, rows: table.rows.map((row) => ({ ...row, steps: [] })) });
        continue;
      }
      const documented = new Set(table.rows.flatMap((row) => row.keys));
      const excused = new Set(exceptions.filter((entry) => entry.component === page.id && entry.key !== undefined).map((entry) => entry.key));
      for (const row of table.rows) {
        for (const key of row.keys) {
          if (!pressed.has(key) && excused.has(key)) usedExceptions.add(`${page.id} ${key}`);
          if (!pressed.has(key) && !excused.has(key)) {
            errors.push(`HWE-KEYS ${file}:${line}: the keyboard table documents ${keyName(key, lang)} ("${row.action}"), which no step of the checks ${names.join(', ') || '(none)'} presses; write a step that presses it and asserts the outcome, or propose a keyboard-exceptions.json entry`);
          }
        }
      }
      for (const [key, items] of pressed) {
        if (!documented.has(key)) {
          errors.push(`HWE-KEYS ${file}:${line}: the step ${items.map((item) => `${item.check}/${item.step.name}`).join(', ')} presses ${keyName(key, lang)}, which the keyboard table does not document`);
        }
      }
      report.push({
        page: page.id, lang, bound: true, caption: table.caption,
        rows: table.rows.map((row) => ({
          ...row,
          steps: row.keys.flatMap((key) => (pressed.get(key) ?? []).map((item) => ({ check: item.check, step: item.step.name, key, outcome: item.step.outcome, reference: item.step.reference }))),
        })),
      });
    }
  }
  // An entry that matches nothing fails (G16 of the 5a fix round): an entry for a key that a
  // table of the page documents and no step presses, or for a component in the rule's scope.
  const existing = new Set(knownPages ?? pages.map((page) => page.id));
  exceptions.forEach((entry, index) => {
    const at = `HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry ${index + 1} (${entry.component}${entry.key ? ` ${entry.key}` : ''})`;
    if (entry.key === undefined) {
      if (!existing.has(entry.component)) {
        errors.push(`${at} matches no page: docs/components/ has no page ${entry.component}; remove it`);
        return;
      }
      const problem = typeof entry.reference === 'string' ? referenceError(entry.reference) : null;
      if (problem) errors.push(`${at}: the reference ${problem}`);
    }
    const page = pages.find((item) => item.id === entry.component);
    if (!page) return;
    if (entry.key === undefined && !scope.has(entry.component)) errors.push(`${at} matches nothing: ${entry.component} has no controller of @hawiyah/vanilla, so the rule does not bind its page; remove it`);
    if (entry.key === undefined && scope.has(entry.component)) {
      const named = [...new Set((page.liveGroups ?? []).flatMap((group) => (group.check ? group.check.split(',') : [])))];
      if (named.length > 0) errors.push(`${at} leaves the keyboard outcomes of ${entry.component} unchecked, but its groups name the checks ${named.join(', ')}; a component with checks is bound to them, so remove the entry`);
    }
    if (entry.key !== undefined && !usedExceptions.has(`${entry.component} ${entry.key}`)) errors.push(`${at} matches nothing: no keyboard table of the page documents ${keyName(entry.key)} without a step that presses it; remove it`);
  });
  return { errors, report, unchecked };
}

/** The lines of the check report: each table row (its keys joined by the comma of the page's language), then the steps that press its keys with their outcome. */
export function keyboardReportLines(report) {
  const lines = [];
  for (const table of report) {
    lines.push(`keyboard: ${table.page}/${table.lang} "${table.caption}"${table.bound ? '' : ` (not bound: ${table.reason})`}`);
    for (const row of table.rows) {
      lines.push(`  ${row.keys.map((key) => keyName(key, table.lang)).join(table.lang === 'ar' ? '، ' : ', ')} | ${row.action}`);
      for (const step of row.steps) lines.push(`    ${step.check}/${step.step} presses ${keyName(step.key)}: ${step.outcome} [${step.reference}]`);
    }
  }
  return lines;
}
