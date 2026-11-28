import {describe,it,expect} from 'vitest';
import {getCalendarMonth} from '../src/calendar';
import {UMALQURA_MIN_DATE,UMALQURA_MAX_DATE} from '../src/saudi-calendar';

describe('fixed calendar weeks are presentation-only',()=>{
  for(const calendar of ['gregory','islamic-umalqura'] as const)for(const month of ['2026-02-14','2026-08-15','2026-10-28',UMALQURA_MIN_DATE,UMALQURA_MAX_DATE]) {
    it(`${calendar} ${month} preserves existing dates and fills six weeks`,()=>{
      const options={month,value:month,calendar,locale:'en',min:UMALQURA_MIN_DATE,max:UMALQURA_MAX_DATE};
      const normal=getCalendarMonth(options),fixed=getCalendarMonth({...options,fixedWeeks:true});
      expect(fixed.days).toHaveLength(42);
      expect(new Set(fixed.days.map(day=>day.value)).size).toBe(42);
      expect(fixed.days.slice(0,normal.days.length)).toEqual(normal.days);
      expect(fixed.days.slice(normal.days.length).every(day=>day.outside)).toBe(true);
      expect([fixed.label,fixed.previous,fixed.next]).toEqual([normal.label,normal.previous,normal.next]);
      expect(fixed.days.filter(day=>day.selected).map(day=>day.value)).toEqual([month]);
      for(const day of fixed.days.filter(day=>day.value<UMALQURA_MIN_DATE||day.value>UMALQURA_MAX_DATE))expect(day.disabled).toBe(true);
    });
  }
});
