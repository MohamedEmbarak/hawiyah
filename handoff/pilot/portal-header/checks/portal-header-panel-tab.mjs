// Interaction check portal-header-panel-tab: Tab through the links of an expanded
// branch, in document order, and out of it: focus moves to the next navigation entry and
// the branch that focus leaves collapses, without focus moving back (CONTRACT.md). Step
// 80 runs it at 1280 px; the negative control at 720 px (below 48rem, the navigation
// expanded by focus-second-branch). lib/portal-header.mjs holds the oracle and its
// references.
import { activateStep, focusStep, portalHeaderCheck, portalHeaderFixture, tabStep, wrongPortalHeader } from './lib/portal-header.mjs';

export default {
  name: 'portal-header-panel-tab',
  ...portalHeaderCheck,
  negative: { fixture: portalHeaderFixture(), wrong: wrongPortalHeader },
  steps: [
    focusStep({ name: 'focus-second-branch', kind: 'summary', branch: 1, outcome: 'Focus is on the summary of the second branch, every branch collapsed, the navigation expanded below 48rem (set up by the check, no key pressed).' }),
    activateStep({ name: 'enter-expands', key: 'Enter', outcome: 'Enter on the summary of a collapsed branch expands it and shows its panel; focus stays on the summary.' }),
    tabStep({ name: 'tab-into-panel', outcome: 'Tab from the summary of an expanded branch moves focus to the first link of its panel.' }),
    tabStep({ name: 'tab-through-panel', outcome: 'Tab moves focus to the next link of the expanded panel in document order.' }),
    tabStep({ name: 'tab-to-last-panel-link', outcome: 'Tab moves focus to the last link of the expanded panel.' }),
    tabStep({ name: 'tab-out-of-branch', outcome: 'Tab from the last link of an expanded branch moves focus to the next navigation entry, and the branch that focus leaves collapses.' }),
  ],
};
