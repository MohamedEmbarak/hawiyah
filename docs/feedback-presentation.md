# Feedback choices and inline icons

Feedback choices stay in one horizontal action row, wrapping only when space
requires it. A broad panel-grid rule had overridden the vanilla choice row.
Link anchors containing direct SVG or `nq-icon` children now align their text
and icon in a flex row; the global block-SVG reset no longer drops arrows below
their label. Directional icons retain their existing RTL treatment.

All native adapters accept `choiceVariant="text" | "icon-text" | "icon"`.
Vanilla uses `data-choice-variant` on `nq-feedback`, an `nq-feedback-actions`
row, decorative `nq-feedback-icon` spans and `nq-feedback-label` text spans.
Text is the default. Icon-only presentation hides labels visually but keeps
accessible names. React retains native radio selection and comment submission;
Vue retains its string model and comment submission; Angular retains its boolean
choice contract. No network persistence is implied.

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
