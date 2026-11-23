# PasswordField

PasswordField is a labelled password input with a button that shows or hides the entered text. The application supplies the label, the hint, the error and the names of the button; the component has no text of its own.

## Example

The field has a visible label, and the toggle is a button named by the application: `showLabel` while the password is concealed and `hideLabel` while it is shown. Showing the password changes the type of the input and keeps its value.

```html live example=basic static differences=password-field-adapter-markup
<div class="hw-field hw-password-field" data-hw="password-field">
  <label class="hw-label" for="basic-password">Password</label>
  <div class="hw-password-control">
    <input class="hw-input" id="basic-password" name="password" type="password" autocomplete="current-password" data-hw-password-input>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Show password" data-hw-password-toggle data-hw-hide-label="Hide password"></button>
  </div>
</div>
```

```tsx live example=basic
<PasswordField label="Password" name="password" autoComplete="current-password" showLabel="Show password" hideLabel="Hide password" />
```

```vue live example=basic
<PasswordField label="Password" name="password" autocomplete="current-password" show-label="Show password" hide-label="Hide password" />
```

```ts live example=basic framework=angular
template: `<hw-password-field label="Password" name="password" showLabel="Show password" hideLabel="Hide password" />`
```

## Variants and states

### Text toggle

With `toggleVariant` set to `text` the toggle shows its name as visible text instead of an icon. The name stays the accessible name of the button in both variants.

```html live example=text-toggle static differences=password-field-adapter-markup
<div class="hw-field hw-password-field" data-hw="password-field" data-hw-toggle-variant="text">
  <label class="hw-label" for="text-password">New password</label>
  <div class="hw-password-control">
    <input class="hw-input" id="text-password" name="new-password" type="password" autocomplete="new-password" data-hw-password-input>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Show" data-hw-password-toggle data-hw-hide-label="Hide"></button>
  </div>
</div>
```

```tsx live example=text-toggle
<PasswordField label="New password" name="new-password" autoComplete="new-password" toggleVariant="text" showLabel="Show" hideLabel="Hide" />
```

```vue live example=text-toggle
<PasswordField label="New password" name="new-password" autocomplete="new-password" toggle-variant="text" show-label="Show" hide-label="Hide" />
```

```ts live example=text-toggle framework=angular
template: `<hw-password-field label="New password" name="new-password" autocomplete="new-password" toggleVariant="text" showLabel="Show" hideLabel="Hide" />`
```

### Hint and error

The hint states the rule the password must meet. An error is shown after the control and describes what is wrong and how to correct it.

```html live example=error static differences=password-field-adapter-markup
<div class="hw-field hw-password-field" data-hw="password-field">
  <label class="hw-label" for="error-password">New password</label>
  <div class="hw-password-control">
    <input class="hw-input" id="error-password" name="new-password" type="password" autocomplete="new-password" aria-invalid="true" aria-describedby="error-password-hint error-password-error" data-hw-password-input>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="Show password" data-hw-password-toggle data-hw-hide-label="Hide password"></button>
  </div>
  <p class="hw-hint" id="error-password-hint">Use at least 12 characters.</p>
  <p class="hw-error" id="error-password-error">The password is shorter than 12 characters. Enter a longer password.</p>
</div>
```

```tsx live example=error
<PasswordField label="New password" name="new-password" autoComplete="new-password" showLabel="Show password" hideLabel="Hide password" hint="Use at least 12 characters." error="The password is shorter than 12 characters. Enter a longer password." />
```

```vue live example=error
<PasswordField label="New password" name="new-password" autocomplete="new-password" show-label="Show password" hide-label="Hide password" hint="Use at least 12 characters." error="The password is shorter than 12 characters. Enter a longer password." />
```

```ts live example=error framework=angular
template: `<hw-password-field label="New password" name="new-password" autocomplete="new-password" showLabel="Show password" hideLabel="Hide password" hint="Use at least 12 characters." error="The password is shorter than 12 characters. Enter a longer password." />`
```

## API

### JavaScript

Table: Options of createPasswordField

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `showLabel` | `string` | `false` | — |
| `hideLabel` | `string` | `false` | — |
| `toggleVariant` | `'icon' \| 'text'` | `false` | — |
| `onVisibleChange` | `(visible: boolean) => void` | `false` | — |

