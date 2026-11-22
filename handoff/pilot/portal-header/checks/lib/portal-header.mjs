// The PortalHeader oracle of the keyboard checks (the chained form of the Tabs model,
// lib/tabs.mjs). Each step presses its keys and returns the state the oracle expects
// after it, computed from the state it expected before the step and the layout the
// frame was read in at rest (below or from 48rem), never from what an adapter does or
// what the frame shows after the step; the harness asserts it in every frame
// (assertPortalHeader). The reference was fixed before these checks were written (the
// check author's reference.md, handed to the lead with the check report). References, cited
// per step:
//   APG_D   WAI-ARIA Authoring Practices, Disclosure (Show/Hide) pattern
//           (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
//   APG_DN  WAI-ARIA Authoring Practices, example "Disclosure Navigation Menu",
//           Keyboard Support (.../patterns/disclosure/examples/disclosure-navigation/).
//   PORTAL  PORTAL.md of the installed @hawiyah/vanilla (the header section), with the
//           components.json note of portal-header.
//   POPUP   CONTRACT.md, Unavailable controls and focus.
// Deliberate differences from the pattern, recorded from the installed README: a branch
// is a native details element whose summary is its disclosure control (PORTAL: "Use a
// native details[data-hw-portal-branch] inside the navigation for a group of links."),
// so the expanded state of a summary is the open state of its details, and where a
// summary also carries aria-expanded the two must agree; the header handles no arrow
// key (PORTAL: "Tab retains native navigation.").
//
// Layout. The menu toggle exists only below 48rem (a Hawiyah adaptation: PORTAL, "The
// 48rem mobile disclosure breakpoint is a Hawiyah adaptation."). Step 80 runs the
// checks of a framed group in frames 1280 px wide (the wide layout); the negative
// control of scripts/equivalence/test/negative.test.mjs renders its fixture in a frame
// 720 px wide (the narrow layout). The oracle covers both: start() records the layout
// of the frame at rest (the media query of the stylesheet, not a state of the
// component), and every outcome is computed for that layout.
//
// Focus leaving a frame. When another frame of the harness takes the focus, the frame's
// document loses its focused element (measured for Tabs, lib/tabs.mjs), so focus has
// left the header and every expanded branch and the navigation collapse (POPUP: "When
// focus moves to an element outside a non-modal popup, the popup closes without moving
// focus."). Before a step and in the final read, a frame whose document does not have
// the focus is therefore expected to show everything collapsed, and a frame that still
// has it the state of the previous step. Each step first restores the expected state
// with element.click() on the menu toggle or a summary (no key, no pointer movement) and
// focus, as pressOnFocusedTab restores the focused tab, and
// then presses its key; the outcome is computed from the expected state, not from what
// the restore found.
// This directory holds no check: a group cannot name lib/... (check names match
// ^[a-z][a-z0-9-]*$).

export const APG_D = 'WAI-ARIA Authoring Practices, Disclosure (Show/Hide) pattern';
export const APG_DN = 'WAI-ARIA Authoring Practices, Disclosure Navigation Menu example, Keyboard Support';
export const PORTAL = '@hawiyah/vanilla PORTAL.md (header)';
export const POPUP = 'CONTRACT.md, Unavailable controls and focus';

export const REF = {
  enter: `${APG_D}, Keyboard Interaction: "Enter: activates the disclosure control and toggles the visibility of the disclosure content."; Roles, States, and Properties: aria-expanded is true while the content is visible and false while it is hidden`,
  space: `${APG_D}, Keyboard Interaction: "Space: activates the disclosure control and toggles the visibility of the disclosure content."; Roles, States, and Properties: aria-expanded follows the visibility`,
  tabOrder: `${PORTAL}: "The order inside the header is the reading and tab order: skip link, notice, brand, menu toggle, navigation, actions."; ${APG_DN}, Tab: "Move keyboard focus among top-level buttons, and if a dropdown is open, into and through links in the dropdown."`,
  tabLeave: `${POPUP}: "When focus moves to an element outside a non-modal popup, the popup closes without moving focus."; ${PORTAL}: "Moving focus or pressing outside a branch dismisses it."`,
  escapeBranch: `${APG_DN}, Escape: "If a dropdown is open, closes it and sets focus on the button that controls that dropdown."; ${PORTAL}: "Escape closes the innermost open branch and focuses its summary."`,
  escapeMenu: `${PORTAL}: "Escape closes the mobile navigation and returns focus to its toggle." and "A subsequent Escape closes the mobile navigation when its toggle is expanded."; ${POPUP}: "A popup that closes returns focus to its trigger only when focus was inside it."`,
  escapeNothing: `${APG_DN}, Escape: "If a dropdown is open, closes it ..."; with nothing open there is nothing to close`,
  outside: `${PORTAL}: "Selecting a link, moving focus out, or pressing outside closes it" and "Moving focus or pressing outside a branch dismisses it."`,
};

