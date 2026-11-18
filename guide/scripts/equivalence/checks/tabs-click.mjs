// Interaction check tabs-click (contentPipeline.equivalence.interactions): click
// the second tab of the group. The harness reads each frame right after its click
// (only the focused frame matches :focus-visible) and compares the four results.

export default {
  name: 'tabs-click',
  steps: [
    {
      name: 'click-second-tab',
      /** @param {{ mount: import('@playwright/test').Locator }} context */
      async run({ mount }) {
        await mount.getByRole('tab').nth(1).click();
      },
    },
  ],
};
