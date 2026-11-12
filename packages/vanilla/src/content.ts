import { createCleanup, createTypeahead, type ConsentChoice, type FeedbackValue, getDirection, isTypeaheadKey, observeFormReset, sameValue, hasText, getNextEnabledIndex, isDisabled, observeReadonlyChoice, normalizeDigits, requireText, sortRows } from '@hawiyah/core';
import { emit, ensureId, eventElement, named, nameRoot, nativeChange, readOnly, remember, templated, text, writeOptional, writeText } from './dom.js';
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
  // A failed submission marks the group invalid until an option is chosen or the form resets.
  remember(scope, root, ['aria-invalid']); const authoredInvalid = root.getAttribute('aria-invalid');
  const clearInvalid = () => { if (authoredInvalid === null) root.removeAttribute('aria-invalid'); else root.setAttribute('aria-invalid', authoredInvalid); };
  if (!multiple) { radios.forEach(radio => scope.listen(radio, 'invalid', () => root.setAttribute('aria-invalid', 'true'))); scope.listen(root, 'change', () => { if (values.length) clearInvalid(); }); }
  const reset = observeFormReset(radios[0] ?? root, () => {
    if (scope.destroyed) return;
    if (!multiple) clearInvalid();
    const previous = values; values = [...initial]; render();
    if (!sameValue(previous, values)) { const result = getValue(); emit(root, { value: result }); options.onValueChange?.(result); }
  });
  scope.add(() => reset.destroy());
  const ReadonlyObserver=root.ownerDocument.defaultView?.MutationObserver; if(ReadonlyObserver){const observer=new ReadonlyObserver(render);observer.observe(root,{attributes:true,attributeFilter:['data-hw-readonly','aria-readonly']});scope.add(()=>observer.disconnect());}
  watchDisabled(scope, root, render); render(); return { get value() { return getValue(); }, select, destroy: () => scope.destroy() };
}

