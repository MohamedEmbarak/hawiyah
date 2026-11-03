import { createCleanup, getPaginationItems, isDisabled } from '@nasaq/core';
import { emit, eventElement, remember, translated } from './dom.js';

export interface PaginationOptions {
  page?: number;
  totalPages?: number;
  siblingCount?: number;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  getPageLabel?: (page: number) => string;
  formatPage?: (page: number) => string;
  getGapLabel?: (start: number, end: number) => string;
  jumpLabel?: string;
  goLabel?: string;
  onPageChange?: (page: number) => void;
}
export interface PaginationController { readonly page: number; select(page: number): void; destroy(): void }

/** Authored links remain links; an optional items container enables generated page windows. */
export function createPagination(root: HTMLElement, options: PaginationOptions = {}): PaginationController {
  const owns = (node: Element) => {
    const owner = node.closest('[data-nq="pagination"]');
    return !owner || owner === root;
  };
  const authored = [...root.querySelectorAll<HTMLElement>('[data-nq-page]')].filter(owns);
  const container = [...root.querySelectorAll<HTMLElement>('[data-nq-pagination-items]')].find(owns);
  const numeric = authored.map(node => Number(node.dataset.nqPage)).filter(Number.isFinite);
  const total = options.totalPages ?? Number(root.dataset.nqTotal ?? Math.max(1, ...numeric));
  if (!Number.isSafeInteger(total) || total < 1) throw new Error('Nasaq: pagination totalPages must be a positive safe integer.');
  let page = options.page ?? Number(root.dataset.nqCurrent ?? authored.find(node => node.getAttribute('aria-current') === 'page')?.dataset.nqPage ?? 1);
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
  const pageLabel = options.getPageLabel ?? ((value: number) => translated(root, `Page ${value}`, `الصفحة ${value}`));
  const gapLabel = options.getGapLabel ?? ((start: number, end: number) => translated(root, `Pages ${start} to ${end}`, `الصفحات ${start} إلى ${end}`));
  const close = (except?: HTMLDetailsElement) => {
    for (const details of root.querySelectorAll<HTMLDetailsElement>('details.nq-pagination-gap[open]')) {
      if (owns(details) && details !== except) details.open = false;
    }
  };
  const pageButton = (value: number) => {
    const button = root.ownerDocument.createElement('button');
    button.type = 'button'; button.className = 'nq-button nq-pagination-item';
    button.dataset.variant = 'ghost'; button.dataset.nqPage = String(value);
    button.textContent = options.formatPage?.(value) ?? String(value);
    button.setAttribute('aria-label', pageLabel(value));
    return button;
  };
  const render = () => {
    if (container) {
      const fragment = root.ownerDocument.createDocumentFragment();
      for (const item of getPaginationItems(page, total, options.siblingCount ?? Number(root.dataset.nqSiblings ?? 1))) {
        if (typeof item === 'number') { fragment.append(pageButton(item)); continue; }
        if (blocked()) {
          const ellipsis = root.ownerDocument.createElement('span');
          ellipsis.className = 'nq-pagination-ellipsis'; ellipsis.setAttribute('aria-hidden', 'true'); ellipsis.textContent = '…';
          fragment.append(ellipsis); continue;
        }
        const details = root.ownerDocument.createElement('details'); details.className = 'nq-pagination-gap';
        const summary = root.ownerDocument.createElement('summary'); summary.className = 'nq-pagination-gap-trigger';
        summary.setAttribute('aria-label', gapLabel(item.start, item.end)); summary.textContent = '…';
        const menu = root.ownerDocument.createElement('div'); menu.className = 'nq-pagination-menu';
        if (item.end - item.start + 1 <= 100) {
          for (let value = item.start; value <= item.end; value++) menu.append(pageButton(value));
        } else {
          const jump = root.ownerDocument.createElement('div'); jump.className = 'nq-pagination-jump';
          const label = root.ownerDocument.createElement('label'); label.className = 'nq-label';
          label.textContent = options.jumpLabel ?? translated(root, 'Go to page', 'الانتقال إلى صفحة');
          const input = root.ownerDocument.createElement('input');
          input.className = 'nq-input'; input.type = 'number'; input.inputMode = 'numeric';
          // Page jumping is navigation, not a field in a surrounding application form.
          input.setAttribute('form', '');
          input.min = String(item.start); input.max = String(item.end); input.step = '1'; input.required = true;
          input.value = String(item.start); input.dataset.nqJumpInput = ''; input.dataset.nqFilled = 'true'; label.append(input);
          const submit = root.ownerDocument.createElement('button');
          submit.type = 'button'; submit.className = 'nq-button'; submit.dataset.nqJumpSubmit = '';
          submit.textContent = options.goLabel ?? translated(root, 'Go', 'انتقال');
          jump.append(label, submit); menu.append(jump);
        }
        details.append(summary, menu); fragment.append(details);
      }
      container.replaceChildren(fragment);
    }
    for (const node of [...root.querySelectorAll<HTMLElement>('[data-nq-page]')].filter(owns)) {
      const target = node.dataset.nqPage;
      if (Number(target) === page) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current');
      const disabled = blocked() || !!initiallyDisabled.get(node) || (target === 'previous' ? page === 1 : target === 'next' ? page === total : false);
      node.setAttribute('aria-disabled', String(disabled));
      if (node.localName === 'button') node.toggleAttribute('disabled', disabled);
    }
    if (options.hideOnSinglePage ?? root.dataset.nqHideSingle === 'true') root.hidden = total === 1;
  };
  const select = (nextPage: number) => {
    if (scope.destroyed || blocked() || !Number.isInteger(nextPage) || nextPage < 1 || nextPage > total || nextPage === page) return;
    const focus = !!container?.contains(root.ownerDocument.activeElement);
    page = nextPage; close(); render();
    if (focus) container?.querySelector<HTMLElement>(`[data-nq-page="${page}"]`)?.focus();
    emit(root, {page}); options.onPageChange?.(page);
  };
  const jump = (target: Element) => {
    const input = target.closest('.nq-pagination-jump')?.querySelector<HTMLInputElement>('[data-nq-jump-input]');
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
    const submit = target.closest('[data-nq-jump-submit]');
    if (submit) { event.preventDefault(); if (!blocked()) jump(submit); return; }
    const node = target.closest<HTMLElement>('[data-nq-page]'); if (!node || !owns(node)) return;
    if (blocked() || isDisabled(node)) { event.preventDefault(); return; }
    // Real navigation links retain native URL and modifier-key behavior.
    if (node.localName === 'a' && node.hasAttribute('href')) return;
    event.preventDefault();
    const targetPage = node.dataset.nqPage;
    select(targetPage === 'previous' ? page - 1 : targetPage === 'next' ? page + 1 : Number(targetPage));
  });
  scope.listen(root, 'keydown', event => {
    const key = event as KeyboardEvent, target = eventElement(event); if (!target || !owns(target)) return;
    const details = target.closest<HTMLDetailsElement>('details.nq-pagination-gap');
    if (key.key === 'Escape' && details?.open) {
      event.preventDefault(); details.open = false; details.querySelector<HTMLElement>('summary')?.focus();
    } else if (key.key === 'Enter' && target.matches('[data-nq-jump-input]')) {
      event.preventDefault(); if (!blocked()) jump(target);
    }
  });
  scope.listen(root, 'input', event => {
    const target = eventElement(event);
    if (target?.matches('[data-nq-jump-input]') && owns(target)) {
      const input = target as HTMLInputElement;
      input.setAttribute('data-nq-filled', String(!!input.value.trim()));
      if (input.hasAttribute('aria-invalid')) {
        if (input.validity.valid) input.removeAttribute('aria-invalid');
        else input.setAttribute('aria-invalid', 'true');
      }
    }
  });
  scope.listen(root, 'toggle', event => {
    const details = event.target as HTMLDetailsElement;
    if (details.matches('details.nq-pagination-gap') && owns(details) && details.open) {
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
