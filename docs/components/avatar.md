# Avatar

Avatar shows a person or an entity as an image, and as initials while no image is shown. It is static: it is not a button, a link or a form control.

## Example

An avatar that has no image shows initials. React, Vue and Angular take them from the first character of each of the first two words of `name`, and the avatar is named by `name`.

```html live example=basic
<span class="hw-avatar" role="img" aria-label="Rana Cole"><span aria-hidden="true">RC</span></span>
```

```tsx live example=basic
<Avatar name="Rana Cole" />
```

```vue live example=basic
<Avatar name="Rana Cole" />
```

```ts live example=basic framework=angular
template: `<hw-avatar name="Rana Cole" />`
```

## Variants and states

### Size

`size` takes the named sizes `sm`, `md`, `lg` and `xl` and the pixel sizes `40`, `64`, `80` and `120`. Without it the avatar has the default size of the theme.

```html live example=size
<span class="hw-avatar" data-size="64" role="img" aria-label="Rana Cole"><span aria-hidden="true">RC</span></span>
```

```tsx live example=size
<Avatar name="Rana Cole" size="64" />
```

```vue live example=size
<Avatar name="Rana Cole" size="64" />
```

```ts live example=size framework=angular
template: `<hw-avatar name="Rana Cole" size="64" />`
```

### Square

`variant` takes `circle` or `square`. The circle is the default. Use the square for an organisation or another entity that is not a person.

```html live example=square
<span class="hw-avatar" data-variant="square" role="img" aria-label="Northfield Clinic"><span aria-hidden="true">NC</span></span>
```

```tsx live example=square
<Avatar name="Northfield Clinic" variant="square" />
```

```vue live example=square
<Avatar name="Northfield Clinic" variant="square" />
```

```ts live example=square framework=angular
template: `<hw-avatar name="Northfield Clinic" variant="square" />`
```

### Given initials

`initials` replaces the derived initials, for a name whose abbreviation is not its first characters.

```html live example=initials
<span class="hw-avatar" role="img" aria-label="Dr. Sami Haddad"><span aria-hidden="true">SH</span></span>
```

```tsx live example=initials
<Avatar name="Dr. Sami Haddad" initials="SH" />
```

```vue live example=initials
<Avatar name="Dr. Sami Haddad" initials="SH" />
```

```ts live example=initials framework=angular
template: `<hw-avatar name="Dr. Sami Haddad" initials="SH" />`
```

## API

### JavaScript

Table: Attributes of the hw-avatar element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-avatar'` | `true` | — |
| `data-size` | `'40' \| '64' \| '80' \| '120' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `false` | — |
| `data-variant` | `'circle' \| 'square'` | `false` | — |

Avatar has no JavaScript controller. The markup is the API: write an element with the class `hw-avatar` that holds either an `img` or the initials. `data-size` selects the size and `data-variant` selects `circle` or `square`; without them the avatar has the default size of the theme and the circle shape. For an avatar without an image, write `role="img"` and the full name in `aria-label` on the element, and write the initials in a `span` with `aria-hidden="true"`, which is the markup that React, Vue and Angular render. For an image, write the name in its `alt`. The vanilla package applies no script to the markup: the application replaces a failed image with the initials itself.

### React

Table: Props of Avatar

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `src` | `string` | `false` | — |
| `name` | `string` | `true` | — |
| `initials` | `string` | `false` | — |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '40' \| '64' \| '80' \| '120'` | `false` | — |
| `variant` | `'circle' \| 'square'` | `false` | — |
| `imageProps` | `Omit<ComponentPropsWithRef<'img'>, 'src' \| 'alt'>` | `false` | — |

`name` is required and names the avatar: it is the `alt` of the image while the image is shown and the accessible name of the avatar while it is not. `src` is the image. A failed image is replaced by the initials, and a new `src` is tried again. `initials` replaces the initials that Avatar derives from the first character of each of the first two words of `name`. `imageProps` passes the other props of a native `img`, such as `onError`, to the image; the `src` and the `alt` come from `src` and `name`. The other props of a native `span` reach the avatar element, and `size` and `variant` take precedence over the native `data-size` and `data-variant` attributes. Avatar sets `role` and `aria-label` itself, so a `role` or an `aria-label` that the application passes does not reach the element, whether the image is shown or not. Without `size` and `variant`, the avatar has the default size and the circle shape.

