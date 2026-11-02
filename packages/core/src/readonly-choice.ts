/** Protect native choices without replacing their DOM or keyboard semantics.
 * HTML readonly does not itself prevent checkbox/radio activation. */
export function observeReadonlyChoice(input: HTMLInputElement): { refresh(): void; destroy(): void } {
  const root = input.getRootNode() as Document | ShadowRoot;
  let saved = new Map<HTMLInputElement, boolean>();
  let destroyed = false;
  const refresh = () => {
    if (destroyed) return;
    const group = input.type === 'radio' && input.name
      ? Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(peer => peer.name === input.name && peer.form === input.form)
      : [input];
    saved = new Map(group.map(peer => [peer, peer.checked]));
  };
  const blocked = () => input.readOnly || input.getAttribute('aria-disabled') === 'true';
  const click = (event: Event) => {
    if (!blocked()) return;
    event.preventDefault();
    // Radio pre-activation may already have unchecked a different group member.
    const previous = new Map(saved);
    queueMicrotask(() => { if (!destroyed) for (const [peer, checked] of previous) if (peer.isConnected) peer.checked = checked; });
  };
  const keydown = (event: KeyboardEvent) => {
    refresh();
    if (blocked() && (event.key === ' ' || input.type === 'radio' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))) event.preventDefault();
  };
  const reset = (event: Event) => { if (event.target === input.form) queueMicrotask(() => { if (!event.defaultPrevented) refresh(); }); };
  refresh();
  input.addEventListener('click', click, true);
  input.addEventListener('keydown', keydown);
  root.addEventListener('pointerdown', refresh, true);
  root.addEventListener('change', refresh);
  root.addEventListener('reset', reset);
  return { refresh, destroy() {
    destroyed = true; saved.clear();
    input.removeEventListener('click', click, true);
    input.removeEventListener('keydown', keydown);
    root.removeEventListener('pointerdown', refresh, true);
    root.removeEventListener('change', refresh);
    root.removeEventListener('reset', reset);
  } };
}
