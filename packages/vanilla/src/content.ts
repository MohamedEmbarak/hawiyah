import { createCleanup, getDirection, hasText, getNextEnabledIndex, isDisabled, observeReadonlyChoice, normalizeDigits, normalizeSearch, requireText, sortRows } from '@hawiyah/core';
import { emit, eventElement, nameRoot, nativeChange, readOnly, remember, templated, text, writeOptional, writeText } from './dom.js';
import type { ValueController } from './controls.js';

function blocked(root: HTMLElement): boolean { return isDisabled(root) || root.dataset.hwDisabled === 'true'; }
function buttonType(scope: ReturnType<typeof createCleanup>, element: HTMLElement): void {
  if (element.tagName === 'BUTTON') { remember(scope, element, ['type']); (element as HTMLButtonElement).type = 'button'; }
}
function watchDisabled(scope: ReturnType<typeof createCleanup>, root: HTMLElement, render: () => void): void {
  const Observer = root.ownerDocument.defaultView?.MutationObserver; if (!Observer) return;
  const observer = new Observer(render); observer.observe(root, {attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'data-hw-disabled']}); scope.add(() => observer.disconnect());
}
function ownItems<T extends HTMLElement>(root: HTMLElement, selector: string): T[] {
  return [...root.querySelectorAll<T>(selector)].filter(item => { const owner = item.closest('[data-hw]'); return !owner || owner === root || !root.contains(owner); });
}

export interface ToggleGroupOptions { multiple?: boolean; name?: string; value?: string | readonly string[]; onValueChange?: (value: string | string[]) => void }
export interface ToggleGroupController extends ValueController<string | string[]> { select(value: string): void }
export function createToggleGroup(root: HTMLElement, options: ToggleGroupOptions = {}): ToggleGroupController {
  const multiple = options.multiple ?? root.dataset.hwMultiple === 'true';
  const radios = ownItems<HTMLInputElement>(root, 'input[type="radio"]');
  const buttons = ownItems<HTMLElement>(root, 'button[data-hw-value]');
  const items = multiple ? buttons : radios;
  const scope = createCleanup();
  const originals = radios.map(input => input.checked);
  const originalReadOnly=radios.map(input=>input.readOnly);
  const originalAria=new Map(items.map(item=>[item,item.getAttribute('aria-disabled')])); const readonlyMarked=new Set<HTMLElement>();
  items.forEach(item=>remember(scope,item,['aria-disabled']));
  const guards=radios.map(observeReadonlyChoice);scope.add(()=>guards.forEach(guard=>guard.destroy()));
  scope.add(()=>radios.forEach((input,index)=>{input.readOnly=originalReadOnly[index]!;}));
  radios.forEach((input, index) => scope.add(() => { input.checked = originals[index]!; }));
  buttons.forEach(button => { remember(scope, button, ['aria-pressed']); buttonType(scope, button); });
  const itemValue = (item: HTMLElement) => multiple ? item.dataset.hwValue! : (item as HTMLInputElement).value;
  const allowed = new Set(items.map(itemValue));
  const source = options.value ?? (multiple ? buttons.filter(button => button.getAttribute('aria-pressed') === 'true').map(itemValue) : radios.find(input => input.checked)?.value ?? '');
  let values = (Array.isArray(source) ? [...source] : source ? [source as string] : []).filter(value => allowed.has(value));
  if (!multiple) values = values.slice(0, 1);
  const initial = [...values];
  const name = options.name ?? root.dataset.hwName; const hiddenValues = multiple && name ? root.ownerDocument.createElement('span') : undefined;
  if (hiddenValues) { hiddenValues.hidden = true; root.append(hiddenValues); scope.add(() => hiddenValues.remove()); }
  const getValue = (): string | string[] => multiple ? [...values] : values[0] ?? '';
  const render = () => { items.forEach(item => { const frozen=readOnly(root) || !multiple && originalReadOnly[radios.indexOf(item as HTMLInputElement)]; if(!multiple)(item as HTMLInputElement).readOnly=Boolean(frozen); if(frozen){if(!readonlyMarked.has(item))originalAria.set(item,item.getAttribute('aria-disabled'));readonlyMarked.add(item);item.setAttribute('aria-disabled','true');}else if(readonlyMarked.delete(item)){if(originalAria.get(item)===null)item.removeAttribute('aria-disabled');else item.setAttribute('aria-disabled',originalAria.get(item)!);} if (multiple) item.setAttribute('aria-pressed', String(values.includes(itemValue(item)))); else (item as HTMLInputElement).checked = values.includes(itemValue(item)); }); if (hiddenValues) { hiddenValues.replaceChildren(); values.forEach(value => { const input = root.ownerDocument.createElement('input'); input.type = 'hidden'; input.name = name!; input.value = value; const item=items.find(item=>itemValue(item)===value)!; input.disabled = blocked(root) || (readOnly(root) ? item.matches(':disabled') || originalAria.get(item)==='true' : isDisabled(item)); hiddenValues.append(input); }); } guards.forEach(guard=>guard.refresh()); };
  const select = (value: string) => {
    const item = items.find(item => itemValue(item) === value);
    if (scope.destroyed || !item || blocked(root) || isDisabled(item) || readOnly(root)) { if (!scope.destroyed) render(); return; }
    const next = multiple ? values.includes(value) ? values.filter(current => current !== value) : [...values, value] : [value];
    if (next.length === values.length && next.every((entry, index) => entry === values[index])) return;
    values = next; render(); const result = getValue(); emit(root, { value: result }); options.onValueChange?.(result);
  };
  scope.listen(root, multiple ? 'click' : 'change', event => {
    const item = eventElement(event)?.closest<HTMLElement>(multiple ? 'button[data-hw-value]' : 'input[type="radio"]');
    if (!item || !items.includes(item as HTMLInputElement & HTMLElement)) return;
    if (multiple) event.preventDefault(); select(itemValue(item));
  });
  if (!multiple) scope.listen(root, 'click', event => { if (blocked(root) || readOnly(root)) event.preventDefault(); });
  const form = radios[0]?.form ?? root.closest('form');
  if (form) scope.listen(form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { values = [...initial]; render(); } }));
  const ReadonlyObserver=root.ownerDocument.defaultView?.MutationObserver; if(ReadonlyObserver){const observer=new ReadonlyObserver(render);observer.observe(root,{attributes:true,attributeFilter:['data-hw-readonly','aria-readonly']});scope.add(()=>observer.disconnect());}
  watchDisabled(scope, root, render); render(); return { get value() { return getValue(); }, select, destroy: () => scope.destroy() };
}

