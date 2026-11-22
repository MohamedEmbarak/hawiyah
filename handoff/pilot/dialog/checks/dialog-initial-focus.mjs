// Interaction check dialog-initial-focus: a dialog whose footer button that keeps
// the request is marked autofocus. Enter on the trigger opens the dialog with focus
// on that button, not on the close button before it; Shift + Tab and Tab move from
// there through the tab sequence, Tab past the last element never reaches the page
// behind the dialog, and Escape closes it with focus back on the trigger. Every step
// asserts its documented outcome in every frame (lib/dialog.mjs).
import { dialogCheck, dialogFixture, escapeStep, openStep, shiftTabStep, tabStep, wrongDialog } from './lib/dialog.mjs';

export default {
  name: 'dialog-initial-focus',
  ...dialogCheck,
  // The fixture marks its first footer button (tabbable element 2) autofocus, as the example does.
  negative: { fixture: dialogFixture({ autofocus: 0 }), wrong: wrongDialog },
  steps: [
    // The example marks its first footer button autofocus: the second element of the tab sequence, after the close button.
    openStep({ name: 'enter-opens-on-autofocus', key: 'Enter', autofocus: 1 }),
    shiftTabStep({ name: 'shift-tab-previous' }),
    tabStep({ name: 'tab-next' }),
    tabStep({ name: 'tab-to-last' }),
    tabStep({ name: 'tab-past-last' }),
    escapeStep({ name: 'escape-closes', on: 1 }),
  ],
};
