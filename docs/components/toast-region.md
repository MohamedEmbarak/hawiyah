# ToastRegion

ToastRegion shows short messages that the application owns, in a labelled region that assistive technology announces. The application decides which messages exist, when they leave and what happens when a reader dismisses one.

## Example

A message has an `id`, an optional `title` and a `message`, and the region names itself with a `label`. A message announces politely unless it is marked `urgent`; the region keeps separate live regions for the two kinds, so only an urgent message interrupts the reader. The examples use `position="inline"` so that the region stands in the page. Without it, the region is fixed to the window, at its bottom end corner.

```html live example=basic static differences=toast-region-adapter-markup
<section class="hw-toast-region" tabindex="-1" aria-label="Notices" data-position="inline">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="submitted" data-tone="success">
      <div class="hw-toast-content"><strong>Request submitted</strong><p>Your request was received. Keep the reference number for follow-up.</p></div>
    </article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive">
    <article class="hw-toast" data-hw-toast="upload" data-tone="danger">
      <div class="hw-toast-content"><strong>Upload failed</strong><p>The document could not be uploaded. Try again.</p></div>
    </article>
  </div>
</section>
```

```tsx live example=basic
<ToastRegion
  label="Notices"
  position="inline"
  messages={[
    { id: 'submitted', title: 'Request submitted', message: 'Your request was received. Keep the reference number for follow-up.', tone: 'success' },
    { id: 'upload', title: 'Upload failed', message: 'The document could not be uploaded. Try again.', tone: 'danger', urgent: true },
  ]}
/>
```

```vue live example=basic
<ToastRegion
  label="Notices"
  position="inline"
  :messages="[
    { id: 'submitted', title: 'Request submitted', message: 'Your request was received. Keep the reference number for follow-up.', tone: 'success' },
    { id: 'upload', title: 'Upload failed', message: 'The document could not be uploaded. Try again.', tone: 'danger', urgent: true },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-toast-region
  label="Notices"
  position="inline"
  [messages]="[
    { id: 'submitted', title: 'Request submitted', message: 'Your request was received. Keep the reference number for follow-up.', tone: 'success' },
    { id: 'upload', title: 'Upload failed', message: 'The document could not be uploaded. Try again.', tone: 'danger', urgent: true },
  ]"
/>`
```

## Variants and states

### Tones

The `tone` of a message is `neutral`, `info`, `success`, `warning` or `danger`, and a message without a tone is `info`. The tone sets the colour of the message. Write the meaning in words as well, because the colour does not carry it alone.

```html live example=tones static differences=toast-region-adapter-markup
<section class="hw-toast-region" tabindex="-1" aria-label="Notices" data-position="inline">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="neutral" data-tone="neutral"><div class="hw-toast-content"><strong>Reference number</strong><p>Your reference number is 2041.</p></div></article>
    <article class="hw-toast" data-hw-toast="info" data-tone="info"><div class="hw-toast-content"><strong>Review in progress</strong><p>Your request is being reviewed.</p></div></article>
    <article class="hw-toast" data-hw-toast="success" data-tone="success"><div class="hw-toast-content"><strong>Request approved</strong><p>Your request was approved.</p></div></article>
    <article class="hw-toast" data-hw-toast="warning" data-tone="warning"><div class="hw-toast-content"><strong>Documents missing</strong><p>Attach the supporting documents before you submit.</p></div></article>
    <article class="hw-toast" data-hw-toast="danger" data-tone="danger"><div class="hw-toast-content"><strong>Request rejected</strong><p>Your request was rejected. Read the reason and submit a new request.</p></div></article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive"></div>
</section>
```

```tsx live example=tones
<ToastRegion
  label="Notices"
  position="inline"
  messages={[
    { id: 'neutral', title: 'Reference number', message: 'Your reference number is 2041.', tone: 'neutral' },
    { id: 'info', title: 'Review in progress', message: 'Your request is being reviewed.', tone: 'info' },
    { id: 'success', title: 'Request approved', message: 'Your request was approved.', tone: 'success' },
    { id: 'warning', title: 'Documents missing', message: 'Attach the supporting documents before you submit.', tone: 'warning' },
    { id: 'danger', title: 'Request rejected', message: 'Your request was rejected. Read the reason and submit a new request.', tone: 'danger' },
  ]}
