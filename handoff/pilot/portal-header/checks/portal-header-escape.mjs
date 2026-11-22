// Interaction check portal-header-escape: Escape in an expanded branch. From a link of
// the expanded panel, Escape collapses the branch and moves focus to its summary; on the
// summary of an expanded branch it collapses the branch and focus stays; with nothing
// expanded it changes nothing from 48rem, and below 48rem it collapses the expanded
// navigation and moves focus to the menu toggle. Tab from a collapsed summary goes past
// its links to the next branch. Step 80 runs it at 1280 px; the negative control at
// 720 px (below 48rem). lib/portal-header.mjs holds the oracle and its references.
import { REF, activateStep, escapeStep, focusStep, portalHeaderCheck, portalHeaderFixture, tabStep, wrongPortalHeader } from './lib/portal-header.mjs';

const EXPAND = (key) => `${key} on the summary of a collapsed branch expands it and shows its panel; focus stays on the summary.`;

export default {
  name: 'portal-header-escape',
  ...portalHeaderCheck,
  negative: { fixture: portalHeaderFixture(), wrong: wrongPortalHeader },
  steps: [
    focusStep({ name: 'focus-first-branch', kind: 'summary', branch: 0, outcome: 'Focus is on the summary of the first branch, every branch collapsed, the navigation expanded below 48rem (set up by the check, no key pressed).' }),
    activateStep({ name: 'enter-expands', key: 'Enter', outcome: EXPAND('Enter') }),
    tabStep({ name: 'tab-into-panel', outcome: 'Tab from the summary of an expanded branch moves focus to the first link of its panel; the branch stays expanded.' }),
    escapeStep({ name: 'escape-from-panel-link', outcome: 'Escape on a link of an expanded branch collapses the branch and moves focus to its summary.', reference: REF.escapeBranch }),
    tabStep({ name: 'tab-past-collapsed-branch', outcome: 'Tab from the summary of a collapsed branch moves focus to the next navigation entry, the summary of the next branch, past the links of the first.' }),
    activateStep({ name: 'space-expands-second', key: 'Space', outcome: EXPAND('Space') }),
    escapeStep({ name: 'escape-on-summary', outcome: 'Escape on the summary of an expanded branch collapses the branch; focus stays on the summary.', reference: REF.escapeBranch }),
    escapeStep({ name: 'escape-with-nothing-expanded', outcome: 'Escape with no branch expanded changes nothing from 48rem; below 48rem it collapses the expanded navigation and moves focus to the menu toggle.', reference: `${REF.escapeNothing}; ${REF.escapeMenu}` }),
  ],
};
