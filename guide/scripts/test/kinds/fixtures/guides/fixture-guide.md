# Guide fixture

This page is a fixture of the guide build and is never deployed. It shows the outline that a guide may have: free sections, headings below them and a live group.

## Sections of a guide

A guide has one h1, a summary of one or two sentences and then its own sections. The writer chooses the headings and their order.

### Headings below a section

An h3 heading divides a section, and an h4 heading divides an h3 heading. The [Button](../components/button.md) page and the [template fixture](../templates/fixture-template.md#composition) are reached from here.

## A live group

A live group of a guide stands under any of its headings. This group shows the primary button of the [Button](../components/button.md) page in the four frameworks.

```html live example=continue
<button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>
```

```tsx live example=continue
<Button variant="primary">Continue</Button>
```

```vue live example=continue
<Button variant="primary">Continue</Button>
```

```ts live example=continue framework=angular
template: `<button hwButton variant="primary">Continue</button>`
```

## Links between pages

- A link to a component page leads to its reference view, such as the [variants of Button](../components/button.md#variants).
- A link to a section of this page leads to its heading, such as [Sections of a guide](#sections-of-a-guide).