`createPasswordField` enhances an element with the class `hw-password-field` that holds a native input marked `data-hw-password-input` and a button marked `data-hw-password-toggle`; the same enhancement runs for `data-hw="password-field"` through `enhance()`. Write the `label` before `hw-password-control`, which holds only the input and the button, so that the toggle stands at the end of the input. The controller returns `visible`, `toggle()` and `destroy()`. The two names are required. Pass `showLabel` and `hideLabel`; or write the show name as the authored `aria-label` or text of the button, or as `data-hw-show-label`, and the hide name as `data-hw-hide-label`, each on the button or on the root. An option wins over an attribute. `toggleVariant` is also read from `data-hw-toggle-variant`; without either, the controller uses `icon`, and it inserts the icon unless the variant is `text`. `onVisibleChange` receives the new state, and the `hw:change` event carries `{ visible }`. A reset of the form conceals the value and reports `false` once when it was visible.

### React

Table: Props of PasswordField

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | — |
| `defaultVisible` | `boolean` | `false` | `false` |
| `onVisibleChange` | `(visible: boolean) => void` | `false` | — |
| `showLabel` | `string` | `true` | — |
| `hideLabel` | `string` | `true` | — |
| `toggleVariant` | `'icon' \| 'text'` | `false` | `'icon'` |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

PasswordField accepts the props of TextField except `type`, such as `name`, `value`, `defaultValue`, `onChange`, `required`, `disabled`, `readOnly` and `autoComplete`; they reach the input. Use `visible` with `onVisibleChange` to control the visibility, or `defaultVisible` for an uncontrolled field. `showLabel` and `hideLabel` are required and are the accessible names of the toggle. The hint and the error render as paragraphs after the control.

### Vue

Table: Props, events and slots of PasswordField

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `showLabel` | prop | `string` | `true` | — |
| `hideLabel` | prop | `string` | `true` | — |
| `toggleVariant` | prop | `'icon' \| 'text'` | `false` | `'icon'` |
| `visible` | prop | `boolean` | `false` | — |
| `defaultVisible` | prop | `boolean` | `false` | `false` |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:visible` | event | `(visible: boolean) => void` | `false` | — |

`v-model` binds the string value and `v-model` with the argument `visible` binds the visibility; `defaultValue` and `defaultVisible` set the initial state of an uncontrolled field. `showLabel` and `hideLabel` are required. The other attributes, such as `name` and `autocomplete`, reach the native input. The published declaration types no slot and the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-password-field

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string \| null \| undefined` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `name` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `aria-invalid` | input | `boolean` | `false` | `false` |
| `form` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `value` | input | `string` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `autocomplete` | input | `string` | `false` | `'current-password'` |
| `placeholder` | input | `string` | `false` | `''` |
| `toggleVariant` | input | `'icon' \| 'text'` | `false` | `'icon'` |
| `showLabel` | input | `string` | `true` | — |
| `hideLabel` | input | `string` | `true` | — |
| `visible` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `visibleChange` | output | `boolean` | `false` | — |

`HwPasswordFieldComponent` (`hw-password-field`) renders the field, the label, the input, the toggle, the hint and the error. Bind `[(value)]` for the string value and `[(visible)]` for the visibility; a value written by Angular Forms does not change the visibility. `showLabel` and `hideLabel` are required. Without an `autocomplete` input the field writes `autocomplete="current-password"`, so write the standard token for a new password where the reader chooses one. `controlId` sets the id of the input.

## Accessibility

The input is a native input element, so the browser provides its role, text editing and keyboard handling, and the label names it. The toggle is a button named by `showLabel` or `hideLabel`, and it exposes `aria-pressed` and `aria-controls`; the icon of the icon variant is decorative.

Table: Keyboard interaction of PasswordField

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus between the input and the toggle in the order of the document. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused toggle, which shows or hides the password. |

- Showing or hiding the password keeps the input, its value and the focus on the toggle.
- A read-only password can still be shown, because visibility does not edit the value. A disabled input cannot be toggled.
- Paste and password managers behave as in a native password input.
- A form reset conceals the value.

## RTL and localisation

PasswordField has no built-in text: the label, the hint, the error and both names of the toggle are written by the application in the language of the page. The toggle stands at the logical end of the input, and its icon does not mirror in right-to-left text.

- The password text is entered and shown as the reader types it; the component does not change its direction or script.
- In the text variant the visible name of the toggle may wrap in a narrow field, so keep it short.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of PasswordField; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The inset toggle at the logical end of the input is the integrated action of Hawiyah, which keeps space for its control as the [input notes](../nic-inputs.md) map the horizontal padding of the input; the [password visibility notes](../password-field.md) state that the icons claim no DGA node comparison or visual parity.
- The [password visibility notes](../password-field.md) describe the toggle, its names and the reset behaviour that this page restates for the reader.
