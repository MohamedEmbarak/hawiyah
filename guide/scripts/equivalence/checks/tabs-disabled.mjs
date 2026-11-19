// Interaction check tabs-disabled (contentPipeline.equivalence.interactions): the
// group's text says that a disabled tab cannot be selected. The step clicks the
// disabled tab (forced: a disabled button takes no pointer activation, which is
// the behaviour compared) and the harness compares the four results, so a
// framework that selects the tab or shows its panel fails. That the arrow keys
// skip the tab is exercised by tabs-keyboard, which the group names first.

export default {
  name: 'tabs-disabled',
  steps: [
    {
      name: 'click-disabled-tab',
      /** @param {{ mount: import('@playwright/test').Locator }} context */
      async run({ mount }) {
        const disabled = mount.getByRole('tab', { disabled: true });
        if ((await disabled.count()) !== 1) throw new Error(`expected one disabled tab, found ${await disabled.count()}`);
        await disabled.click({ force: true });
      },
    },
  ],
};
