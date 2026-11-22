// Interaction check combobox-unavailable: an editable single-select combobox of four
// options whose second option is unavailable (aria-disabled="true"). Up Arrow from the
// field makes the last option active; Down Arrow wraps to the first and then skips the
// unavailable option; Up Arrow skips it the other way; End and Home go to the last and
// the first enabled option. The keys are the same in both directions (a vertical list).
// Every step asserts its documented outcome in every frame (lib/combobox.mjs).
import { APG_CB, APG_EX, APG_LB, CORE, comboboxCheck, comboboxFixture, keysStep, tabIntoFieldStep, wrongCombobox } from './lib/combobox.mjs';

const VALUES = ['branch', 'post', 'courier', 'email'];
const FROM_FIELD = 'From the field (focus on the input opens the list with no active option), ';
const SKIP = `${CORE}: getNextEnabledIndex "wraps arrows, skips disabled options"; @hawiyah/vue README.md: "arrow keys skip disabled options"`;

export default {
  name: 'combobox-unavailable',
  ...comboboxCheck({ values: VALUES }),
  negative: {
    fixture: comboboxFixture({ id: 'delivery-method', label: 'Delivery method', options: VALUES.map((value, index) => ({ value, text: ['Collection from a branch', 'Delivery by post', 'Courier delivery', 'Email'][index], disabled: index === 1 })) }),
    wrong: wrongCombobox,
  },
  steps: [
    tabIntoFieldStep(),
    keysStep({ name: 'up-arrow-last', sequence: ['ArrowUp'], outcome: `${FROM_FIELD}Up Arrow makes the last enabled option active.`, reference: `${APG_CB}: "Up Arrow (Optional): If the popup is available, places focus on the last focusable element in the popup."; ${SKIP}` }),
    keysStep({ name: 'down-arrow-wraps', sequence: ['ArrowUp', 'ArrowDown'], outcome: `${FROM_FIELD}Up Arrow makes the last enabled option active, and Down Arrow on it makes the first enabled option active.`, reference: `${APG_EX}: "Down Arrow: Moves visual focus to the next option. If visual focus is on the last option, moves visual focus to the first option."; ${SKIP}` }),
    keysStep({ name: 'down-arrow-skips', sequence: ['ArrowDown', 'ArrowDown'], outcome: `${FROM_FIELD}Down Arrow twice makes the third option active: the unavailable second option is skipped.`, reference: `${APG_EX}: "Down Arrow: Moves visual focus to the next option."; ${SKIP}` }),
    keysStep({ name: 'up-arrow-skips', sequence: ['ArrowDown', 'ArrowDown', 'ArrowUp'], outcome: `${FROM_FIELD}from the third option, Up Arrow makes the first option active: the unavailable second option is skipped.`, reference: `${APG_EX}: "Up Arrow: Moves visual focus to the previous option."; ${SKIP}` }),
    keysStep({ name: 'end', sequence: ['ArrowDown', 'End'], outcome: `${FROM_FIELD}with an active option, End makes the last enabled option active.`, reference: `${APG_LB}: "End (Optional): Either moves focus to the last option or ..."; ${SKIP}` }),
    keysStep({ name: 'home', sequence: ['ArrowUp', 'Home'], outcome: `${FROM_FIELD}with an active option, Home makes the first enabled option active.`, reference: `${APG_LB}: "Home (Optional): Either moves focus to and selects the first option or ..."; ${SKIP}` }),
  ],
};
