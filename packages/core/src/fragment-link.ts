// In-page links are rendered as a bare "#id", which is what a server can know.
// A document with <base href> resolves that against the base instead of the page,
// so the browser-side helpers below keep the link pointing at the current document.

const withoutFragment = (url: string) => { const index = url.indexOf('#'); return index < 0 ? url : url.slice(0, index); };
const origin = (url: string) => /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(url)?.[0] ?? '';
const decode = (value: string) => { try { return decodeURIComponent(value); } catch { return value; } };

/** The target id of a same-document fragment reference ("#id" or "path#id"), decoded. */
export function getFragmentId(href: string | null | undefined): string {
  if (!href) return '';
  const index = href.indexOf('#');
  return index < 0 ? '' : decode(href.slice(index + 1));
}

/** The href that reaches `#id` in the current document.
 * Without document URLs (server rendering) or without a differing base it is the bare
 * fragment. With a base on the same origin it is path + query + fragment, and with a
 * base on another origin the absolute URL. Pure: no globals are read. */
export function getFragmentHref(id: string, documentUrl?: string | null, baseUrl?: string | null): string {
  const fragment = `#${encodeURIComponent(id)}`;
  if (!documentUrl) return fragment;
  const page = withoutFragment(documentUrl);
  if (!baseUrl || withoutFragment(baseUrl) === page) return fragment;
  const pageOrigin = origin(page);
  return pageOrigin && pageOrigin === origin(baseUrl) ? `${page.slice(pageOrigin.length) || '/'}${fragment}` : `${page}${fragment}`;
}

export interface FragmentLinkOptions {
  /** Target id. Defaults to `data-hw-section`, then the fragment of the authored href. */
  id?: () => string;
  /** Scroll and focus are handled by the caller; return false to leave the click to the browser. */
  navigate?: (id: string, target: HTMLElement) => boolean | void;
  /** Also write the fragment to the address bar with history.replaceState. Off by default,
   * so hash-routed applications keep their route. */
  updateHash?: boolean;
}
export interface FragmentLink {
  /** Rewrites the href for the current document URL and base. */
  refresh(): void;
  /** Moves to the target as a plain activation would. False when there is no target. */
  activate(): boolean;
  destroy(): void;
}

/** Keeps a packaged in-page link (skip link, content-navigation link) working under
 * `<base href>`. The server-rendered `#id` is left untouched until the reader
 * interacts with the link, so hydration sees the markup it expects. */
export function bindFragmentLink(link: HTMLAnchorElement, options: FragmentLinkOptions = {}): FragmentLink {
  const document = link.ownerDocument;
  const view = document?.defaultView;
  if (!view || typeof link.addEventListener !== 'function') return { refresh() {}, activate: () => false, destroy() {} };
  let written: string | undefined;
  let destroyed = false;
  let restoreTabIndex: (() => void) | undefined;
  const id = () => options.id?.() || link.dataset?.hwSection || getFragmentId(link.getAttribute('href'));
  const href = (target: string) => getFragmentHref(target, view.location?.href, document.baseURI);
  const refresh = () => {
    const target = id();
    if (destroyed || !target) return;
    const next = href(target);
    if (link.getAttribute('href') !== next) link.setAttribute('href', next);
    written = next;
  };
  const focus = (target: HTMLElement) => {
    restoreTabIndex?.();
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      const restore = () => {
        if (target.getAttribute('tabindex') === '-1') target.removeAttribute('tabindex');
        target.removeEventListener('blur', restore);
        if (restoreTabIndex === restore) restoreTabIndex = undefined;
      };
      restoreTabIndex = restore;
      target.addEventListener('blur', restore, { once: true });
    }
    target.focus({ preventScroll: true });
  };
  const activate = () => {
    const targetId = id();
    const target = targetId ? document.getElementById(targetId) : null;
    if (destroyed || !target) return false;
    if (options.navigate) { if (options.navigate(targetId, target) === false) return false; }
    else { target.scrollIntoView?.({ block: 'start', behavior: 'instant' as ScrollBehavior }); focus(target); }
    if (options.updateHash) { try { view.history?.replaceState(view.history.state, '', href(targetId)); } catch { /* opaque origins cannot rewrite the URL */ } }
    return true;
  };
  const onClick = (event: MouseEvent) => {
    refresh();
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.getAttribute('aria-disabled') === 'true') return;
    if (activate()) event.preventDefault();
  };
  // Every route to "open in new tab" or "copy link" starts with one of these.
  const early = ['focus', 'pointerenter', 'pointerdown', 'touchstart', 'contextmenu', 'auxclick'] as const;
  for (const type of early) link.addEventListener(type, refresh, { passive: true });
  link.addEventListener('click', onClick);
  return {
    refresh,
    activate,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const type of early) link.removeEventListener(type, refresh);
      link.removeEventListener('click', onClick);
      restoreTabIndex?.();
      // Restore the server form only when the href is still the one written here;
      // a value the owning framework rendered since then is left alone.
      const target = getFragmentId(written);
      if (written !== undefined && target && link.getAttribute('href') === written) link.setAttribute('href', getFragmentHref(target));
    },
  };
}
