// Interaction check tabs-keyboard (5a.8): a horizontal tab list with automatic
// activation. Tab enters the list on the selected tab, the arrow keys move focus
// and select (Right Arrow next in ltr, previous in rtl; Left Arrow the reverse;
// both wrap and skip disabled tabs), End and Home go to the last and the first
// enabled tab, and Tab leaves the list for the shown panel. Every step asserts its
// documented outcome in every frame (lib/tabs.mjs holds the oracle and its
// references); the harness also compares the four results after each step.
import { APG, CONTRACT, moveStep, tabIntoListStep, tabToPanelStep } from './lib/tabs.mjs';

const ARROW = (key) => `${APG}: "${key === 'ArrowRight' ? 'Right Arrow: Moves focus to the next tab. If focus is on the last tab element, moves focus to the first tab.' : 'Left Arrow: Moves focus to the previous tab. If focus is on the first tab, moves focus to the last tab.'}"; ${CONTRACT}: horizontal arrows follow visual direction, wrap and skip disabled tabs`;
const RIGHT = 'Right Arrow moves focus to the next enabled tab in a left-to-right page and to the previous one in a right-to-left page, and wraps; the focused tab is selected and shows its panel.';
const LEFT = 'Left Arrow moves focus to the previous enabled tab in a left-to-right page and to the next one in a right-to-left page, and wraps; the focused tab is selected and shows its panel.';
const move = (name, key, outcome, reference) => moveStep({ name, key, orientation: 'horizontal', activation: 'automatic', outcome, reference });

export default {
  name: 'tabs-keyboard',
  steps: [
    tabIntoListStep(),
    move('right-arrow', 'ArrowRight', RIGHT, ARROW('ArrowRight')),
    move('left-arrow', 'ArrowLeft', LEFT, ARROW('ArrowLeft')),
    move('left-arrow-again', 'ArrowLeft', LEFT, ARROW('ArrowLeft')),
    move('end', 'End', 'End moves focus to the last enabled tab, which is selected and shows its panel.', `${APG}: "End: Moves focus to the last tab."; ${CONTRACT}: skips disabled tabs`),
    move('right-arrow-again', 'ArrowRight', RIGHT, ARROW('ArrowRight')),
    move('home', 'Home', 'Home moves focus to the first enabled tab, which is selected and shows its panel.', `${APG}: "Home: Moves focus to the first tab."; ${CONTRACT}: skips disabled tabs`),
    tabToPanelStep(),
  ],
};
