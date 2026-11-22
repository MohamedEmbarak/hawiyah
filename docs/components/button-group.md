# ButtonGroup

ButtonGroup places related actions in one named group and gives them a shared layout. Each action stays an ordinary button with its own behaviour and its own place in the tab order.

## Example

A group holds actions that belong together, such as the actions on one request. The group has a name, so a reader of assistive technology hears what the buttons relate to when focus enters the group.

```html live example=basic
<div class="hw-button-group" role="group" aria-label="Request actions">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Submit request</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Save draft</button>
  <button class="hw-button" type="button" data-variant="ghost" data-size="md">Cancel</button>
</div>
```

```tsx live example=basic
<ButtonGroup label="Request actions">
  <Button variant="primary">Submit request</Button>
  <Button variant="secondary">Save draft</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonGroup>
```

```vue live example=basic
<ButtonGroup label="Request actions">
  <Button variant="primary">Submit request</Button>
  <Button variant="secondary">Save draft</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonGroup>
```

```ts live example=basic framework=angular
template: `<hw-button-group label="Request actions">
  <button hwButton variant="primary">Submit request</button>
  <button hwButton variant="secondary">Save draft</button>
  <button hwButton variant="ghost">Cancel</button>
</hw-button-group>`
```

## Variants and states

### Attached

The `default` variant separates the buttons by a gap. The `attached` variant joins them into one block: the gap is removed, the borders overlap by one pixel, and only the outer corners of the block stay rounded. Use it for actions of equal weight that read as one set, such as printing, downloading and sharing a document. The actions stay independent; the group is not a selection control. For a choice of one value use `ToggleGroup`.

```html live example=attached
<div class="hw-button-group" role="group" aria-label="Document actions" data-variant="attached">
  <button class="hw-button" type="button" data-variant="outline" data-size="md">Print</button>
  <button class="hw-button" type="button" data-variant="outline" data-size="md">Download</button>
  <button class="hw-button" type="button" data-variant="outline" data-size="md">Share</button>
</div>
```

```tsx live example=attached
<ButtonGroup label="Document actions" variant="attached">
  <Button variant="outline">Print</Button>
  <Button variant="outline">Download</Button>
  <Button variant="outline">Share</Button>
</ButtonGroup>
```

```vue live example=attached
<ButtonGroup label="Document actions" variant="attached">
  <Button variant="outline">Print</Button>
  <Button variant="outline">Download</Button>
  <Button variant="outline">Share</Button>
</ButtonGroup>
```

```ts live example=attached framework=angular
template: `<hw-button-group label="Document actions" variant="attached">
  <button hwButton variant="outline">Print</button>
  <button hwButton variant="outline">Download</button>
  <button hwButton variant="outline">Share</button>
</hw-button-group>`
```

### Vertical

The `horizontal` orientation lays the buttons in a row, and it is the layout without an attribute. The `vertical` orientation stacks them in a column in which each button takes the full width of the group. It combines with the `attached` variant, which then joins the buttons along the block axis.

```html live example=vertical
<div class="hw-button-group" role="group" aria-label="Profile actions" data-orientation="vertical">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Edit profile</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Change password</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">Download data</button>
</div>
```

```tsx live example=vertical
<ButtonGroup label="Profile actions" orientation="vertical">
  <Button variant="secondary">Edit profile</Button>
  <Button variant="secondary">Change password</Button>
  <Button variant="secondary">Download data</Button>
</ButtonGroup>
```

```vue live example=vertical
<ButtonGroup label="Profile actions" orientation="vertical">
  <Button variant="secondary">Edit profile</Button>
  <Button variant="secondary">Change password</Button>
  <Button variant="secondary">Download data</Button>
</ButtonGroup>
```

```ts live example=vertical framework=angular
template: `<hw-button-group label="Profile actions" orientation="vertical">
  <button hwButton variant="secondary">Edit profile</button>
  <button hwButton variant="secondary">Change password</button>
  <button hwButton variant="secondary">Download data</button>
</hw-button-group>`
```

## API

### JavaScript

