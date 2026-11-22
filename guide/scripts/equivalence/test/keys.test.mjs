// The keyboard rule of step 80 (5a.8): the binding of the keyboard table to the
// steps of the checks (HWE-KEYS), the Tabs oracle, and on a stand-in page in
// Chromium the outcome assertions (HWE-EXPECT), the keys a step presses
// (HWE-CHECK) and axe in each frame document (HWE-AXE).
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import tabsActivate from '../checks/tabs-activate.mjs';
import tabsKeyboard from '../checks/tabs-keyboard.mjs';
import tabsKeyboardVertical from '../checks/tabs-keyboard-vertical.mjs';
import { nextEnabled, previousEnabled, tabsCheck, target } from '../checks/lib/tabs.mjs';
import { isKey, keyName, keyboardExceptionErrors, keyboardReportLines, keyboardRule, keyboardScope, readKeyboardExceptions, stepErrors, uncheckedLine } from '../keys.mjs';
import { awaitOutcome, axeFrames, chromiumPath, documentReferenceError, runChecks } from '../run.mjs';

const guideDir = fileURLToPath(new URL('../../../', import.meta.url));
const componentsFile = fileURLToPath(new URL('../../../../components.json', import.meta.url));

const table = (rows) => ({ caption: 'Keyboard interaction of Tabs', line: 7, rows });
const ROWS = [
  { keys: ['Tab'], action: 'Moves focus into the list.' },
  { keys: ['ArrowRight', 'ArrowLeft'], action: 'Moves focus.' },
  { keys: ['ArrowDown', 'ArrowUp'], action: 'In a vertical list, moves focus.' },
  { keys: ['Home', 'End'], action: 'First or last.' },
];
const page = (keyboard, checks = 'tabs-keyboard') => ({ id: 'tabs', langs: ['en'], liveGroups: [{ example: 'basic', check: checks }], keyboard: { en: keyboard } });
const checks = new Map([[tabsKeyboard.name, tabsKeyboard], [tabsActivate.name, tabsActivate], [tabsKeyboardVertical.name, tabsKeyboardVertical]]);
const scope = new Map([['tabs', ['createTabs']]]);

