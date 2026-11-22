# portal-header: keyboard reference (fixed before the checks; 2026-11-22)

Written before any adapter's behaviour was read. Sources used: the fact sheet
(`npm run content:facts -- portal-header`), the installed package READMEs and
PORTAL.md files (0.3.0), the installed stylesheet for the breakpoint only,
CONTRACT.md and CHANGELOG.md at commit 9ff8775.

Source of the WAI-ARIA text: www.w3.org cannot be resolved from this session
(the network policy refuses the host), so the APG text below is quoted from the
published pattern as known to the author, not re-read today. The lead should
compare each quotation with
https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ and
https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/.

Abbreviations used as references in the checks:

- APG-D: WAI-ARIA Authoring Practices, Disclosure (Show/Hide) pattern.
- APG-DN: WAI-ARIA Authoring Practices, example "Disclosure Navigation Menu",
  Keyboard Support.
- PORTAL: `@hawiyah/vanilla` PORTAL.md (the same text is in the react, vue and
  angular PORTAL.md where they describe the header).
- CONTRACT: CONTRACT.md at the repository root.
- FACTS: components.json note of portal-header, as the fact sheet prints it.

## What the header has (from the fact sheet and the READMEs)

1. A skip link `a.hw-skip-link` (vanilla markup; `mainId` with `skipLabel` in
   React, Vue, Angular). PORTAL: "The order inside the header is the reading and
   tab order: skip link, notice, brand, menu toggle, navigation, actions."
2. The brand `.hw-portal-brand`, a link when there is a home address
   (`homeHref`, default `'/'`).
3. The menu toggle `button.hw-portal-menu-toggle`, a disclosure button for the
   navigation. Shown only below 48rem (stylesheet: `.hw-portal-menu-toggle {
   display: none; }`, and `display: inline-flex` inside
   `@media (max-width: 47.999rem)`). PORTAL: "The 48rem mobile disclosure
   breakpoint is a Hawiyah adaptation." FACTS: "Mobile disclosure below 48rem".
4. The primary navigation `nav` (a landmark named by `navigationLabel`), with
   top-level links and, for an item with `groups`, a branch: a native
   `details.hw-portal-branch` whose `summary` is the disclosure control of a
   panel of grouped links (`div.hw-portal-branch-panel`). Visible at every
   width; below 48rem only while the menu is expanded.
5. The actions container `div.hw-portal-header-actions` (application content,
   untouched by the controller).

There is no search control in the header itself: a search field would be an
action the application places in the actions container, and it is a different
component. The reference therefore covers two kinds of disclosure button: the
menu toggle (narrow layout only) and the branch summaries (both layouts).

## Width of each check

- Wide layout (48rem and wider; the harness compares a framed group in frames
  1280 px wide): the menu toggle is not rendered, the navigation is always
  shown. Branch summaries, Escape in an open branch and the Tab order run here.
- Narrow layout (below 48rem): the menu toggle is rendered and the navigation
  is collapsed until it is expanded. Enter, Space and Escape of the menu toggle
  can only be checked here.

## Expectations

Direction: none of the keys below depends on the reading direction. Tab follows
the document order, which is the same in left-to-right and right-to-left (only
the visual placement mirrors, through logical CSS). Every expectation below
holds unchanged in English (ltr) and Arabic (rtl) frames.

### Tab (both layouts)