export interface FeedbackOptions {
  value?: string; onValueChange?: (value: string) => void;
  /** Status text after an answer (data-hw-success-message). Required. */
  successMessage?: string;
  /** Optional override of successMessage for one answer. */
  getStatusMessage?: (value: string) => string;
}
export interface FeedbackController extends ValueController<string> { select(value: string): void }
export function createFeedback(root: HTMLElement, options: FeedbackOptions = {}): FeedbackController {
  const scope = createCleanup(); const buttons = ownItems<HTMLElement>(root, 'button[data-hw-value]');
  const input = root.querySelector<HTMLInputElement>('[data-hw-feedback-value]'); const status = root.querySelector<HTMLElement>('[data-hw-feedback-status]');
  buttons.forEach(button => { remember(scope, button, ['aria-pressed']); buttonType(scope, button); });
  const originalInput = input?.value; const originalDisabled = input?.disabled ?? false; const originalStatus = status?.textContent;
  if (input) { remember(scope, input, ['value', 'disabled']); scope.add(() => { input.value = originalInput ?? ''; }); }
  if (status) scope.add(() => { status.textContent = originalStatus ?? ''; });
  let value = options.value ?? (input?.value || buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.hwValue || '');
  const initial = value; const success = () => text(root, 'successMessage', options.successMessage);
  if (!options.getStatusMessage) requireText('Feedback', 'successMessage', success());
  const render = () => { buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.hwValue === value))); if (input) { input.value = value; input.disabled = originalDisabled || blocked(root); } if (status) status.textContent = value ? (options.getStatusMessage?.(value) ?? (requireText('Feedback', 'successMessage', success()) ? success()! : '')) : originalStatus ?? ''; };
  const select = (next: string) => {
    const button = buttons.find(button => button.dataset.hwValue === next);
    if (scope.destroyed || !button || blocked(root) || isDisabled(button) || readOnly(root) || value === next) return;
    value = next; render(); if (input) nativeChange(input); emit(root, { value }); options.onValueChange?.(value);
  };
  scope.listen(root, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('button[data-hw-value]'); if (button && buttons.includes(button)) { event.preventDefault(); select(button.dataset.hwValue!); } });
  const form = input?.form ?? root.closest('form'); if (form) scope.listen(form, 'reset', event => queueMicrotask(() => { if (!scope.destroyed && !event.defaultPrevented) { value = initial; render(); } }));
  watchDisabled(scope, root, render); render(); return { get value() { return value; }, select, destroy: () => scope.destroy() };
}

