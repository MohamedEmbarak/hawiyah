// Interaction check portal-header-branch: Enter and Space on the summary of a branch (a
// native details element of grouped links) expand and collapse it and keep focus on the
// summary. Step 80 runs it at 1280 px; the negative control runs it at 720 px, below
// 48rem, where focus-first-branch first expands the navigation with a click on the
// menu toggle. lib/portal-header.mjs holds the oracle and its references; the branch
// checks are three modules (branch, escape, panel-tab) because the negative control of
// a module has 120 s, and below 48rem every step in an expanded navigation waits for
// the frame height of the stand-in page.
import { activateStep, focusStep, portalHeaderCheck, portalHeaderFixture, wrongPortalHeader } from './lib/portal-header.mjs';

export const EXPAND = (key) => `${key} on the summary of a collapsed branch expands it and shows its panel; focus stays on the summary.`;
export const COLLAPSE = (key) => `${key} on the summary of an expanded branch collapses it and hides its panel; focus stays on the summary.`;

export default {
  name: 'portal-header-branch',
  ...portalHeaderCheck,
  negative: { fixture: portalHeaderFixture(), wrong: wrongPortalHeader },
  steps: [
    focusStep({ name: 'focus-first-branch', kind: 'summary', branch: 0, outcome: 'Focus is on the summary of the first branch, every branch collapsed, the navigation expanded below 48rem (set up by the check, no key pressed).' }),
    activateStep({ name: 'enter-expands', key: 'Enter', outcome: EXPAND('Enter') }),
    activateStep({ name: 'enter-collapses', key: 'Enter', outcome: COLLAPSE('Enter') }),
    activateStep({ name: 'space-expands', key: 'Space', outcome: EXPAND('Space') }),
    activateStep({ name: 'space-collapses', key: 'Space', outcome: COLLAPSE('Space') }),
  ],
};
