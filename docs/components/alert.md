# Alert

Alert shows a short message inside the page about the state of a task or a document, in one of five tones. It announces itself to assistive technology according to its tone, and the application decides whether it can be dismissed.

## Example

An alert holds the text of the message in its content. The default tone is `info`, which is announced politely as a status.

```html live example=basic
<div class="hw-alert" data-tone="info" role="status">
  <div class="hw-alert-content"><p>Requests received after 14:00 are processed on the next working day.</p></div>
</div>
```

```tsx live example=basic
<Alert>
  <p>Requests received after 14:00 are processed on the next working day.</p>
</Alert>
```

```vue live example=basic
<Alert>
  <p>Requests received after 14:00 are processed on the next working day.</p>
</Alert>
```

```ts live example=basic framework=angular
template: `<hw-alert>
  <p>Requests received after 14:00 are processed on the next working day.</p>
</hw-alert>`
```

## Variants and states

### Tone

`tone` takes `neutral`, `info`, `success`, `warning` and `danger`. A danger alert is announced at once as an alert; every other tone is a status. State the meaning in words, because the tone also changes colour.

```html live example=danger
<div class="hw-alert" data-tone="danger" role="alert">
  <div class="hw-alert-content"><p>The document was not uploaded. Choose a file in PDF format and try again.</p></div>
</div>
```

```tsx live example=danger
<Alert tone="danger">
  <p>The document was not uploaded. Choose a file in PDF format and try again.</p>
</Alert>
```

```vue live example=danger
<Alert tone="danger">
  <p>The document was not uploaded. Choose a file in PDF format and try again.</p>
</Alert>
```

```ts live example=danger framework=angular
template: `<hw-alert tone="danger">
  <p>The document was not uploaded. Choose a file in PDF format and try again.</p>
</hw-alert>`
```

### Outline

`variant` selects the `outline` or the `minimal` appearance. Without it the alert has the default appearance.

```html live example=outline
<div class="hw-alert" data-tone="success" data-variant="outline" role="status">
  <div class="hw-alert-content"><p>Your request was submitted.</p></div>
</div>
```

```tsx live example=outline
<Alert tone="success" variant="outline">
  <p>Your request was submitted.</p>
</Alert>
```

```vue live example=outline
<Alert tone="success" variant="outline">
  <p>Your request was submitted.</p>
</Alert>
```

```ts live example=outline framework=angular
template: `<hw-alert tone="success" variant="outline">
  <p>Your request was submitted.</p>
</hw-alert>`
```

### Title

`title` adds a short title in strong text at the start of the content, above the message. It is a `strong` element and not a heading element, so assistive technology does not expose it as a heading.

```html live example=title
<div class="hw-alert" data-tone="warning" role="status">
  <div class="hw-alert-content"><strong>Missing information.</strong><p>Add the date of birth before you submit the request.</p></div>
</div>
```

```tsx live example=title
<Alert tone="warning" title="Missing information.">
  <p>Add the date of birth before you submit the request.</p>
</Alert>
```

```vue live example=title
<Alert tone="warning" title="Missing information.">
  <p>Add the date of birth before you submit the request.</p>
</Alert>
```

```ts live example=title framework=angular
template: `<hw-alert tone="warning" title="Missing information.">
  <p>Add the date of birth before you submit the request.</p>
</hw-alert>`
```

### Dismiss

A dismiss button follows the content when the application listens for the dismiss action, and its accessible name is `closeLabel`. The alert never removes itself: the application removes it and moves focus to the element the message was about. The React, Vue and Angular examples keep the state of the alert, remove it on dismissal and move focus to a heading that stands for what the message was about; the vanilla handler is shown after the example.

```html live example=dismiss
<div class="hw-alert" data-tone="info" role="status">
  <div class="hw-alert-content"><p>Your draft was saved.</p></div>
  <button type="button" class="hw-button hw-alert-dismiss" data-variant="ghost" data-size="md" aria-label="Dismiss message"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
</div>
<h2 tabindex="-1">Draft request</h2>
```

```tsx live example=dismiss
import { useRef, useState } from 'react';
import { Alert } from '@hawiyah/react';

export default function Example() {
  const [open, setOpen] = useState(true);
  const target = useRef<HTMLHeadingElement>(null);
  return (
    <>
      {open ? (
        <Alert
          closeLabel="Dismiss message"
          onDismiss={() => {
            setOpen(false);
            target.current?.focus();
          }}
        >
          <p>Your draft was saved.</p>
        </Alert>
      ) : null}
      <h2 ref={target} tabIndex={-1}>Draft request</h2>
    </>
  );
}
```

```vue live example=dismiss
<script setup lang="ts">
import { ref } from 'vue';
import { Alert } from '@hawiyah/vue';

const open = ref(true);
const target = ref<HTMLElement | null>(null);
function dismiss() {
  open.value = false;
  target.value?.focus();
}
</script>

<template>
  <Alert v-if="open" close-label="Dismiss message" @dismiss="dismiss">
    <p>Your draft was saved.</p>
  </Alert>
  <h2 ref="target" tabindex="-1">Draft request</h2>
</template>
```

```ts live example=dismiss framework=angular
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { HwAlertComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwAlertComponent],
  template: `
    @if (open()) {
      <hw-alert closeLabel="Dismiss message" (dismissed)="dismiss()">
        <p>Your draft was saved.</p>
      </hw-alert>
    }
    <h2 #target tabindex="-1">Draft request</h2>
  `,
})
export class ExampleComponent {
  readonly open = signal(true);
  private readonly target = viewChild.required<ElementRef<HTMLElement>>('target');

  dismiss(): void {
    this.open.set(false);
    this.target().nativeElement.focus();
  }
}
```

