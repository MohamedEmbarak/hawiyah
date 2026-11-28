# Carousel

Carousel shows one slide of a short sequence at a time and lets the reader move between the slides with previous and next controls and with one indicator for each slide. Navigation is manual, there is no autoplay, and the current position is announced politely.

## Example

The region has a name, each slide has a name built from its position, and the two arrows and the indicators have accessible names. The application supplies every one of these texts, because the component has none of its own.

```html live example=basic static differences=carousel-adapter-markup
<section class="hw-carousel" data-hw="carousel" aria-label="Steps of a service request" data-hw-slide-label="Step {position} of {total}" data-hw-empty-label="No steps to show">
  <div class="hw-carousel-viewport hw-carousel-slides">
    <div class="hw-carousel-track">
      <div class="hw-carousel-slide" data-hw-slide><h3>Submit the request</h3><p>Complete the form and attach the documents that the request asks for.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>Review</h3><p>The request is checked, and a message asks for any missing document.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>Decision</h3><p>The decision is sent in a message that quotes the reference number.</p></div>
    </div>
  </div>
  <div class="hw-carousel-controls hw-inline">
    <div class="hw-carousel-pagination" role="group" aria-label="Choose a step">
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="0"></button>
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="1"></button>
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="2"></button>
    </div>
    <div class="hw-carousel-arrows">
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-previous aria-label="Previous step"></button>
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-next aria-label="Next step"></button>
    </div>
    <span class="hw-carousel-status hw-sr-only" data-hw-carousel-status></span>
  </div>
</section>
```

```tsx live example=basic
<Carousel
  label="Steps of a service request"
  previousLabel="Previous step"
  nextLabel="Next step"
  indicatorsLabel="Choose a step"
  emptyLabel="No steps to show"
  getSlideLabel={(position, total) => `Step ${position} of ${total}`}
  slides={[
    <><h3>Submit the request</h3><p>Complete the form and attach the documents that the request asks for.</p></>,
    <><h3>Review</h3><p>The request is checked, and a message asks for any missing document.</p></>,
    <><h3>Decision</h3><p>The decision is sent in a message that quotes the reference number.</p></>,
  ]}
/>
```

```vue live example=basic
<Carousel
  label="Steps of a service request"
  previous-label="Previous step"
  next-label="Next step"
  indicators-label="Choose a step"
  empty-label="No steps to show"
  :get-slide-label="(position, total) => `Step ${position} of ${total}`"
  :wrap="false"
  :slides="[{ id: 'submit' }, { id: 'review' }, { id: 'decision' }]"
>
  <template #submit><h3>Submit the request</h3><p>Complete the form and attach the documents that the request asks for.</p></template>
  <template #review><h3>Review</h3><p>The request is checked, and a message asks for any missing document.</p></template>
  <template #decision><h3>Decision</h3><p>The decision is sent in a message that quotes the reference number.</p></template>
</Carousel>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwCarouselComponent, HwSlide } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwCarouselComponent],
  template: `<hw-carousel
    label="Steps of a service request"
    previousLabel="Previous step"
    nextLabel="Next step"
    indicatorsLabel="Choose a step"
    emptyLabel="No steps to show"
    [getSlideLabel]="slideLabel"
    [slides]="slides"
  />`,
})
export class BasicExample {
  slideLabel = (position: number, total: number) => `Step ${position} of ${total}`;
  slides: HwSlide[] = [
    { title: 'Submit the request', content: 'Complete the form and attach the documents that the request asks for.' },
    { title: 'Review', content: 'The request is checked, and a message asks for any missing document.' },
    { title: 'Decision', content: 'The decision is sent in a message that quotes the reference number.' },
  ];
}
```

## Variants and states

### Looping

With looping, the next arrow on the last slide leads to the first slide and the previous arrow on the first slide leads to the last. Without it, the arrow at a bound keeps focus and ignores activation. React, Angular and the JavaScript controller call the option `loop`; Vue calls it `wrap`.

```html live example=loop static differences=carousel-adapter-markup
<section class="hw-carousel" data-hw="carousel" data-hw-loop="true" aria-label="Notices about a document" data-hw-slide-label="Notice {position} of {total}" data-hw-empty-label="No notices to show">
  <div class="hw-carousel-viewport hw-carousel-slides">
    <div class="hw-carousel-track">
      <div class="hw-carousel-slide" data-hw-slide><h3>Document received</h3><p>The document is registered on your record.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>Document checked</h3><p>The document is under review.</p></div>
    </div>
  </div>
  <div class="hw-carousel-controls hw-inline">
    <div class="hw-carousel-pagination" role="group" aria-label="Choose a notice">
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="0"></button>
      <button class="hw-carousel-dot" type="button" data-hw-carousel-dot="1"></button>
    </div>
    <div class="hw-carousel-arrows">
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-previous aria-label="Previous notice"></button>
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-next aria-label="Next notice"></button>
    </div>
    <span class="hw-carousel-status hw-sr-only" data-hw-carousel-status></span>
  </div>
</section>
```

