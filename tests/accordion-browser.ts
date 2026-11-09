import type {Locator, Page} from '@playwright/test';

/** Pause actual browser animations for deterministic intermediate-frame checks. */
export async function pauseAccordionAnimations(page: Page) {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args: Parameters<Element['animate']>) {
      const animation = animate.apply(this, args);
      if (this.matches('.hw-accordion-item')) animation.pause();
      return animation;
    };
  });
}
export async function motionFrame(item: Locator, time: number) {
  return item.evaluate(async (node, time) => {
    // Let ResizeObserver settle before selecting the current animation.
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    const animation = node.getAnimations().find(a => (a.effect as KeyframeEffect)?.getKeyframes().some(frame => frame.height));
    if (!animation) throw new Error('Expected an actual accordion height animation');
    animation.currentTime = time;
    const effect=animation.effect as KeyframeEffect;
    const frames=effect.getKeyframes();
    return {height:node.getBoundingClientRect().height,from:parseFloat(String(frames[0]!.height)),to:parseFloat(String(frames.at(-1)!.height)),duration:effect.getTiming().duration};
  },time);
}
export async function finishMotion(item: Locator) {
  await item.evaluate(node=>node.getAnimations().forEach(animation=>animation.finish()));
}