Table: Attributes of the hw-button-group element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-button-group'` | `true` | — |
| `data-orientation` | `'vertical'` | `false` | — |
| `data-variant` | `'attached'` | `false` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

ButtonGroup has no JavaScript controller. The markup is the API: write an element with the class `hw-button-group` and `role="group"`, name it with `aria-label` or `aria-labelledby`, and place native buttons with the class `hw-button` inside it. `data-variant="attached"` joins the buttons, and `data-orientation="vertical"` stacks them; without them the buttons stand in a row with a gap, and the row wraps when the container is too narrow. The stylesheet rules for the attached variant select direct children with the class `hw-button`, so write the buttons as direct children of the group.

### React

Table: Props of ButtonGroup

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `variant` | `'default' \| 'attached'` | `false` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `false` | — |
| `data-variant` | `string` | `false` | — |
| `data-orientation` | `string` | `false` | — |
| `label` | `string` | `false` | — |

ButtonGroup renders a `div` with `role="group"`. The group is named by `label`, or by `aria-label` or `aria-labelledby`, which take precedence over `label` when they are given. Without any of the three the group has no name. `variant` and `orientation` write `data-variant` and `data-orientation`; without them neither attribute is written. The `data-variant` and `data-orientation` props remain accepted, and `variant` and `orientation` win when both are given. The children are buttons, such as `Button` or `IconButton`.

### Vue

Table: Props, events and slots of ButtonGroup

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `variant` | prop | `'default' \| 'attached'` | `false` | — |
| `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | — |
| `default` | slot | — | `false` | — |

ButtonGroup renders an element with `role="group"`. The group is named by `label`, or by an `aria-label` or `aria-labelledby` attribute, which takes precedence over `label`; without any of them the group has no name. `variant` and `orientation` write `data-variant` and `data-orientation`. The default slot holds the buttons. The table lists the default slot because the published build reads it; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-button-group

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `false` | `''` |
| `variant` | input | `'default' \| 'attached'` | `false` | — |
| `orientation` | input | `'horizontal' \| 'vertical'` | `false` | — |
| `*` | content | — | `false` | — |

`HwButtonGroupComponent` applies to `hw-button-group`; its host is the group, with the class `hw-button-group` and `role="group"`. `label` is written as the `aria-label` of the host while it is given and wins over an `aria-label` written by the application, which applies again when `label` is removed; give one source of the name. `aria-labelledby` on the host also names the group. `variant` and `orientation` write `data-variant` and `data-orientation` only when they are given. The projected content is native buttons or `hw-icon-button` elements.

## Accessibility

ButtonGroup is a labelled grouping of native buttons. It adds the group role and a name, and it adds no behaviour: each button keeps its own activation with <kbd>Enter</kbd> and <kbd>Space</kbd>, its own Tab stop and its own state.

- The group role and its name tell a reader of assistive technology which actions belong together. Write a name that states the subject of the actions, such as "Request actions", and do not repeat the word "group", which the role already announces.
- The group introduces no toolbar role and no roving focus: <kbd>Tab</kbd> moves through every enabled button in turn.
- The attached variant changes the appearance only. The focus outline of a button in the group is raised above its neighbours, so the overlap of the borders never hides it.
- The group is not a selection control. A choice of one value among several belongs to a `ToggleGroup`, which carries the selected state.

## RTL and localisation

ButtonGroup has no built-in text: the group name and the button labels are written by the application in the language of the page. The group lays its buttons out in reading order through logical properties, so a row starts at the reading start in Arabic and in English, and the attached variant rounds the outer corners at the reading start and end of the block and overlaps the borders along the inline axis.

- Keep the order of the actions the same in both languages, so that the primary action stays at the same place in reading order. The buttons follow the source order, which the reading direction mirrors.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of ButtonGroup; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- ButtonGroup is listed among the additional content components of the component scope in the [coverage notes](../coverage.md).
- The segmented control notes map the geometry, separators and states of the segmented control of the supplied Platforms Code style sheet to `ToggleGroup`. They record the attached ButtonGroup only as a Hawiyah composition for independent actions, not as a requirement of the source; see the [segmented control notes](../nic-segmented.md).
