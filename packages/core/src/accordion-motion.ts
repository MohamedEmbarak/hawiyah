export interface AccordionMotion {
  readonly open: boolean;
  setOpen(open: boolean, immediate?: boolean): void;
  request(open: boolean): void;
  nativeToggle(): void;
  destroy(): void;
}

const groups = new WeakMap<Node, Map<string, Set<AccordionMotion>>>();

/** Adapters bind events and own markup; this helper owns only the transient motion.
 * No browser globals are read during module evaluation. */
export function createAccordionMotion(details: HTMLDetailsElement, content: HTMLElement,
  onOpenChange?: (open: boolean) => void): AccordionMotion {
  const summary = [...details.children].find(child => child.localName === 'summary') as HTMLElement | undefined;
  if (!summary) throw new Error('Nasaq: accordion items require a summary.');
  const view = details.ownerDocument.defaultView;
  const media = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
  const name = details.getAttribute('name');
  const tree = details.getRootNode();
  const initial = {
    expanded: summary.getAttribute('aria-expanded'), hidden: content.getAttribute('aria-hidden'),
    inert: content.hasAttribute('inert'), overflow: details.style.overflow,
    state: details.getAttribute('data-nq-expanded'),
  };
  let target = details.open;
  let animation: Animation | undefined;
  let destroyed = false;
  let peers: Set<AccordionMotion> | undefined;
  if (name) {
    let documentGroups = groups.get(tree);
    if (!documentGroups) { documentGroups = new Map(); groups.set(tree, documentGroups); }
    peers = documentGroups.get(name);
    if (!peers) { peers = new Set(); documentGroups.set(name, peers); }
    // Native name grouping hides a closing item before its exit can animate.
    // Enhanced peers coordinate their logical state instead; restore on cleanup.
    details.removeAttribute('name');
  }
  const restore = (element: Element, attribute: string, value: string | null) => {
    if (value === null) element.removeAttribute(attribute); else element.setAttribute(attribute, value);
  };
  const cancel = () => {
    if (animation) { animation.onfinish = null; animation.oncancel = null; animation.cancel(); animation = undefined; }
  };
  const accessibility = () => {
    const active = 'activeElement' in tree ? (tree as Document | ShadowRoot).activeElement : details.ownerDocument.activeElement;
    if (!target && content.contains(active)) summary.focus({ preventScroll: true });
    summary.setAttribute('aria-expanded', String(target));
    details.dataset.nqExpanded = String(target);
    content.toggleAttribute('inert', !target || initial.inert);
    if (target) restore(content, 'aria-hidden', initial.hidden); else content.setAttribute('aria-hidden', 'true');
  };
  const finish = () => {
    cancel();
    details.open = target;
    details.style.overflow = initial.overflow;
    accessibility();
  };
  const move = (open: boolean, immediate = false) => {
    if (destroyed) return;
    const changed = target !== open;
    target = open;
    if (open && (changed || immediate)) for (const peer of peers ?? []) if (peer !== controller && peer.open) peer.request(false);
    accessibility();
    const style = view?.getComputedStyle?.(details);
    const token = style?.getPropertyValue('--nq-duration-accordion').trim() ?? '';
    const duration = Math.max(0, Number.parseFloat(token) * (token.endsWith('ms') ? 1 : 1000)) || 0;
    const easing = style?.getPropertyValue('--nq-ease-accordion').trim() || 'ease-in-out';
    if (immediate || !duration || media?.matches || typeof details.animate !== 'function') { finish(); return; }
    const from = details.getBoundingClientRect().height;
    cancel();
    details.open = true;
    const natural = details.getBoundingClientRect();
    const collapsed = summary.getBoundingClientRect().bottom - natural.top
      + (Number.parseFloat(style?.borderBottomWidth ?? '') || 0)
      + (Number.parseFloat(style?.paddingBottom ?? '') || 0);
    const to = target ? natural.height : collapsed;
    if (Math.abs(from - to) < .5) { finish(); return; }
    details.style.overflow = 'hidden';
    try {
      animation = details.animate([{ height: `${from}px`, boxSizing: 'border-box' }, { height: `${to}px`, boxSizing: 'border-box' }], { duration, easing, fill: 'both' });
      animation.onfinish = finish;
    } catch { finish(); } // Unsupported WAAPI or a malformed custom easing stays usable.
  };
  const preferenceChanged = () => { if (media?.matches) finish(); };
  media?.addEventListener?.('change', preferenceChanged);
  const Resize = view?.ResizeObserver;
  const resize = Resize ? new Resize(() => { if (animation && target) move(true); }) : undefined;
  resize?.observe(content);
  const controller: AccordionMotion = {
    get open() { return target; },
    setOpen(open, immediate) { if (open !== target || immediate) move(open, immediate); },
    request(open) { if (!destroyed && open !== target) { if (onOpenChange) onOpenChange(open); else move(open); } },
    nativeToggle() {
      if (destroyed) return;
      const physical = target || !!animation;
      if (details.open !== physical) {
        const requested = details.open;
        // A controlled adapter can decline the request; never leave DOM and
        // accessibility state disagreeing while waiting for its next render.
        details.open = physical;
        controller.request(requested);
      }
    },
    destroy() {
      if (destroyed) return;
      finish(); destroyed = true;
      resize?.disconnect(); media?.removeEventListener?.('change', preferenceChanged);
      peers?.delete(controller);
      if (name) {
        if (!peers?.size) groups.get(tree)?.delete(name);
        details.setAttribute('name', name);
      }
      restore(summary, 'aria-expanded', initial.expanded);
      restore(content, 'aria-hidden', initial.hidden);
      content.toggleAttribute('inert', initial.inert);
      restore(details, 'data-nq-expanded', initial.state);
    },
  };
  peers?.add(controller);
  accessibility();
  return controller;
}
