// Type fixture for react.text-contract.test.tsx. It is compiled, never run: every element marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an error),
// and every unmarked element must compile.
import { Button, Collapsible, ContentNavigation, Menu, Popover, PortalHeader, PortalLayout, SideNavigation, SiteVerification, Tabs, TreeView } from '../src/index.js';

const items = [{ id: 'intro', label: 'Introduction' }];
const tabs = [{ value: 'one', label: 'One', content: 'First' }];
const tree = { items: [{ id: 'a', label: 'A' }], getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse' };
const menu = { items: [{ value: 'a', label: 'A' }], trigger: <Button>Actions</Button> };
const layout = { brand: 'Portal', skipLabel: 'Skip', menuLabel: 'Menu', navigationLabel: 'Main' };
const footer = { externalLabel: 'Opens in a new window', links: [{ label: 'Terms', href: '/terms' }] };
const verification = { label: 'Verification', detailsLabel: 'Details', domainLabel: 'Domain', domainDescription: 'Domain text', httpsLabel: 'HTTPS', httpsDescription: 'HTTPS text', registrationLabel: 'Registration' };
const header = { brand: 'Portal', navigationLabel: 'Main', menuLabel: 'Menu' };

export const accepted = <>
  <ContentNavigation items={items} label="On this page" />
  <ContentNavigation items={items} aria-label="Contents" />
  <ContentNavigation items={items} aria-labelledby="contents-heading" />
  <SideNavigation items={items} label="Sections" />
  <SideNavigation items={items} aria-label="Sections" />
  <SideNavigation items={items} aria-labelledby="sections-heading" />
  <TreeView {...tree} label="Site" />
  <TreeView {...tree} aria-labelledby="site-heading" />
  <Tabs items={tabs} overflow="scroll" label="Details" />
  <Tabs items={tabs} overflow="scroll" aria-labelledby="details-heading" />
  <Popover label="Filters" trigger={<Button>Filters</Button>}>Content</Popover>
  <Popover aria-labelledby="filters-heading" trigger={<Button>Filters</Button>}>Content</Popover>
  <Menu {...menu} aria-label="Actions" />
  <Collapsible label="More">Content</Collapsible>
  <PortalHeader {...header} links={[{ label: 'Home', href: '/' }]} homeHref="" />
  <PortalLayout {...layout} footerProps={{ externalLabel: 'Opens in a new window' }} />
  <PortalLayout {...layout} footerProps={footer} footerLabel="Footer links" />
  <SiteVerification {...verification} registrationHref="/registry" registrationExternal={false} />
  <SiteVerification {...verification} registrationHref="/registry" externalLabel="Opens in a new window" />
  <SiteVerification {...verification} />
</>;

export const rejected = <>
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <ContentNavigation items={items} />
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <SideNavigation items={items} />
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <TreeView {...tree} />
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <Tabs items={tabs} overflow="scroll" />
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <Menu {...menu} />
  {/* @ts-expect-error a label, an aria-label or an aria-labelledby is required */}
  <Popover trigger={<Button>Filters</Button>}>Content</Popover>
  {/* @ts-expect-error Popover title is replaced by label */}
  <Popover label="Filters" title={<h3>Filters</h3>} trigger={<Button>Filters</Button>}>Content</Popover>
  {/* @ts-expect-error Collapsible label is required (title is renamed) */}
  <Collapsible>Content</Collapsible>
  {/* @ts-expect-error footerLabel is required with footerProps.links */}
  <PortalLayout {...layout} footerProps={footer} />
  {/* @ts-expect-error externalLabel is required with registrationHref unless registrationExternal is false */}
  <SiteVerification {...verification} registrationHref="/registry" />
  {/* @ts-expect-error navigation is renamed to links */}
  <PortalHeader {...header} navigation={[{ label: 'Home', href: '/' }]} />
  {/* @ts-expect-error brandHref is renamed to homeHref */}
  <PortalHeader {...header} brandHref="/" />
</>;
