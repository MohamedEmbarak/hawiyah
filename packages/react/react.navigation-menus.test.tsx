import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { resetTextWarnings } from '@hawiyah/core';
import { Button, Menu, Popover, PortalHeader, ServiceCard, ServiceDetails, TreeView } from './src/index.js';
import type { PortalHeaderProps, ServiceDetailsProps, TreeViewProps } from './src/index.js';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root; let warn: ReturnType<typeof vi.spyOn>;
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
async function render(node: ReactNode) { await act(async () => root.render(node)); }
function press(element: Element, name: string) { const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }); act(() => { element.dispatchEvent(event); }); return event; }
async function click(element: Element) { await act(async () => (element as HTMLElement).click()); }
async function event(element: Element | Document, type: string, init: EventInit & { relatedTarget?: EventTarget | null } = {}) {
  await act(async () => { element.dispatchEvent(type.startsWith('focus') ? new FocusEvent(type, { bubbles: true, ...init }) : new Event(type, { bubbles: true, cancelable: true, ...init })); });
}
async function focusTo(element: HTMLElement) { await act(async () => element.focus()); }
async function hydrates(node: ReactNode) {
  const html = renderToString(node);
  await act(async () => root.unmount()); const errors = vi.fn(); const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  container.innerHTML = html; await act(async () => { root = hydrateRoot(container, node, { onRecoverableError: errors }); });
  expect(errors).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); error.mockRestore();
  return html;
}
const active = () => document.activeElement as HTMLElement;

beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); warn.mockRestore(); });

