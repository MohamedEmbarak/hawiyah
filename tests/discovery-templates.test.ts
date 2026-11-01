import { afterEach, expect, test } from 'vitest';
import { bindSearch, renderSearch, type DiscoveryItem } from '../apps/playground/src/discovery-templates';

let cleanup=()=>{};
afterEach(()=>{cleanup();document.body.replaceChildren();});
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('search reports loading, recovers from failure, and ignores a disposed request',async()=>{
  document.body.innerHTML=renderSearch('ar');
  let resolve!:(items:DiscoveryItem[])=>void;
  let calls=0;
  cleanup=bindSearch(document.body,'ar',()=>++calls===1?Promise.reject(new Error('offline')):new Promise(done=>{resolve=done;}));
  expect(document.querySelector('[data-search-results]')?.getAttribute('aria-busy')).toBe('true');
  await tick();
  expect(document.querySelector('[role=status]')?.textContent).toBe('تعذر تحميل النتائج.');
  (document.querySelector('[data-search-retry]') as HTMLButtonElement).click();
  expect(document.querySelector('[data-search-results]')?.getAttribute('aria-busy')).toBe('true');
  cleanup();resolve([]);await tick();
  expect(document.querySelector('[data-search-results]')?.textContent).toBe('');
});
