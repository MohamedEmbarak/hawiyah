# NotificationList

NotificationList shows the notifications of a person as a named section with a list of items. Each item has a title, an optional link, description and date, and a read or unread state; the application owns the data and every action.

## Example

A visible heading names the section. An unread item shows a badge with the text that the application supplies, so the state does not rest on colour, and the title is a link when the item has an address.

```html live example=basic
<section class="hw-notification-list" aria-labelledby="basic-title">
  <h2 id="basic-title">Notifications</h2>
  <ul>
    <li data-state="unread">
      <h3><a class="hw-link" href="/requests/1042">Request 1042 was updated</a></h3>
      <span class="hw-badge" data-tone="info">New</span>
      <p>A reviewer asked for one more document.</p>
      <time datetime="2026-03-04T09:00:00+03:00">4 March 2026</time>
    </li>
    <li data-state="read">
      <h3>Request 1042 was received</h3>
      <p>The request is waiting for review.</p>
      <time datetime="2026-03-02T14:30:00+03:00">2 March 2026</time>
    </li>
  </ul>
</section>
```

```tsx live example=basic
<NotificationList
  label="Notifications"
  unreadLabel="New"
  emptyMessage="No notifications."
  items={[
    {
      id: 'updated',
      title: 'Request 1042 was updated',
      href: '/requests/1042',
      description: 'A reviewer asked for one more document.',
      dateTime: '2026-03-04T09:00:00+03:00',
      dateLabel: '4 March 2026',
    },
    {
      id: 'received',
      title: 'Request 1042 was received',
      description: 'The request is waiting for review.',
      dateTime: '2026-03-02T14:30:00+03:00',
      dateLabel: '2 March 2026',
      read: true,
    },
  ]}
/>
```

```vue live example=basic
<NotificationList
  label="Notifications"
  unread-label="New"
  empty-message="No notifications."
  :items="[
    {
      id: 'updated',
      title: 'Request 1042 was updated',
      href: '/requests/1042',
      description: 'A reviewer asked for one more document.',
      dateTime: '2026-03-04T09:00:00+03:00',
      dateLabel: '4 March 2026',
    },
    {
      id: 'received',
      title: 'Request 1042 was received',
      description: 'The request is waiting for review.',
      dateTime: '2026-03-02T14:30:00+03:00',
      dateLabel: '2 March 2026',
      read: true,
    },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-notification-list
  label="Notifications"
  unreadLabel="New"
  emptyMessage="No notifications."
  [items]="[
    {
      id: 'updated',
      title: 'Request 1042 was updated',
      href: '/requests/1042',
      description: 'A reviewer asked for one more document.',
      dateTime: '2026-03-04T09:00:00+03:00',
      dateLabel: '4 March 2026',
    },
    {
      id: 'received',
      title: 'Request 1042 was received',
      description: 'The request is waiting for review.',
      dateTime: '2026-03-02T14:30:00+03:00',
      dateLabel: '2 March 2026',
      read: true,
    },
  ]"
/>`
```

## Variants and states

### Read and dismiss actions

The component renders an action only while the application supplies its handler. A handler for reading adds a text button to each unread item, and a handler for dismissal adds an icon button to each item. The application supplies the name of each button. The handlers in the examples are empty; an application updates its own list in its handler.

```html live example=actions
<section class="hw-notification-list" aria-labelledby="actions-title" tabindex="-1">
  <h2 id="actions-title">Messages</h2>
  <ul>
    <li data-state="unread">
      <h3>Payment received</h3>
      <span class="hw-badge" data-tone="info">Unread</span>
      <p>The fee for request 1042 was received.</p>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-mark-read>Mark as read: Payment received</button>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss: Payment received"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </li>
    <li data-state="read">
      <h3>Document accepted</h3>
      <button type="button" class="hw-button" data-variant="ghost" data-size="md" data-hw-dismiss aria-label="Dismiss: Document accepted"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
    </li>
  </ul>
</section>
```

```tsx live example=actions
<NotificationList
  label="Messages"
  unreadLabel="Unread"
  emptyMessage="No messages."
  items={[
    { id: 'payment', title: 'Payment received', description: 'The fee for request 1042 was received.' },
    { id: 'document', title: 'Document accepted', read: true },
  ]}
  onRead={() => undefined}
  getMarkReadLabel={(item) => 'Mark as read: ' + item.title}
  onDismiss={() => undefined}
  getDismissLabel={(item) => 'Dismiss: ' + item.title}
/>
```

```vue live example=actions
<NotificationList
  label="Messages"
  unread-label="Unread"
  empty-message="No messages."
  :items="[
    { id: 'payment', title: 'Payment received', description: 'The fee for request 1042 was received.' },
    { id: 'document', title: 'Document accepted', read: true },
  ]"
  :get-mark-read-label="(item) => 'Mark as read: ' + item.title"
  :get-dismiss-label="(item) => 'Dismiss: ' + item.title"
  @read="() => undefined"
  @dismiss="() => undefined"
