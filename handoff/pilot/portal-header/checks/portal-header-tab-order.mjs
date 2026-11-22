// Interaction check portal-header-tab-order: the Tab sequence of a header with a skip
// link, a brand link, a navigation of a link, a collapsed branch and two links, and one
// action. Tab enters the header on the skip link, then reaches the brand, the menu
// toggle below 48rem, the navigation entries (not the links of a collapsed branch) and
// the actions in the order of PORTAL.md. Step 80 runs it at 1280 px (from 48rem: no
// menu toggle, the navigation shown); the negative control runs it at 720 px (below
// 48rem: the toggle is in the sequence, focus-first-entry expands the navigation with a
// click, and Tab from the last entry to the actions collapses it). lib/portal-header.mjs
// holds the oracle and its references.
import { focusStep, portalHeaderCheck, portalHeaderFixture, tabIntoHeaderStep, tabStep, wrongPortalHeader } from './lib/portal-header.mjs';

export default {
  name: 'portal-header-tab-order',
  ...portalHeaderCheck,
  negative: { fixture: portalHeaderFixture(), wrong: wrongPortalHeader },
  steps: [
    tabIntoHeaderStep(),
    tabStep({ name: 'tab-from-skip-link', outcome: 'Tab from the skip link moves focus to the brand link.' }),
    tabStep({ name: 'tab-from-brand', outcome: 'Tab from the brand moves focus to the first navigation entry from 48rem, and to the menu toggle below 48rem.' }),
    focusStep({ name: 'focus-first-entry', kind: 'entry', outcome: 'Focus is on the first navigation entry, with the navigation expanded below 48rem (set up by the check with a click on the menu toggle, no key pressed).' }),
    tabStep({ name: 'tab-to-collapsed-branch', outcome: 'Tab moves focus to the summary of the next entry, a collapsed branch.' }),
    tabStep({ name: 'tab-past-collapsed-branch', outcome: 'Tab from the summary of a collapsed branch moves focus to the next navigation entry, past the links of the branch.' }),
    tabStep({ name: 'tab-to-last-entry', outcome: 'Tab moves focus to the next navigation entry in document order.' }),
    // Below 48rem this step fails against the reference with @hawiyah/vanilla 0.3.0 (the
    // negative control, both directions): the navigation stays expanded when focus moves
    // from its last entry to the actions. Reference T5 of the check author (CONTRACT.md,
    // Unavailable controls and focus; PORTAL.md "moving focus out ... closes it") is kept;
    // the lead decides (possible package defect or a reading of the reference to revise).
    tabStep({ name: 'tab-to-actions', outcome: 'Tab from the last navigation entry moves focus to the first control of the actions; below 48rem the navigation that focus leaves collapses.' }),
  ],
};
