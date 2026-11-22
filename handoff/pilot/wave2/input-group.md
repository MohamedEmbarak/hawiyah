# InputGroup

InputGroup joins a native control to a prefix, a suffix or both in one row; the joining is visual, and the addons are not part of the accessible name or description of the control. The label and the hint stay outside the row, and the addons remain ordinary content.

## Example

The label and the hint are written by the field around the group, and the label names the native input inside it. The prefix and the suffix are addons that give the unit of the value. In React the field gives the native input nothing but the `for` of its label, so the input repeats the identifier of the field as its `id` and writes its own `aria-describedby`.

```html live example=basic
<div class="hw-field">
  <label class="hw-label" for="basic-amount" id="basic-amount-label">Amount</label>
  <div class="hw-input-group">
    <span class="hw-input-addon">SAR</span>
    <input class="hw-input" id="basic-amount" name="amount" inputmode="decimal" aria-describedby="basic-amount-hint">
    <span class="hw-input-addon">per month</span>
  </div>
  <p class="hw-hint" id="basic-amount-hint">Enter the amount without a currency symbol.</p>
</div>
```

```tsx live example=basic
<Field controlId="basic-amount" label="Amount" hint="Enter the amount without a currency symbol.">
  <InputGroup start="SAR" end="per month">
    <input className="hw-input" id="basic-amount" name="amount" inputMode="decimal" aria-describedby="basic-amount-hint" />
  </InputGroup>
</Field>
```

```vue live example=basic
<Field control-id="basic-amount" label="Amount" hint="Enter the amount without a currency symbol." v-slot="field">
  <InputGroup>
    <template #prefix>SAR</template>
    <input class="hw-input" :id="field.id" name="amount" inputmode="decimal" :aria-describedby="field.describedby" />
    <template #suffix>per month</template>
  </InputGroup>
</Field>
```

```ts live example=basic framework=angular
template: `<hw-field #f controlId="basic-amount" label="Amount" hint="Enter the amount without a currency symbol."><hw-input-group><ng-container hwPrefix>SAR</ng-container><input class="hw-input" [id]="f.controlId" name="amount" inputmode="decimal" [attr.aria-describedby]="f.descriptionIds"><ng-container hwSuffix>per month</ng-container></hw-input-group></hw-field>`
```

## Variants and states

### Small

The size of the row is the size of its control: `data-size` with the value `sm` or `lg` on the native `hw-input` sets it, and without it the control is medium. The group element itself has no size, so `data-size` on the group changes nothing.

```html live example=small
<div class="hw-field">
  <label class="hw-label" for="small-fee" id="small-fee-label">Fee per copy</label>
  <div class="hw-input-group">
    <span class="hw-input-addon">SAR</span>
    <input class="hw-input" id="small-fee" name="fee" inputmode="decimal" data-size="sm">
  </div>
</div>
```

```tsx live example=small
<Field controlId="small-fee" label="Fee per copy">
  <InputGroup start="SAR">
    <input className="hw-input" id="small-fee" name="fee" inputMode="decimal" data-size="sm" />
  </InputGroup>
</Field>
```

```vue live example=small
<Field control-id="small-fee" label="Fee per copy" v-slot="field">
  <InputGroup>
    <template #prefix>SAR</template>
    <input class="hw-input" :id="field.id" name="fee" inputmode="decimal" data-size="sm" />
  </InputGroup>
