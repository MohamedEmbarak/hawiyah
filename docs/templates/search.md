# Search results

The template of a search results page shows the search field with the query, the count of results, the results as a list of links with summaries or as service cards, an empty state as a separate state, and pagination. The application runs the search and owns every text, every address and the page that is shown.

## Example

Each state below is the page that a reader sees at one moment of a search. The page has one `main` region, an `h1` that names the page, and the search field above the results, so that a reader can change the query without leaving the results. The count of results stands under the field and names the query, and the results follow it in the order that the application returns them. The count is a paragraph with `role="status"`, which assistive technology announces when the application changes its content in place; the content present when the page loads is not announced. Under the count, a native `h2` named Results keeps the heading order unbroken, because the titles of ServiceCard and EmptyState are third-level headings.

### Results as links

A result is a link whose text names its destination, followed by a summary in a paragraph. The results stand in an ordered list, so that assistive technology announces the number of results on the page shown and the position of each one. Pagination follows the list and names the page that is shown. The examples show the search button without a handler; the application either handles the search callback of [SearchField](../components/search-field.md) or places the field in a form, as that page describes. The three pages of the example hold nine results at three results per page.

```html live example=links static differences=container-vue-layout-attributes,stack-vue-layout-attributes,search-field-adapter-markup,pagination-adapter-markup frame
<main>
  <div class="hw-container">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>Search results</h1></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="links-query">Search services</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="links-query" name="query" type="search" value="residence permit" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="Search"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>Results</h2>
      <p role="status">9 results for residence permit</p>
      <ol>
        <li>
          <a class="hw-link" href="/services/residence-permit">Apply for a residence permit</a>
          <p>Submit the application, the documents and the fee for a new residence permit.</p>
        </li>
        <li>
          <a class="hw-link" href="/services/residence-renewal">Renew a residence permit</a>
          <p>Renew a permit that expires within the next 90 days.</p>
        </li>
        <li>
          <a class="hw-link" href="/services/residence-transfer">Transfer a residence permit</a>
          <p>Move a valid permit to a new sponsor.</p>
        </li>
      </ol>
      <nav class="hw-pagination" data-hw="pagination" aria-label="Result pages" data-hw-total="3" data-hw-current="1" data-hw-page-label="Page {page}" data-hw-gap-label="Pages {start} to {end}" data-hw-jump-label="Page number" data-hw-go-label="Go">
        <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="Previous page"></button>
        <span class="hw-pagination-items" data-hw-pagination-items></span>
        <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="Next page"></button>
      </nav>
    </div>
  </div>
</main>
```

```tsx live example=links
<main>
  <Container>
    <Stack>
      <PageHeader title="Search results" />
      <SearchField label="Search services" name="query" defaultValue="residence permit" clearLabel="Clear search" showSearchButton searchLabel="Search" />
      <h2>Results</h2>
      <p role="status">9 results for residence permit</p>
      <ol>
        <li>
          <Link href="/services/residence-permit">Apply for a residence permit</Link>
          <p>Submit the application, the documents and the fee for a new residence permit.</p>
        </li>
        <li>
          <Link href="/services/residence-renewal">Renew a residence permit</Link>
          <p>Renew a permit that expires within the next 90 days.</p>
        </li>
        <li>
          <Link href="/services/residence-transfer">Transfer a residence permit</Link>
          <p>Move a valid permit to a new sponsor.</p>
        </li>
      </ol>
      <Pagination
        label="Result pages"
        totalPages={3}
        defaultPage={1}
        previousLabel="Previous page"
        nextLabel="Next page"
        getPageLabel={page => `Page ${page}`}
        getGapLabel={(start, end) => `Pages ${start} to ${end}`}
        jumpLabel="Page number"
        goLabel="Go"
      />
    </Stack>
  </Container>
</main>
```

```vue live example=links
<main>
  <Container>
    <Stack>
      <PageHeader title="Search results" />
      <SearchField label="Search services" name="query" default-value="residence permit" clear-label="Clear search" show-search-button search-label="Search" />
      <h2>Results</h2>
      <p role="status">9 results for residence permit</p>
      <ol>
        <li>
          <Link href="/services/residence-permit">Apply for a residence permit</Link>
          <p>Submit the application, the documents and the fee for a new residence permit.</p>
        </li>
        <li>
          <Link href="/services/residence-renewal">Renew a residence permit</Link>
          <p>Renew a permit that expires within the next 90 days.</p>
        </li>
        <li>
          <Link href="/services/residence-transfer">Transfer a residence permit</Link>
          <p>Move a valid permit to a new sponsor.</p>
        </li>
      </ol>
      <Pagination
        label="Result pages"
        :total-pages="3"
        :default-value="1"
        previous-label="Previous page"
        next-label="Next page"
        :get-page-label="(page: number) => `Page ${page}`"
        :get-gap-label="(start: number, end: number) => `Pages ${start} to ${end}`"
        jump-label="Page number"
        go-label="Go"
      />
    </Stack>
  </Container>
</main>
```

