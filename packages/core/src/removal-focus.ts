export interface RemovalFocusOptions {
  /** Selector, evaluated on the container, of the items one of which is being removed. */
  item: string;
  /** Selector, evaluated on an item, of the control that receives focus. */
  control: string;
  /** Receives focus when no other item has an available control, for example the list root with tabindex="-1". */
  fallback?: HTMLElement | null;
}

function available(element: HTMLElement | null | undefined): element is HTMLElement {
  return !!element?.isConnected && !element.matches(':disabled, [disabled], [aria-disabled="true"]') && !element.closest('[hidden], [inert]');
}

/** Keeps keyboard focus when a control removes its own item. Call at activation, before the item is
 * removed, and call the result once after the render that removed it: focus goes to the same control of
 * the next item, else of the previous one, else to `fallback`. Nothing happens unless focus was on the
 * control, the control is gone or unavailable, and focus was not placed elsewhere in the meantime. */
export function prepareRemovalFocus(container: HTMLElement, control: HTMLElement, options: RemovalFocusOptions): () => void {
  const idle = () => {};
  try {
    const doc = container.ownerDocument;
    const focused = doc.activeElement;
    if (!focused || !control.contains(focused) || !container.contains(control)) return idle;
    const items = Array.from(container.querySelectorAll<HTMLElement>(options.item));
    // The innermost matching item: querySelectorAll lists an outer item before the ones inside it.
    const item = items.filter(candidate => candidate.contains(control)).pop();
    if (!item) return idle;
    const index = items.indexOf(item);
    const neighbors = [...items.slice(index + 1), ...items.slice(0, index).reverse()];
    let consumed = false;
    return () => {
      if (consumed) return;
      consumed = true;
      try {
        if (available(control) && container.contains(control)) return;
        const active = doc.activeElement;
        if (active && active !== doc.body && active !== doc.documentElement && !item.contains(active)) return;
        for (const neighbor of neighbors) {
          if (!container.contains(neighbor)) continue;
          const next = neighbor.querySelector<HTMLElement>(options.control);
          if (!available(next)) continue;
          next.focus({ preventScroll: true });
          if (doc.activeElement === next) return;
        }
        if (options.fallback?.isConnected) options.fallback.focus({ preventScroll: true });
      } catch { /* Focus recovery never breaks the removal itself. */ }
    };
  } catch { return idle; }
}