/>
```

```ts live example=actions framework=angular
import { Component } from '@angular/core';
import { HwNotificationListComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwNotificationListComponent],
  template: `<hw-notification-list
    label="Messages"
    unreadLabel="Unread"
    emptyMessage="No messages."
    [items]="items"
    [getMarkReadLabel]="markReadLabel"
    [getDismissLabel]="dismissLabel"
    (read)="onRead($event)"
    (dismissed)="onDismissed($event)"
  />`,
})
export class ExampleComponent {
  items = [
    { id: 'payment', title: 'Payment received', description: 'The fee for request 1042 was received.' },
    { id: 'document', title: 'Document accepted', read: true },
  ];
  markReadLabel = (item: { title: string }) => 'Mark as read: ' + item.title;
  dismissLabel = (item: { title: string }) => 'Dismiss: ' + item.title;
  onRead(id: string) {}
  onDismissed(id: string) {}
}
```

### Without items

An empty list renders the message that the application supplies in place of the list.

```html live example=empty
<section class="hw-notification-list" aria-labelledby="empty-title">
  <h2 id="empty-title">Notifications</h2>
  <p>You have no notifications.</p>
</section>
```

```tsx live example=empty
<NotificationList label="Notifications" unreadLabel="New" emptyMessage="You have no notifications." items={[]} />
```

```vue live example=empty
<NotificationList label="Notifications" unread-label="New" empty-message="You have no notifications." :items="[]" />
```

```ts live example=empty framework=angular
template: `<hw-notification-list label="Notifications" unreadLabel="New" emptyMessage="You have no notifications." [items]="[]" />`
```

## API

### JavaScript

Table: Attributes of the hw-notification-list element

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `class` | `'hw-notification-list'` | `true` | — |
| `data-state` | `'read' \| 'unread'` | `false` | — |

NotificationList has no JavaScript controller. The markup is the API: write a `section` with the class `hw-notification-list`, labelled by a visible second-level heading through `aria-labelledby`, and a `ul` whose `li` elements carry `data-state` with `unread` or `read` and have no class. Each item holds a third-level heading with the title, which is a link with the class `hw-link` when the item has an address, a badge with the class `hw-badge` on an unread item, an optional paragraph, an optional `time` element and the action buttons. The actions are buttons that the application writes and handles: `data-hw-mark-read` marks the read button and `data-hw-dismiss` the dismiss button. Give the section a tabindex of -1 when actions are present, so that it can take the focus when the list becomes empty. Before the list changes after an action, call `prepareRemovalFocus` from `@hawiyah/core`, as the README of `@hawiyah/vanilla` describes, then change the list and run the function it returns to move the focus. An empty list is one paragraph in place of the `ul`.

### React

Table: Props of NotificationList

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly NotificationItem[]` | `true` | — |
| `emptyMessage` | `ReactNode` | `true` | — |
| `unreadLabel` | `string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `onRead` | `(id: string) => void` | `false` | — |
| `getMarkReadLabel` | `(item: NotificationItem) => string` | `false` | — |
| `onDismiss` | `(id: string) => void` | `false` | — |
| `getDismissLabel` | `(item: NotificationItem) => string` | `false` | — |

`items` is required, and each `NotificationItem` has a required `id` and `title` and the optional `description`, `href`, `dateTime`, `dateLabel` and `read`. An item is unread until `read` is `true`. `unreadLabel` is required: it is the visible text of the badge that an unread item shows. `emptyMessage` is required: it renders as a paragraph in place of the list. The heading comes from `label`; `aria-label` or `aria-labelledby` named on the component replace it, and `label` then renders a heading only when it is given. `dateLabel` is the visible date and `dateTime` its machine-readable value; an item without `dateLabel` shows no date. `description` renders in a paragraph, so it must be phrasing content. `onRead` and `onDismiss` receive the id of the item. `onRead` adds a text button on each unread item whose text is the string that `getMarkReadLabel` returns for the item, and `onDismiss` adds an icon button on each item named by the string that `getDismissLabel` returns for the item; the matching function is required once its handler is given. After an action the focus moves to the same control of the next item, else the previous one, else the section. The list is application state: the component removes nothing.

### Vue

Table: Props, events and slots of NotificationList

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly NotificationItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `emptyMessage` | prop | `string` | `true` | — |
| `unreadLabel` | prop | `string` | `true` | — |
| `getMarkReadLabel` | prop | `(item: NotificationItem) => string` | `false` | — |
| `getDismissLabel` | prop | `(item: NotificationItem) => string` | `false` | — |
| `onRead` | prop | `((id: string) => void) \| ((id: string) => void)[]` | `false` | — |
| `onDismiss` | prop | `((id: string) => void) \| ((id: string) => void)[]` | `false` | — |
| `<id>` | slot | — | `false` | — |

`items` is required, and each `NotificationItem` has a required `id` and `title` and the optional `description`, `href`, `dateTime`, `dateLabel` and `read`. An item is unread until `read` is `true`. `unreadLabel` and `emptyMessage` are required, as for the other adapters: the first is the visible text of the badge of an unread item, and the second renders in place of the list. `label` renders the visible heading; `aria-label` or `aria-labelledby` given on the component changes only the name of the section. The `onRead` listener adds a text button on each unread item whose text is the string that `getMarkReadLabel` returns for the item, and the `onDismiss` listener adds an icon button on each item named by the string that `getDismissLabel` returns for the item; the matching function is required once its listener is bound. The listeners receive the id of the item. A slot named by the `id` of an item adds its content to that item. After an action the focus moves to the same control of the next item, else the previous one, else the section, which has a tabindex of -1 while a listener is bound. The list is application state: the component removes nothing. The table lists the slot as `<id>` because its name is computed from the items; the declaration types no slot.

### Angular

Table: Inputs, outputs and content of hw-notification-list

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwNotification[]` | `false` | `[]` |
| `emptyMessage` | input | `string` | `true` | — |
| `unreadLabel` | input | `string` | `true` | — |
| `getDismissLabel` | input | `(item: HwNotification) => string` | `false` | — |
| `getMarkReadLabel` | input | `(item: HwNotification) => string` | `false` | — |
| `dismissed` | output | `string` | `false` | — |
| `read` | output | `string` | `false` | — |