### Vue

Table: Props, events and slots of Avatar

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `name` | prop | `string` | `true` | — |
| `src` | prop | `string` | `false` | — |
| `initials` | prop | `string` | `false` | — |
| `size` | prop | `'sm' \| 'md' \| 'lg' \| 'xl' \| '40' \| '64' \| '80' \| '120'` | `false` | — |
| `variant` | prop | `'circle' \| 'square'` | `false` | — |

`name` is required and names the avatar: it is the `alt` of the image while the image is shown and the accessible name of the avatar while it is not. A failed image is replaced by the initials, and a new `src` is tried again. `initials` replaces the initials that Avatar derives from the first character of each of the first two words of `name`. Other attributes reach the avatar element, and `size` and `variant` take precedence over the native `data-size` and `data-variant` attributes. Avatar sets `role` and `aria-label` itself, so a `role` or an `aria-label` that the application passes as an attribute does not reach the element. Avatar reads no slot and emits no event.

### Angular

Table: Inputs, outputs and content of hw-avatar

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `name` | input | `string` | `true` | — |
| `size` | input | `'sm' \| 'md' \| 'lg' \| 'xl' \| '40' \| '64' \| '80' \| '120'` | `false` | — |
| `variant` | input | `'circle' \| 'square'` | `false` | — |
| `initials` | input | `string \| undefined` | `false` | — |
| `src` | input | `string` | `false` | — |

`HwAvatarComponent` applies to `hw-avatar`; the host element is the avatar and carries the class `hw-avatar`. `name` is required and names the avatar. A failed image is replaced by the initials, and a new `src` is tried again. `initials` replaces the initials that the component derives from the first character of each of the first two words of `name`. `size` and `variant` are written to `data-size` and `data-variant` only when given. While no image is shown, the host has `role="img"` and `name` as its accessible name; while an image is shown, a `role` and an `aria-label` that the application wrote on the host apply again.

## Accessibility

An avatar is static: it takes no focus, has no keyboard behaviour and is not announced as a control. The accessible name is the full name that the avatar represents, not the initials.

- While no image is shown, the avatar element has `role="img"` and the full name as its name, and the initials are hidden from assistive technology, so a reader hears the name once.
- While an image is shown, its `alt` is the name. Every adapter writes the `alt` from `name` and offers no empty alternative, so where the same name stands in visible text beside the avatar, a reader hears it twice. Whether the alternative text of an image is needed depends on the identifying text near it, and the component cannot leave it out.
- Write a full name in `name`, not a role or a word such as "avatar".
- Do not use an avatar as the only way to tell people apart: the initials of two people can be the same. Show the name as text where people must be told apart.
- An avatar that opens an action needs a separate native `button` or `a` with its own accessible name; the avatar does not become one.
- Initials come from the first code point of each of the first two words of `name`, so a character that is made of several code points can be split; they are not an abbreviation of a full name in every script, so pass `initials` where the result is wrong.

## RTL and localisation

Avatar has no built-in text. The name is written by the application in the language of the page, and the initials follow from it, so an Arabic name gives Arabic initials unless `initials` is passed. The avatar element is a circle or a square and does not change with the reading direction.

- Pass `initials` in the script of the name that the reader sees. Where the initials of an Arabic name are to read in a particular order, write them in that order in `initials`, as the derived initials follow the order of the words of the name.
- Write the `aria-label` of a vanilla avatar in the language of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Avatar; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The size options, the border and the circle crop of the supplied Platforms Code style sheet are mapped in the [avatar notes](../nic-avatars.md). The notes state that the source defines the presentation of an image, not profile fetching, the handling of a failed image or identity verification.
- The notes record the fallback to initials, the size options `sm`, `lg` and `xl` and the square variant as Hawiyah extensions, not as behaviour of the source. They record `md` as the theme default size, which is the 40 pixel option of the source in the DGA theme.
