// Interaction check tabs-disabled: the group's text says that a disabled tab
// cannot be selected. The step clicks the disabled tab (forced: a disabled button
// takes no pointer activation, which is the behaviour asserted) and the selection
// must not change; the harness also compares the four results. That the arrow keys
// skip the tab is asserted by tabs-keyboard, which the group names first; the group
// has four tabs with the second disabled, so the two reading directions reach
// different tabs.
import { HTML_DISABLED, UNAVAILABLE, tabsCheck, tabsFixture, wrongTabs } from './lib/tabs.mjs';

export default {
  name: 'tabs-disabled',
  ...tabsCheck,
  negative: { fixture: tabsFixture({ disabled: 1, count: 4 }), wrong: wrongTabs },
  steps: [
    {
      name: 'click-disabled-tab',
      outcome: 'A click on the disabled tab changes nothing: the selected tab and its panel stay.',
      reference: `${HTML_DISABLED}; ${UNAVAILABLE}`,
      /** @param {{ mount: import('@playwright/test').Locator }} context */
      async run({ mount }) {
        const disabled = mount.getByRole('tab', { disabled: true });
        if ((await disabled.count()) !== 1) throw new Error(`expected one disabled tab, found ${await disabled.count()}`);
        await disabled.click({ force: true });
      },
      // The selection stays; the focus a forced click leaves is not asserted.
      expect: (previous) => ({ ...previous, focused: null, focusedPanel: -1 }),
    },
  ],
};
