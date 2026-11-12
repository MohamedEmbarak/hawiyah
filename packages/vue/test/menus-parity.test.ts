// Menu, Popover and TreeView cases shared by the four adapters (milestone 3: nav-b-1, nav-b-15, nav-b-2, R24, nav-b-3, R15, nav-b-7, nav-b-8, nav-b-9).
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { resetTextWarnings } from '@hawiyah/core';
import { Menu, Popover, TreeView } from '../src/expansion-interactive.js';

let app: App | undefined;
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetTextWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { app?.unmount(); app = undefined; document.body.replaceChildren(); warn.mockRestore(); vi.useRealTimers(); });
const warnings = () => (warn.mock.calls as unknown[][]).map(call => String(call[0])).filter(message => message.startsWith('Hawiyah:'));
function mount(render: () => ReturnType<typeof h>) {
  const host = document.createElement('div'); document.body.append(host);
  app = createApp(defineComponent(() => render)); app.mount(host); return host;
}
const key = async (target: Element, name: string) => { const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }); target.dispatchEvent(event); await nextTick(); await nextTick(); return event; };
const settle = async () => { await nextTick(); await nextTick(); };
// The fixture shared with React and Angular.
const items = [{ value: 'edit', label: 'Edit' }, { value: 'archive', label: 'Archive', disabled: true }, { value: 'help', label: 'Help', href: '#help' }];
const letters = [{ value: 'a1', label: 'Apple' }, { value: 'b1', label: 'Banana' }, { value: 'd0', label: 'Dates', disabled: true }, { value: 'd1', label: 'Durian' }, { value: 'd2', label: 'Dragon fruit' }];
const menu = (props: Record<string, unknown> = {}, slots?: Record<string, () => unknown>) => h(Menu, { label: 'Actions', triggerLabel: 'Actions', items, ...props }, slots);
const trigger = (host: Element) => host.querySelector<HTMLButtonElement>('[aria-haspopup=menu]')!;

it('[TYPE-10][nav-b-1] Menu: a letter focuses the first enabled item starting with it', async () => {
  const host = mount(() => menu({ items: letters }));
  trigger(host).click(); await settle();
  expect(document.activeElement!.textContent).toBe('Apple');
  const event = await key(document.activeElement!, 'd');
  expect(document.activeElement!.textContent).toBe('Durian'); expect(event.defaultPrevented).toBe(true);
});

it('[TYPE-12][TYPE-13] Menu: no match keeps focus and the default action; a repeated letter moves to the next entry', async () => {
  vi.useFakeTimers();
  const host = mount(() => menu({ items: letters }));
  trigger(host).click(); await settle();
  const missed = await key(document.activeElement!, 'z');
  expect(document.activeElement!.textContent).toBe('Apple'); expect(missed.defaultPrevented).toBe(false);
  vi.advanceTimersByTime(600);
  await key(document.activeElement!, 'd'); await key(document.activeElement!, 'd');
  expect(document.activeElement!.textContent).toBe('Dragon fruit');
});

it('[TYPE-14] Menu: closing clears the type-ahead buffer', async () => {
  vi.useFakeTimers();
  const host = mount(() => menu({ items: letters }));
  trigger(host).click(); await settle();
  await key(document.activeElement!, 'a');
  await key(document.activeElement!, 'Escape');
  trigger(host).click(); await settle();
  await key(document.activeElement!, 'b');
  expect(document.activeElement!.textContent).toBe('Banana');
});

const tree = [
  { id: 'apps', label: 'Applications', children: [{ id: 'atlas', label: 'Atlas' }, { id: 'beacon', label: 'Beacon' }] },
  { id: 'billing', label: 'Billing' }, { id: 'budget', label: 'Budget' }, { id: 'backup', label: 'Backup', disabled: true }, { id: 'bonds', label: 'Bonds' },
];
const treeView = () => h(TreeView, { label: 'Services', items: tree, getExpandLabel: (node: { label: string }) => `Expand ${node.label}`, getCollapseLabel: (node: { label: string }) => `Collapse ${node.label}` });
const focusedTree = () => document.getElementById(document.activeElement!.getAttribute('aria-labelledby')!)?.textContent;

