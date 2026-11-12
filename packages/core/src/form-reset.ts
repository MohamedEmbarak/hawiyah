export interface FormResetObserver { destroy(): void }

/** Object.is, or two arrays of equal length whose entries are pairwise Object.is.
 * The comparison behind "notify only when the reset changed the value". */
export function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((entry, index) => Object.is(entry, b[index]));
}

/** The form that owns `control` now: its own `form` for a listed element, else the form of the first
 * control inside it, else the closest form ancestor. Read at event time, so the `form` attribute,
 * a later association and a moved control are followed. */
function owningForm(control: Element): Element | null {
  if (control.matches('input, select, textarea, button, output')) return (control as HTMLInputElement).form;
  const inner = control.querySelector<HTMLInputElement>('input, select, textarea');
  return inner ? inner.form : control.closest('form');
}

/** Runs `onReset` after a native reset of the form that owns `control`, once the browser has reset the
 * controls, and never for a reset that a listener prevented. A reset started from script is reported in
 * the next microtask; a reset the reader activates is still being dispatched then, and is reported
 * before the next paint. Without a DOM that can listen (server rendering) the observer does nothing. */
export function observeFormReset(control: Element, onReset: () => void): FormResetObserver {
  const doc = control.ownerDocument;
  const origin = typeof control.getRootNode === 'function' ? control.getRootNode() : doc;
  if (!doc || typeof origin?.addEventListener !== 'function') return { destroy() {} };
  // A reset event is not composed, so inside a shadow tree it is heard at the shadow root. A tree that
  // is not connected yet is heard at its own root and, once connected, at the document.
  const detached = origin.nodeType !== 9 && !(origin.nodeType === 11 && 'host' in origin);
  const targets: EventTarget[] = detached && typeof doc.addEventListener === 'function' ? [origin, doc] : [origin];
  const seen = new WeakSet<Event>();
  let destroyed = false;
  const settle = (event: Event) => { if (!destroyed && !event.defaultPrevented) onReset(); };
  const listener = (event: Event) => {
    if (destroyed || seen.has(event)) return;
    seen.add(event);
    const form = owningForm(control);
    if (!form || event.target !== form) return;
    queueMicrotask(() => {
      // Phase 0: the dispatch is over and the browser has reset the controls already.
      if (event.eventPhase === 0) { settle(event); return; }
      const view = doc.defaultView;
      let done = false;
      const run = () => { if (!done) { done = true; settle(event); } };
      if (typeof view?.requestAnimationFrame === 'function') view.requestAnimationFrame(run);
      if (typeof view?.setTimeout === 'function') view.setTimeout(run, 0); else setTimeout(run, 0);
    });
  };
  for (const target of targets) target.addEventListener('reset', listener, true);
  return { destroy() {
    if (destroyed) return;
    destroyed = true;
    for (const target of targets) target.removeEventListener('reset', listener, true);
  } };
}