/** The focusable controls of the header, in document order (the Tab sequence of an HTML document). */
export const FOCUSABLE = 'a[href], button:not([disabled]), summary, input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** What a frame shows of its header: the controls in document order, the expanded branches, the menu, the focus and the layout. */
export async function readPortalHeader(mount) {
  return mount.evaluate((root, selector) => {
    const header = root.querySelector('.hw-portal-header');
    if (!header) throw new Error('the result has no .hw-portal-header');
    const doc = root.ownerDocument;
    const branches = Array.from(header.querySelectorAll('details.hw-portal-branch'));
    const nav = header.querySelector('nav');
    const toggle = header.querySelector('.hw-portal-menu-toggle');
    const visible = (node) => Boolean(node) && (typeof node.checkVisibility === 'function' ? node.checkVisibility() : node.getClientRects().length > 0);
    const controls = Array.from(header.querySelectorAll(selector));
    const kindOf = (node) => {
      const branch = node.closest('details.hw-portal-branch');
      if (node.matches('a.hw-skip-link')) return { kind: 'skip' };
      if (node.matches('.hw-portal-brand')) return { kind: 'brand' };
      if (node.matches('.hw-portal-menu-toggle')) return { kind: 'toggle' };
      if (branch && node.matches('summary') && node.parentElement === branch) return { kind: 'summary', branch: branches.indexOf(branch) };
      if (branch) return { kind: 'panel', branch: branches.indexOf(branch) };
      if (nav && nav.contains(node)) return { kind: 'entry' };
      if (node.closest('.hw-portal-header-actions')) return { kind: 'action' };
      return { kind: 'other' };
    };
    const active = doc.activeElement;
    return {
      narrow: doc.defaultView.matchMedia('(max-width: 47.999rem)').matches,
      hasFocus: doc.hasFocus(),
      controls: controls.map((node) => ({ ...kindOf(node), name: (node.getAttribute('aria-label') || node.textContent || '').trim().replace(/\s+/g, ' ') })),
      focused: controls.indexOf(active),
      open: branches.map((branch) => branch.open),
      summaryExpanded: branches.map((branch) => branch.querySelector(':scope > summary')?.getAttribute('aria-expanded') ?? null),
      panelShown: branches.map((branch) => visible(branch.querySelector(':scope > .hw-portal-branch-panel'))),
      menuExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
      toggleShown: visible(toggle),
      navShown: visible(nav),
    };
  }, FOCUSABLE);
}

const describe = (state, index) => {
  if (index === null) return 'anywhere';
  if (index < 0) return 'no control of the header';
  const control = state.controls[index];
  return control ? `${control.kind} "${control.name}" (control ${index + 1})` : `control ${index + 1}`;
};

/**
 * The state the oracle starts from: the header as the frame shows it at rest, read once
 * before the first step (its controls, its layout, what is expanded and focused).
 */
export function startPortalHeader(observed) {
  return {
    narrow: observed.narrow,
    controls: observed.controls,
    open: observed.open,
    menuOpen: observed.menuExpanded === 'true',
    focused: observed.focused,
  };
}

/** Everything collapsed: the state after focus has left the header (POPUP; PORTAL). */
export const collapsed = (state) => ({ ...state, open: state.open.map(() => false), menuOpen: false });

/**
 * Fails unless the frame shows the expected state: the expanded branches (details open,
 * the panel shown, aria-expanded on a summary when present agreeing), the menu toggle
 * (aria-expanded) and the navigation (shown from 48rem, below it only while the menu is
 * expanded), and right after a step (phase 'after') the focused control. Before a step
 * and in the final read, a frame whose document lost the focus to another frame is
 * expected to show everything collapsed (see the head of this file); focus is not
 * asserted there.
 */