it('[TYPE-11][TYPE-12][nav-b-15] TreeView: a letter matches visible nodes only; no match keeps focus and the default action', async () => {
  const host = mount(treeView);
  const first = host.querySelector<HTMLElement>('[role=treeitem]')!; first.focus();
  await key(first, 'b');
  expect(focusedTree()).toBe('Billing');
  const missed = await key(document.activeElement!, 'z');
  expect(focusedTree()).toBe('Billing'); expect(missed.defaultPrevented).toBe(false);
});

it('[TYPE-13] TreeView: a repeated letter cycles and skips a disabled node', async () => {
  vi.useFakeTimers();
  const host = mount(treeView);
  const first = host.querySelector<HTMLElement>('[role=treeitem]')!; first.focus();
  for (const expected of ['Billing', 'Budget', 'Bonds', 'Billing']) { await key(document.activeElement!, 'b'); expect(focusedTree()).toBe(expected); }
});

it('[SSR-01][nav-b-1] server render of Menu and TreeView leaves no timer and equals the first client render', async () => {
  vi.useFakeTimers();
  const render = () => h('div', [menu({ items: letters }), treeView()]);
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  expect(vi.getTimerCount()).toBe(0);
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
  expect([...warn.mock.calls, ...errors.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))).toEqual([]);
  errors.mockRestore();
});

it('[SHAPE-01][nav-b-2] the shared item fixture renders div.hw-menu-content[role=menu] with three .hw-menu-item children', () => {
  const host = mount(() => menu());
  const content = host.querySelector('div.hw-menu > div.hw-menu-content[role=menu]')!;
  expect([...content.children].map(child => [child.tagName, child.className, child.getAttribute('role')])).toEqual([
    ['BUTTON', 'hw-menu-item', 'menuitem'], ['BUTTON', 'hw-menu-item', 'menuitem'], ['A', 'hw-menu-item', 'menuitem'],
  ]);
  expect((content.children[1] as HTMLButtonElement).disabled).toBe(true);
  expect(content.children[2]!.getAttribute('href')).toBe('#help');
  expect(host.querySelector('ul, li')).toBeNull();
  expect([...content.children].filter(child => child.getAttribute('tabindex') === '0')).toHaveLength(1);
});

it('[SHAPE-02][nav-b-2] activating an item reports its value once through @action; a disabled item reports nothing', async () => {
  const action = vi.fn();
  const host = mount(() => menu({ onAction: action }));
  const [edit, archive, help] = [...host.querySelectorAll<HTMLElement>('.hw-menu-item')];
  trigger(host).click(); await settle(); edit!.click(); await settle();
  expect(action.mock.calls).toEqual([['edit']]); expect(document.activeElement).toBe(trigger(host));
  trigger(host).click(); await settle(); archive!.click(); await settle();
  expect(action).toHaveBeenCalledTimes(1);
  help!.click(); await settle();
  expect(action.mock.calls.at(-1)).toEqual(['help']); expect(help!.getAttribute('href')).toBe('#help');
});

it('[SHAPE-03] Vue Menu declares no `select` event', () => {
  expect(Object.keys(Menu.emits as object)).toEqual(['update:open', 'action']);
  expectTypeOf<InstanceType<typeof Menu>['$props']>().not.toHaveProperty('onSelect');
});

it('[STATE-01][STATE-02][STATE-03][STATE-04] open: one notification per change; controlled follows the application only; v-model:open round-trips', async () => {
  const changes = vi.fn();
  let host = mount(() => menu({ 'onUpdate:open': changes }));
  trigger(host).click(); await settle(); trigger(host).click(); await settle();
  expect(changes.mock.calls).toEqual([[true], [false]]);
  app!.unmount(); document.body.replaceChildren(); changes.mockClear();
  const open = ref(false);
  host = mount(() => menu({ open: open.value, 'onUpdate:open': changes }));
  trigger(host).click(); await settle();
  expect(changes.mock.calls).toEqual([[true]]); expect(host.querySelector<HTMLElement>('.hw-menu-content')!.hidden).toBe(true);
  changes.mockClear(); open.value = true; await settle();
  expect(changes).not.toHaveBeenCalled(); expect(host.querySelector<HTMLElement>('.hw-menu-content')!.hidden).toBe(false);
  expect(document.activeElement!.textContent).toBe('Edit');
  app!.unmount(); document.body.replaceChildren();
  const model = ref(false);
  host = mount(() => menu({ open: model.value, 'onUpdate:open': (value: boolean) => { model.value = value; } }));
  trigger(host).click(); await settle(); expect(model.value).toBe(true);
  await key(document.activeElement!, 'Escape'); expect(model.value).toBe(false);
});