```ts live example=links framework=angular
import { Component } from '@angular/core';
import {
  HwContainerComponent,
  HwLinkDirective,
  HwPageHeaderComponent,
  HwPaginationComponent,
  HwSearchFieldComponent,
  HwStackComponent,
} from '@hawiyah/angular';

@Component({
  selector: 'app-links-example',
  imports: [
    HwContainerComponent,
    HwLinkDirective,
    HwPageHeaderComponent,
    HwPaginationComponent,
    HwSearchFieldComponent,
    HwStackComponent,
  ],
  template: `<main>
    <hw-container>
      <hw-stack>
        <hw-page-header title="Search results" />
        <hw-search-field label="Search services" name="query" value="residence permit" clearLabel="Clear search" [showSearchButton]="true" searchLabel="Search" />
        <h2>Results</h2>
        <p role="status">9 results for residence permit</p>
        <ol>
          <li>
            <a hwLink href="/services/residence-permit">Apply for a residence permit</a>
            <p>Submit the application, the documents and the fee for a new residence permit.</p>
          </li>
          <li>
            <a hwLink href="/services/residence-renewal">Renew a residence permit</a>
            <p>Renew a permit that expires within the next 90 days.</p>
          </li>
          <li>
            <a hwLink href="/services/residence-transfer">Transfer a residence permit</a>
            <p>Move a valid permit to a new sponsor.</p>
          </li>
        </ol>
        <hw-pagination
          label="Result pages"
          [totalPages]="3"
          [page]="1"
          previousLabel="Previous page"
          nextLabel="Next page"
          [getPageLabel]="pageLabel"
          [getGapLabel]="gapLabel"
          jumpLabel="Page number"
          goLabel="Go"
        />
      </hw-stack>
    </hw-container>
  </main>`,
})
export class LinksExample {
  pageLabel = (page: number) => `Page ${page}`;
  gapLabel = (start: number, end: number) => `Pages ${start} to ${end}`;
}
```

### Results as service cards

When each result is a service, a service card shows its category, its title, a summary and its facts, and its action link carries a name that includes the service. The cards stand in a grid that has one column on a narrow viewport and three columns from the medium step.

```html live example=cards static differences=container-vue-layout-attributes,stack-vue-layout-attributes,search-field-adapter-markup,grid-vue-layout-attributes,service-card-angular-variant-icon frame
<main>
  <div class="hw-container">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>Search results</h1></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="cards-query">Search services</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="cards-query" name="query" type="search" value="driving licence" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="Search"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>Results</h2>
      <p role="status">3 results for driving licence</p>
      <div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Licences</span><h3>Issue a driving licence</h3></div></header>
          <div class="hw-card-body">
            <p>Apply for a first driving licence after you pass the road test.</p>
            <dl class="hw-description-list"><div><dt>Duration</dt><dd>2 days</dd></div><div><dt>Fee</dt><dd>Paid</dd></div></dl>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/licence-issue">Apply for a driving licence</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Licences</span><h3>Renew a driving licence</h3></div></header>
          <div class="hw-card-body">
            <p>Renew a licence that has expired or expires within 30 days.</p>
            <dl class="hw-description-list"><div><dt>Duration</dt><dd>1 day</dd></div><div><dt>Fee</dt><dd>Paid</dd></div></dl>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/licence-renewal">Renew a driving licence</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">Licences</span><h3>Replace a driving licence</h3></div></header>
          <div class="hw-card-body">
            <p>Request a replacement for a licence that is lost or damaged.</p>
            <dl class="hw-description-list"><div><dt>Duration</dt><dd>3 days</dd></div><div><dt>Fee</dt><dd>Paid</dd></div></dl>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/licence-replacement">Replace a driving licence</a></footer>
        </article>
      </div>
    </div>
  </div>
</main>
```

