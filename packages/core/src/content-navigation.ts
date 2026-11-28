export interface ContentNavigationItem {
  id: string;
  label: string;
  disabled?: boolean;
  children?: readonly ContentNavigationItem[];
}
export interface ContentNavigationOptions {
  navigation: HTMLElement;
  getItems: () => readonly ContentNavigationItem[];
  getScrollRoot: () => HTMLElement | null;
  offset: () => number;
  onCurrentChange: (id: string) => void;
}
export interface ContentNavigationObserver {
  refresh(): void;
  navigate(id: string, options?: { focus?: boolean }): boolean;
  destroy(): void;
}

/** Measures and scrolls existing elements; rendering and current-link attributes belong to adapters.
 * Without layout APIs (a server DOM) nothing is measured and no timer is started.
 * While a scroll that navigate() started is in progress the target stays current and measured
 * updates wait, so one activation reports one change however many sections the scroll passes. */
export function observeContentNavigation(options: ContentNavigationOptions): ContentNavigationObserver {
  const { navigation } = options;
  const document = navigation.ownerDocument;
  const view = document?.defaultView;
  if (!view || typeof navigation.getBoundingClientRect !== 'function') return { refresh() {}, navigate: () => false, destroy() {} };
  let destroyed = false;
  let frame: number | undefined;
  let scrollRoot: HTMLElement | null = null;
  let current: string | undefined;
  // A scroll navigate() started. `top` is where it ends, `distance` how far it still was at the last scroll event.
  let hold: { id: string; top: number; distance: number } | undefined;
  // Where that scroll arrived. The target stays current until the position changes.
  let settled: { id: string; position: number } | undefined;
  let idle: number | undefined;
  const takeover = ['wheel', 'touchmove', 'keydown'] as const;
  const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
  // Browsers without scrollend end the hold after a short pause in scroll events; with it the pause is only a safety net.
  const idleDelay = (confirmed = false) => confirmed || !('onscrollend' in view) ? 150 : 1000;
  const position = () => scrollRoot?.scrollTop ?? view.scrollY ?? 0;
  const maxScroll = () => Math.max(0, (scrollRoot?.scrollHeight ?? Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0)) - (scrollRoot?.clientHeight ?? view.innerHeight ?? 0));
  const observed = new Set<Element>();
  const focusCleanups = new Map<HTMLElement, () => void>();
  const offset = () => { const value = options.offset(); return Number.isFinite(value) ? Math.max(0, value) : 80; };
  const reducedMotion = () => view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  // 'auto' can inherit a consumer's CSS smooth scrolling; 'instant' cannot.
  const scrollBehavior = (smooth: boolean): ScrollBehavior => smooth && !reducedMotion() ? 'smooth' : 'instant';
  const targets = () => {
    const found: Array<{ id: string; element: HTMLElement }> = [];
    const seenIds = new Set<string>();
    const seenItems = new Set<ContentNavigationItem>();
    const pending = [...options.getItems()].reverse();
    while (pending.length) {
      const item = pending.pop()!;
      if (seenItems.has(item)) continue;
      seenItems.add(item);
      if (item.children) pending.push(...[...item.children].reverse());
      if (!item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      if (item.disabled) continue;
      const element = document.getElementById(item.id);
      if (!element?.isConnected || element.closest('[hidden], [inert]') || (scrollRoot && !scrollRoot.contains(element))) continue;
      let concealed = view?.getComputedStyle(element).visibility === 'hidden';
      for (let ancestor: HTMLElement | null = element; ancestor && !concealed; ancestor = ancestor.parentElement) {
        concealed = view?.getComputedStyle(ancestor).display === 'none';
        // Closed details can report visible styles and nonzero descendant boxes.
        // Only the first direct summary subtree remains exposed while closed.
        if (!concealed && ancestor !== element && ancestor.localName === 'details' && !ancestor.hasAttribute('open')) {
          const summary: Element | undefined = [...ancestor.children].find(child => child.localName === 'summary');
          concealed = !summary?.contains(element);
        }
      }
      if (concealed) continue;
      found.push({ id: item.id, element });
    }
    return found;
  };
  const ensureLinkVisible = (id: string, smooth: boolean) => {
    if (navigation.clientHeight <= 0 || navigation.scrollHeight <= navigation.clientHeight) return;
    const link = [...navigation.querySelectorAll<HTMLElement>('[data-hw-section]')].find(link => link.dataset.hwSection === id);
    if (!link) return;
    const outer = navigation.getBoundingClientRect(), inner = link.getBoundingClientRect();
    const top = outer.top + navigation.clientTop, bottom = top + navigation.clientHeight;
    if (inner.top >= top && inner.bottom <= bottom) return;
    const next = navigation.scrollTop + inner.top - top - navigation.clientHeight / 2 + inner.height / 2;
    navigation.scrollTo?.({ top: Math.min(Math.max(0, next), navigation.scrollHeight - navigation.clientHeight), behavior: scrollBehavior(smooth) });
  };
  const updateCurrent = (id: string, smooth = false) => {
    if (current !== id) { current = id; options.onCurrentChange(id); }
    if (id) ensureLinkVisible(id, smooth);
  };
  const clearIdle = () => { if (idle !== undefined) { view.clearTimeout(idle); idle = undefined; } };
  const endHold = () => {
    if (!hold) return;
    hold = undefined; clearIdle();
    for (const type of takeover) view.removeEventListener(type, onTakeover, true);
  };
  /** Ends the hold and measures. A scroll that arrived keeps its target until the position
   * changes; one that stopped short, or that the reader took over, shows what is measured. */
  const release = () => {
    if (!hold) return;
    settled = Math.abs(position() - hold.top) <= 1 ? { id: hold.id, position: position() } : undefined;
    endHold(); refresh();
  };
  const armIdle = (confirmed = false) => { clearIdle(); idle = view.setTimeout(() => { idle = undefined; release(); }, idleDelay(confirmed)); };
  function onTakeover(event: Event) { if (event.type !== 'keydown' || scrollKeys.has((event as KeyboardEvent).key)) release(); }
  function onScroll() {
    if (hold) {
      const distance = Math.abs(position() - hold.top);
      // Arrived, or moving away from the target: the reader dragged the scrollbar or another script scrolled.
      if (distance <= 1 || distance > hold.distance + 2) release();
      else { hold.distance = distance; armIdle(); }
    }
    refresh();
  }
  // A scrollend short of the target can belong to a scroll this one replaced: wait briefly for more movement.
  function onScrollEnd() { if (!hold) return; if (Math.abs(position() - hold.top) <= 1) release(); else armIdle(true); }
  const bindRoot = () => {
    const next = options.getScrollRoot();
    if (next === scrollRoot) return;
    endHold(); settled = undefined;
    scrollRoot?.removeEventListener('scroll', onScroll); scrollRoot?.removeEventListener('scrollend', onScrollEnd);
    scrollRoot = next;
    scrollRoot?.addEventListener('scroll', onScroll, { passive: true }); scrollRoot?.addEventListener('scrollend', onScrollEnd);
  };
  const syncObserved = (elements: readonly HTMLElement[]) => {
    const next = new Set<Element>([navigation, ...(scrollRoot ? [scrollRoot] : []), ...elements]);
    for (const old of observed) if (!next.has(old)) { resize?.unobserve(old); observed.delete(old); }
    for (const element of next) if (!observed.has(element)) { observed.add(element); resize?.observe(element); }
  };
  const measure = () => {
    frame = undefined;
    if (destroyed) return;
    bindRoot();
    const entries = targets();
    syncObserved(entries.map(item => item.element));
    if (hold) { if (entries.some(item => item.id === hold!.id)) return; endHold(); }
    if (!entries.length) { settled = undefined; updateCurrent(''); return; }
    if (settled) {
      if (Math.abs(position() - settled.position) <= 1 && entries.some(item => item.id === settled!.id)) { updateCurrent(settled.id); return; }
      settled = undefined;
    }
    const positioned = entries.map(item => ({...item, top: item.element.getBoundingClientRect().top})).sort((a,b) => a.top - b.top);
    const viewportTop = scrollRoot ? scrollRoot.getBoundingClientRect().top + scrollRoot.clientTop : 0;
    const limit = maxScroll();
    const atBottom = limit > 0 && position() >= limit - 1;
    const threshold = viewportTop + offset() + 20;
    const passed = positioned.filter(item => item.top <= threshold);
    const active = atBottom ? positioned[positioned.length - 1]! : passed[passed.length - 1] ?? positioned[0]!;
    updateCurrent(active.id);
  };
  function refresh() {
    if (destroyed || frame !== undefined) return;
    frame = view?.requestAnimationFrame ? view.requestAnimationFrame(measure) : (view?.setTimeout(measure, 0) ?? 0);
  }
  const resize = view?.ResizeObserver ? new view.ResizeObserver(refresh) : undefined;
  const mutation = view?.MutationObserver ? new view.MutationObserver(refresh) : undefined;
  mutation?.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['id', 'hidden', 'inert', 'open', 'class', 'style', 'disabled', 'aria-disabled'] });
  view?.addEventListener('scroll', onScroll, { passive: true }); view?.addEventListener('scrollend', onScrollEnd);
  view?.addEventListener('resize', refresh);
  const fonts = document.fonts;
  fonts?.addEventListener('loadingdone', refresh);
  const focusTarget = (target: HTMLElement) => {
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      const cleanup = () => {
        if (target.getAttribute('tabindex') === '-1') target.removeAttribute('tabindex');
        target.removeEventListener('blur', cleanup); focusCleanups.delete(target);
      };
      focusCleanups.set(target, cleanup); target.addEventListener('blur', cleanup, { once: true });
    }
    target.focus({ preventScroll: true });
  };
  refresh();
  return {
    refresh,
    navigate(id, { focus = false } = {}) {
      if (destroyed) return false;
      bindRoot();
      const target = targets().find(item => item.id === id)?.element;
      if (!target) return false;
      const viewportTop = scrollRoot ? scrollRoot.getBoundingClientRect().top + scrollRoot.clientTop : 0;
      const top = Math.max(0, target.getBoundingClientRect().top - viewportTop + position() - offset());
      endHold(); settled = undefined;
      if (scrollRoot) scrollRoot.scrollTo?.({ top, behavior: scrollBehavior(true) });
      else view?.scrollTo({ top, behavior: scrollBehavior(true) });
      if (focus) focusTarget(target);
      // The scroll ends at the target or at the end of the scroll range, whichever comes first.
      const end = Math.min(top, maxScroll()), distance = Math.abs(position() - end);
      if (distance <= 1) settled = { id, position: position() };
      else {
        hold = { id, top: end, distance };
        for (const type of takeover) view.addEventListener(type, onTakeover, { capture: true, passive: true });
        armIdle();
      }
      updateCurrent(id, true);
      return true;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame !== undefined) {
        if (view?.cancelAnimationFrame) view.cancelAnimationFrame(frame); else view?.clearTimeout(frame);
      }
      endHold();
      scrollRoot?.removeEventListener('scroll', onScroll); scrollRoot?.removeEventListener('scrollend', onScrollEnd);
      view?.removeEventListener('scroll', onScroll); view?.removeEventListener('scrollend', onScrollEnd); view?.removeEventListener('resize', refresh);
      fonts?.removeEventListener('loadingdone', refresh);
      mutation?.disconnect(); resize?.disconnect(); observed.clear();
      for (const cleanup of [...focusCleanups.values()]) cleanup();
    },
  };
}
