import { bindFragmentLink, requireText, type FragmentLink } from '@hawiyah/core';

export interface SkipLinkController {
  /** Moves to the target as a plain activation would. False when the target does not exist. */
  activate(): boolean;
  destroy(): void;
}

// One binding per link: a skip link inside [data-hw="portal-header"] that also carries data-hw="skip-link"
// is bound once, and the binding is released when the last controller that holds it is destroyed.
const bindings = new WeakMap<HTMLAnchorElement, { binding: FragmentLink; references: number }>();

/** Binds an authored skip link (`a.hw-skip-link href="#main"`) as a packaged fragment link. The markup keeps
 * `#id`; on interaction the href resolves to the current document under any `<base href>`, and a plain
 * activation scrolls to the target without animation and moves focus to it. The link text is the application's. */
export function createSkipLink(link: HTMLAnchorElement): SkipLinkController {
  if (link.localName !== 'a') throw new Error('Hawiyah: createSkipLink requires an <a> element.');
  if (link.ownerDocument.defaultView) requireText('SkipLink', 'skipLabel', link.textContent?.trim() || link.getAttribute('aria-label'));
  let entry = bindings.get(link);
  if (entry) entry.references++;
  else { entry = { binding: bindFragmentLink(link), references: 1 }; bindings.set(link, entry); }
  const held = entry;
  let destroyed = false;
  return {
    activate: () => !destroyed && held.binding.activate(),
    destroy() { if (destroyed) return; destroyed = true; if (--held.references === 0) { bindings.delete(link); held.binding.destroy(); } },
  };
}
