import { requireText } from '@hawiyah/core';
import { nameRoot, text } from './dom.js';

export interface StepperOptions {
  /** Zero-based active step. -1 = not started; step count = complete. */
  activeIndex?: number;
  /** Accessible name of the list (data-hw-label), used only when the list has no aria-label or aria-labelledby. Required. */
  label?: string;
  /** Visually hidden state text of a complete step (data-hw-complete-label). Required. */
  completeLabel?: string;
  /** Visually hidden state text of an upcoming step (data-hw-upcoming-label). Required. */
  upcomingLabel?: string;
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
  // State text of complete and upcoming steps: authored [data-hw-step-status] children keep their original text for destroy(); created spans are removed.
  const authoredStatus = new Map<HTMLElement, string | null>(); const createdStatus = new Set<HTMLElement>();
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
      const name = state === 'complete' ? 'completeLabel' : state === 'upcoming' ? 'upcomingLabel' : undefined;
      const value = name && text(element, name, options[name]);
      const wanted = name && requireText('Stepper', name, value) ? value as string : undefined;
      let status = step.querySelector<HTMLElement>(':scope > [data-hw-step-status]');
      if (status && !createdStatus.has(status)) {
        if (!authoredStatus.has(status)) authoredStatus.set(status, status.textContent);
        status.textContent = wanted ?? '';
      } else if (wanted !== undefined) {
        if (!status) {
          status = step.ownerDocument.createElement('span'); status.className = 'hw-sr-only'; status.dataset.hwStepStatus = ''; createdStatus.add(status);
          if (step.firstElementChild) step.firstElementChild.after(status); else step.prepend(status);
        }
        if (status.textContent !== wanted) status.textContent = wanted;
      } else if (status) { status.remove(); createdStatus.delete(status); }
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
      createdStatus.forEach(status => status.remove()); createdStatus.clear();
      authoredStatus.forEach((value, status) => { status.textContent = value; }); authoredStatus.clear();
    },
  };
}