describe('Menu', () => {
  const items = [{ value: 'archive', label: 'Archive' }, { value: 'bookmark', label: 'Bookmark' }, { value: 'delete', label: 'Delete', disabled: true }, { value: 'download', label: 'Download' }, { value: 'duplicate', label: 'Duplicate' }];
  const menu = () => container.querySelector('[role=menu]')!;
  async function openMenu(props: Partial<Parameters<typeof Menu>[0]> = {}) {
    await render(<><Menu label="Actions" items={items} trigger={<Button>Actions</Button>} {...props} /><button id="outside">Outside</button></>);
    await click(container.querySelector('[aria-haspopup=menu]')!);
  }
  it('[TYPE-10][TYPE-13][nav-b-1] type-ahead moves to the next enabled item and cycles on a repeated letter', async () => {
    await openMenu(); expect(active().textContent).toBe('Archive');
    expect(press(menu(), 'd').defaultPrevented).toBe(true); await act(async () => undefined); expect(active().textContent).toBe('Download');
    press(menu(), 'd'); await act(async () => undefined); expect(active().textContent).toBe('Duplicate');
  });
  it('[TYPE-12] a key with no match keeps focus and the default action', async () => {
    await openMenu();
    expect(press(menu(), 'z').defaultPrevented).toBe(false); expect(active().textContent).toBe('Archive');
  });
  it('[TYPE-14] closing the menu clears the buffer', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      await openMenu(); press(menu(), 'a'); press(menu(), 'Escape'); await act(async () => undefined);
      await click(container.querySelector('[aria-haspopup=menu]')!);
      press(menu(), 'b'); await act(async () => undefined); expect(active().textContent).toBe('Bookmark');
    } finally { vi.useRealTimers(); }
  });
  it('[SHAPE-01][SHAPE-02][nav-b-2] items are direct .hw-menu-item children of div.hw-menu-content and report their value', async () => {
    const action = vi.fn();
    await render(<Menu label="Actions" defaultOpen onAction={action} trigger={<Button>Actions</Button>} items={[{ value: 'edit', label: 'Edit' }, { value: 'archive', label: 'Archive', disabled: true }, { value: 'help', label: 'Help', href: '#help' }]} />);
    const content = container.querySelector('div.hw-menu-content[role=menu]')!;
    expect(Array.from(content.children, child => [child.localName, child.className, child.getAttribute('role')])).toEqual([['button', 'hw-menu-item', 'menuitem'], ['button', 'hw-menu-item', 'menuitem'], ['a', 'hw-menu-item', 'menuitem']]);
    expect((content.children[1] as HTMLButtonElement).disabled).toBe(true); expect(container.querySelector('.hw-menu-list, li')).toBeNull();
    await click(content.children[0]); expect(action.mock.calls).toEqual([['edit']]);
    await click(container.querySelector('[aria-haspopup=menu]')!); await click(content.children[1]); expect(action).toHaveBeenCalledTimes(1);
    content.children[2].addEventListener('click', event => event.preventDefault());
    await click(content.children[2]); expect(action.mock.calls.at(-1)).toEqual(['help']); expect(content.children[2].getAttribute('href')).toBe('#help');
  });
  it('[STATE-01][STATE-02][STATE-03][STATE-05] open: one notification per change, controlled follows the application, server render agrees', async () => {
    const changed = vi.fn();
    await openMenu({ onOpenChange: changed }); expect(changed.mock.calls).toEqual([[true]]);
    await render(<Menu label="Actions" items={items} open={false} onOpenChange={changed} trigger={<Button>Actions</Button>} />); changed.mockClear();
    await click(container.querySelector('[aria-haspopup=menu]')!); expect(changed.mock.calls).toEqual([[true]]); expect(menu().hasAttribute('hidden')).toBe(true);
    changed.mockClear(); await render(<Menu label="Actions" items={items} open onOpenChange={changed} trigger={<Button>Actions</Button>} />);
    expect(changed).not.toHaveBeenCalled(); expect(menu().hasAttribute('hidden')).toBe(false);
    await hydrates(<Menu label="Actions" items={items} defaultOpen trigger={<Button>Actions</Button>} />);
  });
  it('[MENU-01] keyboard: ArrowUp opens on the last item, arrows skip the disabled item, Escape returns focus, Tab closes', async () => {
    await render(<><Menu label="Actions" items={items} trigger={<Button>Actions</Button>} /><button id="outside">Outside</button></>);
    const trigger = container.querySelector<HTMLElement>('[aria-haspopup=menu]')!;
    act(() => trigger.focus()); press(trigger, 'ArrowUp'); await act(async () => undefined); expect(active().textContent).toBe('Duplicate');
    press(menu(), 'Home'); press(menu(), 'ArrowDown'); press(menu(), 'ArrowDown'); await act(async () => undefined); expect(active().textContent).toBe('Download');
    press(menu(), 'Escape'); await act(async () => undefined); expect(active()).toBe(trigger); expect(trigger.getAttribute('aria-expanded')).toBe('false');
    press(trigger, 'ArrowDown'); await act(async () => undefined); expect(active().textContent).toBe('Archive');
    press(menu(), 'Tab'); await act(async () => undefined); expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
  it('[MENU-02] a disabled menu has a disabled trigger; disabling an open menu closes it and notifies false once', async () => {
    const changed = vi.fn();
    await openMenu({ onOpenChange: changed }); changed.mockClear();
    await render(<><Menu label="Actions" items={items} trigger={<Button>Actions</Button>} onOpenChange={changed} disabled /><button id="outside">Outside</button></>);
    expect(container.querySelector<HTMLButtonElement>('[aria-haspopup=menu]')!.disabled).toBe(true); expect(menu().hasAttribute('hidden')).toBe(true); expect(changed.mock.calls).toEqual([[false]]);
  });
  it('[FOCUS-07][FOCUS-08][nav-b-7] focus moving outside closes without moving focus back; a focusout without relatedTarget keeps it open', async () => {
    const changed = vi.fn();
    await openMenu({ onOpenChange: changed }); changed.mockClear();
    await event(active(), 'focusout', { relatedTarget: null }); expect(menu().hasAttribute('hidden')).toBe(false); expect(changed).not.toHaveBeenCalled();
    const outside = container.querySelector<HTMLElement>('#outside')!; await focusTo(outside);
    expect(menu().hasAttribute('hidden')).toBe(true); expect(active()).toBe(outside); expect(changed.mock.calls).toEqual([[false]]);
  });
});