```tsx live example=cards
<main>
  <Container>
    <Stack>
      <PageHeader title="Search results" />
      <SearchField label="Search services" name="query" defaultValue="driving licence" clearLabel="Clear search" showSearchButton searchLabel="Search" />
      <h2>Results</h2>
      <p role="status">3 results for driving licence</p>
      <Grid columns={{ base: 1, md: 3 }}>
        <ServiceCard
          title="Issue a driving licence"
          category="Licences"
          description="Apply for a first driving licence after you pass the road test."
          metadata={[
            { term: 'Duration', description: '2 days' },
            { term: 'Fee', description: 'Paid' },
          ]}
          href="/services/licence-issue"
          actionLabel="Apply for a driving licence"
        />
        <ServiceCard
          title="Renew a driving licence"
          category="Licences"
          description="Renew a licence that has expired or expires within 30 days."
          metadata={[
            { term: 'Duration', description: '1 day' },
            { term: 'Fee', description: 'Paid' },
          ]}
          href="/services/licence-renewal"
          actionLabel="Renew a driving licence"
        />
        <ServiceCard
          title="Replace a driving licence"
          category="Licences"
          description="Request a replacement for a licence that is lost or damaged."
          metadata={[
            { term: 'Duration', description: '3 days' },
            { term: 'Fee', description: 'Paid' },
          ]}
          href="/services/licence-replacement"
          actionLabel="Replace a driving licence"
        />
      </Grid>
    </Stack>
  </Container>
</main>
```

```vue live example=cards
<main>
  <Container>
    <Stack>
      <PageHeader title="Search results" />
      <SearchField label="Search services" name="query" default-value="driving licence" clear-label="Clear search" show-search-button search-label="Search" />
      <h2>Results</h2>
      <p role="status">3 results for driving licence</p>
      <Grid :columns="{ base: 1, md: 3 }">
        <ServiceCard
          title="Issue a driving licence"
          category="Licences"
          description="Apply for a first driving licence after you pass the road test."
          :metadata="[
            { term: 'Duration', description: '2 days' },
            { term: 'Fee', description: 'Paid' },
          ]"
          href="/services/licence-issue"
          action-label="Apply for a driving licence"
        />
        <ServiceCard
          title="Renew a driving licence"
          category="Licences"
          description="Renew a licence that has expired or expires within 30 days."
          :metadata="[
            { term: 'Duration', description: '1 day' },
            { term: 'Fee', description: 'Paid' },
          ]"
          href="/services/licence-renewal"
          action-label="Renew a driving licence"
        />
        <ServiceCard
          title="Replace a driving licence"
          category="Licences"
          description="Request a replacement for a licence that is lost or damaged."
          :metadata="[
            { term: 'Duration', description: '3 days' },
            { term: 'Fee', description: 'Paid' },
          ]"
          href="/services/licence-replacement"
          action-label="Replace a driving licence"
        />
      </Grid>
    </Stack>
  </Container>
</main>
```

```ts live example=cards framework=angular
template: `<main>
  <hw-container>
    <hw-stack>
      <hw-page-header title="Search results" />
      <hw-search-field label="Search services" name="query" value="driving licence" clearLabel="Clear search" [showSearchButton]="true" searchLabel="Search" />
      <h2>Results</h2>
      <p role="status">3 results for driving licence</p>
      <hw-grid [columns]="{ base: 1, md: 3 }">
        <hw-service-card
          title="Issue a driving licence"
          category="Licences"
          description="Apply for a first driving licence after you pass the road test."
          [metadata]="[
            { term: 'Duration', description: '2 days' },
            { term: 'Fee', description: 'Paid' },
          ]"
          href="/services/licence-issue"
          actionLabel="Apply for a driving licence"
        />
        <hw-service-card
          title="Renew a driving licence"
          category="Licences"
          description="Renew a licence that has expired or expires within 30 days."
          [metadata]="[
            { term: 'Duration', description: '1 day' },
            { term: 'Fee', description: 'Paid' },
          ]"
          href="/services/licence-renewal"
          actionLabel="Renew a driving licence"
        />
        <hw-service-card
          title="Replace a driving licence"
          category="Licences"
          description="Request a replacement for a licence that is lost or damaged."
          [metadata]="[
            { term: 'Duration', description: '3 days' },
            { term: 'Fee', description: 'Paid' },
          ]"
          href="/services/licence-replacement"
          actionLabel="Replace a driving licence"
        />
      </hw-grid>
    </hw-stack>
  </hw-container>
</main>`
```

### No results

The empty state is a separate state of the page. The search field keeps the query that returned nothing, so that the reader can correct it, the count states that there are no results, and the empty state says what to do next. The list and the pagination are not rendered. The action of the empty state is shown without a handler; the application handles it or replaces it with a link to the list of services.

