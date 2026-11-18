import { ViewportScroller } from '@angular/common';
import { DOCUMENT, Injectable, afterNextRender, inject } from '@angular/core';

/** The element a fragment names: the element with that id, else the first with that name. */
export function fragmentTarget(document: Document, fragment: string | null | undefined): HTMLElement | null {
  if (!fragment) return null;
  const byId = document.getElementById(fragment);
  if (byId) return byId;
  const byName = document.getElementsByName(fragment)[0];
  return byName instanceof HTMLElement ? byName : null;
}

/**
 * The element that takes focus for a fragment target: the target when it can take
 * focus; else the heading inside it that labels it (aria-labelledby) when that heading
 * has a tabindex; else the target, given tabindex -1.
 */
export function focusTargetOf(target: HTMLElement): HTMLElement {
  if (target.hasAttribute('tabindex') || target.tabIndex >= 0) return target;
  const label = target.getAttribute('aria-labelledby')?.trim().split(/\s+/)[0];
  const heading = label ? target.ownerDocument.getElementById(label) : null;
  if (heading && target.contains(heading) && heading.hasAttribute('tabindex')) return heading;
  target.setAttribute('tabindex', '-1');
  return target;
}

/** Smooth scrolling only when the reader has not asked for reduced motion. */
export function scrollBehaviorOf(view: Pick<Window, 'matchMedia'> | null): ScrollBehavior {
  return view?.matchMedia?.('(prefers-reduced-motion: no-preference)').matches ? 'smooth' : 'instant';
}

/**
 * The router's viewport scroller (app.config.ts, anchorScrolling 'enabled'). After a
 * navigation whose URL has a fragment, including an in-page link of the current page,
 * it scrolls the target into view with scrollIntoView, so scroll-margin applies, and
 * moves focus to it or to the heading that labels it (focusTargetOf).
 * Scrolling is smooth only without a reduced-motion preference. Until the first render
 * in the browser (and on the server, where that never happens) every method does
 * nothing.
 */
@Injectable()
export class GuideViewportScroller extends ViewportScroller {
  private readonly document = inject(DOCUMENT);
  private browser = false;

  constructor() {
    super();
    afterNextRender(() => {
      this.browser = true;
    });
  }

  private get view(): Window | null {
    return this.browser ? this.document.defaultView : null;
  }

  /** Not used: the guide positions fragment targets with scroll-margin in CSS. */
  setOffset(_offset: [number, number] | (() => [number, number])): void {
    return;
  }

  getScrollPosition(): [number, number] {
    const view = this.view;
    return view ? [view.scrollX, view.scrollY] : [0, 0];
  }

  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    this.view?.scrollTo({ ...options, left: position[0], top: position[1] });
  }

  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    const view = this.view;
    const target = view ? fragmentTarget(this.document, anchor) : null;
    if (!view || !target) return;
    target.scrollIntoView({ block: 'start', behavior: options?.behavior ?? scrollBehaviorOf(view) });
    focusTargetOf(target).focus({ preventScroll: true });
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    try {
      if (this.view) this.view.history.scrollRestoration = scrollRestoration;
    } catch {
      // A sandboxed or inactive window refuses the setting; the default restoration stays.
    }
  }
}
