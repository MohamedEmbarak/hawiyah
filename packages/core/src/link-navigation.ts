// Packaged components render plain href anchors, so pages work without script and
// "open in new tab" keeps working. An application with a client-side router binds one
// delegated listener here and receives the activations a router should handle.

export interface LinkNavigationTarget {
  /** The resolved destination. */
  url: URL;
  /** Pathname, search and hash relative to the base path, always starting with "/". */
  path: string;
  link: HTMLAnchorElement;
  event: MouseEvent;
}
export interface LinkNavigationOptions {
  /** Hands the activation to the application's router. Return false to leave this click to
   * the browser. If it throws, the default is not prevented and the browser follows the link. */
  navigate(target: LinkNavigationTarget): boolean | void;
  /** Base path the router is mounted on ("/hawiyah/"). Defaults to the directory of a
   * same-origin `<base href>`, and to "/" when the document has none. Links outside it are
   * left to the browser. */
  base?: string;
}
export interface LinkNavigation { destroy(): void }

const handled = new WeakSet<Event>();
/** True for a click that bindLinkNavigation passed to the application. Such an event has
 * its default prevented although the navigation went ahead, so a component that closes on
 * "not prevented" (the navigation drawers) asks here as well. */
export function isLinkNavigationHandled(event: Event | null | undefined): boolean {
  return !!event && handled.has(event);
}

const withoutFragment = (url: string) => { const index = url.indexOf('#'); return index < 0 ? url : url.slice(0, index); };
const directory = (path: string) => { const value = path.startsWith('/') ? path : `/${path}`; return value.endsWith('/') ? value : `${value}/`; };

/** One delegated click listener on `root`, in the bubble phase, so component handlers and
 * application guards run first. It acts on a plain primary activation (button 0, no modifier
 * key, default not prevented; Enter on a link arrives as a click) of an HTML `a[href]` inside
 * `root` that is same-origin and inside the base path, has no `download`, no target other
 * than `_self` (its own or the document base's), no `rel="external"`, is not aria-disabled,
 * inert or editable, and is not a link to the current document that only adds a fragment
 * (bindFragmentLink and the browser keep those). It renders nothing and changes no node.
 * Without a browser DOM it returns an inert handle, so it may be called during server rendering. */
export function bindLinkNavigation(root: Document | HTMLElement | null | undefined, options: LinkNavigationOptions): LinkNavigation {
  const document = root ? (root.nodeType === 9 ? root as Document : root.ownerDocument) : null;
  const view = document?.defaultView;
  if (!root || !document || !view?.location || typeof root.addEventListener !== 'function') return { destroy() {} };
  const location = view.location;
  const basePath = () => {
    if (options.base !== undefined) return directory(options.base);
    if (!document.querySelector('base[href]')) return '/';
    try {
      const base = new URL(document.baseURI);
      return base.protocol === location.protocol && base.host === location.host ? base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) || '/' : '/';
    } catch { return '/'; }
  };
  const onClick = (event: Event) => {
    const click = event as MouseEvent;
    if (click.defaultPrevented || click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return;
    const origin = click.target as Node | null;
    const element = origin?.nodeType === 1 ? origin as Element : origin?.parentElement;
    const link = element?.closest?.('a[href]') as HTMLAnchorElement | null | undefined;
    // SVG anchors expose an animated href object, not a URL string, and are left alone.
    if (!link || typeof link.href !== 'string' || (link.isConnected && !root.contains(link))) return;
    if (link.hasAttribute('download') || link.isContentEditable || link.closest('[aria-disabled="true"], [inert]')) return;
    const target = link.getAttribute('target') ?? document.querySelector('base[target]')?.getAttribute('target') ?? '';
    if (target && target.toLowerCase() !== '_self') return;
    if ((link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/u).includes('external')) return;
    let url: URL;
    try { url = new URL(link.href); } catch { return; }
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (withoutFragment(url.href) === withoutFragment(location.href) && (link.getAttribute('href') ?? '').includes('#')) return;
    const base = basePath();
    const inside = url.pathname.startsWith(base) || `${url.pathname}/` === base;
    if (!inside) return;
    const path = `/${url.pathname.slice(base.length)}${url.search}${url.hash}`;
    if (options.navigate({ url, path, link, event: click }) === false) return;
    click.preventDefault();
    handled.add(click);
  };
  let bound = true;
  root.addEventListener('click', onClick);
  return { destroy() { if (!bound) return; bound = false; root.removeEventListener('click', onClick); } };
}
