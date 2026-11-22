// The Combobox oracle of the keyboard checks (the form of lib/tabs.mjs). Each step
// presses its keys and returns the state the oracle expects after it, computed from
// the state it expected before the step and from the references below, never from
// what an adapter does or what the frame shows; the harness asserts it in every frame
// (assertCombobox). The expectations were fixed in a reference written before these
// checks (editable single-select combobox, list autocomplete with manual selection).
// References, cited per step:
//   APG_CB   WAI-ARIA Authoring Practices, Combobox pattern, Keyboard Interaction, the
//            combobox (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
//   APG_LB   the same, Listbox Popup Keyboard Interaction.
//   APG_EX   the same pattern, example "Editable Combobox With List Autocomplete",
//            Keyboard Support (the variant the component implements).
//   APG_RS   the same pattern, WAI-ARIA Roles, States, and Properties.
//   CORE     CONTRACT.md, Core intended exports (behaviour specified in
//            packages/core/API.md, installed as @hawiyah/core/API.md):
//            transitionCombobox: "Input clears committed value and opens; close resets
//            activeIndex and preserves query; only explicit select commits an enabled
//            option. Adapters close on Escape, Tab, blur and outside interaction";
//            getNextEnabledIndex "wraps arrows, skips disabled options, supports
//            Home/End"; getComboboxOptions "returns all options while a committed value
//            is present, and filters by query after editing".
//   FOCUS    CHANGELOG.md, 0.3.0, Parity, accessibility and behaviour fixes, Combobox:
//            "Focus on the input opens the popup in the four adapters".
// Two deliberate differences from the pattern that the installed READMEs document are
// part of the oracle: the typed text never becomes the value (@hawiyah/react README:
// "Arbitrary text does not become a submitted value."), and Tab closes the list without
// committing (@hawiyah/vue README: "Escape/Tab/blur/outside close without committing.").
// aria-selected marks the committed option and the active option is named by
// aria-activedescendant (@hawiyah/styles README: "data-active for keyboard focus,
// aria-selected for committed selection").
//
// Focus between steps: the harness runs a step in one frame after the other, so every
// frame but the last loses focus before the next step, and the combobox closes on blur
// (CORE). Each step therefore starts by blurring the input and giving it focus again
// through its first key (FOCUS: the list opens with no active option, CORE: close
// resets activeIndex), in every frame and in the single frame of the negative control
// alike, and the state that survives a blur (the text in the field and the committed
// value) is the only state asserted before a step and in the final read.
// This directory holds no check: a group cannot name lib/... (check names match
// ^[a-z][a-z0-9-]*$).

export const APG_CB = 'WAI-ARIA Authoring Practices, Combobox pattern, Keyboard Interaction (combobox)';
export const APG_LB = 'WAI-ARIA Authoring Practices, Combobox pattern, Listbox Popup Keyboard Interaction';
export const APG_EX = 'WAI-ARIA Authoring Practices, Combobox pattern, example Editable Combobox With List Autocomplete, Keyboard Support';
export const APG_RS = 'WAI-ARIA Authoring Practices, Combobox pattern, WAI-ARIA Roles, States, and Properties';
export const CORE = 'CONTRACT.md, Core intended exports, transitionCombobox and getNextEnabledIndex (packages/core/API.md)';
export const FOCUS = 'CHANGELOG.md, 0.3.0, Parity, accessibility and behaviour fixes: "Focus on the input opens the popup in the four adapters"';
export const NO_TEXT_VALUE = '@hawiyah/react README.md, Combobox: "Arbitrary text does not become a submitted value."';
export const TAB_NO_COMMIT = '@hawiyah/vue README.md: "Escape/Tab/blur/outside close without committing."';