describe('Popover', () => {
  async function openPopover(props: Record<string, unknown> = {}) {
    await render(<><Popover label="Filters" trigger={<Button>Filters</Button>} {...props}><label><input type="checkbox" /> New</label></Popover><button id="after">After</button></>);
    const trigger = container.querySelector<HTMLElement>('[aria-controls]')!; await click(trigger); return trigger;
  }
  const panel = () => container.querySelector<HTMLElement>('.hw-popover-panel')!;
  it('[FOCUS-06][nav-b-7] Tab past the panel closes it, focus stays where it went, one notification', async () => {
    const changed = vi.fn(); const trigger = await openPopover({ onOpenChange: changed }); changed.mockClear();
    await focusTo(container.querySelector('input')!); await focusTo(container.querySelector<HTMLElement>('#after')!);
    expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(panel().hidden).toBe(true); expect(active().id).toBe('after'); expect(changed.mock.calls).toEqual([[false]]);
  });
  it('[FOCUS-08] a focusout without relatedTarget leaves the popover open', async () => {
    const changed = vi.fn(); await openPopover({ onOpenChange: changed }); changed.mockClear();
    await event(container.querySelector('input')!, 'focusout', { relatedTarget: null }); expect(panel().hidden).toBe(false); expect(changed).not.toHaveBeenCalled();
  });
  it('[FOCUS-05][nav-b-8] Escape with focus outside does nothing to the popover', async () => {
    const changed = vi.fn(); await openPopover({ onOpenChange: changed }); changed.mockClear();
    const after = container.querySelector<HTMLElement>('#after')!; act(() => after.focus());
    await render(<><Popover label="Filters" trigger={<Button>Filters</Button>} open onOpenChange={changed}><label><input type="checkbox" /> New</label></Popover><button id="after">After</button></>);
    act(() => after.focus()); press(after, 'Escape'); await act(async () => undefined);
    expect(panel().hidden).toBe(false); expect(active()).toBe(after); expect(changed).not.toHaveBeenCalled();
  });
  it('[POPOVER-01] Escape from the panel or the trigger closes and focuses the trigger, also when opened by the open state', async () => {
    const trigger = await openPopover();
    act(() => container.querySelector('input')!.focus()); press(container.querySelector('input')!, 'Escape'); await act(async () => undefined);
    expect(panel().hidden).toBe(true); expect(active()).toBe(trigger);
    await click(trigger); press(trigger, 'Escape'); await act(async () => undefined); expect(panel().hidden).toBe(true); expect(active()).toBe(trigger);
    await act(async () => root.unmount()); root = createRoot(container);
    await render(<Popover label="Filters" defaultOpen trigger={<Button>Filters</Button>}><input type="checkbox" /></Popover>);
    act(() => container.querySelector('input')!.focus()); press(container.querySelector('input')!, 'Escape'); await act(async () => undefined);
    expect(active()).toBe(container.querySelector('[aria-controls]'));
  });
  it('[POPOVER-02][nav-b-9] the panel is div.hw-popover-panel[role=region] holding only the application content', async () => {
    await openPopover();
    expect(panel().localName).toBe('div'); expect(panel().getAttribute('role')).toBe('region'); expect(panel().getAttribute('aria-label')).toBe('Filters');
    expect(panel().innerHTML).toBe('<label><input type="checkbox"> New</label>'); expect(container.querySelector('.hw-popover')!.hasAttribute('aria-label')).toBe(false);
  });
  it('[POPOVER-03] disabled: trigger disabled, panel hidden, an open popover closes with one notification', async () => {
    const changed = vi.fn(); await openPopover({ onOpenChange: changed }); changed.mockClear();
    await render(<Popover label="Filters" disabled onOpenChange={changed} trigger={<Button>Filters</Button>}>Content</Popover>);
    expect(container.querySelector<HTMLButtonElement>('[aria-controls]')!.disabled).toBe(true); expect(panel().hidden).toBe(true); expect(changed.mock.calls).toEqual([[false]]);
  });
});

