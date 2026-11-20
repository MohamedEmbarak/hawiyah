// Interaction check tabs-click: click the second tab of the group; it is selected
// and shows its panel. The harness reads each frame right after its click (only
// the focused frame matches :focus-visible) and compares the four results.
import { APG, assertSelection, readTabs } from './lib/tabs.mjs';

export default {
  name: 'tabs-click',
  steps: [
    {
      name: 'click-second-tab',
      outcome: 'A click on the second tab selects it and shows its panel.',
      reference: `${APG} (activation of a tab); docs/components/tabs.md: the selected tab shows its panel`,
      /** @param {{ mount: import('@playwright/test').Locator }} context */
      async run({ mount }) {
        await mount.getByRole('tab').nth(1).click();
      },
      async expect({ mount }) {
        assertSelection(await readTabs(mount), 1);
      },
    },
  ],
};