/>
```

```vue live example=tones
<ToastRegion
  label="Notices"
  position="inline"
  :messages="[
    { id: 'neutral', title: 'Reference number', message: 'Your reference number is 2041.', tone: 'neutral' },
    { id: 'info', title: 'Review in progress', message: 'Your request is being reviewed.', tone: 'info' },
    { id: 'success', title: 'Request approved', message: 'Your request was approved.', tone: 'success' },
    { id: 'warning', title: 'Documents missing', message: 'Attach the supporting documents before you submit.', tone: 'warning' },
    { id: 'danger', title: 'Request rejected', message: 'Your request was rejected. Read the reason and submit a new request.', tone: 'danger' },
  ]"
/>
```

```ts live example=tones framework=angular
template: `<hw-toast-region
  label="Notices"
  position="inline"
  [messages]="[
    { id: 'neutral', title: 'Reference number', message: 'Your reference number is 2041.', tone: 'neutral' },
    { id: 'info', title: 'Review in progress', message: 'Your request is being reviewed.', tone: 'info' },
    { id: 'success', title: 'Request approved', message: 'Your request was approved.', tone: 'success' },
    { id: 'warning', title: 'Documents missing', message: 'Attach the supporting documents before you submit.', tone: 'warning' },
    { id: 'danger', title: 'Request rejected', message: 'Your request was rejected. Read the reason and submit a new request.', tone: 'danger' },
  ]"
/>`
```

### Dismissal

A message has a dismiss button only when the application listens for dismissal, and `getDismissLabel` names each button; in vanilla markup the application may instead write the `aria-label` of each button itself, and the controller keeps it. A message that is marked as not dismissible has no button. The region never removes a message from the application's list: the application removes it in its handler, and the region moves focus to a neighbouring action or to the region when the message that held focus leaves. The controller that `enhance()` creates hides the message that the reader dismissed and reports its id.

```html live example=dismissal static differences=toast-region-adapter-markup
<section class="hw-toast-region" tabindex="-1" aria-label="Notices" data-position="inline" data-hw="toast-region">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="saved" data-tone="success">
      <div class="hw-toast-content"><strong>Draft saved</strong><p>Your changes to the request were saved.</p></div>
      <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss Draft saved"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </article>
    <article class="hw-toast" data-hw-toast="documents" data-tone="warning">
      <div class="hw-toast-content"><strong>Documents needed</strong><p>Attach the supporting documents before you submit.</p></div>
      <button type="button" class="hw-button hw-toast-dismiss" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss Documents needed"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive"></div>
</section>
```

```tsx live example=dismissal
import { useState } from 'react';
import { ToastRegion } from '@hawiyah/react';

export default function Example() {
  const [messages, setMessages] = useState([
    { id: 'saved', title: 'Draft saved', message: 'Your changes to the request were saved.', tone: 'success' as const },
    { id: 'documents', title: 'Documents needed', message: 'Attach the supporting documents before you submit.', tone: 'warning' as const },
  ]);
  return (
    <ToastRegion
      label="Notices"
      position="inline"
      messages={messages}
      getDismissLabel={(message) => `Dismiss ${message.title}`}
      onDismiss={(id) => setMessages((current) => current.filter((message) => message.id !== id))}
    />
  );
}
```

```vue live example=dismissal
<script setup lang="ts">
import { ref } from 'vue';
import { ToastRegion } from '@hawiyah/vue';

const messages = ref([
  { id: 'saved', title: 'Draft saved', message: 'Your changes to the request were saved.', tone: 'success' as const },
  { id: 'documents', title: 'Documents needed', message: 'Attach the supporting documents before you submit.', tone: 'warning' as const },
]);

function remove(id: string) {
  messages.value = messages.value.filter((message) => message.id !== id);
}
</script>

<template>
  <ToastRegion
    label="Notices"
    position="inline"
    :messages="messages"
    :get-dismiss-label="(message) => `Dismiss ${message.title}`"
    @dismiss="remove"
  />
</template>
```

```ts live example=dismissal framework=angular
import { Component, signal } from '@angular/core';
import { HwToastRegionComponent, type HwToast } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwToastRegionComponent],
  template: `
    <hw-toast-region
      label="Notices"
      position="inline"
      [messages]="messages()"
      [getDismissLabel]="dismissLabel"
      (dismissed)="remove($event)"
    />
  `,
})
export class ExampleComponent {
  readonly messages = signal<HwToast[]>([
    { id: 'saved', title: 'Draft saved', message: 'Your changes to the request were saved.', tone: 'success' },
    { id: 'documents', title: 'Documents needed', message: 'Attach the supporting documents before you submit.', tone: 'warning' },
  ]);

