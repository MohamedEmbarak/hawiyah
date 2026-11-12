// @vitest-environment jsdom
import { resetTextWarnings } from '@hawiyah/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMenu, createPopover, createTreeView } from '../src/index.js';

// Vanilla fixtures of the cross-adapter Menu, Popover and TreeView cases: the documented authored markup and its controllers.
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); vi.restoreAllMocks(); });
function mount(markup: string): HTMLElement { document.body.innerHTML = markup; return document.body.firstElementChild as HTMLElement; }
function key(node: Element, key: string) { const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); node.dispatchEvent(event); return event; }
const text = () => document.activeElement?.textContent;
const source = (file: string) => readFileSync(join(process.cwd(), 'packages/vanilla/src', file), 'utf8');

describe('menu', () => {
  const menu = () => mount('<div><div class="hw-menu" data-hw="menu"><button class="hw-button" type="button" data-hw-trigger>Request actions</button><div class="hw-menu-content" data-hw-panel role="menu" aria-label="Request actions" hidden><button class="hw-menu-item" type="button" role="menuitem" data-hw-value="edit">Edit</button><button class="hw-menu-item" type="button" role="menuitem" data-hw-value="archive" disabled>Archive</button><button class="hw-menu-item" type="button" role="menuitem" data-hw-value="delete">Delete</button><button class="hw-menu-item" type="button" role="menuitem" data-hw-value="download">Download</button><a class="hw-menu-item" role="menuitem" data-hw-value="help" href="#help">Help</a></div></div><button type="button" id="after">After</button></div>').firstElementChild as HTMLElement;
  it('[SHAPE-01] [SHAPE-02] the documented structure; an action reports its value once, a link keeps its href, a disabled item reports nothing', () => {
    const root = menu(); const action = vi.fn(); const details: unknown[] = []; root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createMenu(root, { onAction: action }); const panel = root.querySelector('.hw-menu-content')!;
    expect(panel.getAttribute('role')).toBe('menu'); expect([...panel.children].map(node => node.localName + '.' + node.className)).toEqual(['button.hw-menu-item', 'button.hw-menu-item', 'button.hw-menu-item', 'button.hw-menu-item', 'a.hw-menu-item']);
    controller.show(); root.querySelector<HTMLElement>('[data-hw-value="edit"]')!.click(); expect(action.mock.calls).toEqual([['edit']]);
    controller.show(); root.querySelector<HTMLElement>('[data-hw-value="archive"]')!.click(); expect(action).toHaveBeenCalledTimes(1);
    controller.show(); const link = root.querySelector<HTMLAnchorElement>('a')!; link.addEventListener('click', event => event.preventDefault()); link.click();
    expect(action.mock.calls).toEqual([['edit'], ['help']]); expect(link.getAttribute('href')).toBe('#help');
    expect(details.filter(detail => 'value' in (detail as object))).toEqual([{ value: 'edit' }, { value: 'help' }]); controller.destroy();
  });
  it('[SHAPE-03] [STATE-06] MenuOptions has onAction and onOpenChange and no onSelect; hw:change carries {open}', () => {
    const declaration = source('disclosures.ts').match(/export interface MenuOptions \{[^}]*\}/u)![0];
    expect(declaration).toContain('onAction'); expect(declaration).toContain('onOpenChange'); expect(declaration).not.toContain('onSelect');
    const root = menu(); const opened = vi.fn(); const details: unknown[] = []; root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createMenu(root, { onOpenChange: opened }); controller.show(); controller.close();
    expect(opened.mock.calls).toEqual([[true], [false]]); expect(details).toEqual([{ open: true }, { open: false }]); controller.destroy();
  });
  it('[MENU-01] keyboard: open on the first or last enabled item, skip the disabled one, Escape and Tab close', () => {
    const root = menu(); const controller = createMenu(root); const trigger = root.querySelector<HTMLElement>('[data-hw-trigger]')!;
    trigger.focus(); key(trigger, 'ArrowDown'); expect(text()).toBe('Edit'); key(document.activeElement!, 'ArrowDown'); expect(text()).toBe('Delete');
    key(document.activeElement!, 'End'); expect(text()).toBe('Help'); key(document.activeElement!, 'Home'); expect(text()).toBe('Edit');
    key(document.activeElement!, 'Escape'); expect(controller.open).toBe(false); expect(document.activeElement).toBe(trigger);
    key(trigger, 'ArrowUp'); expect(text()).toBe('Help'); const tab = key(document.activeElement!, 'Tab');
    expect(controller.open).toBe(false); expect(tab.defaultPrevented).toBe(false); expect(text()).toBe('Help'); controller.destroy();
  });
  it('[TYPE-10] [TYPE-12] [TYPE-13] a letter moves to the next match; a repeated letter cycles; no match keeps the default action', () => {
    vi.useFakeTimers(); const root = menu(); const controller = createMenu(root); const trigger = root.querySelector<HTMLElement>('[data-hw-trigger]')!;
    key(trigger, 'ArrowDown'); key(document.activeElement!, 'd'); expect(text()).toBe('Delete'); key(document.activeElement!, 'd'); expect(text()).toBe('Download');
    vi.advanceTimersByTime(600); const miss = key(document.activeElement!, 'z'); expect(text()).toBe('Download'); expect(miss.defaultPrevented).toBe(false);
    vi.advanceTimersByTime(600); key(document.activeElement!, 'a'); expect(text()).toBe('Download'); controller.destroy();
  });
  it('[TYPE-14] closing the menu clears the typed text', () => {
    vi.useFakeTimers(); const root = mount('<div class="hw-menu"><button type="button" data-hw-trigger>Actions</button><div data-hw-panel role="menu" aria-label="Actions" hidden><button role="menuitem">Alpha</button><button role="menuitem">Beta</button><button role="menuitem">Ab</button></div></div>');
    const controller = createMenu(root); const trigger = root.querySelector<HTMLElement>('[data-hw-trigger]')!;
    key(trigger, 'ArrowDown'); key(document.activeElement!, 'a'); key(document.activeElement!, 'Escape'); key(trigger, 'ArrowDown'); key(document.activeElement!, 'b');
    expect(text()).toBe('Beta'); controller.destroy();
  });
  it('[FOCUS-07] [FOCUS-08] focus moved outside by script closes the menu without moving focus back; focusout to nowhere keeps it open', () => {
    const root = menu(); const opened = vi.fn(); const controller = createMenu(root, { onOpenChange: opened }); controller.show();
    root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null })); expect(controller.open).toBe(true); expect(opened).toHaveBeenCalledTimes(1);
    const after = document.getElementById('after')!; after.focus(); expect(controller.open).toBe(false); expect(document.activeElement).toBe(after); controller.destroy();
  });
});

