# Code, keyboard keys and prose

Three style-only contracts in `@hawiyah/styles`. They have no script, no inputs
and no shipped text, so they are identical in vanilla HTML and in the React, Vue
and Angular adapters by construction. The files are `code.css` and `prose.css`,
both part of the flat `styles.css`.

None of this is covered by the Platforms Code references supplied to the
project: `docs/dga-reference.md` records that no standalone components library
was supplied, and `packages/tokens/reference/dga-foundations.json` has no
variable for code or for a monospace role. These are Hawiyah design choices. The
colours are aliases of colours that do carry a Platforms Code source, so only
the mapping is new.

## Code listing

```html
<figure class="hw-code-block">
  <figcaption class="hw-code-block-header">
    <span class="hw-code-block-title" id="c1"><bdi dir="ltr">app.ts</bdi></span>
    <div class="hw-code-block-actions"><!-- copy button, links --></div>
  </figcaption>
  <pre class="hw-code-block-content" dir="ltr" translate="no" tabindex="0"
       role="group" aria-labelledby="c1"><code><span class="hw-code-token-keyword">import</span> …</code></pre>
</figure>
```

| Class or attribute | Element | Purpose |
| --- | --- | --- |
| `hw-code-block` | `figure` | Border, radius and code surface |
| `data-wrap="true"` on `hw-code-block` | | Lines wrap; nothing scrolls |
| `hw-code-block-header` | `figcaption` | Optional row for the title and actions; follows the page direction |
| `hw-code-block-title` | `span` | File name or caption; names the listing |
| `hw-code-block-actions` | `div` | Buttons and links at the inline end |
| `hw-code-block-content` | `pre` | The listing; also valid without a `figure` |
| `hw-code` | `code` | Inline code |
| `hw-kbd` | `kbd` | Keyboard key |
| `hw-code-token-comment`, `-punctuation`, `-keyword`, `-property`, `-string`, `-constant`, `-attribute`, `-tag`, `-type`, `-function` | `span` | Syntax role of a run of code |

### Behaviour

- **Scrolling is the default.** The `pre` is then the only tab stop of the
  listing. The author gives it `tabindex="0"`, `role="group"` and a name
  (`aria-labelledby` the title, or `aria-label`), so that keyboard users can
  scroll it with the arrow keys and screen-reader users hear what it is. The
  application supplies the title and the name; the package ships no text.
- **Wrapping.** With `data-wrap="true"` on the figure the listing uses
  `white-space: pre-wrap` and `overflow-wrap: anywhere`. Nothing scrolls, so the
  author omits `tabindex`, `role` and the name.
- **Direction.** Code is always left to right. The stylesheet sets
  `direction: ltr` and `unicode-bidi: isolate` on the listing, on inline code and
  on keys, and the author writes `dir="ltr"` on the `pre`. No component sets
  `dir`. The header row is ordinary content and follows the nearest `dir`.
- **Focus.** `:focus-visible` on the listing draws `--hw-focus-width` in
  `--hw-color-focus` at `--hw-focus-offset`, outside the listing.
- **Forced colours.** Syntax colours and borders become `CanvasText`; the focus
  ring becomes `Highlight`.
- **Print.** Every listing wraps.
- **Motion.** None.

### Syntax roles are classes

The hooks are classes, not `data-*` attributes. Angular's built-in HTML
sanitizer keeps `class` and removes every `data-*` attribute, so highlighted
markup bound through `innerHTML` would lose a data hook. The role rules sit
inside `:where()` at zero specificity: a highlighter's own theme, or one
application rule, replaces any of them.

A highlighter that emits its own class names is mapped by the application.
Suggested mapping (documentation only; nothing here is shipped):