```html live example=empty static differences=container-vue-layout-attributes,stack-vue-layout-attributes,search-field-adapter-markup frame
<main>
  <div class="hw-container">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>Search results</h1></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="empty-query">Search services</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="empty-query" name="query" type="search" value="residnce permt" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="Clear search" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="Search"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>Results</h2>
      <p role="status">0 results for residnce permt</p>
      <div class="hw-empty">
        <span class="hw-empty-icon" aria-hidden="true"><span class="hw-icon" data-icon="search-01"></span></span>
        <h3>No services found</h3>
        <p>No service matches the words you entered. Check the spelling or search with fewer words.</p>
        <button class="hw-button" type="button" data-variant="secondary" data-size="md">Show all services</button>
      </div>
    </div>
  </div>
</main>
```

```tsx live example=empty
<main>
  <Container>
    <Stack>
      <PageHeader title="Search results" />
      <SearchField label="Search services" name="query" defaultValue="residnce permt" clearLabel="Clear search" showSearchButton searchLabel="Search" />
      <h2>Results</h2>
      <p role="status">0 results for residnce permt</p>
      <EmptyState
        title="No services found"
        description="No service matches the words you entered. Check the spelling or search with fewer words."
        icon={<span className="hw-icon" data-icon="search-01" />}
        action={<Button variant="secondary">Show all services</Button>}
      />
    </Stack>
  </Container>
</main>
```

```vue live example=empty
<main>
  <Container>
    <Stack>
      <PageHeader title="Search results" />
      <SearchField label="Search services" name="query" default-value="residnce permt" clear-label="Clear search" show-search-button search-label="Search" />
      <h2>Results</h2>
      <p role="status">0 results for residnce permt</p>
      <EmptyState
        title="No services found"
        description="No service matches the words you entered. Check the spelling or search with fewer words."
      >
        <template #icon><span class="hw-icon" data-icon="search-01"></span></template>
        <template #action><Button variant="secondary">Show all services</Button></template>
      </EmptyState>
    </Stack>
  </Container>
</main>
```

```ts live example=empty framework=angular
template: `<main>
  <hw-container>
    <hw-stack>
      <hw-page-header title="Search results" />
      <hw-search-field label="Search services" name="query" value="residnce permt" clearLabel="Clear search" [showSearchButton]="true" searchLabel="Search" />
      <h2>Results</h2>
      <p role="status">0 results for residnce permt</p>
      <hw-empty-state
        title="No services found"
        description="No service matches the words you entered. Check the spelling or search with fewer words."
      >
        <span hwEmptyIcon class="hw-icon" data-icon="search-01"></span>
        <button hwButton hwEmptyAction variant="secondary">Show all services</button>
      </hw-empty-state>
    </hw-stack>
  </hw-container>
</main>`
```

## Composition

The template is composed of the components below, each documented on its own page.

- [PageHeader](../components/page-header.md) names the page with the `h1`.
- [SearchField](../components/search-field.md) holds the query and reports it; the application runs the search.
- [Link](../components/link.md) is the result in a list of results.
- [ServiceCard](../components/service-card.md) is the result when each result is a service.
- [EmptyState](../components/empty-state.md) is the state of a search without results.
- [Pagination](../components/pagination.md) reports the page that the reader selects; the application shows that page of results.
- [Container](../components/container.md) limits the width of the page content.
- [Stack](../components/stack.md) places the blocks of the page in one column.
- [Grid](../components/grid.md) places the service cards in columns.
- [Button](../components/button.md) is the action of the empty state.

Version 0.3.0 has no component for a list of results, for the count of results or for the filters and the sort order of a result list. The template writes the ordered list and the paragraph with the native elements `ol`, `li` and `p`, and it shows neither filters nor a sort control. The links state shows the pagination; the cards state has one page of three results and shows none. A component that announces a changed count of results is not part of the packages.

## Platforms Code reference

Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification. This section names the sources of the template; the evidence of each component is on its own page.

### Sources

- The [search notes](../nic-search.md) describe the search field, its clear action and its suggestions, and record that the search and form events remain application-owned.
- The [pagination notes](../nic-pagination.md) describe the page controls and record that the rendering of data remains application-owned.
- The [coverage notes](../coverage.md) map the search input type to SearchField. The [audit follow-up](../dga-audit-followup.md) records the search page template of the supplied files. That template shows the query, the count, results as service cards or plain links, and pagination, and it leaves out filters, sort order and the loading and error states; the follow-up lists the empty state as a requirement, and this page shows it as a separate state.
