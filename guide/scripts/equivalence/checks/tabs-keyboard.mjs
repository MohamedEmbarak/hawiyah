// Interaction check tabs-keyboard (contentPipeline.equivalence.interactions): focus
// the selected tab, press the arrow key that moves to the next tab in the frame's
// direction (ArrowRight in ltr, ArrowLeft in rtl; ArrowDown for a vertical tab
// list), then End, then Home. The harness runs each step in a frame and reads that
// frame's result before it moves to the next frame, then compares the four results.

/** The key that moves to the next tab for a direction and an orientation. */
export function nextTabKey(dir, orientation) {
  if (orientation === 'vertical') return 'ArrowDown';
  return dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
}

/** Index of the focused tab, read while the frame has the system focus. */
async function focusedTab(mount) {
  const index = await mount.getByRole('tab').evaluateAll((elements) => elements.indexOf(document.activeElement));
  if (index < 0) throw new Error('no tab has focus');
  return index;
}

/**
 * Presses a key on the tab the previous step left focused. A frame loses its
 * focused element when another frame of the page takes focus, so the index is kept
 * in the check's per-frame state and the tab is focused again before the key.
 */
async function pressOnFocusedTab(mount, state, key) {
  await mount.getByRole('tab').nth(state.focused).press(key);
  state.focused = await focusedTab(mount);
}

export default {
  name: 'tabs-keyboard',
  steps: [
    {
      name: 'focus-selected-tab',
      /** @param {{ mount: import('@playwright/test').Locator, state: { focused?: number } }} context */
      async run({ mount, state }) {
        await mount.getByRole('tab', { selected: true }).focus();
        state.focused = await focusedTab(mount);
      },
    },
    {
      name: 'next-tab-key',
      async run({ mount, dir, state }) {
        const orientation = (await mount.getByRole('tablist').getAttribute('aria-orientation')) ?? 'horizontal';
        await pressOnFocusedTab(mount, state, nextTabKey(dir, orientation));
      },
    },
    {
      name: 'end',
      async run({ mount, state }) {
        await pressOnFocusedTab(mount, state, 'End');
      },
    },
    {
      name: 'home',
      async run({ mount, state }) {
        await pressOnFocusedTab(mount, state, 'Home');
      },
    },
  ],
};
