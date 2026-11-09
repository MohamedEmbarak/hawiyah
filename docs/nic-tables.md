# NIC table alignment

Source: the hashed `global.css` snapshot recorded in
[NIC web reference](nic-web-reference.md), lines 1770–1886. The stylesheet is
evidence, not a package dependency or a certification of Hawiyah.

| Source | Observed requirement | Hawiyah implementation | Confidence / boundary |
| --- | --- | --- | --- |
| 1770–1792 | Neutral 300 border, 8px radius, separate borders with zero spacing | `hw-table-wrap` owns the single outer border and radius; table remains native and horizontally scrollable | High for values; retaining the wrapper/collapsed internal borders is an adaptation |
| 1805–1838 | Neutral 100 header; 48px cells; 8px vertical and 16px horizontal padding; direct header text regular | DGA/custom table profile, logical separators between header cells, 16px body/header text and weight 400 headers | High; default source font is 16px at CSS 427–437 |
| 1825–1833 | Header spans 12px/18px, weight 500, Neutral 700 | Optional `hw-table-heading` composition | High; not imposed on arbitrary spans or every header |
| 1840–1852 | Odd resting rows white; odd hover Gray 50 `#f5f5f6`, even hover Neutral 100 `#f3f4f6` | White table surface and two semantic hover tokens | High in light mode; dark hover uses readable Neutral 700 rather than fixed light surfaces |
| 1855–1886 | Body cell height/padding and logical edge cleanup | Shared cell rules apply equally to `td` and semantic row-header `th`; avoid duplicate outer separators | High for geometry; row-header treatment is an accessibility adaptation |
| 1795–1802 and Bootstrap variables | Source clears odd stripe accents; complete stripe/separator painting depends on other loaded styles | Existing `striped` even-row and `bordered` variants retained explicitly as Hawiyah extensions | Do not claim pixel parity with the combined site styles |

An isolated Chromium fixture loaded only the supplied stylesheet, blocked
network requests and measured RTL/LTR tables both with and without an explicit
border-box reset. Both produced 48px cells, 8px/16px padding, an 8px radius,
16px regular direct headings and the two stated hover colors. A nested heading
span measured 12px/18px at weight 500. This is rendered-property evidence;
official fonts/assets and the live site's full Bootstrap/custom cascade were
not reproduced, so it is not a visual-parity claim.

## Public composition and adapter parity

`Table` and `DataTable` accept `variant="default|striped|bordered"` and
`size="sm|md|lg"` in React, Vue and Angular. Vanilla uses `data-variant` and
`data-size` on the native `table`; React/Vue still forward those attributes.
Typed props take precedence when both forms are supplied.

The default DGA cell minimum is 48px; small/large minimums are 40px/56px
Hawiyah extensions. Content, wrapping and controls may require taller cells.
The original Hawiyah profile retains its typography and spacing. Custom themes
can override `--hw-color-table-row-hover` and `--hw-color-table-row-hover-odd`.
Selection remains visible on hover, including striped rows; applications own
selection behavior. Sorting is still stable, localized, and adapter-owned.
Active/hovered sort headings use the contrast-tested link color: the previous
green measured only 4.31:1 on the gray header. Angular hosts explicitly shrink
inside grid/flex layouts, keeping horizontal overflow within their wrappers.
Vanilla can compose `<span class="hw-table-sort-icon" aria-hidden="true"></span>`
inside each sort button; its visual arrows follow the header's `aria-sort`.
The semantic state remains on the header, and native adapters keep their own
existing indicator markup. This is a Hawiyah sorting extension, not an inferred
NIC JavaScript requirement.

Use a caption and native `scope="col"`/`scope="row"`. Every native adapter
now supplies a named focusable overflow wrapper when given a caption;
React/Vue `wrapperProps` can customize its attributes. Vanilla authors the
wrapper explicitly. Angular DataTable now supports `rowHeader` columns, and
Vue DataTable now renders an `emptyMessage` cell spanning all columns.
Plain Table data-driven empty states use the same pattern; fully composed
native children remain caller-owned.

Arabic is the default empty message and Angular's default sort locale is now
`ar-SA`. Vue's default sort-action label is Arabic. English applications should
pass their localized labels, messages and locale; the guide's English recipes
do so. Values and numeric output remain unchanged.

The guide shows default, striped, bordered, small, large and empty examples,
with native React/Vue/Angular imports and a working DataTable project recipe.
The source's 10ms `transition: all` is not copied; row colors change directly,
without introducing motion or reducing keyboard focus visibility. Forced
colors retain visible borders, focus and selection. Calendar tables are outside
these selectors; calendar conversion and stored ISO dates are unchanged.

## Verification scope

The completed task passed 62 adapter behavior tests (including 16 focused table
cases), eight theme contrast checks and nine focused Chromium scenarios. The
four vanilla/gallery scenarios were repeated after adding the visual sort
indicator and passed. The full workspace/consumer builds and `/hawiyah/` guide
build passed, as did clean tarball checks. All 31 React project recipes passed
TypeScript checking, all 31 Angular recipes passed strict template checking,
and all seven exported framework/language project builds passed.

Focused tests cover adapter attributes, captions, row/column headers, empty
results and recovery, sorting/nonmutation, keyboard scroll access, source
geometry, RTL/LTR, dark/custom/original themes and forced colors. Packaging and
project compilation are checked separately. These checks do not establish
virtualization, cell editing, server sorting, or spreadsheet navigation, none
of which these components claim to implement.