it('[STATE-05] server render with open true equals the first client render', async () => {
  const render = () => menu({ open: true });
  const html = await renderToString(createSSRApp(defineComponent(() => render)));
  expect(html).not.toContain('hidden');
  const host = document.createElement('div'); host.innerHTML = html; document.body.append(host); const server = host.innerHTML;
  app = createSSRApp(defineComponent(() => render)); app.mount(host); await nextTick();
  expect(host.innerHTML).toBe(server);
});

it('[MENU-01] keyboard: ArrowDown / ArrowUp open on the first / last enabled item; arrows skip the disabled item; Escape and Tab close', async () => {
  const host = mount(() => h('div', [menu(), h('button', { id: 'after' }, 'After')]));
  trigger(host).focus(); await key(trigger(host), 'ArrowUp');
  expect(document.activeElement!.textContent).toBe('Help');
  await key(document.activeElement!, 'ArrowUp'); expect(document.activeElement!.textContent).toBe('Edit');
  await key(document.activeElement!, 'End'); expect(document.activeElement!.textContent).toBe('Help');
  await key(document.activeElement!, 'Home'); expect(document.activeElement!.textContent).toBe('Edit');
  await key(document.activeElement!, 'Escape');
  expect(document.activeElement).toBe(trigger(host)); expect(trigger(host).getAttribute('aria-expanded')).toBe('false');
  await key(trigger(host), 'ArrowDown'); expect(document.activeElement!.textContent).toBe('Edit');
  await key(document.activeElement!, 'Tab');
  expect(trigger(host).getAttribute('aria-expanded')).toBe('false'); expect(document.activeElement!.textContent).toBe('Edit');
});

it('[MENU-02] a disabled menu has a disabled trigger; disabling an open menu closes it and notifies false once', async () => {
  const disabled = ref(false); const changes = vi.fn();
  const host = mount(() => menu({ disabled: disabled.value, 'onUpdate:open': changes }));
  trigger(host).click(); await settle(); changes.mockClear();
  disabled.value = true; await settle();
  expect(trigger(host).disabled).toBe(true); expect(changes.mock.calls).toEqual([[false]]);
  expect(host.querySelector<HTMLElement>('.hw-menu-content')!.hidden).toBe(true);
});

it('[MENU-03][nav-b-3][R15] the packaged triggers of Menu and Popover are secondary by default and follow triggerVariant', () => {
  const host = mount(() => h('div', [menu(), h(Popover, { label: 'Help', triggerLabel: 'Help' }), menu({ triggerVariant: 'ghost' }), h(Popover, { label: 'Help', triggerLabel: 'Help', triggerVariant: 'primary' })]));
  expect([...host.querySelectorAll('.hw-menu > button, .hw-popover > button')].map(button => button.getAttribute('data-variant'))).toEqual(['secondary', 'secondary', 'ghost', 'primary']);
});

it('[TEXT-01][R24] Menu without triggerLabel and trigger slot: empty trigger, one warning; label is not printed on the trigger', () => {
  const host = mount(() => h(Menu, { label: 'Actions', items }));
  expect(trigger(host).textContent).toBe('');
  expect(warnings()).toHaveLength(1); expect(warnings()[0]).toContain('Menu'); expect(warnings()[0]).toContain('triggerLabel');
});

it('[TEXT-02] triggerLabel is not required when the trigger slot is given (Menu and Popover)', () => {
  const host = mount(() => h('div', [h(Menu, { label: 'Actions', items }, { trigger: () => 'More' }), h(Popover, { label: 'Help' }, { trigger: () => '?', default: () => 'Body' })]));
  expect(trigger(host).textContent).toBe('More');
  expect(warnings()).toEqual([]);
});

