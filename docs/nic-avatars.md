# NIC avatar alignment

Source: the hashed `global.css` snapshot recorded in
[NIC web reference](nic-web-reference.md), CSS 3156–3181. The source defines
image presentation, not profile fetching, image-error behavior or identity
verification. No official profile artwork was redistributed.

| Source | Observed value | Nasaq implementation | Confidence / boundary |
| --- | --- | --- | --- |
| 3156–3162 | Circle, 3px white border, centered cover crop | DGA/custom avatar profile; direct image and wrapped image markup | High for image presentation; using the existing full-radius token is equivalent for square dimensions |
| 3164–3181 | Explicit 40, 64, 80, 120px options | Additive `data-size="40|64|80|120"` and matching native `size` props | High; these are border-box dimensions in Nasaq |
| Reset dependency | Without border-box, source rendered sizes are 46/70/86/126px | Explicit component border-box keeps the intended 40/64/80/120px independent of optional reset.css | Rendered evidence; isolated source fixture checked both reset conditions |
| No default size or fallback logic in this block | Host selects a size and supplies image | DGA default selects the 40px source option; original Nasaq default stays 44px; native adapters supply initials fallback | Explicit Nasaq adaptations, not inferred NIC behavior |

An isolated Chromium fixture loaded the source CSS with network requests
blocked and self-authored SVG image content. It measured all four dimensions,
3px white borders, 50% radius and `object-fit: cover` / centered positioning.
This confirms properties and reset dependence, not live-site visual parity.

## API and compatibility

React/Vue `Avatar` and Angular `nq-avatar` accept required `name`, optional
`src`, `initials`, `size` and `variant`. Numeric source sizes are string values
`"40"`, `"64"`, `"80"`, `"120"`. Existing `sm` (32px), `lg` (56px), `xl` (80px)
remain available as Nasaq extensions. `md` uses the theme default (40px DGA,
44px original Nasaq). The square variant is an existing Nasaq extension;
circle is the default. React/Vue retain native `data-size` / `data-variant`
attributes; typed props take precedence.

```html
<span class="nq-avatar" data-size="64">
  <img src="/profile-example.svg" alt="مستخدم تجريبي">
</span>
```

Direct `<img class="nq-avatar" data-size="64" ...>` also works. Nested images
fill the inner content box, not the border box, and retain centered cropping.
Use `--nq-avatar-size` for custom dimensions. Sizes use rem equivalents at the
default 16px root and scale with the application's root font size. Native adapters own
their DOM; there is no vanilla enhancer applied to their markup.

React and Vue now match Angular's image-error recovery. A failed image is
replaced by explicit initials, or the first Unicode code point of each of the
first two name parts. Changing `src` retries the image, including returning to
a previously failed URL after another source. React keeps its `imageProps`
API, including the caller's error callback. Angular adds the explicit initials
input. Initials derivation is not a full grapheme-cluster abbreviation engine.

When the image is visible, its `alt` names the represented person. During
fallback, the wrapper has `role="img"` and the full name as its accessible
label; visible initials are hidden from the accessibility tree to avoid a
duplicate abbreviation. Avatars remain static, with no implicit button,
keyboard stop or live region. Use a separately named button/link if the avatar
opens an action. Vanilla authors own image-error handling and any DOM updates;
the static HTML examples do not promise an automatic controller.

The DGA light border is white. Dark mode uses a semantic surface separator;
custom themes may override `--nq-color-avatar-border`. Original Nasaq retains
its 1px border and existing sizes; its grouped avatars retain their 2px surface
separator. DGA groups inherit the 3px border and 40px default, while overlap and
overflow counts remain Nasaq compositions rather than source-defined behavior.
System colors preserve the border. No animation or calendar behavior changes.

The guide's seven ready examples and native editor recipes include all four
source sizes, a square image, derived initials and explicit initials. They use
an original abstract SVG with a non-square canvas, making the cover crop
inspectable without a network request or personal data.

## Validation — 2026-11-03

Seven focused Chromium scenarios pass: Arabic/English vanilla galleries and
React JSX/TSX, Vue JavaScript/TypeScript and Angular TypeScript native previews.
They check all source sizes, inner image dimensions, centered cover cropping,
square/initials extensions, original/custom themes, narrow layouts, system
colors, and scoped light/dark axe checks. The Arabic gallery screenshot was
visually inspected. The five native cases additionally passed with an invalid
image data URL, exercising real browser resource errors rather than a synthetic
error event. Fallback preserves both the avatar's dimensions and its full name.

Six focused adapter tests verify failure, source-change retry (including a
previously failed URL), explicit/name-derived initials, accessible identity and
the React error callback. Together with the existing adapter regression suites,
52 tests pass. All eight token contrast checks pass. Package, guide and native
application builds pass, including the `/nasaq/` guide deployment path. Clean
tarballs pass ESM/SSR, Angular APF, CSS imports, declarations and tree-shaking
checks. All 31 React recipes pass TypeScript checking, all 31 Angular recipes
pass strict templates, and seven exported framework/language combinations
build. These focused checks do not establish full-site or official DGA parity;
the broader alignment assessment remains open. Nothing was published to npm.
