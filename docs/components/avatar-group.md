# AvatarGroup

AvatarGroup shows several avatars side by side as one named group, and replaces the avatars beyond a limit with a count of the people who are hidden. It is static: it is not a list of controls.

## Example

The group has a name that says whom it lists. With a `max` of 3 it shows the first three avatars and a marker with the number of the others, and the marker has its own accessible name from `getOverflowLabel`.

```html live example=basic
<div class="hw-avatar-group" role="group" aria-label="Case team">
  <span class="hw-avatar" role="img" aria-label="Rana Cole"><span aria-hidden="true">RC</span></span>
  <span class="hw-avatar" role="img" aria-label="Sami Haddad"><span aria-hidden="true">SH</span></span>
  <span class="hw-avatar" role="img" aria-label="Lina Mercer"><span aria-hidden="true">LM</span></span>
  <span class="hw-avatar" role="img" aria-label="2 more people">+2</span>
</div>
```

```tsx live example=basic
<AvatarGroup
  label="Case team"
  max={3}
  items={[
    { name: 'Rana Cole' },
    { name: 'Sami Haddad' },
    { name: 'Lina Mercer' },
    { name: 'Omar Quinn' },
    { name: 'Dana Wells' },
  ]}
  getOverflowLabel={(count) => (count === 1 ? '1 more person' : count + ' more people')}
/>
```

```vue live example=basic
<AvatarGroup
  label="Case team"
  :max="3"
  :items="[
    { name: 'Rana Cole' },
    { name: 'Sami Haddad' },
    { name: 'Lina Mercer' },
    { name: 'Omar Quinn' },
    { name: 'Dana Wells' },
  ]"
  :get-overflow-label="(count: number) => (count === 1 ? '1 more person' : count + ' more people')"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwAvatarGroupComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAvatarGroupComponent],
  template: `<hw-avatar-group label="Case team" [max]="3" [items]="items" [getOverflowLabel]="overflowLabel" />`,
})
export class ExampleComponent {
  items = [
    { name: 'Rana Cole' },
    { name: 'Sami Haddad' },
    { name: 'Lina Mercer' },
    { name: 'Omar Quinn' },
    { name: 'Dana Wells' },
  ];
  overflowLabel = (count: number) => (count === 1 ? '1 more person' : count + ' more people');
}
```

## Variants and states

### Within the limit

When the list is not longer than `max`, the group shows every avatar and no marker. `getOverflowLabel` is still required.

```html live example=short
<div class="hw-avatar-group" role="group" aria-label="Request reviewers">
  <span class="hw-avatar" role="img" aria-label="Rana Cole"><span aria-hidden="true">RC</span></span>
  <span class="hw-avatar" role="img" aria-label="Sami Haddad"><span aria-hidden="true">SH</span></span>
</div>
```

```tsx live example=short
<AvatarGroup
  label="Request reviewers"
  items={[{ name: 'Rana Cole' }, { name: 'Sami Haddad' }]}
  getOverflowLabel={(count) => (count === 1 ? '1 more person' : count + ' more people')}
/>
```

```vue live example=short
<AvatarGroup
  label="Request reviewers"
  :items="[{ name: 'Rana Cole' }, { name: 'Sami Haddad' }]"
  :get-overflow-label="(count: number) => (count === 1 ? '1 more person' : count + ' more people')"
/>
```

```ts live example=short framework=angular
import { Component } from '@angular/core';
import { HwAvatarGroupComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAvatarGroupComponent],
  template: `<hw-avatar-group label="Request reviewers" [items]="items" [getOverflowLabel]="overflowLabel" />`,
})
export class ExampleComponent {
  items = [{ name: 'Rana Cole' }, { name: 'Sami Haddad' }];
  overflowLabel = (count: number) => (count === 1 ? '1 more person' : count + ' more people');
}
```

### Size and shape

Each item takes the fields of an avatar, such as `size`, `variant` and `initials`, so the avatars of a group can share a size and a shape.

```html live example=sized
<div class="hw-avatar-group" role="group" aria-label="Participating organisations">
  <span class="hw-avatar" data-size="64" data-variant="square" role="img" aria-label="Northfield Clinic"><span aria-hidden="true">NC</span></span>
  <span class="hw-avatar" data-size="64" data-variant="square" role="img" aria-label="Harbour Supplies"><span aria-hidden="true">HS</span></span>
</div>
```

```tsx live example=sized
<AvatarGroup
  label="Participating organisations"
  items={[
    { name: 'Northfield Clinic', size: '64', variant: 'square' },
    { name: 'Harbour Supplies', size: '64', variant: 'square' },
  ]}
  getOverflowLabel={(count) => (count === 1 ? '1 more organisation' : count + ' more organisations')}
/>
```

```vue live example=sized
<AvatarGroup
  label="Participating organisations"
  :items="[
    { name: 'Northfield Clinic', size: '64', variant: 'square' },
    { name: 'Harbour Supplies', size: '64', variant: 'square' },
  ]"
  :get-overflow-label="(count: number) => (count === 1 ? '1 more organisation' : count + ' more organisations')"
/>
```

