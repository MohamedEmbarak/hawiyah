export interface TabOverflowObserver { refresh(): void; destroy(): void }
export interface TabOverflowOptions {
  container: HTMLElement;
  tabs: () => readonly HTMLElement[];
  enabled: () => boolean;
  onChange: (hidden: number[]) => void;
}

/** Read-only layout observation: adapters own visibility, disclosure DOM and focus.
 * Without layout APIs (a server DOM) nothing is measured and no timer is started. */
export function observeTabOverflow(options: TabOverflowOptions): TabOverflowObserver {
  const { container } = options;
  const view = container.ownerDocument?.defaultView;
  if (!view || typeof container.getBoundingClientRect !== 'function' || typeof view.getComputedStyle !== 'function') return { refresh() {}, destroy() {} };
  let destroyed = false;
  let frame: number | undefined;
  let last: string | undefined;
  const observed = new Set<HTMLElement>();
  const measure = () => {
    frame = undefined;
    if (destroyed) return;
    const tabs = options.tabs();
    for (const old of observed) if (!tabs.includes(old)) { resize?.unobserve(old); observed.delete(old); }
    for (const tab of tabs) if (!observed.has(tab)) { resize?.observe(tab); observed.add(tab); }
    const width = container.clientWidth;
    const gap = Number.parseFloat(view?.getComputedStyle(tabs[0]?.parentElement ?? container).columnGap ?? '') || 0;
    const widths = tabs.map(tab => {
      const css = view?.getComputedStyle(tab);
      return tab.getBoundingClientRect().width + (Number.parseFloat(css?.marginInlineStart ?? '') || 0) + (Number.parseFloat(css?.marginInlineEnd ?? '') || 0);
    });
    const hidden = options.enabled() ? getTabOverflowIndices(widths, width, gap) : [];
    const signature = hidden.join(',');
    if (signature !== last) { last = signature; options.onChange(hidden); }
  };
  const refresh = () => {
    if (destroyed || frame !== undefined) return;
    frame = view?.requestAnimationFrame ? view.requestAnimationFrame(measure) : (view?.setTimeout(measure, 0) ?? 0);
  };
  const resize = view?.ResizeObserver ? new view.ResizeObserver(refresh) : undefined;
  resize?.observe(container);
  const mutation = view?.MutationObserver ? new view.MutationObserver(refresh) : undefined;
  // Text, projected labels and inserted tabs may change width without a window resize.
  mutation?.observe(container, { childList: true, characterData: true, subtree: true });
  view?.addEventListener('resize', refresh);
  const fonts = container.ownerDocument.fonts;
  fonts?.addEventListener('loadingdone', refresh);
  refresh();
  return { refresh, destroy() {
    if (destroyed) return;
    destroyed = true;
    if (frame !== undefined) {
      if (view?.cancelAnimationFrame) view.cancelAnimationFrame(frame); else view?.clearTimeout(frame);
    }
    resize?.disconnect(); mutation?.disconnect(); observed.clear();
    view?.removeEventListener('resize', refresh); fonts?.removeEventListener('loadingdone', refresh);
  } };
}

/** NIC's 991px compact threshold and 72px disclosure reserve, using actual container width. */
export function getTabOverflowIndices(widths: readonly number[], width: number, gap = 3): number[] {
  if (!Number.isFinite(width) || width <= 0 || width > 991 || widths.length < 2) return [];
  const sizes = widths.map(value => Number.isFinite(value) ? Math.max(0, value) : 0);
  const spacing = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  if (sizes.reduce((sum, value) => sum + value, 0) + spacing * (sizes.length - 1) <= width) return [];
  const available = Math.max(0, width - 72);
  let used = 0, visible = 0;
  return sizes.flatMap((size, index) => {
    const next = used + (visible ? spacing : 0) + size;
    if (next <= available) { used = next; visible++; return []; }
    return [index];
  });
}
