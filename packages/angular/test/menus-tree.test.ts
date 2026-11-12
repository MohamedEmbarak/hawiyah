import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { text, withText } from './fixtures/application-text';
import { page } from './fixtures/page';
import { missingTextWarnings } from './fixtures/texts';

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(() => { vi.useRealTimers(); TestBed.resetTestingModule(); document.body.replaceChildren(); });

const press = (element: Element, key: string, init: KeyboardEventInit = {}) => { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }); element.dispatchEvent(event); return event; };
const forwarded = ['aria-label', 'aria-labelledby', 'aria-describedby'];
const bare = (host: Element) => { for (const name of forwarded) expect(host.hasAttribute(name), `${host.localName} ${name}`).toBe(false); };
const active = () => document.activeElement as HTMLElement;

describe('hw-menu', () => {
  const items = [{ value: 'edit', label: 'Edit' }, { value: 'archive', label: 'Archive', disabled: true }, { value: 'help', label: 'Help', href: '#help' }];
  const letters = [{ value: 'copy', label: 'Copy' }, { value: 'delete', label: 'Delete' }, { value: 'draft', label: 'Draft', disabled: true }, { value: 'duplicate', label: 'Duplicate' }, { value: 'bookmark', label: 'Bookmark' }];
  function menu(attributes = '', state: Record<string, unknown> = {}) {
    const action = vi.fn(), opened = vi.fn();
    const view = page(`<button type="button" id="before">Before</button><hw-menu label="Actions" triggerLabel="Actions" panelId="actions" ${attributes} (action)="action($event)" (openChange)="opened($event)" /><button type="button" id="after">After</button>`, { items, action, opened, ...state });
    const host = view.root.querySelector('hw-menu')!;
    return { ...view, action, opened, host, trigger: host.querySelector<HTMLButtonElement>('.hw-menu > button')!, panel: host.querySelector<HTMLElement>('[role=menu]')!, entries: () => [...host.querySelectorAll<HTMLElement>('[role=menuitem]')], after: view.root.querySelector<HTMLElement>('#after')! };
  }

  it('[SHAPE-01][nav-b-2] the shared item shape renders the documented structure: a menu with item children and no list wrapper', () => {
    const { host, trigger, panel, entries } = menu('[items]="items"');
    expect([...host.children].map(child => `${child.localName}.${child.className}`)).toEqual(['div.hw-menu']);
    expect([...host.firstElementChild!.children]).toEqual([trigger, panel]);
    expect(panel.className).toBe('hw-menu-content'); expect(panel.id).toBe('actions'); expect(panel.hidden).toBe(true); expect(panel.getAttribute('aria-label')).toBe('Actions');
    expect([...panel.children]).toEqual(entries()); expect(host.querySelector('ul, ol, li, .hw-menu-panel')).toBeNull();
    const [edit, archive, help] = entries();
    expect([edit!.localName, edit!.getAttribute('type'), edit!.className, (edit as HTMLButtonElement).disabled]).toEqual(['button', 'button', 'hw-menu-item', false]);
    expect([archive!.localName, (archive as HTMLButtonElement).disabled]).toEqual(['button', true]);
    expect([help!.localName, help!.className, help!.getAttribute('href'), help!.hasAttribute('aria-disabled')]).toEqual(['a', 'hw-menu-item', '#help', false]);
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu'); expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(trigger.getAttribute('aria-controls')).toBe('actions'); expect(trigger.textContent).toBe('Actions');
    expect(host.firstElementChild!.hasAttribute('aria-label')).toBe(false);
  });

  it('[SHAPE-01] a disabled link item has no href and is aria-disabled', () => {
    const { entries, fixture, trigger, action } = menu('[items]="links"', { links: [{ value: 'a', label: 'A', href: '#a', disabled: true }, { value: 'b', label: 'B', href: '#b' }] });
    expect(entries()[0]!.hasAttribute('href')).toBe(false); expect(entries()[0]!.getAttribute('aria-disabled')).toBe('true');
    trigger.click(); fixture.detectChanges(); expect(active()).toBe(entries()[1]);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true }); entries()[0]!.dispatchEvent(click); expect(click.defaultPrevented).toBe(true); expect(action).not.toHaveBeenCalled();
  });

  it('[SHAPE-02][nav-b-2] activating an item reports its value once, closes the menu and focuses the trigger; a link item keeps its href', () => {
    const { fixture, trigger, entries, action, panel } = menu('[items]="items"');
    trigger.click(); fixture.detectChanges(); entries()[0]!.click(); fixture.detectChanges();
    expect(action.mock.calls).toEqual([['edit']]); expect(panel.hidden).toBe(true); expect(active()).toBe(trigger);
    trigger.click(); fixture.detectChanges();
    const link = entries()[2]!; link.addEventListener('click', event => event.preventDefault()); link.click(); fixture.detectChanges();
    expect(action.mock.calls).toEqual([['edit'], ['help']]); expect(link.getAttribute('href')).toBe('#help');
    trigger.click(); fixture.detectChanges(); entries()[1]!.click(); fixture.detectChanges(); expect(action).toHaveBeenCalledTimes(2);
    // Space activates a link item as it activates a button item, and does not scroll the page.
    const space = press(entries()[2]!, ' '); fixture.detectChanges();
    expect(space.defaultPrevented).toBe(true); expect(action.mock.calls).toEqual([['edit'], ['help'], ['help']]); expect(panel.hidden).toBe(true);
  });

  it('[MENU-01] the trigger opens on the first or last enabled item; arrows, Home and End skip the disabled item; Escape and Tab close', () => {
    const { fixture, trigger, entries, panel, opened } = menu('[items]="items"');
    trigger.focus(); press(trigger, 'ArrowDown'); fixture.detectChanges();
    expect(panel.hidden).toBe(false); expect(trigger.getAttribute('aria-expanded')).toBe('true'); expect(active()).toBe(entries()[0]);
    expect(entries().map(entry => entry.tabIndex)).toEqual([0, -1, -1]);
    press(active(), 'ArrowDown'); fixture.detectChanges(); expect(active()).toBe(entries()[2]); expect(entries().map(entry => entry.tabIndex)).toEqual([-1, -1, 0]);
    press(active(), 'Home'); fixture.detectChanges(); expect(active()).toBe(entries()[0]);
    press(active(), 'End'); fixture.detectChanges(); expect(active()).toBe(entries()[2]);
    press(active(), 'ArrowUp'); fixture.detectChanges(); expect(active()).toBe(entries()[0]);
    const escape = press(active(), 'Escape'); fixture.detectChanges();
    expect(panel.hidden).toBe(true); expect(active()).toBe(trigger); expect(escape.defaultPrevented).toBe(true);
    press(trigger, 'ArrowUp'); fixture.detectChanges(); expect(active()).toBe(entries()[2]);
    const item = active(); press(item, 'Tab'); fixture.detectChanges();
    expect(panel.hidden).toBe(true); expect(active()).toBe(item); expect(opened.mock.calls).toEqual([[true], [false], [true], [false]]);
  });

  it('[MENU-02] a disabled menu has a disabled trigger; disabling an open menu closes it and reports false once', () => {
    const { fixture, trigger, panel, opened, update } = menu('[items]="items" [disabled]="disabled"', { disabled: false });
    trigger.click(); fixture.detectChanges(); expect(panel.hidden).toBe(false);
    update({ disabled: true }); update();
    expect(trigger.disabled).toBe(true); expect(panel.hidden).toBe(true); expect(opened.mock.calls).toEqual([[true], [false]]);
  });

  it('[MENU-03][nav-b-3][R15] the packaged trigger of a menu and of a popover is a secondary button unless triggerVariant says otherwise', () => {
    const { root } = page(`<hw-menu label="Actions" triggerLabel="Actions" [items]="[]" /><hw-menu label="Actions" triggerLabel="Actions" triggerVariant="primary" [items]="[]" /><hw-popover label="Filters" triggerLabel="Filters" /><hw-popover label="Filters" triggerLabel="Filters" triggerVariant="ghost" />`);
    expect([...root.querySelectorAll(':is(.hw-menu, .hw-popover) > button.hw-button')].map(button => button.getAttribute('data-variant'))).toEqual(['secondary', 'primary', 'secondary', 'ghost']);
  });

  it('[STATE-01][STATE-03][STATE-04] open reports each change once, a bound change reports nothing, and [(open)] round-trips', () => {
    const one = menu('[items]="items"');
    one.trigger.click(); one.fixture.detectChanges(); one.trigger.click(); one.fixture.detectChanges();
    expect(one.opened.mock.calls).toEqual([[true], [false]]);
    const two = menu('[items]="items" [(open)]="open"', { open: false });
    two.update({ open: true }); two.update();
    expect(two.panel.hidden).toBe(false); expect(two.opened).not.toHaveBeenCalled();
    // Opened by the application: the first enabled item is the active one and takes focus after the render.
    expect(two.entries().map(entry => entry.tabIndex)).toEqual([0, -1, -1]); expect(active()).toBe(two.entries()[0]);
    press(active(), 'Escape'); two.fixture.detectChanges(); expect((two.state as { open?: boolean }).open).toBe(false); expect(two.opened.mock.calls).toEqual([[false]]);
    two.trigger.focus(); press(two.trigger, 'ArrowUp'); two.fixture.detectChanges(); two.fixture.detectChanges();
    expect((two.state as { open?: boolean }).open).toBe(true); expect(active()).toBe(two.entries()[2]);
  });

  it('[STATE-05] a menu that starts open has its first enabled item as the tab stop and takes no focus', () => {
    const view = menu('[items]="items" open');
    expect(view.panel.hidden).toBe(false); expect(view.entries().map(entry => entry.tabIndex)).toEqual([0, -1, -1]); expect(view.host.contains(document.activeElement)).toBe(false); expect(view.opened).not.toHaveBeenCalled();
  });

  it('[TYPE-10][TYPE-12][TYPE-13][nav-b-1] a letter moves focus to the next enabled item that starts with it; an unmatched key is left alone', () => {
    vi.useFakeTimers();
    const { fixture, trigger, entries } = menu('[items]="letters"', { letters });
    trigger.click(); fixture.detectChanges(); expect(active()).toBe(entries()[0]);
    const matched = press(active(), 'd'); fixture.detectChanges();
    expect(active()).toBe(entries()[1]); expect(matched.defaultPrevented).toBe(true);
    // The same letter again within 500 ms: the next entry that starts with it; the disabled one is skipped.
    vi.advanceTimersByTime(200); press(active(), 'd'); fixture.detectChanges(); expect(active()).toBe(entries()[3]);
    vi.advanceTimersByTime(600);
    const unmatched = press(active(), 'x'); fixture.detectChanges(); expect(active()).toBe(entries()[3]); expect(unmatched.defaultPrevented).toBe(false);
    vi.advanceTimersByTime(600);
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) { press(active(), 'b', init); fixture.detectChanges(); expect(active()).toBe(entries()[3]); }
    // Two letters typed in a row are one prefix.
    press(active(), 'c'); press(active(), 'o'); fixture.detectChanges(); expect(active()).toBe(entries()[0]);
  });

  it('[TYPE-14] closing the menu clears the typed letters', () => {
    vi.useFakeTimers();
    const { fixture, trigger, entries } = menu('[items]="letters"', { letters });
    trigger.click(); fixture.detectChanges(); press(active(), 'd'); fixture.detectChanges(); expect(active()).toBe(entries()[1]);
    press(active(), 'Escape'); fixture.detectChanges(); trigger.click(); fixture.detectChanges();
    press(active(), 'b'); fixture.detectChanges(); expect(active()).toBe(entries()[4]);
  });

  it('[FOCUS-07][FOCUS-08][nav-b-7] focus that moves outside closes the menu and stays there; focus that goes nowhere closes nothing', () => {
    const { fixture, trigger, entries, panel, opened, after } = menu('[items]="items"');
    trigger.click(); fixture.detectChanges();
    entries()[0]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null })); fixture.detectChanges();
    expect(panel.hidden).toBe(false); expect(opened.mock.calls).toEqual([[true]]);
    // Moving between the trigger and the items stays inside the root.
    entries()[0]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: trigger })); fixture.detectChanges(); expect(panel.hidden).toBe(false);
    after.focus(); entries()[0]!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: after })); fixture.detectChanges();
    expect(panel.hidden).toBe(true); expect(active()).toBe(after); expect(opened.mock.calls).toEqual([[true], [false]]);
  });

  it('[NAME-01][NAME-02][NAME-03][ATTR-03][E08] the menu element takes the name; the host and the root keep none', () => {
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <hw-menu label="Actions" triggerLabel="Open" [items]="[]" /><hw-menu aria-label="Static name" aria-describedby="note" triggerLabel="Open" [items]="[]" />
      <hw-menu aria-labelledby="heading" triggerLabel="Open" [items]="[]" /><hw-menu [aria-label]="name" triggerLabel="Open" [items]="[]" />`, { name: 'Bound name' });
    const hosts = [...root.querySelectorAll('hw-menu')], menus = hosts.map(host => host.querySelector('[role=menu]')!);
    hosts.forEach(bare); for (const host of hosts) bare(host.firstElementChild!);
    expect(menus[0]!.getAttribute('aria-label')).toBe('Actions');
    expect(menus[1]!.getAttribute('aria-label')).toBe('Static name'); expect(menus[1]!.getAttribute('aria-describedby')).toBe('note');
    expect(menus[2]!.getAttribute('aria-labelledby')).toBe('heading'); expect(menus[2]!.hasAttribute('aria-label')).toBe(false);
    expect(menus[3]!.getAttribute('aria-label')).toBe('Bound name'); update({ name: 'Other' }); expect(menus[3]!.getAttribute('aria-label')).toBe('Other');
  });

  it('[NAME-04] a menu and a popover without any name write no aria-label and warn once each', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-menu triggerLabel="Open" [items]="[]" /><hw-popover triggerLabel="Open" />`);
    update();
    expect(root.querySelector('[role=menu]')!.hasAttribute('aria-label')).toBe(false); expect(root.querySelector('[role=region]')!.hasAttribute('aria-label')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-menu requires "label"', 'Hawiyah: hw-popover requires "label"']);
  });
});

