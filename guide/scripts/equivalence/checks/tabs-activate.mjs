// Interaction check tabs-activate (5a.8): a horizontal tab list with manual
// activation. The arrow keys move focus without changing the selected tab or its
// panel; Enter and Space select the focused tab. Every step asserts its documented
// outcome in every frame (lib/tabs.mjs).
import { APG, CONTRACT, activateStep, focusSelectedStep, moveStep } from './lib/tabs.mjs';

const MANUAL = `${APG}: the arrow keys move focus, and with manual activation "Space or Enter: Activates the tab if it was not activated automatically on focus."; ${CONTRACT}: horizontal arrows follow visual direction`;
const move = (name, key, outcome) => moveStep({ name, key, orientation: 'horizontal', activation: 'manual', outcome, reference: MANUAL });

export default {
  name: 'tabs-activate',
  steps: [
    focusSelectedStep(),
    move('right-arrow', 'ArrowRight', 'With manual activation, Right Arrow moves focus to the next enabled tab in a left-to-right page and to the previous one in a right-to-left page; the selected tab and its panel do not change.'),
    activateStep({ name: 'enter', key: 'Enter' }),
    move('left-arrow', 'ArrowLeft', 'With manual activation, Left Arrow moves focus to the previous enabled tab in a left-to-right page and to the next one in a right-to-left page; the selected tab and its panel do not change.'),
    activateStep({ name: 'space', key: 'Space' }),
  ],
};
