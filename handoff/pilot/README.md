# Pilot: keyboard checks written before the pages

Work in progress, kept here so that it survives the session. This folder is deleted
with `handoff/` before the branch merges into `main`.

Three components with a controller had their keyboard checks written before their
pages, each from a reference fixed first (`reference.md`): Dialog, Combobox and
Portal header. For each one this folder holds the reference, the check modules
(`checks/`, to be placed under `guide/scripts/equivalence/checks/`), the draft pages
with the live groups in four frameworks (`draft/`), the Arabic strings of the groups
and the keyboard report (`report.txt`). None of it is in the build yet: the check
modules need the harness changes listed below, and the drafts have empty sections.

## Results at commit 9ff8775 (packages at 0.3.0)

| Component | Groups | Checks | Asserted steps per run | Holding in four frameworks, both languages |
| --- | --- | --- | --- | --- |
| Dialog | 2 | 3 | 44 | 42; the initial-focus step fails in React |
| Combobox | 3 | 3 | 54 | 54 |
| Portal header | 2 | 5 (4 wired) | 54 | 54 of those wired; one narrow-width step fails in the negative control |

## Differences between the adapters that the checks found

Each is reported by a check author and not yet reproduced by a second reader. None is
recorded in `CHANGELOG.md` yet.

1. React Dialog: `autoFocus` on a child renders no `autofocus` attribute, so the
   dialog opens with focus on the close button. The React README says the prop
   selects initial focus. Vanilla, Vue and Angular focus the marked element.
2. Angular Dialog: the header close button has no `data-size="md"`; React and Vue
   write it. No rendering difference was measured.
3. Vanilla Combobox: the status stays empty when an arrow key opens a closed list;
   React, Vue and Angular announce the result count.
4. React Portal header: the brand link carries `hw-link hw-portal-brand`; the others
   carry `hw-portal-brand` only, so the focus and hover styles differ.
5. Vue Portal header: top-level navigation links lack `hw-link`, so their focus
   indicator differs.
6. React and Vue Portal header write `data-branch-href` on each branch; Angular and
   the vanilla markup do not.
7. Angular Portal header always renders `div.hw-portal-notice`, empty without a
   notice.
8. Vanilla Portal header keeps the `menu-01` icon on the menu toggle while the
   navigation is expanded; the others switch to `cancel-01`.
9. Not a difference, a misreading in the reference: Portal header below 48rem keeps
   the navigation expanded when focus moves from it to the header actions and closes
   it when focus leaves the header, in all four adapters. The reference (T5) expected
   it to close. The installed `@hawiyah/vue` `PORTAL.md` says "focus leaving the
   header"; the vanilla `PORTAL.md` says only "moving focus out". The step is
   corrected with a dated note when the checks are taken in, and the vanilla sentence
   gains the words "out of the header" in 0.3.1.

## What the harness cannot do yet

- A frame is sized to its document, which leaves out a modal dialog and an open
  list: the open state is clipped, its screenshot is partial, and two of ten Combobox
  runs differed in one screenshot. Frames need sizing from the open element.
- axe runs only at rest, so never with a dialog or a list open.
- The checks of a framed group run at 1280 px only; the menu toggle of the Portal
  header exists below 48rem, so `portal-header-menu` is wired to no group. A check
  needs a width of its own, in step 80 and in the negative control.
- Typing a character cannot be a declared key, so the Combobox typing step fills the
  field and binds to no row of the keyboard table.
- A group names one known difference; the Portal header needs several.
- The reference of an entry in `vanilla-hooks.json` or `empty-elements.json` must be a
  README sentence or a `CHANGELOG.md` entry; the Dialog and Portal header hooks are
  documented in `API.md` and `PORTAL.md` of the installed packages.
- The vanilla dialog needs an id that the Angular native dialog cannot carry, and the
  extra id shifts every later id reference in the structure comparison.
- The stand-in frame of the negative control is sized once; steps that change the
  page height wait five seconds each.
- A draft page in `docs/components/` fails two script tests, so a check author keeps
  the draft in a separate directory (`--docs`).

## Proposed list entries (the lead's, not yet written)

- `vanilla-hooks.json`: `data-hw-dialog-open`, `data-hw-dialog-close` (dialog);
  `data-hw-results-message` (combobox); `data-hw-portal-toggle`,
  `data-hw-portal-navigation` (portal-header).
- `empty-elements.json`: `hw-portal-notice` (portal-header), after item 7 is recorded.
- `known-differences.json` and `keyboard-exceptions.json`: one entry per recorded
  defect above, each citing its `CHANGELOG.md` entry.

## Quotations compared with the published pattern pages

Compared on 22 November 2026 with the Dialog (Modal), Button, Combobox, Disclosure
and Tabs patterns, the Disclosure Navigation Menu example and the three editable
combobox examples on www.w3.org.

- Check modules (the text a reader sees in the check report): Dialog 8 of 8
  quotations are verbatim, Portal header 6 of 6, Tabs 3 of 3. Combobox 24 of 26: the
  Enter quotation, used twice, leaves out three words ("Accepts the focused option
  in the listbox by closing the popup"). The wrapping of the arrow keys is quoted
  from the example pages, where it is verbatim; the pattern page itself says the
  last option "either returns focus to the combobox or does nothing".
- `combobox/reference.md`: one sentence is quoted that the pattern does not
  contain ("has aria-activedescendant set to empty string or does not have the
  attribute"); the expectation it supports also cites the core contract. Three
  further quotations are paraphrases in quotation marks; their meaning agrees.
- `dialog/reference.md`: two quotations change the end of the sentence (focus after
  closing, in the Dialog and Button patterns); the part the checks use is verbatim.
- To correct when the checks are taken in: the Enter quotation, the sentence the
  pattern does not contain, and the five paraphrases.

## Not checked

- Shift+Tab and the optional arrow keys of the Portal header; the optional keys of
  the Combobox pattern (Alt with the arrows, Left and Right Arrow, Escape on a closed
  list, Enter with no active option); an Escape that the application cancels in
  Dialog.
