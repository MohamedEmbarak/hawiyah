// The keyboard rule of step 80 (5a.8, leadAmendments A1 and A2; HWE-KEYS).
//
// Scope: every component whose page targets a controller factory of the
// installed @hawiyah/vanilla (targets.mjs), unless keyboard-exceptions.json leaves
// it out. For each page and language in scope, the keys of its keyboard table
// (the manifest of step 20) equal the union of the keys that the steps of the
// checks its groups name declare; a key that cannot be pressed in a sandboxed
// frame is an entry of keyboard-exceptions.json. A step that declares keys has
// an expect function, a one-line outcome and the reference it is taken from; the
// harness requires each step to press exactly the keys it declares.

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

/**
 * Reads keyboard-exceptions.json: [{ component, key?, reason, approvedBy }]. An
 * entry without key leaves the whole component out of the rule (A2); an entry
 * with key accepts that documented key without a step (a key a sandboxed frame
 * cannot press). The list is the lead's (A4).
 */
export function readKeyboardExceptions(file = KEYBOARD_EXCEPTIONS_FILE) {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error('keyboard-exceptions.json must hold an array');
  list.forEach((entry, index) => {
    const keys = Object.keys(entry ?? {}).sort();
    const allowed = ['approvedBy', 'component', 'key', 'reason'];
    const strings = keys.every((key) => typeof entry[key] === 'string' && entry[key].trim() !== '');
    if (!keys.includes('component') || !keys.includes('reason') || !keys.includes('approvedBy') || keys.some((key) => !allowed.includes(key)) || !strings) {
      throw new Error(`keyboard-exceptions.json entry ${index + 1} must be { component, key?, reason, approvedBy } with non-empty values`);
    }
    if (entry.key !== undefined && !isKey(entry.key)) throw new Error(`keyboard-exceptions.json entry ${index + 1}: ${entry.key} is not a key of KEY_NAMES`);
  });
  return list;
}

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

/** HWE-KEYS lines for steps that declare keys without an expect, an outcome or a reference, or with a key outside KEY_NAMES. */
export function stepErrors(check) {
  const errors = [];
  for (const step of check.steps) {
    const at = `HWE-KEYS scripts/equivalence/checks/${check.name}.mjs:1: step ${step.name}`;
    if (step.keys === undefined) continue;
    if (!Array.isArray(step.keys) || step.keys.length === 0) {
      errors.push(`${at} declares keys that are not a non-empty list`);
      continue;
    }
    for (const key of step.keys) if (!isKey(key)) errors.push(`${at} declares the key ${key}, which is not a key id of KEY_NAMES in scripts/content/config.mjs`);
    if (typeof step.expect !== 'function') errors.push(`${at} declares keys without expect: a step that presses a key asserts the documented outcome`);
    if (typeof step.outcome !== 'string' || step.outcome.trim() === '') errors.push(`${at} declares keys without a one-line outcome`);
    if (typeof step.reference !== 'string' || step.reference.trim() === '') errors.push(`${at} declares keys without the reference of its outcome (the WAI-ARIA Authoring Practices pattern, CONTRACT.md or CHANGELOG.md)`);
  }
  return errors;
}

/**
 * The keyboard rule over the pages of a run. Returns { errors, report }, where
 * report lists per page and language each table row with the steps that press
 * its keys (the check report prints them beside the row).
 * @param {{ pages: any[], checks: Map<string, any>, scope: Map<string, string[]>, exceptions: any[] }} input
 *   pages: manifest pages; checks: every check their groups name, loaded.
 */
export function keyboardRule({ pages, checks, scope, exceptions }) {
  const errors = [];
  const report = [];
  for (const page of pages) {
    const left = exceptions.find((entry) => entry.component === page.id && entry.key === undefined);
    const bound = scope.has(page.id) && !left;
    const names = [...new Set((page.liveGroups ?? []).flatMap((group) => (group.check ? group.check.split(',') : [])))];
    const steps = names.flatMap((name) => (checks.get(name)?.steps ?? []).filter((step) => Array.isArray(step.keys)).map((step) => ({ check: name, step })));
    const pressed = new Map();
    for (const item of steps) for (const key of item.step.keys) pressed.set(key, [...(pressed.get(key) ?? []), item]);
    for (const lang of page.langs ?? []) {
      const table = page.keyboard?.[lang] ?? null;
      const file = pageFile(page.id, lang);
      const line = table?.line ?? 1;
      if (!bound) {
        if (table) report.push({ page: page.id, lang, bound: false, reason: left ? `left out by keyboard-exceptions.json: ${left.reason}` : 'no controller of @hawiyah/vanilla', caption: table.caption, rows: table.rows.map((row) => ({ ...row, steps: [] })) });
        continue;
      }
      if (!table) {
        errors.push(`HWE-KEYS ${file}:1: ${page.id} has a controller (${scope.get(page.id).join(', ')}), so the Accessibility section has the keyboard table "${lang === 'ar' ? 'جدول: ' : 'Table: '}..." whose keys the checks of its groups press (or the lead lists the component in scripts/equivalence/keyboard-exceptions.json)`);
        continue;
      }
      const documented = new Set(table.rows.flatMap((row) => row.keys));
      const excused = new Set(exceptions.filter((entry) => entry.component === page.id && entry.key !== undefined).map((entry) => entry.key));
      for (const row of table.rows) {
        for (const key of row.keys) {
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
  return { errors, report };
}

/** The lines of the check report: each table row, then the steps that press its keys with their outcome. */
export function keyboardReportLines(report) {
  const lines = [];
  for (const table of report) {
    lines.push(`keyboard: ${table.page}/${table.lang} "${table.caption}"${table.bound ? '' : ` (not bound: ${table.reason})`}`);
    for (const row of table.rows) {
      lines.push(`  ${row.keys.map((key) => keyName(key, table.lang)).join(', ')} | ${row.action}`);
      for (const step of row.steps) lines.push(`    ${step.check}/${step.step} presses ${keyName(step.key)}: ${step.outcome} [${step.reference}]`);
    }
  }
  return lines;
}
