import { nameRoot, text } from './dom.js';

export interface StepperOptions {
  /** Zero-based active step. -1 = not started; step count = complete. */
  activeIndex?: number;
  /** Accessible name of the list (data-hw-label), used only when the list has no aria-label or aria-labelledby. Required. */
  label?: string;
}
export interface StepperController {
  readonly activeIndex: number;
  setActiveIndex(index: number): void;
  /** Re-read direct children and explicit data-status overrides after markup changes. */
  refresh(): void;
  destroy(): void;
}

/** Updates existing semantic list items; does not add navigation or replace content. */
export function createStepper(element: HTMLOListElement, options: StepperOptions = {}): StepperController {
  const saved = new Map<HTMLElement, Map<string, string | null>>();
  let destroyed = false;
  const steps = () => Array.from(element.children).filter((child): child is HTMLLIElement => child.tagName === 'LI' && child.classList.contains('hw-step'));
  const remember = (node: HTMLElement, names: readonly string[]) => {
    if (!saved.has(node)) saved.set(node, new Map(names.map(name => [name, node.getAttribute(name)])));
  };
  remember(element, ['aria-label', 'data-active-index']);
  const declared = element.getAttribute('data-active-index');
  let activeIndex = options.activeIndex ?? (declared !== null && declared.trim() !== '' ? Number(declared) : steps().findIndex(step => step.getAttribute('aria-current') === 'step' || ['current', 'active'].includes(step.dataset.state ?? '')));
  const refresh = () => {
    if (destroyed) return;
    const items = steps();
    activeIndex = Number.isInteger(activeIndex) && activeIndex >= -1 && activeIndex <= items.length ? activeIndex : -1;
    element.dataset.activeIndex = String(activeIndex);
    nameRoot(element, 'Stepper', text(element, 'label', options.label));
    items.forEach((step, index) => {
      remember(step, ['data-state', 'aria-current']);
      const explicit = step.dataset.status;
      const state = explicit === 'complete' || explicit === 'current' || explicit === 'upcoming' ? explicit : index === activeIndex ? 'current' : index < activeIndex ? 'complete' : 'upcoming';
      step.dataset.state = state;
      if (state === 'current') step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  };
  refresh();
  return {
    get activeIndex() { return activeIndex; },
    setActiveIndex(index) { if (!destroyed) { activeIndex = index; refresh(); } },
    refresh,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      saved.forEach((attributes, node) => attributes.forEach((value, name) => value === null ? node.removeAttribute(name) : node.setAttribute(name, value)));
      saved.clear();
    },
  };
}