/** What a frame shows of its combobox: the input, its list, the options shown, the active option, the committed value and the status. */
export async function readCombobox(mount) {
  return mount.evaluate((root) => {
    const doc = root.ownerDocument;
    const input = root.querySelector('[role="combobox"]');
    const list = root.querySelector('[role="listbox"]');
    const shown = (node) => !node.closest('[hidden]') && node.getClientRects().length > 0;
    const options = list ? Array.from(list.querySelectorAll('[role="option"]')) : [];
    const activeId = input?.getAttribute('aria-activedescendant') ?? '';
    const active = activeId ? doc.getElementById(activeId) : null;
    const status = root.querySelector('[role="status"]');
    const hidden = root.querySelector('input[type="hidden"]');
    const label = (node) => (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    return {
      input: Boolean(input),
      expanded: input?.getAttribute('aria-expanded') ?? null,
      controls: input?.getAttribute('aria-controls') ?? null,
      listId: list?.id ?? null,
      listShown: list ? shown(list) : false,
      text: input ? input.value : null,
      value: hidden ? hidden.value : null,
      focused: Boolean(input) && doc.activeElement === input,
      options: options.map((option) => ({ label: label(option), shown: shown(option), selected: option.getAttribute('aria-selected') === 'true', disabled: option.getAttribute('aria-disabled') === 'true' })),
      activeId,
      activeOption: Boolean(active && list?.contains(active) && active.getAttribute('role') === 'option'),
      activeLabel: active ? label(active) : null,
      status: status ? label(status) : null,
    };
  });
}

/** Search folding of the oracle (@hawiyah/core API.md, normalizeSearch: diacritics, tatweel, alef variants, compatibility forms, case, white space). */
export const fold = (text) => text.normalize('NFKC').replace(/[ً-ٰٟـ]/g, '').replace(/[آأإٱ]/g, 'ا').toLowerCase().replace(/\s+/g, ' ').trim();

/** The options the list shows (CORE, getComboboxOptions): every option while a value is committed or the text is empty, else those whose label matches the text. */
export function shownOptions(state) {
  if (state.committed !== null || state.text.trim() === '') return state.labels.map((_, index) => index);
  const query = fold(state.text);
  return state.labels.flatMap((label, index) => (fold(label).includes(query) ? [index] : []));
}

const enabledShown = (state) => shownOptions(state).filter((index) => !state.disabled[index]);

/** The option an arrow key, Home or End makes active (APG_CB, APG_EX, CORE): first, last, next and previous enabled option, wrapping. */
export function activeAfter(state, key) {
  const list = enabledShown(state);
  if (list.length === 0) throw new Error(`the oracle has no active option for ${key}: no enabled option is shown`);
  const at = state.active === null ? -1 : list.indexOf(state.active);
  if (key === 'Home') return list[0];
  if (key === 'End') return list[list.length - 1];
  if (key === 'ArrowDown') return at < 0 ? list[0] : list[(at + 1) % list.length];
  if (key === 'ArrowUp') return at < 0 ? list[list.length - 1] : list[(at - 1 + list.length) % list.length];
  throw new Error(`the oracle has no active option for ${key}`);
}

/**
 * The state after one key or event, from the state before it:
 *   focus      the list opens with no active option (FOCUS; CORE: close resets activeIndex);
 *   ArrowDown, ArrowUp  open a closed list and make the first or last enabled option
 *              active, or move to the next or previous enabled option and wrap (APG_CB, APG_EX);
 *   Home, End  the first or last enabled option (APG_LB; CORE), only with an active option;
 *   Enter      commits the active option, shows its label, closes (APG_LB);
 *   Escape     closes, keeps the text and the value (APG_LB; CORE "preserves query");
 *   Tab        focus leaves, the list closes, nothing is committed (TAB_NO_COMMIT);
 *   Backspace  deletes the last character (the caret is at the end), clears the
 *              committed value and opens (APG_CB editing keys; CORE "Input clears
 *              committed value and opens");
 *   type       the typed text replaces the field, as Backspace otherwise, and the status
 *              announces the count of options shown.
 */
export function apply(state, key, text) {
  const next = { ...state, status: null };
  switch (key) {
    case 'focus':
      return { ...next, open: true, active: null, focused: true };
    case 'ArrowDown':
    case 'ArrowUp':
      if (!state.open) return { ...next, open: true, active: activeAfter({ ...state, active: null }, key) };
      return { ...next, active: activeAfter(state, key) };
    case 'Home':
    case 'End':
      if (!state.open || state.active === null) throw new Error(`the reference gives no outcome for ${key} without an active option`);
      return { ...next, active: activeAfter(state, key) };
    case 'Enter':
      if (!state.open || state.active === null) throw new Error('the reference gives no outcome for Enter without an active option');
      return { ...next, committed: state.active, text: state.labels[state.active], open: false, active: null };
    case 'Escape':
      if (!state.open) throw new Error('the reference gives no outcome for Escape on a closed list');
      return { ...next, open: false, active: null };
    case 'Tab':
      return { ...next, open: false, active: null, focused: false };
    case 'Backspace':
      return { ...next, text: state.text.slice(0, -1), committed: null, open: true, active: null };
    case 'type': {
      const typed = { ...next, text, committed: null, open: true, active: null };
      return { ...typed, status: shownOptions(typed).length };
    }
    default:
      throw new Error(`the oracle has no outcome for ${key}`);
  }
}

/** Fails unless the frame shows the expected state; before a step and in the final read only the text in the field and the committed value (what a blur keeps). */
export function assertCombobox(observed, expected, { phase }) {
  if (!observed.input) throw new Error('the frame shows no element with role combobox');
  if (observed.text !== expected.text) throw new Error(`the field is expected to show "${expected.text}"; it shows "${observed.text}"`);
  const value = expected.committed === null ? '' : expected.values[expected.committed];
  if (observed.value !== value) throw new Error(`the committed value is expected to be "${value}"; the hidden input holds ${observed.value === null ? 'nothing (no hidden input)' : `"${observed.value}"`}`);
  if (phase !== 'after') return;
  if (expected.focused === true && !observed.focused) throw new Error('focus is expected on the input; it is elsewhere');
  if (expected.focused === false && observed.focused) throw new Error('focus is expected to have left the input; it is on the input');
  if (expected.open) {
    if (observed.expanded !== 'true' || !observed.listShown) throw new Error(`the list is expected to be shown with aria-expanded="true"; aria-expanded is ${observed.expanded} and the list is ${observed.listShown ? 'shown' : 'hidden'}`);
    if (!observed.controls || observed.controls !== observed.listId) throw new Error(`aria-controls is expected to name the listbox ${observed.listId}; it is ${observed.controls}`);
    const want = shownOptions(expected).map((index) => expected.labels[index]);
    const shown = observed.options.filter((option) => option.shown);
    const got = shown.map((option) => option.label);
    if (want.join(' | ') !== got.join(' | ')) throw new Error(`the list is expected to show ${want.join(', ') || 'no option'}; it shows ${got.join(', ') || 'no option'}`);
    const selected = shown.filter((option) => option.selected).map((option) => option.label);
    const committed = expected.committed !== null ? [expected.labels[expected.committed]] : [];
    if (selected.join(' | ') !== committed.join(' | ')) throw new Error(`aria-selected="true" is expected on ${committed.join(', ') || 'no option'}; it is on ${selected.join(', ') || 'no option'}`);
  } else if (observed.expanded !== 'false' || observed.listShown) {
    throw new Error(`the list is expected to be hidden with aria-expanded="false"; aria-expanded is ${observed.expanded} and the list is ${observed.listShown ? 'shown' : 'hidden'}`);
  }
  if (expected.active === null) {
    if (observed.activeId !== '') throw new Error(`no option is expected to be active; aria-activedescendant names ${observed.activeId} (${observed.activeLabel ?? 'no element'})`);
  } else {
    const want = expected.labels[expected.active];
    if (!observed.activeOption || observed.activeLabel !== want) throw new Error(`the option ${want} is expected to be active (aria-activedescendant); ${observed.activeId ? `it names ${observed.activeId} (${observed.activeLabel ?? 'no element'})` : 'the input has no aria-activedescendant'}`);
  }
  if (expected.status !== null && !(observed.status ?? '').includes(String(expected.status))) {
    throw new Error(`the status is expected to announce ${expected.status} options; it reads "${observed.status ?? ''}"`);
  }
}

/**
 * The parts of a Combobox check that are the same for every check: how it reads,
 * starts and asserts a frame. `values` are the option values of the group, in order
 * (a value is a token of the example, the same in both languages); the labels and
 * the unavailable options are read from the frame at rest.
 */
export function comboboxCheck({ values }) {
  return {
    read: readCombobox,
    assert: assertCombobox,
    start(observed) {
      if (observed.options.length !== values.length) throw new Error(`the check is written for ${values.length} options; the frame has ${observed.options.length}`);
      return {
        labels: observed.options.map((option) => option.label),
        disabled: observed.options.map((option) => option.disabled),
        values,
        text: observed.text ?? '',
        committed: null,
        open: false,
        active: null,
        focused: null,
        status: null,
      };
    },
  };
}

/**
 * The deliberately wrong oracle of the negative control of every Combobox check: the
 * list open and the active option one further than the documented outcome (the first
 * option where none is documented), which differs from it after every step.
 */
export function wrongCombobox(expected) {
  const active = expected.active === null ? 0 : (expected.active + 1) % expected.labels.length;
  return { ...expected, open: true, active };
}

const inputOf = (context) => context.mount.getByRole('combobox');
const blurInput = (context) => inputOf(context).evaluate((input) => input.blur());

/**
 * A step that blurs the input and presses `sequence` on it, one key after the other; the
 * first key gives the input focus again, which opens the list with no active option
 * (FOCUS). The step declares the keys of the sequence.
 */
export function keysStep({ name, sequence, outcome, reference }) {
  return {
    name,
    keys: [...new Set(sequence)],
    outcome,
    reference,
    async run(context) {
      await blurInput(context);
      for (const key of sequence) await context.press(inputOf(context), key);
    },
    expect: (previous) => sequence.reduce((state, key) => apply(state, key), apply(previous, 'focus')),
  };
}

/** Tab from before the example: focus moves to the input and the list opens with every option and no active option (FOCUS; APG_RS). */
export function tabIntoFieldStep() {
  return {
    name: 'tab-into-field',
    keys: ['Tab'],
    outcome: 'Tab from before the field moves focus to the input; the list opens with every option, none active, and nothing is committed.',
    reference: `${FOCUS}; ${APG_RS}: aria-expanded is true while the popup is visible`,
    async run(context) {
      await context.focusFrameStart();
      await context.press(null, 'Tab');
    },
    expect: (previous) => apply(previous, 'focus'),
  };
}

/** Backspace at the end of the field (where Enter leaves the caret, APG_LB): an edit that clears the committed value and filters by the remaining text. */
export function backspaceStep({ name, outcome, reference }) {
  return {
    name,
    keys: ['Backspace'],
    outcome,
    reference,
    async run(context) {
      await blurInput(context);
      const input = inputOf(context);
      await input.focus();
      await input.evaluate((node) => node.setSelectionRange(node.value.length, node.value.length));
      await context.press(input, 'Backspace');
    },
    expect: (previous) => apply(apply(previous, 'focus'), 'Backspace'),
  };
}

/**
 * Typed text, entered without a key press: the harness binds a step to key ids of
 * KEY_NAMES, which has no printable character, and records every trusted keydown, so
 * the text is inserted as an input event (Playwright fill: no keydown). The step
 * declares no key; the oracle is the one of typed characters (APG_CB, CORE).
 */
export function typeStep({ name, query, outcome, reference }) {
  return {
    name,
    outcome,
    reference,
    async run(context) {
      await blurInput(context);
      await inputOf(context).fill(query(context.expected));
    },
    expect: (previous) => apply(apply(previous, 'focus'), 'type', query(previous)),
  };
}

/** The first word of the label of option `index`: the typed text of a filtering step. */
export const firstWord = (index) => (state) => state.labels[index].split(' ')[0];

/** The vanilla markup of the negative control of a Combobox check: the documented structure of the @hawiyah/vanilla README with the given options. */
export function comboboxFixture({ id, label, options }) {
  const items = options.map(({ value, text, disabled }) => `<li class="hw-option" data-hw-value="${value}"${disabled ? ' aria-disabled="true"' : ''}>${text}</li>`).join('');
  return `<div class="hw-field"><label class="hw-label" id="${id}-label" for="${id}">${label}</label>`
    + `<div class="hw-combobox" data-hw="combobox" data-hw-results-message="Matching options: {count}">`
    + `<input id="${id}" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="${id}-label">`
    + `<input type="hidden" name="${id}" data-hw-combobox-value>`
    + `<ul class="hw-listbox" id="${id}-listbox" data-hw-combobox-list hidden>${items}</ul>`
    + `<span class="hw-sr-only" data-hw-combobox-status role="status"></span></div></div>`;
}
