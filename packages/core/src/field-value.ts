export type FieldValueElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export interface FieldValueObserver { refresh(): void; destroy(): void }
const observers = new WeakMap<FieldValueElement, { references: number; refresh(): void; release(): void }>();

/** Tracks value presence only. Native validity and application errors remain authoritative. */
export function observeFieldValue(element: FieldValueElement): FieldValueObserver {
  let entry = observers.get(element);
  if (!entry) {
    const original = element.getAttribute('data-nq-filled');
    let active = true;
    let form = element.form;
    const refresh = () => {
      if (!active) return;
      if (form !== element.form) { form?.removeEventListener('reset', reset); form = element.form; form?.addEventListener('reset', reset); }
      const value = element.value !== '' ? 'true' : 'false';
      if (element.getAttribute('data-nq-filled') !== value) element.setAttribute('data-nq-filled', value);
    };
    const reset = (event: Event) => queueMicrotask(() => { if (!event.defaultPrevented) refresh(); });
    const changed = () => { refresh(); queueMicrotask(refresh); };
    const composition = element.closest('[data-nq]');
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    const mutation = Observer ? new Observer(refresh) : undefined;
    mutation?.observe(element, { attributes: true, attributeFilter: ['value', 'type', 'form'] });
    element.addEventListener('input', changed); element.addEventListener('change', changed);
    form?.addEventListener('reset', reset); composition?.addEventListener('nq:change', refresh);
    entry = { references: 0, refresh, release() {
      active = false; mutation?.disconnect();
      element.removeEventListener('input', changed); element.removeEventListener('change', changed);
      form?.removeEventListener('reset', reset); composition?.removeEventListener('nq:change', refresh);
      if (original === null) element.removeAttribute('data-nq-filled'); else element.setAttribute('data-nq-filled', original);
    } };
    observers.set(element, entry);
  }
  const shared = entry;
  shared.references++; shared.refresh(); let destroyed = false;
  return { refresh: shared.refresh, destroy() {
    if (destroyed) return; destroyed = true;
    if (--shared.references === 0) { shared.release(); observers.delete(element); }
  } };
}