| Role | Prism | highlight.js | Lezer tag |
| --- | --- | --- | --- |
| `comment` | `comment`, `prolog`, `doctype` | `hljs-comment` | `comment` |
| `punctuation` | `punctuation`, `operator` | `hljs-punctuation`, `hljs-operator` | `punctuation`, `operator`, `bracket` |
| `keyword` | `keyword`, `atrule`, `important` | `hljs-keyword`, `hljs-meta` | `keyword`, `modifier` |
| `property` | `property` | `hljs-property`, `hljs-attribute` (CSS) | `propertyName` |
| `string` | `string`, `attr-value`, `char` | `hljs-string`, `hljs-regexp` | `string`, `regexp` |
| `constant` | `number`, `boolean`, `constant`, `symbol` | `hljs-number`, `hljs-literal` | `number`, `bool`, `atom`, `unit` |
| `attribute` | `attr-name` | `hljs-attr` | `attributeName` |
| `tag` | `tag`, `selector` | `hljs-name`, `hljs-tag`, `hljs-selector-class` | `tagName`, `className` in CSS |
| `type` | `class-name`, `builtin` | `hljs-type`, `hljs-title.class_` | `typeName`, `className` |
| `function` | `function` | `hljs-title.function_` | `function(variableName)` |

A CodeMirror `HighlightStyle` uses the variables directly, for example
`{ tag: tags.keyword, color: 'var(--hw-color-code-keyword)' }`. A highlighter
that emits CSS variables is mapped onto these variables by the application.

### Colour tokens

The tokens live in `packages/tokens/tokens.json` under each theme's light and
dark colour group, written as aliases (`{color.info}`), and reach `tokens.css`
and the typed export as `var(--hw-color-info)`. They introduce no colour value.
An alias follows its target through themes, modes and application overrides.

| Token | Alias of | Used for |
| --- | --- | --- |
| `--hw-color-code-surface` | `--hw-color-surface-muted` | Listing and inline code background |
| `--hw-color-code-text` | `--hw-color-text` | Code without a role |
| `--hw-color-code-border` | `--hw-color-border` | Listing, inline code and key outline |
| `--hw-color-code-comment` | `--hw-color-text-subtle` | Comments |
| `--hw-color-code-punctuation` | `--hw-color-text-muted` | Brackets, operators, separators |
| `--hw-color-code-keyword` | `--hw-color-info` | Keywords and at-rules |
| `--hw-color-code-property` | `--hw-color-info` | Object keys and CSS property names |
| `--hw-color-code-string` | `--hw-color-success` | Strings and attribute values |
| `--hw-color-code-constant` | `--hw-color-warning` | Numbers, booleans, named constants |
| `--hw-color-code-attribute` | `--hw-color-warning` | Markup attribute names |
| `--hw-color-code-tag` | `--hw-color-danger` | Markup tags and CSS selectors |
| `--hw-color-code-type` | `--hw-color-danger` | Type and class names |
| `--hw-color-code-function` | `--hw-color-text` | Function and method names |

Contrast of each role on `--hw-color-code-surface`, measured in Chromium from
the built stylesheet and rounded down. The requirement is 4.5:1 (WCAG 2.2,
1.4.3); `packages/tokens/test/contrast.test.mjs` fails the build of a palette
that drops below it.

| Role | DGA light | DGA dark | Hawiyah light | Hawiyah dark |
| --- | --- | --- | --- | --- |
| text, function | 16.44 | 14.53 | 12.76 | 10.59 |
| comment | 6.69 | 11.74 | 4.60 | 5.36 |
| punctuation | 9.24 | 13.20 | 5.70 | 7.01 |
| keyword, property | 5.43 | 6.28 | 5.96 | 6.63 |
| string | 5.17 | 7.17 | 6.26 | 7.44 |
| constant, attribute | 4.93 | 7.89 | 5.87 | 7.64 |
| tag, type | 5.97 | 5.21 | 5.71 | 6.41 |

Open items:

- The available Platforms Code colours give four hues. `function` and `type`
  have no fifth and sixth hue: `type` shares the hue of `tag`, and `function`
  keeps the text colour. `--hw-color-primary-text` was not used because it
  measures 4.32:1 on the code surface in the DGA light palette. The mapping of
  these two roles awaits the owner's review of rendered samples; the token names
  are not frozen until then.
- The automated accessibility run of the listing markup reports no violation,
  including for the focusable `pre` with `role="group"`. A screen-reader check
  of that element has not been done and is required before the contract is
  frozen.
