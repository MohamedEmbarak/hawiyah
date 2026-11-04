# NIC content lists

The supplied NIC stylesheet defines two decorative list treatments and a logical
start margin for ordered lists. The line numbers refer to the hashed `global.css`
snapshot recorded in the [NIC web reference](nic-web-reference.md). An isolated
Chromium fixture loaded that stylesheet with network requests blocked. Arabic
RTL and English LTR returned the same logical dimensions below. Chromium also
supplied 40px list-level padding for the icon and ordered lists. Host styles
can change that browser default. The original font glyph has no verified
visual comparison in this task.

| Source | Source value | Nasaq implementation | Confidence |
| --- | --- | --- | --- |
| CSS 1645–1654 | Each icon-list item reserves 30px on the right in Arabic or the left in English. | `ul.nq-list-icon > li` reserves 30px on its logical start side. The item establishes the marker's positioning context. | High for geometry |
| CSS 1656–1674 | The source positions a 16px icon-font glyph at the top and start of a 28px line. | An `aria-hidden` marker spans 16×28px at the item's top and logical start. An empty marker draws a small ring using `currentColor`. | High for the box, unverified for the source artwork |
| CSS 3183–3193 | Icon lists and ordered lists have a 5px start margin and zero end margin. | `ul.nq-list-icon` and `ol.nq-list-ordered` set those logical margins. The native list retains its list-level indentation from the host stylesheet or browser. | High for the margins |
| CSS 3195–3198 | The custom list has zero start margin and 20px start padding. | `ul.nq-list-custom` applies those values. | High |
| CSS 3200–3211 | A 16px inline icon precedes the text, offset down by 1px and separated by spaces in generated content. | A decorative 16px inline marker moves down 1px. A quarter-em logical margin separates it from the text. Wrapped lines follow normal inline layout. | High for size and vertical offset, adapted for spacing and artwork |

The classes affect only lists that opt in. Logical CSS follows `dir`, including
an English list in an RTL container and an Arabic list in an LTR container.
The source list rules declare their pixel dimensions directly and inherit text
color. Nasaq exposes those dimensions through the properties below.
Item selectors apply to direct children so a nested ordered list keeps its
native markers. The browser owns numbering, including `start`, `reversed` and
item `value`. The ordered recipe uses decimal markers with Latin digits.

The decorated examples use semantic `ul` and `li` elements with `role="list"`
on the `ul` to preserve its list announcement when native bullets are suppressed.
Each marker has `aria-hidden="true"`. Instructions and steps are actual text in
the list items. A native `ol` communicates sequence without generated numbers.

## Customization and assets

The local ring inherits the item's text color in light, dark and original Nasaq
themes. Forced colors use `CanvasText`. Authors can place their own authorized
SVG inside the decorative marker to replace the ring. The source references the
`hgi-stroke-rounded` font and a font-specific glyph. Its distribution rights and
glyph shape remain unresolved. Nasaq ships its own CSS marker alongside these
recipes.

| Variable | Default |
| --- | --- |
| `--nq-list-start-margin` | 5px |
| `--nq-list-icon-indent` | 30px |
| `--nq-list-marker-size` | 16px |
| `--nq-list-marker-line` | 28px |
| `--nq-list-custom-indent` | 20px |

The [Card guide](https://mohamedembarak.github.io/nasaq/#component/card) includes
an icon list with nested preparation steps, a custom inline list of service
notes and an ordered sequence starting at step 2. Each case includes vanilla
HTML, React children, Vue slots and Angular projection into the existing Card.
These compositions keep the catalog count at 83.

## Verification

Eight focused Chromium scenarios passed in `tests/browser/nic-lists.spec.ts`.
The Arabic and English galleries cover the three list treatments, nested decimal
markers, logical placement with direction changed independently of language,
light and dark accessibility scans, 320px fit, forced-color marker visibility
and a custom indent. Both 320px screenshots were inspected. The nested-theme
check exercises a light original Nasaq Card inside a dark DGA region and verifies
that an authored SVG replaces the decorative ring.

The other five scenarios copy all three displayed snippets into the editor and
render them in React JSX and TSX, Vue JavaScript and TypeScript, and Angular
TypeScript. All 15 renders retained the expected list names, item counts and
geometry. Separate HTML, JSX, Vue SFC and Angular-template checks passed for
all three Arabic and English examples, covering 24 source snippets.
