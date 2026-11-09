import { createAccordionMotion, createCleanup } from '@hawiyah/core';
import type { AccordionMotion } from '@hawiyah/core';
import { emit } from './dom.js';

export interface AccordionOptions {
  onOpenChange?: (value: string, open: boolean) => void;
}
export interface AccordionController {
  setOpen(value: string, open: boolean): void;
  destroy(): void;
}

/** Enhance existing details; the first content wrapper is animated without moving DOM. */
export function createAccordion(root: HTMLElement, options: AccordionOptions = {}): AccordionController {
  const scope = createCleanup();
  const items = [...root.querySelectorAll<HTMLDetailsElement>(':scope > .hw-accordion-item')];
  const controllers = new Map<string, AccordionMotion>();
  try {
    items.forEach((details, index) => {
      const summary = details.querySelector<HTMLElement>(':scope > summary');
      const contents = details.querySelectorAll<HTMLElement>(':scope > :not(summary)');
      const content = contents[0];
      if (!summary || !content || contents.length !== 1) throw new Error('Hawiyah: accordion items require a summary and exactly one content wrapper.');
      const value = details.dataset.hwValue ?? String(index);
      if (controllers.has(value)) throw new Error('Hawiyah: accordion values must be unique.');
      const motion = createAccordionMotion(details, content, open => {
        motion.setOpen(open); emit(root, { value, open }); options.onOpenChange?.(value, open);
      });
      controllers.set(value, motion);
      scope.add(() => motion.destroy());
      scope.listen(summary, 'click', event => {
        if ((event.target as Element).closest('a,button,input,select,textarea')) return;
        event.preventDefault(); motion.request(!motion.open);
      });
      scope.listen(details, 'toggle', () => motion.nativeToggle());
    });
  } catch (error) { scope.destroy(); throw error; }
  return { setOpen(value, open) { controllers.get(value)?.request(open); }, destroy() { scope.destroy(); } };
}
