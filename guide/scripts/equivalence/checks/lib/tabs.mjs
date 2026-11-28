// The Tabs oracle of the keyboard checks, in its chained form. Each step presses its keys and returns the state the
// oracle expects after it, computed from the state it expected before the step, the
// frame's direction and the orientation and activation that the check is written
// for, never from what an adapter does or what the frame shows; the harness asserts
// it in every frame (assertTabs). References, cited per step:
//   APG       WAI-ARIA Authoring Practices, Tabs pattern, Keyboard Interaction
//             (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
//   CONTRACT  CONTRACT.md, Core intended exports: getNextEnabledIndex(current, key,
//             items, direction?, orientation?), specified in packages/core/API.md:
//             "wraps arrows, skips disabled options, supports Home/End ...
//             Horizontal arrows follow visual direction; vertical arrows do not
//             change with RTL. Unhandled keys keep current."
//   HTML      HTML Standard, the disabled attribute: "A form control that is
//             disabled must prevent any click events that are queued on the user
//             interaction task source from being dispatched on the element."
//   UNAVAILABLE  CONTRACT.md, Unavailable controls and focus: "The disabled
//             attribute remains for unavailability the reader did not cause on
//             that control."
// The expectations for Home, End and Tab with manual activation, for unhandled
// arrow keys and for four tabs with the second disabled were written from these
// references before they ran.
// This directory holds no check: a group cannot name lib/... (check names match
// ^[a-z][a-z0-9-]*$).

export const APG = 'WAI-ARIA Authoring Practices, Tabs pattern, Keyboard Interaction';
export const CONTRACT = 'CONTRACT.md, Core intended exports, getNextEnabledIndex (packages/core/API.md)';
export const HTML_DISABLED = 'HTML Standard, the disabled attribute: "A form control that is disabled must prevent any click events that are queued on the user interaction task source from being dispatched on the element."';
export const UNAVAILABLE = 'CONTRACT.md, Unavailable controls and focus: "The disabled attribute remains for unavailability the reader did not cause on that control."';

/** What a frame shows of its tab list: the tabs, the focused tab or panel, the selection and the visible panels. */
export async function readTabs(mount) {
  return mount.evaluate((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    const active = root.ownerDocument.activeElement;
    return {
      count: tabs.length,
      disabled: tabs.map((tab) => tab.disabled === true || tab.getAttribute('aria-disabled') === 'true'),
      focused: tabs.indexOf(active),
      focusedPanel: panels.findIndex((panel) => panel === active),
      selected: tabs.flatMap((tab, index) => (tab.getAttribute('aria-selected') === 'true' ? [index] : [])),
      tabIds: tabs.map((tab) => tab.id),
      controls: tabs.map((tab) => tab.getAttribute('aria-controls')),
      panels: panels.map((panel) => ({ id: panel.id, hidden: panel.hidden, labelledBy: panel.getAttribute('aria-labelledby') })),
    };
  });
}

const enabled = (snapshot) => snapshot.disabled.flatMap((off, index) => (off ? [] : [index]));

/** The next enabled tab after index, wrapping (CONTRACT). */
export function nextEnabled(snapshot, index) {
  for (let step = 1; step <= snapshot.count; step += 1) {
    const candidate = (index + step) % snapshot.count;
    if (!snapshot.disabled[candidate]) return candidate;
  }
  return index;
}

/** The previous enabled tab before index, wrapping (CONTRACT). */
export function previousEnabled(snapshot, index) {
  for (let step = 1; step <= snapshot.count; step += 1) {
    const candidate = (index - step + snapshot.count) % snapshot.count;
    if (!snapshot.disabled[candidate]) return candidate;
  }
  return index;
}

/**
 * The tab a key moves focus to (APG; CONTRACT): horizontal Right Arrow is next in
 * ltr and previous in rtl, Left Arrow the reverse; vertical Down Arrow is next and
 * Up Arrow previous in both directions; Home and End the first and last enabled tab.
 */
export function target(snapshot, key, { dir, orientation }) {
  const from = snapshot.focused;
  const list = enabled(snapshot);
  if (key === 'Home') return list[0];
  if (key === 'End') return list[list.length - 1];
  const forward = orientation === 'vertical'
    ? { ArrowDown: true, ArrowUp: false }[key]
    : { ArrowRight: dir !== 'rtl', ArrowLeft: dir === 'rtl' }[key];
  if (forward === undefined) throw new Error(`the oracle has no outcome for ${key} in a ${orientation} tab list`);
  return forward ? nextEnabled(snapshot, from) : previousEnabled(snapshot, from);
}

