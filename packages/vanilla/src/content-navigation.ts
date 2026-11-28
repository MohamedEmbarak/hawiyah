import { bindFragmentLink, createCleanup, getFragmentId, isDisabled, observeContentNavigation, type ContentNavigationItem, type FragmentLink } from '@hawiyah/core';
import { emit, eventElement, nameRoot, remember, text } from './dom.js';

export interface ContentNavigationOptions {
  scrollRoot?: HTMLElement | null;
  offset?: number;
  onCurrentChange?: (id: string) => void;
  /** Name of the nav landmark (data-hw-label), unless the authored nav has aria-label or aria-labelledby. Required. */
  label?: string;
  /** Also write the resolved URL with the fragment to the address bar (data-hw-update-hash="true"). Off by default. */
  updateHash?: boolean;
}
export interface ContentNavigationController {
  readonly current: string;
  refresh(): void;
  navigate(id: string, options?: { focus?: boolean }): boolean;
  destroy(): void;
}

/** Enhance semantic in-page links without replacing their authored navigation structure. */
export function createContentNavigation(root: HTMLElement, options: ContentNavigationOptions = {}): ContentNavigationController {
  const scope = createCleanup();
  let current = '';
  const tracked = new Map<HTMLAnchorElement, { fromHref: boolean }>();
  const owns = (link: HTMLAnchorElement) => {
    const owner = link.closest('[data-hw="content-navigation"]');
    return owner ? owner === root : (root.localName !== 'nav' || link.closest('nav') === root);
  };
  // Bound links keep "#id" in markup; their href is resolved against the document URL on interaction.
  const links = () => [...root.querySelectorAll<HTMLAnchorElement>('a[data-hw-section], a[href]')].filter(link => (tracked.has(link) || link.hasAttribute('data-hw-section') || link.getAttribute('href')?.startsWith('#')) && owns(link));
  const fromHref = (link: HTMLAnchorElement) => getFragmentId(link.getAttribute('href'));
  const navigation = root.localName === 'nav' ? root : root.querySelector<HTMLElement>('nav');
  if (navigation) { remember(scope, navigation, ['aria-label']); nameRoot(navigation, 'ContentNavigation', text(root, 'label', options.label)); }
  const rootMissing = () => options.scrollRoot === undefined && !!root.dataset.hwScrollRoot && !scrollRoot();
  const bindings = new Map<HTMLAnchorElement, FragmentLink>();
  let keyboard = false;
  scope.add(() => { for (const binding of bindings.values()) binding.destroy(); bindings.clear(); });
  const bind = () => {
    const current = new Set(links());
    for (const [link, binding] of bindings) if (!current.has(link)) { binding.destroy(); bindings.delete(link); }
    for (const link of current) {
      if (bindings.has(link)) continue;
      bindings.set(link, bindFragmentLink(link, {
        id: () => idFor(link),
        updateHash: options.updateHash ?? root.dataset.hwUpdateHash === 'true',
        // A configured scroll root that is not mounted handles the click without scrolling: the browser must not jump in the host page.
        navigate: id => !isDisabled(root) && !isDisabled(link) && !link.hasAttribute('download') && (rootMissing() || observer.navigate(id, { focus: keyboard })),
      }));
    }
  };
  const idFor = (link: HTMLAnchorElement) => {
    let entry = tracked.get(link);
    if (!entry) {
      remember(scope, link, ['aria-current', 'data-hw-section']);
      entry = { fromHref: !link.hasAttribute('data-hw-section') }; tracked.set(link, entry);
    }
    const id = entry.fromHref ? fromHref(link) : link.dataset.hwSection || fromHref(link);
    if (id && link.dataset.hwSection !== id) link.dataset.hwSection = id;
    if (!id && entry.fromHref) link.removeAttribute('data-hw-section');
    return id;
  };
  const scrollRoot = () => options.scrollRoot !== undefined ? options.scrollRoot : root.dataset.hwScrollRoot ? root.ownerDocument.getElementById(root.dataset.hwScrollRoot) : null;
  const items = (): ContentNavigationItem[] => {
    // A configured but not-yet-mounted container must not fall back to scrolling the host page.
    if (rootMissing()) return [];
    return links().map(link => ({ id: idFor(link), label: link.getAttribute('aria-label') || link.textContent?.trim() || '', disabled: isDisabled(root) || isDisabled(link) }));
  };
  const render = () => {
    for (const link of links()) {
      const id = idFor(link);
      if (id && id === current && !isDisabled(root) && !isDisabled(link)) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const observer = observeContentNavigation({
    navigation: root,
    getItems: items,
    getScrollRoot: scrollRoot,
    offset: () => options.offset ?? Number(root.dataset.hwOffset ?? 80),
    onCurrentChange(id) {
      if (scope.destroyed) return;
      current = id; render(); emit(root, { current: id }); options.onCurrentChange?.(id);
    },
  });
  scope.add(observer.destroy);
  // Keyboard activation (detail 0) moves focus to the section; the fragment binding on each link handles the click.
  scope.listen(root, 'click', event => { keyboard = (event as MouseEvent).detail === 0; }, { capture: true });
  scope.listen(root, 'click', event => {
    const link = eventElement(event)?.closest<HTMLAnchorElement>('a');
    if (link && root.contains(link) && owns(link) && (isDisabled(root) || isDisabled(link))) event.preventDefault();
  });
  const MutationObserver = root.ownerDocument.defaultView?.MutationObserver;
  if (MutationObserver) {
    const mutations = new MutationObserver(() => { bind(); render(); observer.refresh(); });
    mutations.observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'data-hw-section', 'data-hw-offset', 'data-hw-scroll-root', 'disabled', 'aria-disabled']});
    scope.add(() => mutations.disconnect());
  }
  bind(); render();
  return { get current() { return current; }, refresh: observer.refresh, navigate: observer.navigate, destroy: () => scope.destroy() };
}
