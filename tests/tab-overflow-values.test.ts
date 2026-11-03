import { expect, it, vi } from 'vitest';
import { getTabOverflowIndices, observeTabOverflow } from '../packages/core/src/tab-overflow';

it('preserves source thresholds and reserve without hiding tabs that already fit', () => {
  expect(getTabOverflowIndices([100,100,100], 306)).toEqual([]);
  expect(getTabOverflowIndices([100,100,100], 305)).toEqual([2]);
  expect(getTabOverflowIndices([100,500,100,100], 400)).toEqual([1]);
  expect(getTabOverflowIndices([1000,1000], 991)).toEqual([0,1]);
  expect(getTabOverflowIndices([1000,1000], 992)).toEqual([]);
  expect(getTabOverflowIndices([1000], 300)).toEqual([]);
  expect(getTabOverflowIndices([50,50], 0)).toEqual([]);
  expect(getTabOverflowIndices([50,50], NaN)).toEqual([]);
});

it('observes width and text changes, sends only changed results and cleans up', async () => {
  vi.useFakeTimers();
  const bar=document.createElement('div');bar.innerHTML='<div><button>One</button><button>Two</button><button>Three</button></div>';document.body.append(bar);
  let width=200;Object.defineProperty(bar,'clientWidth',{get:()=>width});
  const tabs=[...bar.querySelectorAll('button')];tabs.forEach(tab=>tab.getBoundingClientRect=()=>({width:100} as DOMRect));
  const changed=vi.fn(),original=bar.outerHTML;
  const observer=observeTabOverflow({container:bar,tabs:()=>tabs,enabled:()=>true,onChange:changed});
  await vi.advanceTimersByTimeAsync(20);expect(changed).toHaveBeenLastCalledWith([1,2]);
  expect(bar.outerHTML).toBe(original);
  observer.refresh();observer.refresh();await vi.advanceTimersByTimeAsync(20);expect(changed).toHaveBeenCalledTimes(1);
  width=500;window.dispatchEvent(new Event('resize'));await vi.advanceTimersByTimeAsync(20);expect(changed).toHaveBeenLastCalledWith([]);
  width=200;tabs[0]!.textContent='New label';await vi.advanceTimersByTimeAsync(20);expect(changed).toHaveBeenLastCalledWith([1,2]);
  observer.destroy();observer.destroy();changed.mockClear();width=500;observer.refresh();window.dispatchEvent(new Event('resize'));tabs[0]!.textContent='After cleanup';await vi.advanceTimersByTimeAsync(20);expect(changed).not.toHaveBeenCalled();
  bar.remove();vi.useRealTimers();
});
