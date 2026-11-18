import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GuideViewportScroller, focusTargetOf, fragmentTarget, scrollBehaviorOf } from './viewport-scroller';

/** Builds the body from [tag, attributes, text] entries; a nested list is the children. */
type Markup = readonly [string, Readonly<Record<string, string>>, string | readonly Markup[]];
function build(parent: HTMLElement, nodes: readonly Markup[]): void {
  for (const [tag, attributes, content] of nodes) {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    if (typeof content === 'string') element.textContent = content;
    else build(element, content);
    parent.append(element);
  }
}
function setBody(nodes: readonly Markup[]): void {
  document.body.replaceChildren();
  build(document.body, nodes);
}

const INSTALL: Markup = ['section', { id: 'install', 'aria-labelledby': 'install-title' }, [['h2', { id: 'install-title', tabindex: '-1' }, 'Install']]];

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('fragment targets', () => {
  it('finds the element by id, then by name, and nothing for an empty fragment', () => {
    setBody([['h2', { id: 'api', tabindex: '-1' }, 'API'], ['a', { name: 'old' }, 'Old']]);
    expect(fragmentTarget(document, 'api')?.id).toBe('api');
    expect(fragmentTarget(document, 'old')?.getAttribute('name')).toBe('old');
    expect(fragmentTarget(document, 'missing')).toBeNull();
    expect(fragmentTarget(document, null)).toBeNull();
    expect(fragmentTarget(document, '')).toBeNull();
  });

  it('focuses a focusable target, else the heading that labels it, else the target with tabindex -1', () => {
    setBody([['h2', { id: 'api', tabindex: '-1' }, 'API'], INSTALL, ['div', { id: 'plain' }, 'Plain']]);
    expect(focusTargetOf(document.getElementById('api') as HTMLElement).id).toBe('api');
    expect(focusTargetOf(document.getElementById('install') as HTMLElement).id).toBe('install-title');
    expect(document.getElementById('install')?.hasAttribute('tabindex')).toBe(false);
    const plain = focusTargetOf(document.getElementById('plain') as HTMLElement);
    expect(plain.id).toBe('plain');
    expect(plain.getAttribute('tabindex')).toBe('-1');
  });

  it('scrolls smoothly only without a reduced-motion preference', () => {
    const view = (matches: boolean) => ({ matchMedia: () => ({ matches }) as unknown as MediaQueryList });
    expect(scrollBehaviorOf(view(true))).toBe('smooth');
    expect(scrollBehaviorOf(view(false))).toBe('instant');
    expect(scrollBehaviorOf(null)).toBe('instant');
  });
});

describe('GuideViewportScroller', () => {
  it('scrolls the target into view and moves focus to it after the first render', () => {
    TestBed.configureTestingModule({ providers: [GuideViewportScroller] });
    const scroller = TestBed.inject(GuideViewportScroller);
    TestBed.tick();
    setBody([INSTALL]);
    const section = document.getElementById('install') as HTMLElement;
    const scroll = vi.fn();
    section.scrollIntoView = scroll;
    scroller.scrollToAnchor('install', { behavior: 'instant' });
    expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
    expect(document.activeElement?.id).toBe('install-title');
    scroller.scrollToAnchor('missing');
    expect(document.activeElement?.id).toBe('install-title');
  });

  it('does nothing before the first render (and so on the server)', () => {
    TestBed.configureTestingModule({ providers: [GuideViewportScroller] });
    const scroller = TestBed.inject(GuideViewportScroller);
    setBody([['h2', { id: 'api', tabindex: '-1' }, 'API']]);
    const heading = document.getElementById('api') as HTMLElement;
    heading.scrollIntoView = vi.fn();
    scroller.scrollToAnchor('api');
    expect(heading.scrollIntoView).not.toHaveBeenCalled();
    expect(scroller.getScrollPosition()).toEqual([0, 0]);
  });
});
