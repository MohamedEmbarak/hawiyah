// The lead's lists are pinned: each list file, and each
// list constant of targets.mjs, has the hash of its content here, so a changed list
// fails this test until the pin is renewed with it. The process is the real control:
// the lead takes only page files and check modules from a writer, adds an entry a
// writer proposed, and renews its pin here in the same change.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { TARGET_OVERRIDES, UNOWNED_EXPORTS, VUE_SLOT_PATTERNS } from '../api-tables/targets.mjs';

const guideDir = fileURLToPath(new URL('../../', import.meta.url));
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

/** The current content of every lead's list: the files as written, the constants as JSON. */
function leadListContents() {
  const file = (path) => readFileSync(join(guideDir, path), 'utf8');
  return {
    'scripts/api-tables/exclusions.json': file('scripts/api-tables/exclusions.json'),
    'scripts/api-tables/defaults.json': file('scripts/api-tables/defaults.json'),
    'scripts/api-tables/vocabulary-exceptions.json': file('scripts/api-tables/vocabulary-exceptions.json'),
    'scripts/api-tables/targets.mjs TARGET_OVERRIDES': JSON.stringify(TARGET_OVERRIDES),
    'scripts/api-tables/targets.mjs VUE_SLOT_PATTERNS': JSON.stringify(VUE_SLOT_PATTERNS),
    'scripts/api-tables/targets.mjs UNOWNED_EXPORTS': JSON.stringify(UNOWNED_EXPORTS),
    'scripts/content/arabic-exceptions.json': file('scripts/content/arabic-exceptions.json'),
    'scripts/content/claim-exceptions.json': file('scripts/content/claim-exceptions.json'),
    'scripts/content/live-component-exceptions.json': file('scripts/content/live-component-exceptions.json'),
    'scripts/content/marketing-terms.json': file('scripts/content/marketing-terms.json'),
    'scripts/page-guards/latin-allowlist.json': file('scripts/page-guards/latin-allowlist.json'),
    'scripts/equivalence/keyboard-exceptions.json': file('scripts/equivalence/keyboard-exceptions.json'),
    'scripts/equivalence/known-differences.json': file('scripts/equivalence/known-differences.json'),
    'scripts/equivalence/empty-elements.json': file('scripts/equivalence/empty-elements.json'),
    'scripts/equivalence/vanilla-hooks.json': file('scripts/equivalence/vanilla-hooks.json'),
    'scripts/equivalence/angular-hosts.json': file('scripts/equivalence/angular-hosts.json'),
  };
}

/** The pins: renewed by the lead with every change of a list (the first 16 hex characters of its sha256). */
const PINS = {
  'scripts/api-tables/exclusions.json': 'b90c2dabf88c6668',
  'scripts/api-tables/defaults.json': '3b28cdd0835770a5',
  'scripts/api-tables/vocabulary-exceptions.json': 'df3489e2983ada44',
  'scripts/api-tables/targets.mjs TARGET_OVERRIDES': '3234c5ebc700689a',
  'scripts/api-tables/targets.mjs VUE_SLOT_PATTERNS': '1a3e723ebc631429',
  'scripts/api-tables/targets.mjs UNOWNED_EXPORTS': '4f53cda18c2baa0c',
  'scripts/content/arabic-exceptions.json': '39231a34951b2255',
  'scripts/content/claim-exceptions.json': '37517e5f3dc66819',
  'scripts/content/live-component-exceptions.json': '9924a5b8b5e71573',
  'scripts/content/marketing-terms.json': '9c68b16ef9d5c5c8',
  'scripts/page-guards/latin-allowlist.json': '37517e5f3dc66819',
  'scripts/equivalence/keyboard-exceptions.json': 'e2cd8a4267419155',
  'scripts/equivalence/known-differences.json': 'd30afd4679b1e691',
  'scripts/equivalence/empty-elements.json': 'ec4ca3fe1b5a06cf',
  'scripts/equivalence/vanilla-hooks.json': 'bb5d2c8fecd4c734',
  'scripts/equivalence/angular-hosts.json': 'dadd35b44cd66f6e',
};

describe('the lead\'s lists are pinned', () => {
  it('every list has a pin and every pin a list', () => {
    expect(Object.keys(PINS).sort()).toEqual(Object.keys(leadListContents()).sort());
  });

  it.each(Object.entries(leadListContents()))('%s is the list the lead pinned', (name, content) => {
    expect(hash(content), `${name} changed: the lead renews its pin in scripts/test/lead-lists.test.mjs with the entry`).toBe(PINS[name]);
  });
});