```ts live example=sized framework=angular
import { Component } from '@angular/core';
import { HwAvatarGroupComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAvatarGroupComponent],
  template: `<hw-avatar-group label="Participating organisations" [items]="items" [getOverflowLabel]="overflowLabel" />`,
})
export class ExampleComponent {
  items = [
    { name: 'Northfield Clinic', size: '64' as const, variant: 'square' as const },
    { name: 'Harbour Supplies', size: '64' as const, variant: 'square' as const },
  ];
  overflowLabel = (count: number) => (count === 1 ? '1 more organisation' : count + ' more organisations');
}
```

## API

### JavaScript

Table: Attributes of the hw-avatar-group element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-avatar-group'` | `true` | — |

> [!NOTE]
> These classes and attributes are read from the published stylesheet and are outside the stable contract of 0.3.0.

AvatarGroup has no JavaScript controller. The markup is the API: write an element with the class `hw-avatar-group`, `role="group"` and an `aria-label` that names the group, and write the avatars as its children (see [Avatar](avatar.md) for their markup). The application writes the overflow marker itself, as a further element with the class `hw-avatar`, `role="img"`, an `aria-label` that says how many people are hidden, and the count as its text. The vanilla package applies no script to the markup.

### React

Table: Props of AvatarGroup

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly AvatarProps[]` | `true` | — |
| `max` | `number` | `false` | `5` |
| `getOverflowLabel` | `(count: number) => string` | `true` | — |
| `label` | `string` | `false` | — |

`items` lists the avatars; each item takes the props of Avatar, and `name` is required in each. The group shows the first `max` items, and `max` is rounded down. When items remain, it adds a marker whose text is the plus sign and the number of hidden items, and whose accessible name is the result of `getOverflowLabel` called with that number. `label` is the accessible name of the group and is required unless `aria-label` or `aria-labelledby` is passed. The other props of a native `div` reach the group element.

### Vue

Table: Props, events and slots of AvatarGroup

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly AvatarItem[]` | `true` | — |
| `max` | prop | `number` | `false` | `5` |
| `label` | prop | `string` | `false` | — |
| `getOverflowLabel` | prop | `(count: number) => string` | `true` | — |

`items` lists the avatars; each item has a required `name` and the optional `src`, `initials`, `size` and `variant` of Avatar. The group shows the first `max` items, and `max` is rounded down. When items remain, it adds a marker whose text is the plus sign and the number of hidden items, and whose accessible name is the result of `getOverflowLabel` called with that number. `label` is the accessible name of the group and is required unless `aria-label` or `aria-labelledby` is passed as an attribute. AvatarGroup reads no slot and emits no event.

### Angular

Table: Inputs, outputs and content of hw-avatar-group

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwAvatarItem[]` | `false` | `[]` |
| `max` | input | `number` | `false` | `5` |
| `getOverflowLabel` | input | `(count: number) => string` | `true` | — |

`HwAvatarGroupComponent` applies to `hw-avatar-group`; the host element is the group and carries the class `hw-avatar-group`. `items` lists the avatars; each item is an `HwAvatarItem` with a required `name` and the optional `src`, `initials`, `size` and `variant` of `hw-avatar`. The group shows the first `max` items. When items remain, it adds a marker whose text is the plus sign and the number of hidden items, and whose accessible name is the result of `getOverflowLabel` called with that number. `label` is written as the `aria-label` of the host and is required unless the host carries `aria-label` or `aria-labelledby` itself.

## Accessibility

The group has `role="group"` and a name, and each avatar keeps the name and the role that Avatar gives it. The group is static: it takes no focus and has no keyboard behaviour.

- Name the group by what it lists, such as "Case team", not by "avatars".
- The overflow marker has `role="img"` and the name that `getOverflowLabel` returns, so a reader hears "2 more people" and not the symbol and the digit. Return a phrase with the count, in the grammar of the page language.
- The group shows names only through the accessible names of its avatars. Where people must be told apart or contacted, list their names as text elsewhere on the page; the hidden people are known to a reader only by their number.
- Do not use the group as a control. An action that opens the full list needs a separate native `button` or `a` with its own accessible name.

## RTL and localisation

AvatarGroup has no built-in text. The name of the group, the names of the people and the text that `getOverflowLabel` returns are written by the application in the language of the page. The function receives the number of hidden avatars, so the application chooses the plural form and the numerals of its language.

- The marker shows the plus sign and a numeral as text; its accessible name is the phrase from `getOverflowLabel`, not that text.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of AvatarGroup; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- AvatarGroup is listed among the additional content of the component scope in the [coverage notes](../coverage.md).
- The [avatar notes](../nic-avatars.md) state that the overlap and the overflow count of grouped avatars are Hawiyah compositions and not behaviour defined by the supplied Platforms Code style sheet.