describe('popover', () => {
  const popover = () => mount('<div><div class="hw-popover" data-hw="popover"><button class="hw-button" type="button" data-hw-trigger>Service information</button><div class="hw-popover-panel" data-hw-panel role="region" aria-label="Service information" hidden><label><input type="checkbox"> Remember</label><button type="button" data-hw-close>Close</button></div></div><button type="button" id="after">After</button></div>').firstElementChild as HTMLElement;
  it('[FOCUS-06] [FOCUS-08] Tab out of the panel closes it once without moving focus; focusout to nowhere keeps it open', () => {
    const root = popover(); const changed = vi.fn(); const controller = createPopover(root, { onOpenChange: changed }); controller.show(); changed.mockClear();
    root.querySelector('input')!.focus(); root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null })); expect(controller.open).toBe(true);
    root.querySelector<HTMLElement>('[data-hw-close]')!.focus(); document.getElementById('after')!.focus();
    expect(controller.open).toBe(false); expect(root.querySelector('[data-hw-trigger]')!.getAttribute('aria-expanded')).toBe('false'); expect(root.querySelector<HTMLElement>('[data-hw-panel]')!.hidden).toBe(true);
    expect(document.activeElement!.id).toBe('after'); expect(changed.mock.calls).toEqual([[false]]); controller.destroy();
  });
  it('[FOCUS-05] Escape with focus outside the popover changes nothing', () => {
    const root = popover(); const changed = vi.fn(); const after = document.getElementById('after')!; after.focus();
    const controller = createPopover(root, { onOpenChange: changed }); controller.show(); changed.mockClear();
    key(after, 'Escape'); expect(controller.open).toBe(true); expect(document.activeElement).toBe(after); expect(changed).not.toHaveBeenCalled(); controller.destroy();
  });
  it('[POPOVER-01] Escape in the panel or on the trigger closes and focuses the trigger, also when opened by script', () => {
    const root = popover(); const controller = createPopover(root); const trigger = root.querySelector<HTMLElement>('[data-hw-trigger]')!;
    controller.show(); root.querySelector('input')!.focus(); key(document.activeElement!, 'Escape'); expect(controller.open).toBe(false); expect(document.activeElement).toBe(trigger);
    trigger.click(); trigger.focus(); key(trigger, 'Escape'); expect(controller.open).toBe(false); expect(document.activeElement).toBe(trigger); controller.destroy();
  });
  it('[POPOVER-02] the panel is div.hw-popover-panel[role=region] with the application content only', () => {
    const root = popover(); const controller = createPopover(root); const panel = root.querySelector('[data-hw-panel]')!;
    expect(panel.localName).toBe('div'); expect(panel.className).toBe('hw-popover-panel'); expect(panel.getAttribute('role')).toBe('region');
    expect([...panel.children].map(node => node.localName)).toEqual(['label', 'button']); expect(panel.querySelector('h1, h2, h3, h4')).toBeNull(); controller.destroy();
  });
});