/** Fails unless exactly the tab `index` is selected and shows its panel, every other panel hidden, labelled by its tab (APG, WAI-ARIA Roles, States, and Properties). */
export function assertSelection(snapshot, index) {
  if (snapshot.selected.length !== 1 || snapshot.selected[0] !== index) {
    throw new Error(`tab ${index + 1} of ${snapshot.count} is expected to be the one selected tab; selected: ${snapshot.selected.map((i) => i + 1).join(', ') || 'none'}`);
  }
  const visible = snapshot.panels.filter((panel) => !panel.hidden);
  const id = snapshot.controls[index];
  if (visible.length !== 1 || visible[0].id !== id) {
    throw new Error(`only the panel ${id} of the selected tab is expected to be shown; shown: ${visible.map((panel) => panel.id).join(', ') || 'none'}`);
  }
  if (visible[0].labelledBy !== snapshot.tabIds[index]) {
    throw new Error(`the shown panel is expected to be labelled by its tab ${snapshot.tabIds[index]}; aria-labelledby is ${visible[0].labelledBy}`);
  }
}

/** Fails unless focus is on tab `index`. */
export function assertFocus(snapshot, index) {
  if (snapshot.focused !== index) {
    const where = snapshot.focused >= 0 ? `tab ${snapshot.focused + 1}` : snapshot.focusedPanel >= 0 ? `panel ${snapshot.focusedPanel + 1}` : 'no tab';
    throw new Error(`focus is expected on tab ${index + 1} of ${snapshot.count}; it is on ${where}`);
  }
}

/**
 * The state the oracle starts from: the tab list as the
 * frame shows it at rest, read once before the first step. Every later state is
 * computed by the steps from the one before.
 */
export function startTabs(observed) {
  return {
    count: observed.count,
    disabled: observed.disabled,
    tabIds: observed.tabIds,
    controls: observed.controls,
    panelIds: observed.panels.map((panel) => panel.id),
    selected: observed.selected[0] ?? -1,
    focused: observed.focused,
    focusedPanel: observed.focusedPanel,
  };
}

/**
 * Fails unless the frame shows the expected state: its selection and shown panel,
 * and right after a step (phase 'after') the focused tab or panel; a focus of null
 * is not asserted. Before a step and in the final read the focus is not asserted: a
 * frame's document loses its focused element once another frame of the page takes
 * the focus (measured: the final read found the body focused in every frame but the
 * last), and pressOnFocusedTab focuses the expected tab again before its key.
 */
export function assertTabs(observed, expected, { phase }) {
  assertSelection(observed, expected.selected);
  if (phase !== 'after' || expected.focused === null) return;
  if (expected.focusedPanel >= 0) {
    if (observed.focusedPanel !== expected.focusedPanel) {
      throw new Error(`focus is expected on the shown panel ${expected.panelIds[expected.focusedPanel]}; it is on ${observed.focused >= 0 ? `tab ${observed.focused + 1}` : observed.focusedPanel >= 0 ? `panel ${observed.focusedPanel + 1}` : 'neither a tab nor a panel'}`);
    }
    return;
  }
  if (expected.focused >= 0) assertFocus(observed, expected.focused);
}

/**
 * The deliberately wrong oracle of the negative control of every Tabs check: the
 * selection, and the focus when it is asserted, one tab further than the documented
 * outcome (wrapping), which differs from it for every step of a list of two or more tabs.
 */
export function wrongTabs(expected) {
  const shift = (index) => (index >= 0 ? (index + 1) % expected.count : index);
  const selected = shift(expected.selected);
  const focusedPanel = expected.focusedPanel >= 0 ? expected.panelIds.indexOf(expected.controls[selected]) : expected.focusedPanel;
  return { ...expected, selected, focused: expected.focused === null ? null : shift(expected.focused), focusedPanel };
}

/**
 * The vanilla markup of the negative control of a Tabs check: three tabs (or `count`), the first selected, as the Tabs page writes them, rendered by
 * the installed @hawiyah/vanilla in scripts/equivalence/test/negative.test.mjs.
 */
export function tabsFixture({ orientation = 'horizontal', activation = 'automatic', disabled = -1, count = 3 } = {}) {
  const names = ['one', 'two', 'three', 'four'].slice(0, count);
  const tabs = names.map((name, index) => `<button class="hw-tab" type="button" role="tab" id="tab-${name}" aria-controls="panel-${name}" aria-selected="${index === 0}" data-hw-value="${name}"${index === disabled ? ' disabled' : ''}>Tab ${index + 1}</button>`).join('');
  const panels = names.map((name, index) => `<section class="hw-tab-panel" id="panel-${name}" role="tabpanel" aria-labelledby="tab-${name}"${index === 0 ? '' : ' hidden'}><p>Panel ${index + 1}</p></section>`).join('');
  return `<div class="hw-tabs" data-hw="tabs" data-hw-overflow="scroll"${activation === 'manual' ? ' data-hw-activation="manual"' : ''}><div class="hw-tab-list" role="tablist" aria-label="Tabs" aria-orientation="${orientation}">${tabs}</div>${panels}</div>`;
}