export type ConsentChoice = 'accepted' | 'rejected';
export interface CookieConsentOptions { storageKey?: string; onValueChange?: (value: ConsentChoice) => void }
export interface CookieConsentController extends ValueController<ConsentChoice | null> { choose(value: ConsentChoice): void }
export function createCookieConsent(root: HTMLElement, options: CookieConsentOptions = {}): CookieConsentController {
  const scope = createCleanup(); remember(scope, root, ['hidden']);
  const buttons = ownItems<HTMLElement>(root, '[data-hw-consent]'); buttons.forEach(button => buttonType(scope, button));
  let value: ConsentChoice | null = null;
  // Persistence is opt-in. Storage can be denied by browser privacy settings.
  if (options.storageKey) { try { const stored = root.ownerDocument.defaultView?.localStorage.getItem(options.storageKey); if (stored === 'accepted' || stored === 'rejected') { value = stored; root.hidden = true; } } catch { /* Keep the consent UI usable without storage. */ } }
  const choose = (choice: ConsentChoice) => {
    if (scope.destroyed || blocked(root) || value === choice || (choice !== 'accepted' && choice !== 'rejected')) return;
    value = choice; root.hidden = true;
    if (options.storageKey) { try { root.ownerDocument.defaultView?.localStorage.setItem(options.storageKey, choice); } catch { /* The caller still receives the choice. */ } }
    emit(root, { value }); options.onValueChange?.(choice);
  };
  scope.listen(root, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-hw-consent]'); if (!button || !buttons.includes(button) || isDisabled(button)) return; const choice = button.dataset.hwConsent; if (choice === 'accepted' || choice === 'rejected') { event.preventDefault(); choose(choice); } });
  return { get value() { return value; }, choose, destroy: () => scope.destroy() };
}

