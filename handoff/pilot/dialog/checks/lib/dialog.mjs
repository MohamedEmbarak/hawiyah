// The Dialog oracle of the keyboard checks (written in the form of lib/tabs.mjs).
// Each step presses its keys and returns the state the oracle expects after it,
// computed from the state it expected before the step, never from what an adapter
// does or what the frame shows; the harness asserts it in every frame
// (assertDialog). The expectations were fixed before the checks ran (the check
// author's reference.md of this pilot). References, cited per step:
//   APG       WAI-ARIA Authoring Practices, Dialog (Modal) pattern
//             (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
//   APG_BUTTON  WAI-ARIA Authoring Practices, Button pattern, Keyboard Interaction
//             (https://www.w3.org/WAI/ARIA/apg/patterns/button/).
//   HTML      HTML Standard, the dialog element: showModal(), the dialog focusing
//             steps, close the dialog, and Escape as a close request (cancel).
//   CONTRACT  CONTRACT.md, Unavailable controls and focus: "A popup that closes
//             returns focus to its trigger only when focus was inside it."
//   NATIVE    @hawiyah/vanilla README.md: "The HTML dialog specification is the
//             modal authority: no manual removal of `open`, no custom focus trap,
//             no `tabindex` on the dialog itself." The documented difference from
//             APG: past the last (or before the first) tabbable element the native
//             modal dialog does not wrap; focus may leave the document (to the
//             browser, or to the embedding page of a frame) but never reaches an
//             element of the document outside the dialog.
// No key of the pattern depends on the reading direction: every outcome is the same
// in ltr and rtl frames (sequential focus navigation follows tree order).
// This directory holds no check: a group cannot name lib/... (check names match
// ^[a-z][a-z0-9-]*$).

export const APG = 'WAI-ARIA Authoring Practices, Dialog (Modal) pattern';
export const APG_BUTTON = 'WAI-ARIA Authoring Practices, Button pattern, Keyboard Interaction';
export const HTML_DIALOG = 'HTML Standard, the dialog element';
export const CONTRACT = 'CONTRACT.md, Unavailable controls and focus: "A popup that closes returns focus to its trigger only when focus was inside it."';
export const NATIVE = '@hawiyah/vanilla README.md: "The HTML dialog specification is the modal authority: no manual removal of `open`, no custom focus trap, no `tabindex` on the dialog itself."';

/** The tabbable elements of a dialog by markup, in tree order (the same list in read and in the locators of the steps). */
export const TABBABLE = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * What a frame shows of its dialog: whether it is open and modal, its accessible
 * name (from aria-labelledby, else aria-label) and whether the labelling element is
 * inside it, its tabbable elements with their names, the close button (the button of
 * .hw-dialog-header), the element marked autofocus, and where focus is:
 *   a number   the tabbable element of the dialog at that position
 *   'dialog'   the dialog element itself
 *   'trigger'  the button that opens the dialog
 *   'away'     no element of the frame document: focus is outside the document
 *   'body'     the frame document has focus but no element of it does
 *   'outside'  another element of the frame document, outside the dialog
 */