`HwNotificationListComponent` applies to `hw-notification-list`. `items` is a list of `HwNotification` with a required `id` and `title` and the optional `description`, `href`, `dateTime`, `dateLabel` and `read`. `unreadLabel` and `emptyMessage` are required. `label` renders the visible heading that names the section; `aria-label` or `aria-labelledby` written on `hw-notification-list` name the section instead and need no heading. The `read` output emits the id of an item from a text button on each unread item whose text is the string that `getMarkReadLabel` returns for the item, and the `dismissed` output emits the id from an icon button named by `getDismissLabel`. Each button is rendered only while a listener is bound to its output, and the matching function is required then. After an action the focus moves to the same control of the next item, else the previous one, else the section, which has a tabindex of -1 while a listener is bound. The list is application state: the component removes nothing.

## Accessibility

NotificationList renders a `section` that is named by its visible second-level heading, and a list of items whose titles are third-level headings. The component is not a live region: it does not announce a notification that is added after the page loads. Announce an urgent message with an alert or a status message of the application, or with ToastRegion.

- The section is named by the heading that `label` renders, through `aria-labelledby`; with `aria-label` or `aria-labelledby` written on the component, that name is used and no heading is needed. Give one source of the name.
- An unread item shows a visible badge with the text of `unreadLabel`, so the state does not rest on colour. The `data-state` attribute on the item styles it and has no text of its own.
- A title with an address is a link with the class `hw-link`; without an address it is plain text. A date is a native `time` element, shown only when `dateLabel` is given.
- Each read button has the visible text from `getMarkReadLabel`, and each dismiss button is an icon button named by `getDismissLabel`. Write names that include the title of the item, such as "Dismiss: Payment received", because a list of buttons that all read "Dismiss" gives a reader no way to tell them apart.
- After an action the focus moves to the same control of the next item, else the previous one, else the section, so the reader is not left on a removed control. The section has a tabindex of -1 while an action is bound, so that it can take the focus when the list becomes empty.
- Place the section below a first-level heading of the page, since its own heading is second level.

## RTL and localisation

NotificationList has no built-in text. The heading, the titles, the descriptions, the dates, the unread text, the empty message and the names of the buttons are all written by the application in the language of the page. The section follows the page direction through logical properties, so the content starts at the reading start in Arabic and in English.

- `dateLabel` is text written by the application, so it controls the language, the calendar and the numerals of the visible date; `dateTime` stays a machine-readable value in the formats of HTML.
- The dismiss button holds an icon that has no direction of its own and no text; its name comes from `getDismissLabel`, in the language of the page.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of NotificationList; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- NotificationList is listed among the platform patterns of the component scope in the [coverage notes](../coverage.md).
- The [notification notes](../nic-notifications.md) measure the banner and the dialog of the supplied Platforms Code files, not NotificationList. Their row on dismissal and focus records the order that NotificationList follows after an action: a following control, a preceding control, then the labelled region.
