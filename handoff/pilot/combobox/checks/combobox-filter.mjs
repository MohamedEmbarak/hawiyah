// Interaction check combobox-filter: an editable single-select combobox of four
// options whose second and third labels begin with the same word. Typed text (the first
// word of the second label) filters the list and opens it with no active option; Down
// Arrow makes the first matching option active; Enter commits it; Backspace edits the
// committed text, which clears the committed value and filters by the remaining text;
// Escape closes the list and keeps the text; Down Arrow opens it again on the filtered
// options; Tab leaves the field and commits nothing (the typed text is never a value).
// Every step asserts its documented outcome in every frame (lib/combobox.mjs).
import { APG_CB, APG_EX, APG_LB, CORE, NO_TEXT_VALUE, TAB_NO_COMMIT, backspaceStep, comboboxCheck, comboboxFixture, firstWord, keysStep, typeStep, wrongCombobox } from './lib/combobox.mjs';

const VALUES = ['passport', 'proof-of-address', 'proof-of-income', 'lease-contract'];
const FROM_FIELD = 'From the field (focus on the input opens the list with no active option), ';
const FILTERED = `${CORE}: getComboboxOptions filters by query after editing; close resets activeIndex and preserves query`;

export default {
  name: 'combobox-filter',
  ...comboboxCheck({ values: VALUES }),
  negative: {
    fixture: comboboxFixture({ id: 'document-type', label: 'Document type', options: VALUES.map((value, index) => ({ value, text: ['Passport', 'Proof of address', 'Proof of income', 'Lease contract'][index] })) }),
    wrong: wrongCombobox,
  },
  steps: [
    typeStep({
      name: 'type-filters',
      query: firstWord(1),
      outcome: 'Typed text (entered without a key press) opens the list with only the options whose label matches it, none active; nothing is committed and the status announces the number of options shown.',
      reference: `${APG_CB}: "Printable Characters: If the combobox is editable, type characters in the combobox."; ${CORE}: "Input clears committed value and opens"; ${NO_TEXT_VALUE}`,
    }),
    keysStep({ name: 'down-arrow-filtered', sequence: ['ArrowDown'], outcome: `${FROM_FIELD}Down Arrow makes the first option that matches the text active; the typed text stays and nothing is committed.`, reference: `${APG_EX}: "Down Arrow: If the textbox is not empty and the listbox is displayed, moves visual focus to the first suggested value."; ${FILTERED}` }),
    keysStep({ name: 'enter-commits-match', sequence: ['ArrowDown', 'Enter'], outcome: `${FROM_FIELD}Down Arrow and Enter commit the first matching option: the field shows its label, the list closes and focus stays on the input.`, reference: `${APG_LB}: "Enter: Accepts the focused option by closing the popup, placing the accepted value in the combobox, and if the combobox is editable, placing the input cursor at the end of the value."` }),
    backspaceStep({ name: 'backspace-edits', outcome: 'Backspace at the end of the committed label deletes its last character: the committed value is cleared, the list opens with the options that match the remaining text and no option is active.', reference: `${APG_CB}: "If the combobox is editable, it supports standard single line text editing keys appropriate for the device platform"; ${CORE}: "Input clears committed value and opens"; ${NO_TEXT_VALUE}` }),
    keysStep({ name: 'escape-keeps-text', sequence: ['ArrowDown', 'Escape'], outcome: `${FROM_FIELD}Escape closes the list and leaves no option active; the edited text stays in the field and nothing is committed.`, reference: `${APG_LB}: "Escape: Closes the popup and returns focus to the combobox." (the optional clearing is not taken); ${FILTERED}` }),
    keysStep({ name: 'down-arrow-reopens', sequence: ['Escape', 'ArrowDown'], outcome: `${FROM_FIELD}after Escape closed the list, Down Arrow opens it again on the options that match the text and makes the first of them active.`, reference: `${APG_CB}: "Down Arrow: If the popup is available, moves focus into the popup: ... Otherwise, places focus on the first focusable element in the popup."; ${FILTERED}` }),
    keysStep({ name: 'tab-leaves-uncommitted', sequence: ['ArrowDown', 'Tab'], outcome: `${FROM_FIELD}Tab with an active option moves focus out of the field and closes the list; the active option is not committed, the text stays and the value stays empty.`, reference: `${TAB_NO_COMMIT}; ${CORE}: "only explicit select commits an enabled option. Adapters close on Escape, Tab, blur and outside interaction"; ${NO_TEXT_VALUE}` }),
  ],
};
