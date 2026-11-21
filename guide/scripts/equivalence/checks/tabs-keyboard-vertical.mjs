// Interaction check tabs-keyboard-vertical (5a.8): a vertical tab list with
// automatic activation. Down Arrow and Up Arrow move focus to the next and the
// previous enabled tab in both directions and wrap; Right Arrow and Left Arrow
// change nothing; the rest is tabs-keyboard.
// Every step asserts its documented outcome in every frame (lib/tabs.mjs).
import { APG, CONTRACT, moveStep, tabIntoListStep, tabToPanelStep, tabsCheck, tabsFixture, unhandledStep, wrongTabs } from './lib/tabs.mjs';

const VERTICAL = `${APG}: "If the tab list is vertical, Down Arrow performs as Right Arrow, and Up Arrow performs as Left Arrow."; ${CONTRACT}: vertical arrows do not change with RTL`;
const DOWN = 'Down Arrow moves focus to the next enabled tab in both reading directions, and wraps; the focused tab is selected and shows its panel.';
const UP = 'Up Arrow moves focus to the previous enabled tab in both reading directions, and wraps; the focused tab is selected and shows its panel.';
const move = (name, key, outcome, reference) => moveStep({ name, key, orientation: 'vertical', activation: 'automatic', outcome, reference });

export default {
  name: 'tabs-keyboard-vertical',
  ...tabsCheck,
  negative: { fixture: tabsFixture({ orientation: 'vertical' }), wrong: wrongTabs },
  steps: [
    tabIntoListStep(),
    move('down-arrow', 'ArrowDown', DOWN, VERTICAL),
    unhandledStep({ name: 'right-arrow-unhandled', key: 'ArrowRight', orientation: 'vertical' }),
    unhandledStep({ name: 'left-arrow-unhandled', key: 'ArrowLeft', orientation: 'vertical' }),
    move('up-arrow', 'ArrowUp', UP, VERTICAL),
    move('up-arrow-again', 'ArrowUp', UP, VERTICAL),
    move('end', 'End', 'End moves focus to the last enabled tab, which is selected and shows its panel.', `${APG}: "End: Moves focus to the last tab."; ${CONTRACT}: skips disabled tabs`),
    move('down-arrow-again', 'ArrowDown', DOWN, VERTICAL),
    move('home', 'Home', 'Home moves focus to the first enabled tab, which is selected and shows its panel.', `${APG}: "Home: Moves focus to the first tab."; ${CONTRACT}: skips disabled tabs`),
    tabToPanelStep(),
  ],
};