export async function readDialog(mount) {
  return mount.evaluate((root, selector) => {
    const doc = root.ownerDocument;
    const dialog = root.querySelector('dialog');
    if (!dialog) throw new Error('the example renders no dialog element');
    const trigger = Array.from(root.querySelectorAll('[aria-haspopup="dialog"]')).find((node) => !dialog.contains(node))
      ?? Array.from(root.querySelectorAll('button')).find((node) => !dialog.contains(node)) ?? null;
    const tabbables = Array.from(dialog.querySelectorAll(selector));
    const text = (node) => (node.getAttribute('aria-label') ?? node.textContent ?? '').replace(/\s+/g, ' ').trim();
    const labelIds = (dialog.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
    const labels = labelIds.map((id) => doc.getElementById(id));
    const name = labels.length > 0 ? labels.map((node) => (node ? text(node) : '')).join(' ').trim() : (dialog.getAttribute('aria-label') ?? '').trim();
    const header = dialog.querySelector('.hw-dialog-header');
    const close = tabbables.findIndex((node) => node.localName === 'button' && header?.contains(node));
    const active = doc.activeElement;
    let focus;
    if (active === dialog) focus = 'dialog';
    else if (active && dialog.contains(active)) focus = tabbables.indexOf(active);
    else if (active && active === trigger) focus = 'trigger';
    else if (!active || active === doc.body || active === doc.documentElement) focus = doc.hasFocus() ? 'body' : 'away';
    else focus = 'outside';
    return {
      open: dialog.open,
      modal: dialog.matches(':modal'),
      name,
      labelledInside: labels.length > 0 ? labels.every((node) => node !== null && dialog.contains(node)) : name !== '',
      tabbables: tabbables.map(text),
      close,
      autofocus: tabbables.findIndex((node) => node.hasAttribute('autofocus')),
      trigger: trigger ? text(trigger) : null,
      focus,
    };
  }, TABBABLE);
}

/** Where focus is, in words, for a failure message. */
function where(snapshot, focus) {
  if (typeof focus === 'number') return focus >= 0 ? `the tabbable element ${focus + 1} of ${snapshot.tabbables.length} (${snapshot.tabbables[focus] || 'unnamed'})` : 'an element of the dialog outside its tab sequence';
  return {
    dialog: 'the dialog element itself',
    trigger: `the trigger (${snapshot.trigger})`,
    away: 'no element of the frame document (focus is outside the document)',
    body: 'the body of the frame document',
    outside: 'an element of the frame document outside the dialog',
    contained: 'the dialog, or outside the document, never on an element of the document outside the dialog',
  }[focus] ?? String(focus);
}

/** Focus values that keep focus out of the document behind a modal dialog (NATIVE). */
const CONTAINED = (focus) => (typeof focus === 'number' && focus >= 0) || focus === 'dialog' || focus === 'away';

/**
 * The state the oracle starts from: the dialog as the frame shows it at rest, read
 * once before the first step. Its tab sequence, close button and name are fixed by
 * the example; open and focus are then computed by the steps (where focus goes on
 * opening is what each check is written for, not what the frame marks autofocus).
 */
export function startDialog(observed) {
  if (observed.tabbables.length < 2) throw new Error(`the dialog needs at least two tabbable elements for its keyboard checks; it has ${observed.tabbables.length}`);
  if (observed.close < 0) throw new Error('the dialog has no close button in its .hw-dialog-header');
  if (observed.trigger === null) throw new Error('the example has no trigger outside the dialog');
  return {
    tabbables: observed.tabbables,
    count: observed.tabbables.length,
    close: observed.close,
    name: observed.name,
    open: observed.open,
    focus: null,
  };
}

/**
 * Fails unless the frame shows the expected state: open (and then modal, named by
 * a title inside it) or closed (and then not modal); right after a step (phase
 * 'after') also the focus, unless it is null. Before a step and in the final read
 * the focus is not asserted: a frame's document loses its focused element once
 * another frame of the page takes the focus (as in lib/tabs.mjs), and every step
 * presses its key on the element the oracle expects to be focused.
 */
export function assertDialog(observed, expected, { phase }) {
  if (observed.open !== expected.open) throw new Error(`the dialog is expected to be ${expected.open ? 'open' : 'closed'}; it is ${observed.open ? 'open' : 'closed'}`);
  if (observed.modal !== expected.open) throw new Error(`the dialog is expected ${expected.open ? 'to be' : 'not to be'} modal (:modal); it ${observed.modal ? 'is' : 'is not'}`);
  if (expected.open) {
    if (observed.name === '' || observed.name !== expected.name) throw new Error(`the open dialog is expected to be named "${expected.name}" by its title; its name is "${observed.name}"`);
    if (!observed.labelledInside) throw new Error('the open dialog is expected to be named by a title inside it (aria-labelledby)');
  }
  if (phase !== 'after' || expected.focus === null) return;
  if (expected.focus === 'contained') {
    if (!CONTAINED(observed.focus)) throw new Error(`focus is expected on ${where(observed, 'contained')}; it is on ${where(observed, observed.focus)}`);
    return;
  }
  if (observed.focus !== expected.focus) throw new Error(`focus is expected on ${where(expected, expected.focus)}; it is on ${where(observed, observed.focus)}`);
}

/**
 * The deliberately wrong oracle of the negative control of every Dialog check: the
 * dialog open where the documented outcome has it closed and the reverse, which
 * differs from the documented outcome for every step.
 */
export function wrongDialog(expected) {
  return { ...expected, open: !expected.open };
}

/**
 * The vanilla markup of the negative control of a Dialog check: a trigger and a
 * modal dialog with a close button and two footer buttons (or the footer button at
 * `autofocus` marked autofocus), as the Dialog page writes them, rendered by the
 * installed @hawiyah/vanilla in scripts/equivalence/test/negative.test.mjs.
 */
export function dialogFixture({ autofocus = -1 } = {}) {
  const footer = ['Cancel', 'Confirm'].map((label, index) => `<button class="hw-button" type="button" data-variant="${index === 0 ? 'secondary' : 'primary'}" data-size="md" data-hw-dialog-close${index === autofocus ? ' autofocus' : ''}>${label}</button>`).join('');
  return '<button class="hw-button" type="button" data-variant="primary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="fixture-dialog">Open</button>'
    + '<dialog class="hw-dialog" id="fixture-dialog" data-hw="dialog" aria-labelledby="fixture-title" aria-describedby="fixture-description">'
    + '<header class="hw-dialog-header"><h2 id="fixture-title">Fixture dialog</h2>'
    + '<button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Close" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header>'
    + '<div class="hw-dialog-body"><p id="fixture-description">Fixture description.</p></div>'
    + `<footer class="hw-dialog-footer">${footer}</footer></dialog>`;
}

/** The parts of a Dialog check that are the same for every Dialog check: how it reads, starts and asserts a frame. */
export const dialogCheck = { read: readDialog, start: startDialog, assert: assertDialog };

/** The trigger of the example (the button outside the dialog that opens it). */
const triggerOf = (mount) => mount.locator('[aria-haspopup="dialog"]').first();
/** The tabbable element at a position of the dialog's tab sequence. */
const tabbableOf = (mount, index) => mount.locator('dialog').locator(TABBABLE).nth(index);

/**
 * Presses a key on the element the oracle expects to be focused (the trigger or a
 * tabbable element of the dialog). A frame loses its focused element when another
 * frame of the page takes focus, so that element is focused again before the key.
 */
export async function pressOnFocused(context, key) {
  const { focus } = context.expected;
  if (focus === 'trigger') return context.press(triggerOf(context.mount), key);
  if (typeof focus === 'number' && focus >= 0) return context.press(tabbableOf(context.mount, focus), key);
  throw new Error(`the oracle does not know the focused element (${focus}); a step after it presses on a named element`);
}

/**
 * Enter or Space on the trigger while the dialog is closed: the dialog opens as a
 * modal dialog named by its title, and focus moves inside it (APG_BUTTON, APG, HTML).
 * Where focus goes is what the check is written for, as the HTML dialog focusing
 * steps define it for the example: `autofocus` is the position in the dialog's tab
 * sequence of the element the example marks autofocus, or null for an example
 * without one, where focus goes to the first focusable descendant (position 0).
 */
export function openStep({ name, key, autofocus = null }) {
  const label = key === 'Space' ? 'Space' : 'Enter';
  const focus = autofocus ?? 0;
  const where = autofocus === null
    ? 'to its first tabbable element, as the example marks no element autofocus'
    : `to the element the example marks autofocus (tabbable element ${autofocus + 1}), not to the first tabbable element`;
  return {
    name,
    keys: [key],
    outcome: `${label} on the trigger opens the dialog as a modal dialog named by its title and moves focus inside it, ${where}.`,
    reference: `${APG_BUTTON}: "${label}: Activates the button." and "If activating the button opens a dialog, the focus moves inside the dialog."; ${APG}, Keyboard Interaction: "When a dialog opens, focus moves to an element inside the dialog."; ${HTML_DIALOG}, showModal() and the dialog focusing steps (the autofocus descendant, else the first focusable descendant)`,
    async run(context) {
      await context.press(triggerOf(context.mount), key);
    },
    expect(previous) {
      if (previous.open) throw new Error('the dialog is already open: the step opens a closed dialog');
      if (focus >= previous.count) throw new Error(`the dialog has ${previous.count} tabbable elements: no element ${focus + 1} for initial focus`);
      return { ...previous, open: true, focus };
    },
  };
}

/**
 * Tab inside the open dialog: focus moves to the next tabbable element; from the last
 * one, focus stays out of the document behind the dialog (NATIVE: the native modal
 * dialog does not wrap as APG describes).
 */
export function tabStep({ name }) {
  return {
    name,
    keys: ['Tab'],
    outcome: 'Tab moves focus to the next tabbable element inside the dialog; from the last one, focus does not reach any element of the page behind the dialog.',
    reference: `${APG}, Keyboard Interaction: "Tab: Moves focus to the next tabbable element inside the dialog." and About This Pattern: "Tab and Shift + Tab do not move focus outside the dialog."; at the last element ${NATIVE} (no wrap to the first element; ${HTML_DIALOG}: the document is blocked by the modal dialog)`,
    run: (context) => pressOnFocused(context, 'Tab'),
    expect(previous) {
      if (!previous.open) throw new Error('the dialog is closed: Tab is checked inside an open dialog');
      return { ...previous, focus: previous.focus < previous.count - 1 ? previous.focus + 1 : 'contained' };
    },
  };
}

/**
 * Shift+Tab inside the open dialog: focus moves to the previous tabbable element;
 * from the first one, focus stays out of the document behind the dialog (NATIVE).
 */
export function shiftTabStep({ name }) {
  return {
    name,
    keys: ['Shift+Tab'],
    outcome: 'Shift + Tab moves focus to the previous tabbable element inside the dialog; from the first one, focus does not reach any element of the page behind the dialog.',
    reference: `${APG}, Keyboard Interaction: "Shift + Tab: Moves focus to the previous tabbable element inside the dialog." and About This Pattern: "Tab and Shift + Tab do not move focus outside the dialog."; at the first element ${NATIVE} (no wrap to the last element; ${HTML_DIALOG}: the document is blocked by the modal dialog)`,
    run: (context) => pressOnFocused(context, 'Shift+Tab'),
    expect(previous) {
      if (!previous.open) throw new Error('the dialog is closed: Shift + Tab is checked inside an open dialog');
      return { ...previous, focus: previous.focus > 0 ? previous.focus - 1 : 'contained' };
    },
  };
}

/**
 * Escape inside the open dialog: the dialog closes and focus returns to the trigger
 * (APG, HTML, CONTRACT). `on` names the tabbable element the key is pressed on when
 * the oracle does not know the focused element (after focus left the document).
 */
export function escapeStep({ name, on = null }) {
  return {
    name,
    keys: ['Escape'],
    outcome: `Escape${on === null ? '' : ` on the tabbable element ${on + 1} of the dialog`} closes the dialog and returns focus to the trigger that opened it.`,
    reference: `${APG}, Keyboard Interaction: "Escape: Closes the dialog." and "When a dialog closes, focus returns to the element that invoked the dialog"; ${HTML_DIALOG}: Escape is a close request (cancel), and closing a modal dialog focuses its previously focused element; ${CONTRACT}`,
    async run(context) {
      if (on === null) await pressOnFocused(context, 'Escape');
      else await context.press(tabbableOf(context.mount, on), 'Escape');
    },
    expect(previous) {
      if (!previous.open) throw new Error('the dialog is closed: Escape is checked inside an open dialog');
      return { ...previous, open: false, focus: 'trigger' };
    },
  };
}

/**
 * Enter or Space on the close button of the open dialog: the dialog closes and focus
 * returns to the trigger (APG_BUTTON, APG, HTML, CONTRACT).
 */
export function closeButtonStep({ name, key }) {
  const label = key === 'Space' ? 'Space' : 'Enter';
  return {
    name,
    keys: [key],
    outcome: `${label} on the close button closes the dialog and returns focus to the trigger that opened it.`,
    reference: `${APG_BUTTON}: "${label}: Activates the button." and "If activating the button closes a dialog, focus typically returns to the button that opened the dialog"; ${APG}, Keyboard Interaction: "When a dialog closes, focus returns to the element that invoked the dialog"; ${HTML_DIALOG}, close the dialog (its previously focused element); ${CONTRACT}`,
    async run(context) {
      await context.press(tabbableOf(context.mount, context.expected.close), key);
    },
    expect(previous) {
      if (!previous.open) throw new Error('the dialog is closed: the close button is checked inside an open dialog');
      return { ...previous, open: false, focus: 'trigger' };
    },
  };
}