/** The parts of a Tabs check that are the same for every Tabs check: how it reads, starts and asserts a frame. */
export const tabsCheck = { read: readTabs, start: startTabs, assert: assertTabs };

/**
 * Presses a key on the tab the oracle expects to be focused. A frame loses its
 * focused element when another frame of the page takes focus, so the expected tab is
 * focused again before the key.
 */
export async function pressOnFocusedTab(context, key) {
  await context.press(context.mount.getByRole('tab').nth(context.expected.focused), key);
}

/** Focuses the selected tab (a step without keys: the start of a check). */
export function focusSelectedStep() {
  return {
    name: 'focus-selected-tab',
    async run({ mount }) {
      await mount.getByRole('tab', { selected: true }).focus();
    },
    outcome: 'Focus is on the selected tab (set up by the check, no key pressed).',
    reference: APG,
    expect: (previous) => ({ ...previous, focused: previous.selected, focusedPanel: -1 }),
  };
}

/**
 * A step that presses one navigation key (an arrow, Home or End): focus moves to the
 * target tab; with automatic activation that tab is selected and shows its panel,
 * with manual activation the selection stays.
 */
export function moveStep({ name, key, orientation, activation, outcome, reference }) {
  return {
    name,
    keys: [key],
    outcome,
    reference,
    run: (context) => pressOnFocusedTab(context, key),
    expect(previous, { dir }) {
      const want = target(previous, key, { dir, orientation });
      return { ...previous, focused: want, focusedPanel: -1, selected: activation === 'automatic' ? want : previous.selected };
    },
  };
}

/** Tab into the tab list from the start of the frame document: focus lands on the selected tab (APG). */
export function tabIntoListStep() {
  return {
    name: 'tab-into-list',
    keys: ['Tab'],
    outcome: 'Tab from before the tab list moves focus to the selected tab.',
    reference: `${APG}: "When focus moves into the tab list, places focus on the active tab element."`,
    async run(context) {
      await context.focusFrameStart();
      await context.press(null, 'Tab');
    },
    expect: (previous) => ({ ...previous, focused: previous.selected, focusedPanel: -1 }),
  };
}

/** Tab from the focused tab: focus moves to the shown panel (the panel of the selected tab, which holds no focusable element), not to the panel of the focused tab (APG). */
export function tabToPanelStep() {
  return {
    name: 'tab-to-panel',
    keys: ['Tab'],
    outcome: 'Tab from a tab moves focus out of the tab list into the shown panel.',
    reference: `${APG}: "When the tab list contains the focus, moves focus to the next element in the page tab sequence outside the tablist, which is the tabpanel unless the first element containing meaningful content inside the tabpanel is focusable."`,
    run: (context) => pressOnFocusedTab(context, 'Tab'),
    expect: (previous) => ({ ...previous, focused: -1, focusedPanel: previous.panelIds.indexOf(previous.controls[previous.selected]) }),
  };
}

/** Enter or Space with manual activation: the focused tab becomes the selected tab and shows its panel; focus stays (APG). */
export function activateStep({ name, key }) {
  return {
    name,
    keys: [key],
    outcome: `${key} selects the focused tab and shows its panel; focus stays on the tab.`,
    reference: `${APG}: "Space or Enter: Activates the tab if it was not activated automatically on focus."`,
    run: (context) => pressOnFocusedTab(context, key),
    expect: (previous) => ({ ...previous, selected: previous.focused }),
  };
}

/**
 * An arrow key that the orientation of the list does not handle (Up and Down Arrow
 * in a horizontal list, Right and Left Arrow in a vertical one): focus and the
 * selection stay (CONTRACT: "Unhandled keys keep current").
 */
export function unhandledStep({ name, key, orientation }) {
  const handled = orientation === 'vertical' ? 'Down Arrow and Up Arrow' : 'Right Arrow and Left Arrow';
  const label = { ArrowRight: 'Right Arrow', ArrowLeft: 'Left Arrow', ArrowUp: 'Up Arrow', ArrowDown: 'Down Arrow' }[key];
  return {
    name,
    keys: [key],
    outcome: `In a ${orientation} tab list, ${label} changes nothing: focus and the selected tab stay.`,
    reference: `${CONTRACT}: "Unhandled keys keep current."; a ${orientation} list handles ${handled} (${APG})`,
    run: (context) => pressOnFocusedTab(context, key),
    expect: (previous) => ({ ...previous }),
  };
}