  readonly dismissLabel = (message: HwToast): string => `Dismiss ${message.title}`;

  remove(id: string): void {
    this.messages.update((current) => current.filter((message) => message.id !== id));
  }
}
```

### Banner

`variant="banner"` gives each message an icon region and the banner styling. The inline position keeps the banner in the page flow, and without it the banner is fixed to the window near its top end corner.

```html live example=banner static
<section class="hw-toast-region" tabindex="-1" aria-label="Notices" data-variant="banner" data-position="inline">
  <div role="status" aria-live="polite" aria-relevant="additions text" data-hw-live="polite">
    <article class="hw-toast" data-hw-toast="maintenance" data-tone="info">
      <span class="hw-toast-icon" aria-hidden="true"></span>
      <div class="hw-toast-content"><strong>Scheduled maintenance</strong><p>Requests cannot be submitted on Friday between 01:00 and 03:00.</p></div>
    </article>
  </div>
  <div role="alert" aria-live="assertive" aria-relevant="additions text" data-hw-live="assertive"></div>
</section>
```

```tsx live example=banner
<ToastRegion
  label="Notices"
  variant="banner"
  position="inline"
  messages={[
    { id: 'maintenance', title: 'Scheduled maintenance', message: 'Requests cannot be submitted on Friday between 01:00 and 03:00.', tone: 'info' },
  ]}
/>
```

```vue live example=banner
<ToastRegion
  label="Notices"
  variant="banner"
  position="inline"
  :messages="[
    { id: 'maintenance', title: 'Scheduled maintenance', message: 'Requests cannot be submitted on Friday between 01:00 and 03:00.', tone: 'info' },
  ]"
/>
```

```ts live example=banner framework=angular
template: `<hw-toast-region
  label="Notices"
  variant="banner"
  position="inline"
  [messages]="[
    { id: 'maintenance', title: 'Scheduled maintenance', message: 'Requests cannot be submitted on Friday between 01:00 and 03:00.', tone: 'info' },
  ]"
/>`
```

## API

### JavaScript

Table: Options of createToastRegion

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'inline' \| 'banner'` | `false` | — |
| `position` | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `label` | `string` | `false` | — |
| `getDismissLabel` | `(toast: HTMLElement) => string` | `false` | — |
| `onDismiss` | `(id: string) => void` | `false` | — |

`createToastRegion(root, options)` enhances a region that the application wrote; `enhance()` creates it for an element with `data-hw="toast-region"`. The controller returns `dismiss(target)`, which takes the id of a message or its element, and `destroy()`. The markup is the API: a `section` with the class `hw-toast-region`, a live region of polite messages and a live region of urgent messages, and in each an `article` with the class `hw-toast`, `data-hw-toast` set to the id of the message and `data-tone` set to its tone. The message is a `div` with the class `hw-toast-content` that holds an optional `strong` title and a paragraph. A dismiss button has the classes `hw-button` and `hw-toast-dismiss` and the attribute `data-hw-dismiss`, and the attribute `data-hw-dismissible` on the article, with the value false, keeps the message from being dismissed. `variant` and `position` are written as `data-variant` and `data-position` on the region, and the banner variant has a `span` with the class `hw-toast-icon` before the content. `label` is the accessible name of the region; it is required unless the markup is already named with `aria-label` or `aria-labelledby`, and the controller writes it only when the region has no name. `getDismissLabel` receives the message element and returns the name of its dismiss button, and it is required while a message can be dismissed and the button has no name of its own. The controller hides the dismissed message, dispatches an `hw:change` event whose detail holds the id of the dismissed message, calls `onDismiss` with the id and then, only if the dismissed message held focus, moves focus to a neighbouring action or to the region. The static blocks of this page that only display messages need no controller; a region needs `data-hw="toast-region"` only for dismissal and the check of its name.

### React

Table: Props of ToastRegion

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `messages` | `readonly ToastMessage[]` | `true` | — |
| `variant` | `'default' \| 'inline' \| 'banner'` | `false` | — |
| `position` | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |
| `onDismiss` | `(id: string) => void` | `false` | — |
| `getDismissLabel` | `(message: ToastMessage) => string` | `false` | — |

Each `ToastMessage` has a required `id` and `message`, an optional `title`, a `tone` of `neutral`, `info`, `success`, `warning` or `danger`, `urgent` and `dismissible`. The `message` is renderable content that renders in a paragraph, and a message without a `tone` is `info`. The region needs a name from `label`, `aria-label` or `aria-labelledby`. Dismiss buttons appear only when `onDismiss` is given, and then `getDismissLabel` is required. A message with `dismissible` set to `false` has no button. `onDismiss` receives the id; the region does not remove the message, so remove it from `messages` in the handler. The region moves focus after the application accepts the removal, and it respects a message that the application keeps or a focus that the application moves.

