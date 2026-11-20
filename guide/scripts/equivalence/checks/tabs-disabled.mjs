// Interaction check tabs-disabled: the group's text says that a disabled tab
// cannot be selected. The step clicks the disabled tab (forced: a disabled button
// takes no pointer activation, which is the behaviour asserted) and the selection
// must not change; the harness also compares the four results. That the arrow keys
// skip the tab is asserted by tabs-keyboard, which the group names first.
import { assertSelection, readTabs } from './lib/tabs.mjs';

export default {
  name: 'tabs-disabled',
  steps: [
    {
      name: 'click-disabled-tab',
      outcome: 'A click on the disabled tab changes nothing: the selected tab and its panel stay.',
      reference: 'docs/components/tabs.md, Disabled tab: a disabled tab stays in the list and cannot be selected',
      /** @param {{ mount: import('@playwright/test').Locator, state: { selected?: number } }} context */
      async run({ mount, state }) {
        state.selected = (await readTabs(mount)).selected[0];
        const disabled = mount.getByRole('tab', { disabled: true });
        if ((await disabled.count()) !== 1) throw new Error(`expected one disabled tab, found ${await disabled.count()}`);
        await disabled.click({ force: true });
      },
      async expect({ mount, state }) {
        assertSelection(await readTabs(mount), state.selected);
      },
    },
  ],
};
