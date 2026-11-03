import {expect,it} from 'vitest';
import {getPaginationItems,normalizePaginationPage,normalizePaginationTotal} from '../packages/core/src/pagination';
it('shows the source edge/middle windows while avoiding empty and single-page ellipses',()=>{
 expect(getPaginationItems(1,10)).toEqual([1,2,3,4,5,{start:6,end:9},10]);
 expect(getPaginationItems(10,20)).toEqual([1,{start:2,end:8},9,10,11,{start:12,end:19},20]);
 expect(getPaginationItems(20,20)).toEqual([1,{start:2,end:15},16,17,18,19,20]);
 expect(getPaginationItems(1,6)).toEqual([1,2,3,4,5,6]);
 expect(getPaginationItems(1,1)).toEqual([1]);
});
it('covers every destination exactly once for bounded combinations of current/total/radius',()=>{
 for(let total=1;total<=40;total++)for(let page=1;page<=total;page++)for(const radius of [0,1,2,5]){
  const items=getPaginationItems(page,total,radius);
  expect(items).toContain(page);
  const expanded=items.flatMap(item=>typeof item==='number'?[item]:Array.from({length:item.end-item.start+1},(_,i)=>item.start+i));
  expect(expanded).toEqual(Array.from({length:total},(_,i)=>i+1));
 }
});
it('normalizes invalid values and keeps huge result sets bounded without materializing gaps',()=>{
 for(const invalid of [NaN,Infinity,-Infinity]){
  expect(normalizePaginationTotal(invalid)).toBe(1);expect(normalizePaginationPage(invalid,10)).toBe(1);
  expect(getPaginationItems(1,10,invalid)).toEqual(getPaginationItems(1,10));
 }
 expect(normalizePaginationTotal(10.5)).toBe(10);expect(normalizePaginationPage(4.9,10)).toBe(4);
 expect(normalizePaginationPage(99,10)).toBe(10);expect(normalizePaginationPage(-1,10)).toBe(1);
 expect(normalizePaginationTotal(1e30)).toBe(Number.MAX_SAFE_INTEGER);
 expect(getPaginationItems(5e8,1e9)).toHaveLength(7);
 expect(getPaginationItems(1,Number.MAX_SAFE_INTEGER,1e6).length).toBeLessThanOrEqual(15);
});