describe('TreeView', () => {
  const items = [{ id: 'services', label: 'Services', children: [{ id: 'permits', label: 'Permits' }, { id: 'payments', label: 'Payments' }] }, { id: 'profile', label: 'Profile' }, { id: 'privacy', label: 'Privacy', children: [{ id: 'pdpl', label: 'Personal data' }] }];
  const texts = { label: 'Site', getExpandLabel: (node: { id: string }) => `Expand ${node.id}`, getCollapseLabel: (node: { id: string }) => `Collapse ${node.id}` };
  const item = (label: string) => Array.from(container.querySelectorAll<HTMLElement>('[role=treeitem]')).find(node => node.querySelector(':scope > span')!.textContent === label)!;
  it('[TYPE-11][TYPE-12][TYPE-13][nav-b-15] type-ahead searches visible nodes only and cycles', async () => {
    await render(<TreeView {...texts} items={items} defaultExpanded={['services']} />);
    act(() => item('Services').focus());
    press(item('Services'), 'p'); await act(async () => undefined); expect(active()).toBe(item('Permits'));
    press(active(), 'p'); await act(async () => undefined); expect(active()).toBe(item('Payments'));
    press(active(), 'p'); press(active(), 'p'); await act(async () => undefined); expect(active()).toBe(item('Privacy'));
    expect(press(active(), 'x').defaultPrevented).toBe(false); expect(active()).toBe(item('Privacy'));
  });
  it('[TREE-01][nav-b-12] each item carries --hw-tree-depth and no inline padding', async () => {
    await render(<TreeView {...texts} items={items} defaultExpanded={['services']} />);
    for (const node of container.querySelectorAll<HTMLElement>('[role=treeitem]')) { expect(node.style.getPropertyValue('--hw-tree-depth')).toBe(String(Number(node.getAttribute('aria-level')) - 1)); expect(node.style.paddingInlineStart).toBe(''); }
  });
  it('[TREE-03][TREE-05][nav-b-13][R21] branch toggles are named, outside the tab order, and not part of the item name', async () => {
    await render(<TreeView {...texts} items={items} defaultExpanded={['services']} />);
    const toggle = (label: string) => item(label).querySelector<HTMLButtonElement>(':scope > button.hw-tree-toggle');
    expect(toggle('Services')!.getAttribute('aria-label')).toBe('Collapse services'); expect(toggle('Services')!.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('minus-sign');
    expect(toggle('Privacy')!.getAttribute('aria-label')).toBe('Expand privacy'); expect(toggle('Privacy')!.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('add-01');
    expect(toggle('Privacy')!.tabIndex).toBe(-1); expect(toggle('Profile')).toBeNull();
    for (const node of container.querySelectorAll('[role=treeitem]')) expect(document.getElementById(node.getAttribute('aria-labelledby')!)!.textContent).toBe(node.querySelector(':scope > span')!.textContent);
  });
  it('[TREE-04][STATE-01] the toggle expands without selecting, notifies once and focuses the item', async () => {
    const expanded = vi.fn(); const changed = vi.fn();
    await render(<TreeView {...texts} items={items} onExpandedChange={expanded} onValueChange={changed} />);
    await click(item('Privacy').querySelector('button')!);
    expect(expanded.mock.calls).toEqual([[['privacy']]]); expect(changed).not.toHaveBeenCalled(); expect(active()).toBe(item('Privacy'));
  });
  it('[STATE-02][STATE-03][SHAPE-01][nav-b-17] controlled expanded follows the application; changing it does not notify', async () => {
    const expanded = vi.fn();
    await render(<TreeView {...texts} items={items} expanded={[]} onExpandedChange={expanded} />);
    await click(item('Privacy').querySelector('button')!); expect(expanded).toHaveBeenCalledTimes(1); expect(item('Privacy').getAttribute('aria-expanded')).toBe('false');
    expanded.mockClear(); await render(<TreeView {...texts} items={items} expanded={['services']} onExpandedChange={expanded} />); expect(expanded).not.toHaveBeenCalled();
    expect(Array.from(container.querySelectorAll('[role=treeitem]'), node => ['aria-level', 'aria-posinset', 'aria-setsize', 'aria-expanded'].map(name => node.getAttribute(name)))).toEqual([['1', '1', '3', 'true'], ['2', '1', '2', null], ['2', '2', '2', null], ['1', '2', '3', null], ['1', '3', '3', 'false']]);
  });
  it('[TEXT-01] a missing getExpandLabel leaves the toggle unnamed and warns once', async () => {
    const { getExpandLabel: _omitted, ...rest } = texts;
    await render(<TreeView {...(rest as TreeViewProps)} items={items} />);
    expect(item('Privacy').querySelector('button')!.hasAttribute('aria-label')).toBe(false);
    expect(warnings().filter(message => message.includes('TreeView') && message.includes('getExpandLabel'))).toHaveLength(1);
  });
});

describe('PortalHeader', () => {
  const links = [{ label: 'Services', href: '/services', groups: [{ links: [{ label: 'Permits', href: '/permits' }] }] }, { label: 'About', href: '/about', groups: [{ links: [{ label: 'Team', href: '/team' }] }] }, { label: 'Contact', href: '/contact' }];
  const header = { brand: 'Portal', navigationLabel: 'Main', menuLabel: 'Menu', links } satisfies PortalHeaderProps;
  const branch = (index: number) => container.querySelectorAll<HTMLDetailsElement>('details[data-hw-portal-branch]')[index]!;
  const heading = (index: number) => branch(index).querySelector('summary')!;
  async function withFirstOpen(props: Partial<PortalHeaderProps> = {}) {
    await render(<><PortalHeader {...header} {...props as object} /><button id="outside">Outside</button></>);
    await click(heading(0)); expect(branch(0).open).toBe(true);
  }
  it('[PORTAL-01][portal-shell-1] a press on another heading does not close the open branch before its click', async () => {
    await withFirstOpen();
    await event(heading(1), 'pointerdown'); await event(branch(0).querySelector('a')!, 'focusout', { relatedTarget: heading(1) });
    expect(branch(0).open).toBe(true);
    await click(heading(1)); expect(branch(1).open).toBe(true); expect(branch(0).open).toBe(false);
  });
  it('[PORTAL-02] without a press, focus moving to another heading closes the open branch', async () => {
    await withFirstOpen();
    await event(branch(0).querySelector('a')!, 'focusout', { relatedTarget: heading(1) }); expect(branch(0).open).toBe(false);
  });
  it('[PORTAL-03] pointercancel or a keydown clears the press', async () => {
    await withFirstOpen();
    await event(heading(1), 'pointerdown'); await event(document, 'pointercancel');
    await event(branch(0).querySelector('a')!, 'focusout', { relatedTarget: heading(1) }); expect(branch(0).open).toBe(false);
    await click(heading(0)); await event(heading(1), 'pointerdown'); press(heading(1), 'Shift');
    await event(branch(0).querySelector('a')!, 'focusout', { relatedTarget: heading(1) }); expect(branch(0).open).toBe(false);
  });
  it('[STATE-01][STATE-02][STATE-03][portal-shell-4] open: the toggle notifies once; controlled follows the application only', async () => {
    const changed = vi.fn();
    await render(<PortalHeader {...header} onOpenChange={changed} />);
    const toggle = container.querySelector('.hw-portal-menu-toggle')!;
    await click(toggle); expect(changed.mock.calls).toEqual([[true]]); expect(container.querySelector('nav')!.getAttribute('data-open')).toBe('true');
    changed.mockClear(); await render(<PortalHeader {...header} open={false} onOpenChange={changed} />);
    await click(toggle); expect(changed.mock.calls).toEqual([[true]]); expect(toggle.getAttribute('aria-expanded')).toBe('false');
    changed.mockClear(); await render(<PortalHeader {...header} open onOpenChange={changed} />); expect(changed).not.toHaveBeenCalled(); expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
  it('[STATE-05] server render with defaultOpen equals the first client render', async () => {
    const html = await hydrates(<PortalHeader {...header} defaultOpen />);
    expect(html).toContain('aria-expanded="true"'); expect(html).toContain('data-open="true"');
  });
  it('[PORTAL-05] each closing path notifies false once; Escape focuses the toggle', async () => {
    const changed = vi.fn();
    function Controlled() { const [open, setOpen] = useState(false); return <><PortalHeader {...header} open={open} onOpenChange={next => { changed(next); setOpen(next); }} /><button id="outside">Outside</button></>; }
    await render(<Controlled />); const toggle = container.querySelector<HTMLElement>('.hw-portal-menu-toggle')!;
    const reopen = async () => { await click(toggle); changed.mockClear(); };
    await reopen(); act(() => toggle.focus()); press(toggle, 'Escape'); await act(async () => undefined); expect(changed.mock.calls).toEqual([[false]]); expect(active()).toBe(toggle);
    await reopen(); await event(container.querySelector('#outside')!, 'pointerdown'); expect(changed.mock.calls).toEqual([[false]]);
    await reopen(); await event(toggle, 'focusout', { relatedTarget: container.querySelector('#outside') }); expect(changed.mock.calls).toEqual([[false]]);
    await reopen(); const link = container.querySelector('nav a[href="/contact"]')!; link.addEventListener('click', event => event.preventDefault()); await click(link); expect(changed.mock.calls).toEqual([[false]]);
  });
  it('[PORTAL-06][SHAPE-01][E06] brand, toggle, nav and actions are direct children of the header in order', async () => {
    await render(<PortalHeader {...header} homeHref="/" actions={<button>Sign in</button>} />);
    const root = container.querySelector('header.hw-portal-header')!;
    expect(Array.from(root.children).map((child, index) => child.matches(['.hw-portal-brand', 'button.hw-portal-menu-toggle', 'nav', 'div.hw-portal-header-actions'][index]))).toEqual([true, true, true, true]); expect(root.children).toHaveLength(4);
    expect(container.querySelector('.hw-portal-header-main')).toBeNull(); expect(container.querySelectorAll('nav details')).toHaveLength(2);
  });
  it('[PORTAL-08][E04] the brand is a link by default, a div with role=img and the label without a home link', async () => {
    await render(<PortalHeader {...header} brandLabel="Portal home" />);
    let brand = container.querySelector('.hw-portal-brand')!; expect(brand.localName).toBe('a'); expect(brand.getAttribute('href')).toBe('/'); expect(brand.hasAttribute('role')).toBe(false);
    await render(<PortalHeader {...header} homeHref="" brandLabel="Portal" />);
    brand = container.querySelector('.hw-portal-brand')!; expect(brand.localName).toBe('div'); expect(brand.getAttribute('role')).toBe('img'); expect(brand.getAttribute('aria-label')).toBe('Portal');
    await render(<PortalHeader {...header} homeHref="" />);
    brand = container.querySelector('.hw-portal-brand')!; expect(brand.hasAttribute('role')).toBe(false); expect(brand.hasAttribute('aria-label')).toBe(false);
  });
});

describe('ServiceCard and ServiceDetails', () => {
  const metadata = [{ term: 'Duration', description: '3 days' }, { term: 'Fee', description: 'Free' }];
  it('[SHAPE-01][SERVICE-00][SERVICE-01][service-patterns-1][service-patterns-2] the card anatomy and facts', async () => {
    await render(<ServiceCard title="Permit" description="Apply" category="Business" metadata={metadata} href="/permit" actionLabel="Open service" icon={<span className="hw-icon" data-icon="file-01" />} />);
    const card = container.querySelector('article.hw-service-card')!;
    expect(card.querySelector('header.hw-card-header > div.hw-service-card-icon[aria-hidden=true]')).not.toBeNull();
    expect(card.querySelector('header.hw-card-header span.hw-badge + h3')!.textContent).toBe('Permit'); expect(card.querySelector('h3 a')).toBeNull();
    expect(Array.from(card.querySelectorAll('.hw-card-body > p + dl.hw-description-list > div'), entry => [entry.querySelector('dt')!.textContent, entry.querySelector('dd')!.textContent])).toEqual([['Duration', '3 days'], ['Fee', 'Free']]);
    expect(card.querySelectorAll('footer a.hw-link')).toHaveLength(1);
    await render(<><ServiceCard title="Permit" metadata={[]} /><ServiceDetails title="Permit" metadata={[]} /></>); expect(container.querySelector('dl')).toBeNull();
  });
  it('[SERVICE-02][TEXT-02][R18] the packaged action exists only with href; the application action replaces it', async () => {
    await render(<ServiceCard title="Permit" />); expect(container.querySelector('a, button')).toBeNull();
    await render(<ServiceCard title="Permit" href="/permit" action={<button>Apply</button>} />); expect(container.querySelectorAll('a, button')).toHaveLength(1); expect(warnings()).toEqual([]);
    await render(<ServiceCard title="Permit" href="/permit" actionLabel="Open" />); expect(container.querySelectorAll('a.hw-link')).toHaveLength(1);
  });
  it('[SERVICE-04][TEXT-02][RICH-01][service-patterns-7] details anatomy; requirements only with entries; rich requirements', async () => {
    await render(<ServiceDetails title="Permit" description="Apply" metadata={metadata} requirementsLabel="You need" requirements={['ID', <a key="a" href="#form">Form</a>]} action={<button>Apply</button>} />);
    const article = container.querySelector('article.hw-service-details')!;
    expect(Array.from(article.children, child => child.localName)).toEqual(['header', 'dl', 'section', 'footer']);
    expect(article.querySelector('section > h3 + ul')).not.toBeNull(); expect(article.querySelector('li a[href="#form"]')).not.toBeNull(); expect(article.lastElementChild!.querySelector('button')).not.toBeNull();
    await render(<ServiceDetails title="Permit" requirements={[]} />); expect(container.querySelector('section')).toBeNull(); expect(warnings()).toEqual([]);
  });
  it('[TEXT-01][R17] requirements without requirementsLabel: list without heading and one warning', async () => {
    await render(<ServiceDetails {...({ title: 'Permit', requirements: ['ID'] } as unknown as ServiceDetailsProps)} />);
    expect(container.querySelector('section h3')).toBeNull(); expect(container.querySelectorAll('section li')).toHaveLength(1);
    expect(warnings().filter(message => message.includes('ServiceDetails') && message.includes('requirementsLabel'))).toHaveLength(1);
  });
});