describe('the binding of the keyboard table to the checks (HWE-KEYS)', () => {
  it('passes when the keys of the table are the keys the steps press, and reports each row with its steps', () => {
    const { errors, report } = keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [] });
    expect(errors).toEqual([]);
    expect(report[0].rows[1].steps.map((step) => `${step.check}/${step.step} ${step.key}`)).toEqual([
      'tabs-keyboard/right-arrow ArrowRight', 'tabs-keyboard/right-arrow-again ArrowRight', 'tabs-keyboard/left-arrow ArrowLeft', 'tabs-keyboard/left-arrow-again ArrowLeft',
    ]);
    const lines = keyboardReportLines(report);
    expect(lines[0]).toBe('keyboard: tabs/en "Keyboard interaction of Tabs"');
    expect(lines[1]).toBe('  Tab | Moves focus into the list.');
    expect(lines[2]).toMatch(/^ {4}tabs-keyboard\/tab-into-list presses Tab: Tab from before the tab list moves focus to the selected tab\. \[WAI-ARIA Authoring Practices, Tabs pattern/);
    // G24: an arrow key the orientation does not handle is pressed and keeps focus and selection.
    expect(report[0].rows[2].steps.map((step) => `${step.check}/${step.step} ${step.key}`)).toEqual(['tabs-keyboard/down-arrow-unhandled ArrowDown', 'tabs-keyboard/up-arrow-unhandled ArrowUp']);
    // G22: the keys of a row of an Arabic table are joined by the Arabic comma.
    const ar = { id: 'tabs', langs: ['ar'], liveGroups: [{ example: 'basic', check: 'tabs-keyboard' }], keyboard: { ar: { caption: 'x', line: 7, rows: ROWS } } };
    expect(keyboardReportLines(keyboardRule({ pages: [ar], checks, scope, exceptions: [] }).report)).toContain('  السهم الأيمن، السهم الأيسر | Moves focus.');
  });

  it('fails on a documented key that no step presses and on a pressed key the table lacks', () => {
    const withoutHome = ROWS.map((row) => (row.keys.includes('Home') ? { ...row, keys: ['End'] } : row));
    expect(keyboardRule({ pages: [page(table(withoutHome))], checks, scope, exceptions: [] }).errors).toEqual([
      'HWE-KEYS docs/components/tabs.md:7: the step tabs-keyboard/home presses Home, which the keyboard table does not document',
    ]);
    const extra = [...ROWS, { keys: ['Escape'], action: 'Closes.' }];
    expect(keyboardRule({ pages: [page(table(extra))], checks, scope, exceptions: [] }).errors).toEqual([
      'HWE-KEYS docs/components/tabs.md:7: the keyboard table documents Escape ("Closes."), which no step of the checks tabs-keyboard presses; write a step that presses it and asserts the outcome, or propose a keyboard-exceptions.json entry',
    ]);
    // A key the lead's list excuses (a key a sandboxed frame cannot press).
    expect(keyboardRule({ pages: [page(table(extra))], checks, scope, exceptions: [{ component: 'tabs', key: 'Escape', reason: 'r', approvedBy: 'lead' }] }).errors).toEqual([]);
  });

  it('fails on a component with a controller whose page has no keyboard table, unless the lead leaves it out', () => {
    expect(keyboardRule({ pages: [page(null)], checks, scope, exceptions: [] }).errors[0]).toMatch(/^HWE-KEYS docs\/components\/tabs\.md:1: tabs has a controller \(createTabs\), so the Accessibility section has the keyboard table/);
    // The owner's decision for the launch (renewed assertion; it read errors []): an entry that
    // leaves the component out keeps the table required and refuses groups that name checks.
    expect(keyboardRule({ pages: [page(null)], checks, scope, exceptions: [{ component: 'tabs', reason: 'r', reference: 'x', approvedBy: 'lead' }] }).errors).toEqual([
      'HWE-KEYS docs/components/tabs.md:1: tabs has a controller (createTabs), so the Accessibility section has the keyboard table "Table: ..." written from the READMEs of the installed packages (scripts/equivalence/keyboard-exceptions.json leaves its outcomes unchecked, not the table)',
      'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (tabs) leaves the keyboard outcomes of tabs unchecked, but its groups name the checks tabs-keyboard; a component with checks is bound to them, so remove the entry',
    ]);
    // A page without a controller is not bound: its table is reported, never failed.
    const button = { ...page(table([{ keys: ['Enter'], action: 'Activates.' }]), ''), id: 'button' };
    const result = keyboardRule({ pages: [button], checks, scope, exceptions: [] });
    expect(result.errors).toEqual([]);
    expect(result.report[0]).toMatchObject({ page: 'button', bound: false, reason: 'no controller of @hawiyah/vanilla' });
  });

  // G16 of the 5a fix round (verification of 07763ce): an entry that matched nothing was not reported.
  it('fails on an entry of keyboard-exceptions.json that matches nothing, and accepts one that excuses a documented key', () => {
    const rows = [...ROWS, { keys: ['F10'], action: 'Opens the menu.' }];
    const entry = { component: 'tabs', key: 'F10', reason: 'r', approvedBy: 'lead' };
    expect(keyboardRule({ pages: [page(table(rows))], checks, scope, exceptions: [entry] }).errors).toEqual([]);
    expect(keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [entry] }).errors).toEqual([
      'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (tabs F10) matches nothing: no keyboard table of the page documents F10 without a step that presses it; remove it',
    ]);
    expect(keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [{ ...entry, key: 'Home' }] }).errors).toEqual([
      'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (tabs Home) matches nothing: no keyboard table of the page documents Home without a step that presses it; remove it',
    ]);
    const button = { ...page(table([{ keys: ['Enter'], action: 'Activates.' }]), ''), id: 'button' };
    expect(keyboardRule({ pages: [button], checks, scope, exceptions: [{ component: 'button', reason: 'r', approvedBy: 'lead' }] }).errors).toEqual([
      'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (button) matches nothing: button has no controller of @hawiyah/vanilla, so the rule does not bind its page; remove it',
    ]);
    // An entry of a page outside the run is not judged.
    expect(keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [{ component: 'accordion', key: 'F10', reason: 'r', approvedBy: 'lead' }] }).errors).toEqual([]);
  });

  // The owner's decision for the launch: Tabs has keyboard outcome checks; the other components with
  // a controller have a keyboard table written from the package READMEs, read by the reviewer.
  describe('an entry { component, reason, reference, approvedBy }: keyboard outcomes not checked', () => {
    const dialogScope = new Map([...scope, ['dialog', ['createDialog']]]);
    const DIALOG_ROWS = [{ keys: ['Escape'], action: 'Closes the dialog.' }, { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus inside the dialog.' }];
    const dialog = (keyboard = { en: table(DIALOG_ROWS), ar: table(DIALOG_ROWS) }, liveGroups = [{ example: 'basic', static: true }]) => ({ id: 'dialog', langs: ['en', 'ar'], liveGroups, keyboard });
    const unchecked = { component: 'dialog', reason: 'Keyboard outcome checks of Dialog follow the launch.', reference: '@hawiyah/vanilla README.md: "Escape closes the dialog."', approvedBy: 'lead' };

    it('leaves the table unbound, names the page as unchecked and prints its line', () => {
      const result = keyboardRule({ pages: [dialog(), page(table(ROWS))], checks, scope: dialogScope, exceptions: [unchecked] });
      expect(result.errors).toEqual([]);
      expect(result.unchecked).toEqual(['dialog']);
      expect(result.unchecked.map(uncheckedLine)).toEqual(['keyboard outcomes not checked: dialog']);
      expect(result.report.filter((item) => item.page === 'dialog').map((item) => [item.lang, item.bound, item.reason])).toEqual([
        ['en', false, 'keyboard outcomes not checked, keyboard-exceptions.json: Keyboard outcome checks of Dialog follow the launch.'],
        ['ar', false, 'keyboard outcomes not checked, keyboard-exceptions.json: Keyboard outcome checks of Dialog follow the launch.'],
      ]);
      expect(keyboardReportLines(result.report)[0]).toBe('keyboard: dialog/en "Keyboard interaction of Tabs" (not bound: keyboard outcomes not checked, keyboard-exceptions.json: Keyboard outcome checks of Dialog follow the launch.)');
      // Tabs stays bound to its checks.
      expect(result.report.find((item) => item.page === 'tabs').bound).toBe(true);
      expect(keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [] }).unchecked).toEqual([]);
    });

    it('still requires the keyboard table in every language', () => {
      expect(keyboardRule({ pages: [dialog({ en: table(DIALOG_ROWS) })], checks, scope: dialogScope, exceptions: [unchecked] }).errors).toEqual([
        'HWE-KEYS docs/components/dialog.ar.md:1: dialog has a controller (createDialog), so the Accessibility section has the keyboard table "جدول: ..." written from the READMEs of the installed packages (scripts/equivalence/keyboard-exceptions.json leaves its outcomes unchecked, not the table)',
      ]);
    });

    it('fails on an entry for a component whose groups name checks, and on an entry that matches no page', () => {
      expect(keyboardRule({ pages: [dialog(undefined, [{ example: 'basic', check: 'tabs-click' }])], checks, scope: dialogScope, exceptions: [unchecked] }).errors).toEqual([
        'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (dialog) leaves the keyboard outcomes of dialog unchecked, but its groups name the checks tabs-click; a component with checks is bound to them, so remove the entry',
      ]);
      expect(keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [{ ...unchecked, component: 'combobox' }], knownPages: ['tabs', 'dialog'] }).errors).toEqual([
        'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (combobox) matches no page: docs/components/ has no page combobox; remove it',
      ]);
      // A page that exists outside the run (check:page of another page) is not judged further.
      expect(keyboardRule({ pages: [page(table(ROWS))], checks, scope, exceptions: [unchecked], knownPages: ['tabs', 'dialog'] }).errors).toEqual([]);
      // A component without a controller is not bound, so the entry matches nothing.
      const button = { ...page(table([{ keys: ['Enter'], action: 'Activates.' }]), ''), id: 'button' };
      expect(keyboardRule({ pages: [button], checks, scope, exceptions: [{ ...unchecked, component: 'button' }] }).errors).toEqual([
        'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (button) matches nothing: button has no controller of @hawiyah/vanilla, so the rule does not bind its page; remove it',
      ]);
    });

    it('checks the reference against the installed README or CHANGELOG.md', () => {
      const readme = (name) => (name === 'vanilla' ? 'Escape closes the dialog. Focus returns to the opener.' : null);
      const referenceError = (reference) => documentReferenceError(reference, { readme, changelog: '# Changelog\n\n## 0.3.0\n\n#### Known defects in 0.3.0\n\n- Dialog (React) ignores autoFocus.\n' });
      expect(keyboardRule({ pages: [dialog()], checks, scope: dialogScope, exceptions: [unchecked], referenceError }).errors).toEqual([]);
      expect(keyboardRule({ pages: [dialog()], checks, scope: dialogScope, exceptions: [{ ...unchecked, reference: 'CHANGELOG.md, 0.3.0, Known defects in 0.3.0: Dialog (React) ignores autoFocus.' }], referenceError }).errors).toEqual([]);
      expect(keyboardRule({ pages: [dialog()], checks, scope: dialogScope, exceptions: [{ ...unchecked, reference: '@hawiyah/vanilla README.md: "Enter closes the dialog."' }], referenceError }).errors).toEqual([
        'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 1 (dialog): the reference quotes a sentence that the README of the installed @hawiyah/vanilla does not hold',
      ]);
      expect(keyboardRule({ pages: [dialog()], checks, scope: dialogScope, exceptions: [{ ...unchecked, reference: 'the dialog pattern' }], referenceError }).errors[0]).toMatch(/^HWE-KEYS scripts\/equivalence\/keyboard-exceptions\.json:1: entry 1 \(dialog\): the reference must be '@hawiyah\/<name> README\.md: "<sentence>"' or a CHANGELOG\.md entry \(source must read/);
    });

    it('has exactly two forms with non-empty values', () => {
      const key = { component: 'tabs', key: 'F10', reason: 'r', approvedBy: 'lead' };
      expect(keyboardExceptionErrors([key, unchecked])).toEqual([]);
      const form = (n) => `HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry ${n} must be { component, key, reason, approvedBy } (a key without a step) or { component, reason, reference, approvedBy } (a component whose keyboard outcomes are not checked), with non-empty values`;
      const { reference: _reference, ...withoutReference } = unchecked;
      expect(keyboardExceptionErrors([
        withoutReference, { ...key, reference: 'x' }, { ...unchecked, reference: ' ' }, { ...unchecked, extra: 'x' }, null, { ...key, key: 'Return' },
      ])).toEqual([form(1), form(2), form(3), form(4), form(5), 'HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: entry 6: Return is not a key of KEY_NAMES']);
      expect(keyboardExceptionErrors({})).toEqual(['HWE-KEYS scripts/equivalence/keyboard-exceptions.json:1: the file must hold an array']);
      // The list is read through the same form.
      const scratch = mkdtempSync(join(tmpdir(), 'hawiyah-keyboard-'));
      try {
        writeFileSync(join(scratch, 'list.json'), JSON.stringify([withoutReference]));
        expect(() => readKeyboardExceptions(join(scratch, 'list.json'))).toThrow(form(1));
        writeFileSync(join(scratch, 'list.json'), JSON.stringify([unchecked, key]));
        expect(readKeyboardExceptions(join(scratch, 'list.json'))).toEqual([unchecked, key]);
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    });
  });

  it('fails on a check without read, assert or negative control, a step without expect, and a keyed step without outcome or reference', () => {
    const check = { name: 'x-keys', steps: [{ name: 'a', keys: ['Enter'], async run() {} }, { name: 'b', keys: ['Return'], outcome: 'o', reference: 'r', async run() {}, expect: (state) => state }, { name: 'c', async run() {} }] };
    expect(stepErrors(check)).toEqual([
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: the check has no read(mount) and assert(observed, expected) of its frames',
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: the check has no negative control { fixture, wrong }: the markup that scripts/equivalence/test/negative.test.mjs renders with @hawiyah/vanilla, and a deliberately wrong oracle under which every keyed step must fail',
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: step a has no expect: every step returns the state the oracle expects after it, from the state it expected before',
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: step a declares keys without a one-line outcome',
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: step a declares keys without the reference of its outcome (the WAI-ARIA Authoring Practices pattern, CONTRACT.md or CHANGELOG.md)',
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: step b declares the key Return, which is not a key id of KEY_NAMES in scripts/content/config.mjs',
      'HWE-KEYS scripts/equivalence/checks/x-keys.mjs:1: step c has no expect: every step returns the state the oracle expects after it, from the state it expected before',
    ]);
    for (const check of checks.values()) expect(stepErrors(check), check.name).toEqual([]);
  });

  it('reads the scope from the controller factories of the installed @hawiyah/vanilla (leadAmendments A2)', async () => {
    const found = await keyboardScope({ guideDir, componentsFile });
    expect(found.get('tabs')).toEqual(['createTabs']);
    expect(found.has('button')).toBe(false);
    // The 33 components of the inventory, and app-shell, whose page documents createSkipLink (lead decision L3).
    expect(found.size).toBe(34);
    expect(found.get('app-shell')).toEqual(['createSkipLink']);
    expect(found.get('file-upload')).toEqual(['createFileUploadList']);
  });

  it('keeps the lead\'s list of keyboard exceptions valid and names keys by language', () => {
    // Each entry leaves the keyboard outcomes of one component unchecked (the launch
    // decision: checks for Tabs only); the list itself is pinned by lead-lists.test.mjs.
    const exceptions = readKeyboardExceptions();
    expect(exceptions.every((entry) => entry.approvedBy === 'lead' && typeof entry.reference === 'string' && !('key' in entry))).toBe(true);
    expect(exceptions.map((entry) => entry.component)).not.toContain('tabs');
    expect(isKey('Shift+Tab')).toBe(true);
    expect(isKey('Return')).toBe(false);
    expect(keyName('ArrowLeft', 'ar')).toBe('السهم الأيسر');
    expect(keyName('Shift+Tab')).toBe('Shift + Tab');
  });
});

