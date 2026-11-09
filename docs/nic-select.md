# Select and field descriptions

The supplied NIC stylesheet defines collapsed select geometry and supporting text in lines 2439–2446, 2492–2527 and 2641–2649. The source snapshot and its hash are recorded in the [NIC reference inventory](nic-web-reference.md). An isolated Chromium comparison measured the following differences before implementation.

| NIC source | Earlier Hawiyah behavior | Implemented mapping | Confidence |
| --- | --- | --- | --- |
| 2492–2514 and 2523–2527. A 40px closed select uses 14px text and an 18px indicator. The right inset is 10px with 35px end padding in English. Arabic uses 12px and 36px on the left. | Native arrow, 16px text, symmetric padding. | The default density retains 40px height. The indicator and end padding follow writing direction independently of language. | High for source dimensions. |
| 2497–2527. A down arrow becomes an up arrow on focus. | The platform supplied the arrow at rest and on focus. | Two source-proportioned geometric chevrons share a background with the existing animated underline. Keyboard focus selects the up artwork. Native listboxes, multiple selection and forced colors use platform affordances. | High for focus behavior. See the November 5 source-node glyph comparison below. Platform popup appearance remains native. |
| 2439–2446 and 2641–2649. Secondary helper text is 10px. Errors use 12px red text and a 4px top margin. | Both used 14px and the standard field gap. | Direct field hints and errors use scalable rem sizes. In the standard field grid the error begins 4px after the preceding element. The light palette uses the source colors. Dark and original modes use their own semantic roles. | High for the declared source values. |
| Native HTML field validity and Hawiyah's focused validation line. | Inserting or removing the selected option could leave the filled marker stale. A multiple select with empty and nonempty selected options could still look empty. | The shared observer reads live selected options, refreshes on option mutations and restores the correct marker after reset. | Reproduced in Chromium with the value submitted by the form. |

The native control owns keyboard selection, platform menus, form submission and validation. A focus indicator describes focus even after the operating system dismisses its menu. The guide includes single, required, invalid, disabled, multiple and visible-row examples across all supported project formats. Vue and Angular examples use framework-owned native markup for list modes outside the scalar Select API. The separately authored SVGs are part of Hawiyah.

Seven Select browser scenarios exercised the six examples in the Arabic and English guide and in the React JSX/TSX, Vue JS/TS and Angular TS editors. They cover keyboard input, label and description associations, arrow placement and changes on focus, native listbox behavior, forced colors and narrow screens. The focused shared observer, adapter and existing component suites passed, as did the workspace build and all eight token contrast checks.

## November 5 icon correction

The select indicator now uses an independently authored elementary chevron with
24px coordinates (6,9), (12,15), (18,9), a 1.5px stroke and rounded joins/caps.
These dimensions were checked against the supplied Icons file's Stroke node
8681:21940. The focused indicator reverses the same geometry. The previous
18px drawing had a different angle and occupied more of the icon box.

A Chromium raster comparison at 288px measured 0.89% normalized alpha difference
between the decoded source outline and the authored stroke. A visual inspection
confirmed the same straight-sided shape. This comparison addresses this glyph,
not the complete official icon library. The local archive SVG remains private.
Shared CSS supplies the correction to vanilla, React, Vue and Angular controls.
