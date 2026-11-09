import type { GuideInput } from './component-guide-types';

const layoutSource = 'packages/styles/src/layout.css';
const contentSource = 'packages/react/src/expanded-content.tsx';
const gap = { name: 'gap / --hw-layout-gap', type: 'Responsive<0..16 | CSS length>', description: 'Space between children; numeric props use quarter-rem spacing tokens. Add -sm, -md, -lg or -xl to the CSS variable for responsive steps.' };
const padding = { name: 'padding / --hw-layout-padding', type: 'Responsive<0..16 | CSS length>', description: 'Internal spacing. Responsive steps start at 40rem, 48rem, 64rem and 80rem; an omitted step inherits the nearest smaller value.' };
const noLayoutController = 'No enhance() call, event subscription or destroy() lifecycle is needed. CSS performs layout without viewport listeners.';
const layoutFrameworks = 'React and Vue expose the named layout component; Angular exposes the matching hw-* selector. Shared layout props use layoutStyles from @hawiyah/core. Vue basic layouts also accept as; React uses div, except Section uses section. Set each nested layout explicitly; its layout variables reset locally. Angular inputs configure an internal wrapper; arbitrary attributes on the component host are not automatically forwarded to it.';

export const layoutPlatformGuides: Record<string, GuideInput> = {
  'description-list': {
    summary: 'Present paired terms and values, such as application reference, fees and processing time, using native definition-list semantics.',
    usage: `<dl class="hw-description-list" data-variant="horizontal">
  <div><dt>Reference</dt><dd dir="ltr">HW-1043</dd></div>
  <div><dt>Service fee</dt><dd><bdi><span class="hw-riyal" aria-hidden="true">⃁</span><span class="hw-sr-only">Saudi riyals</span> 200</bdi></dd></div>
  <div><dt>Expected processing time</dt><dd>3 working days</dd></div>
</dl>`,
    api: [
      { name: 'dt / dd', type: 'HTML elements', description: 'Each direct child div groups its term and description. A value may contain links or other semantic content.' },
      { name: 'data-variant', type: 'horizontal | compact', description: 'Horizontal places terms beside values and stacks on narrow screens; compact reduces row padding.' },
      { name: 'React items', type: 'readonly { term, description, key? }[]', description: 'term and description accept ReactNode; key identifies a row across updates.' },
    ],
    lifecycle: ['Render the list from the current record. It has no selection state or JavaScript initialization.', 'Update term/value pairs when the application record changes. Preserve stable framework keys for rows that contain interactive controls.', 'Removing the list needs no component cleanup.'],
    accessibility: ['Use dl, dt and dd rather than visually spaced paragraphs so the relationship survives styling changes.', 'Apply dir="ltr" to an individual reference or IBAN when surrounding content is Arabic; retain normal direction for its label.'],
    variants: ['Default stacked terms', 'Horizontal', 'Compact'], related: ['service-details', 'stat', 'table'],
    frameworkNotes: 'React and Vue accept items. Angular hw-description-list accepts items plus variant; Angular item fields are term and description.',
    source: contentSource,
  },
  'service-card': {
    summary: 'Summarize one service with its category, purpose, key facts and an explicit link to details or the application journey.',
    usage: `<article class="hw-service-card" data-variant="featured">
  <span class="hw-badge" data-tone="info">Business</span>
  <h3>Renew a commercial license</h3>
  <p>Check requirements and renew an existing license.</p>
  <div class="hw-service-card-meta"><span><bdi><span class="hw-riyal" aria-hidden="true">⃁</span><span class="hw-sr-only">Saudi riyals</span> 150</bdi></span><span>1 working day</span></div>
  <a class="hw-button" href="./services/license">View license renewal</a>
</article>`,
    api: [
      { name: 'title / description', type: 'heading and descriptive content', description: 'Describe one service. Adapter title props render an h3; vanilla markup may use the appropriate heading level.' },
      { name: 'href / actionLabel', type: 'string', description: 'Native destination and localized action text. Navigation and route loading belong to the application.' },
      { name: 'data-variant', type: 'featured | compact', description: 'Featured adds emphasis; compact reduces spacing. Pass as a data attribute where the adapter does not expose this as a typed prop.' },
      { name: 'React metadata', type: 'DescriptionItem[]', description: 'Uses term/description pairs. Vue metadata is a string array; Angular exposes duration and fee strings.' },
    ],
    lifecycle: ['Render a card for each known service; use a stable service ID when rendering a collection.', 'Links navigate normally. Changing availability, fees or processing estimates is an application data update.', 'There is no fetch or submission controller to initialize or destroy.'],
    accessibility: ['Give the action a specific accessible name when multiple cards repeat “View service”.', 'Keep nested links and buttons separate; do not wrap the whole card in a link when it already contains interactive controls.', 'Mark purely decorative service icons aria-hidden="true".'],
    variants: ['Default', 'Featured', 'Compact'], related: ['service-details', 'grid', 'badge'],
    frameworkNotes: 'React uses title, description, category, metadata, icon and action; Vue uses title, description, badge, metadata plus icon/action slots. Angular hw-service-card requires title and href, with category, duration, fee and variant inputs.',
    limitations: ['Displays caller-supplied information; it does not check eligibility or guarantee service completion times.'], source: contentSource,
  },
  'service-details': {
    summary: 'Explain a service before starting: eligibility, documents, fees, time and the next action, in a readable article or section.',
    usage: `<article class="hw-service-details" aria-labelledby="license-details-title">
  <header><h2 id="license-details-title">License renewal</h2><p>Prepare these details before starting.</p></header>
  <dl class="hw-description-list"><div><dt>Eligibility</dt><dd>Organizations with an existing license</dd></div></dl>
  <section aria-labelledby="license-requirements"><h3 id="license-requirements">Requirements</h3><ul><li>Current license reference</li><li>Updated national address</li></ul></section>
  <footer><a class="hw-button" href="./apply/license">Start renewal</a></footer>
</article>`,
    api: [
      { name: 'title / description', type: 'content', description: 'Service heading and a concise introduction. Localize both alongside any requirements labels.' },
      { name: 'React metadata / requirements', type: 'DescriptionItem[] / ReactNode[]', description: 'Paired service facts and an optional requirements list; requirementsLabel defaults to English.' },
      { name: 'Vue items / Angular details', type: 'description-item arrays', description: 'Equivalent service facts use adapter-specific prop names. Angular also accepts requirements and requirementsLabel.' },
      { name: 'action', type: 'React node / Vue slot / Angular projected content', description: 'Place the journey entry action after the information users need to decide.' },
    ],
    lifecycle: ['Render the current service record and its requirements before collecting application data.', 'Replace content when a route or service changes; maintain a coherent heading structure and focus the new page heading through the router.', 'This content composition registers no observers or DOM controllers.'],
    accessibility: ['Use real lists for requirements and description lists for labeled facts.', 'Keep help links descriptive and identify required documents in text, not only icons or color.'],
    variants: ['Description-list facts', 'Requirements with action', 'Application-owned additional sections'], related: ['service-card', 'description-list', 'page-header'],
    frameworkNotes: 'React renders article with metadata/requirements/action. Vue renders section with items and an action slot. Angular hw-service-details accepts details and requirements; project custom actions through its content.',
    limitations: ['Eligibility checks, current policy and authoritative service data must come from the service owner.'], source: contentSource,
  },
  'portal-header': {
    summary: 'Provide platform identity, primary navigation and account or language actions while keeping navigation meaningful on small screens.',
    usage: `<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-skip-link" href="#main-content">Skip to content</a>
  <a class="hw-portal-brand" href="./" lang="ar">هوية</a>
  <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle>Menu</button>
  <nav aria-label="Main navigation" data-hw-portal-navigation><ul>
    <li><a href="./services" aria-current="page">Services</a></li>
    <li><a href="./requests">My requests</a></li>
  </ul></nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button">العربية</button></div>
</header>`,
    api: [
      { name: 'brand / home destination', type: 'content / URL', description: 'Use an accessible home link. React names the URL brandHref; Vue and Angular use homeHref.' },
      { name: 'navigation / links', type: '{ label, href, current? }[]', description: 'React calls the collection navigation; Vue and Angular call it links. Current links receive aria-current="page".' },
      { name: 'data-variant="sticky"', type: 'CSS variant', description: 'Keeps the header at the block-start edge. Ensure sticky content does not obscure focused controls or anchor destinations.' },
      { name: 'navigationId / mainId / menuLabel / skipLabel', type: 'string', description: 'All framework headers support these props. Navigation IDs are generated unless supplied; mainId connects the optional skip link to a real focusable content target. Defaults are Arabic.' },
      { name: 'createPortalHeader(root, options)', type: 'vanilla controller', description: 'Options: onOpenChange(open). Returns open, show(), close(restoreFocus?), destroy(). enhance() discovers data-hw="portal-header" with data-hw-portal-toggle and data-hw-portal-navigation.' },
    ],
    lifecycle: ['Render navigation from route state and update aria-current when the route changes. Framework adapters own their disclosure state and DOM.', 'For vanilla, call enhance() or createPortalHeader() after mounting. Do not pre-hide the navigation; links remain available without JavaScript.', 'Escape closes and returns focus to the toggle. Link selection, outside press and focus leaving close the disclosure. Tab remains native.', 'Release enhance() or call destroy() before replacing vanilla markup; it removes listeners and restores original attributes. Framework unmount handles its own cleanup.'],
    accessibility: ['Name primary navigation and provide a working skip link to a content target with tabindex="-1".', 'The brand link needs a name even when it contains only an outlined logo image.', 'The built-in toggle maintains aria-expanded and aria-controls. Navigation remains ordinary links, not a menu or a modal focus trap.'],
    variants: ['Responsive disclosure below 48rem', 'Desktop navigation', 'Sticky via data-variant'], related: ['site-verification', 'portal-footer', 'portal-layout', 'secondary-nav'],
    frameworkNotes: 'React uses brand, brandHref, navigation, navigationLabel, actions and notice. Vue uses brand, homeHref, links and navLabel with logo/actions slots. Angular hw-portal-header uses brand, homeHref, links, navigationLabel and projected actions/[hwBrand]. All expose menuLabel, navigationId, mainId and skipLabel. Supply explicit stable Angular IDs for independently serialized roots.',
    limitations: ['The 48rem breakpoint is a Hawiyah adaptation, not an asserted Figma breakpoint.', 'No authentication, language routing or account state is provided by the header.'], source: contentSource,
  },
  'secondary-nav': {
    summary: 'Provide a second level of ordinary page links with a clear current-page state and keyboard focus.',
    usage: `<nav class="hw-secondary-nav" aria-label="Service navigation"><ul>
  <li><a href="./services" aria-current="page">Services</a></li>
  <li><a href="./requests">My requests</a></li>
</ul></nav>`,
    api: [
      { name: 'items', type: 'readonly { label, href, current?, icon? }[]', description: 'React/Vue SecondaryNav and Angular hw-secondary-nav accept items. React labels may be ReactNode; Vue/Angular labels are strings.' },
      { name: 'label', type: 'localized string', description: 'Names this navigation landmark; defaults to Arabic. Distinguish it from the primary and footer navigation.' },
      { name: 'variant', type: 'default | mobile', description: 'Mobile uses equal-width icon-over-label links, a top current-page indicator and 300 ms ease-out color transitions. Pass a decorative icon name on each item. Normal link semantics remain.' },
      { name: 'hw-secondary-nav / aria-current', type: 'semantic HTML', description: 'Vanilla uses a nav with a list of links. aria-current="page" marks the current destination. No JavaScript controller is needed.' },
    ],
    lifecycle: ['Render links from the current page hierarchy.', 'Update current when the route changes; navigation and loading are application-owned.', 'No enhancement, subscription or cleanup is required.'],
    accessibility: ['Use native anchors and Tab order; these are not tabs and should not receive tablist or menu roles.', 'Current state uses an underline and weight, or a top border in mobile presentation, as well as color. Focus remains visible in forced colors.', 'Translate the landmark label independently from text direction.'],
    variants: ['Wrapping links', 'Current-page link', 'Mobile icon bar (variant=mobile)'], related: ['portal-header', 'portal-layout', 'breadcrumb'],
    frameworkNotes: 'Import SecondaryNav from @hawiyah/react or @hawiyah/vue; import HwSecondaryNavComponent from @hawiyah/angular. Angular selector: hw-secondary-nav. All use items and label. React/Vue forward native nav attributes; Angular inputs configure its internal nav.',
    limitations: ['This is page navigation, not a route loader or content tab controller.'], source: 'packages/styles/src/portal.css',
  },
  'portal-layout': {
    summary: 'Start a public service portal with a responsive header, secondary navigation, breadcrumb, main container and footer already composed.',
    usage: `<div class="hw-portal-layout" lang="ar" dir="rtl">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#portal-content">انتقل إلى المحتوى</a>
    <a class="hw-portal-brand" href="./">هوية</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle>القائمة</button>
    <nav aria-label="التنقل الرئيسي" data-hw-portal-navigation><ul><li><a href="./services" aria-current="page">الخدمات</a></li></ul></nav>
  </header>
  <nav class="hw-secondary-nav" aria-label="التنقل الثانوي"><ul><li><a href="./services" aria-current="page">دليل الخدمات</a></li></ul></nav>
  <main id="portal-content" tabindex="-1" class="hw-portal-layout-main hw-container">
    <nav class="hw-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="./">الرئيسية</a></li><li><span aria-current="page">الخدمات</span></li></ol></nav>
    <h1>الخدمات</h1>
  </main>
  <footer class="hw-portal-footer"><strong>هوية</strong><nav aria-label="روابط التذييل"><ul><li><a href="./privacy">الخصوصية</a></li></ul></nav></footer>
</div>`,
    api: [
      { name: 'brand / lang / dir / mainId', type: 'content / string', description: 'Brand is required. lang defaults to ar and dir to rtl independently. Generated mainId connects the skip link to the focusable main; explicit IDs must be unique.' },
      { name: 'React headerProps / footerProps', type: 'PortalHeaderProps / PortalFooterProps', description: 'headerProps configures navigation, brandHref, actions, notice and navigation/menu labels. footerProps configures links, linksLabel, legal and other existing footer props. Top-level skipLabel names the skip link.' },
      { name: 'Vue / Angular links / footerLinks', type: 'readonly { label, href, current?, icon? }[]', description: 'These adapters expose homeHref, links, footerLinks, copyright, skipLabel, menuLabel, navigationLabel and footerLabel directly. Vue slots: logo/actions/footer/default. Angular projection: [hwBrand]/[hwPortalActions]/[hwPortalFooter]/default.' },
      { name: 'secondaryNavigation / breadcrumbs', type: 'readonly item arrays', description: 'Optional navigation and breadcrumb collections. secondaryLabel and breadcrumbLabel override their Arabic labels. Breadcrumb items use label/href; React/Vue also accept current.' },
      { name: 'Vanilla .hw-portal-layout', type: 'semantic HTML', description: 'Compose the shared classes with one main landmark and enhance only the marked header. The embedded gallery substitutes a section for main to avoid nesting page landmarks.' },
    ],
    lifecycle: ['Render one shell around application content; the application supplies a page heading, routes and data.', 'Enhance vanilla header markup after mounting and release it before replacement. Framework components own their DOM and event cleanup.', 'Update current links, breadcrumb and title together on route changes. Route focus and document.title remain application responsibilities.'],
    accessibility: ['The skip target is programmatically focusable. Keep one main landmark per document.', 'Name the primary, secondary, breadcrumb and footer landmarks distinctly.', 'For English, set lang="en" and dir="ltr" and translate all content and accessible labels. Direction may be configured independently.'],
    variants: ['Header and footer', 'Secondary navigation and breadcrumb', 'Arabic/RTL or English/LTR'], related: ['portal-header', 'secondary-nav', 'portal-footer', 'breadcrumb', 'app-shell'],
    frameworkNotes: 'React/Vue export PortalLayout. Angular exports HwPortalLayoutComponent with selector hw-portal-layout. See each package PORTAL.md and run its native example with ?preview=portal. Supply stable explicit mainId/navigationId values when independently serializing Angular app roots; Angular SSR/hydration is not claimed verified.',
    limitations: ['48rem disclosure breakpoint is Hawiyah policy. Layout uses semantic theme tokens and adds no animation.', 'No route loader, authentication, government asset entitlement or DGA certification is implied.'], source: 'packages/styles/src/portal.css',
  },
  'portal-footer': {
    summary: 'Close a service page with platform context, supporting navigation and legal or contact information.',
    usage: `<footer class="hw-portal-footer">
  <strong lang="ar">هوية</strong><p>Clear access to our digital services.</p>
  <nav aria-label="Footer navigation"><ul><li><a class="hw-link" href="./privacy">Privacy</a></li><li><a class="hw-link" href="./accessibility">Accessibility</a></li></ul></nav>
  <small>Contact the service owner for application support.</small>
</footer>`,
    api: [
      { name: 'brand / description', type: 'content', description: 'Optional identity and context; avoid duplicating a long navigation or application form in the footer.' },
      { name: 'links', type: '{ label, href }[]', description: 'Native supporting links. Provide a real destination rather than placeholder policy URLs in production.' },
      { name: 'navigation label', type: 'localized string', description: 'React linksLabel, Vue navLabel, and Angular navigationLabel name the footer navigation.' },
      { name: 'legal / copyright', type: 'content', description: 'React exposes legal; Vue and Angular expose copyright. Add other legal content through normal children or projection.' },
    ],
    lifecycle: ['Render after the page content. Footer links continue to use ordinary browser or router navigation.', 'Update policy or support links from platform configuration; there is no component selection state.', 'No enhancement or cleanup is required for static footer content.'],
    accessibility: ['Use footer and a named nav landmark; distinguish its label from primary navigation.', 'Ensure link text describes the policy or destination and remains visible in high contrast mode.'],
    variants: ['Grouped navigation', 'Support and policy links', 'Brand and partner slots', 'Legacy flat links'], related: ['portal-header', 'app-shell', 'link'],
    frameworkNotes: 'All adapters accept groups (title and links) and legalLinks. React adds support and partners nodes; Vue uses logo/support/partners slots; Angular uses hwFooterBrand/hwFooterSupport/hwFooterPartners projection. Existing flat links, descriptions, legal/copyright and default content remain supported. External links accept external=true and an accessible externalLabel. See docs/nic-footer.md.',
    source: contentSource,
  },
  feedback: {
    summary: 'Collect an explicit helpful/not-helpful choice and connect it to an application-owned feedback workflow.',
    usage: `<div class="hw-feedback" data-hw="feedback" role="group" aria-label="Was this page helpful?">
  <p>Was this page helpful?</p>
  <div class="hw-inline"><button class="hw-button" type="button" data-hw-value="yes" aria-pressed="false">Yes</button><button class="hw-button" type="button" data-hw-value="no" aria-pressed="false">No</button></div>
  <input type="hidden" data-hw-feedback-value name="helpful">
  <span data-hw-feedback-status role="status"></span>
</div>`,
    api: [
      { name: 'createFeedback(root, options)', type: 'vanilla controller', description: 'Options: value, onValueChange(value), getStatusMessage(value). The returned controller exposes value, select(value), destroy().' },
      { name: 'data-hw-value', type: 'string', description: 'Stable button values, commonly yes/no. The selected button gets aria-pressed="true" and the optional hidden input receives its value.' },
      { name: 'hw:change', type: 'CustomEvent<{ value: string }>', description: 'Bubbles when the selection changes. Re-selecting the same value does not emit another value event.' },
      { name: 'data-hw-disabled / data-hw-readonly', type: '"true"', description: 'Stops user changes; also respect native disabled on individual buttons.' },
    ],
    lifecycle: ['Call enhance() after mounting vanilla markup, or own a createFeedback() controller directly.', 'A selection updates button state, the hidden field and the polite status. Form reset restores the initial choice.', 'Before replacing the markup, release enhance() or call controller.destroy(); original attributes, field value and status are restored.', 'Send feedback to your backend in the callback. The displayed acknowledgment alone is not proof that a server stored anything.'],
    accessibility: ['Give the choice group a visible question and accessible name; use real buttons or native radio controls.', 'Keep acknowledgment in a polite status region and localize its message.'],
    variants: ['Text choices (default)', 'Thumbs with text', 'Thumbs only with accessible labels', 'React or Vue choice plus comment'], related: ['radio', 'textarea', 'alert'],
    frameworkNotes: 'All adapters support choiceVariant="text"|"icon-text"|"icon" (vanilla data-choice-variant with hw-feedback-actions, hw-feedback-icon and hw-feedback-label). Keep yes/no labels for icon-only accessible names. APIs differ: React Feedback value is {helpful:"yes"|"no"|"",comment:string} with onValueChange/onFeedback. Vue v-model is a string and submit emits {value,comment}. Angular [(value)] is boolean|null and emits valueChange; its base component does not include a comment field.',
    limitations: ['No network transport, analytics or moderation is included. React/Vue submission acknowledgment is local UI state.'], source: 'packages/vanilla/src/content.ts',
  },
  'cookie-consent': {
    summary: 'Present an explicit accept/reject choice for optional cookies and hand the result to the application’s privacy implementation.',
    usage: `<section class="hw-cookie-consent" data-hw="cookie-consent" aria-labelledby="cookie-title">
  <h2 id="cookie-title">Cookie preferences</h2><p>Choose whether to allow optional analytics.</p>
  <a class="hw-link" href="./privacy">Read our cookie policy</a>
  <div class="hw-button-group"><button class="hw-button" type="button" data-hw-consent="accepted">Accept optional cookies</button><button class="hw-button" type="button" data-hw-consent="rejected">Reject optional cookies</button></div>
</section>`,
    api: [
      { name: 'createCookieConsent(root, options)', type: 'vanilla controller', description: 'Options: storageKey? and onValueChange(choice). Returns value, choose(choice), destroy().' },
      { name: 'choice', type: '"accepted" | "rejected"', description: 'A valid choice hides the panel and emits bubbling hw:change with {value: choice}.' },
      { name: 'storageKey', type: 'optional string', description: 'Direct vanilla-controller option enabling localStorage persistence. Without it no choice is persisted; unavailable storage does not prevent choosing.' },
      { name: 'data-variant="banner"', type: 'CSS variant', description: 'Positions the panel at the bottom of the viewport. Verify it does not cover essential actions or focused controls.' },
    ],
    lifecycle: ['Mount before optional tracking starts. Vanilla enhancement begins without persistence; direct initialization can opt into storageKey.', 'Accept or reject reports the choice and hides the UI. Connect that event to application-owned script loading and preference storage.', 'Provide a persistent “Cookie preferences” action so users can revisit their choice; the base controller does not supply a complete preference center.', 'Destroy removes listeners and restores the initial hidden attribute. It deliberately does not erase stored application consent.'],
    accessibility: ['Keep both choices explicit, named and reachable by keyboard.', 'Use a labeled section or region. It is a nonmodal panel and does not trap focus.'],
    variants: ['Inline panel', 'Fixed banner'], related: ['dialog', 'button-group', 'portal-footer'],
    frameworkNotes: 'React uses value: accepted|rejected|null and onValueChange. Vue controls open with v-model:open and emits accept/reject/preferences. Angular controls visible/visibleChange and emits consent/preferences. Framework adapters do not persist preferences automatically.',
    limitations: ['This is a preference UI, not a consent-management platform or legal-compliance guarantee. Blocking scripts, recording policy versions and revoking consent remain application responsibilities.'], source: 'packages/vanilla/src/content.ts',
  },
  'notification-list': {
    summary: 'Display an application-owned collection of notifications with distinct unread status, destinations and optional actions.',
    usage: `<section class="hw-notification-list" aria-labelledby="notifications-title">
  <h2 id="notifications-title">Notifications</h2><ul>
    <li data-state="unread"><h3><a class="hw-link" href="./requests/HW-1043">Your license is ready</a></h3><span class="hw-badge" data-tone="info">Unread</span><p>View and download the issued document.</p><time datetime="2026-10-28T09:00:00+03:00">28 October, 09:00</time></li>
    <li data-state="read"><h3>Document received</h3><p>Your supporting document has been added.</p></li>
  </ul>
</section>`,
    api: [
      { name: 'items', type: 'notification array with stable IDs', description: 'React/Vue use read; Angular uses unread. Supply a title, optional description and an actual destination when navigation is available.' },
      { name: 'label / emptyMessage', type: 'localized text', description: 'Name the collection and explain the empty state without implying a loading failure.' },
      { name: 'data-state="unread"', type: 'CSS state', description: 'Vanilla unread styling also accepts data-unread="true" or data-read="false". Add a textual unread cue.' },
      { name: 'React onMarkRead / Angular dismissed', type: 'callback or event carrying item ID', description: 'The application changes the item collection after the action. The list does not synchronize with a notification service.' },
    ],
    lifecycle: ['Render from the notification collection, using stable IDs across updates.', 'Fetch or subscribe to data outside the component; reconcile read/dismiss actions into application state.', 'Preserve focus when an item is removed. Unsubscribe from application-owned polling or sockets when the owning view is destroyed; this static list has no vanilla enhancement controller.'],
    accessibility: ['Expose unread in text as well as background color.', 'Use time with a machine-readable datetime when an actual timestamp is known; localize the visible label.', 'Avoid making an entire continually changing inbox an assertive live region. Announce meaningful new arrivals separately.'],
    variants: ['Read and unread items', 'Empty state', 'Application-owned actions'], related: ['badge', 'toast-region', 'empty'],
    frameworkNotes: 'React items use dateTime/dateLabel/read and onMarkRead(id); Vue uses date/dateLabel/read with read(id) and dismiss(id) events. Angular items use time/unread and its dismissed event asks the parent to remove an item.',
    limitations: ['No push service, unread-count persistence or background subscription is supplied.'], source: contentSource,
  },
  container: {
    summary: 'Center page content inside a readable maximum width while retaining consistent inline gutters.',
    usage: `<div class="hw-container" style="--hw-layout-max-width:72rem; --hw-layout-padding:var(--hw-space-4)">
  <h2>Service directory</h2><p>Content stays centered as the viewport grows.</p>
</div>`,
    api: [{ name: 'maxWidth / --hw-layout-max-width', type: 'CSS length', description: 'Defaults to the content maximum token (78rem). Default inline size also leaves 1.5rem gutters on each side.' }, padding, { name: 'data-variant="fluid"', type: 'CSS variant', description: 'Uses the full available inline size without the default outer gutters.' }],
    lifecycle: ['CSS calculates the centered width on mount and whenever available space changes.', 'Update maxWidth or padding through framework props or CSS variables; no resize measurement is required.', noLayoutController],
    accessibility: ['A container has no landmark role. Put meaningful header, main, section and heading elements inside it.', 'Test zoom and long Arabic content; a maximum width does not fix overflow inside a child.'],
    variants: ['Constrained', 'Fluid'], related: ['section', 'grid', 'app-shell'], frameworkNotes: layoutFrameworks, source: layoutSource,
  },
  stack: {
    summary: 'Arrange a vertical sequence of fields, cards or content with consistent spacing between direct children.',
    usage: `<div class="hw-stack" style="--hw-layout-gap:var(--hw-space-3); --hw-layout-gap-md:var(--hw-space-5)">
  <h2>Review your request</h2><p>Check the information below before submitting.</p><button class="hw-button" type="button">Continue</button>
</div>`,
    api: [gap, padding, { name: 'align / --hw-layout-align', type: 'start | center | end | stretch | baseline', description: 'Cross-axis alignment; defaults to stretch. The layout is a nonwrapping flex column.' }, { name: 'justify / --hw-layout-justify', type: 'start | center | end | between | around | evenly', description: 'Distributes children vertically when extra height exists. The helper maps between/around/evenly to CSS space-* values.' }],
    lifecycle: ['Direct children form a flex column in DOM order.', 'Adding or removing children automatically recalculates gaps; avoid additional child margins that double the intended spacing.', noLayoutController],
    accessibility: ['Keep DOM order equal to reading and keyboard order.', 'Use a semantic ol or ul with the class when the content is a list; the React Stack component itself renders a div.'],
    variants: ['Start/center/end/stretch alignment', 'Responsive gap and padding'], related: ['inline', 'section', 'field'], frameworkNotes: layoutFrameworks, source: layoutSource,
  },
  inline: {
    summary: 'Group actions or short metadata in a horizontal flex row that wraps naturally when space is limited.',
    usage: `<div class="hw-inline" style="--hw-layout-gap:var(--hw-space-3); --hw-layout-justify:space-between">
  <span>Draft saved</span><div class="hw-inline"><button class="hw-button" type="button">Back</button><button class="hw-button" type="button">Continue</button></div>
</div>`,
    api: [gap, { name: 'wrap / --hw-layout-wrap', type: 'boolean / wrap | nowrap', description: 'Wraps by default. Use nowrap only when all content can fit or an intentional overflow treatment exists.' }, { name: 'align / justify', type: 'LayoutAlign / LayoutJustify', description: 'align defaults to center; justify defaults to start. In RTL the row starts on the logical right.' }],
    lifecycle: ['Flex layout places children in source order and wraps as available width changes.', 'Change alignment or spacing through props/variables. Nested Inline elements have their own defaults.', noLayoutController],
    accessibility: ['Do not reorder essential actions visually in a way that conflicts with keyboard order.', 'Use ButtonGroup when the controls need an accessible group label; Inline alone adds no role or name.'],
    variants: ['Wrapping default', 'No-wrap', 'Between distribution'], related: ['button-group', 'stack', 'spacer'], frameworkNotes: layoutFrameworks, source: layoutSource,
  },
  grid: {
    summary: 'Arrange equal-width cards or fields in responsive columns, using either explicit breakpoints or an adaptive minimum item width.',
    usage: `<div class="hw-grid" style="--hw-layout-columns:1; --hw-layout-columns-sm:2; --hw-layout-columns-lg:3; --hw-layout-gap:var(--hw-space-4)">
  <article class="hw-card"><div class="hw-card-body">First service</div></article>
  <article class="hw-card"><div class="hw-card-body">Second service</div></article>
  <article class="hw-card"><div class="hw-card-body">Third service</div></article>
</div>`,
    api: [{ name: 'columns / --hw-layout-columns', type: 'Responsive<positive integer>', description: 'Defaults to one. Example props: {base:1, sm:2, lg:3}; sm/md/lg/xl start at 40/48/64/80rem.' }, { name: 'minItemWidth / --hw-layout-min-item', type: 'CSS length', description: 'The helper also sets columns to auto-fit. In vanilla CSS set both --hw-layout-columns:auto-fit and --hw-layout-min-item:16rem.' }, gap, padding],
    lifecycle: ['CSS Grid calculates columns and item widths without JavaScript viewport access.', 'Explicit columns follow viewport breakpoints. Adaptive minItemWidth responds to the actual available container width.', 'When updating layoutStyles() output manually, remove previously set variables before applying a new object so omitted options do not linger.', noLayoutController],
    accessibility: ['The visual grid does not imply role="grid". Use ordinary document or list semantics for cards.', 'Keep logical DOM order and check narrow children, zoom and long unbroken content.'],
    variants: ['Counted responsive columns', 'Adaptive auto-fit'], related: ['columns', 'container', 'service-card'], frameworkNotes: layoutFrameworks, limitations: ['minItemWidth takes precedence over columns; choose one strategy. Breakpoint props are viewport queries, not container queries.'], source: layoutSource,
  },
  columns: {
    summary: 'Give an explicitly column-based composition the same responsive CSS Grid contract as Grid.',
    usage: `<div class="hw-columns" style="--hw-layout-columns:1; --hw-layout-columns-md:2; --hw-layout-gap:var(--hw-space-6)">
  <section aria-labelledby="contact-title"><h2 id="contact-title">Contact details</h2><p>Contact information goes here.</p></section>
  <section aria-labelledby="address-title"><h2 id="address-title">Address</h2><p>Address information goes here.</p></section>
</div>`,
    api: [{ name: 'columns', type: 'Responsive<positive integer>', description: 'Use explicit equal-width counts. Missing responsive steps inherit the nearest smaller specified count.' }, { name: 'minItemWidth', type: 'CSS length', description: 'Enables adaptive auto-fit in place of explicit counts. It is available here just as in Grid.' }, gap, padding],
    lifecycle: ['Sections remain in source order while CSS changes their column count.', 'Update columns or gap in the framework style contract; the rendered markup remains the same across SSR and browser rendering.', noLayoutController],
    accessibility: ['Group related fields or content semantically; column placement is presentation only.', 'Ensure the stacked mobile order is meaningful before choosing desktop placement.'],
    variants: ['Equal responsive columns', 'Adaptive columns'], related: ['grid', 'sidebar', 'stack'], frameworkNotes: layoutFrameworks, limitations: ['There is no separate fractional track-size API. Use Sidebar for a narrow contextual column or application-owned CSS Grid for custom track templates.'], source: layoutSource,
  },
  sidebar: {
    summary: 'Place contextual navigation or guidance beside primary content, with a predictable stacked layout at smaller widths.',
    usage: `<div class="hw-sidebar" data-side="end" data-collapse-at="lg" style="--hw-layout-sidebar-width:20rem; --hw-layout-gap:var(--hw-space-6)">
  <aside aria-label="Application guidance"><h2>Before you start</h2><p>Keep your license reference available.</p></aside>
  <section aria-labelledby="application-title"><h2 id="application-title">Your application</h2><p>Main content goes here.</p></section>
</div>`,
    api: [{ name: 'side / data-side', type: 'start | end', description: 'Logical placement of the first child at wide widths; RTL changes which physical edge that means.' }, { name: 'sidebarWidth', type: 'CSS length', description: 'Defaults to 18rem and is capped at 40% of the available width.' }, { name: 'collapseAt / data-collapse-at', type: 'sm | md | lg', description: 'Two-column layout begins at 40rem, 48rem (default) or 64rem. Below it children stack.' }, gap],
    lifecycle: ['Supply exactly two direct children: sidebar first and primary content second.', 'CSS moves the first child to the logical end when requested. Below collapseAt both return to their original DOM order.', 'Stacking does not hide navigation or turn it into a drawer; add an explicit disclosure if that behavior is needed.', noLayoutController],
    accessibility: ['Name the aside or navigation where needed; use a meaningful source order before any visual rearrangement.', 'Keyboard focus follows DOM order even when side=end changes desktop placement.'],
    variants: ['Start or end', 'sm/md/lg collapse'], related: ['drawer', 'app-shell', 'columns'], frameworkNotes: 'React and Vue Sidebar use two direct children. Angular hw-sidebar projects the contextual child with [hwSidebar], then renders remaining content as the main sibling. All share side, collapseAt and sidebarWidth.', source: layoutSource,
  },
  center: {
    summary: 'Center a compact piece of content within available space using a flex column and centered text.',
    usage: `<div class="hw-center" style="min-block-size:16rem; --hw-layout-gap:var(--hw-space-3)">
  <h2>No requests yet</h2><p>Your submitted requests will appear here.</p><a class="hw-button" href="./services">Explore services</a>
</div>`,
    api: [gap, padding, { name: 'align / justify', type: 'LayoutAlign / LayoutJustify', description: 'Both default to center. Vertical centering only has an effect when the container has extra height.' }, { name: 'min-block-size', type: 'native CSS length', description: 'The application supplies available height; Center does not force a viewport-sized box.' }],
    lifecycle: ['CSS aligns the content when mounted and recomputes as its dimensions change.', 'Allow the container to grow for translations and larger text; avoid fixed heights that clip content.', noLayoutController],
    accessibility: ['Keep a clear heading and actual action within centered empty or success states.', 'Use start-aligned longer prose when centered text becomes difficult to read.'],
    variants: ['Both-axis centering', 'Application-supplied minimum height'], related: ['empty', 'container', 'stack'], frameworkNotes: layoutFrameworks, source: layoutSource,
  },
  spacer: {
    summary: 'Consume spare space within a flex row or column to separate groups without adding visible or semantic content.',
    usage: `<div class="hw-inline">
  <span>Request draft</span><div class="hw-spacer" aria-hidden="true"></div><button class="hw-button" type="button">Save draft</button>
</div>`,
    api: [{ name: 'flex', type: 'CSS default: 1 1 0%', description: 'The spacer grows into remaining flex space. It is useful inside Inline or Stack, not as a substitute for grid columns.' }, { name: 'gap / --hw-layout-gap', type: 'Responsive spacing', description: 'Optional minimum inline and block size. Defaults to zero for Spacer.' }, { name: 'aria-hidden', type: '"true"', description: 'Hide this empty decorative element from assistive technology; Angular supplies it automatically.' }],
    lifecycle: ['The flex parent distributes remaining space to the spacer.', 'When no space remains the spacer can shrink; use the optional minimum only when it will not force overflow.', noLayoutController],
    accessibility: ['Keep Spacer empty and unfocusable.', 'Do not use an empty labeled landmark or repeated spaces to achieve the same effect.'],
    variants: ['Flexible only', 'Minimum spacing'], related: ['inline', 'stack', 'button-group'], frameworkNotes: layoutFrameworks, source: layoutSource,
  },
  'aspect-ratio': {
    summary: 'Reserve a predictable media area before an image or video loads and control whether the media is cropped or contained.',
    usage: `<figure><div class="hw-aspect-ratio" data-fit="contain" style="--hw-layout-ratio:1.333333333">
  <img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23e1f2ed%22%2F%3E%3Cpath%20d%3D%22M0%20450L800%20150M200%200L600%20600%22%20stroke%3D%22%23b3d7cc%22%20stroke-width%3D%2250%22%2F%3E%3Cpath%20d%3D%22M200%20400L400%20300L600%20200%22%20fill%3D%22none%22%20stroke%3D%22%23006c67%22%20stroke-width%3D%228%22%20stroke-dasharray%3D%2212%2012%22%2F%3E%3Cg%20fill%3D%22%23006c67%22%20stroke%3D%22white%22%20stroke-width%3D%228%22%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22400%22%20r%3D%2224%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22300%22%20r%3D%2224%22%2F%3E%3Ccircle%20cx%3D%22600%22%20cy%3D%22200%22%20r%3D%2224%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E" alt="Illustration of three service center locations" width="800" height="600">
</div><figcaption>Illustrative service center map</figcaption></figure>`,
    api: [{ name: 'ratio / --hw-layout-ratio', type: 'positive finite number', description: 'Defaults to 16/9. Use 1 for square or 4/3 for landscape; the helper rejects zero, negative or nonfinite values.' }, { name: 'data-fit', type: 'contain (default behavior is cover)', description: 'Contain preserves the full image/video. Cover fills the reserved area and may crop edges.' }, { name: 'direct media child', type: 'img | video | iframe | canvas', description: 'These elements fill the wrapper; supply their own accessible names and controls as needed.' }],
    lifecycle: ['The CSS aspect ratio reserves height immediately from the available width.', 'Media loading and playback remain native browser behavior; the layout does not preload, pause or dispose media.', 'When removing media, stop any application-owned playback, streams or canvas work separately.'],
    accessibility: ['Write useful image alternative text and video captions; a ratio wrapper provides neither.', 'Give iframes a descriptive title and avoid cropping meaningful text or controls.'],
    variants: ['16:9 default', 'Square or custom ratio', 'Cover or contain'], related: ['carousel', 'card', 'grid'], frameworkNotes: layoutFrameworks, limitations: ['The example uses an embedded illustration. Replace it with your own hosted image in your application.'], source: layoutSource,
  },
  section: {
    summary: 'Create a meaningful section of the document with consistent inner spacing and an optional surface tone.',
    usage: `<section class="hw-section" data-tone="muted" aria-labelledby="requirements-title" style="--hw-layout-padding:var(--hw-space-4); --hw-layout-padding-lg:var(--hw-space-8)">
  <h2 id="requirements-title">Requirements</h2><p>Prepare your documents before starting.</p>
</section>`,
    api: [padding, { name: 'data-tone', type: 'muted | brand', description: 'Muted uses the subdued surface; brand uses the primary-subtle surface and matching text token.' }, { name: 'heading / accessible name', type: 'semantic HTML', description: 'Provide a meaningful heading; use aria-labelledby if the section should be a named region.' }],
    lifecycle: ['Render a semantic section; its default padding is spacing token 6.', 'Update tone or responsive padding without altering the document structure.', noLayoutController],
    accessibility: ['Choose headings according to the document hierarchy, not visual size.', 'Do not create many unnecessary named regions; use a div for a purely decorative grouping.'],
    variants: ['Default surface', 'Muted', 'Brand'], related: ['container', 'stack', 'page-header'], frameworkNotes: 'React Section renders section and accepts native attributes plus layout props. Vue Section can change its as tag. Angular hw-section has a label input for aria-label as well as layout inputs.', source: layoutSource,
  },
  'app-shell': {
    summary: 'Compose the persistent page frame around a main landmark: header, optional contextual sidebar and footer.',
    usage: `<a class="hw-skip-link" href="#main-content">Skip to content</a>
<div class="hw-app-shell">
  <header class="hw-app-shell-header"><a href="./" lang="ar">هوية</a></header>
  <aside class="hw-app-shell-sidebar" aria-label="Workspace navigation"><nav aria-label="Workspace"><a href="./requests">Requests</a></nav></aside>
  <main class="hw-app-shell-main" id="main-content" tabindex="-1"><h1>My requests</h1><p>Your workspace content.</p></main>
  <footer class="hw-app-shell-footer">Service support</footer>
</div>`,
    api: [{ name: 'header / sidebar / main / footer', type: 'landmarks or hw-app-shell-* classes', description: 'Direct landmarks map to CSS grid areas. A .hw-app-shell-body wrapper is also supported.' }, { name: '--hw-layout-sidebar-width', type: 'CSS length', description: 'Default 18rem; the desktop shell caps it at 30% and uses a sidebar column from 64rem.' }, { name: 'data-side', type: 'start | end', description: 'Places the sidebar at a logical edge in the desktop layout.' }, { name: 'React mainId / skipLabel', type: 'string', description: 'Connects the built-in skip link to the rendered main. Angular exposes mainId; add a skip link at the application level for Vue/Angular.' }],
    lifecycle: ['Mount the persistent frame once around routed page content; CSS supplies a minimum block size of 100dvh.', 'At narrow widths header, sidebar, main and footer stack. At desktop widths the contextual column appears; without a sidebar, supported markup lets main span the full width.', 'Route changes should update main content and manage focus through the router, without replacing persistent navigation unnecessarily.', noLayoutController],
    accessibility: ['Render one main landmark per document and connect a working skip link to it.', 'Do not nest the shell inside an existing main; the component already creates one.', 'Keep navigation labels and source order meaningful in both RTL and LTR.'],
    variants: ['With contextual sidebar', 'Without sidebar (React/Vue or vanilla optional markup)', 'Logical end sidebar'], related: ['portal-header', 'portal-footer', 'sidebar', 'page-header'],
    frameworkNotes: 'React AppShell uses header/sidebar/footer React nodes and renders a skip link plus main. Vue uses header/sidebar/footer/default slots. Angular uses [hwShellHeader], [hwShellSidebar], [hwShellFooter] projection and creates all four landmark areas, including the sidebar even when empty.',
    limitations: ['AppShell does not implement routing or a mobile navigation drawer. Its sidebar breakpoint is fixed at 64rem; use Sidebar for a separately configurable collapse threshold.'], source: 'packages/react/src/expanded-layout.tsx',
  },
  'page-header': {
    summary: 'Give a page one clear title, a short description, breadcrumb context and a wrapping action group.',
    usage: `<header class="hw-page-header">
  <nav class="hw-breadcrumb" aria-label="Breadcrumb"><a href="./">Home</a><span aria-current="page">Requests</span></nav>
  <div class="hw-page-header-main"><div class="hw-page-header-content"><h1>My requests</h1><p>Review submitted requests and continue saved drafts.</p></div>
    <div class="hw-page-header-actions"><a class="hw-button" href="./services">Start a request</a></div>
  </div>
</header>`,
    api: [{ name: 'title / description', type: 'content', description: 'Required title and optional description. React and Angular render an h1; Vue level chooses a heading level from 1 to 6.' }, { name: 'breadcrumb', type: 'React node / Vue slot / Angular [hwBreadcrumb]', description: 'Optional full-width location context. Supply semantic breadcrumb navigation.' }, { name: 'actions', type: 'React node / Vue slot / Angular default content', description: 'A wrapping group of page-level actions; avoid fixed widths for translated labels.' }, gap],
    lifecycle: ['Render from the current route title and action availability.', 'Update the title and actions together after navigation. Router focus and document.title remain application responsibilities.', 'The layout wraps actions as width changes and has no event listeners or destruction step.'],
    accessibility: ['Prefer one page-level h1. Use a lower heading in an embedded composition when the adapter supports it or use vanilla markup.', 'Keep the primary action specific to the page and preserve visible labels.', 'If a sticky header exists, give anchored/focused headings enough scroll margin.'],
    variants: ['Title only', 'Description and actions', 'Breadcrumb row'], related: ['breadcrumb', 'button-group', 'app-shell'],
    frameworkNotes: 'React PageHeader accepts title, description, breadcrumb and actions nodes. Vue accepts title, description and level with breadcrumb/actions slots. Angular hw-page-header accepts title and description, projecting [hwBreadcrumb] and default content for actions. React PageHeader currently exposes native header props rather than the full shared LayoutProps interface; set CSS variables through style for its spacing.',
    source: 'packages/react/src/expanded-layout.tsx',
  },
};