describe('hw-popover', () => {
  function popover(attributes = '', state: Record<string, unknown> = {}) {
    const opened = vi.fn();
    const view = page(`<button type="button" id="before">Before</button><hw-popover #p label="Filters" triggerLabel="Filters" panelId="filters" ${attributes} (openChange)="opened($event)"><label><input type="checkbox" id="inside"> Open only</label><button type="button" id="done" (click)="p.close(true)">Done</button></hw-popover><button type="button" id="after">After</button>`, { opened, ...state });
    const host = view.root.querySelector('hw-popover')!;
    return { ...view, opened, host, trigger: host.querySelector<HTMLButtonElement>('.hw-popover > button')!, panel: host.querySelector<HTMLElement>('.hw-popover-panel')!, inside: host.querySelector<HTMLElement>('#inside')!, before: view.root.querySelector<HTMLElement>('#before')!, after: view.root.querySelector<HTMLElement>('#after')! };
  }

  it('[POPOVER-02][nav-b-9] the panel is div.hw-popover-panel[role=region] named by label and holds only the application\'s content', () => {
    const { host, trigger, panel } = popover();
    expect([...host.firstElementChild!.children]).toEqual([trigger, panel]); expect(host.firstElementChild!.className).toBe('hw-popover');
    expect(panel.localName).toBe('div'); expect(panel.getAttribute('role')).toBe('region'); expect(panel.id).toBe('filters'); expect(panel.getAttribute('aria-label')).toBe('Filters'); expect(panel.hidden).toBe(true);
    expect([...panel.children].map(child => child.localName)).toEqual(['label', 'button']); expect(panel.querySelector('h2, h3, section')).toBeNull();
    expect(trigger.hasAttribute('aria-haspopup')).toBe(false); expect(trigger.getAttribute('aria-controls')).toBe('filters'); expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('[NAME-01][NAME-02][NAME-03][ATTR-03][E08] the panel takes aria-label, or aria-labelledby pointing at a heading in the content', () => {
    const { root } = page(`<hw-popover aria-label="Filter the list" triggerLabel="Filters" /><hw-popover aria-labelledby="own" aria-describedby="own" triggerLabel="Filters"><h3 id="own">Filters</h3></hw-popover>`);
    const hosts = [...root.querySelectorAll('hw-popover')], panels = hosts.map(host => host.querySelector('.hw-popover-panel')!);
    hosts.forEach(bare); for (const host of hosts) bare(host.firstElementChild!);
    expect(panels[0]!.getAttribute('aria-label')).toBe('Filter the list');
    expect(panels[1]!.getAttribute('aria-labelledby')).toBe('own'); expect(panels[1]!.hasAttribute('aria-label')).toBe(false); expect(panels[1]!.getAttribute('aria-describedby')).toBe('own');
  });

  it('[FOCUS-06][nav-b-7] focus that moves past the panel closes the popover and stays where it went', () => {
    const { fixture, trigger, panel, inside, after, opened } = popover();
    trigger.focus(); trigger.click(); fixture.detectChanges(); expect(panel.hidden).toBe(false); expect(active()).toBe(trigger);
    inside.focus(); trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: inside })); fixture.detectChanges(); expect(panel.hidden).toBe(false);
    after.focus(); inside.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: after })); fixture.detectChanges();
    expect(panel.hidden).toBe(true); expect(trigger.getAttribute('aria-expanded')).toBe('false'); expect(active()).toBe(after); expect(opened.mock.calls).toEqual([[true], [false]]);
  });

  it('[FOCUS-08] a focusout without a related target leaves the popover open and reports nothing', () => {
    const { fixture, trigger, panel, inside, opened } = popover();
    trigger.click(); fixture.detectChanges();
    inside.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null })); fixture.detectChanges();
    expect(panel.hidden).toBe(false); expect(opened.mock.calls).toEqual([[true]]);
  });

  it('[FOCUS-05][nav-b-8] Escape pressed outside the popover does nothing to it and moves no focus', () => {
    const { fixture, trigger, panel, before, opened } = popover();
    trigger.click(); fixture.detectChanges(); before.focus();
    const escape = press(before, 'Escape'); fixture.detectChanges();
    expect(panel.hidden).toBe(false); expect(active()).toBe(before); expect(opened.mock.calls).toEqual([[true]]); expect(escape.defaultPrevented).toBe(false);
  });

  it('[POPOVER-01] Escape from the panel or from the trigger closes the popover and focuses the trigger, also when the application opened it', () => {
    const { fixture, trigger, panel, inside, update } = popover('[(open)]="open"', { open: false });
    trigger.click(); fixture.detectChanges(); inside.focus(); press(inside, 'Escape'); fixture.detectChanges();
    expect(panel.hidden).toBe(true); expect(active()).toBe(trigger);
    trigger.click(); fixture.detectChanges(); press(trigger, 'Escape'); fixture.detectChanges(); expect(panel.hidden).toBe(true); expect(active()).toBe(trigger);
    trigger.blur(); update({ open: true }); expect(panel.hidden).toBe(false); expect(document.activeElement).not.toBe(trigger);
    inside.focus(); press(inside, 'Escape'); fixture.detectChanges(); expect(panel.hidden).toBe(true); expect(active()).toBe(trigger);
  });

  it('[POPOVER-03] a disabled popover has a disabled trigger and is closed; an open one closes with one notification; content can close it', () => {
    const { fixture, trigger, panel, opened, update, host } = popover('[disabled]="disabled"', { disabled: false });
    trigger.click(); fixture.detectChanges(); host.querySelector<HTMLElement>('#done')!.click(); fixture.detectChanges();
    expect(panel.hidden).toBe(true); expect(active()).toBe(trigger); expect(opened.mock.calls).toEqual([[true], [false]]);
    trigger.click(); fixture.detectChanges(); update({ disabled: true }); update();
    expect(trigger.disabled).toBe(true); expect(panel.hidden).toBe(true); expect(opened.mock.calls).toEqual([[true], [false], [true], [false]]);
  });
});

