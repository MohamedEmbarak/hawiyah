import { bindFragmentLink, requireText } from '@hawiyah/core';

export interface SkipLinkController {
  /** Moves to the target as a plain activation would. False when the target does not exist. */
  activate(): boolean;
  destroy(): void;
}

/** Binds an authored skip link (`a.hw-skip-link href="#main"`) as a packaged fragment link. The markup keeps
 * `#id`; on interaction the href resolves to the current document under any `<base href>`, and a plain
 * activation scrolls to the target without animation and moves focus to it. The link text is the application's. */
export function createSkipLink(link: HTMLAnchorElement): SkipLinkController {
  if (link.localName !== 'a') throw new Error('Hawiyah: createSkipLink requires an <a> element.');
  if (link.ownerDocument.defaultView) requireText('SkipLink', 'skipLabel', link.textContent?.trim() || link.getAttribute('aria-label'));
  const binding = bindFragmentLink(link);
  return { activate: binding.activate, destroy: binding.destroy };
}
