// Interaction check dialog-keyboard: a modal dialog opened from its trigger. Enter
// on the trigger opens it and focus moves to its first tabbable element (the close
// button of its header); Tab and Shift + Tab move through its tab sequence and,
// past either end, never reach the page behind it; Escape closes it and focus
// returns to the trigger; the same again with Tab past the last element. Every step
// asserts its documented outcome in every frame (lib/dialog.mjs holds the oracle and
// its references); the harness also compares the four results after each step.
import { dialogCheck, dialogFixture, escapeStep, openStep, shiftTabStep, tabStep, wrongDialog } from './lib/dialog.mjs';

export default {
  name: 'dialog-keyboard',
  ...dialogCheck,
  negative: { fixture: dialogFixture(), wrong: wrongDialog },
  steps: [
    openStep({ name: 'enter-opens', key: 'Enter' }),
    tabStep({ name: 'tab-next' }),
    tabStep({ name: 'tab-next-again' }),
    shiftTabStep({ name: 'shift-tab-previous' }),
    shiftTabStep({ name: 'shift-tab-previous-again' }),
    shiftTabStep({ name: 'shift-tab-before-first' }),
    escapeStep({ name: 'escape-closes', on: 0 }),
    openStep({ name: 'enter-opens-again', key: 'Enter' }),
    tabStep({ name: 'tab-to-second' }),
    tabStep({ name: 'tab-to-last' }),
    tabStep({ name: 'tab-past-last' }),
    escapeStep({ name: 'escape-closes-again', on: 2 }),
  ],
};
