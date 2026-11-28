# Stepper

Stepper is an ordered list that shows which stages of a process are complete, which one is current and which are still to come. It is a static indicator of progress, not navigation; the application owns the progress.

## Example

The list has a name, and the current step carries `aria-current="step"`. Complete and upcoming steps carry visually hidden state text, so the state does not depend on colour or on the mark.

```html live example=basic static differences=stepper-adapter-markup
<ol class="hw-stepper" data-hw="stepper" aria-label="Request progress" data-active-index="1" data-hw-complete-label="Completed" data-hw-upcoming-label="Not started">
  <li class="hw-step"><span>Applicant details</span></li>
  <li class="hw-step"><span>Documents</span></li>
  <li class="hw-step"><span>Review</span></li>
  <li class="hw-step"><span>Submission</span></li>
</ol>
```

```tsx live example=basic
<Stepper
  label="Request progress"
  activeIndex={1}
  completeLabel="Completed"
  upcomingLabel="Not started"
  items={[
    { value: 'details', label: 'Applicant details' },
    { value: 'documents', label: 'Documents' },
    { value: 'review', label: 'Review' },
    { value: 'submission', label: 'Submission' },
  ]}
/>
```

```vue live example=basic
<Stepper
  label="Request progress"
  :active-index="1"
  complete-label="Completed"
  upcoming-label="Not started"
  :items="[
    { value: 'details', label: 'Applicant details' },
    { value: 'documents', label: 'Documents' },
    { value: 'review', label: 'Review' },
    { value: 'submission', label: 'Submission' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-stepper
  label="Request progress"
  [activeIndex]="1"
  completeLabel="Completed"
  upcomingLabel="Not started"
  [items]="[
    { value: 'details', label: 'Applicant details' },
    { value: 'documents', label: 'Documents' },
    { value: 'review', label: 'Review' },
    { value: 'submission', label: 'Submission' },
  ]"
/>`
```

## Variants and states

An `activeIndex` of -1 means that the process has not started, so every step is upcoming.

### Descriptions

An item may carry a description, which is shown below its label as a hint.

```html live example=description static differences=stepper-adapter-markup
<ol class="hw-stepper" data-hw="stepper" aria-label="Request progress" data-active-index="0" data-hw-complete-label="Completed" data-hw-upcoming-label="Not started">
  <li class="hw-step"><span>Applicant details</span><p class="hw-hint">Name and contact information.</p></li>
  <li class="hw-step"><span>Documents</span><p class="hw-hint">Supporting documents of the request.</p></li>
  <li class="hw-step"><span>Review</span><p class="hw-hint">Check the answers before sending.</p></li>
</ol>
```

```tsx live example=description
<Stepper
  label="Request progress"
  current="details"
  completeLabel="Completed"
  upcomingLabel="Not started"
  items={[
    { value: 'details', label: 'Applicant details', description: 'Name and contact information.' },
    { value: 'documents', label: 'Documents', description: 'Supporting documents of the request.' },
    { value: 'review', label: 'Review', description: 'Check the answers before sending.' },
  ]}
/>
```

```vue live example=description
<Stepper
  label="Request progress"
  current="details"
  complete-label="Completed"
  upcoming-label="Not started"
  :items="[
    { value: 'details', label: 'Applicant details', description: 'Name and contact information.' },
    { value: 'documents', label: 'Documents', description: 'Supporting documents of the request.' },
    { value: 'review', label: 'Review', description: 'Check the answers before sending.' },
  ]"
/>
```

```ts live example=description framework=angular
template: `<hw-stepper
  label="Request progress"
  current="details"
  completeLabel="Completed"
  upcomingLabel="Not started"
  [items]="[
    { value: 'details', label: 'Applicant details', description: 'Name and contact information.' },
    { value: 'documents', label: 'Documents', description: 'Supporting documents of the request.' },
    { value: 'review', label: 'Review', description: 'Check the answers before sending.' },
  ]"
/>`
```

### All steps complete

An `activeIndex` equal to the number of items marks every step complete, and no step is current.

```html live example=complete static differences=stepper-adapter-markup
<ol class="hw-stepper" data-hw="stepper" aria-label="Request progress" data-active-index="3" data-hw-complete-label="Completed" data-hw-upcoming-label="Not started">
  <li class="hw-step"><span>Applicant details</span></li>
  <li class="hw-step"><span>Documents</span></li>
  <li class="hw-step"><span>Submission</span></li>
</ol>
```

```tsx live example=complete
<Stepper
  label="Request progress"
  activeIndex={3}
  completeLabel="Completed"
  upcomingLabel="Not started"
  items={[
    { value: 'details', label: 'Applicant details' },
    { value: 'documents', label: 'Documents' },
    { value: 'submission', label: 'Submission' },
  ]}
/>
```

```vue live example=complete
<Stepper
  label="Request progress"
  :active-index="3"
  complete-label="Completed"
  upcoming-label="Not started"
  :items="[
    { value: 'details', label: 'Applicant details' },
    { value: 'documents', label: 'Documents' },
    { value: 'submission', label: 'Submission' },
  ]"
