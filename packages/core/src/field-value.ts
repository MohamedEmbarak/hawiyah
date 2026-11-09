export type FieldValueElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export interface FieldValueObserver { refresh(): void; destroy(): void }
const observers = new WeakMap<FieldValueElement, { references: number; refresh(): void; release(): void }>();

function hasSelectedValue(select: HTMLSelectElement): boolean {
  for (const option of select.options) {
    if (option.selected && option.value !== '') return true;
  }
  return false;
}

/** Tracks value presence only. Native validity and application errors remain authoritative. */
export function observeFieldValue(element: FieldValueElement): FieldValueObserver {
  let entry = observers.get(element);
  if (!entry) {
    const original = element.getAttribute('data-hw-filled');
    const select = element.localName === 'select' ? element as HTMLSelectElement : undefined;
    let active = true;
    let form = element.form;
    const refresh = () => {
      if (!active) return;
      if (form !== element.form) { form?.removeEventListener('reset', reset); form = element.form; form?.addEventListener('reset', reset); }
      const filled = select?.multiple ? hasSelectedValue(select) : element.value !== '';
      const value = String(filled);
      if (element.getAttribute('data-hw-filled') !== value) element.setAttribute('data-hw-filled', value);
    };
    const reset = (event: Event) => queueMicrotask(() => { if (!event.defaultPrevented) refresh(); });
    const changed = () => { refresh(); queueMicrotask(refresh); };
    const composition = element.closest('[data-hw]');
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    const mutation = Observer ? new Observer(refresh) : undefined;
    if (select) {
      // The browser can select a different option without firing input or change.
      // Text changes also change an option's value when it has no value attribute.
      mutation?.observe(select, {
        attributes: true, attributeFilter: ['value', 'selected', 'disabled', 'multiple', 'size', 'form'],
        childList: true, characterData: true, subtree: true,
      });
      select.addEventListener('focus', refresh);
    } else {
      mutation?.observe(element, { attributes: true, attributeFilter: ['value', 'type', 'form'] });
    }
    element.addEventListener('input', changed); element.addEventListener('change', changed);
    form?.addEventListener('reset', reset); composition?.addEventListener('hw:change', refresh);
    entry = { references: 0, refresh, release() {
      active = false; mutation?.disconnect();
      select?.removeEventListener('focus', refresh);
      element.removeEventListener('input', changed); element.removeEventListener('change', changed);
      form?.removeEventListener('reset', reset); composition?.removeEventListener('hw:change', refresh);
      if (original === null) element.removeAttribute('data-hw-filled'); else element.setAttribute('data-hw-filled', original);
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
