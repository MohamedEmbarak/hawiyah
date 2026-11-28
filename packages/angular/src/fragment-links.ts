import { afterEveryRender, DestroyRef, ElementRef, inject } from '@angular/core';
import { bindFragmentLink, type FragmentLink, type FragmentLinkOptions } from '@hawiyah/core';

/** Binds the packaged in-page links of the calling component. Call in an injection context.
 * The template renders the bare "#id", which is all a server can know and what hydration
 * expects; render hooks run only in a browser, where each link is bound once it exists and
 * released when Angular removes it. From the reader's first interaction the href resolves
 * to the current document under any <base href>. */
export function bindAngularFragmentLinks(selector: string, options?: (link: HTMLAnchorElement) => FragmentLinkOptions): void {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  const links = new Map<HTMLAnchorElement, FragmentLink>();
  afterEveryRender(() => {
    for (const [link, binding] of links) if (!host.contains(link)) { binding.destroy(); links.delete(link); }
    for (const link of host.querySelectorAll<HTMLAnchorElement>(selector)) if (!links.has(link)) links.set(link, bindFragmentLink(link, options?.(link)));
  });
  inject(DestroyRef).onDestroy(() => { for (const binding of links.values()) binding.destroy(); links.clear(); });
}