/>
```

```ts live example=complete framework=angular
template: `<hw-stepper
  label="Request progress"
  [activeIndex]="3"
  completeLabel="Completed"
  upcomingLabel="Not started"
  [items]="[
    { value: 'details', label: 'Applicant details' },
    { value: 'documents', label: 'Documents' },
    { value: 'submission', label: 'Submission' },
  ]"
/>`
```

## API

### JavaScript

Table: Options of createStepper

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `activeIndex` | `number` | `false` | — |
| `label` | `string` | `false` | — |
| `completeLabel` | `string` | `false` | — |
| `upcomingLabel` | `string` | `false` | — |

Stepper has no stylesheet-only form that tracks state: write an `ol` element with the class `hw-stepper` and `data-hw="stepper"`, and a `li` element with the class `hw-step` for each step, holding a `span` with the label and, where needed, a `p` with the class `hw-hint` for the description. `createStepper` sets the state of each step, from an explicit `data-status` of complete, current or upcoming on the step, which takes precedence over the index, otherwise from the index, which is complete, current or upcoming, in `data-state`, sets `aria-current="step"` on the current step and writes the index it uses in `data-active-index` on the list. `activeIndex` is zero-based; -1 means that the process has not started, and a number equal to the count of steps means that all are complete. A value that is not an integer in that range is treated as -1. Without `activeIndex`, the controller reads `data-active-index` from the list, then the step that has `aria-current="step"` or a `data-state` of `current` or `active`. `completeLabel` and `upcomingLabel` are required text for the steps that need it; they are options, or the attributes of the list for the complete label and the upcoming label, and the controller writes them as a visually hidden `span` with the attribute `data-hw-step-status` after the label of each complete and each upcoming step, never on the current step. `label` names the list. The options publish no default in 0.3.0. The returned controller has `activeIndex`, `setActiveIndex(index)`, `refresh()` and `destroy()`.

### React

Table: Props of Stepper

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | `readonly StepItem[]` | `true` | — |
| `current` | `string` | `false` | — |
| `activeIndex` | `number` | `false` | — |
| `completeLabel` | `string` | `true` | — |
| `upcomingLabel` | `string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

`items` is the list of steps; each `StepItem` has a `value`, a `label`, an optional `description` and an optional `status` that is one of current, complete and upcoming. `current` is the `value` of the current step. `activeIndex` takes precedence over `current`: steps before it are complete, the step at it is current, and later steps are upcoming. An explicit `status` of an item takes precedence over both. With neither `current` nor `activeIndex`, no step is current. `completeLabel` and `upcomingLabel` are required, and the list needs a name from `label`, `aria-label` or `aria-labelledby`. The other props of a native `ol` element reach the list.

### Vue

Table: Props, events and slots of Stepper

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly StepItem[]` | `true` | — |
| `current` | prop | `string` | `false` | — |
| `activeIndex` | prop | `number` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `completeLabel` | prop | `string` | `true` | — |
| `upcomingLabel` | prop | `string` | `true` | — |

`items`, `current` and `activeIndex` behave as in React; the `label` of an item is a string. `label` names the list, and `completeLabel` and `upcomingLabel` are required. The table lists no slot and no event because the build reads none.

### Angular

Table: Inputs, outputs and content of hw-stepper

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwStep[]` | `false` | `[]` |
| `current` | input | `string` | `false` | — |
| `activeIndex` | input | `number` | `false` | — |
| `completeLabel` | input | `string` | `true` | — |
| `upcomingLabel` | input | `string` | `true` | — |

`HwStepperComponent` (`hw-stepper`) renders the `ol` element. `items`, `current` and `activeIndex` behave as in React, and `items` is empty by default. The list needs a `label`, or `aria-label` or `aria-labelledby` written on `hw-stepper`; `completeLabel` and `upcomingLabel` are required. The component has no output because the stepper is not interactive.

## Accessibility

Stepper is a native ordered list that is named by `label`, `aria-label` or `aria-labelledby`; the component has no default name. The current step carries `aria-current="step"`. A complete step and an upcoming step carry the required state text, as a visually hidden element after the label of the step, so that the state does not depend on the mark or the colour. The current step has no state text, because `aria-current="step"` exposes it. Do not write the state into the label of a step.

Table: Keyboard interaction of Stepper

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus past the list to the next control of the page, because the steps are not interactive. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus past the list to the previous control of the page. |

- Stepper adds no buttons, tab stops or navigation between steps. The application decides when a step is complete, and a change of `current` or `activeIndex` updates the previous and current states in either direction; no step advances by itself.
- The states complete and upcoming are exposed by text, and the current state by `aria-current`. Keep explicit statuses coherent, with at most one current step.
- The decorative ring and the mobile summary that the stylesheet offers with `hw-stepper-responsive` and `hw-stepper-ring` need an accessible label of the current and the total step, written by the application.

## RTL and localisation

Stepper has no built-in text: the name of the list, the labels of the steps, the descriptions and the two state texts are written by the application in the language of the page. The list inherits the language and the direction of the page, and the packaged styles use logical properties, so the steps follow the reading direction. Values in `value` are identifiers and are not shown.

- The state texts are separate strings for the two states, so that each language can phrase them as it needs; they are not appended to the label by the application.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Stepper; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- Stepper is listed among the initial interaction and navigation components in the [coverage notes](../coverage.md). The [stepper notes](../stepper-states.md) are an API and styling note, not a mapping of supplied Platforms Code files; they describe the ordered list with `aria-current="step"`, the visually hidden state text, the three state values and the precedence of `activeIndex`, `current` and an explicit status.
- The [stepper notes](../stepper-states.md) state that Stepper adds no buttons, tab stops or step navigation, and that the application owns progress. Journey navigation and validation are not part of the component; they remain with the application.
