import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { observeContentNavigation } from '../src/content-navigation.js';

// One activation, one change: while a scroll that navigate() started is in progress the
// target stays current, however many sections the scroll passes.
const cleanups: Array<() => void> = [];
let y = 0;
const number = (element: object, key: string, value: number | (() => number)) => Object.defineProperty(element, key, { configurable: true, get: typeof value === 'function' ? value : () => value });
const rect = (element: HTMLElement, top: () => number, height: number) => { element.getBoundingClientRect = () => ({ top: top(), bottom: top() + height, left: 0, right: 300, x: 0, y: top(), height, width: 300, toJSON() {} }); };
const ids = ['one', 'two', 'three', 'four', 'five'];
beforeEach(() => {
  vi.useFakeTimers(); y = 0;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  number(window, 'scrollY', () => y); number(window, 'innerHeight', 600); number(document.documentElement, 'scrollHeight', 3000); number(document.body, 'scrollHeight', 3000);
});
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); document.body.replaceChildren(); delete (window as { onscrollend?: unknown }).onscrollend; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
const frame = async (ms = 20) => { await vi.advanceTimersByTimeAsync(ms); };
const scrollTo = async (position: number) => { y = position; window.dispatchEvent(new Event('scroll')); await frame(); };
function setup({ scrollend = true, tops = [0, 500, 1000, 1500, 2400], heights = [500, 500, 500, 900, 600] } = {}) {
  if (scrollend) (window as { onscrollend?: unknown }).onscrollend = null;
  document.body.innerHTML = `<nav>${ids.map(id => `<a href="#${id}" data-hw-section="${id}">${id}</a>`).join('')}</nav>${ids.map(id => `<section id="${id}"></section>`).join('')}`;
  const navigation = document.querySelector('nav')!; rect(navigation, () => 0, 100);
  ids.forEach((id, index) => rect(document.getElementById(id)!, () => tops[index]! - y, heights[index]!));
  const onCurrentChange = vi.fn();
  const observer = observeContentNavigation({ navigation, getItems: () => ids.map(id => ({ id, label: id })), getScrollRoot: () => null, offset: () => 80, onCurrentChange });
  cleanups.push(() => observer.destroy());
  return { observer, onCurrentChange, changes: () => onCurrentChange.mock.calls.map(call => call[0] as string) };
}

