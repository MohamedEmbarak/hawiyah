# Dialog: keyboard expectations (fixed before the checks)

Written 2026-11-22 at 9ff8775, before any adapter of Dialog was read or run.
Sources: the WAI-ARIA Authoring Practices pattern "Dialog (Modal)" (APG-DIALOG,
https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), the APG "Button" pattern
(APG-BUTTON, https://www.w3.org/WAI/ARIA/apg/patterns/button/), the HTML Standard,
the dialog element (HTML-DIALOG,
https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
with its close requests (HTML-CLOSE,
https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers),
CONTRACT.md and CHANGELOG.md at the repository root, and the READMEs of the installed
@hawiyah packages (0.3.0) for documented differences only.

Direction: no key of this pattern depends on the reading direction. Tab and
Shift+Tab follow the sequential focus navigation order, which is tree order for
elements without a positive tabindex (HTML Standard, sequential focus navigation),
in left-to-right and right-to-left frames alike. Every expectation below is
therefore the same in ltr and rtl; the checks run in both, with Arabic names in the
Arabic frames.

## State the checks read

- open: the dialog element is open and modal (role dialog; `:modal` matches).
  APG-DIALOG, WAI-ARIA Roles, States, and Properties: "The element that serves as
  the dialog container has a role of dialog." and "The dialog container element has
  aria-modal set to true." HTML-DIALOG: showModal() sets the dialog's is modal flag
  and adds it to the top layer; a native dialog exposes role dialog, and a modal
  one is exposed as modal (the native equivalent of aria-modal="true").
- name: the open dialog is named by its visible title. APG-DIALOG, Roles: "The
  dialog has either: A value set for the aria-labelledby property that refers to a
  visible dialog title. A label specified by aria-label."
- description (optional): APG-DIALOG, Roles: "Optionally, the aria-describedby
  property is set on the element with the dialog role ..." (not bound to a key).
- inert background: while the dialog is modal, no element of the document outside
  the dialog can take focus. HTML-DIALOG: while a modal dialog is open its node
  document is blocked by it, and the elements outside the dialog are inert.
- focus: which element has focus: the trigger, a tabbable element of the dialog
  (by its position in the dialog's tab sequence), or neither.

## Keys

### Enter, Space on the trigger (a button outside the dialog, dialog closed)

- Outcome: the dialog opens as a modal dialog, named by its title, and focus moves
  to an element inside the dialog: the descendant with `autofocus` if there is one,
  otherwise the first focusable descendant in tree order (the dialog's focus
  delegate).
- Sources: APG-BUTTON, Keyboard Interaction: "Enter: Activates the button." and
  "Space: Activates the button."; "If activating the button opens a dialog, the
  focus moves inside the dialog." APG-DIALOG, Keyboard Interaction notes: "When a
  dialog opens, focus moves to an element inside the dialog." HTML-DIALOG,
  showModal() and the dialog focusing steps: the previously focused element is
  recorded, then focus goes to the dialog's focus delegate (the autofocus
  descendant, else the first focusable descendant).
- Installed README (initial focus): @hawiyah/vanilla README: "Initial focus
  belongs on a suitable descendant (use `autofocus`)."; @hawiyah/react README:
  "`autoFocus` on a child selects initial focus." (consistent with the pattern).
- ltr and rtl: the same.

### Tab inside the open dialog

- Outcome: focus moves to the next tabbable element inside the dialog. From the
  last tabbable element of the dialog: APG moves focus to the first tabbable
  element of the dialog.
- Source: APG-DIALOG, Keyboard Interaction: "Tab: Moves focus to the next tabbable
  element inside the dialog. If focus is on the last tabbable element inside the
  dialog, moves focus to the first tabbable element inside the dialog."
- In every case focus never reaches an element of the document outside the dialog
  (HTML-DIALOG: the document is blocked by the modal dialog; APG-DIALOG, About
  This Pattern: "Like non-modal dialogs, modal dialogs contain their tab
  sequence. That is, Tab and Shift + Tab do not move focus outside the dialog.").
- Documented difference (wrap at the end): @hawiyah/vanilla README: "A native
  `<dialog>` supplies modality, its top layer, Escape handling, and focus
  containment through `showModal()`/`close()`." and "The HTML dialog
  specification is the modal authority: no manual removal of `open`, no custom
  focus trap, no `tabindex` on the dialog itself." @hawiyah/react README: "Native
  modality contains focus and makes the background inert." @hawiyah/vue README:
  "Dialog uses `showModal()` / `close()` for browser modality and focus
  containment". @hawiyah/angular README: "Native modality, focus containment and
  Escape behavior require a browser with dialog support." The HTML Standard
  defines no wrap inside the dialog: past the last tabbable element, sequential
  navigation may leave the document (to the browser's own controls, or to the
  embedding document of a frame) before it comes back. The packages therefore
  differ from APG at the end of the sequence by design: the expected outcome there
  is "focus does not reach an element of the document outside the dialog", not
  "focus is on the first tabbable element". Inside the sequence (not at its end)
  APG and the packages agree.
- ltr and rtl: the same (tree order).

### Shift+Tab inside the open dialog

- Outcome: focus moves to the previous tabbable element inside the dialog. From
  the first tabbable element, APG moves focus to the last one.
- Source: APG-DIALOG, Keyboard Interaction: "Shift + Tab: Moves focus to the
  previous tabbable element inside the dialog. If focus is on the first tabbable
  element inside the dialog, moves focus to the last tabbable element inside the
  dialog."
- Documented difference at the start of the sequence: the same README sentences as
  for Tab (native containment, no custom focus trap); expected there: focus does
  not reach an element of the document outside the dialog.
- ltr and rtl: the same.

### Escape inside the open dialog

- Outcome: the dialog closes (no longer open, no longer modal) and focus returns
  to the element that opened it (the trigger).
- Sources: APG-DIALOG, Keyboard Interaction: "Escape: Closes the dialog."; notes:
  "When a dialog closes, focus returns to the element that invoked the dialog
  unless either: The invoking element no longer exists. ... The workflow design
  includes the following conditions that can make focusing a different element a
  more logical choice". HTML-CLOSE: Escape is a close request; for a modal dialog
  it fires a cancelable `cancel` event at the dialog and, unless it is canceled,
  closes the dialog with a null return value. HTML-DIALOG, close the dialog: when
  the dialog was modal, focus is given back to its previously focused element.
  CONTRACT.md, Unavailable controls and focus: "A popup that closes returns focus
  to its trigger only when focus was inside it."
- Installed README: @hawiyah/react README: "Escape requests closing; set
  `onCancel={event => event.preventDefault()}` to cancel that action." and
  "Closing restores the prior focused element when it remains connected."
  @hawiyah/vue README: "then returns focus to its connected opener."
  @hawiyah/angular README: "Close and destruction restore the opening trigger when
  it remains connected." (consistent with the pattern; no example cancels).
- ltr and rtl: the same.

### Enter, Space on the close button inside the open dialog

- Outcome: the dialog closes and focus returns to the trigger.
- Sources: APG-BUTTON, Keyboard Interaction: "Enter: Activates the button.",
  "Space: Activates the button.", and "If activating the button closes a dialog,
  focus typically returns to the button that opened the dialog unless the dialog
  completed a task that logically causes focus to be moved to a different
  element." APG-DIALOG, Keyboard Interaction notes: "It is strongly recommended
  that the tab sequence of all dialogs include a visible element with role button
  that closes the dialog". HTML-DIALOG, close the dialog (focus to the previously
  focused element). CONTRACT.md, Unavailable controls and focus: "A popup that
  closes returns focus to its trigger only when focus was inside it."
- Installed README: the close button is named by the required `closeLabel`
  (CHANGELOG.md 0.3.0, Breaking: the application supplies every text and the
  locale: "Dialog, Drawer | 'Close'; Angular 'Close dialog' | closeLabel |
  always").
- ltr and rtl: the same.

## Not bound to a key here

- A click on the backdrop (README: "Backdrop closing defaults on and can be
  disabled.") is a pointer action, not a key of the pattern.
- CHANGELOG.md 0.3.0 Known defects lists no Dialog entry (checked at 9ff8775).

## Notes added after the checks were written (2026-11-22)

The expectations above are unchanged. Observations only:

- In the harness the frame is sized to its document (80 px with a closed dialog);
  a modal dialog in the top layer does not extend the document, so the open dialog
  is a scroll container in an 80 px viewport and Chromium puts the dialog element
  itself in the sequential focus order. Past the last tabbable element Tab moved
  focus out of the frame (frame document without focus), and the next Tab entered
  the dialog element; Shift+Tab from the first tabbable element reached the dialog
  element. Both are within "focus does not reach an element of the document
  outside the dialog", which the checks assert at the ends of the sequence.
- The initial-focus outcome is a property of each check (the position of the
  element the example marks autofocus), not read from the frame: a first version
  read the autofocus attribute from each frame, which let the React frame (which
  renders no autofocus attribute) define its own oracle. Corrected before any
  outcome was accepted.
