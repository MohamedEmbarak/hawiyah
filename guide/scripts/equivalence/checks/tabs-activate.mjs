// Interaction check tabs-activate (contentPipeline.equivalence.interactions): the
// group's text says that with manual activation the arrow keys move focus without
// changing the panel and Enter or Space selects the focused tab. From the
// selected tab the step presses the key to the next tab (the results are compared:
// the panel must not change), then Enter, then the key to the next tab and Space.
import { nextTabKey } from './tabs-keyboard.mjs';

/** Index of the focused tab, read while the frame has the system focus. */
async function focusedTab(mount) {
  const index = await mount.getByRole('tab').evaluateAll((elements) => elements.indexOf(document.activeElement));
  if (index < 0) throw new Error('no tab has focus');
  return index;
}

async function press(mount, state, key) {
  await mount.getByRole('tab').nth(state.focused).press(key);
  state.focused = await focusedTab(mount);
}

const next = async ({ mount, dir, state }) => {
  const orientation = (await mount.getByRole('tablist').getAttribute('aria-orientation')) ?? 'horizontal';
  await press(mount, state, nextTabKey(dir, orientation));
};

export default {
  name: 'tabs-activate',
  steps: [
    {
      name: 'focus-next-tab',
      /** @param {{ mount: import('@playwright/test').Locator, dir: string, state: { focused?: number } }} context */
      async run(context) {
        await context.mount.getByRole('tab', { selected: true }).focus();
        context.state.focused = await focusedTab(context.mount);
        await next(context);
      },
    },
    {
      name: 'enter',
      async run({ mount, state }) {
        await press(mount, state, 'Enter');
      },
    },
    {
      name: 'focus-next-tab-again',
      async run(context) {
        await next(context);
      },
    },
    {
      name: 'space',
      async run({ mount, state }) {
        await press(mount, state, ' ');
      },
    },
  ],
};
