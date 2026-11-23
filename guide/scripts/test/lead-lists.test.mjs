// The lead's lists are pinned (G13 of the 5a fix round): each list file, and each
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
  'scripts/api-tables/exclusions.json': 'a2a67b44c9e03c68',
  'scripts/api-tables/defaults.json': '4c0348e881e6873f',
  'scripts/api-tables/vocabulary-exceptions.json': 'f32a3b77cefdd105',
  'scripts/api-tables/targets.mjs TARGET_OVERRIDES': 'ed7cbbb124b96cbd',
  'scripts/api-tables/targets.mjs VUE_SLOT_PATTERNS': '5f504e63bf85f6b2',
  'scripts/api-tables/targets.mjs UNOWNED_EXPORTS': '4f53cda18c2baa0c',
  'scripts/content/arabic-exceptions.json': '37517e5f3dc66819',
  'scripts/content/claim-exceptions.json': '37517e5f3dc66819',
  'scripts/content/live-component-exceptions.json': 'ad7c7cf7fb1c742f',
  'scripts/content/marketing-terms.json': '9376a99a82e48201',
  'scripts/page-guards/latin-allowlist.json': '37517e5f3dc66819',
  'scripts/equivalence/keyboard-exceptions.json': 'e2cd8a4267419155',
  'scripts/equivalence/known-differences.json': 'f04ea1cac3d6621f',
  'scripts/equivalence/empty-elements.json': 'd0758741b06a1e9a',
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
