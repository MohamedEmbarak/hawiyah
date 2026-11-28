// Interaction check tabs-click: click the second tab of the group; it is selected
// and shows its panel. The harness reads each frame right after its click (only
// the focused frame matches :focus-visible) and compares the four results.
import { APG, tabsCheck, tabsFixture, wrongTabs } from './lib/tabs.mjs';

export default {
  name: 'tabs-click',
  ...tabsCheck,
  negative: { fixture: tabsFixture(), wrong: wrongTabs },
  steps: [
    {
      name: 'click-second-tab',
      outcome: 'A click on the second tab selects it and shows its panel.',
      reference: `${APG}, WAI-ARIA Roles, States, and Properties: the active tab has aria-selected set to true and controls its tabpanel, which is labelled by the tab; HTML Standard: a click on a button element runs its activation behaviour`,
      /** @param {{ mount: import('@playwright/test').Locator }} context */
      async run({ mount }) {
        await mount.getByRole('tab').nth(1).click();
      },
      // The focus a click leaves is not asserted.
      expect: (previous) => ({ ...previous, selected: 1, focused: null, focusedPanel: -1 }),
    },
  ],
};