export function assertPortalHeader(observed, expected, { phase }) {
  const want = phase !== 'after' && !observed.hasFocus ? collapsed(expected) : expected;
  if (observed.narrow !== want.narrow) throw new Error(`the layout changed: the oracle was started ${want.narrow ? 'below' : 'at or above'} 48rem`);
  if (observed.controls.length !== want.controls.length) throw new Error(`the header is expected to keep ${want.controls.length} focusable controls; it has ${observed.controls.length}`);
  want.open.forEach((open, index) => {
    if (observed.open[index] !== open) throw new Error(`branch ${index + 1} is expected to be ${open ? 'expanded' : 'collapsed'}; its details element is ${observed.open[index] ? 'open' : 'closed'}`);
    if (observed.panelShown[index] !== open) throw new Error(`the panel of branch ${index + 1} is expected to be ${open ? 'shown' : 'hidden'}`);
    const aria = observed.summaryExpanded[index];
    if (aria !== null && aria !== String(open)) throw new Error(`the summary of branch ${index + 1} has aria-expanded="${aria}", while its branch is expected ${open ? 'expanded' : 'collapsed'}`);
  });
  if (observed.menuExpanded !== null && observed.menuExpanded !== String(want.menuOpen)) {
    throw new Error(`the menu toggle is expected to have aria-expanded="${want.menuOpen}"; it has "${observed.menuExpanded}"`);
  }
  if (want.narrow) {
    if (!observed.toggleShown) throw new Error('below 48rem the menu toggle is expected to be shown');
    if (observed.navShown !== want.menuOpen) throw new Error(`below 48rem the navigation is expected to be ${want.menuOpen ? 'shown (menu expanded)' : 'hidden (menu collapsed)'}`);
  } else {
    if (observed.toggleShown) throw new Error('from 48rem the menu toggle is expected to be hidden');
    if (!observed.navShown) throw new Error('from 48rem the navigation is expected to be shown');
  }
  if (phase !== 'after' || want.focused === null) return;
  if (observed.focused !== want.focused) throw new Error(`focus is expected on ${describe(want, want.focused)}; it is on ${describe(observed, observed.focused)}`);
}

/**
 * The deliberately wrong oracle of the negative control of every PortalHeader check:
 * focus one control further (wrapping), every branch and the menu inverted. Every
 * keyed step asserts the focus, so it differs from the documented outcome at every step.
 */
export function wrongPortalHeader(expected) {
  const count = expected.controls.length;
  const focused = expected.focused === null ? null : (expected.focused + 1 + count) % count;
  return { ...expected, focused, open: expected.open.map((open) => !open), menuOpen: !expected.menuOpen };
}

/** The parts of a PortalHeader check that are the same for every check. */
export const portalHeaderCheck = { read: readPortalHeader, start: startPortalHeader, assert: assertPortalHeader };

// --- The oracle ----------------------------------------------------------------------

const RANK = { skip: 0, brand: 2, toggle: 3, entry: 4, summary: 4, panel: 4, action: 5, other: 6 };
const inNav = (control) => control && ['entry', 'summary', 'panel'].includes(control.kind);
const inBranch = (control, branch) => control && (control.kind === 'summary' || control.kind === 'panel') && control.branch === branch;

/** Whether a control is in the Tab sequence in a state (APG_D: collapsed content is hidden; PORTAL: the toggle exists below 48rem). */
export function reachable(state, control) {
  const navShown = !state.narrow || state.menuOpen;
  if (control.kind === 'toggle') return state.narrow;
  if (control.kind === 'entry' || control.kind === 'summary') return navShown;
  if (control.kind === 'panel') return navShown && state.open[control.branch];
  return true;
}

/** The Tab sequence of the header in a state: PORTAL's order (skip link, notice, brand, menu toggle, navigation, actions), document order inside each part. */
export function tabSequence(state) {
  return state.controls
    .map((control, index) => ({ control, index }))
    .sort((a, b) => (RANK[a.control.kind] - RANK[b.control.kind]) || (a.index - b.index))
    .filter(({ control }) => reachable(state, control))
    .map(({ index }) => index);
}

/** The state after focus moves from one control to another (-1: out of the header): what focus leaves collapses (POPUP; PORTAL). */
export function moveFocus(state, to) {
  const from = state.controls[state.focused];
  const target = state.controls[to];
  const open = state.open.map((value, branch) => value && (!inBranch(from, branch) || inBranch(target, branch)));
  let menuOpen = state.menuOpen;
  if (state.narrow && inNav(from) && !inNav(target)) {
    menuOpen = false;
    open.fill(false);
  }
  return { ...state, focused: to, open, menuOpen };
}