describe('the Tabs oracle (written from the WAI-ARIA Authoring Practices and CONTRACT.md before the checks ran)', () => {
  const snapshot = { count: 4, disabled: [false, true, false, false], focused: 0 };
  it('moves to the next and the previous enabled tab, wrapping and skipping disabled tabs', () => {
    expect(nextEnabled(snapshot, 0)).toBe(2);
    expect(nextEnabled(snapshot, 3)).toBe(0);
    expect(previousEnabled(snapshot, 0)).toBe(3);
    expect(previousEnabled(snapshot, 2)).toBe(0);
  });
  it('follows the visual direction for horizontal arrows and not for vertical ones', () => {
    expect(target(snapshot, 'ArrowRight', { dir: 'ltr', orientation: 'horizontal' })).toBe(2);
    expect(target(snapshot, 'ArrowRight', { dir: 'rtl', orientation: 'horizontal' })).toBe(3);
    expect(target(snapshot, 'ArrowLeft', { dir: 'rtl', orientation: 'horizontal' })).toBe(2);
    expect(target(snapshot, 'ArrowDown', { dir: 'rtl', orientation: 'vertical' })).toBe(2);
    expect(target(snapshot, 'ArrowUp', { dir: 'ltr', orientation: 'vertical' })).toBe(3);
    expect(target({ ...snapshot, focused: 3 }, 'Home', { dir: 'ltr', orientation: 'horizontal' })).toBe(0);
    expect(target({ ...snapshot, disabled: [false, false, false, true] }, 'End', { dir: 'rtl', orientation: 'horizontal' })).toBe(2);
    expect(() => target(snapshot, 'ArrowDown', { dir: 'ltr', orientation: 'horizontal' })).toThrow('the oracle has no outcome for ArrowDown in a horizontal tab list');
  });
});