The vanilla markup has no script. The application attaches the handler, removes the alert and sends focus to what the message was about:

```ts
const alert = document.querySelector<HTMLElement>('.hw-alert')!;
alert.querySelector('.hw-alert-dismiss')!.addEventListener('click', () => {
  alert.remove();
  document.querySelector<HTMLElement>('main h1')?.focus();
});
```

## API

### JavaScript

Table: Attributes of the hw-alert element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-alert'` | `true` | — |
| `data-tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | — |
| `data-variant` | `'outline' \| 'minimal'` | `false` | — |

Alert has no JavaScript controller. The markup is the API: write an element with the class `hw-alert`, a `div` with the class `hw-alert-content` that holds the message, and the attributes `data-tone` and `role`. The role is not written for you: use `role="alert"` for a danger alert and `role="status"` for every other tone; write `role="status"` for a danger message that is rendered with the page and is not a late event. `data-variant` is optional, and without it the alert has the default appearance. For a dismissible alert, write a `button` with the classes `hw-button` and `hw-alert-dismiss`, `data-variant="ghost"`, a packaged icon with `aria-hidden="true"` and an `aria-label`, as a direct child after the content. The application attaches the click handler, removes the alert and moves focus; the markup never hides itself.

### React

Table: Props of Alert

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `false` | `'info'` |
| `variant` | `'default' \| 'outline' \| 'minimal'` | `false` | — |
| `title` | `string` | `false` | — |
| `onDismiss` | `() => void` | `false` | — |
| `closeLabel` | `string` | `false` | — |

The children are the message. Without a `role` prop the alert has `role="alert"` for the tone `danger` and `role="status"` for every other tone; pass `role="status"` for a danger message that is rendered with the page and is not a late event. `variant` is written to `data-variant` only when it is given. `onDismiss` renders a ghost close button after the content, and `closeLabel`, its accessible name, is required when `onDismiss` is given. The alert never hides itself. The other props of a native `div` reach the alert element.

### Vue

Table: Props, events and slots of Alert

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `tone` | prop | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'info'` |
| `title` | prop | `string` | `false` | — |
| `variant` | prop | `'default' \| 'outline' \| 'minimal'` | `false` | — |
| `closeLabel` | prop | `string` | `false` | — |
| `onDismiss` | prop | `(() => void) \| (() => void)[]` | `false` | — |
| `default` | slot | — | `false` | — |

The default slot is the message. Without a `role` attribute the alert has `role="alert"` for the tone `danger` and `role="status"` for every other tone; pass `role="status"` for a danger message that is rendered with the page. Listen with a handler for the dismiss action, which the declaration lists as the prop `onDismiss`: a bound listener renders a ghost close button after the content, and `closeLabel`, its accessible name, is then required. The alert never hides itself. Other attributes reach the alert element.

### Angular

Table: Inputs, outputs and content of hw-alert

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `tone` | input | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `false` | `'info'` |
| `variant` | input | `'default' \| 'outline' \| 'minimal'` | `false` | — |
| `title` | input | `string` | `false` | `''` |
| `role` | input | `'alert' \| 'status' \| 'region' \| 'group'` | `false` | — |
| `closeLabel` | input | `string` | `false` | `''` |
| `dismissed` | output | `void` | `false` | — |
| `*` | content | — | `false` | — |

`HwAlertComponent` applies to `hw-alert`; the host element is the alert and carries the class `hw-alert`, and the projected content is the message. Without `role`, the host has `role="alert"` for the tone `danger` and `role="status"` for every other tone; set `role="status"` for a danger message that is rendered with the page. Write `role` and `variant` as inputs, static or bound; `[attr.role]` and `[attr.data-variant]` on `hw-alert` are not supported. `variant` is written to `data-variant` only when it is given. While a `(dismissed)` listener is bound, a ghost close button follows the content, and `closeLabel`, its accessible name, is required then and not otherwise. The alert never hides itself.

## Accessibility

An alert is a `div` with the role `alert` or `status`; without a `role` the adapters give a danger alert `role="alert"` and every other tone `role="status"`. The role follows the urgency of the message.

- A danger alert has `role="alert"`, which interrupts the reader. Every other tone has `role="status"`, which waits for a pause. Choose the tone by urgency and timing.
- A message that is already in the page when it loads is not a late event. Give a danger message of that kind `role="status"`, so that it does not interrupt the reader at once.
- The tone also changes colour. Say what the message means in words, because a reader cannot rely on colour alone.
- The dismiss button is a native `button` that takes focus in the tab order and is named by `closeLabel`, or, in markup that the application writes itself, by the `aria-label` of the button. Its icon is hidden from assistive technology.
- The alert never removes itself. When the application removes it, move focus to the element the message was about or to the heading of the surrounding region, so that focus does not return to the start of the page.
- Place a message that needs an action next to the control it concerns, and use the text of the message to say what to do.

## RTL and localisation

Alert has no built-in text. The message, the title and `closeLabel` are written by the application in the language of the page, and the alert inherits its direction, so the content and the dismiss button follow the reading direction. The tone rail is drawn on the inline start side of the alert, so it stands at the reading start.

- Write `closeLabel` in the language of the alert, and name what is dismissed where several alerts stand on one page.
- Write the numerals, dates and times of the message in the form that the application uses for its language.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Alert; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Alert is listed among the components of initial presentation in the [coverage notes](../coverage.md).
- The [notification notes](../nic-notifications.md) map the tone colours and the message size of the notification banner of the supplied Platforms Code files. They name the banner and not Alert, and Alert renders no glyph.
