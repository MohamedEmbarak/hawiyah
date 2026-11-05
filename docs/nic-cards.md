# NIC card composition

The default DGA/custom profile maps the card section of the
[NIC web reference](nic-web-reference.md): 16px padding/radius, 24px gap at
768px and wider (16px below), medium shadow, 18px/28px bold title and
16px/24px regular description. The root owns padding/gap; header, body and
footer do not add a second layer of spacing. Empty header/footer slots are hidden.

Use `variant="outlined"` for the source bordered card and `variant="flat"`
for its shadowless option. Existing `elevated` and `ghost` options remain.
Vanilla uses the equivalent `data-variant` attribute. Original Nasaq styling
retains its palette, radius and padded slots.

React/Vue `Card` and Angular `nq-card` accept `href` to render a native anchor.
An enabled action card supports normal Tab/Enter navigation, modifier clicks,
context menus and optional `target`/`rel`. `disabled` removes the destination,
sets disabled link semantics, leaves the tab order and blocks the card click
callback. Reactive updates restore the original destination. Omit `href` for
a static article containing its own links, form fields or buttons.

Do not nest links or buttons inside a whole-card link. For command actions,
place a real button inside a static card; a styling class alone does not turn
an article into an accessible button. The vanilla disabled-link recipe omits
`href`, uses `role="link" aria-disabled="true" tabindex="-1"`, and application
event handlers must also respect the disabled state.

```html
<article class="nq-card" data-variant="outlined">
  <header class="nq-card-header">
    <h2 class="nq-card-title">تفاصيل الخدمة</h2>
  </header>
  <div class="nq-card-body">
    <p class="nq-card-description">تعرف على المتطلبات والخطوات.</p>
  </div>
  <footer class="nq-card-footer">
    <a class="nq-button" href="/services/example">عرض المتطلبات</a>
  </footer>
</article>
```

Checklist row 118 requires a visible CTA on actionable cards. The example uses a real navigation link styled as a button inside a static card. The existing whole-card `href` API remains available for existing consumers.

React uses `header`/`footer` props; Vue uses corresponding slots; Angular
projects `[nqCardHeader]`/`[nqCardFooter]`. Use ordinary native elements with
`nq-card-title`, `nq-card-description` and `nq-card-image` for content.
No vanilla controller is required. Each framework owns its markup.

The semantic colors `--nq-color-card`, `--nq-color-card-text`,
`--nq-color-card-hover`, `--nq-color-card-border` and
`--nq-color-focus-contrast` are customizable. Dark hover uses Neutral 700 and
dark focus uses white to retain contrast; these are explicit adaptations of
the source's fixed light hover/black focus rules. Forced-colors uses system
colors. Cards do not add motion.

Real consumer examples are available at `?preview=nic`. Scoped browser checks
cover RTL/LTR, 320/390/768/1440px, slot spacing, typography, hover/focus,
disabled/reactive links, keyboard navigation, original/custom themes and axe.
