import type { CleanupScope } from '@hawiyah/core';

let nextId = 0;

export function remember(scope: CleanupScope, element: Element, names: string[]): void {
  const attributes = names.map(name => [name, element.getAttribute(name)] as const);
  scope.add(() => {
    for (const [name, value] of attributes) {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
  });
}

export function ensureId(scope: CleanupScope, element: HTMLElement, prefix: string): string {
  if (element.id) return element.id;
  remember(scope, element, ['id']);
  let id: string;
  do { id = `hw-${prefix}-${++nextId}`; } while (element.ownerDocument.getElementById(id));
  element.id = id;
  return id;
}

export function required<T extends HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Hawiyah: required element ${selector} was not found.`);
  return element;
}

export function emit(element: HTMLElement, detail: Record<string, unknown>): void {
  const CustomEventConstructor = element.ownerDocument.defaultView?.CustomEvent;
  if (CustomEventConstructor) element.dispatchEvent(new CustomEventConstructor('hw:change', { bubbles: true, detail }));
}

export function eventElement(event: Event): Element | null {
  const target = event.target as Node | null;
  return target?.nodeType === 1 ? target as Element : target?.parentElement ?? null;
}

export function nativeChange(input: HTMLInputElement): void {
  const EventConstructor = input.ownerDocument.defaultView?.Event;
  if (EventConstructor) input.dispatchEvent(new EventConstructor('change', { bubbles: true }));
}

export function localeOf(root: HTMLElement): string {
  return root.dataset.hwLocale || root.closest('[lang]')?.getAttribute('lang') || 'ar-SA';
}
export function translated(root: HTMLElement, english: string, arabic: string): string {
  return localeOf(root).toLowerCase().startsWith('ar') ? arabic : english;
}
export function readOnly(root: HTMLElement, input?: HTMLInputElement): boolean {
  return root.dataset.hwReadonly === 'true' || root.getAttribute('aria-readonly') === 'true' || !!input?.readOnly;
}