/** Tab: focus moves to the next control of the sequence; what it leaves collapses. */
export function afterTab(state) {
  const sequence = tabSequence(state);
  if (state.focused < 0) return moveFocus(state, sequence[0]);
  const position = sequence.indexOf(state.focused);
  if (position < 0) throw new Error(`the oracle has no Tab outcome from ${describe(state, state.focused)}, which is not in the Tab sequence`);
  if (position === sequence.length - 1) throw new Error('the oracle has no Tab outcome from the last control of the header: focus would leave the frame');
  return moveFocus(state, sequence[position + 1]);
}

/** Enter or Space on the focused control: a summary toggles its branch (expanding one collapses the others, PORTAL), the menu toggle toggles the navigation; focus stays. */
export function afterActivate(state) {
  const control = state.controls[state.focused];
  if (control?.kind === 'summary') {
    const opening = !state.open[control.branch];
    return { ...state, open: state.open.map((value, branch) => (branch === control.branch ? opening : opening ? false : value)) };
  }
  if (control?.kind === 'toggle') return { ...state, menuOpen: !state.menuOpen, open: state.open.map(() => false) };
  throw new Error(`the oracle has no Enter or Space outcome on ${describe(state, state.focused)}`);
}

/** Escape: the expanded branch collapses and its summary takes focus; else, below 48rem, the expanded navigation collapses and its toggle takes focus when focus was inside it; else nothing changes. */
export function afterEscape(state) {
  const control = state.controls[state.focused];
  const owner = inNav(control) && control.kind !== 'entry' && state.open[control.branch] ? control.branch : state.open.indexOf(true);
  if (owner >= 0) {
    const summary = state.controls.findIndex((item) => item.kind === 'summary' && item.branch === owner);
    return { ...state, open: state.open.map((value, branch) => (branch === owner ? false : value)), focused: summary };
  }
  if (state.narrow && state.menuOpen && (inNav(control) || control?.kind === 'toggle')) {
    return { ...state, menuOpen: false, focused: state.controls.findIndex((item) => item.kind === 'toggle') };
  }
  return { ...state };
}

/** The index of the first control of a kind (and branch), for a step that places focus. */
export function controlIndex(state, kind, branch) {
  const index = state.controls.findIndex((control) => control.kind === kind && (branch === undefined || control.branch === branch));
  if (index < 0) throw new Error(`the header has no ${kind}${branch === undefined ? '' : ` in branch ${branch + 1}`}`);
  return index;
}

// --- Running a step in a frame -------------------------------------------------------

/**
 * Restores the state the oracle expects before a step (focus leaving a frame collapses
 * the header): the menu toggle and the branch summaries are clicked where the frame
 * differs from it, then the expected control is focused. Returns the locator of the
 * focused control. No key is pressed.
 */
export async function restore(context, expected = context.expected) {
  const { mount } = context;
  // A click through element.click(): it runs the activation of the control (the HTML Standard
  // runs activation behaviour for a click event) without moving the pointer, so no :hover is
  // left in the frame for the harness to clear. Each click is followed by a wait until the
  // frame shows its effect (an adapter may render it in a later task).
  const activate = async (locator, settled) => {
    await locator.evaluate((node) => node.click());
    for (let waited = 0; waited < 2_000 && !settled(await readPortalHeader(mount)); waited += 20) await new Promise((done) => setTimeout(done, 20));
  };
  const now = await readPortalHeader(mount);
  if (expected.narrow && String(expected.menuOpen) !== now.menuExpanded) {
    await activate(mount.locator('.hw-portal-header .hw-portal-menu-toggle'), (read) => read.menuExpanded === String(expected.menuOpen));
  }
  for (const [branch, open] of expected.open.entries()) {
    if ((await readPortalHeader(mount)).open[branch] !== open) {
      await activate(mount.locator('.hw-portal-header details.hw-portal-branch > summary').nth(branch), (read) => read.open[branch] === open);
    }
  }
  if (expected.focused === null || expected.focused < 0) return null;
  const locator = mount.locator('.hw-portal-header').locator(FOCUSABLE).nth(expected.focused);
  await locator.focus();
  return locator;
}

/** Restores the expected state and presses a key on the expected focused control. */
export async function pressOnFocused(context, key) {
  const locator = await restore(context);
  if (!locator) throw new Error('no control of the header is expected to have focus before the key');
  await context.press(locator, key);
}

