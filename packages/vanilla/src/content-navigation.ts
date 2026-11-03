import { createCleanup, isDisabled, observeContentNavigation, type ContentNavigationItem } from '@nasaq/core';
import { emit, eventElement, remember } from './dom.js';

export interface ContentNavigationOptions {
  scrollRoot?: HTMLElement | null;
  offset?: number;
  onCurrentChange?: (id: string) => void;
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
    const owner = link.closest('[data-nq="content-navigation"]');
    return owner ? owner === root : (root.localName !== 'nav' || link.closest('nav') === root);
  };
  const links = () => [...root.querySelectorAll<HTMLAnchorElement>('a[data-nq-section], a[href^="#"]')].filter(owns);
  const fromHref = (link: HTMLAnchorElement) => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#') || href.length < 2) return '';
    try { return decodeURIComponent(href.slice(1)); } catch { return ''; }
  };
  const idFor = (link: HTMLAnchorElement) => {
    let entry = tracked.get(link);
    if (!entry) {
      remember(scope, link, ['aria-current', 'data-nq-section']);
      entry = { fromHref: !link.hasAttribute('data-nq-section') }; tracked.set(link, entry);
    }
    const id = entry.fromHref ? fromHref(link) : link.dataset.nqSection || fromHref(link);
    if (id && link.dataset.nqSection !== id) link.dataset.nqSection = id;
    if (!id && entry.fromHref) link.removeAttribute('data-nq-section');
    return id;
  };
  const scrollRoot = () => options.scrollRoot !== undefined ? options.scrollRoot : root.dataset.nqScrollRoot ? root.ownerDocument.getElementById(root.dataset.nqScrollRoot) : null;
  const items = (): ContentNavigationItem[] => {
    // A configured but not-yet-mounted container must not fall back to scrolling the host page.
    if (options.scrollRoot === undefined && root.dataset.nqScrollRoot && !scrollRoot()) return [];
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
    offset: () => options.offset ?? Number(root.dataset.nqOffset ?? 80),
    onCurrentChange(id) {
      if (scope.destroyed) return;
      current = id; render(); emit(root, { current: id }); options.onCurrentChange?.(id);
    },
  });
  scope.add(observer.destroy);
  scope.listen(root, 'click', event => {
    const click = event as MouseEvent;
    const link = eventElement(event)?.closest<HTMLAnchorElement>('a');
    if (!link || !root.contains(link) || !owns(link)) return;
    if (isDisabled(root) || isDisabled(link)) { event.preventDefault(); return; }
    if (event.defaultPrevented || click.button !== 0 || click.altKey || click.ctrlKey || click.metaKey || click.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const id = idFor(link);
    if (id) { event.preventDefault(); observer.navigate(id, { focus: click.detail === 0 }); }
  });
  const MutationObserver = root.ownerDocument.defaultView?.MutationObserver;
  if (MutationObserver) {
    const mutations = new MutationObserver(() => { render(); observer.refresh(); });
    mutations.observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'data-nq-section', 'data-nq-offset', 'data-nq-scroll-root', 'disabled', 'aria-disabled']});
    scope.add(() => mutations.disconnect());
  }
  render();
  return { get current() { return current; }, refresh: observer.refresh, navigate: observer.navigate, destroy: () => scope.destroy() };
}