- Tokens for inserted and deleted lines and for selection, line numbers and line
  highlighting are not part of this contract.

## Prose

```html
<article class="hw-prose">
  <h2 id="api">…</h2>
  <p>…</p>
  <ul><li>…</li></ul>
  <div class="hw-table-wrap" tabindex="0" role="region" aria-label="…"><table class="hw-table">…</table></div>
  <div class="hw-alert" data-tone="info" role="note">…</div>
  <figure class="hw-code-block">…</figure>
</article>
```

`hw-prose` on any container styles class-less content inside it: Markdown or
content-management output that cannot carry classes. There is no component or
directive.

An element is styled only when it has no `class` attribute and no ancestor
inside the container has one. A component placed in prose, and everything inside
it, therefore keeps its own look; prose only sets the space above it. Prose
nested inside such a component is not supported. Every element rule has zero
specificity.

| Element | Treatment |
| --- | --- |
| `h1` | `display-sm` scale |
| `h2` | `display-xs` |
| `h3` | `heading-lg` |
| `h4` | `heading-md` |
| `h5`, `h6` | `heading-sm` |
| `p`, `li`, `dd` | `body-md` |
| `dt` | `body-md`, semibold |
| `small` | `body-sm` |
| `ul`, `ol` | Native markers, logical start padding |
| `blockquote` | Start border, muted text |
| `hr` | The divider line |
| `a` | As `hw-link`, including the indicator on `target="_blank"` |
| `code`, `kbd` | As `hw-code` and `hw-kbd` |
| `pre` | As `hw-code-block-content` |
| `table` | `hw-table` metrics; cells wrap so the table stays inside the container |
| `img` | Limited to the container width, aspect ratio kept |
| `figure`, `figcaption` | No margin; caption in `body-sm`, muted |

- Heading levels stay the author's. The container changes metrics only, as
  `hw-type` does. No role and no text is added.
- Text blocks are limited to `--hw-width-paragraph`. Tables, listings, figures
  and classed children are not.
- Flow spacing comes from space tokens through `.hw-prose > * + *`, with more
  space before headings. Headings with an `id` get `scroll-margin-block-start`.
- Direction comes from the nearest `dir`. List padding and the quote border are
  logical. Code stays left to right.
- Forced colours keep `LinkText` for links and `CanvasText` for borders.

Known limits:

- A class added to a plain element by a framework or a plugin opts that element,
  and its descendants, out.
- A class-less `pre` scrolls and has no `tabindex`, role or name. A Markdown
  pipeline should add them, or emit the listing markup above, so that the
  listing is reachable from the keyboard in every browser.
- A bare table cannot scroll. When its content is wider than the container, cells
  break inside words to keep the page from scrolling sideways. A wide table
  needs the `hw-table-wrap` markup.
- Notes and wide tables are the existing Alert and table-wrap markup.

Source notes: `docs/nic-foundations.md` supplies the display, heading and body
scales and the 720px paragraph measure; `docs/nic-lists.md`, `docs/nic-links.md`
and `docs/nic-tables.md` cover lists, links and tables. The mapping of heading
levels to scales, and the treatment of quotes, definition lists, inline code and
keys, are not covered by in-repo references.

## Text tone

`hw-type` takes `data-tone="muted"` (`--hw-color-text-muted`) or
`data-tone="subtle"` (`--hw-color-text-subtle`) for short secondary text outside
prose, such as captions and status lines. Both colours are in the token contrast
test on every surface.

## Verification

- `node --test packages/tokens/test/contrast.test.mjs`
- `pnpm exec vitest run packages/styles packages/tokens`
- `pnpm test:browser tests/browser/code-block.spec.ts tests/browser/prose.spec.ts`
  against the static markup in `tests/browser/code-prose-fixture.ts`: direction
  in Arabic and English pages, tab order and focus ring, arrow-key scrolling,
  wrapping at 320px, each role's colour and contrast in both themes and modes,
  forced colours, print, an automated accessibility scan, and nine component
  markups nested in prose compared with the same markup outside it. The
  comparison does not yet cover every shipped component.
