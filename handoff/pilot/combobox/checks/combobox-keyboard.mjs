// Interaction check combobox-keyboard: an editable single-select combobox of four
// options, none committed. Tab enters the field and opens the list; Down Arrow and
// Up Arrow make the first or last option active, move to the next or previous one and
// wrap at the ends; End and Home go to the last and the first option; Enter commits the
// active option and closes the list; Down Arrow opens a closed list; Escape closes it and
// keeps the committed value; Tab leaves the field without committing the active option.
// The keys are the same in both directions: the list is vertical (CONTRACT.md,
// getNextEnabledIndex: "vertical arrows do not change with RTL"). Every step asserts its
// documented outcome in every frame (lib/combobox.mjs holds the oracle and its
// references); the harness also compares the four results after each step.
import { APG_CB, APG_EX, APG_LB, CORE, TAB_NO_COMMIT, comboboxCheck, comboboxFixture, keysStep, tabIntoFieldStep, wrongCombobox } from './lib/combobox.mjs';

const VALUES = ['building-permit', 'business-licence', 'commercial-registration', 'residence-renewal'];
const DOWN = `${APG_CB}: "Down Arrow: If the popup is available, moves focus into the popup: ... Otherwise, places focus on the first focusable element in the popup."; ${APG_EX}: "Down Arrow: Moves visual focus to the next option. If visual focus is on the last option, moves visual focus to the first option."`;
const UP = `${APG_CB}: "Up Arrow (Optional): If the popup is available, places focus on the last focusable element in the popup."; ${APG_EX}: "Up Arrow: Moves visual focus to the previous option. If visual focus is on the first option, moves visual focus to the last option."`;
const FROM_FIELD = 'From the field (focus on the input opens the list with no active option), ';

export default {
  name: 'combobox-keyboard',
  ...comboboxCheck({ values: VALUES }),
  negative: {
    fixture: comboboxFixture({ id: 'service-type', label: 'Service type', options: VALUES.map((value, index) => ({ value, text: ['Building permit', 'Business licence', 'Commercial registration', 'Residence renewal'][index] })) }),
    wrong: wrongCombobox,
  },
  steps: [
    tabIntoFieldStep(),
    keysStep({ name: 'down-arrow-first', sequence: ['ArrowDown'], outcome: `${FROM_FIELD}Down Arrow makes the first option active; focus stays on the input and nothing is committed.`, reference: `${DOWN}; ${CORE}: only explicit select commits` }),
    keysStep({ name: 'down-arrow-next', sequence: ['ArrowDown', 'ArrowDown'], outcome: `${FROM_FIELD}Down Arrow twice makes the second option active: each press moves to the next option.`, reference: DOWN }),
    keysStep({ name: 'up-arrow-last', sequence: ['ArrowUp'], outcome: `${FROM_FIELD}Up Arrow makes the last option active.`, reference: UP }),
    keysStep({ name: 'up-arrow-previous', sequence: ['ArrowUp', 'ArrowUp'], outcome: `${FROM_FIELD}Up Arrow twice makes the option before the last one active: each press moves to the previous option.`, reference: UP }),
    keysStep({ name: 'down-arrow-wraps', sequence: ['ArrowUp', 'ArrowDown'], outcome: `${FROM_FIELD}Up Arrow makes the last option active, and Down Arrow on the last option makes the first option active.`, reference: DOWN }),
    keysStep({ name: 'up-arrow-wraps', sequence: ['ArrowDown', 'ArrowUp'], outcome: `${FROM_FIELD}Down Arrow makes the first option active, and Up Arrow on the first option makes the last option active.`, reference: UP }),
    keysStep({ name: 'end', sequence: ['ArrowDown', 'End'], outcome: `${FROM_FIELD}with an active option, End makes the last enabled option active.`, reference: `${APG_LB}: "End (Optional): Either moves focus to the last option or ..."; ${CORE}: supports Home/End, skips disabled options` }),
    keysStep({ name: 'home', sequence: ['ArrowDown', 'ArrowDown', 'Home'], outcome: `${FROM_FIELD}with an active option, Home makes the first enabled option active.`, reference: `${APG_LB}: "Home (Optional): Either moves focus to and selects the first option or ..."; ${CORE}: supports Home/End, skips disabled options` }),
    keysStep({ name: 'enter-commits', sequence: ['ArrowDown', 'ArrowDown', 'Enter'], outcome: `${FROM_FIELD}Enter on the active option commits it: the field shows its label, the option is aria-selected, the list closes and focus stays on the input.`, reference: `${APG_LB}: "Enter: Accepts the focused option by closing the popup, placing the accepted value in the combobox, and if the combobox is editable, placing the input cursor at the end of the value."` }),
    keysStep({ name: 'down-arrow-opens', sequence: ['ArrowDown', 'ArrowDown', 'Enter', 'ArrowDown'], outcome: `${FROM_FIELD}after Enter closed the list, Down Arrow opens it again with every option shown, the committed option aria-selected and the first option active.`, reference: `${DOWN}; ${CORE}: getComboboxOptions returns all options while a committed value is present` }),
    keysStep({ name: 'escape-closes', sequence: ['ArrowDown', 'Escape'], outcome: `${FROM_FIELD}Escape closes the list and leaves no option active; the field keeps its text and the committed option stays committed.`, reference: `${APG_LB}: "Escape: Closes the popup and returns focus to the combobox."; ${CORE}: close resets activeIndex and preserves query` }),
    keysStep({ name: 'tab-leaves', sequence: ['ArrowDown', 'Tab'], outcome: `${FROM_FIELD}Tab with an active option moves focus out of the field and closes the list; the active option is not committed and the committed option stays.`, reference: `${TAB_NO_COMMIT}; ${CORE}: adapters close on Tab` }),
  ],
};