describe('tree view', () => {
  const tree = (attrs = 'data-hw-expand-label="Expand {label}" data-hw-collapse-label="Collapse {label}"', toggleName = '') => mount(`<ul class="hw-tree-view" data-hw="tree-view" role="tree" aria-label="Documents" ${attrs}><li class="hw-tree-item" role="treeitem" data-hw-value="business"><button class="hw-tree-toggle" type="button" data-hw-tree-toggle ${toggleName}><span class="hw-icon" data-icon="add-01" data-size="sm" aria-hidden="true"></span></button><span data-hw-tree-label>Business</span><ul role="group"><li class="hw-tree-item" role="treeitem" data-hw-value="license"><span data-hw-tree-label>License</span></li><li class="hw-tree-item" role="treeitem" data-hw-value="lease"><span data-hw-tree-label>Lease</span></li></ul></li><li class="hw-tree-item" role="treeitem" data-hw-value="letters"><span data-hw-tree-label>Letters</span></li><li class="hw-tree-item" role="treeitem" data-hw-value="lists"><span data-hw-tree-label>Lists</span></li></ul>`);
  const toggle = (root: HTMLElement) => root.querySelector<HTMLButtonElement>('.hw-tree-toggle')!;
  it('[TREE-03] a branch toggle is out of the tab order and named and drawn after its state; a leaf has none', () => {
    const root = tree(); const controller = createTreeView(root); const button = toggle(root);
    expect(button.tabIndex).toBe(-1); expect(button.getAttribute('aria-label')).toBe('Expand Business'); expect(button.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('add-01');
    controller.toggle('business'); expect(button.getAttribute('aria-label')).toBe('Collapse Business'); expect(button.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('minus-sign');
    expect(root.querySelector('[data-hw-value="letters"] button')).toBeNull(); controller.destroy(); expect(button.hasAttribute('aria-label')).toBe(false); expect(button.querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('add-01');
  });
  it('[TREE-04] the toggle expands without selecting, notifies once and focuses the item; Tab never lands on it', () => {
    const root = tree(); const expanded = vi.fn(); const changed = vi.fn(); const controller = createTreeView(root, { onExpandedChange: expanded, onValueChange: changed });
    toggle(root).click(); expect(expanded.mock.calls).toEqual([[['business']]]); expect(changed).not.toHaveBeenCalled(); expect(controller.value).toBe('');
    expect(document.activeElement).toBe(root.querySelector('[data-hw-value="business"]'));
    expect([...root.querySelectorAll<HTMLElement>('[tabindex="0"]')].map(node => node.localName)).toEqual(['li']); controller.destroy();
  });
  it('[TREE-05] a tree item is named by its label alone', () => {
    const root = tree(); const controller = createTreeView(root);
    for (const item of root.querySelectorAll('[role=treeitem]')) expect(document.getElementById(item.getAttribute('aria-labelledby')!)!.textContent).toBe(item.querySelector('[data-hw-tree-label]')!.textContent);
    controller.destroy(); expect(root.querySelector('[aria-labelledby]')).toBeNull();
  });
  it('[TEXT-01] a missing expand label leaves the toggle unnamed with one warning; an authored name stays without a warning', () => {
    let root = tree(''); let controller = createTreeView(root);
    expect(toggle(root).hasAttribute('aria-label')).toBe(false); expect(warn.mock.calls.filter(([message]: unknown[]) => String(message).includes('TreeView requires "getExpandLabel"'))).toHaveLength(1); controller.destroy();
    warn.mockClear(); resetTextWarnings(); root = tree('', 'aria-label="Show business documents"'); controller = createTreeView(root);
    expect(toggle(root).getAttribute('aria-label')).toBe('Show business documents'); expect(warn).not.toHaveBeenCalled(); controller.destroy();
  });
  it('[RO-04] a read-only tree expands and collapses and selects nothing', () => {
    const root = tree(); root.dataset.hwReadonly = 'true'; const changed = vi.fn(); const controller = createTreeView(root, { onValueChange: changed });
    toggle(root).click(); expect(controller.expanded).toEqual(['business']); const item = root.querySelector<HTMLElement>('[data-hw-value="business"]')!; item.focus();
    key(item, 'ArrowLeft'); expect(controller.expanded).toEqual([]); key(item, 'ArrowRight'); expect(controller.expanded).toEqual(['business']);
    key(item, 'Enter'); expect(changed).not.toHaveBeenCalled(); controller.destroy();
  });
  it('[TYPE-11] [TYPE-12] [TYPE-13] type-ahead searches visible nodes, cycles on a repeated letter and keeps unmatched keys', () => {
    vi.useFakeTimers(); const root = tree(); const controller = createTreeView(root); const first = root.querySelector<HTMLElement>('[data-hw-value="business"]')!; first.focus();
    key(first, 'l'); expect(document.activeElement!.getAttribute('data-hw-value')).toBe('letters'); key(document.activeElement!, 'l'); expect(document.activeElement!.getAttribute('data-hw-value')).toBe('lists');
    vi.advanceTimersByTime(600); const miss = key(document.activeElement!, 'z'); expect(miss.defaultPrevented).toBe(false); expect(document.activeElement!.getAttribute('data-hw-value')).toBe('lists'); controller.destroy();
  });
  it('[SHAPE-01] [STATE-06] [SHAPE-03] the expanded option and state: levels, positions and hw:change {value, expanded}', () => {
    const root = tree(); const details: unknown[] = []; root.addEventListener('hw:change', event => details.push((event as CustomEvent).detail));
    const controller = createTreeView(root, { expanded: ['business'] });
    expect([...root.querySelectorAll('[role=treeitem]')].map(item => [item.getAttribute('aria-level'), item.getAttribute('aria-posinset'), item.getAttribute('aria-setsize'), item.getAttribute('aria-expanded')])).toEqual([['1', '1', '3', 'true'], ['2', '1', '2', null], ['2', '2', '2', null], ['1', '2', '3', null], ['1', '3', '3', null]]);
    expect(controller.expanded).toEqual(['business']); controller.toggle('business'); expect(details).toEqual([{ value: '', expanded: [] }]);
    expect(source('content.ts').match(/export interface TreeViewOptions \{[\s\S]*?\n\}/u)![0]).not.toContain('expandedValues'); controller.destroy();
  });
});
