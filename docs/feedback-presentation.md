# Feedback choices and inline icons

Feedback choices stay in one horizontal action row, wrapping only when space
requires it. A broad panel-grid rule had overridden the vanilla choice row.
Link anchors containing direct SVG or `hw-icon` children now align their text
and icon in a flex row; the global block-SVG reset no longer drops arrows below
their label. Directional icons retain their existing RTL treatment.

All native adapters accept `choiceVariant="text" | "icon-text" | "icon"`.
Vanilla uses `data-choice-variant` on `hw-feedback`, an `hw-feedback-actions`
row, decorative `hw-feedback-icon` spans and `hw-feedback-label` text spans.
Text is the default. Icon-only presentation hides labels visually but keeps
accessible names.

Feedback has one contract in the four adapters: a `div[role=group]` named by
its question (a first-child `p` from `label`) with two pressed-state buttons
(`yesLabel`, `noLabel`), then a comment field (`commentLabel`) and a submit
button (`submitLabel`) once a choice exists, and `successMessage` after the
submit. The value is `{helpful: boolean | null, comment: string}` (core
`FeedbackValue`): React `value` / `defaultValue` / `onValueChange`, Vue
`v-model`, Angular `[(value)]`, vanilla the `value` option and
`onValueChange`. Submitting reports the value through the feedback action
(React `onFeedback`, Vue `@feedback`, Angular `(feedback)`, vanilla
`onFeedback`). Vanilla reports on the choice when the authored
`[data-hw-feedback-comment]` block is left out. Nothing is sent anywhere; the
application stores or transmits the answer.

These presentation options implement user-requested variants, not a claim of
official certification. Thumbs are unchanged MIT Hugeicons assets from the
existing pinned upstream revision. The supplied DGA icon library establishes
their names and Stroke variant: thumbs-up `8681:25206`, thumbs-down `8681:25213`.
Their geometry has not been compared. Provenance and hashes accompany the assets.

The guide displays all three variants and supplies native project recipes with
localized labels, real imports and callbacks. Five Chromium cases cover vanilla
RTL/LTR at desktop/mobile widths and all three native TypeScript previews,
including keyboard choice changes, icon-only names and contained link clicks.
The React rendered example was visually inspected. Thirty-two existing React/Vue
interaction tests pass. All 26 React recipes pass TypeScript and all 26 Angular
recipes pass strict template checking; seven exported project combinations build.
The guide build, playground type check and clean package consumer checks pass.
Package checks include ESM, SSR, Angular APF, CSS exports, types and tree shaking.
