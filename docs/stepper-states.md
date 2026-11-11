# Stepper state and styling

Stepper is a progress indicator: an ordered list with `hw-stepper` on the list,
`hw-step` on each item and `aria-current="step"` on the current item. It adds no
buttons, tab stops or step navigation. The application owns progress and decides
when a previous step is complete. The list name is application text: pass
`label` (for example `label="التقدم"`), or an `aria-label` / `aria-labelledby`
where the adapter forwards it. The component has no default name.

The same three public state values work across the native adapters and static
HTML: `complete` (previous), `current` (active), and `upcoming` (pending).
Existing CSS aliases `completed` and `active` remain supported. Changes to the
controlled index update the previous and current states in either direction;
there is no hidden history or automatic advancement on field edits.

## Controlled progress

| Adapter | Existing API, retained | Additive API |
| --- | --- | --- |
| React | `items`, string `current` matching `item.value`, optional `item.status` | `activeIndex?: number` |
| Vue | `items`, string `current` matching `item.value`, optional `item.status` | `activeIndex?: number` |
| Angular | `steps`, numeric `current` (default `0`) | `activeIndex?: number`, optional `step.status` |
| Vanilla | Semantic static list markup | `createStepper(list, { activeIndex, label })`, `setActiveIndex(index)`, `refresh()`, `destroy()` |

`activeIndex` is zero-based and takes precedence over the adapter's existing
`current` prop/input. `-1` means not started (all upcoming); the item count means
all complete. An absent `activeIndex` preserves the existing `current` behavior.
Non-integers, non-finite numbers and values outside `[-1, itemCount]` resolve to
not started. Explicit `status: 'complete' | 'current' | 'upcoming'` on an item has
the highest precedence, including at the not-started and all-complete boundaries.
Keep explicit statuses coherent so at most one item is current.

React and Vue:

```tsx
const items = [
  { value: 'details', label: 'البيانات' },
  { value: 'review', label: 'المراجعة' },
  { value: 'send', label: 'الإرسال' },
];
// React; use :items="items" :active-index="activeIndex" label="التقدم" in Vue.
<Stepper items={items} activeIndex={1} label="التقدم" />
```

Angular:

```html
<hw-stepper [steps]="steps" [activeIndex]="1" label="التقدم" />
```

Vanilla:

```html
<ol class="hw-stepper" data-hw="stepper" data-active-index="1" aria-label="التقدم">
  <li class="hw-step"><span>البيانات</span></li>
  <li class="hw-step"><span>المراجعة</span></li>
  <li class="hw-step"><span>الإرسال</span></li>
</ol>
```

Use either the existing `enhance()` lifecycle for declarative markup or create
the controller directly when the application needs to change progress:

```ts
import { createStepper } from '@hawiyah/vanilla';
const progress = createStepper(list, { activeIndex: 1 });
progress.setActiveIndex(2);
// After changing direct list items or their data-status overrides:
progress.refresh();
// Before unmounting:
progress.destroy();
```

The vanilla controller updates only direct `li.hw-step` children. It leaves label
content, nested lists and focus untouched. `data-status` is the optional explicit
override; `data-state` is its rendered output. Without an index, initial progress
is inferred from the first `aria-current="step"`, `data-state="current"` or
`data-state="active"` item. The controller preserves an existing accessible name
and restores attributes it owns on destruction. `refresh()` reads changed items
and overrides; `setActiveIndex()` updates progress. Static HTML without a
controller can continue setting `data-state` and `aria-current` directly.

## Styling active, previous and pending steps

Scope custom properties on a list, an Angular component host, or a parent theme.
No class or token was renamed. The defaults retain the existing Hawiyah treatment
and the form sidebar's filled completed markers; theme semantic colors continue
to provide light/dark and custom-theme values.

Each prefix below accepts the same six suffixes:

| Prefix | State |
| --- | --- |
| `--hw-step-current-` | Current/active item |
| `--hw-step-complete-` | Previous/completed item |
| `--hw-step-upcoming-` | Pending item |

| Suffix | Controls |
| --- | --- |
| `color` | Label text color |
| `weight` | Label font weight |
| `background` | Number/check marker background |
| `marker-color` | Number/check marker foreground |
| `border` | Marker border color |
| `connector` | Connector after this item, when shown |

`--hw-step-current-ring` additionally accepts a `box-shadow` value or `none`.
For example, these settings distinguish active and previous steps while following
the selected theme:

```css
.application-progress {
  --hw-step-current-background: var(--hw-color-surface);
  --hw-step-current-marker-color: var(--hw-color-primary-text);
  --hw-step-current-border: var(--hw-color-primary);
  --hw-step-current-ring: none;
  --hw-step-complete-background: var(--hw-color-primary);
  --hw-step-complete-marker-color: var(--hw-color-on-primary);
  --hw-step-complete-color: var(--hw-color-primary-text);
  --hw-step-complete-connector: var(--hw-color-primary);
}
```

The existing `data-state` selectors also support application CSS for individual
states. Keep contrast sufficient in all themes; retain numbers/check marks and
`aria-current` so color is not the only distinction. Forced-colors mode uses a
system-color current marker. Layout remains logical for RTL/LTR and follows the
existing responsive rules. State changes introduce no animation. This is an
API/style extension, not evidence of official DGA certification or a new visual
parity claim. The separately composed mobile progress ring remains application
owned and must be updated alongside the list when used.