</Field>
```

```ts live example=small framework=angular
template: `<hw-field #f controlId="small-fee" label="Fee per copy"><hw-input-group><ng-container hwPrefix>SAR</ng-container><input class="hw-input" [id]="f.controlId" name="fee" inputmode="decimal" data-size="sm"></hw-input-group></hw-field>`
```

## API

### JavaScript

Table: Attributes of the hw-input-group element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-input-group'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

InputGroup has no JavaScript controller. The markup is the API: write an element with the class `hw-input-group` whose direct children are the native control, with the class `hw-input` or `hw-select`, and the addons, each an element with the class `hw-input-addon`. Write the `label` and the hint outside the group, in an element with the class `hw-field`. The height of the row follows `data-size` with `sm` or `lg` on the control, not on the group. `enhance()` of the vanilla package sets the value-presence state of a hand-written control; the group needs no attribute for it.

### React

Table: Props of InputGroup

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `start` | `ReactNode` | `false` | — |
| `end` | `ReactNode` | `false` | — |

`start` and `end` are renderable React content that InputGroup places in an addon before and after its children; an addon is rendered only when its prop is given. The children are the control, which InputGroup does not label: write the label and the hint in a surrounding `Field`. InputGroup accepts the native attributes of its `div` element, such as `className`. `data-size` on the group reaches its element but changes nothing, because the stylesheet reads it on the control. InputGroup does not track the value presence of a native control, so the value state of the joined row (`data-hw-filled`) is not set in React.

### Vue

Table: Props, events and slots of InputGroup

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `prefix` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `suffix` | slot | — | `false` | — |

The `prefix` slot and the `suffix` slot hold the addons, and the `default` slot holds the control. An addon is rendered only when its slot is given. The published declaration types no slot. InputGroup does not label the control: write the label and the hint in a surrounding `Field`. The attributes of the component, such as `class`, reach the group element; `data-size` there changes nothing, because the stylesheet reads it on the control. InputGroup does not track the value presence of a native control, so the value state of the joined row (`data-hw-filled`) is not set in Vue.

### Angular

Table: Inputs, outputs and content of hw-input-group

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `[hwPrefix]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwSuffix]` | content | — | `false` | — |

`HwInputGroupComponent` (`hw-input-group`) projects the elements with `hwPrefix` into the prefix addon, the elements with `hwSuffix` into the suffix addon, and all other content, the control, between them. `size` writes `data-size` on the group, which the stylesheet does not select, so `sm` and `lg` change nothing: size the control with its own `data-size`. The component tracks the presence of a value in projected native `hw-input` and `hw-select` controls after render, so the stylesheet applies its value state without the vanilla enhancer. The addons remain ordinary content, so give a decorative icon an appropriate accessible treatment. The component does not label the control: use a surrounding `hw-field` or a `label` of the control itself, and write the label and the hint outside the group. The content row `*` is the projected control.

## Accessibility

InputGroup adds no role and no name. The control inside the group keeps its native role and keyboard handling, and the accessible name of the control comes from its own `label` element, from a surrounding `Field` or `hw-field`, or from `aria-label` or `aria-labelledby`. The surrounding group does not replace the actual input label.

- The addons are plain `span` elements and ordinary content, so a decorative icon in one is labelled appropriately. They are not part of the name or the description of the control: a unit the reader needs belongs in the label or the hint, or is referenced from `aria-describedby` of the control.
- The hint and the error belong outside the group and are associated with the control through `aria-describedby`, as for a field without a group.
- The group does not change the focus order. An addon without interactive content takes no focus, so only the control takes focus; an action `hw-button` placed in the group takes focus as well.

## RTL and localisation

InputGroup has no built-in text: the addons, the label, the hint and the error are written by the application in the language of the page. The packaged styles use logical properties, so the prefix addon stands at the start of the row and the suffix addon at its end in both reading directions, and the exposed corners of the joined row follow the direction.

- The value of a numeric or code input is typed in the script and with the digits that the reader chooses; write the unit in the addon in the language of the page, and also in the label or the hint, because the addon is not part of the description of the control.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of InputGroup; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The single underline across the control and its addons is mapped in the [input notes](../nic-inputs.md), with the confidence of the mapping; the placement of the label and the hint outside the joined group is a recommendation in the composition section of the same notes, without a confidence.
- The [coverage notes](../coverage.md) list InputGroup among the additional controls.
