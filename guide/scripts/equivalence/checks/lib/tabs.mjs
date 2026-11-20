// The Tabs oracle of the keyboard checks (5a.8, leadAmendments A1). Each step
// presses its keys and asserts the documented outcome in every frame; the
// expected outcome is computed from the state before the step, the frame's
// direction and the orientation and activation that the check is written for,
// never from what an adapter does. References, cited per step:
//   APG       WAI-ARIA Authoring Practices, Tabs pattern, Keyboard Interaction
//             (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
//   CONTRACT  CONTRACT.md, Core intended exports: getNextEnabledIndex(current, key,
//             items, direction?, orientation?), specified in packages/core/API.md:
//             "wraps arrows, skips disabled options, supports Home/End ...
//             Horizontal arrows follow visual direction; vertical arrows do not
//             change with RTL."
//   PAGE      docs/components/tabs.md: the selected tab shows its panel and the
//             other panels stay in the document with the hidden attribute.
// This directory holds no check: a group cannot name lib/... (check names match
// ^[a-z][a-z0-9-]*$).

export const APG = 'WAI-ARIA Authoring Practices, Tabs pattern, Keyboard Interaction';
export const CONTRACT = 'CONTRACT.md, Core intended exports, getNextEnabledIndex (packages/core/API.md)';

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

/** Fails unless exactly the tab `index` is selected and shows its panel, every other panel hidden (PAGE; APG roles and states). */
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
 * The state before a step: what the frame shows, with the focused tab that the
 * previous step left (kept in the per-frame state, since a frame's document can
 * lose its focused element while another frame has the focus).
 */
async function before({ mount, state }) {
  return { ...(await readTabs(mount)), focused: state.focused };
}

/**
 * Presses a key on the tab the previous step left focused. A frame loses its
 * focused element when another frame of the page takes focus, so the index is kept
 * in the check's per-frame state and the tab is focused again before the key.
 */
export async function pressOnFocusedTab(context, key) {
  const { mount, state } = context;
  await context.press(mount.getByRole('tab').nth(state.focused), key);
}

/** Focuses the selected tab (a step without keys: the start of a check). */
export function focusSelectedStep() {
  return {
    name: 'focus-selected-tab',
    async run({ mount, state }) {
      await mount.getByRole('tab', { selected: true }).focus();
      state.focused = (await readTabs(mount)).focused;
    },
    outcome: 'Focus is on the selected tab (set up by the check, no key pressed).',
    reference: APG,
    async expect({ mount }) {
      const now = await readTabs(mount);
      assertFocus(now, now.selected[0] ?? -1);
    },
  };
}

/**
 * A step that presses one navigation key (an arrow, Home or End) and asserts the
 * documented outcome: focus on the target tab; with automatic activation that tab
 * is selected and shows its panel, with manual activation the selection stays.
 */
export function moveStep({ name, key, orientation, activation, outcome, reference }) {
  return {
    name,
    keys: [key],
    outcome,
    reference,
    async run(context) {
      context.state.before = await before(context);
      await pressOnFocusedTab(context, key);
      context.state.focused = (await readTabs(context.mount)).focused;
    },
    async expect({ mount, dir, state }) {
      const before = state.before;
      const now = await readTabs(mount);
      const want = target(before, key, { dir, orientation });
      assertFocus(now, want);
      assertSelection(now, activation === 'automatic' ? want : before.selected[0]);
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
      context.state.focused = (await readTabs(context.mount)).focused;
    },
    async expect({ mount }) {
      const now = await readTabs(mount);
      assertFocus(now, now.selected[0] ?? -1);
    },
  };
}

/** Tab from the focused tab: focus moves to the shown panel, which holds no focusable element (APG; PAGE). */
export function tabToPanelStep() {
  return {
    name: 'tab-to-panel',
    keys: ['Tab'],
    outcome: 'Tab from a tab moves focus out of the tab list into the shown panel.',
    reference: `${APG}: "When the tab list contains the focus, moves focus to the next element in the page tab sequence outside the tablist, which is the tabpanel ..."; PAGE: each panel is focusable`,
    async run(context) {
      context.state.before = await before(context);
      await pressOnFocusedTab(context, 'Tab');
    },
    async expect({ mount, state }) {
      const now = await readTabs(mount);
      const selected = state.before.selected[0];
      const shown = now.panels.findIndex((panel) => panel.id === now.controls[selected]);
      if (now.focusedPanel !== shown) {
        throw new Error(`focus is expected on the shown panel ${now.controls[selected]}; it is on ${now.focused >= 0 ? `tab ${now.focused + 1}` : now.focusedPanel >= 0 ? `panel ${now.focusedPanel + 1}` : 'neither a tab nor a panel'}`);
      }
      assertSelection(now, selected);
    },
  };
}

/** Enter or Space with manual activation: the focused tab becomes the selected tab and shows its panel; focus stays (APG). */
export function activateStep({ name, key }) {
  return {
    name,
    keys: [key],
    outcome: `${key} selects the focused tab and shows its panel; focus stays on the tab.`,
    reference: `${APG}: "Space or Enter: Activates the tab if it was not activated automatically on focus."`,
    async run(context) {
      context.state.before = await before(context);
      await pressOnFocusedTab(context, key);
      context.state.focused = (await readTabs(context.mount)).focused;
    },
    async expect({ mount, state }) {
      const now = await readTabs(mount);
      assertFocus(now, state.before.focused);
      assertSelection(now, state.before.focused);
    },
  };
}