export interface TreeViewOptions { value?: string; expandedValues?: readonly string[]; onValueChange?: (value: string) => void; onExpandedChange?: (values: string[]) => void }
export interface TreeViewController extends ValueController<string> { readonly expandedValues: string[]; select(value: string): void; toggle(value: string): void; focus(value: string): void }
export function createTreeView(root: HTMLElement, options: TreeViewOptions = {}): TreeViewController {
  const scope = createCleanup();
  const items = [...root.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(item => !item.parentElement?.closest('[data-hw="tree-view"]') || item.parentElement.closest('[data-hw="tree-view"]') === root);
  const values = items.map(item => item.dataset.hwValue ?? '');
  if (values.some(value => !value) || new Set(values).size !== values.length) throw new Error('Hawiyah: tree items require unique non-empty data-hw-value attributes.');
  remember(scope, root, ['role']); root.setAttribute('role', 'tree');
  const groups = new Map<HTMLElement, HTMLElement>();
  const parent = (item: HTMLElement): HTMLElement | undefined => { const result = item.parentElement?.closest<HTMLElement>('[role="treeitem"]'); return result && root.contains(result) ? result : undefined; };
  items.forEach(item => {
    remember(scope, item, ['tabindex', 'aria-selected', 'aria-expanded', 'aria-level', 'aria-posinset', 'aria-setsize']);
    const group = [...item.children].find(child => child.getAttribute('role') === 'group') as HTMLElement | undefined;
    if (group) { groups.set(item, group); remember(scope, group, ['hidden']); }
    const toggle = [...item.children].find(child => child.hasAttribute('data-hw-tree-toggle')) as HTMLElement | undefined;
    if (toggle) { remember(scope, toggle, ['tabindex']); toggle.tabIndex = -1; buttonType(scope, toggle); }
    let level = 1; let ancestor = parent(item); while (ancestor) { level++; ancestor = parent(ancestor); }
    const siblings = items.filter(candidate => candidate.parentElement === item.parentElement);
    item.setAttribute('aria-level', String(level)); item.setAttribute('aria-posinset', String(siblings.indexOf(item) + 1)); item.setAttribute('aria-setsize', String(siblings.length));
  });
  let expanded = new Set(options.expandedValues ?? items.filter(item => groups.has(item) && item.getAttribute('aria-expanded') === 'true').map(item => item.dataset.hwValue!));
  let value = options.value ?? root.dataset.hwValue ?? items.find(item => item.getAttribute('aria-selected') === 'true')?.dataset.hwValue ?? '';
  if (!values.includes(value)) value = '';
  let focused = value;
  const visible = () => items.filter(item => { if (item.hidden) return false; let ancestor = parent(item); while (ancestor) { if (ancestor.hidden || !expanded.has(ancestor.dataset.hwValue!)) return false; ancestor = parent(ancestor); } return true; });
  const render = () => {
    groups.forEach((group, item) => { const open = expanded.has(item.dataset.hwValue!); group.hidden = !open; item.setAttribute('aria-expanded', String(open)); });
    const available = visible().filter(item => !isDisabled(item));
    if (!available.some(item => item.dataset.hwValue === focused)) focused = available.find(item => item.dataset.hwValue === value)?.dataset.hwValue ?? available[0]?.dataset.hwValue ?? '';
    items.forEach(item => { item.setAttribute('aria-selected', String(item.dataset.hwValue === value)); item.tabIndex = !blocked(root) && !isDisabled(item) && item.dataset.hwValue === focused ? 0 : -1; });
  };
  const focus = (next: string) => { if (scope.destroyed || blocked(root)) return; const item = visible().find(item => item.dataset.hwValue === next && !isDisabled(item)); if (!item) return; focused = next; render(); item.focus(); };
  const select = (next: string) => { const item = visible().find(item => item.dataset.hwValue === next); if (scope.destroyed || !item || blocked(root) || readOnly(root) || isDisabled(item) || next === value) return; value = next; focused = next; render(); emit(root, { value }); options.onValueChange?.(value); };
  const toggle = (next: string) => { const item = items.find(item => item.dataset.hwValue === next); if (scope.destroyed || !item || !groups.has(item) || blocked(root) || isDisabled(item)) return; const group = groups.get(item)!; const closing = expanded.has(next); const restoreFocus = closing && group.contains(root.ownerDocument.activeElement); if (closing) expanded.delete(next); else expanded.add(next); const focusedItem = items.find(item => item.dataset.hwValue === focused); if (closing && focusedItem && group.contains(focusedItem)) focused = next; render(); if (restoreFocus) item.focus(); emit(root, { value, expandedValues: [...expanded] }); options.onExpandedChange?.([...expanded]); };
  let query = ''; let timer: ReturnType<typeof setTimeout> | undefined;
  scope.add(() => { if (timer !== undefined) clearTimeout(timer); });
  scope.listen(root, 'focusin', event => { const item = eventElement(event)?.closest<HTMLElement>('[role="treeitem"]'); if (item && items.includes(item) && !isDisabled(item)) { focused = item.dataset.hwValue!; render(); } });
  scope.listen(root, 'click', event => {
    const target = eventElement(event); const item = target?.closest<HTMLElement>('[role="treeitem"]'); if (!item || !items.includes(item) || blocked(root) || isDisabled(item)) return;
    if (target?.closest('[data-hw-tree-toggle]')) { event.preventDefault(); toggle(item.dataset.hwValue!); focus(item.dataset.hwValue!); }
    else { select(item.dataset.hwValue!); focus(item.dataset.hwValue!); }
  });
  scope.listen(root, 'keydown', event => {
    const key = event as KeyboardEvent; const item = eventElement(event)?.closest<HTMLElement>('[role="treeitem"]');
    if (!item || !items.includes(item) || blocked(root) || isDisabled(item) || key.altKey || key.ctrlKey || key.metaKey || key.isComposing) return;
    const current = visible(); const index = current.indexOf(item); const rtl = getDirection(root) === 'rtl'; const id = item.dataset.hwValue!;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key.key)) { key.preventDefault(); const next = getNextEnabledIndex(index, key.key, current.map(item => ({disabled: isDisabled(item)})), 'ltr', 'vertical'); if (current[next]) focus(current[next]!.dataset.hwValue!); }
    else if (key.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { key.preventDefault(); if (groups.has(item)) { if (!expanded.has(id)) toggle(id); else { const child = current.find(candidate => parent(candidate) === item && !isDisabled(candidate)); if (child) focus(child.dataset.hwValue!); } } }
    else if (key.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { key.preventDefault(); if (groups.has(item) && expanded.has(id)) toggle(id); else { const ancestor = parent(item); if (ancestor) focus(ancestor.dataset.hwValue!); } }
    else if (key.key === 'Enter' || key.key === ' ') { key.preventDefault(); select(id); }
    else if (key.key.length === 1) {
      key.preventDefault(); query += normalizeSearch(key.key); if (timer !== undefined) clearTimeout(timer); timer = setTimeout(() => { query = ''; }, 500);
      const search = [...query].every(character => character === query[0]) ? query[0]! : query;
      for (let offset = 1; offset <= current.length; offset++) { const candidate = current[(index + offset) % current.length]!; const label = candidate.querySelector('[data-hw-tree-label]')?.textContent ?? [...candidate.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join(''); if (!isDisabled(candidate) && normalizeSearch(label).startsWith(search)) { focus(candidate.dataset.hwValue!); break; } }
    }
  });
  watchDisabled(scope, root, render); render(); return { get value() { return value; }, get expandedValues() { return [...expanded]; }, select, toggle, focus, destroy: () => scope.destroy() };
}

export interface CarouselOptions {
  index?: number; loop?: boolean; onValueChange?: (index: number) => void;
  /** Accessible name of the root, unless the markup names it (data-hw-label). */
  label?: string;
  /** Name of each slide and indicator, and the live status text; position is one-based (data-hw-slide-label="{position} / {total}"). Required. */
  getSlideLabel?: (position: number, total: number) => string;
  /** Status text when there are no slides (data-hw-empty-label). Required. */
  emptyLabel?: string;
  /** Optional aria-roledescription of the root and of each slide; nothing is rendered without them. */
  carouselDescription?: string; slideDescription?: string;
}
export interface CarouselController { readonly index: number; select(index: number): void; previous(): void; next(): void; destroy(): void }
export function createCarousel(root: HTMLElement, options: CarouselOptions = {}): CarouselController {
  const slides = ownItems<HTMLElement>(root, '[data-hw-slide]');
  const previous = ownItems<HTMLElement>(root, '[data-hw-previous]')[0] ?? null;
  const next = ownItems<HTMLElement>(root, '[data-hw-next]')[0] ?? null;
  const status = ownItems<HTMLElement>(root, '[data-hw-carousel-status]')[0];
  const track = ownItems<HTMLElement>(root, '[data-hw-carousel-track], .hw-carousel-track')[0];
  const dots = ownItems<HTMLButtonElement>(root, '[data-hw-carousel-dot]');
  const dotIndexes = dots.map((dot, position) => Number(dot.dataset.hwCarouselDot || position));
  const scope = createCleanup(); const initialText = status?.textContent;
  const previousDisabled = !!previous && isDisabled(previous), nextDisabled = !!next && isDisabled(next);
  const dotDisabled = dots.map(isDisabled), loop = options.loop ?? root.dataset.hwLoop === 'true';
  remember(scope, root, ['role', 'aria-roledescription', 'aria-label']);
  if (!root.hasAttribute('role')) root.setAttribute('role', 'region');
  nameRoot(root, 'Carousel', text(root, 'label', options.label));
  writeOptional(root, 'aria-roledescription', text(root, 'carouselDescription', options.carouselDescription));
  if (track) {remember(scope, root, ['style', 'data-hw-carousel-ready']); root.setAttribute('data-hw-carousel-ready', '');}
  slides.forEach(slide => {remember(scope, slide, ['hidden', 'inert', 'aria-hidden', 'role', 'aria-label', 'aria-roledescription']); if (!slide.hasAttribute('role') && slide.tagName !== 'ARTICLE') slide.setAttribute('role', 'group'); writeOptional(slide, 'aria-roledescription', text(root, 'slideDescription', options.slideDescription));});
  [previous, next, ...dots].forEach(button => {if(button){remember(scope, button, ['disabled', 'aria-disabled']); buttonType(scope, button);}});
  dots.forEach(dot => remember(scope, dot, ['aria-label', 'aria-current']));
  if(status){remember(scope, status, ['role', 'aria-live']); status.setAttribute('role','status');status.setAttribute('aria-live','polite');scope.add(()=>{status.textContent=initialText??'';});}
  const start=options.index ?? Number(root.dataset.hwIndex || 0);
  let index=Number.isFinite(start)?Math.max(0, Math.min(slides.length-1, Math.floor(start))):0;
  const slideLabel=templated(root,'getSlideLabel',options.getSlideLabel,(position:number,total:number)=>({position,total}));
  const label=(position:number)=>slideLabel(position+1,slides.length);
  const authored=new Set([...slides,...dots].filter(node=>node.hasAttribute('aria-label')));
  requireText('Carousel','getSlideLabel',options.getSlideLabel??root.getAttribute('data-hw-slide-label'));requireText('Carousel','emptyLabel',text(root,'emptyLabel',options.emptyLabel));
  const disable=(button:HTMLElement|null,disabled:boolean)=>{if(!button)return;if(button.tagName==='BUTTON')(button as HTMLButtonElement).disabled=disabled;button.setAttribute('aria-disabled',String(disabled));};
  const render=()=>{
    slides.forEach((slide,position)=>{const inactive=position!==index;slide.hidden=inactive;slide.toggleAttribute('inert',inactive);slide.setAttribute('aria-hidden',String(inactive));if(!authored.has(slide))writeText(slide,'aria-label','Carousel','getSlideLabel',label(position));});
    if(track)root.style.setProperty('--hw-carousel-index',String(index));
    disable(previous,previousDisabled||blocked(root)||slides.length<2||(!loop&&index===0));
    disable(next,nextDisabled||blocked(root)||slides.length<2||(!loop&&index===slides.length-1));
    dots.forEach((dot,position)=>{const target=dotIndexes[position] ?? -1;const valid=Number.isInteger(target)&&target>=0&&target<slides.length;disable(dot,dotDisabled[position]||blocked(root)||!valid);if(target===index&&valid)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');if(!authored.has(dot)){if(valid)writeText(dot,'aria-label','Carousel','getSlideLabel',label(target));else dot.removeAttribute('aria-label');}});
    if(status){const message=slides.length?label(index):text(root,'emptyLabel',options.emptyLabel);status.textContent=requireText('Carousel',slides.length?'getSlideLabel':'emptyLabel',message)?message!:'';}
  };
  const select=(nextIndex:number)=>{if(scope.destroyed||blocked(root)||!slides.length||!Number.isFinite(nextIndex))return;const rounded=Math.floor(nextIndex);const bounded=loop?((rounded%slides.length)+slides.length)%slides.length:Math.max(0,Math.min(slides.length-1,rounded));if(bounded===index)return;index=bounded;render();emit(root,{value:index,index});options.onValueChange?.(index);};
  if(previous)scope.listen(previous,'click',event=>{event.preventDefault();if(!isDisabled(previous))select(index-1);});
  if(next)scope.listen(next,'click',event=>{event.preventDefault();if(!isDisabled(next))select(index+1);});
  dots.forEach((dot,position)=>scope.listen(dot,'click',event=>{event.preventDefault();if(!isDisabled(dot))select(dotIndexes[position] ?? Number.NaN);}));
  watchDisabled(scope,root,render);render();return{get index(){return index;},select,previous:()=>select(index-1),next:()=>select(index+1),destroy:()=>scope.destroy()};
}

export type SortDirection = 'ascending' | 'descending';
/** `locale` (or data-hw-locale on the root) collates text when sorting and is required when the table has a [data-hw-sort] button. Without it the controller warns in development, updates aria-sort and emits as usual, and keeps the rows in their source order. */
export interface DataTableOptions { locale?: string; onSortChange?: (state: {key: string; direction: SortDirection}) => void }
export interface DataTableController { readonly sortKey: string | null; readonly sortDirection: SortDirection | null; sort(key: string, direction?: SortDirection): void; destroy(): void }
export function createDataTable(root: HTMLElement, options: DataTableOptions = {}): DataTableController {
  const table = root.tagName === 'TABLE' ? root as HTMLTableElement : root.querySelector<HTMLTableElement>('table');
  if (!table || !table.tBodies.length) throw new Error('Hawiyah: a data table requires a native table and tbody.');
  const buttons = [...table.querySelectorAll<HTMLElement>('[data-hw-sort]')]; const headers = [...table.querySelectorAll<HTMLTableCellElement>('thead th[data-hw-key]')]; const scope = createCleanup();
  headers.forEach(header => { remember(scope, header, ['aria-sort', 'scope']); header.scope = 'col'; if (buttons.some(button => button.dataset.hwSort === header.dataset.hwKey)) header.setAttribute('aria-sort', 'none'); });
  buttons.forEach(button => buttonType(scope, button));
  const bodies = [...table.tBodies].map(body => ({body, rows: [...body.rows], children: [...body.childNodes]}));
  // Preserve authored row nodes, handlers, and inter-row text/comments on cleanup.
  bodies.forEach(({body, children}) => scope.add(() => { const added = [...body.childNodes].filter(node => !children.includes(node)); body.replaceChildren(...children, ...added); }));
  const locale = () => { const value = options.locale ?? root.dataset.hwLocale; return hasText(value) ? value : undefined; };
  if (buttons.length) requireText('DataTable', 'locale', locale(), 'a column is sortable');
  let sortKey: string | null = null; let sortDirection: SortDirection | null = null;
  const sort = (key: string, direction?: SortDirection) => {
    const header = headers.find(header => header.dataset.hwKey === key); const button = buttons.find(button => button.dataset.hwSort === key);
    if (scope.destroyed || blocked(root) || !header || !button || isDisabled(button)) return;
    sortDirection = direction ?? (sortKey === key && sortDirection === 'ascending' ? 'descending' : 'ascending'); sortKey = key;
    headers.forEach(header => { if (buttons.some(button => button.dataset.hwSort === header.dataset.hwKey)) header.setAttribute('aria-sort', header.dataset.hwKey === key ? sortDirection! : 'none'); });
    const collation = locale(); if (collation !== undefined) bodies.forEach(({body, rows}) => {
      const currentRows = [...body.rows]; const ordered = [...rows.filter(row => currentRows.includes(row)), ...currentRows.filter(row => !rows.includes(row))];
      const records = ordered.map(row => { const cell = row.cells[header.cellIndex]; const raw = cell?.dataset.hwSortValue ?? cell?.textContent?.trim() ?? ''; const numeric = Number(normalizeDigits(raw).replace(/[,٬\s]/gu, '').replace(/٫/gu, '.')); return { row, value: header.dataset.hwType === 'number' ? raw && Number.isFinite(numeric) ? numeric : null : raw }; });
      sortRows(records, 'value', sortDirection!, collation).forEach(record => body.append(record.row));
    });
    const state = {key, direction: sortDirection}; emit(root, { value: state, ...state }); options.onSortChange?.(state);
  };
  scope.listen(table, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-hw-sort]'); if (button && buttons.includes(button)) { event.preventDefault(); sort(button.dataset.hwSort!); } });
  return { get sortKey() { return sortKey; }, get sortDirection() { return sortDirection; }, sort, destroy: () => scope.destroy() };
}