describe('hw-tree-view', () => {
  const items = [
    { id: 'services', label: 'Services', children: [{ id: 'permits', label: 'Permits', children: [{ id: 'building', label: 'Building' }] }, { id: 'licences', label: 'Licences', disabled: true }, { id: 'payments', label: 'Payments' }] },
    { id: 'about', label: 'About' }, { id: 'press', label: 'Press' }, { id: 'a/b c', label: 'Policies', children: [{ id: 'privacy', label: 'Privacy' }] },
  ];
  function tree(attributes = '', state: Record<string, unknown> = {}) {
    const changed = vi.fn(), expandedChanged = vi.fn();
    const view = page(`<hw-tree-view label="Sections" controlId="tree" direction="ltr" ${withText.treeView} [items]="items" ${attributes} (valueChange)="changed($event)" (expandedChange)="expandedChanged($event)" /><button type="button" id="after">After</button>`, { text, items, changed, expandedChanged, ...state });
    const host = view.root.querySelector('hw-tree-view')!;
    return { ...view, changed, expandedChanged, host, list: host.querySelector<HTMLElement>('ul[role=tree]')!, nodes: () => [...host.querySelectorAll<HTMLElement>('li[role=treeitem]')], node: (id: string) => [...host.querySelectorAll<HTMLElement>('li[role=treeitem]')].find(element => element.dataset['node'] === id)! };
  }

  it('[SHAPE-01][nav-b-17] items and expanded render the visible nodes with level, position, set size and expansion', () => {
    const { nodes } = tree(`[expanded]="['services']"`);
    expect(nodes().map(node => [node.dataset['node'], node.getAttribute('aria-level'), node.getAttribute('aria-posinset'), node.getAttribute('aria-setsize'), node.getAttribute('aria-expanded')])).toEqual([
      ['services', '1', '1', '4', 'true'], ['permits', '2', '1', '3', 'false'], ['licences', '2', '2', '3', null], ['payments', '2', '3', '3', null], ['about', '1', '2', '4', null], ['press', '1', '3', '4', null], ['a/b c', '1', '4', '4', 'false'],
    ]);
  });

  it('[TREE-01][nav-b-12] each tree item carries its depth as a custom property and no inline padding', () => {
    const { nodes } = tree(`[expanded]="['services', 'permits']"`);
    for (const node of nodes()) { expect(node.style.getPropertyValue('--hw-tree-depth'), node.dataset['node']).toBe(String(Number(node.getAttribute('aria-level')) - 1)); expect(node.style.paddingInlineStart).toBe(''); expect(node.getAttribute('style')).not.toContain('padding'); }
    expect(nodes().map(node => node.getAttribute('aria-level'))).toContain('3');
  });

  it('[TREE-03][TREE-05][nav-b-13][R21] a branch has a named toggle button outside the tab order; a leaf has none; the item is named by its label alone', () => {
    const { node, nodes, host } = tree(`[expanded]="['services']"`);
    const open = node('services').querySelector(':scope > button.hw-tree-toggle')!, closed = node('permits').querySelector(':scope > button.hw-tree-toggle')!;
    expect(node('services').firstElementChild).toBe(open);
    expect([open.getAttribute('type'), open.getAttribute('tabindex'), open.getAttribute('aria-label'), open.querySelector('.hw-icon')!.getAttribute('data-icon')]).toEqual(['button', '-1', 'Collapse Services', 'minus-sign']);
    expect([closed.getAttribute('tabindex'), closed.getAttribute('aria-label'), closed.querySelector('.hw-icon')!.getAttribute('data-icon')]).toEqual(['-1', 'Expand Permits', 'add-01']);
    expect(open.querySelector('.hw-icon')!.getAttribute('aria-hidden')).toBe('true'); expect(open.querySelector('.hw-icon')!.getAttribute('data-size')).toBe('sm');
    expect(node('about').querySelector('button')).toBeNull(); expect(host.querySelector('span.hw-tree-toggle')).toBeNull();
    for (const item of nodes()) { const label = host.ownerDocument.getElementById(item.getAttribute('aria-labelledby')!)!; expect(item.contains(label)).toBe(true); expect(label.localName).toBe('span'); expect(label.textContent).toBe(items.flatMap(entry => [entry, ...(entry.children ?? [])]).find(entry => entry.id === item.dataset['node'])!.label); }
    expect(node('a/b c').getAttribute('aria-labelledby')).toBe('tree-a%2Fb%20c'); expect(new Set(nodes().map(item => item.getAttribute('aria-labelledby'))).size).toBe(nodes().length);
    // A disabled node disables its toggle.
    const blocked = tree('', { items: [{ id: 'x', label: 'X', disabled: true, children: [{ id: 'y', label: 'Y' }] }] });
    expect(blocked.node('x').querySelector<HTMLButtonElement>('button.hw-tree-toggle')!.disabled).toBe(true);
  });

  it('[TREE-04][STATE-01] the toggle expands without selecting, reports expanded once and leaves focus on the tree item', () => {
    const { fixture, node, nodes, changed, expandedChanged, host } = tree();
    node('services').querySelector<HTMLButtonElement>('button.hw-tree-toggle')!.click(); fixture.detectChanges();
    expect(node('services').getAttribute('aria-expanded')).toBe('true'); expect(changed).not.toHaveBeenCalled(); expect(expandedChanged.mock.calls).toEqual([[['services']]]); expect(active()).toBe(node('services'));
    node('services').querySelector<HTMLButtonElement>('button.hw-tree-toggle')!.click(); fixture.detectChanges();
    expect(node('services').getAttribute('aria-expanded')).toBe('false'); expect(expandedChanged.mock.calls).toEqual([[['services']], [[]]]);
    // One tab stop: a tree item, never a toggle.
    expect([...host.querySelectorAll<HTMLElement>('[tabindex="0"]')]).toEqual([node('services')]); expect(nodes().every(item => item.querySelector('button') === null || item.querySelector('button')!.tabIndex === -1)).toBe(true);
  });

  it('[STATE-03][STATE-04][nav-b-17] a bound change of expanded reports nothing and [(expanded)] round-trips', () => {
    const { fixture, node, expandedChanged, state, update } = tree('[(expanded)]="open"', { open: ['services'] as readonly string[] });
    expect(node('permits')).toBeDefined();
    update({ open: [] }); expect(node('permits')).toBeUndefined(); expect(expandedChanged).not.toHaveBeenCalled();
    node('services').focus(); press(node('services'), 'ArrowRight'); fixture.detectChanges();
    expect((state as { open?: readonly string[] }).open).toEqual(['services']); expect(node('permits')).toBeDefined(); expect(expandedChanged).toHaveBeenCalledTimes(1);
  });

  it('[TYPE-11][TYPE-12][TYPE-13][nav-b-15] a letter moves focus among the visible nodes only; an unmatched key is left alone', () => {
    vi.useFakeTimers();
    const { fixture, node } = tree();
    node('services').focus();
    // Permits, Payments and Privacy are inside collapsed branches: p reaches Press, then Policies.
    const matched = press(node('services'), 'p'); fixture.detectChanges(); expect(active()).toBe(node('press')); expect(matched.defaultPrevented).toBe(true);
    vi.advanceTimersByTime(100); press(active(), 'p'); fixture.detectChanges(); expect(active()).toBe(node('a/b c'));
    vi.advanceTimersByTime(600);
    const unmatched = press(active(), 'z'); fixture.detectChanges(); expect(active()).toBe(node('a/b c')); expect(unmatched.defaultPrevented).toBe(false);
    vi.advanceTimersByTime(600);
    // With the branch open its enabled children are reached and the disabled one is skipped.
    const open = tree(`[expanded]="['services']"`);
    open.node('services').focus(); press(open.node('services'), 'l'); open.fixture.detectChanges(); expect(active()).toBe(open.node('services'));
    vi.advanceTimersByTime(600); press(open.node('services'), 'p'); open.fixture.detectChanges(); expect(active()).toBe(open.node('permits'));
  });

  it('[RO-04] a read-only tree expands and collapses through the toggle, the arrow keys and type-ahead, and selects nothing', () => {
    const { fixture, node, changed, expandedChanged } = tree('readOnly value="about"');
    node('services').querySelector<HTMLButtonElement>('button')!.click(); fixture.detectChanges(); expect(node('services').getAttribute('aria-expanded')).toBe('true');
    press(node('services'), 'ArrowLeft'); fixture.detectChanges(); expect(node('services').getAttribute('aria-expanded')).toBe('false');
    node('services').click(); press(node('services'), 'Enter'); press(node('services'), 'a'); fixture.detectChanges();
    expect(changed).not.toHaveBeenCalled(); expect(expandedChanged).toHaveBeenCalledTimes(2); expect(active()).toBe(node('about')); expect(node('about').getAttribute('aria-selected')).toBe('true');
  });

  it('[TEXT-01] without getExpandLabel the toggle has no name and the missing input is reported once', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<hw-tree-view label="Sections" [items]="items" [getCollapseLabel]="text.treeView.getCollapseLabel" />`, { text, items });
    update();
    expect([...root.querySelectorAll('button.hw-tree-toggle')].map(button => button.hasAttribute('aria-label'))).toEqual([false, false]);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-tree-view requires "getExpandLabel"']);
  });

  it('[NAME-01][NAME-02][NAME-03][NAME-04][ATTR-03][E08] the tree is named by label, aria-label, aria-labelledby or its field', () => {
    const warnings = missingTextWarnings();
    const { root, update } = page(`<h2 id="heading">Heading</h2><p id="note">Note</p>
      <hw-tree-view label="Sections" hint="Choose one" error="Required" [items]="[]" /><hw-tree-view aria-label="Static name" aria-describedby="note" aria-invalid="true" [items]="[]" />
      <hw-tree-view aria-labelledby="heading" [items]="[]" /><hw-field label="Section"><hw-tree-view [items]="[]" /></hw-field><hw-tree-view [items]="[]" />`);
    update();
    const hosts = [...root.querySelectorAll('hw-tree-view')], trees = hosts.map(host => host.querySelector('ul[role=tree]')!);
    for (const host of hosts) for (const name of [...forwarded, 'aria-invalid']) expect(host.hasAttribute(name), name).toBe(false);
    expect(trees[0]!.getAttribute('aria-label')).toBe('Sections'); expect(trees[0]!.getAttribute('aria-invalid')).toBe('true');
    expect(trees[0]!.getAttribute('aria-describedby')!.split(' ').map(id => hosts[0]!.querySelector(`[id="${id}"]`)!.className)).toEqual(['hw-hint', 'hw-error']);
    expect(trees[1]!.getAttribute('aria-label')).toBe('Static name'); expect(trees[1]!.getAttribute('aria-describedby')).toBe('note'); expect(trees[1]!.getAttribute('aria-invalid')).toBe('true');
    expect(trees[2]!.getAttribute('aria-labelledby')).toBe('heading'); expect(trees[2]!.hasAttribute('aria-label')).toBe(false); expect(trees[2]!.hasAttribute('aria-invalid')).toBe(false);
    expect(trees[3]!.getAttribute('aria-labelledby')).toBe(root.querySelector('hw-field label')!.id);
    expect(trees[4]!.hasAttribute('aria-label')).toBe(false); expect(trees[4]!.hasAttribute('aria-labelledby')).toBe(false);
    expect(warnings.map(warning => warning.split('.')[0])).toEqual(['Hawiyah: hw-tree-view requires "label"']);
  });

  it('[RESET-01][nav-b-17] the hidden input carries form and the value; a native reset returns the value and the tab stop', async () => {
    const focused = vi.fn(), blurred = vi.fn();
    const view = page(`<form id="outer"></form><form><hw-tree-view label="Sections" name="section" form="outer" direction="ltr" ${withText.treeView} [items]="items" value="about" (focused)="focused($event)" (blurred)="blurred($event)" /></form><button type="button" id="after">After</button>`, { text, items, focused, blurred });
    const host = view.root.querySelector('hw-tree-view')!, hidden = host.querySelector<HTMLInputElement>('input[type=hidden]')!, outer = view.root.querySelector<HTMLFormElement>('#outer')!;
    const node = (id: string) => [...host.querySelectorAll<HTMLElement>('li[role=treeitem]')].find(element => element.dataset['node'] === id)!;
    expect(hidden.getAttribute('form')).toBe('outer'); expect(new FormData(outer).get('section')).toBe('about');
    node('about').focus(); node('press').focus(); node('press').click(); view.fixture.detectChanges();
    expect(focused).toHaveBeenCalledTimes(1); expect(blurred).not.toHaveBeenCalled(); expect(new FormData(outer).get('section')).toBe('press'); expect(node('press').tabIndex).toBe(0);
    outer.reset(); await Promise.resolve(); await Promise.resolve(); view.fixture.detectChanges();
    expect(new FormData(outer).get('section')).toBe('about'); expect(node('about').tabIndex).toBe(0); expect(node('press').tabIndex).toBe(-1);
    view.root.querySelector<HTMLElement>('#after')!.focus(); expect(blurred).toHaveBeenCalledTimes(1);
  });
});