export type { ConsentChoice, FeedbackValue } from '@hawiyah/core';
export interface FeedbackOptions {
  /** Initial answer: `helpful` is true for yes, false for no, null before a choice. */
  value?: FeedbackValue;
  onValueChange?: (value: FeedbackValue) => void;
  /** The reader sent the answer: on submit, or on the choice when no [data-hw-feedback-submit] is authored. */
  onFeedback?: (value: FeedbackValue) => void;
  /** Status text after the answer was sent (data-hw-success-message). Required. */
  successMessage?: string;
}
export interface FeedbackController { readonly value: FeedbackValue; select(helpful: boolean): void; setComment(comment: string): void; submit(): void; destroy(): void }
export function createFeedback(root: HTMLElement, options: FeedbackOptions = {}): FeedbackController {
  const scope = createCleanup(); const buttons = ownItems<HTMLButtonElement>(root, 'button[data-hw-value]');
  const yes = buttons.find(button => button.dataset.hwValue === 'yes'); const no = buttons.find(button => button.dataset.hwValue === 'no');
  const choices = [yes, no].filter((button): button is HTMLButtonElement => !!button);
  const input = root.querySelector<HTMLInputElement>('[data-hw-feedback-value]'); const status = root.querySelector<HTMLElement>('[data-hw-feedback-status]');
  const region = root.querySelector<HTMLElement>('[data-hw-feedback-comment]'); const textarea = region?.querySelector<HTMLTextAreaElement>('textarea') ?? null;
  const send = region?.querySelector<HTMLButtonElement>('[data-hw-feedback-submit]') ?? null;
  const controls = [...choices, ...(textarea ? [textarea] : []), ...(send ? [send] : [])];
  const authoredDisabled = new Map(controls.map(control => [control, control.disabled]));
  controls.forEach(control => remember(scope, control, ['disabled'])); choices.forEach(button => { remember(scope, button, ['aria-pressed']); buttonType(scope, button); }); if (send) buttonType(scope, send);
  const originalInput = input?.value; const originalDisabled = input?.disabled ?? false; const originalStatus = status?.textContent; const originalComment = textarea?.value;
  if (input) { remember(scope, input, ['value', 'disabled']); scope.add(() => { input.value = originalInput ?? ''; }); }
  if (status) scope.add(() => { status.textContent = originalStatus ?? ''; });
  if (region) remember(scope, region, ['hidden']);
  if (textarea) scope.add(() => { textarea.value = originalComment ?? ''; });
  const authoredChoice = input?.value || choices.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.hwValue || '';
  let value: FeedbackValue = options.value ? { ...options.value } : { helpful: authoredChoice === 'yes' ? true : authoredChoice === 'no' ? false : null, comment: textarea?.value ?? '' };
  const initial = { ...value }; let sent = false;
  const success = () => text(root, 'successMessage', options.successMessage);
  requireText('Feedback', 'successMessage', success());
  const render = () => {
    const off = blocked(root);
    if (yes) yes.setAttribute('aria-pressed', String(value.helpful === true)); if (no) no.setAttribute('aria-pressed', String(value.helpful === false));
    controls.forEach(control => { control.disabled = authoredDisabled.get(control)! || off; });
    if (region) region.hidden = value.helpful === null;
    if (textarea && textarea.value !== value.comment) textarea.value = value.comment;
    if (input) { input.value = value.helpful === null ? '' : value.helpful ? 'yes' : 'no'; input.disabled = originalDisabled || off; }
    if (status) { const message = sent && requireText('Feedback', 'successMessage', success()) ? success()! : ''; if (status.textContent !== message) status.textContent = message; }
  };
  const notify = () => { emit(root, { value: { ...value } }); options.onValueChange?.({ ...value }); };
  const submit = () => {
    if (scope.destroyed || blocked(root) || value.helpful === null || (send && isDisabled(send))) return;
    sent = true; render(); emit(root, { feedback: { ...value } }); options.onFeedback?.({ ...value });
  };
  const select = (helpful: boolean) => {
    const button = helpful ? yes : no;
    if (scope.destroyed || !button || blocked(root) || isDisabled(button) || readOnly(root) || value.helpful === helpful) return;
    value = { ...value, helpful }; sent = false; render(); if (input) nativeChange(input); notify();
    if (!send) submit();
  };
  const setComment = (comment: string) => {
    if (scope.destroyed || blocked(root) || value.comment === comment) return;
    value = { ...value, comment }; sent = false; render(); notify();
  };
  scope.listen(root, 'click', event => {
    const target = eventElement(event); const button = target?.closest<HTMLButtonElement>('button[data-hw-value]');
    if (button && choices.includes(button)) { event.preventDefault(); select(button === yes); }
    else if (send && target?.closest('[data-hw-feedback-submit]') === send) { event.preventDefault(); submit(); }
  });
  if (textarea) scope.listen(textarea, 'input', () => setComment(textarea.value));
  if (input) {
    const reset = observeFormReset(input, () => {
      if (scope.destroyed) return;
      const changed = value.helpful !== initial.helpful || value.comment !== initial.comment;
      value = { ...initial }; sent = false; render(); if (changed) notify();
    });
    scope.add(() => reset.destroy());
  }
  watchDisabled(scope, root, render); render();
  return { get value() { return { ...value }; }, select, setComment, submit, destroy: () => scope.destroy() };
}