it('[NAME-01][NAME-02][NAME-03][NAME-04][nav-b-9] Menu and Popover: the menu or panel is named by label, aria-label or aria-labelledby; never the root', () => {
  const host = mount(() => h('div', [
    menu(), menu({ label: undefined, 'aria-label': 'More actions' }), menu({ label: undefined, 'aria-labelledby': 'heading' }),
    h(Popover, { label: 'Help', triggerLabel: 'Help' }), h(Popover, { 'aria-label': 'Hints', triggerLabel: 'Help' }), h(Popover, { 'aria-labelledby': 'tip', triggerLabel: 'Help' }, () => h('h3', { id: 'tip' }, 'Tip')),
  ]));
  const named = [...host.querySelectorAll('.hw-menu-content, .hw-popover-panel')].map(node => [node.getAttribute('aria-label'), node.getAttribute('aria-labelledby')]);
  expect(named).toEqual([['Actions', null], ['More actions', null], [null, 'heading'], ['Help', null], ['Hints', null], [null, 'tip']]);
  for (const root of host.querySelectorAll('.hw-menu, .hw-popover')) { expect(root.hasAttribute('aria-label')).toBe(false); expect(root.hasAttribute('aria-labelledby')).toBe(false); }
  expect(warnings()).toEqual([]);
  app!.unmount(); document.body.replaceChildren();
  const unnamed = mount(() => h('div', [h(Menu, { triggerLabel: 'Actions', items }), h(Popover, { triggerLabel: 'Help' })]));
  expect(unnamed.querySelectorAll('[aria-label]')).toHaveLength(0);
  expect(warnings().filter(message => message.includes('label'))).toHaveLength(2);
});

const popover = (props: Record<string, unknown> = {}) => h('div', [
  h(Popover, { label: 'Filters', triggerLabel: 'Filters', ...props }, () => h('label', [h('input', { type: 'checkbox' }), 'Open only'])),
  h('button', { id: 'after', type: 'button' }, 'After'),
]);

it('[FOCUS-06][nav-b-7] Popover: focus leaving to an outside element closes it once and stays there', async () => {
  const changes = vi.fn();
  const host = mount(() => popover({ 'onUpdate:open': changes }));
  const button = host.querySelector<HTMLButtonElement>('.hw-popover > button')!;
  button.focus(); button.click(); await settle();
  host.querySelector<HTMLInputElement>('input')!.focus(); await settle();
  host.querySelector<HTMLButtonElement>('#after')!.focus(); await settle();
  expect(button.getAttribute('aria-expanded')).toBe('false'); expect(host.querySelector<HTMLElement>('.hw-popover-panel')!.hidden).toBe(true);
  expect(document.activeElement!.id).toBe('after'); expect(changes.mock.calls).toEqual([[true], [false]]);
});

it('[FOCUS-07][nav-b-7] Menu: focus moved by script outside closes it without moving focus back', async () => {
  const host = mount(() => h('div', [menu(), h('button', { id: 'after' }, 'After')]));
  trigger(host).click(); await settle();
  host.querySelector<HTMLButtonElement>('#after')!.focus(); await settle();
  expect(trigger(host).getAttribute('aria-expanded')).toBe('false'); expect(document.activeElement!.id).toBe('after');
});

it('[FOCUS-08] a focusout without relatedTarget leaves Popover and Menu open and notifies nothing', async () => {
  const changes = vi.fn();
  const host = mount(() => h('div', [menu({ 'onUpdate:open': changes }), h(Popover, { label: 'Help', triggerLabel: 'Help', 'onUpdate:open': changes }, () => h('button', 'Inside'))]));
  trigger(host).click(); host.querySelector<HTMLButtonElement>('.hw-popover > button')!.click(); await settle(); changes.mockClear();
  for (const node of [host.querySelector('.hw-menu-item')!, host.querySelector('.hw-popover-panel button')!]) node.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
  await settle();
  expect(changes).not.toHaveBeenCalled();
  expect(host.querySelector<HTMLElement>('.hw-menu-content')!.hidden).toBe(false); expect(host.querySelector<HTMLElement>('.hw-popover-panel')!.hidden).toBe(false);
});