// A stand-in harness page: four sandboxed frames with the mounts of the real
// harness. "wrong" frames hold a tab list whose arrow keys do nothing, the same in
// all four, so the comparison of the four results passes and only the outcome
// assertions can fail; "right" frames hold a minimal roving tab list that follows
// the documented behaviour (the oracle must not fail a correct widget). The
// behaviours of lead decision L16 move focus in the key's task, as every adapter
// does, and write the selection later, in the first animation frame or 0 ms timer
// after the key, as zoneless change detection of @hawiyah/angular does: "late"
// writes the documented tab, "late-wrong" the tab after it, and "flicker" writes the
// documented tab at once and the tab after it in that later task. "slow" writes the
// documented tab 150 ms after the key: a render that comes after the harness has read
// the frame, as on a loaded runner (before L16 the harness failed it).
const FRAMEWORK_NAMES = ['vanilla', 'react', 'vue', 'angular'];
function frameDocument(framework, { dir, behaviour, unnamed = false }) {
  const mount = framework === 'angular' ? 'guide-example' : 'div id="app"';
  const close = framework === 'angular' ? 'guide-example' : 'div';
  const tabs = ['One', 'Two', 'Three'].map((label, index) => `<button type="button" role="tab" id="t${index}" aria-controls="p${index}" aria-selected="${index === 0}" tabindex="${behaviour !== 'wrong' && index !== 0 ? -1 : 0}">${label}</button>`).join('');
  const panels = [0, 1, 2].map((index) => `<section role="tabpanel" id="p${index}" aria-labelledby="t${index}" tabindex="0"${index === 0 ? '' : ' hidden'}><p>Panel ${index + 1}</p></section>`).join('');
  const script = behaviour !== 'wrong'
    ? `<script>
        const tabs = [...document.querySelectorAll('[role=tab]')];
        const render = (i) => tabs.forEach((tab, n) => { tab.setAttribute('aria-selected', String(n === i)); tab.tabIndex = n === i ? 0 : -1; document.getElementById('p' + n).hidden = n !== i; });
        // The next task that renders: the first animation frame or 0 ms timer (Angular's zoneless scheduler).
        const later = (callback) => { let done = false; const once = () => { if (!done) { done = true; callback(); } }; requestAnimationFrame(once); setTimeout(once, 0); };
        const behaviour = '${behaviour}';
        const select = (i) => {
          if (behaviour === 'right') render(i);
          if (behaviour === 'late') later(() => render(i));
          if (behaviour === 'slow') setTimeout(() => render(i), 150);
          if (behaviour === 'late-wrong') later(() => render((i + 1) % tabs.length));
          if (behaviour === 'flicker') { render(i); later(() => render((i + 1) % tabs.length)); }
          if (behaviour === 'right-then-wrong-300') { render(i); setTimeout(() => render((i + 1) % tabs.length), 300); }
          if (behaviour === 'right-then-wrong-1000') { render(i); setTimeout(() => render((i + 1) % tabs.length), 1000); }
          if (behaviour === 'aria-wrong-300') { render(i); setTimeout(() => { tabs.forEach((tab, n) => tab.setAttribute('aria-selected', String(n === (i + 1) % tabs.length))); }, 300); }
        };
        document.querySelector('[role=tablist]').addEventListener('keydown', (event) => {
          const i = tabs.indexOf(document.activeElement);
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
          let next = null;
          if (step) next = (i + step + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next === null) return;
          event.preventDefault();
          tabs[next].focus();
          select(next);
        });
      </script>`
    : '';
  return `<!doctype html><html lang="${dir === 'rtl' ? 'ar' : 'en'}" dir="${dir}"><head><title>${framework} result</title></head><body style="margin:0;padding:8px">`
    + `<div id="hawiyah-preview-root"><${mount}><div role="tablist" aria-label="${dir === 'rtl' ? 'تفاصيل' : 'Details'}">${tabs}</div>${panels}${unnamed ? '<button type="button"></button>' : ''}</${close}></div>${script}</body></html>`;
}

