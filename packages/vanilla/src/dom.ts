import { formatTextTemplate, hasText, requireText, type CleanupScope } from '@hawiyah/core';

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

// Text is supplied by the application. Sources, in order: authored markup (read by each
// controller), `data-hw-<name>` on the controller root, then the controller option, which wins.
const dataName = (name: string) => `data-hw-${name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
/** Application text for the input `name`: the option, else `data-hw-<kebab-name>` on the root. Never a default. */
export function text(root: Element, name: string, value?: string | null): string | undefined {
  return value ?? root.getAttribute(dataName(name)) ?? undefined;
}
/** Templated application text for the function input `name`: the option, else the template attribute named
 * after the input without "get" (`getPageLabel` -> `data-hw-page-label="… {page}"`), filled by core formatTextTemplate. */
export function templated<A extends unknown[]>(root: Element, name: string, value: ((...args: A) => string) | undefined, values: (...args: A) => Readonly<Record<string, string | number>>): (...args: A) => string | undefined {
  const attribute = dataName(name.replace(/^get(.)/u, (_, letter: string) => letter.toLowerCase()));
  return (...args) => {
    if (value) return value(...args);
    const source = root.getAttribute(attribute);
    return source === null ? undefined : formatTextTemplate(source, values(...args));
  };
}
/** Writes required text to an attribute; when it is missing, removes the attribute and warns once in development. */
export function writeText(element: Element, attribute: string, component: string, name: string, value: string | undefined, when?: string): boolean {
  const present = requireText(component, name, value, when);
  if (present) element.setAttribute(attribute, value!); else element.removeAttribute(attribute);
  return present;
}
/** Writes optional text ("when wanted") to an attribute, or removes it. No warning. */
export function writeOptional(element: Element, attribute: string, value: string | undefined): void {
  if (hasText(value)) element.setAttribute(attribute, value!); else element.removeAttribute(attribute);
}
/** Required text content; nothing is rendered when it is missing. */
export function writeContent(element: Node, component: string, name: string, value: string | undefined, when?: string): boolean {
  const present = requireText(component, name, value, when);
  element.textContent = present ? value! : '';
  return present;
}
/** True when the application already named the element in markup. */
export function named(element: Element): boolean {
  return hasText(element.getAttribute('aria-label')) || hasText(element.getAttribute('aria-labelledby'));
}
/** Names a root from `label` unless the markup already names it. The caller remembers aria-label. */
export function nameRoot(element: Element, component: string, value: string | undefined): void {
  if (!named(element)) writeText(element, 'aria-label', component, 'label', value);
}
/** A custom validity message. A missing message still blocks submission with a single space. */
export function validityMessage(component: string, name: string, value: string | undefined, when?: string): string {
  return requireText(component, name, value, when) ? value! : ' ';
}
export function readOnly(root: HTMLElement, input?: HTMLInputElement): boolean {
  return root.dataset.hwReadonly === 'true' || root.getAttribute('aria-readonly') === 'true' || !!input?.readOnly;
}