export interface CookieConsentOptions {
  /** Initial visibility; true when omitted, false when storageKey holds a stored choice. */
  open?: boolean; onOpenChange?: (open: boolean) => void;
  onConsent?: (choice: ConsentChoice) => void; storageKey?: string;
}
export interface CookieConsentController { readonly open: boolean; setOpen(open: boolean): void; choose(choice: ConsentChoice): void; destroy(): void }
export function createCookieConsent(root: HTMLElement, options: CookieConsentOptions = {}): CookieConsentController {
  const scope = createCleanup(); remember(scope, root, ['hidden']);
  const buttons = ownItems<HTMLElement>(root, '[data-hw-consent]'); buttons.forEach(button => buttonType(scope, button));
  let open = options.open ?? true;
  // Persistence is opt-in. Storage can be denied by browser privacy settings.
  if (options.storageKey) { try { const stored = root.ownerDocument.defaultView?.localStorage.getItem(options.storageKey); if (stored === 'accepted' || stored === 'rejected') open = false; } catch { /* Keep the consent UI usable without storage. */ } }
  const setOpen = (next: boolean) => {
    if (scope.destroyed || open === next) return;
    open = next; root.hidden = !open; emit(root, { open }); options.onOpenChange?.(open);
  };
  const choose = (choice: ConsentChoice) => {
    if (scope.destroyed || blocked(root) || (choice !== 'accepted' && choice !== 'rejected')) return;
    if (options.storageKey) { try { root.ownerDocument.defaultView?.localStorage.setItem(options.storageKey, choice); } catch { /* The caller still receives the choice. */ } }
    emit(root, { consent: choice }); options.onConsent?.(choice); setOpen(false);
  };
  scope.listen(root, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-hw-consent]'); if (!button || !buttons.includes(button) || isDisabled(button)) return; const choice = button.dataset.hwConsent; if (choice === 'accepted' || choice === 'rejected') { event.preventDefault(); choose(choice); } });
  root.hidden = !open;
  return { get open() { return open; }, setOpen, choose, destroy: () => scope.destroy() };
}

