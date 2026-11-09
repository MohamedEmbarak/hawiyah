// @vitest-environment node
import { expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as N from './src/index.js';

it('server-renders all 50 additions without browser globals or implicit engines', () => {
  expect(typeof window).toBe('undefined');
  const html = renderToString(<>
    <N.InputGroup start="+966"><N.TextField aria-label="Phone" /></N.InputGroup>
    <N.PasswordField label="Password" /><N.SearchField label="Search" /><N.NumberField label="Quantity" min={0} />
    <N.Slider label="Volume" /><N.RangeSlider label="Budget" lowerLabel="Minimum" upperLabel="Maximum" /><N.Rating label="Rating" />
    <N.PinInput label="Code" /><N.TagInput label="Tags" /><N.MultiSelect label="Cities" options={[{ value: 'riyadh', label: 'الرياض' }]} />
    <N.Calendar defaultValue="2026-10-28" calendar="islamic-umalqura" /><N.DatePicker label="Date" defaultValue="2026-10-28" />
    <N.FileDropzone label="Documents" /><N.ToggleGroup label="Mode" options={[{ value: 'a', label: 'A' }]} />
    <N.Popover title="Help" trigger={<N.Button>Help</N.Button>}>Description</N.Popover>
    <N.Menu label="Actions" trigger={<N.Button>Actions</N.Button>} items={[{ value: 'a', label: 'Action' }]} />
    <N.Drawer title="Details">Details</N.Drawer><N.ToastRegion messages={[{ id: 'one', description: 'Saved' }]} />
    <N.Collapsible title="Details">Content</N.Collapsible><N.TreeView label="Services" items={[{ id: 'a', label: 'Service' }]} />
    <N.Carousel label="Services" slides={['One', 'Two']} /><N.Link href="#content">Read more</N.Link>
    <N.IconButton label="Add">+</N.IconButton><N.ButtonGroup label="Actions"><N.Button>Save</N.Button></N.ButtonGroup>
    <N.Chip>Tag</N.Chip><N.DescriptionList items={[{ term: 'Fee', description: 'Free' }]} /><N.Stat label="Requests" value={12} />
    <N.Timeline items={[{ id: 'one', title: 'Received' }]} /><N.Meter label="Usage" value={0.5} />
    <N.AvatarGroup label="Team" items={[{ name: 'Demo User' }]} />
    <N.DataTable caption="Requests" columns={[{ key: 'name', label: 'Name', sortable: true }]} rows={[{ name: 'Example' }]} />
    <N.ServiceCard title="Permit" description="Apply for a permit" href="#apply" /><N.ServiceDetails title="Permit" requirements={['Contact details']} />
    <N.PortalHeader brand="Independent portal" navigation={[{ label: 'Home', href: '/' }]} /><N.PortalFooter legal="Independent example" />
    <N.Feedback label="Was this helpful?" /><N.CookieConsent title="Cookies" description="Choose a preference" />
    <N.NotificationList label="Notifications" items={[{ id: 'a', title: 'Received' }]} />
    <N.Container maxWidth="72rem"><N.Stack gap={4}><N.Inline wrap gap={{ base: 2, md: 4 }}>Inline</N.Inline></N.Stack></N.Container>
    <N.Grid columns={{ base: 1, md: 3 }}>Grid</N.Grid><N.Columns columns={2}>Columns</N.Columns>
    <N.Sidebar side="end" collapseAt="md"><aside>Side</aside><div>Body</div></N.Sidebar>
    <N.Center>Centered</N.Center><N.Spacer /><N.AspectRatio ratio={16 / 9}>Media</N.AspectRatio>
    <N.Section>Section</N.Section><N.AppShell header="Header" footer="Footer">Main</N.AppShell>
    <N.PageHeader title="Services" description="Explore services" />
  </>);
  expect(html).toContain('hw-date-picker-value');
  for (const name of ['input-group', 'password-field', 'search-field', 'number-field', 'slider', 'range-slider', 'rating', 'pin-input', 'tag-input', 'multi-select', 'calendar', 'date-picker', 'file-dropzone', 'toggle-group', 'popover', 'menu', 'drawer', 'toast-region', 'collapsible', 'tree-view', 'carousel', 'link', 'icon-button', 'button-group', 'chip', 'description-list', 'stat', 'timeline', 'meter', 'avatar-group', 'data-table', 'service-card', 'service-details', 'portal-header', 'portal-footer', 'feedback', 'cookie-consent', 'notification-list', 'container', 'stack', 'inline', 'grid', 'columns', 'sidebar', 'center', 'spacer', 'aspect-ratio', 'section', 'app-shell', 'page-header']) expect(html).toContain(`hw-${name}`);
});
it('serializes layout variables without leaking presentation props onto HTML', () => {
  const html = renderToString(<N.Grid columns={{ base: 1, md: 3 }} gap={{ base: 2, lg: '2rem' }} padding={4} align="center" justify="between" wrap aria-label="Cards">Content</N.Grid>);
  expect(html).toContain('--hw-layout-columns:1');
  expect(html).toContain('--hw-layout-columns-md:3');
  expect(html).toContain('--hw-layout-gap-lg:2rem');
  expect(html).toContain('--hw-layout-justify:space-between');
  expect(html).not.toMatch(/\s(?:gap|columns|padding|justify|wrap)=/u);
});