T1. Tab from before the header moves focus to the skip link, then to the brand
    link, then (narrow only) to the menu toggle, then through the entries of the
    navigation in document order (top-level links and branch summaries), then to
    the controls of the actions container.
    Sources: PORTAL ("The order inside the header is the reading and tab order:
    skip link, notice, brand, menu toggle, navigation, actions."); APG-DN, Tab:
    "Move keyboard focus among top-level buttons, and if a dropdown is open, into
    and through links in the dropdown."; FACTS ("Tab remains native"); PORTAL
    ("Tab retains native navigation").
T2. A collapsed branch: its panel links are not in the tab sequence; Tab from its
    summary moves to the next top-level entry. Source: APG-DN, Tab (links of a
    dropdown are reached only "if a dropdown is open"); APG-D ("hidden" content).
T3. An expanded branch: Tab from its summary moves to the first link of its
    panel, then through the panel links in document order. Source: APG-DN, Tab.
T4. Tab from the last link of an expanded branch moves focus to the next
    top-level entry and the branch collapses (focus left it); focus is not moved
    back. Sources: CONTRACT, Unavailable controls and focus: "When focus moves to
    an element outside a non-modal popup, the popup closes without moving
    focus."; PORTAL: "Moving focus or pressing outside a branch dismisses it.";
    FACTS: "links/outside press/focus leaving close it".
T5. Narrow: while the menu is collapsed the navigation entries are not in the
    tab sequence (Tab from the toggle goes to the actions); while it is expanded,
    Tab from the toggle goes to the first navigation entry. Tab from the last
    navigation entry to the actions collapses the menu (focus left it), without
    moving focus. Sources: APG-D (content hidden while collapsed); CONTRACT and
    PORTAL as in T4 ("Selecting a link, moving focus out, or pressing outside
    closes it").

### Enter and Space on a branch summary (both layouts)

B1. Enter on a collapsed summary expands its branch: the panel is shown, the
    expanded state of the summary is true; focus stays on the summary. Enter on
    an expanded summary collapses it (panel hidden, expanded false); focus stays.
    Source: APG-D, Keyboard Interaction: "Enter: activates the disclosure
    control and toggles the visibility of the disclosure content."; APG-D,
    Roles, States, and Properties: "When the content is visible, the element
    with role button has aria-expanded set to true. When the content area is
    hidden, it is set to false."; APG-DN, Space or Enter: "If focus is on a
    disclosure button, activates the button, which toggles the visibility of the
    dropdown."
B2. Space: the same as Enter. Source: APG-D: "Space: activates the disclosure
    control and toggles the visibility of the disclosure content."
B3. Expanding one branch collapses an expanded sibling branch. Source: PORTAL:
    "Opening a sibling summary closes the previous branch." (A Hawiyah rule; the
    APG example leaves it open.)

Deliberate difference from APG-D, recorded from the README: the disclosure
control of a branch is a native `summary`, not an element with `role="button"`
and `aria-expanded`. PORTAL: "Use a native `details[data-hw-portal-branch]`
inside the navigation for a group of links. The summary stays
keyboard-operable before enhancement." The expanded state is announced through
the `open` state of the `details` element, which browsers expose as the
expanded state of the summary. The checks therefore read the expanded state of
a summary as the `open` state of its `details`, and, where a summary also
carries `aria-expanded`, require the two to agree.

### Escape in an open branch (both layouts)

E1. Escape while focus is on a link inside an expanded branch: the branch
    collapses and focus returns to its summary. Sources: APG-DN, Escape: "If a
    dropdown is open, closes it and sets focus on the button that controls that
    dropdown."; PORTAL: "Escape closes the innermost open branch and focuses its
    summary."; CONTRACT: "A popup that closes returns focus to its trigger only
    when focus was inside it."
E2. Escape while focus is on the summary of an expanded branch: the branch
    collapses; focus stays on the summary. Sources: as E1.
E3. Narrow, menu expanded, a branch expanded, focus in the branch: the first
    Escape collapses only the branch (E1); a second Escape collapses the menu
    and moves focus to the menu toggle. PORTAL: "A subsequent Escape closes the
    mobile navigation when its toggle is expanded."
E4. Escape with nothing expanded changes nothing (focus stays, nothing opens).
    Source: APG-DN, Escape ("If a dropdown is open, ..."; nothing otherwise).

### Enter and Space on the menu toggle (narrow layout only)

M1. Enter on the collapsed toggle: `aria-expanded="true"` on the toggle, the
    navigation is shown; focus stays on the toggle. Enter again: collapsed,
    `aria-expanded="false"`, navigation hidden; focus stays. Sources: APG-D,
    Enter and Roles, States, and Properties (as B1); PORTAL: "`[(open)]` is the
    disclosure of the navigation below 48rem" (angular README), "`open`/
    `defaultOpen`/`onOpenChange` for the menu below 48rem" (react README).
M2. Space: the same as Enter. Source: APG-D, Space.
M3. Escape with focus in the expanded navigation (on a top-level link, no branch
    open): the menu collapses and focus returns to the toggle. Sources: PORTAL:
    "Escape closes the mobile navigation and returns focus to its toggle.";
    FACTS: "Escape returns focus"; CONTRACT (return to the trigger when focus was
    inside).

### Keys of the pattern that do not apply

- Down Arrow, Up Arrow, Right Arrow, Left Arrow, Home, End: optional in APG-DN
  ("(Optional)" for each). Deliberate difference recorded in the README:
  PORTAL: "Escape closes the mobile navigation and returns focus to its toggle.
  Selecting a link, moving focus out, or pressing outside closes it; Tab
  retains native navigation." and FACTS: "Tab remains native". The header
  handles no arrow key; no check presses one.
- Enter on a link (APG-DN: sets aria-current and activates it): links keep their
  native activation (PORTAL: "Links retain their native activation. Set
  `aria-current="page"` on the destination selected by your router."). Not
  checked: activation navigates the frame, which the frame policy refuses.
- Shift+Tab: native, reverse of T1; not in the keys asked of this check author.

## Announced roles and states

- Toggle: a `button` named by `menuLabel` (or its text) with `aria-expanded`
  that follows M1/M2 (APG-D Roles, States, and Properties); `aria-controls` is
  optional in APG-D ("Optionally, the element with role button has a value
  specified for aria-controls").
- Navigation: a `navigation` landmark named by `navigationLabel` (PORTAL table:
  "Name of the primary navigation landmark.").
- Branch summary: expanded state from `details[open]` (see the difference
  above).
- Current link: `aria-current="page"` set by the application (PORTAL).

## Notes added after the checks were written

(None at the time of fixing. Any later note is dated and added here; the
expectations above are not edited.)

2026-11-22, after the first runs. T5, second sentence ("Tab from the last
navigation entry to the actions collapses the menu"), does not hold below 48rem
in any of the four adapters: the navigation stays expanded while focus is in
the actions container, which is inside the header. Observed in the negative
control (vanilla, 720 px, ltr and rtl) and in a probe of the harness at 390 px
(all four frameworks, English and Arabic). The expectation is kept; the step
`portal-header-tab-order/tab-to-actions` is listed as failing against the
reference for the lead. The four adapters agree with one another (each closes the
navigation only when focus leaves the header root), so the lead may decide that
"moving focus out" in PORTAL.md means out of the header, in which case T5 is a
misreading of the reference and not a package defect. Every other expectation
held in all four adapters in both directions, at 1280 px (step 80) and at 390 px
(probe).
