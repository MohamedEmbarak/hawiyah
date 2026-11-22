// Interaction check dialog-close-button: the trigger opens the dialog with Space and
// with Enter, and the close button of the dialog header closes it with Enter and
// with Space; after each closing focus is back on the trigger. Every step asserts
// its documented outcome in every frame (lib/dialog.mjs).
import { closeButtonStep, dialogCheck, dialogFixture, openStep, wrongDialog } from './lib/dialog.mjs';

export default {
  name: 'dialog-close-button',
  ...dialogCheck,
  negative: { fixture: dialogFixture(), wrong: wrongDialog },
  steps: [
    openStep({ name: 'space-opens', key: 'Space' }),
    closeButtonStep({ name: 'enter-on-close', key: 'Enter' }),
    openStep({ name: 'enter-opens', key: 'Enter' }),
    closeButtonStep({ name: 'space-on-close', key: 'Space' }),
  ],
};