export interface TreeViewNode { id: string; label: string }
export interface TreeViewOptions {
  value?: string; expanded?: readonly string[]; onValueChange?: (value: string) => void; onExpandedChange?: (expanded: string[]) => void;
  /** Accessible name of a collapsed branch's toggle (data-hw-expand-label="… {label}"). Required when a toggle has no authored aria-label. */
  getExpandLabel?: (node: TreeViewNode) => string;
  /** Accessible name of an expanded branch's toggle (data-hw-collapse-label="… {label}"). Required when a toggle has no authored aria-label. */
  getCollapseLabel?: (node: TreeViewNode) => string;
}
export interface TreeViewController extends ValueController<string> { readonly expanded: string[]; select(value: string): void; toggle(value: string): void; focus(value: string): void }
export function createTreeView(root: HTMLElement, options: TreeViewOptions = {}): TreeViewController {
  const scope = createCleanup();
  const items = [...root.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(item => !item.parentElement?.closest('[data-hw="tree-view"]') || item.parentElement.closest('[data-hw="tree-view"]') === root);
  const values = items.map(item => item.dataset.hwValue ?? '');
  if (values.some(value => !value) || new Set(values).size !== values.length) throw new Error('Hawiyah: tree items require unique non-empty data-hw-value attributes.');
  remember(scope, root, ['role']); root.setAttribute('role', 'tree');
  const groups = new Map<HTMLElement, HTMLElement>();
  const toggles = new Map<HTMLElement, { toggle: HTMLElement; icon: HTMLElement | undefined; authored: string | null }>();
  const labelOf = (item: HTMLElement) => item.querySelector(':scope > [data-hw-tree-label]')?.textContent ?? [...item.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join('');
  const expandLabel = templated(root, 'getExpandLabel', options.getExpandLabel, (node: TreeViewNode) => ({ label: node.label, id: node.id }));
  const collapseLabel = templated(root, 'getCollapseLabel', options.getCollapseLabel, (node: TreeViewNode) => ({ label: node.label, id: node.id }));
  const parent = (item: HTMLElement): HTMLElement | undefined => { const result = item.parentElement?.closest<HTMLElement>('[role="treeitem"]'); return result && root.contains(result) ? result : undefined; };
  items.forEach(item => {
    remember(scope, item, ['tabindex', 'aria-selected', 'aria-expanded', 'aria-level', 'aria-posinset', 'aria-setsize']);
    const group = [...item.children].find(child => child.getAttribute('role') === 'group') as HTMLElement | undefined;
    if (group) { groups.set(item, group); remember(scope, group, ['hidden']); }
    const toggle = [...item.children].find(child => child.hasAttribute('data-hw-tree-toggle')) as HTMLElement | undefined;
    if (toggle) {
      remember(scope, toggle, ['tabindex', 'aria-label']); toggle.tabIndex = -1; buttonType(scope, toggle);
      const icon = [...toggle.children].find(child => child.classList.contains('hw-icon') && ['add-01', 'minus-sign'].includes(child.getAttribute('data-icon') ?? '')) as HTMLElement | undefined;
      if (icon) remember(scope, icon, ['data-icon']);
      toggles.set(item, { toggle, icon, authored: toggle.getAttribute('aria-label') });
    }
    // The item is named by its label alone, so the toggle's name is not part of it.
    const label = [...item.children].find(child => child.hasAttribute('data-hw-tree-label')) as HTMLElement | undefined;
    if (label && !named(item)) { remember(scope, item, ['aria-labelledby']); item.setAttribute('aria-labelledby', ensureId(scope, label, 'tree-label')); }
    let level = 1; let ancestor = parent(item); while (ancestor) { level++; ancestor = parent(ancestor); }
    const siblings = items.filter(candidate => candidate.parentElement === item.parentElement);
    item.setAttribute('aria-level', String(level)); item.setAttribute('aria-posinset', String(siblings.indexOf(item) + 1)); item.setAttribute('aria-setsize', String(siblings.length));
  });
  let expanded = new Set(options.expanded ?? items.filter(item => groups.has(item) && item.getAttribute('aria-expanded') === 'true').map(item => item.dataset.hwValue!));
  let value = options.value ?? root.dataset.hwValue ?? items.find(item => item.getAttribute('aria-selected') === 'true')?.dataset.hwValue ?? '';
  if (!values.includes(value)) value = '';
  let focused = value;
  const visible = () => items.filter(item => { if (item.hidden) return false; let ancestor = parent(item); while (ancestor) { if (ancestor.hidden || !expanded.has(ancestor.dataset.hwValue!)) return false; ancestor = parent(ancestor); } return true; });
  const render = () => {
    groups.forEach((group, item) => { const open = expanded.has(item.dataset.hwValue!); group.hidden = !open; item.setAttribute('aria-expanded', String(open)); });
    toggles.forEach(({ toggle, icon, authored }, item) => {
      const open = expanded.has(item.dataset.hwValue!); const node = { id: item.dataset.hwValue!, label: labelOf(item).trim() };
      const name = open ? collapseLabel(node) : expandLabel(node);
      if (hasText(name)) toggle.setAttribute('aria-label', name!);
      else if (hasText(authored)) toggle.setAttribute('aria-label', authored!);
      else { toggle.removeAttribute('aria-label'); requireText('TreeView', open ? 'getCollapseLabel' : 'getExpandLabel', undefined); }
      icon?.setAttribute('data-icon', open ? 'minus-sign' : 'add-01');
    });
    const available = visible().filter(item => !isDisabled(item));
    if (!available.some(item => item.dataset.hwValue === focused)) focused = available.find(item => item.dataset.hwValue === value)?.dataset.hwValue ?? available[0]?.dataset.hwValue ?? '';
    items.forEach(item => { item.setAttribute('aria-selected', String(item.dataset.hwValue === value)); item.tabIndex = !blocked(root) && !isDisabled(item) && item.dataset.hwValue === focused ? 0 : -1; });
  };
  const focus = (next: string) => { if (scope.destroyed || blocked(root)) return; const item = visible().find(item => item.dataset.hwValue === next && !isDisabled(item)); if (!item) return; focused = next; render(); item.focus(); };
  const select = (next: string) => { const item = visible().find(item => item.dataset.hwValue === next); if (scope.destroyed || !item || blocked(root) || readOnly(root) || isDisabled(item) || next === value) return; value = next; focused = next; render(); emit(root, { value }); options.onValueChange?.(value); };
  const toggle = (next: string) => { const item = items.find(item => item.dataset.hwValue === next); if (scope.destroyed || !item || !groups.has(item) || blocked(root) || isDisabled(item)) return; const group = groups.get(item)!; const closing = expanded.has(next); const restoreFocus = closing && group.contains(root.ownerDocument.activeElement); if (closing) expanded.delete(next); else expanded.add(next); const focusedItem = items.find(item => item.dataset.hwValue === focused); if (closing && focusedItem && group.contains(focusedItem)) focused = next; render(); if (restoreFocus) item.focus(); emit(root, { value, expanded: [...expanded] }); options.onExpandedChange?.([...expanded]); };
  const typeahead = createTypeahead(); scope.add(() => typeahead.reset());
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
    else if (isTypeaheadKey(key)) { const next = typeahead.next(key.key, current.map(labelOf), index, position => isDisabled(current[position]!)); if (next >= 0) { key.preventDefault(); focus(current[next]!.dataset.hwValue!); } }
  });
  watchDisabled(scope, root, render); render(); return { get value() { return value; }, get expanded() { return [...expanded]; }, select, toggle, focus, destroy: () => scope.destroy() };
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
  // At a bound the arrow stays focusable: aria-disabled only; the native attribute is for unavailability the reader did not cause.
  const disable=(button:HTMLElement|null,unavailable:boolean,bound=false)=>{if(!button)return;if(button.tagName==='BUTTON')(button as HTMLButtonElement).disabled=unavailable;button.setAttribute('aria-disabled',String(unavailable||bound));};
  const render=()=>{
    slides.forEach((slide,position)=>{const inactive=position!==index;slide.hidden=inactive;slide.toggleAttribute('inert',inactive);slide.setAttribute('aria-hidden',String(inactive));if(!authored.has(slide))writeText(slide,'aria-label','Carousel','getSlideLabel',label(position));});
    if(track)root.style.setProperty('--hw-carousel-index',String(index));
    disable(previous,previousDisabled||blocked(root)||slides.length<2,!loop&&index===0);
    disable(next,nextDisabled||blocked(root)||slides.length<2,!loop&&index===slides.length-1);
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
export interface DataTableOptions { locale?: string; onSortKeyChange?: (key: string) => void; onSortDirectionChange?: (direction: SortDirection) => void }
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
    const previousKey = sortKey; const previousDirection = sortDirection;
    sortDirection = direction ?? (sortKey === key && sortDirection === 'ascending' ? 'descending' : 'ascending'); sortKey = key;
    headers.forEach(header => { if (buttons.some(button => button.dataset.hwSort === header.dataset.hwKey)) header.setAttribute('aria-sort', header.dataset.hwKey === key ? sortDirection! : 'none'); });
    const collation = locale(); if (collation !== undefined) bodies.forEach(({body, rows}) => {
      const currentRows = [...body.rows]; const ordered = [...rows.filter(row => currentRows.includes(row)), ...currentRows.filter(row => !rows.includes(row))];
      const records = ordered.map(row => { const cell = row.cells[header.cellIndex]; const raw = cell?.dataset.hwSortValue ?? cell?.textContent?.trim() ?? ''; const numeric = Number(normalizeDigits(raw).replace(/[,٬\s]/gu, '').replace(/٫/gu, '.')); return { row, value: header.dataset.hwType === 'number' ? raw && Number.isFinite(numeric) ? numeric : null : raw }; });
      sortRows(records, 'value', sortDirection!, collation).forEach(record => body.append(record.row));
    });
    emit(root, { sortKey, sortDirection });
    if (previousKey !== key) options.onSortKeyChange?.(key);
    if (previousDirection !== sortDirection) options.onSortDirectionChange?.(sortDirection!);
  };
  scope.listen(table, 'click', event => { const button = eventElement(event)?.closest<HTMLElement>('[data-hw-sort]'); if (button && buttons.includes(button)) { event.preventDefault(); sort(button.dataset.hwSort!); } });
  return { get sortKey() { return sortKey; }, get sortDirection() { return sortDirection; }, sort, destroy: () => scope.destroy() };
}