it('[FOCUS-05][nav-b-8] Popover: Escape with focus outside leaves it open and focus where it is', async () => {
  const changes = vi.fn();
  const host = mount(() => popover({ defaultOpen: true, 'onUpdate:open': changes }));
  const after = host.querySelector<HTMLButtonElement>('#after')!; after.focus();
  await key(after, 'Escape');
  expect(host.querySelector<HTMLElement>('.hw-popover-panel')!.hidden).toBe(false); expect(document.activeElement).toBe(after); expect(changes).not.toHaveBeenCalled();
});

it('[POPOVER-01][nav-b-8] Escape in the panel or on the trigger closes and focuses the trigger, also when opened by the state', async () => {
  const host = mount(() => popover({ defaultOpen: true }));
  const button = host.querySelector<HTMLButtonElement>('.hw-popover > button')!; const input = host.querySelector<HTMLInputElement>('input')!;
  input.focus(); await key(input, 'Escape');
  expect(host.querySelector<HTMLElement>('.hw-popover-panel')!.hidden).toBe(true); expect(document.activeElement).toBe(button);
  button.click(); await settle(); await key(button, 'Escape');
  expect(host.querySelector<HTMLElement>('.hw-popover-panel')!.hidden).toBe(true); expect(document.activeElement).toBe(button);
});

it('[POPOVER-02][nav-b-9] the panel is div.hw-popover-panel[role=region] holding exactly the application content', () => {
  const host = mount(() => popover());
  const panel = host.querySelector('.hw-popover > div.hw-popover-panel[role=region]')!;
  expect(panel.children).toHaveLength(1); expect(panel.firstElementChild!.tagName).toBe('LABEL');
  expect(host.querySelector('.hw-popover-content, .hw-popover h3, .hw-popover section')).toBeNull();
});

it('[POPOVER-03] disabled: the trigger is disabled and an open popover closes with one notification', async () => {
  const disabled = ref(false); const changes = vi.fn();
  const host = mount(() => popover({ defaultOpen: true, disabled: disabled.value, 'onUpdate:open': changes }));
  disabled.value = true; await settle();
  expect(host.querySelector<HTMLButtonElement>('.hw-popover > button')!.disabled).toBe(true);
  expect(host.querySelector<HTMLElement>('.hw-popover-panel')!.hidden).toBe(true); expect(changes.mock.calls).toEqual([[false]]);
});

const treeName = (item: Element) => document.getElementById(item.getAttribute('aria-labelledby')!)?.textContent;

it('[TREE-01][nav-b-12] every treeitem sets --hw-tree-depth to aria-level - 1 and no inline padding', () => {
  const host = mount(() => h(TreeView, { label: 'Services', items: tree, defaultExpanded: ['apps'], getExpandLabel: (node: { label: string }) => `Expand ${node.label}`, getCollapseLabel: (node: { label: string }) => `Collapse ${node.label}` }));
  for (const item of host.querySelectorAll<HTMLElement>('li[role=treeitem]')) {
    expect(item.style.getPropertyValue('--hw-tree-depth')).toBe(String(Number(item.getAttribute('aria-level')) - 1));
    expect(item.style.paddingInlineStart + item.style.paddingLeft + item.style.paddingRight).toBe('');
  }
});

it('[TREE-03][nav-b-13][R21] a branch renders button.hw-tree-toggle outside the tab order, named by the expand or collapse text; a leaf has none', async () => {
  const host = mount(treeView);
  const branch = host.querySelector('li[role=treeitem]')!;
  const toggle = () => branch.querySelector<HTMLButtonElement>(':scope > button.hw-tree-toggle[type=button][tabindex="-1"]')!;
  expect(toggle().getAttribute('aria-label')).toBe('Expand Applications');
  expect(toggle().querySelector('span.hw-icon[data-size=sm][aria-hidden=true]')!.getAttribute('data-icon')).toBe('add-01');
  toggle().click(); await settle();
  expect(toggle().getAttribute('aria-label')).toBe('Collapse Applications');
  expect(toggle().querySelector('.hw-icon')!.getAttribute('data-icon')).toBe('minus-sign');
  expect([...host.querySelectorAll('li[role=treeitem]')].filter(item => !item.getAttribute('aria-expanded')).every(leaf => !leaf.querySelector('button'))).toBe(true);
});

