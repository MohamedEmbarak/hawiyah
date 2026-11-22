// Interaction check portal-header-menu: the menu toggle of the navigation below 48rem.
// Enter and Space on the toggle expand and collapse the navigation (aria-expanded on the
// toggle follows) and keep focus on it; Tab from the expanded toggle enters the
// navigation; Escape in the expanded navigation collapses it and moves focus back to
// the toggle; Tab from the collapsed toggle goes past the navigation to the actions.
// Every step is written for the narrow layout only (onlyIn): the toggle is not rendered
// from 48rem. The negative control renders its fixture at 720 px, below 48rem, so
// npm run test:scripts runs it there with the installed @hawiyah/vanilla. Step 80 runs
// the checks of a framed group only in frames 1280 px wide, where the toggle is not
// shown, so no group names this check yet (a harness limit reported to the lead: a
// check cannot ask for the 390 px frames of width=390). lib/portal-header.mjs holds the
// oracle and its references.
import { REF, activateStep, escapeStep, focusStep, onlyIn, portalHeaderCheck, portalHeaderFixture, tabStep, wrongPortalHeader } from './lib/portal-header.mjs';

const EXPAND = (key) => `Below 48rem, ${key} on the collapsed menu toggle expands the navigation and sets aria-expanded to true; focus stays on the toggle.`;
const COLLAPSE = (key) => `Below 48rem, ${key} on the expanded menu toggle collapses the navigation and sets aria-expanded to false; focus stays on the toggle.`;
const narrow = (step) => onlyIn('narrow', step);

export default {
  name: 'portal-header-menu',
  ...portalHeaderCheck,
  negative: { fixture: portalHeaderFixture(), wrong: wrongPortalHeader },
  steps: [
    narrow(focusStep({ name: 'focus-menu-toggle', kind: 'toggle', outcome: 'Focus is on the menu toggle, the navigation collapsed (set up by the check, no key pressed).' })),
    narrow(activateStep({ name: 'enter-expands-navigation', key: 'Enter', outcome: EXPAND('Enter') })),
    narrow(activateStep({ name: 'enter-collapses-navigation', key: 'Enter', outcome: COLLAPSE('Enter') })),
    narrow(activateStep({ name: 'space-expands-navigation', key: 'Space', outcome: EXPAND('Space') })),
    narrow(tabStep({ name: 'tab-into-navigation', outcome: 'Below 48rem, Tab from the expanded menu toggle moves focus to the first navigation entry.' })),
    narrow(escapeStep({ name: 'escape-collapses-navigation', outcome: 'Below 48rem, Escape in the expanded navigation, with no branch expanded, collapses it and moves focus to the menu toggle.', reference: REF.escapeMenu })),
    narrow(activateStep({ name: 'space-expands-navigation-again', key: 'Space', outcome: EXPAND('Space') })),
    narrow(activateStep({ name: 'space-collapses-navigation', key: 'Space', outcome: COLLAPSE('Space') })),
    narrow(tabStep({ name: 'tab-past-collapsed-navigation', outcome: 'Below 48rem, Tab from the collapsed menu toggle moves focus to the first control of the actions, past the hidden navigation.' })),
  ],
};
