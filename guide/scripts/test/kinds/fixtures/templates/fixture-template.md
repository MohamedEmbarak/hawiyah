# Template fixture

This page is a fixture of the guide build and is never deployed. It shows a request page in two states, built from the components that its Composition section lists.

## Example

Each state of the page is one framed live group, rendered in a sandboxed frame in the four frameworks.

### Request received

The request was submitted: the page confirms it and offers the next action.

```html live example=received frame width=390
<main>
  <h1>Request received</h1>
  <div class="hw-alert" data-tone="success" data-variant="outline" role="status">
    <div class="hw-alert-content"><p>Your request was submitted.</p></div>
  </div>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Continue</button>
</main>
```

```tsx live example=received
<main>
  <h1>Request received</h1>
  <Alert tone="success" variant="outline">
    <p>Your request was submitted.</p>
  </Alert>
  <Button variant="primary">Continue</Button>
</main>
```

```vue live example=received
<main>
  <h1>Request received</h1>
  <Alert tone="success" variant="outline">
    <p>Your request was submitted.</p>
  </Alert>
  <Button variant="primary">Continue</Button>
</main>
```

```ts live example=received framework=angular
template: `<main>
  <h1>Request received</h1>
  <hw-alert tone="success" variant="outline">
    <p>Your request was submitted.</p>
  </hw-alert>
  <button hwButton variant="primary">Continue</button>
</main>`
```

### Request not uploaded

The document of the request was not uploaded: the page names the problem and offers to try again.

```html live example=not-uploaded frame
<main>
  <h1>Request not submitted</h1>
  <div class="hw-alert" data-tone="danger" role="alert">
    <div class="hw-alert-content"><p>The document was not uploaded. Choose a file in PDF format and try again.</p></div>
  </div>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">Try again</button>
</main>
```

```tsx live example=not-uploaded
<main>
  <h1>Request not submitted</h1>
  <Alert tone="danger">
    <p>The document was not uploaded. Choose a file in PDF format and try again.</p>
  </Alert>
  <Button variant="primary">Try again</Button>
</main>
```

```vue live example=not-uploaded
<main>
  <h1>Request not submitted</h1>
  <Alert tone="danger">
    <p>The document was not uploaded. Choose a file in PDF format and try again.</p>
  </Alert>
  <Button variant="primary">Try again</Button>
</main>
```

```ts live example=not-uploaded framework=angular
template: `<main>
  <h1>Request not submitted</h1>
  <hw-alert tone="danger">
    <p>The document was not uploaded. Choose a file in PDF format and try again.</p>
  </hw-alert>
  <button hwButton variant="primary">Try again</button>
</main>`
```

## Composition

The page uses these components:

- [Alert](../components/alert.md) states the outcome of the request.
- [Button](../components/button.md) starts the next action.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the template; the component pages of its Composition section state the evidence of each component.

- The [coverage notes](../coverage.md) list the components that the template uses.