```tsx live example=loop
<Carousel
  label="Notices about a document"
  previousLabel="Previous notice"
  nextLabel="Next notice"
  indicatorsLabel="Choose a notice"
  emptyLabel="No notices to show"
  getSlideLabel={(position, total) => `Notice ${position} of ${total}`}
  loop
  slides={[
    <><h3>Document received</h3><p>The document is registered on your record.</p></>,
    <><h3>Document checked</h3><p>The document is under review.</p></>,
  ]}
/>
```

```vue live example=loop
<Carousel
  label="Notices about a document"
  previous-label="Previous notice"
  next-label="Next notice"
  indicators-label="Choose a notice"
  empty-label="No notices to show"
  :get-slide-label="(position, total) => `Notice ${position} of ${total}`"
  :wrap="true"
  :slides="[{ id: 'received' }, { id: 'checked' }]"
>
  <template #received><h3>Document received</h3><p>The document is registered on your record.</p></template>
  <template #checked><h3>Document checked</h3><p>The document is under review.</p></template>
</Carousel>
```

```ts live example=loop framework=angular
import { Component } from '@angular/core';
import { HwCarouselComponent, HwSlide } from '@hawiyah/angular';

@Component({
  selector: 'app-loop-example',
  imports: [HwCarouselComponent],
  template: `<hw-carousel
    label="Notices about a document"
    previousLabel="Previous notice"
    nextLabel="Next notice"
    indicatorsLabel="Choose a notice"
    emptyLabel="No notices to show"
    [getSlideLabel]="slideLabel"
    [loop]="true"
    [slides]="slides"
  />`,
})
export class LoopExample {
  slideLabel = (position: number, total: number) => `Notice ${position} of ${total}`;
  slides: HwSlide[] = [
    { title: 'Document received', content: 'The document is registered on your record.' },
    { title: 'Document checked', content: 'The document is under review.' },
  ];
}
```

### Without indicators

Without the indicator group the arrows are the only controls, and the name of the group is not needed. The framework adapters remove the group when the indicators are switched off, and the hand-written markup leaves it out.

```html live example=no-indicators static differences=carousel-adapter-markup
<section class="hw-carousel" data-hw="carousel" aria-label="Guidance for a profile update" data-hw-slide-label="Page {position} of {total}" data-hw-empty-label="No guidance to show">
  <div class="hw-carousel-viewport hw-carousel-slides">
    <div class="hw-carousel-track">
      <div class="hw-carousel-slide" data-hw-slide><h3>Before you start</h3><p>Keep your current contact details at hand.</p></div>
      <div class="hw-carousel-slide" data-hw-slide><h3>After you save</h3><p>The new details apply to later messages.</p></div>
    </div>
  </div>
  <div class="hw-carousel-controls hw-inline">
    <div class="hw-carousel-arrows">
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-previous aria-label="Previous page"></button>
      <button class="hw-button hw-carousel-arrow" type="button" data-variant="secondary" data-size="md" data-hw-next aria-label="Next page"></button>
    </div>
    <span class="hw-carousel-status hw-sr-only" data-hw-carousel-status></span>
  </div>
</section>
```

```tsx live example=no-indicators
<Carousel
  label="Guidance for a profile update"
  previousLabel="Previous page"
  nextLabel="Next page"
  emptyLabel="No guidance to show"
  getSlideLabel={(position, total) => `Page ${position} of ${total}`}
  showIndicators={false}
  slides={[
    <><h3>Before you start</h3><p>Keep your current contact details at hand.</p></>,
    <><h3>After you save</h3><p>The new details apply to later messages.</p></>,
  ]}
/>
```

```vue live example=no-indicators
<Carousel
  label="Guidance for a profile update"
  previous-label="Previous page"
  next-label="Next page"
  empty-label="No guidance to show"
  :get-slide-label="(position, total) => `Page ${position} of ${total}`"
  :show-indicators="false"
  :wrap="false"
  :slides="[{ id: 'before' }, { id: 'after' }]"
>
  <template #before><h3>Before you start</h3><p>Keep your current contact details at hand.</p></template>
  <template #after><h3>After you save</h3><p>The new details apply to later messages.</p></template>
</Carousel>
```

