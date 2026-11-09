/** Snapshot a user-initiated dismissal. Call the result after its render commits. */
export function prepareToastDismissFocus(region: HTMLElement, toast: HTMLElement): () => void {
  const doc = region.ownerDocument;
  const focused = doc.activeElement;
  if (!focused || !toast.contains(focused) || !region.contains(toast)) return () => {};

  const belongs = (element: HTMLElement) => {
    const owner = element.closest('.hw-toast-region, [data-hw="toast-region"]');
    return region.contains(element) && (!owner || owner === region || !region.contains(owner));
  };
  if (!belongs(toast)) return () => {};
  const notices = [...region.querySelectorAll<HTMLElement>('[data-hw-toast]')].filter(belongs);
  const index = notices.indexOf(toast);
  const neighbors = [...notices.slice(index + 1), ...notices.slice(0, index).reverse()];
  const id = (notice: HTMLElement) => notice.dataset.hwToast || notice.id;
  const originalId = id(toast);
  let consumed = false;
  return () => {
    if (consumed) return;
    consumed = true;
    if (!region.isConnected || (belongs(toast) && !toast.hidden)) return;
    const remaining = [...region.querySelectorAll<HTMLElement>('[data-hw-toast]')].filter(notice => belongs(notice) && !notice.closest('[hidden], [inert]'));
    if (originalId && remaining.some(notice => id(notice) === originalId)) return;
    const active = doc.activeElement;
    if (active && active !== doc.body && active !== doc.documentElement && !toast.contains(active)) return;
    const available = new Set(remaining);
    for (const notice of new Set([...neighbors, ...remaining])) {
      if (!available.has(notice) || notice.dataset.hwDismissible === 'false') continue;
      const button = [...notice.querySelectorAll<HTMLElement>('[data-hw-dismiss]')].find(element =>
        belongs(element) && !element.matches(':disabled, [disabled], [aria-disabled="true"]') && !element.closest('[hidden], [inert]'));
      if (button) {
        button.focus({ preventScroll: true });
        if (doc.activeElement === button) return;
      }
    }
    region.focus({ preventScroll: true });
  };
}
