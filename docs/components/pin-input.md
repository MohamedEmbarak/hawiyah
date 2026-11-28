# PinInput

PinInput is one labelled text input for a short numeric code, such as a one-time code sent to a reader. It normalises pasted and typed digits and keeps one focus stop; the application checks the code.

## Example

The field has a visible label, and the hint says where the code comes from. The component keeps a single input: the code is typed or pasted into it, Arabic-Indic digits become Latin digits, and every other character is dropped before the length applies.

```html live example=basic static differences=pin-input-adapter-markup
<div class="hw-field hw-pin-input" data-hw="pin-input">
  <label class="hw-label" for="basic-code">Verification code</label>
  <input class="hw-input" id="basic-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-describedby="basic-code-hint" data-hw-pin-input>
  <p class="hw-hint" id="basic-code-hint">Enter the 6-digit code from the message sent to your mobile number.</p>
</div>
```

```tsx live example=basic
<PinInput label="Verification code" name="code" hint="Enter the 6-digit code from the message sent to your mobile number." />
```

```vue live example=basic
<PinInput label="Verification code" name="code" hint="Enter the 6-digit code from the message sent to your mobile number." />
```

```ts live example=basic framework=angular
template: `<hw-pin-input label="Verification code" name="code" hint="Enter the 6-digit code from the message sent to your mobile number." />`
```

## Variants and states

### Length

`length` sets the number of digits; it defaults to 6 in React, Vue and Angular. In vanilla markup the authored `maxlength` sets it.

```html live example=length static differences=pin-input-adapter-markup
<div class="hw-field hw-pin-input" data-hw="pin-input">
  <label class="hw-label" for="length-code">Confirmation code</label>
  <input class="hw-input" id="length-code" name="confirmation" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="4" data-hw-pin-input>
</div>
```

```tsx live example=length
<PinInput label="Confirmation code" name="confirmation" length={4} />
```

```vue live example=length
<PinInput label="Confirmation code" name="confirmation" :length="4" />
```

```ts live example=length framework=angular
template: `<hw-pin-input label="Confirmation code" name="confirmation" [length]="4" />`
```

### Error

An error is shown after the control and describes what is wrong and how to correct it. The input is marked invalid and described by the message.

```html live example=error static differences=pin-input-adapter-markup
<div class="hw-field hw-pin-input" data-hw="pin-input">
  <label class="hw-label" for="error-code">Verification code</label>
  <input class="hw-input" id="error-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="1234" aria-invalid="true" aria-describedby="error-code-error" data-hw-pin-input>
  <p class="hw-error" id="error-code-error">The code has 6 digits. Enter the remaining digits.</p>
</div>
```

```tsx live example=error
<PinInput label="Verification code" name="code" defaultValue="1234" error="The code has 6 digits. Enter the remaining digits." />
```

```vue live example=error
<PinInput label="Verification code" name="code" default-value="1234" error="The code has 6 digits. Enter the remaining digits." />
```

```ts live example=error framework=angular
template: `<hw-pin-input label="Verification code" name="code" value="1234" error="The code has 6 digits. Enter the remaining digits." />`
```

## API

### JavaScript

Table: Options of createPinInput

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `length` | `number` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |

`createPinInput` enhances an element with the class `hw-pin-input` that holds a native input marked `data-hw-pin-input`; the same enhancement runs for `data-hw="pin-input"` through `enhance()`. The length is `length`, else the authored `maxlength`, else 6. While the controller is active it removes `maxlength`, so that a pasted value such as `123 456` is normalised before the length applies, and `destroy()` restores it. It also sets the type to text, the input mode to numeric, the autocomplete token for a one-time code and a pattern that accepts only digits of the length, replacing authored values until `destroy()` restores them, and it leaves `required` as authored. The controller returns `value` and `destroy()`. `onValueChange` receives the normalised code. An incomplete code is marked `aria-invalid="true"` after focus leaves the input, until the input is empty or complete.

### React

Table: Props of PinInput

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `length` | `number` | `false` | `6` |
| `showSlots` | `boolean` | `false` | `false` |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

PinInput also accepts the props of a native input element, such as `name`, `required`, `disabled`, `readOnly` and `ref`. Use `value` with `onValueChange` for a controlled field, or `defaultValue` for an uncontrolled one; the value is a string of digits. The component writes no `maxlength`. `showSlots` adds decorative slots, hidden from assistive technology, that show the entered characters; the input stays one control.

### Vue

Table: Props, events and slots of PinInput

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `length` | prop | `number` | `false` | `6` |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `complete` | event | `(value: string) => void` | `false` | — |

`v-model` binds the string value, and `defaultValue` sets the initial value of an uncontrolled field. The `complete` event reports the code when it reaches `length` digits. The other attributes, such as `name`, reach the native input. The published declaration types no slot and the published build reads none.

### Angular

Table: Inputs, outputs and content of hw-pin-input

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
| `length` | input | `number` | `false` | `6` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

`HwPinInputComponent` (`hw-pin-input`) renders the field, the label, the input, the hint and the error. Bind `[(value)]` for the string value; the component also works as a form control. `length` sets the number of digits. A field needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-pin-input`. `controlId` sets the id of the input.

## Accessibility

The code is one native text input, named by its label, so a reader meets one focus stop and the browser provides text editing. The component sets a numeric input mode, so touch devices offer a numeric keyboard, and the one-time-code autocomplete token, so a browser can offer a received code.

Table: Keyboard interaction of PinInput

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus into the input and out of it; the code has one focus stop. |

- An incomplete code is exposed as invalid after focus leaves the input, until it is empty or complete.
- A submission that fails on the input marks it invalid until a valid code is entered or the form resets.
- A character typed beyond a full code is ignored.
- A form reset restores the default value and clears the invalid state.

## RTL and localisation

PinInput has no built-in text: the label, the hint and the error are written by the application in the language of the page. The input accepts Arabic-Indic and Eastern Arabic digits and stores them as Latin digits, so a code typed or pasted in either numeral system gives the same value.

- A pasted value such as `٤٥٦-١٢٣` keeps its six digits, because every character that is not a digit is dropped before the length applies.
- The value is always a string of Latin digits; the application decides how the code is displayed in the message that carries it.
- Checking the code, its expiry, the number of attempts and the authentication belong to the application and its server.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of PinInput; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The one-time code pattern is listed among the Saudi service input recipes of the [coverage notes](../coverage.md), which call them configurable application patterns: one labelled input, paste support, one focus stop and optional decorative slots.
- The coverage notes state that normalising digits is text handling, and that authentication, expiry, attempts and replay handling are server concerns.
