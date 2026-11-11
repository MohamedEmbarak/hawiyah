import './fixtures/texts';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from './fixtures/page';

// The layout is mocked as in the core tests of the observer: five sections in a 3000px document, a 600px viewport.
const ids = ['one', 'two', 'three', 'four', 'five'];
const tops = [0, 500, 1000, 1500, 2400], heights = [500, 500, 500, 900, 600];
let y = 0;
const number = (element: object, key: string, value: number | (() => number)) => Object.defineProperty(element, key, { configurable: true, get: typeof value === 'function' ? value : () => value });
const box = (top: number, height: number) => ({ top, bottom: top + height, left: 0, right: 300, x: 0, y: top, height, width: 300, toJSON() {} });

beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
beforeEach(() => {
  vi.useFakeTimers(); y = 0;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) { const index = ids.indexOf(this.id); return index < 0 ? box(0, 100) : box(tops[index]! - y, heights[index]!); });
  number(window, 'scrollY', () => y); number(window, 'innerHeight', 600); number(document.documentElement, 'scrollHeight', 3000); number(document.body, 'scrollHeight', 3000);
  (window as { onscrollend?: unknown }).onscrollend = null;
});
afterEach(() => { TestBed.resetTestingModule(); document.body.replaceChildren(); delete (window as { onscrollend?: unknown }).onscrollend; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

async function setup() {
  const view = page(`<hw-content-navigation label="On this page" [items]="items" (currentChange)="changes.push($event)" />${ids.map(id => `<section id="${id}" tabindex="-1">${id}</section>`).join('')}`, { items: ids.map(id => ({ id, label: id })), changes: [] as string[] });
  TestBed.tick();
  const links = [...view.root.querySelectorAll<HTMLAnchorElement>('a.hw-content-nav-link')];
  const frame = async (ms = 20) => { await vi.advanceTimersByTimeAsync(ms); view.fixture.detectChanges(); };
  const marked = () => links.filter(link => link.getAttribute('aria-current') === 'location').map(link => link.getAttribute('data-hw-section'));
  const scrollTo = async (position: number) => { y = position; window.dispatchEvent(new Event('scroll')); await frame(); };
  await frame();
  return { ...view, links, frame, marked, scrollTo };
}

describe('hw-content-navigation during a scroll it started', () => {
  it('[cn-one-change] reports one change for one activation and never marks a section the scroll passes', async () => {
    const { state, links, frame, marked, scrollTo } = await setup();
    expect(state.changes).toEqual(['one']); expect(marked()).toEqual(['one']);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }); links[4]!.dispatchEvent(click); await frame();
    expect(click.defaultPrevented).toBe(true); expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 2320, behavior: 'smooth' });
    expect(state.changes).toEqual(['one', 'five']); expect(marked()).toEqual(['five']);
    for (const position of [120, 480, 900, 1300, 1800, 2200, 2320]) { await scrollTo(position); expect(marked(), `at ${position}`).toEqual(['five']); }
    window.dispatchEvent(new Event('scrollend')); await frame();
    expect(state.changes).toEqual(['one', 'five']); expect(marked()).toEqual(['five']);
  });

  it('[cn-reader-takes-over] follows the reader again as soon as a wheel interrupts the scroll', async () => {
    const { state, links, frame, marked, scrollTo } = await setup();
    links[4]!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 })); await frame();
    await scrollTo(600); expect(state.changes).toEqual(['one', 'five']); expect(marked()).toEqual(['five']);
    window.dispatchEvent(new Event('wheel')); await scrollTo(1100);
    expect(state.changes.at(-1)).toBe('three'); expect(marked()).toEqual(['three']); expect(state.changes.slice(0, 2)).toEqual(['one', 'five']);
  });
});
