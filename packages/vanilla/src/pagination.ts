import { createCleanup, getPaginationItems, isDisabled, requireText } from '@hawiyah/core';
import { emit, eventElement, nameRoot, remember, templated, text, writeContent, writeText } from './dom.js';

export interface PaginationOptions {
  page?: number;
  totalPages?: number;
  siblingCount?: number;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  /** Accessible name of the root, unless the authored nav is named (data-hw-label). */
  label?: string;
  /** Accessible name of a generated page button (data-hw-page-label="… {page}"). Required with an items container. */
  getPageLabel?: (page: number) => string;
  formatPage?: (page: number) => string;
  /** Accessible name of a gap disclosure (data-hw-gap-label="… {start} … {end}"). Required with an items container. */
  getGapLabel?: (start: number, end: number) => string;
  /** Label of the page-number input inside a large gap (data-hw-jump-label). Required with an items container. */
  jumpLabel?: string;
  /** Text of the jump button (data-hw-go-label). Required with an items container. */
  goLabel?: string;
  onPageChange?: (page: number) => void;
}
export interface PaginationController { readonly page: number; select(page: number): void; destroy(): void }

/** Authored links remain links; an optional items container enables generated page windows. */
export function createPagination(root: HTMLElement, options: PaginationOptions = {}): PaginationController {
  const owns = (node: Element) => {
    const owner = node.closest('[data-hw="pagination"]');
    return !owner || owner === root;
  };
  const authored = [...root.querySelectorAll<HTMLElement>('[data-hw-page]')].filter(owns);
  const container = [...root.querySelectorAll<HTMLElement>('[data-hw-pagination-items]')].find(owns);
  const numeric = authored.map(node => Number(node.dataset.hwPage)).filter(Number.isFinite);
  const total = options.totalPages ?? Number(root.dataset.hwTotal ?? Math.max(1, ...numeric));
  if (!Number.isSafeInteger(total) || total < 1) throw new Error('Hawiyah: pagination totalPages must be a positive safe integer.');
  let page = options.page ?? Number(root.dataset.hwCurrent ?? authored.find(node => node.getAttribute('aria-current') === 'page')?.dataset.hwPage ?? 1);
  if (!Number.isInteger(page) || page < 1 || page > total) page = 1;
  const scope = createCleanup();
  const initiallyDisabled = new Map(authored.map(node => [node, isDisabled(node)]));
  authored.forEach(node => remember(scope, node, ['aria-current', 'aria-disabled', 'disabled']));
  remember(scope, root, ['hidden']);
  if (container) {
    const children = [...container.childNodes];
    scope.add(() => container.replaceChildren(...children));
  }
  const blocked = () => !!options.disabled || isDisabled(root) || !!root.closest('fieldset[disabled]');
  const pageLabel = templated(root, 'getPageLabel', options.getPageLabel, (page: number) => ({ page }));
  const gapLabel = templated(root, 'getGapLabel', options.getGapLabel, (start: number, end: number) => ({ start, end }));
  remember(scope, root, ['aria-label']); nameRoot(root, 'Pagination', text(root, 'label', options.label));
  if (container) {
    requireText('Pagination', 'getPageLabel', options.getPageLabel ?? root.getAttribute('data-hw-page-label'));
    requireText('Pagination', 'getGapLabel', options.getGapLabel ?? root.getAttribute('data-hw-gap-label'));
    requireText('Pagination', 'jumpLabel', text(root, 'jumpLabel', options.jumpLabel)); requireText('Pagination', 'goLabel', text(root, 'goLabel', options.goLabel));
  }
  const close = (except?: HTMLDetailsElement) => {
    for (const details of root.querySelectorAll<HTMLDetailsElement>('details.hw-pagination-gap[open]')) {
      if (owns(details) && details !== except) details.open = false;
    }
  };
  const pageButton = (value: number) => {
    const button = root.ownerDocument.createElement('button');
    button.type = 'button'; button.className = 'hw-button hw-pagination-item';
    button.dataset.variant = 'ghost'; button.dataset.hwPage = String(value);
    button.textContent = options.formatPage?.(value) ?? String(value);
    writeText(button, 'aria-label', 'Pagination', 'getPageLabel', pageLabel(value));
    return button;
  };
  const render = () => {
    if (container) {
      const fragment = root.ownerDocument.createDocumentFragment();
      for (const item of getPaginationItems(page, total, options.siblingCount ?? Number(root.dataset.hwSiblings ?? 1))) {
        if (typeof item === 'number') { fragment.append(pageButton(item)); continue; }
        if (blocked()) {
          const ellipsis = root.ownerDocument.createElement('span');
          ellipsis.className = 'hw-pagination-ellipsis'; ellipsis.setAttribute('aria-hidden', 'true'); ellipsis.textContent = '…';
          fragment.append(ellipsis); continue;
        }
        const details = root.ownerDocument.createElement('details'); details.className = 'hw-pagination-gap';
        const summary = root.ownerDocument.createElement('summary'); summary.className = 'hw-pagination-gap-trigger';
        writeText(summary, 'aria-label', 'Pagination', 'getGapLabel', gapLabel(item.start, item.end)); summary.textContent = '…';
        const menu = root.ownerDocument.createElement('div'); menu.className = 'hw-pagination-menu';
        if (item.end - item.start + 1 <= 100) {
          for (let value = item.start; value <= item.end; value++) menu.append(pageButton(value));
        } else {
          const jump = root.ownerDocument.createElement('div'); jump.className = 'hw-pagination-jump';
          const label = root.ownerDocument.createElement('label'); label.className = 'hw-label';
          writeContent(label, 'Pagination', 'jumpLabel', text(root, 'jumpLabel', options.jumpLabel));
          const input = root.ownerDocument.createElement('input');
          input.className = 'hw-input'; input.type = 'number'; input.inputMode = 'numeric';
          // Page jumping is navigation, not a field in a surrounding application form.
          input.setAttribute('form', '');
          input.min = String(item.start); input.max = String(item.end); input.step = '1'; input.required = true;
          input.value = String(item.start); input.dataset.hwJumpInput = ''; input.dataset.hwFilled = 'true'; label.append(input);
          const submit = root.ownerDocument.createElement('button');
          submit.type = 'button'; submit.className = 'hw-button'; submit.dataset.hwJumpSubmit = '';
          writeContent(submit, 'Pagination', 'goLabel', text(root, 'goLabel', options.goLabel));
          jump.append(label, submit); menu.append(jump);
        }
        details.append(summary, menu); fragment.append(details);
      }
      container.replaceChildren(fragment);
    }
    for (const node of [...root.querySelectorAll<HTMLElement>('[data-hw-page]')].filter(owns)) {
      const target = node.dataset.hwPage;
      if (Number(target) === page) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current');
      // At the first or last page the arrow keeps focus: aria-disabled only.
      const unavailable = blocked() || !!initiallyDisabled.get(node);
      const bound = target === 'previous' ? page === 1 : target === 'next' ? page === total : false;
      node.setAttribute('aria-disabled', String(unavailable || bound));
      if (node.localName === 'button') node.toggleAttribute('disabled', unavailable);
    }
    if (options.hideOnSinglePage ?? root.dataset.hwHideSingle === 'true') root.hidden = total === 1;
  };
  const select = (nextPage: number) => {
    if (scope.destroyed || blocked() || !Number.isInteger(nextPage) || nextPage < 1 || nextPage > total || nextPage === page) return;
    const focus = !!container?.contains(root.ownerDocument.activeElement);
    page = nextPage; close(); render();
    if (focus) container?.querySelector<HTMLElement>(`[data-hw-page="${page}"]`)?.focus();
    emit(root, {page}); options.onPageChange?.(page);
  };
  const jump = (target: Element) => {
    const input = target.closest('.hw-pagination-jump')?.querySelector<HTMLInputElement>('[data-hw-jump-input]');
    if (!input) return;
    if (!input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true');
      input.reportValidity();
      return;
    }
    input.removeAttribute('aria-invalid');
    select(input.valueAsNumber);
  };
  scope.listen(root, 'click', event => {
    const target = eventElement(event); if (!target || !owns(target)) return;
    if (blocked()) { event.preventDefault(); close(); return; }
    const submit = target.closest('[data-hw-jump-submit]');
    if (submit) { event.preventDefault(); if (!blocked()) jump(submit); return; }
    const node = target.closest<HTMLElement>('[data-hw-page]'); if (!node || !owns(node)) return;
    if (blocked() || isDisabled(node)) { event.preventDefault(); return; }
    // Real navigation links retain native URL and modifier-key behavior.
    if (node.localName === 'a' && node.hasAttribute('href')) return;
    event.preventDefault();
    const targetPage = node.dataset.hwPage;
    select(targetPage === 'previous' ? page - 1 : targetPage === 'next' ? page + 1 : Number(targetPage));
  });
  scope.listen(root, 'keydown', event => {
    const key = event as KeyboardEvent, target = eventElement(event); if (!target || !owns(target)) return;
    const details = target.closest<HTMLDetailsElement>('details.hw-pagination-gap');
    if (key.key === 'Escape' && details?.open) {
      event.preventDefault(); details.open = false; details.querySelector<HTMLElement>('summary')?.focus();
    } else if (key.key === 'Enter' && target.matches('[data-hw-jump-input]')) {
      event.preventDefault(); if (!blocked()) jump(target);
    }
  });
  scope.listen(root, 'input', event => {
    const target = eventElement(event);
    if (target?.matches('[data-hw-jump-input]') && owns(target)) {
      const input = target as HTMLInputElement;
      input.setAttribute('data-hw-filled', String(!!input.value.trim()));
      if (input.hasAttribute('aria-invalid')) {
        if (input.validity.valid) input.removeAttribute('aria-invalid');
        else input.setAttribute('aria-invalid', 'true');
      }
    }
  });
  scope.listen(root, 'toggle', event => {
    const details = event.target as HTMLDetailsElement;
    if (details.matches('details.hw-pagination-gap') && owns(details) && details.open) {
      if (blocked()) details.open = false; else close(details);
    }
  }, {capture: true});
  scope.listen(root.ownerDocument, 'click', event => {
    const target = event.target as Node | null;
    if (target && !root.contains(target)) close();
  });
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  if (Observer) {
    const observer = new Observer(render);
    observer.observe(root, {attributes: true, attributeFilter: ['aria-disabled', 'disabled']});
    for (let ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.localName === 'fieldset') observer.observe(ancestor, {attributes: true, attributeFilter: ['disabled']});
    }
    scope.add(() => observer.disconnect());
  }
  render();
  return { get page() { return page; }, select, destroy: () => scope.destroy() };
}