it('[TREE-04] the toggle expands without selecting, notifies expanded once and focuses the tree item; no toggle is a tab stop', async () => {
  const value = vi.fn(); const expanded = vi.fn();
  const host = mount(() => h(TreeView, { label: 'Services', items: tree, getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse', 'onUpdate:modelValue': value, 'onUpdate:expanded': expanded }));
  const branch = host.querySelector('li[role=treeitem]')!;
  branch.querySelector<HTMLButtonElement>('.hw-tree-toggle')!.click(); await settle();
  expect(value).not.toHaveBeenCalled(); expect(expanded.mock.calls).toEqual([[['apps']]]);
  expect(document.activeElement).toBe(branch);
  expect([...host.querySelectorAll('.hw-tree-toggle')].every(button => button.getAttribute('tabindex') === '-1')).toBe(true);
});

it('[TREE-05] the tree item aria-labelledby resolves to exactly the node label', () => {
  const host = mount(treeView);
  expect([...host.querySelectorAll('li[role=treeitem]')].map(treeName)).toEqual(['Applications', 'Billing', 'Budget', 'Backup', 'Bonds']);
  expect(host.querySelector('li[role=treeitem][aria-label]')).toBeNull();
});

it('[TEXT-01][nav-b-13] a missing getExpandLabel leaves the toggle without aria-label and warns once', () => {
  const host = mount(() => h(TreeView, { label: 'Services', items: tree, getCollapseLabel: () => 'Collapse' } as never));
  expect(host.querySelector('.hw-tree-toggle')!.hasAttribute('aria-label')).toBe(false);
  expect(warnings().filter(message => message.includes('TreeView') && message.includes('getExpandLabel'))).toHaveLength(1);
});

it('[SHAPE-01][nav-b-17] items and expanded render the shared levels, positions and expansion', () => {
  const host = mount(() => h(TreeView, { label: 'Services', items: tree, expanded: ['apps'], getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse' }));
  expect([...host.querySelectorAll('li[role=treeitem]')].map(item => [treeName(item), item.getAttribute('aria-level'), item.getAttribute('aria-posinset'), item.getAttribute('aria-setsize'), item.getAttribute('aria-expanded')])).toEqual([
    ['Applications', '1', '1', '5', 'true'], ['Atlas', '2', '1', '2', null], ['Beacon', '2', '2', '2', null],
    ['Billing', '1', '2', '5', null], ['Budget', '1', '3', '5', null], ['Backup', '1', '4', '5', null], ['Bonds', '1', '5', '5', null],
  ]);
});

it('[STATE-01][STATE-02][STATE-03][STATE-04][nav-b-17] expanded: uncontrolled notifies per toggle; controlled follows the application; v-model:expanded round-trips', async () => {
  const changes = vi.fn();
  let host = mount(() => h(TreeView, { label: 'Services', items: tree, getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse', 'onUpdate:expanded': changes }));
  const toggle = () => host.querySelector<HTMLButtonElement>('.hw-tree-toggle')!;
  toggle().click(); await settle(); toggle().click(); await settle();
  expect(changes.mock.calls).toEqual([[['apps']], [[]]]);
  app!.unmount(); document.body.replaceChildren(); changes.mockClear();
  const controlled = ref<string[]>([]);
  host = mount(() => h(TreeView, { label: 'Services', items: tree, expanded: controlled.value, getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse', 'onUpdate:expanded': changes }));
  toggle().click(); await settle();
  expect(changes.mock.calls).toEqual([[['apps']]]); expect(host.querySelector('li[role=treeitem]')!.getAttribute('aria-expanded')).toBe('false');
  changes.mockClear(); controlled.value = ['apps']; await settle();
  expect(changes).not.toHaveBeenCalled(); expect(host.querySelector('li[role=treeitem]')!.getAttribute('aria-expanded')).toBe('true');
  app!.unmount(); document.body.replaceChildren();
  const model = ref<readonly string[]>([]);
  host = mount(() => h(TreeView, { label: 'Services', items: tree, expanded: model.value, 'onUpdate:expanded': (value: readonly string[]) => { model.value = value; }, getExpandLabel: () => 'Expand', getCollapseLabel: () => 'Collapse' }));
  toggle().click(); await settle(); expect(model.value).toEqual(['apps']);
  expect(host.querySelector('li[role=treeitem]')!.getAttribute('aria-expanded')).toBe('true');
});
