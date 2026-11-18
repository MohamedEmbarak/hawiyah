# Fixture A

Fixture A is a test page of the content pipeline. It uses every construct the authoring contract allows.

## Example

The example shows one primary action.

```html live example=primary
<button class="hw-button" type="button" data-variant="primary">Continue</button>
```

```tsx live example=primary
<Button variant="primary">Continue</Button>
```

```vue live example=primary
<HwButton variant="primary">Continue</HwButton>
```

```ts live example=primary framework=angular
template: `<button hwButton variant="primary">Continue</button>`
```

## Variants and states

### Language and direction

A group may set the language and direction of its content.

```html live example=direction check=tabs-click
<p class="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>
```

```jsx live example=direction
<p className="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>
```

```vue live example=direction
<p class="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>
```

```ts live example=direction framework=angular
template: `<p class="hw-type" lang="en" dir="ltr">Read the <strong>terms</strong> first.</p>`
```

## API

### JavaScript

Table: Options of createFixture

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | `true` | — |
| `size` | `'sm' \| 'md'` | `false` | `'md'` |

The label names the control. The size sets the density.

### React

Table: Props of Fixture

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | `string` | `true` | — |

### Vue

Table: Props, events and slots of HwFixture

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `change` | event | `string` | `false` | — |

### Angular

Table: Inputs, outputs and content of hw-fixture

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `[hwFixtureIcon]` | content | `—` | `false` | — |

## Accessibility

The control has an accessible name. See the [API](#api) and the [JavaScript options](fixture-a.md#javascript).

Table: Keyboard

| Key | Action |
| :-- | --: |
| Enter | Activates the control. |
| Space | Activates the control. |

> [!NOTE]
> The control keeps the native **button** semantics.

### Screen readers

#### Announcements

The state is announced *once*.

1. Focus the control.
2. Press Enter.

## RTL and localisation

The layout uses logical properties only. Read the [Platforms Code](https://www.dga.gov.sa/) and the [component list](../components.json).

---

- Text follows the page direction.
- Numbers keep their own direction.

## Platforms Code reference

The installation command is a code listing.

```shell
npm install @hawiyah/vanilla
```

```ts title="setup.ts"
import { enhance } from '@hawiyah/vanilla';
enhance(document.body);
```
