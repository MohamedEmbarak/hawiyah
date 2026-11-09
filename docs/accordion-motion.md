# Accordion motion

The DGA theme uses `--hw-duration-accordion: 300ms` for disclosure height and
`--hw-ease-accordion: cubic-bezier(.42, 0, .58, 1)`. Original Hawiyah uses zero
duration; custom themes can override either token. Reduced motion, including a
preference change during an animation, settles immediately. Browsers without
Web Animations keep immediate native disclosure.

The later NIC web reference supplies the separate chevron timing:
`--hw-duration-accordion-indicator: 200ms` with the same ease-in-out default.
Hover/focus surface colors transition over 150ms. Original Hawiyah keeps zero
indicator duration. The [NIC web profile](nic-accordion.md) maps its nested
header/button spacing onto the existing native disclosure markup.

Source evidence is Mobile Components, accordion trigger `1147:62359` to expanded
variant `1147:60867`: 300ms SMART_ANIMATE with INOUT_CUBIC easing. The decoded
example grows from a 56px header to a 256px item. Production content uses its
intrinsic height, not those fixed example dimensions. The rotating chevron is
a web adaptation of source down/up icon swaps, now timed by the NIC CSS. Conflicting stored title metrics
are not animated. This establishes source-informed behavior, not visual parity
or certification.

React, Vue and Angular own their markup and invoke the shared core motion
helper through their lifecycles. No vanilla enhancement runs on framework DOM.
All adapters retain `<details>` and `<summary>`. During collapse the physical
`open` attribute remains until the height animation finishes, while the summary
immediately exposes `aria-expanded="false"` and the content becomes inert and
hidden from accessibility APIs. Focus inside closing content returns to the
summary. Rapid reversals continue from the current rendered height; resizing
content retargets opening motion and the final layout returns to natural height.

Enhanced exclusive groups coordinate by their original native `name`, temporarily
removing that attribute so native grouping cannot prematurely hide closing
content. Cleanup restores it. Controlled consumers must accept the close request
for the previous item when they accept opening another item; a controlled value
remains the application's authority. Native unenhanced markup needs no helper.

Vanilla users can call `createAccordion(root, { onOpenChange })` or use
`data-hw="accordion"` with `enhance()`. Each direct `.hw-accordion-item` must contain
a summary and one content wrapper. Set `data-hw-value` on each details element
for stable values (otherwise its zero-based index is used). Use matching `name`
attributes for exclusive groups. The controller exposes `setOpen(value, open)`
and `destroy()`; callbacks and `hw:change` describe logical state, not delayed
physical attribute changes. Destroy before removing enhanced markup.

Vue's `toggle(value, open)` and Angular's `toggled({ id, open })` fire once for
logical user/exclusive-group changes. Their optional item `open` value initializes
the native disclosure and subsequent value changes update it; user toggles keep
working without an event listener, preserving the existing native-details
contract. React retains strict controlled `open`, uncontrolled `defaultOpen`, and
`onOpenChange` on each item.
