# Copy action

The Button guide includes two bilingual examples for copying a service desk address and a request reference. Each example includes runnable vanilla JavaScript and copyable React TSX, Vue TypeScript and Angular standalone component code using the public Hawiyah packages.

The supplied `master.js` snapshot binds document clicks on a copy icon, looks for the preceding `.ItemToCopy`, prefers its `href` and otherwise uses its visible text. It removes a leading `mailto:`, trims the result and calls `navigator.clipboard.writeText()`. On completion it displays a success banner for 3 seconds or an error banner for 4 seconds. The original implementation and hash are recorded in the [NIC web reference](nic-web-reference.md).

The Hawiyah recipe uses an explicitly labeled native button. It reads the copy target when the user activates it, prefers a mail address from a `mailto:` URI, and otherwise copies trimmed visible text. For email it excludes query and fragment metadata and decodes a percent-encoded address. A malformed address encoding falls back to visible text. Both examples use inert display text and synthetic `example.test` data.

Each example keeps its own polite status region. Successful writes, denied permission, unavailable Clipboard API, other failures and empty values have localized messages. A failed or unavailable write exposes the exact text in a labeled read-only input. Keyboard users can tab to it, where its contents are selected for the browser's normal copy command. The example does not modify the clipboard on mount or read anything that was previously copied. Clipboard permission remains a browser decision.

The live guide uses its existing demo cleanup signal. A delayed write updates only the initiating example, provided that instance is still mounted and the result belongs to the most recent click. The framework examples retain local result state and use the public Button component or directive. Native form submission and guide routing are independent of this button's `type="button"` activation.

This composition covers the reusable text-copy behavior in JS 1584–1603. The source's global selector, external icon font, site translations and timed notification integration are application-specific. The guide uses local accessible status text to make the result available alongside the value. The browser regression scenarios in `tests/browser/nic-copy-action.spec.ts` use a fake clipboard to exercise both languages, exact copied values, rejection, missing API, keyboard selection and teardown without touching the system clipboard.

Three Chromium guide scenarios passed. A separate isolated run compiled and rendered all 16 published snippets covering both examples, both languages and all four adapters. Each started with zero clipboard writes, copied the expected value on keyboard activation and displayed that value for manual copying after a denied write.
