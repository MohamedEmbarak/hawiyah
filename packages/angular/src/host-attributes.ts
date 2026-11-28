import { ElementRef, HostAttributeToken, inject, Renderer2 } from '@angular/core';

/** Host bindings of a wrapper component whose inner element takes aria-label, aria-labelledby,
 * aria-describedby and aria-invalid as inputs of those names: the attribute an application writes
 * on the host reaches the input and never stays on the role-less wrapper. */
export const forwardedAriaHost = {'[attr.aria-label]': 'null', '[attr.aria-labelledby]': 'null', '[attr.aria-describedby]': 'null', '[attr.aria-invalid]': 'null'} as const;

/** One attribute that a host-root component writes on its host only while it has a value for it.
 * It is not a host binding: a host binding owns its attribute and would remove what the application
 * writes or binds there. The application's value is put back when the component has none. */
export class HwHostAttribute {
  private written: string | undefined;
  private authored: string | null;
  constructor(private readonly host: Element, private readonly renderer: Renderer2, private readonly name: string, authoredStatic: string | null) { this.authored = authoredStatic; }
  /** Call from ngDoCheck: it runs after the bindings of the application on this element, in every pass. */
  set(value: string | null): void {
    const written = this.written;
    if (value === null && written === undefined) return;
    const current = this.host.getAttribute(this.name);
    // A value that is neither what was written nor what is wanted came from the application since the last pass.
    if (current !== written && current !== value) this.authored = current;
    if (value !== null) { if (current !== value) this.renderer.setAttribute(this.host, this.name, value); this.written = value; return; }
    if (current === written) { if (this.authored === null) this.renderer.removeAttribute(this.host, this.name); else this.renderer.setAttribute(this.host, this.name, this.authored); }
    this.written = undefined;
  }
}

/** Call in an injection context. The static value is read through HostAttributeToken, not from the hydrated DOM. */
export function injectHostAttribute(name: string): HwHostAttribute {
  return new HwHostAttribute(inject(ElementRef).nativeElement as Element, inject(Renderer2), name, inject(new HostAttributeToken(name), {optional: true}));
}

/** True when the application named the host itself with a non-empty aria-label or aria-labelledby. */
export function hostHasName(host: Element): boolean {
  return Boolean(host.getAttribute('aria-label')?.trim() || host.getAttribute('aria-labelledby')?.trim());
}
