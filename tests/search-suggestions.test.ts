import {expect,it} from 'vitest';
import {getSearchSuggestions} from '../packages/core/src/search-suggestions';

it('matches case-insensitively, trims queries, and preserves original text around the first match',()=>{
 expect(getSearchSuggestions('  seaRCH ',['A Search service, search again','Other'])).toEqual([{value:'A Search service, search again',segments:[{text:'A ',match:false},{text:'Search',match:true},{text:' service, search again',match:false}]}]);
});
it('maps Arabic vowel stripping and alef variants to complete original letter ranges',()=>{
 const values=['قبل إِدَارَةُ البيانات','آفاق','ٱفاق'];
 expect(getSearchSuggestions('ادارة',values)).toEqual([{value:values[0],segments:[{text:'قبل ',match:false},{text:'إِدَارَةُ',match:true},{text:' البيانات',match:false}]}]);
 expect(getSearchSuggestions('أفاق',values).map(item=>item.value)).toEqual(values.slice(1));
 expect(getSearchSuggestions('ا', ['أُمّ'])[0]!.segments).toEqual([{text:'أُ',match:true},{text:'مّ',match:false}]);
});
it('preserves UTF-16 boundaries for emoji prefixes and lowercase expansions',()=>{
 expect(getSearchSuggestions('بحث',['😀 بَحث'])[0]!.segments).toEqual([{text:'😀 ',match:false},{text:'بَحث',match:true}]);
 expect(getSearchSuggestions('i',['İstanbul'])[0]!.segments).toEqual([{text:'İ',match:true},{text:'stanbul',match:false}]);
 expect(getSearchSuggestions('😀',['X😀Y'])[0]!.segments).toEqual([{text:'X',match:false},{text:'😀',match:true},{text:'Y',match:false}]);
});
it('deduplicates exact values without collapsing differently spelled display values and enforces bounded limits',()=>{
 expect(getSearchSuggestions('search',['Search','Search','search']).map(item=>item.value)).toEqual(['Search','search']);
 const values=Array.from({length:150},(_,index)=>`item ${index}`);
 expect(getSearchSuggestions('item',values)).toHaveLength(8);expect(getSearchSuggestions('item',values,Infinity)).toHaveLength(100);expect(getSearchSuggestions('item',values,3.9)).toHaveLength(3);expect(getSearchSuggestions('item',values,NaN)).toHaveLength(8);expect(getSearchSuggestions('item',values,-1)).toEqual([]);
});
it('returns literal segments for hostile-looking strings and no suggestions for empty or marks-only queries',()=>{
 const malicious='<img src=x onerror=alert(1)>';
 expect(getSearchSuggestions('img',[malicious])[0]!.segments.map(segment=>segment.text).join('')).toBe(malicious);
 for(const query of ['', '  ', 'َُِ'])expect(getSearchSuggestions(query,['anything'])).toEqual([]);
 for(const result of getSearchSuggestions('ا',['أَلف','إِدارة','آثار']))expect(result.segments.map(segment=>segment.text).join('')).toBe(result.value);
});