/** A step without keys that places focus on a control (and, below 48rem, expands the navigation first when the control is in it). */
export function focusStep({ name, kind, branch, outcome }) {
  return {
    name,
    outcome,
    reference: REF.tabOrder,
    expect(previous) {
      const index = controlIndex(previous, kind, branch);
      const menuOpen = previous.narrow && inNav(previous.controls[index]) ? true : previous.menuOpen;
      return { ...previous, menuOpen, open: previous.open.map(() => false), focused: index };
    },
    async run(context) {
      const index = controlIndex(context.expected, kind, branch);
      const menuOpen = context.expected.narrow && inNav(context.expected.controls[index]) ? true : context.expected.menuOpen;
      await restore(context, { ...context.expected, menuOpen, open: context.expected.open.map(() => false), focused: index });
    },
  };
}

/** Tab from before the header (a click on the padding of the frame document, outside the header, collapses it): focus moves to the first control. */
export function tabIntoHeaderStep() {
  return {
    name: 'tab-into-header',
    keys: ['Tab'],
    outcome: 'Tab from before the header moves focus to its first control, the skip link where there is one, with every branch and the navigation collapsed.',
    reference: `${REF.tabOrder}; ${REF.outside}`,
    async run(context) {
      await context.focusFrameStart();
      await context.press(null, 'Tab');
    },
    expect: (previous) => afterTab({ ...collapsed(previous), focused: -1 }),
  };
}

/** Tab from the expected focused control. */
export function tabStep({ name, outcome }) {
  return {
    name,
    keys: ['Tab'],
    outcome,
    reference: `${REF.tabOrder}; ${REF.tabLeave}`,
    run: (context) => pressOnFocused(context, 'Tab'),
    expect: (previous) => afterTab(previous),
  };
}

/** Enter or Space on the expected focused disclosure control. */
export function activateStep({ name, key, outcome }) {
  return {
    name,
    keys: [key],
    outcome,
    reference: key === 'Enter' ? REF.enter : REF.space,
    run: (context) => pressOnFocused(context, key),
    expect: (previous) => afterActivate(previous),
  };
}

/** Escape on the expected focused control. */
export function escapeStep({ name, outcome, reference }) {
  return {
    name,
    keys: ['Escape'],
    outcome,
    reference,
    run: (context) => pressOnFocused(context, 'Escape'),
    expect: (previous) => afterEscape(previous),
  };
}

/** Fails the oracle of a step written for one layout when the frame has the other. */
export function onlyIn(layout, step) {
  return {
    ...step,
    expect(previous, context) {
      if (previous.narrow !== (layout === 'narrow')) throw new Error(`the step ${step.name} is written for the ${layout} layout (${layout === 'narrow' ? 'below' : 'from'} 48rem); this frame has the other`);
      return step.expect(previous, context);
    },
  };
}

// --- The fixture of the negative control ---------------------------------------------

/**
 * The vanilla markup of the negative control (rendered with the installed
 * @hawiyah/vanilla in a frame 720 px wide, so below 48rem): a skip link, a brand link,
 * the menu toggle, a navigation with a link, two branches and a link, and one action.
 */
export function portalHeaderFixture() {
  const branch = (name, links) => `<li><details class="hw-portal-branch" data-hw-portal-branch><summary>${name}</summary><div class="hw-portal-branch-panel"><a class="hw-link hw-portal-branch-overview" href="/${name.toLowerCase()}">${name}</a><section class="hw-portal-branch-group"><h2>${name} group</h2><ul>${links.map((label, index) => `<li><a class="hw-link" href="/${name.toLowerCase()}/${index + 1}">${label}</a></li>`).join('')}</ul></section></div></details></li>`;
  return '<header class="hw-portal-header" data-hw="portal-header">'
    + '<a class="hw-skip-link" href="#fixture-main">Skip</a>'
    + '<a class="hw-portal-brand" href="/"><span>Brand</span></a>'
    + '<button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>Menu</button>'
    + '<nav aria-label="Main" data-hw-portal-navigation><ul>'
    + '<li><a class="hw-link" href="/one" aria-current="page">One</a></li>'
    + branch('Two', ['Two A', 'Two B'])
    + branch('Three', ['Three A', 'Three B'])
    + '<li><a class="hw-link" href="/four">Four</a></li>'
    + '</ul></nav>'
    + '<div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary">Action</button></div>'
    + '</header><main id="fixture-main"><p>Content</p></main>';
}
