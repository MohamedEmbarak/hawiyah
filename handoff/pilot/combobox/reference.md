# Combobox: the reference of the keyboard checks

Fixed on 2026-11-22, before any check was written and before any adapter source or
adapter behaviour was read. Sources read for it: the fact sheet
(`guide/.cache/facts/combobox.md`), the installed READMEs of `@hawiyah/vanilla`,
`@hawiyah/react`, `@hawiyah/vue`, `@hawiyah/angular`, `@hawiyah/styles` and the
installed `@hawiyah/core/API.md` (which CONTRACT.md names as the specification of
the core behaviour: "Their behaviour is specified in `packages/core/API.md`"),
CONTRACT.md and CHANGELOG.md (0.3.0).

Note on the APG text: www.w3.org could not be reached from this session (the host
is outside the session's network). The quotations of the WAI-ARIA Authoring
Practices below are written from the published pattern
(https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and its example "Editable
Combobox With List Autocomplete"
(https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/)
as known before this session; the reviewer should compare them with the live pages.

Abbreviations used in the checks:

- APG-CB: WAI-ARIA Authoring Practices, Combobox pattern, Keyboard Interaction,
  the combobox element.
- APG-LB: the same, Listbox Popup Keyboard Interaction.
- APG-EX: the same pattern, example "Editable Combobox With List Autocomplete",
  Keyboard Support (the variant the component implements, see below).
- APG-RS: the same pattern, WAI-ARIA Roles, States, and Properties.
- CORE: `@hawiyah/core` API.md (installed), the combobox transitions:
  "Input clears committed value and opens; close resets activeIndex and preserves
  query; only explicit select commits an enabled option. Adapters close on
  Escape, Tab, blur and outside interaction".
- CHG: CHANGELOG.md, 0.3.0, Parity, accessibility and behaviour fixes, Combobox.

## The variant

- Editable, single selection, list autocomplete with manual selection: the list
  filters by the typed text and no option is chosen without an explicit action.
  - fact sheet: "description: Editable single-select search and selection."
  - `@hawiyah/core` README: "The shared combobox reducer covers local single
    selection with manual commitment."
  - `@hawiyah/react` README, Combobox: "Typing clears the committed selection;
    arrows/Home/End change the active option, and Enter or pointer click commits an
    enabled option. Focus stays in the input. Escape/Tab close the list; blur keeps
    the query without silently selecting."
  - APG pattern, About this pattern: "List autocomplete with manual selection: When
    the popup is triggered, it presents suggested values. If the combobox is
    editable, the suggested values complete or logically correspond to the
    characters typed in the combobox. The character string the user has typed will
    become the value of the combobox unless the user selects a value in the popup."
- DOM focus stays on the input; the active option is referenced with
  `aria-activedescendant` (APG-LB note: "DOM focus is maintained on the combobox and
  the assistive technology focus is moved within the listbox using
  aria-activedescendant"; `@hawiyah/angular` README: "The input keeps focus through
  `aria-activedescendant`.").

## Deliberate differences from the pattern documented by the installed packages

1. The typed text never becomes the value. The pattern's manual selection makes
   the typed string the value; Hawiyah submits only a committed option.
   `@hawiyah/react` README: "Arbitrary text does not become a submitted value."
   `@hawiyah/vue` README: "editing clears the submitted value".
2. Focus on the input opens the popup. The pattern opens it on typing or Down
   Arrow (and optionally Alt + Down Arrow). `@hawiyah/vanilla` README: "Focus on
   the input opens the popup, as do a click, typing and the arrow keys, in the four
   adapters". CHG: "Focus on the input opens the popup in the four adapters".
3. `aria-selected` marks the committed option, `data-active` the active option.
   The pattern sets `aria-selected="true"` on the option referenced by
   `aria-activedescendant` (APG-RS: "When a descendant of a listbox ... is
   referenced as the current value, ... aria-selected ... true"). `@hawiyah/styles`
   README, stable classes: "Combobox | `hw-combobox`, `hw-input`, `hw-listbox`,
   `hw-option`; `data-active` for keyboard focus, `aria-selected` for committed
   selection".
4. Tab closes the list without committing the active option. The pattern leaves
   Tab to the page tab sequence and says nothing on acceptance. `@hawiyah/vue`
   README: "Escape/Tab/blur/outside close without committing." `@hawiyah/angular`
   README: "Escape/Tab/blur close without silently selecting." `@hawiyah/core`
   API.md (Vanilla): "Tab closes and moves focus normally."

## What is announced (every step)

- The input has `role="combobox"` and `aria-expanded` "true" while the list is
  shown and "false" while it is hidden; `aria-controls` names the listbox (APG-RS:
  "aria-expanded set to true if the popup is visible, false otherwise"; "The
  element that serves as the popup has role listbox ... the combobox has
  aria-controls set to the popup").
- While an option is active, `aria-activedescendant` on the input names that
  option's id; while no option is active the input has no `aria-activedescendant`
  (APG-RS: "When the combobox popup is not visible, the element with role combobox
  has aria-activedescendant set to empty string or does not have the attribute";
  CORE: "close resets activeIndex").
- The options shown are elements with `role="option"` in an element with
  `role="listbox"`; a hidden list is not shown (`@hawiyah/styles` README: "Keep
  inactive panels and closed tooltips/listboxes `hidden`").
- An unavailable option carries `aria-disabled="true"` (core API.md, vanilla
  combobox: "`aria-disabled="true"` skips them").
- After the reader types, the polite status announces the number of matching
  options with the application's `getResultsMessage(count)` (CHANGELOG.md, 0.3.0,
  the table of replaced defaults: "Combobox | `${count} results available` ... |
  `getResultsMessage(count)` | always"; `@hawiyah/vanilla` README markup: the
  status `span ... data-hw-combobox-status role="status"`).

## Keys

Direction: the listbox is a vertical list. Up Arrow and Down Arrow, Home and End do
not change with the direction of the page (CONTRACT.md, Core intended exports,
getNextEnabledIndex, specified in API.md: "vertical arrows do not change with RTL").
Right Arrow and Left Arrow move the editing caret in the input and are not bound to
the list in either direction; they are not checked. Every expectation below is the
same in left-to-right and right-to-left frames.

### Tab (into the field)

- Focus moves to the input; the list opens (difference 2) and shows every option;
  no option is active; nothing is committed. Source: CHG ("Focus on the input opens
  the popup in the four adapters"); APG-RS for aria-expanded.

### Down Arrow

- List shown, no active option: the first enabled option becomes active (APG-CB:
  "Down Arrow: If the popup is available, moves focus into the popup: ... Otherwise,
  places focus on the first focusable element in the popup."; APG-EX: "If the
  textbox is not empty and the listbox is displayed, moves visual focus to the first
  suggested value."). Focus stays on the input.
- List shown, an option active: the next enabled option becomes active; on the
  last enabled option it wraps to the first (APG-EX, listbox popup: "Down Arrow:
  Moves visual focus to the next option. If visual focus is on the last option,
  moves visual focus to the first option."; CONTRACT.md / API.md getNextEnabledIndex
  "wraps arrows, skips disabled options"). The value is not changed (CORE: "only
  explicit select commits").
- List hidden (after Escape or Enter), focus on the input: the list opens and the
  first enabled option becomes active (APG-CB, as above; `@hawiyah/vanilla` README:
  "Focus on the input opens the popup, as do a click, typing and the arrow keys").
  With a committed value the list shows every option (`@hawiyah/react` README:
  "Opening a committed selection displays all options."; API.md:
  "`getComboboxOptions` ... returns all options while a committed value is
  present").
- Unavailable options are skipped (`@hawiyah/vue` README: "arrow keys skip disabled
  options").

### Up Arrow

- List shown, no active option: the last enabled option becomes active (APG-CB:
  "Up Arrow (Optional): If the popup is available, places focus on the last
  focusable element in the popup.").
- List shown, an option active: the previous enabled option becomes active; on the
  first it wraps to the last (APG-EX, listbox popup: "Up Arrow: Moves visual focus to
  the previous option. If visual focus is on the first option, moves visual focus to
  the last option."). Unavailable options are skipped (Vue README as above).

### Home and End

- With the list shown and an option active: the first or the last enabled option
  becomes active (APG-LB: "Home (Optional): Either moves focus to and selects the
  first option or, if the combobox is editable, returns focus to the combobox and
  places the cursor on the first character." The package takes the first branch:
  `@hawiyah/react` README "arrows/Home/End change the active option"; `@hawiyah/angular`
  README "Arrow keys/Home/End move the active option"; API.md navigate keys "ArrowDown,
  ArrowUp, Home, End"). Focus stays on the input; nothing is committed. Disabled
  options are skipped (getNextEnabledIndex "skips disabled options", "supports
  Home/End").

### Enter

- With an active enabled option: that option is committed: the value (hidden
  input) is the option's value, the input shows the option's label, the option has
  `aria-selected="true"` (difference 3), the list closes and no option is active;
  focus stays on the input (APG-LB: "Enter: Accepts the focused option by closing the
  popup, placing the accepted value in the combobox, and if the combobox is editable,
  placing the input cursor at the end of the value."; `@hawiyah/react` README "Enter
  or pointer click commits an enabled option. Focus stays in the input.").

### Escape

- With the list shown: the list closes, no option is active, nothing is committed,
  the typed text stays, focus stays on the input (APG-LB: "Escape: Closes the popup
  and returns focus to the combobox. Optionally, if the combobox is editable, clears
  the contents of the combobox."; the package does not clear: CORE "close resets
  activeIndex and preserves query"; API.md, Vanilla: "Escape closes without
  selecting").
- Escape on a closed list (the pattern's optional clearing) is not documented by the
  package and is not checked.

### Typing a character (and Backspace)

- Typed text filters the options to those whose label matches the text (ignoring
  letter case and, in Arabic, diacritics and alef variants), opens the list, clears
  the committed value, and leaves no option active (manual selection); the status
  announces the count (APG-CB: "Printable Characters: If the combobox is editable,
  type characters in the combobox."; CORE: "Input clears committed value and opens";
  API.md: "`getComboboxOptions` ... filters by query after editing";
  `filterOptions` "matches normalized labels and preserves option objects, order and
  disabled options"; the pattern's manual selection does not make a suggestion
  active).
- Backspace is a standard editing key of the input (APG-CB: "If the combobox is
  editable, it supports standard single line text editing keys appropriate for the
  device platform"): it deletes the character before the caret (at the end of the
  value after Enter, APG-LB above); the result is an edit, so it filters, opens the
  list, clears the committed value and leaves no option active (CORE, as above;
  `@hawiyah/vue` README "editing clears the submitted value").

### Tab (out of the field)

- Focus leaves the input for the next element in the tab sequence; the list closes;
  the active option is not committed; the value and the typed text stay as they
  were (difference 4; `@hawiyah/react` README "Escape/Tab close the list; blur keeps
  the query without silently selecting").

## Not checked

- Alt + Down Arrow and Alt + Up Arrow (optional in the pattern; the packages do not
  document them).
- Right Arrow and Left Arrow (caret movement of the native input).
- Escape on a closed list; Enter without an active option (neither documented by the
  packages).
- Pointer selection (not a key).

## Note of 2026-11-22, after the checks ran (no expectation above was changed)

- Every step written from this reference held in vanilla, React, Vue and Angular, in
  English (left-to-right) and Arabic (right-to-left) frames: 27 steps per language.
- Form of the steps: the harness runs a step in one frame after the other, so every
  frame but the last loses focus before the next step, and the combobox closes on blur
  (core API.md: "Adapters close on Escape, Tab, blur and outside interaction"). Each step
  therefore starts from the field (blur, then focus through its first key: the list
  opens with no active option) and presses the keys that lead to its outcome. The
  expectations are the ones above, applied key by key.
- Typing a printable character cannot be a declared key of the harness (KEY_NAMES has
  no character key); the typed text is entered as an input event without a keydown,
  and Backspace is the key that exercises an edit.
- Observed outside the oracle, through the comparison of the four results: when Down
  Arrow opens a closed list, the vanilla status stays empty while React, Vue and
  Angular announce getResultsMessage(count) (HWE-ARIA). The reference above binds the
  announcement only to typing, so the oracle does not assert it.