### Vue

Table: Props, events and slots of ToastRegion

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `messages` | prop | `readonly ToastMessage[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `getDismissLabel` | prop | `(message: ToastMessage) => string` | `false` | — |
| `variant` | prop | `'default' \| 'inline' \| 'banner'` | `false` | — |
| `position` | prop | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `onDismiss` | prop | `ToastDismissHandler \| ToastDismissHandler[]` | `false` | — |
| `onDismissOnce` | prop | `ToastDismissHandler \| ToastDismissHandler[]` | `false` | — |

The fields of a message are an `id` and a `message`, which are required, and an optional `title`, `tone`, `urgent` and `dismissible`. The region needs a name from `label`. A dismiss button appears when the application listens for dismissal with a v-on listener, and then `getDismissLabel` is required; a message with `dismissible` set to `false` has no button. The listener receives the id of the message, and the application removes the message from `messages`. The table lists `onDismiss` and `onDismissOnce` as props because the published declaration types the listeners that way. A listener of the once kind shows the buttons until its first call and then removes them, unless `onDismiss` also listens. The component declares no slots.

### Angular

Table: Inputs, outputs and content of hw-toast-region

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `variant` | input | `'default' \| 'inline' \| 'banner'` | `false` | `'default'` |
| `position` | input | `'inline' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `false` | — |
| `label` | input | `string` | `true` | — |
| `messages` | input | `readonly HwToast[]` | `false` | `[]` |
| `getDismissLabel` | input | `(message: HwToast) => string` | `false` | — |
| `dismissed` | output | `string` | `false` | — |

`HwToastRegionComponent` applies to `hw-toast-region`. `label` names the region and is required. Each `HwToast` in `messages` has an `id` and a `message`, and optionally a `title`, a `tone`, `urgent` and `dismissible`. A message without a `tone` is `info`. Binding `(dismissed)` enables the dismiss buttons, and `dismissed` emits the id of the dismissed message; remove that message from `messages` in the handler. `getDismissLabel` names each button and is required while a message can be dismissed. A message with `dismissible` set to `false` has no button. The component renders no content projection.

## Accessibility

ToastRegion renders a `section` with the accessible name `label` and the tab index `-1`, so the application can move focus to it. Inside it, messages that are not urgent are in a live region with `role="status"`, which announces additions politely, and urgent messages are in a live region with `role="alert"`, which announces them at once. Reserve `urgent` for a message that the reader must hear immediately; the rest of the messages are announced without interrupting.

- Each message is an `article`. A message has no automatic expiry: it stays until the application removes it. Do not remove a message that the reader has not had time to read.
- A dismiss button holds an icon only, so its name comes from `getDismissLabel`. Write a name that includes the title of the message, such as "Dismiss Draft saved", so that several buttons differ.
- When a dismissed message held focus, the region moves focus to the next dismiss button, otherwise the previous one, otherwise the region itself, unless the application keeps the message or moves focus.
- A message that is not dismissible has no button, and the reader cannot remove it. Use it only for a notice that must stay.
- Colour is not the only signal: write the meaning of the message in its title or text.

Table: Keyboard interaction of ToastRegion

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus to the next or the previous focusable element, which leaves the region after its last dismiss button; the dismiss buttons are in the order of the messages. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused dismiss button, which requests the dismissal of its message. |

## RTL and localisation

ToastRegion has no built-in text. The label, the titles, the messages and the dismiss names are written by the application in the language of the page. The region follows the direction of the page and the packaged styles use logical properties, so the icon, the content and the dismiss button stand in reading order in Arabic and in English, and the corner positions `top-start`, `top-end`, `bottom-start` and `bottom-end` are logical: they follow the reading direction.

- Write the dismiss name in the language of the message. A name such as "Dismiss Draft saved" is built by `getDismissLabel`, so it follows the language of the application.
- Write numbers, times and reference numbers in the message with the numerals and the format of the page; the region does not change them.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of ToastRegion; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- ToastRegion is listed among the additional interaction components of the component scope in the [coverage notes](../coverage.md).
- The banner geometry, the tones, the announcement rules, the protected notice and the focus recovery after a dismissal are mapped in the [notification notes](../nic-notifications.md), with the source measurements and the adaptations.