const standIn = async (page, options) => {
  const frames = FRAMEWORK_NAMES.map((framework) => `<iframe data-framework="${framework}" sandbox="allow-scripts" title="${framework}" style="display:block;inline-size:720px;block-size:200px;border:0"></iframe>`).join('');
  await page.setContent(`<!doctype html><html lang="en"><head><title>Stand-in harness</title></head><body style="margin:0;padding:16px"><main>${frames}</main></body></html>`);
  for (const framework of FRAMEWORK_NAMES) {
    await page.locator(`iframe[data-framework="${framework}"]`).evaluate((frame, html) => {
      frame.srcdoc = html;
      return new Promise((done) => frame.addEventListener('load', () => done(undefined), { once: true }));
    }, frameDocument(framework, options));
    // The harness sizes each frame to the height its document reports; the stand-in does the same once.
    const element = page.locator(`iframe[data-framework="${framework}"]`);
    const height = await (await (await element.elementHandle()).contentFrame()).evaluate(() => Math.ceil(document.documentElement.getBoundingClientRect().height));
    await element.evaluate((frame, value) => { frame.style.blockSize = `${Math.max(80, value)}px`; }, height);
  }
};

describe('outcome assertions, pressed keys and axe on a stand-in page (Chromium)', () => {
  let browser;
  let page;
  beforeAll(async () => {
    browser = await chromium.launch({ executablePath: chromiumPath() });
    page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage();
  }, 60_000);
  afterAll(async () => browser?.close());
  const group = (lang) => ({ id: 'tabs', lang, example: 'basic', blocks: { vanilla: { line: 19 } } });

  it('fails the expect of four equal but wrong results (HWE-EXPECT), while their comparison passes', async () => {
    await standIn(page, { dir: 'ltr', behaviour: 'wrong' });
    const compared = [];
    const { failures, asserted } = await runChecks({ page, group: group('en'), checks: [tabsKeyboard], evaluate: async (state) => compared.push(state), outcomeTimeout: 300 });
    // tab-into-list holds (Tab enters on the selected tab); right-arrow is the first outcome that fails, in all four frames.
    expect(failures.filter((line) => line.includes('tabs-keyboard/right-arrow in')).map((line) => line.split(' in ')[1].split(':')[0])).toEqual(FRAMEWORK_NAMES);
    expect(failures[0]).toMatch(/^HWE-EXPECT docs\/components\/tabs\.md:19: basic \(en\) tabs-keyboard\/(?:right-arrow|left-arrow|left-arrow-again|end|right-arrow-again) in vanilla: tab \d of 3 is expected to be the one selected tab; selected: \d \(not shown within 300 ms\); documented outcome: /);
    expect(failures.every((line) => line.startsWith('HWE-EXPECT '))).toBe(true);
    expect(compared).toHaveLength(tabsKeyboard.steps.length);
    expect(asserted).toBeLessThan(tabsKeyboard.steps.length);
  }, 120_000);

  // Lead decision L16 of 5a: the expect waits, within a bound, for the documented
  // outcome and then checks that it holds; it never accepts another outcome.
  for (const [dir, behaviour] of [['ltr', 'late'], ['rtl', 'late'], ['ltr', 'slow'], ['rtl', 'slow']]) {
    it(`passes a tab list that writes the documented selection ${behaviour === 'slow' ? '150 ms' : 'in the task'} after the key, in ${dir} frames`, async () => {
      await standIn(page, { dir, behaviour });
      const { failures, asserted } = await runChecks({ page, group: group(dir === 'rtl' ? 'ar' : 'en'), checks: [tabsKeyboard] });
      expect(failures).toEqual([]);
      expect(asserted).toBe(tabsKeyboard.steps.length);
    }, 120_000);
  }

  it('fails a tab list that writes a wrong selection in the task after the key (HWE-EXPECT, after the bound)', async () => {
    await standIn(page, { dir: 'ltr', behaviour: 'late-wrong' });
    const started = Date.now();
    const { failures } = await runChecks({ page, group: group('en'), checks: [tabsKeyboard], outcomeTimeout: 300 });
    expect(Date.now() - started).toBeGreaterThan(300);
    const right = failures.filter((line) => line.includes('tabs-keyboard/right-arrow in'));
    expect(right.map((line) => line.split(' in ')[1].split(':')[0])).toEqual(FRAMEWORK_NAMES);
    expect(right[0]).toContain('in vanilla: tab 2 of 3 is expected to be the one selected tab; selected: 3 (not shown within 300 ms); documented outcome: ');
  }, 120_000);

  it('fails a tab list that shows the documented selection and changes it in the task after the key (HWE-EXPECT)', async () => {
    await standIn(page, { dir: 'ltr', behaviour: 'flicker' });
    const { failures } = await runChecks({ page, group: group('en'), checks: [tabsKeyboard], outcomeTimeout: 300 });
    const right = failures.filter((line) => line.includes('tabs-keyboard/right-arrow in'));
    expect(right.map((line) => line.split(' in ')[1].split(':')[0])).toEqual(FRAMEWORK_NAMES);
    expect(right[0]).toMatch(/in vanilla: tab 2 of 3 is expected to be the one selected tab; selected: 3 \((?:the documented outcome was shown, then changed|not shown within 300 ms)\); documented outcome: /);
  }, 120_000);

  it('applies expect until it holds or the bound passes, then once more after the frame settled', async () => {
    let calls = 0;
    let settled = 0;
    const later = async () => { calls += 1; if (calls < 3) throw new Error('not yet'); };
    expect(await awaitOutcome(later, async () => { settled += 1; }, { timeout: 1000, interval: 1 })).toBeNull();
    expect([calls, settled]).toEqual([4, 1]);
    const never = async () => { throw new Error('tab 2 of 3 is expected to be the one selected tab; selected: 1'); };
    expect(await awaitOutcome(never, async () => {}, { timeout: 50, interval: 5 })).toBe('tab 2 of 3 is expected to be the one selected tab; selected: 1 (not shown within 50 ms)');
    let held = 0;
    const changes = async () => { held += 1; if (held > 1) throw new Error('selected: 3'); };
    expect(await awaitOutcome(changes, async () => {}, { timeout: 50 })).toBe('selected: 3 (the documented outcome was shown, then changed)');
  });

  for (const dir of ['ltr', 'rtl']) {
    it(`passes every outcome of a correct tab list in ${dir} frames`, async () => {
      await standIn(page, { dir, behaviour: 'right' });
      const { failures, asserted } = await runChecks({ page, group: group(dir === 'rtl' ? 'ar' : 'en'), checks: [tabsKeyboard] });
      expect(failures).toEqual([]);
      expect(asserted).toBe(tabsKeyboard.steps.length);
    }, 120_000);
  }

  it('fails a step that presses another key than it declares, with the helper or without it (HWE-CHECK)', async () => {
    await standIn(page, { dir: 'ltr', behaviour: 'right' });
    const sloppy = { name: 'x-sloppy', ...tabsCheck, steps: [{ name: 'press-end', keys: ['Home'], outcome: 'o', reference: 'r', async run({ mount, press }) { await press(mount.getByRole('tab').first(), 'End'); }, expect: (state) => state }] };
    const { failures } = await runChecks({ page, group: group('en'), checks: [sloppy] });
    expect(failures).toEqual(['HWE-CHECK docs/components/tabs.md:19: x-sloppy step press-end pressed End in vanilla (trusted keydown events of the frame), and declares Home; a step presses exactly the keys it declares']);
    // Verification 2 of 07763ce: a raw Playwright press escaped the rule, which counted only context.press.
    await standIn(page, { dir: 'ltr', behaviour: 'right' });
    const raw = { name: 'x-raw', ...tabsCheck, steps: [{ name: 'raw-escape', outcome: 'o', reference: 'r', async run({ mount }) { await mount.getByRole('tab').first().press('Escape'); }, expect: (state) => state }] };
    expect((await runChecks({ page, group: group('en'), checks: [raw] })).failures).toEqual(['HWE-CHECK docs/components/tabs.md:19: x-raw step raw-escape pressed Escape in vanilla (trusted keydown events of the frame), and declares no key; a step presses exactly the keys it declares']);
  }, 120_000);

  // Verification 1 of 07763ce (G6 of the 5a fix round): an outcome that is shown and
  // changes after the read, and an oracle that took the state before a step from the frame.
  for (const behaviour of ['right-then-wrong-300', 'right-then-wrong-1000', 'aria-wrong-300']) {
    it(`fails a tab list that shows the documented outcome and changes it later (${behaviour}) (HWE-EXPECT)`, async () => {
      await standIn(page, { dir: 'ltr', behaviour });
      const { failures } = await runChecks({ page, group: group('en'), checks: [tabsKeyboard], outcomeTimeout: 300 });
      expect(failures.length).toBeGreaterThan(0);
      expect(failures.every((line) => line.startsWith('HWE-EXPECT '))).toBe(true);
      expect(failures.some((line) => /tabs-keyboard\/(?:left-arrow|right-arrow|left-arrow-again|end|right-arrow-again|home|tab-to-panel) in vanilla: (?:before the step, the frame no longer shows the outcome the oracle computed for the previous step|tab \d of 3 is expected)/.test(line))).toBe(true);
    }, 120_000);
  }

  it('an assertion that reads nothing passes its documented oracle and fails nothing under the wrong one: the negative control catches it', async () => {
    await standIn(page, { dir: 'ltr', behaviour: 'wrong' });
    const vacuous = { ...tabsKeyboard, name: 'x-vacuous', assert: () => {} };
    expect((await runChecks({ page, group: group('en'), checks: [vacuous], outcomeTimeout: 300 })).failures).toEqual([]);
    expect((await runChecks({ page, group: group('en'), checks: [vacuous], outcomeTimeout: 300, oracle: 'negative' })).failures).toEqual([]);
  }, 120_000);

  it('reports a frame with an unnamed button (HWE-AXE) and none without it', async () => {
    await standIn(page, { dir: 'ltr', behaviour: 'right', unnamed: true });
    const found = await axeFrames(page);
    expect(found.frames).toBe(4);
    expect(found.violations.map((item) => item.framework)).toEqual(FRAMEWORK_NAMES);
    expect(found.violations[0].lines[0]).toMatch(/^button-name: Buttons must have discernible text/);
    await standIn(page, { dir: 'ltr', behaviour: 'right' });
    expect((await axeFrames(page)).violations).toEqual([]);
  }, 120_000);
});

it('the stand-in page is the real mount shape of the harness', () => {
  const source = readFileSync(new URL('../run.mjs', import.meta.url), 'utf8');
  expect(source).toContain("'#hawiyah-preview-root > guide-example'");
  expect(source).toContain("'#hawiyah-preview-root > #app'");
});