```ts live example=no-indicators framework=angular
import { Component } from '@angular/core';
import { HwCarouselComponent, HwSlide } from '@hawiyah/angular';

@Component({
  selector: 'app-no-indicators-example',
  imports: [HwCarouselComponent],
  template: `<hw-carousel
    label="Guidance for a profile update"
    previousLabel="Previous page"
    nextLabel="Next page"
    emptyLabel="No guidance to show"
    [getSlideLabel]="slideLabel"
    [showIndicators]="false"
    [slides]="slides"
  />`,
})
export class NoIndicatorsExample {
  slideLabel = (position: number, total: number) => `Page ${position} of ${total}`;
  slides: HwSlide[] = [
    { title: 'Before you start', content: 'Keep your current contact details at hand.' },
    { title: 'After you save', content: 'The new details apply to later messages.' },
  ];
}
```

## API

### JavaScript

Table: Options of createCarousel

| Option | Type | Required | Default |
| --- | --- | --- | --- |
| `index` | `number` | `false` | — |
| `loop` | `boolean` | `false` | — |
| `onValueChange` | `(index: number) => void` | `false` | — |
| `label` | `string` | `false` | — |
| `getSlideLabel` | `(position: number, total: number) => string` | `false` | — |
| `emptyLabel` | `string` | `false` | — |
| `carouselDescription` | `string` | `false` | — |
| `slideDescription` | `string` | `false` | — |

`createCarousel(root, options)` reads authored markup: the slides carry `data-hw-slide`, the arrows `data-hw-previous` and `data-hw-next`, the indicators `data-hw-carousel-dot` with a zero-based position, the status element `data-hw-carousel-status`, and the track the class `hw-carousel-track`. The controller returns `index`, `select(index)`, `previous()`, `next()` and `destroy()`; `select` floors the value and clamps it, or wraps it with `loop`, and does nothing for the current position. `onValueChange` receives the new zero-based index. `index` sets the initial slide, and `loop` is also read from `data-hw-loop` on the root. `label`, `getSlideLabel` and `emptyLabel` are required text; `carouselDescription` and `slideDescription` are optional. `getSlideLabel` is the one-based function that names each slide and each indicator and is the polite status. In markup the root can carry its text as attributes named after the options, and `data-hw-slide-label` holds the slide name as a template in which {position} and {total} stand for the numbers; the examples write the region name as `aria-label`. Each slide and each indicator without an authored `aria-label` takes the name that `getSlideLabel` returns; an authored `aria-label` is kept. At the first or last slide of a carousel that does not loop, the arrow has `aria-disabled="true"`, keeps focus and ignores activation. Destroy and recreate the controller when the application replaces the slides.

### React

Table: Props of Carousel

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `slides` | `readonly ReactNode[]` | `true` | — |
| `index` | `number` | `false` | — |
| `defaultIndex` | `number` | `false` | `0` |
| `onIndexChange` | `(index: number) => void` | `false` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `getSlideLabel` | `(position: number, total: number) => string` | `true` | — |
| `loop` | `boolean` | `false` | `false` |
| `emptyLabel` | `string` | `true` | — |
| `carouselDescription` | `string` | `false` | — |
| `slideDescription` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |
| `showIndicators` | `boolean` | `false` | `true` |
| `indicatorsLabel` | `string` | `false` | — |

`slides` holds renderable content, one entry for each slide, and every slide stays mounted, so the state of its content is kept. Use `index` with `onIndexChange` for a controlled carousel, or `defaultIndex` for an uncontrolled one; the callback is not called for the current position. `previousLabel`, `nextLabel`, `emptyLabel` and `getSlideLabel` are required, and `getSlideLabel` receives a one-based position and returns the whole name of the slide. The region needs `label`, or `aria-label` or `aria-labelledby`. `indicatorsLabel` is required while `showIndicators` is on. `carouselDescription` and `slideDescription` write `aria-roledescription` only when they are given. `loop` is `false` by default, so at the first or last slide the arrow has `aria-disabled="true"`, keeps focus and ignores activation; both arrows are disabled when there are fewer than two slides.

### Vue

