# NIC button families

The supplied `global.css` snapshot (971–1292) defines primary, default, secondary,
outline, outline-white, light and danger. Hawiyah exposes all seven through
`data-variant` in vanilla and `variant` in React, Vue and Angular. Existing ghost,
soft and link variants remain supported. `default` means the dark neutral
appearance; omitting the prop still selects primary. IconButton shares the CSS; its native default is ghost. See [icon sizing, shape and compositions](nic-icons.md).

```html
<button class="hw-button" data-variant="secondary" type="button">حفظ المسودة</button>
```

```tsx
<Button variant="secondary" onClick={saveDraft}>حفظ المسودة</Button>
```

```vue
<Button variant="secondary" @click="saveDraft">حفظ المسودة</Button>
```

```html
<button hwButton variant="secondary" type="button" (click)="saveDraft()">حفظ المسودة</button>
```

## Source mapping

| Family | Rest | Hover | Pressed |
| --- | --- | --- | --- |
| primary | `#1b8354` | `#166a45` | `#14573a` |
| default | `#0c111b` | `#1f2a37` | `#4d5761` |
| secondary | `#f3f4f6` | `#e5e7eb` | `#e5e7eb` |
| outline | transparent, Neutral 200 outline | `#d2d6db` | `#e5e7eb`, Neutral 300 outline |
| outline-white | transparent, white 70% outline | white 20% | white 30% |
| light | white | `#f3f4f6` | white 70% |
| danger | `#d92c20` | `#b42318` | `#7a2619` |

DGA keyboard focus uses a 2px black outline (white for outline-white and in
dark mode). Focus remains visible while holding Space. Disabled/loading buttons
use native disabled semantics; outline variants keep transparent backgrounds.
React/Vue loading sets disabled and aria-busy. In Angular/vanilla set disabled
and aria-busy explicitly. Preserve a useful label while an operation is pending.

Use light and outline-white on a suitably dark surface. Color contrast depends
on that backdrop; they are not substitutes for primary on a white page.

## Intentional adaptations

- Focus is keyboard-visible rather than adding persistent pointer-click rings.
  A pressed button does not erase a keyboard user's indicator.
- Danger uses white text for readable contrast instead of the source's red text.
- Dark secondary/outline surfaces and text are paired for readable contrast.
  Light pressed stays opaque in dark mode to retain contrast on arbitrary dark
  surfaces. Original Hawiyah colors and public customization variables remain.
- Existing comfortable/compact/mobile density heights remain. Source `.btn`
  declares 32px minimum, `.btn-sm` 24px and `.btn-lg` 40px; the small source still
  inherits 6px vertical padding and 20px line height, so declarations alone do
  not prove a rendered 24px button. This task aligns families and states without
  changing shared field heights or claiming exact source size parity.
- No Bootstrap globals, global margins or external script dependencies are added.

Live native fixtures: `?preview=nic` in each framework example. The shared
browser suite checks every NIC family's light hover/press colors, keyboard
activation/focus, disabled/loading behavior, icon actions, dark contrast,
RTL/LTR, narrow wrapping, original/custom themes and forced colors.
