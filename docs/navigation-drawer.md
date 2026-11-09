# Navigation drawer

`NavigationDrawer` composes the existing modal `Drawer` with ordinary page
navigation. It defaults to the logical start side and Arabic navigation/close
labels. Applications supply the drawer title and their own navigation content;
language and direction remain independent.

Each item has `{ id, label, href?, icon?, current?, disabled?, children? }`.
Use a unique stable `id` and a text `label`. Icons are decorative names from
Hawiyah's curated icon stylesheet. A leaf with `href` is a native link, with
`aria-current="page"` when current. Children form a native `<details>/<summary>`
group containing a nested list. When a group also has an `href`, its page link
appears first inside the disclosed group. A leaf without `href` is static text.
Disabled entries are nonfocusable text, and disabled groups omit descendant
actions. Groups are initially collapsed and retain native keyboard behavior.

Normal, unprevented route activation closes the drawer. Final destination focus
belongs to the browser or application router; Escape and explicit dismissal
return focus to the opener. Consumers can prevent the click, for example while
validating a route change; dismissal is checked after event dispatch. Modified
clicks, downloads and links targeting another browsing context leave the drawer
open. Escape, backdrop interaction, modal focus containment and controlled state
are supplied by each framework's existing native Drawer. There are no menu,
tree or tablist roles, roving tabindex, or custom arrow-key navigation.

## Framework APIs

- React exports `NavigationDrawer`, `NavigationDrawerProps` and
  `NavigationDrawerItem`. Supply `items`, `title`, optional `navigationLabel`,
  `userContent`, `side: 'start' | 'end'`, and existing Drawer props such as
  `trigger`, `open`, `defaultOpen`, `onOpenChange`, `footer` and `closeLabel`.
- Vue exports `NavigationDrawer` and `NavigationDrawerItem`. Supply `items`,
  `title`, optional `navigationLabel`, `side`, `open`/`update:open`, `defaultOpen`,
  `description`, `closeLabel` and `closeOnBackdrop`. Slots are `trigger` with
  `{ open }`, `user`, and `footer` with `{ close }`. The component exposes
  `show()`, `close()` and the underlying dialog `element`.
- Angular exports `HwNavigationDrawerComponent` (`hw-navigation-drawer`) and
  `HwNavigationDrawerItem`. Supply `items`, `title`, `navigationLabel`, `side`,
  `open`/`openChange`, `closeLabel` and `closeOnBackdrop`. Project optional user
  content with `hwNavigationDrawerUser` and footer content with
  `hwNavigationDrawerFooter`. Call `show(trigger?)` or `close()` on the component.
  Its markup is owned by Angular and composes `HwDrawerComponent`.
- Vanilla exports `createNavigationDrawer(dialog, options)` and supports
  `data-hw="navigation-drawer"` through `enhance()`. It enhances caller-owned
  semantic HTML instead of rendering an items array. Options extend
  `DialogOptions` with `navigationLabel`; the controller has `open`, `show`,
  `close` and `destroy`. Give the dialog an accessible title and a
  `.hw-navigation-drawer-nav` nav, with lists, native links and optional details
  groups. Use `.hw-navigation-drawer-row` for rows and
  `.hw-navigation-drawer-group` for disclosures. Existing
  `data-hw-dialog-open`/`data-hw-dialog-close` controls work. Initial
  `aria-disabled="true"` entries are made untabbable/nonactivating, with
  descendant controls inert; cleanup restores their original attributes.
  Applications own subsequent changes to disabled markup. Destroy the
  controller before removing or re-enhancing its DOM.

## Source mapping and adaptations

The source is the supplied Mobile Components export, Nav Drawer set
`1679:30950`. The white variant `1679:30949` is 327×840px. Its list
`2005:82723` has 16px inset, and row `1679:30531` is 44px high with 4px radius.
Nested row `1679:30532` uses 40px leading padding. Selected row `538:296406`
has a muted background and selector `538:296411` is 6×32px; title
`538:296409` uses semibold 14px text. Focused row `538:296401` has a 2px stroke.

Hawiyah uses a 327px preferred maximum constrained by viewport width, 16px insets,
44px minimum row heights, 40px nested leading padding and a 6×32px logical
leading indicator. Labels wrap and rows grow. Semantic colors preserve dark,
original Hawiyah and custom themes. Top/bottom/side safe areas are accommodated;
the source's fixed 840px height and 80px bottom example padding are not copied.
The optional user content area does not embed source sample identities or assets.

This initial composition maps the white structural variant. The green and
translucent/blurred overlay variants remain outside this implementation. The
existing Drawer motion is unchanged: local source records do not establish a
drawer entrance/exit duration. Reduced-motion behavior remains inherited from
Drawer. Decoded properties are source evidence, not proof of rendered parity or
official DGA certification.