it('reports one change for one activation while a smooth scroll passes every section in between', async () => {
  const { observer, changes } = setup(); await frame(); expect(changes()).toEqual(['one']);
  expect(observer.navigate('five')).toBe(true); expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 2320, behavior: 'smooth' });
  for (const position of [120, 480, 900, 1300, 1800, 2200, 2320]) await scrollTo(position);
  window.dispatchEvent(new Event('scrollend')); await frame();
  expect(changes()).toEqual(['one', 'five']);
  // Measurement resumes with the reader's next scroll.
  await scrollTo(1000); expect(changes()).toEqual(['one', 'five', 'three']);
});
it('holds a backward scroll as well, so the marker does not step through earlier sections', async () => {
  const { observer, changes } = setup(); await scrollTo(2320); expect(changes()).toEqual(['five']);
  observer.navigate('one'); for (const position of [2000, 1400, 800, 300, 40, 0]) await scrollTo(position);
  expect(changes()).toEqual(['five', 'one']);
});
it('ends the hold when the target position is reached, without waiting for scrollend', async () => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('three'); await scrollTo(400); await scrollTo(920);
  expect(vi.getTimerCount()).toBe(0);
  await scrollTo(1500); expect(changes()).toEqual(['one', 'three', 'four']);
});
it('keeps the activated section current when the scroll range ends before it reaches the top', async () => {
  // "four" would sit at 1420, but the document ends at 2400; "five" is what a measurement reports there.
  const { observer, changes } = setup({ tops: [0, 500, 1000, 2900, 2950], heights: [500, 500, 1900, 50, 50] }); await frame();
  observer.navigate('four'); expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 2820, behavior: 'smooth' });
  await scrollTo(1200); await scrollTo(2400); window.dispatchEvent(new Event('scrollend')); await frame(); await frame(2000);
  expect(changes()).toEqual(['one', 'four']);
  await scrollTo(2399.5); expect(changes()).toEqual(['one', 'four']);
  await scrollTo(1100); expect(changes()).toEqual(['one', 'four', 'three']);
});
it.each([
  ['a wheel', () => window.dispatchEvent(new Event('wheel'))],
  ['a touch move', () => document.body.dispatchEvent(new Event('touchmove', { bubbles: true }))],
  ['a scrolling key', () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }))],
])('hands control back at once when the reader interrupts with %s', async (_name, interrupt) => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('five'); await scrollTo(600); expect(changes()).toEqual(['one', 'five']);
  interrupt(); await frame(); expect(changes()).toEqual(['one', 'five', 'two']);
  await scrollTo(1100); expect(changes()).toEqual(['one', 'five', 'two', 'three']);
});
it('does not treat other keys as an interruption', async () => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('five'); await scrollTo(600);
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  await scrollTo(1100); expect(changes()).toEqual(['one', 'five']);
});
it('hands control back when the position moves away from the target (a dragged scrollbar)', async () => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('five'); await scrollTo(900); await scrollTo(899); expect(changes()).toEqual(['one', 'five']);
  await scrollTo(520); expect(changes()).toEqual(['one', 'five', 'two']);
});
it('lets a second activation during the scroll replace the first, still one change each', async () => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('five'); await scrollTo(700); await scrollTo(1300);
  observer.navigate('two'); expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 420, behavior: 'smooth' });
  // A scrollend that belongs to the replaced scroll arrives short of the new target and is not the end.
  window.dispatchEvent(new Event('scrollend')); await frame(100);
  for (const position of [1000, 700, 420]) await scrollTo(position);
  expect(changes()).toEqual(['one', 'five', 'two']);
});
it('measures again after a scrollend short of the target when nothing moves any more (an interrupted scroll)', async () => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('five'); await scrollTo(700); window.dispatchEvent(new Event('scrollend'));
  await frame(149); expect(vi.getTimerCount()).toBe(1); expect(changes()).toEqual(['one', 'five']);
  await frame(1); await frame(); expect(vi.getTimerCount()).toBe(0);
  expect(changes()).toEqual(['one', 'five', 'two']);
  await scrollTo(1100); expect(changes()).toEqual(['one', 'five', 'two', 'three']);
});
it('falls back to a pause in scroll events where scrollend is missing', async () => {
  const { observer, changes } = setup({ scrollend: false }); await frame();
  observer.navigate('five');
  for (const position of [300, 900, 1500, 2100]) { await scrollTo(position); await frame(100); }
  expect(changes()).toEqual(['one', 'five']); expect(vi.getTimerCount()).toBe(1);
  // The scroll stopped short of the target: after the pause the position is measured.
  await frame(150); await frame(); expect(vi.getTimerCount()).toBe(0); expect(changes()).toEqual(['one', 'five', 'four']);
  await scrollTo(1000); expect(changes()).toEqual(['one', 'five', 'four', 'three']);
});
it('keeps a long pause only as a safety net where scrollend exists', async () => {
  const { observer, changes } = setup(); await frame();
  observer.navigate('five'); await scrollTo(600); await frame(900); expect(vi.getTimerCount()).toBe(1);
  await scrollTo(1100); expect(changes()).toEqual(['one', 'five']);
  await frame(1000); await frame(); expect(vi.getTimerCount()).toBe(0); expect(changes()).toEqual(['one', 'five', 'three']);
});
it('does not hold when the scroll is instant (reduced motion) or the page is already there', async () => {
  const { observer, changes } = setup(); await frame();
  vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
  vi.mocked(window.scrollTo).mockImplementation(((options: ScrollToOptions) => { y = options.top ?? 0; }) as typeof window.scrollTo);
  observer.navigate('three'); expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 920, behavior: 'instant' }); expect(vi.getTimerCount()).toBe(0);
  window.dispatchEvent(new Event('scroll')); await frame(); expect(changes()).toEqual(['one', 'three']);
  observer.navigate('three'); expect(vi.getTimerCount()).toBe(0); await scrollTo(1500); expect(changes()).toEqual(['one', 'three', 'four']);
});
it('releases the hold when the target disappears or the observer is destroyed', async () => {
  const first = setup(); await frame();
  first.observer.navigate('five'); await scrollTo(600); document.getElementById('five')!.remove(); await frame();
  expect(first.changes()).toEqual(['one', 'five', 'two']); expect(vi.getTimerCount()).toBe(0);
  first.observer.navigate('four'); expect(vi.getTimerCount()).toBe(1);
  const remove = vi.spyOn(window, 'removeEventListener'); first.observer.destroy();
  expect(vi.getTimerCount()).toBe(0); expect(remove.mock.calls.map(call => call[0])).toEqual(expect.arrayContaining(['wheel', 'touchmove', 'keydown', 'scroll', 'scrollend', 'resize']));
});
it('listens for the reader only while a hold is active', async () => {
  const add = vi.spyOn(window, 'addEventListener'); const { observer } = setup(); await frame();
  const taken = () => add.mock.calls.filter(call => ['wheel', 'touchmove', 'keydown'].includes(call[0] as string)).length;
  expect(taken()).toBe(0); observer.navigate('five'); expect(taken()).toBe(3);
  const remove = vi.spyOn(window, 'removeEventListener'); await scrollTo(2320);
  expect(remove.mock.calls.filter(call => ['wheel', 'touchmove', 'keydown'].includes(call[0] as string))).toHaveLength(3);
});
