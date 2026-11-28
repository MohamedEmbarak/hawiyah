// Interaction check tabs-activate: a horizontal tab list with manual
// activation. The arrow keys move focus without changing the selected tab or its
// panel; Enter and Space select the focused tab; End and Home move focus only; Tab
// from a tab that is not selected moves focus to the panel of the selected tab.
// Every step asserts its documented outcome in every frame (lib/tabs.mjs).
import { APG, CONTRACT, activateStep, focusSelectedStep, moveStep, tabToPanelStep, tabsCheck, tabsFixture, wrongTabs } from './lib/tabs.mjs';

const MANUAL = `${APG}: the arrow keys, Home and End move focus, and with manual activation "Space or Enter: Activates the tab if it was not activated automatically on focus."; ${CONTRACT}: horizontal arrows follow visual direction`;
const move = (name, key, outcome) => moveStep({ name, key, orientation: 'horizontal', activation: 'manual', outcome, reference: MANUAL });

export default {
  name: 'tabs-activate',
  ...tabsCheck,
  negative: { fixture: tabsFixture({ activation: 'manual' }), wrong: wrongTabs },
  steps: [
    focusSelectedStep(),
    move('right-arrow', 'ArrowRight', 'With manual activation, Right Arrow moves focus to the next enabled tab in a left-to-right page and to the previous one in a right-to-left page; the selected tab and its panel do not change.'),
    activateStep({ name: 'enter', key: 'Enter' }),
    move('left-arrow', 'ArrowLeft', 'With manual activation, Left Arrow moves focus to the previous enabled tab in a left-to-right page and to the next one in a right-to-left page; the selected tab and its panel do not change.'),
    activateStep({ name: 'space', key: 'Space' }),
    move('end', 'End', 'With manual activation, End moves focus to the last enabled tab; the selected tab and its panel do not change.'),
    move('home', 'Home', 'With manual activation, Home moves focus to the first enabled tab; the selected tab and its panel do not change.'),
    move('right-arrow-again', 'ArrowRight', 'With manual activation, Right Arrow moves focus to the next enabled tab in a left-to-right page and to the previous one in a right-to-left page; the selected tab and its panel do not change.'),
    tabToPanelStep(),
  ],
};
