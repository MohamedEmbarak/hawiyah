# Service

The service template is the page of one service: a page header with the name of the service and the breadcrumb, the facts of the service, the documents it requires, its steps and the action that starts it.

## Example

The page header names the service and holds the breadcrumb. The service details state the duration, the fee and the channel, and the required documents follow as a list. The steps of the service follow the documents, and the action that starts the service stands last, in the footer of the service details.

```html live example=page static differences=page-header-angular-actions-region frame width=390
<header class="hw-page-header">
  <nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li><span aria-current="page">Copy of a document</span></li></ol></nav>
  <div class="hw-page-header-main">
    <div><h1>Copy of a document</h1><p>Request a certified copy of a document held on your record.</p></div>
  </div>
</header>
<article class="hw-service-details">
  <header><h2>Service details</h2><p>The copy is issued in electronic form after the request is approved.</p></header>
  <dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>Free</dd></div><div><dt>Channel</dt><dd>Online</dd></div></dl>
  <section><h3>Required documents</h3><ul><li>An identity document</li><li>The reference number of the document</li><li>A letter of authorisation, when you apply for another person</li></ul></section>
  <p>The service has three steps.</p>
  <ol class="hw-timeline" aria-label="Steps of the service">
    <li class="hw-timeline-item"><h3>Enter the reference number</h3><p>State which document you request a copy of.</p></li>
    <li class="hw-timeline-item"><h3>Attach the documents</h3><p>Attach each document in the list above.</p></li>
    <li class="hw-timeline-item"><h3>Confirm and submit</h3><p>Check the answers, then send the request.</p></li>
  </ol>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">Start the service</button></footer>
</article>
```

```tsx live example=page
<>
  <PageHeader
    title="Copy of a document"
    description="Request a certified copy of a document held on your record."
    breadcrumb={
      <Breadcrumb
        label="Breadcrumb"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: 'Copy of a document' },
        ]}
      />
    }
  />
  <ServiceDetails
    title="Service details"
    description="The copy is issued in electronic form after the request is approved."
    metadata={[
      { term: 'Duration', description: '3 days' },
      { term: 'Fee', description: 'Free' },
      { term: 'Channel', description: 'Online' },
    ]}
    requirementsLabel="Required documents"
    requirements={[
      'An identity document',
      'The reference number of the document',
      'A letter of authorisation, when you apply for another person',
    ]}
    action={<Button variant="primary">Start the service</Button>}
  >
    <p>The service has three steps.</p>
    <Timeline
      label="Steps of the service"
      items={[
        { id: 'reference', title: 'Enter the reference number', description: 'State which document you request a copy of.' },
        { id: 'documents', title: 'Attach the documents', description: 'Attach each document in the list above.' },
        { id: 'submit', title: 'Confirm and submit', description: 'Check the answers, then send the request.' },
      ]}
    />
  </ServiceDetails>
</>
```

```vue live example=page
<PageHeader title="Copy of a document" description="Request a certified copy of a document held on your record.">
  <template #breadcrumb>
    <Breadcrumb
      label="Breadcrumb"
      :items="[
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Copy of a document' },
      ]"
    />
  </template>
</PageHeader>
<ServiceDetails
  title="Service details"
  description="The copy is issued in electronic form after the request is approved."
  :metadata="[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
    { term: 'Channel', description: 'Online' },
  ]"
  requirements-label="Required documents"
  :requirements="[
    'An identity document',
    'The reference number of the document',
    'A letter of authorisation, when you apply for another person',
  ]"
>
  <p>The service has three steps.</p>
  <Timeline
    label="Steps of the service"
    :items="[
      { id: 'reference', title: 'Enter the reference number', description: 'State which document you request a copy of.' },
      { id: 'documents', title: 'Attach the documents', description: 'Attach each document in the list above.' },
      { id: 'submit', title: 'Confirm and submit', description: 'Check the answers, then send the request.' },
    ]"
  />
  <template #action><Button variant="primary">Start the service</Button></template>
</ServiceDetails>
```

```ts live example=page framework=angular
template: `<hw-page-header title="Copy of a document" description="Request a certified copy of a document held on your record.">
  <hw-breadcrumb
    hwBreadcrumb
    label="Breadcrumb"
    [items]="[
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'Copy of a document' },
    ]"
  />
</hw-page-header>
<hw-service-details
  title="Service details"
  description="The copy is issued in electronic form after the request is approved."
  [metadata]="[
    { term: 'Duration', description: '3 days' },
    { term: 'Fee', description: 'Free' },
    { term: 'Channel', description: 'Online' },
  ]"
  requirementsLabel="Required documents"
  [requirements]="[
    'An identity document',
    'The reference number of the document',
    'A letter of authorisation, when you apply for another person',
  ]"
>
  <p>The service has three steps.</p>
  <hw-timeline
    label="Steps of the service"
    [items]="[
      { id: 'reference', title: 'Enter the reference number', description: 'State which document you request a copy of.' },
      { id: 'documents', title: 'Attach the documents', description: 'Attach each document in the list above.' },
      { id: 'submit', title: 'Confirm and submit', description: 'Check the answers, then send the request.' },
    ]"
  />
  <button hwButton hwServiceAction variant="primary">Start the service</button>
</hw-service-details>`
```

The page is a static state. The action is a button because it starts a request in the application; where the service lives on another address, the action is a link that the application writes instead.

## Composition

- [Breadcrumb](../components/breadcrumb.md) names the pages above the service and marks the service as the current page.
- [PageHeader](../components/page-header.md) holds the first-level heading with the name of the service, its description and the breadcrumb.
- [ServiceDetails](../components/service-details.md) shows the facts of the service, the required documents as its list of requirements, the steps as additional content and the action in its footer. The heading of the list of documents is the `requirementsLabel` of [ServiceDetails](../components/service-details.md).
- [Timeline](../components/timeline.md) lists the steps of the service in order, each with a title and a description. No step carries a state, because the reader has not started the service. The titles of its items are third-level headings, so the timeline stands below the second-level heading of the service details.
- [Button](../components/button.md) is the action that starts the service.

Version 0.3.0 has no part of ServiceDetails for steps, so the steps are content that the application places inside it, and the order of the parts is fixed by the component: facts, documents, steps, action. The Timeline is chosen over [Stepper](../components/stepper.md) because a Stepper shows the state of each stage of the reader's own progress, which a list of steps before the start does not have. [DescriptionList](../components/description-list.md) is not placed by the page, because ServiceDetails writes the facts in its own description list.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the service template; the evidence of each component is on its own page.

- The [coverage notes](../coverage.md) place ServiceDetails in the group Platform patterns, Breadcrumb in Initial interaction/navigation, Button in Initial controls, Timeline in Additional content and PageHeader in Layout. They state that template behavior has a separate evidence gate in the reference record and the roadmap.