Table: Props, events and slots of Carousel

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `slides` | prop | `readonly CarouselSlide[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `modelValue` | prop | `number` | `false` | — |
| `defaultValue` | prop | `number` | `false` | `0` |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `showIndicators` | prop | `boolean` | `false` | `true` |
| `indicatorsLabel` | prop | `string` | `false` | — |
| `emptyLabel` | prop | `string` | `true` | — |
| `carouselDescription` | prop | `string` | `false` | — |
| `slideDescription` | prop | `string` | `false` | — |
| `getSlideLabel` | prop | `(position: number, total: number) => string` | `true` | — |
| `wrap` | prop | `boolean` | `false` | `true` |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |
| `<id>` | slot | — | `false` | — |

Each entry of `slides` has an `id` and an optional `content`, and a slot named after the `id` fills that slide; the table writes the pattern as `<id>`. `v-model` binds the zero-based position and `defaultValue` sets the initial one. `wrap` has the default `true`, unlike the looping option of the other adapters, so write `:wrap="false"` for a carousel that stops at its bounds, as the Vue blocks of the basic and no-indicators examples do. Without wrapping, the arrow at the first or last slide has `aria-disabled="true"`, keeps focus and ignores activation. `previousLabel`, `nextLabel`, `emptyLabel` and `getSlideLabel` are required, `label` names the region, and `indicatorsLabel` is required while `showIndicators` is on.

### Angular

Table: Inputs, outputs and content of hw-carousel

| Name | Kind | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `slides` | input | `readonly HwSlide[]` | `false` | `[]` |
| `slideTemplate` | input | `TemplateRef<{ $implicit: HwSlide; index: number }>` | `false` | — |
| `current` | input | `number` | `false` | `0` |
| `loop` | input | `boolean` | `false` | `false` |
| `showIndicators` | input | `boolean` | `false` | `true` |
| `indicatorsLabel` | input | `string` | `false` | `''` |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `emptyLabel` | input | `string` | `true` | — |
| `carouselDescription` | input | `string` | `false` | `''` |
| `slideDescription` | input | `string` | `false` | `''` |
| `getSlideLabel` | input | `(position: number, total: number) => string` | `true` | — |
| `currentChange` | output | `number` | `false` | — |

`HwCarouselComponent` applies to `hw-carousel`. Each `HwSlide` has the optional fields `id`, `title`, `content`, `src` and `alt`; without `slideTemplate` the slide renders the image, a third-level heading and a paragraph from them. `slideTemplate` takes a template whose context holds the slide as the implicit value and its position. Bind `[(current)]` for the zero-based position; `currentChange` is not emitted for the current position. The region needs `label`, or `aria-label` or `aria-labelledby` written on `hw-carousel`; `aria-describedby` reaches the region too. `getSlideLabel` is a function input that receives a one-based position and returns the whole name of the slide; the examples define it in the class. `loop` is `false` by default, so the arrow at a bound has `aria-disabled="true"`, keeps focus and ignores activation.

## Accessibility

Carousel renders a `section` with `role="region"` named by the label that the application supplies, and each slide is a group named by `getSlideLabel`. The JavaScript controller adds `role="group"` only to a slide that is not an `article` and has no role of its own, and it keeps an authored slide name. Only the current slide is available: the other slides are `hidden`, `inert` and `aria-hidden`, so their content cannot receive focus and is not read. The component does not start moving by itself and has no timer.

- The previous and next arrows are native buttons with the names `previousLabel` and `nextLabel`. At the first or last slide of a carousel that does not loop, the arrow has `aria-disabled="true"`, keeps focus and ignores activation, so focus stays on the arrow the reader used. In React, Vue and Angular the native `disabled` attribute is written only when there are fewer than two slides. The JavaScript controller also writes it when the root is `disabled`, has `aria-disabled="true"` or carries `data-hw-disabled`, and when an arrow is authored `disabled`.
- Each indicator is a native button named by `getSlideLabel`, and the current one has `aria-current="true"`. The indicators are buttons, not tabs.
- A status element with `role="status"` and a polite `aria-live` announces the name of the current slide, or `emptyLabel` when there are no slides.
- `carouselDescription` and `slideDescription` set `aria-roledescription` on the region and on each slide, and only when the application supplies them.
- Reduced motion: when the reader asks for reduced motion, the stylesheet removes the motion of the track and the delay of the outgoing slide.

Table: Keyboard interaction of Carousel

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the next control in the order of the page: the indicators, then the previous and the next arrow. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused indicator, which shows the slide it names, or the focused arrow, which shows the previous or the next slide; at the first or last slide of a carousel that does not loop, the arrow keeps focus and ignores activation. |

Carousel defines no other keys. The controls are native buttons, so the keys follow the browser; slide content that has focusable elements of its own is reached with <kbd>Tab</kbd> only while its slide is the current one.

## RTL and localisation

Carousel has no built-in text. The label, the arrow names, the indicator group name, the empty text, the optional role descriptions and the slide names are written by the application in the language of the page, and the component adds no words or punctuation to what `getSlideLabel` returns.

- The track moves along the reading direction. The direction comes from the `dir` attribute of the nearest element that sets it and is independent of the language, so a carousel inside a section with its own direction follows that section.
- The previous and next arrows show a direction-aware glyph chosen from the actual direction, so the previous arrow points to the reading start.
- `getSlideLabel` receives a one-based position in every adapter. Digits stay as the function writes them, so the application decides the numerals.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the mapping of Carousel; the evidence panel after it lists the verification evidence that components.json records and the items that remain open.

### Sources

- The presentation of the track, the arrows and the indicators is mapped against the supplied Platforms Code style sheet in the [carousel notes](../nic-carousel.md), with the confidence and the boundary of each row.
- The supplied files contain no carousel script. Looping, keyboard behaviour, the status announcement and the absence of autoplay are Hawiyah decisions, which the [carousel notes](../nic-carousel.md) record.
